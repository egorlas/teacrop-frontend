import { NextRequest } from "next/server";
import { validateMessage, OPENAI_API_KEY, OPENAI_MODEL, AI_SYSTEM_PROMPT } from "@/lib/ai";

// Rate limiting in memory (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // Max requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Tool implementations
const tools = {
  get_time: async () => {
    return {
      datetime: new Date().toISOString(),
      formatted: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timezone: "Asia/Ho_Chi_Minh",
    };
  },
  search_docs: async (query: string, limit = 3) => {
    // Mock search results
    const mockResults = [
      {
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs/app",
        snippet: "Learn about the App Router, routing, and data fetching in Next.js.",
        relevance: 0.95,
      },
      {
        title: "Next.js API Routes",
        url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
        snippet: "Create API endpoints with Route Handlers in the App Router.",
        relevance: 0.88,
      },
      {
        title: "Server Components vs Client Components",
        url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
        snippet: "Understand when to use Server and Client Components in Next.js.",
        relevance: 0.82,
      },
    ];

    return {
      query,
      results: mockResults.slice(0, limit),
      total: mockResults.length,
    };
  },
};

async function handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {
    case "get_time":
      return await tools.get_time();
    case "search_docs":
      const query = (args.query as string) || "";
      const limit = (args.limit as number) || 3;
      return await tools.search_docs(query, limit);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response("Rate limit exceeded. Please try again later.", {
        status: 429,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages array required", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Validate last message (user message)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return new Response("Invalid request: last message must be from user", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const validation = validateMessage(lastMessage.content);
    if (!validation.valid) {
      return new Response(validation.error || "Invalid message", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Prepare messages for OpenAI API
    const apiMessages = [
      { role: "system", content: AI_SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Create ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Call OpenAI API with streaming
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: OPENAI_MODEL,
              messages: apiMessages,
              stream: true,
              tools: [
                {
                  type: "function",
                  function: {
                    name: "get_time",
                    description: "Get the current date and time in ISO format and Vietnamese locale",
                    parameters: {
                      type: "object",
                      properties: {},
                      required: [],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "search_docs",
                    description: "Search documentation or resources. Returns a list of relevant documents.",
                    parameters: {
                      type: "object",
                      properties: {
                        query: {
                          type: "string",
                          description: "Search query",
                        },
                        limit: {
                          type: "number",
                          description: "Maximum number of results (default: 3)",
                        },
                      },
                      required: ["query"],
                    },
                  },
                },
              ],
              tool_choice: "auto",
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            controller.enqueue(encoder.encode(`ERROR: ${response.status} ${errorText}\n`));
            controller.close();
            return;
          }

          if (!response.body) {
            controller.enqueue(encoder.encode("ERROR: No response body\n"));
            controller.close();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          const toolCalls: Array<{
            id: string;
            name: string;
            arguments: string;
            index: number;
          }> = [];
          const toolCallsByIndex = new Map<number, {
            id: string;
            name: string;
            arguments: string;
          }>();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const data = line.slice(6);
              if (data === "[DONE]") {
                // Handle tool calls after stream ends
                if (toolCalls.length > 0) {
                  for (const toolCall of toolCalls) {
                    try {
                      const toolArgs = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
                      const toolResult = await handleToolCall(toolCall.name, toolArgs);

                      // Call API again with tool result to get final answer
                      const followUpResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${OPENAI_API_KEY}`,
                        },
                        body: JSON.stringify({
                          model: OPENAI_MODEL,
                          messages: [
                            ...apiMessages,
                            {
                              role: "assistant",
                              content: null,
                              tool_calls: [
                                {
                                  id: toolCall.id,
                                  type: "function",
                                  function: {
                                    name: toolCall.name,
                                    arguments: toolCall.arguments,
                                  },
                                },
                              ],
                            },
                            {
                              role: "tool",
                              tool_call_id: toolCall.id,
                              content: JSON.stringify(toolResult),
                            },
                          ],
                          stream: true,
                        }),
                      });

                      if (followUpResponse.ok && followUpResponse.body) {
                        const followUpReader = followUpResponse.body.getReader();
                        const followUpDecoder = new TextDecoder();
                        let followUpBuffer = "";

                        while (true) {
                          const { done: followUpDone, value: followUpValue } = await followUpReader.read();
                          if (followUpDone) break;

                          followUpBuffer += followUpDecoder.decode(followUpValue, { stream: true });
                          const followUpLines = followUpBuffer.split("\n");
                          followUpBuffer = followUpLines.pop() || "";

                          for (const followUpLine of followUpLines) {
                            if (followUpLine.trim() === "") continue;
                            if (!followUpLine.startsWith("data: ")) continue;

                            const followUpData = followUpLine.slice(6);
                            if (followUpData === "[DONE]") break;

                            try {
                              const followUpParsed = JSON.parse(followUpData);
                              const followUpChoices = followUpParsed.choices || [];
                              const followUpDelta = followUpChoices[0]?.delta || {};

                              if (followUpDelta.content) {
                                controller.enqueue(encoder.encode(followUpDelta.content));
                              }
                            } catch {
                              // Skip invalid JSON
                            }
                          }
                        }
                      }
                    } catch (error) {
                      const errorMsg = `\n[Tool Error: ${toolCall.name}] ${error}\n\n`;
                      controller.enqueue(encoder.encode(errorMsg));
                    }
                  }
                }

                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const choices = parsed.choices || [];
                const delta = choices[0]?.delta || {};
                const finishReason = choices[0]?.finish_reason;

                // Handle tool calls accumulation
                if (delta.tool_calls) {
                  for (const toolCall of delta.tool_calls) {
                    const index = toolCall.index ?? 0;
                    if (!toolCallsByIndex.has(index)) {
                      toolCallsByIndex.set(index, {
                        id: toolCall.id || "",
                        name: toolCall.function?.name || "",
                        arguments: toolCall.function?.arguments || "",
                      });
                    } else {
                      const existing = toolCallsByIndex.get(index)!;
                      if (toolCall.id) existing.id = toolCall.id;
                      if (toolCall.function?.name) existing.name = toolCall.function.name;
                      if (toolCall.function?.arguments) {
                        existing.arguments += toolCall.function.arguments;
                      }
                    }
                  }
                }

                // Handle text content (stream directly)
                if (delta.content) {
                  // Send content immediately
                  const contentChunk = delta.content;
                  controller.enqueue(encoder.encode(contentChunk));
                }

                // If finish_reason is tool_calls, collect all tool calls
                if (finishReason === "tool_calls") {
                  for (const [index, toolCall] of toolCallsByIndex.entries()) {
                    toolCalls.push({
                      ...toolCall,
                      index,
                    });
                  }
                }
              } catch (parseError) {
                // Skip invalid JSON
                console.error("Parse error:", parseError, data);
              }
            }
          }

          // Handle remaining tool calls if any (collected during stream but not at [DONE])
          if (toolCallsByIndex.size > 0 && toolCalls.length === 0) {
            // Collect tool calls that weren't finished with tool_calls reason
            for (const [index, toolCall] of toolCallsByIndex.entries()) {
              if (toolCall.id && toolCall.name) {
                toolCalls.push({
                  ...toolCall,
                  index,
                });
              }
            }
          }

          // Execute and stream final answer for tool calls
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              try {
                const toolArgs = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
                const toolResult = await handleToolCall(toolCall.name, toolArgs);

                // Call API again with tool result to get final natural language answer
                const followUpResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                  },
                  body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages: [
                      ...apiMessages,
                      {
                        role: "assistant",
                        content: null,
                        tool_calls: [
                          {
                            id: toolCall.id,
                            type: "function",
                            function: {
                              name: toolCall.name,
                              arguments: toolCall.arguments,
                            },
                          },
                        ],
                      },
                      {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult),
                      },
                    ],
                    stream: true,
                  }),
                });

                if (followUpResponse.ok && followUpResponse.body) {
                  const followUpReader = followUpResponse.body.getReader();
                  const followUpDecoder = new TextDecoder();
                  let followUpBuffer = "";

                  while (true) {
                    const { done: followUpDone, value: followUpValue } = await followUpReader.read();
                    if (followUpDone) break;

                    followUpBuffer += followUpDecoder.decode(followUpValue, { stream: true });
                    const followUpLines = followUpBuffer.split("\n");
                    followUpBuffer = followUpLines.pop() || "";

                    for (const followUpLine of followUpLines) {
                      if (followUpLine.trim() === "") continue;
                      if (!followUpLine.startsWith("data: ")) continue;

                      const followUpData = followUpLine.slice(6);
                      if (followUpData === "[DONE]") break;

                      try {
                        const followUpParsed = JSON.parse(followUpData);
                        const followUpChoices = followUpParsed.choices || [];
                        const followUpDelta = followUpChoices[0]?.delta || {};

                        if (followUpDelta.content) {
                          controller.enqueue(encoder.encode(followUpDelta.content));
                        }
                      } catch {
                        // Skip invalid JSON
                      }
                    }
                  }
                }
              } catch (error) {
                const errorMsg = `\n[Tool Error: ${toolCall.name}] ${error}\n\n`;
                controller.enqueue(encoder.encode(errorMsg));
              }
            }
          }

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`\nERROR: ${errorMessage}\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`ERROR: ${errorMessage}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

