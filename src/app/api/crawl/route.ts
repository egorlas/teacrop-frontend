import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.31.187:1337";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Forward request to backend
    const response = await fetch(`${API_URL}/api/blog/crawl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Get response data
    const data = await response.json();

    // Return response with same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

