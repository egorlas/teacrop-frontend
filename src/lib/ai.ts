/**
 * AI Helper - OpenAI client configuration
 * Handles environment variables and creates OpenAI client instance
 */

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY is not set. Please create a .env.local file with your OpenAI API key.",
  );
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "You are a helpful AI Agent. Answer concisely and step-by-step when needed. Do not fabricate information. When using tools, execute them and provide natural responses based on the results.";

/**
 * Validate message content before sending to API
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  const MAX_LENGTH = 4000;

  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${MAX_LENGTH} characters`,
    };
  }

  // Basic prompt injection detection (log warnings for suspicious patterns)
  const suspiciousPatterns = [
    /ignore (previous|all) (instructions?|prompts?)/i,
    /reveal|show|display.*api.*key/i,
    /execute.*network|http|fetch/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      console.warn("[Security] Suspicious pattern detected in user message:", message.substring(0, 100));
      // Still allow, but log for monitoring
    }
  }

  // Strip control characters except newlines and tabs (for future use)
  // const cleaned = message.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  return { valid: true };
}

/**
 * Create OpenAI API URL for chat completions with streaming
 */
export function getOpenAIStreamURL(): string {
  return "https://api.openai.com/v1/chat/completions";
}
