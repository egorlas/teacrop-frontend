import { NextRequest, NextResponse } from "next/server";

// Server-side only: Strapi base URL
const STRAPI_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.31.187:1337";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { ok: false, error: { message: "Authorization header is required" } },
        { status: 401 }
      );
    }

    // Validate request body
    if (!body.content) {
      return NextResponse.json(
        { ok: false, error: { message: "Content is required" } },
        { status: 400 }
      );
    }
    console.log(authHeader)
    // Forward request to backend API
    const response = await fetch(`${STRAPI_URL}/api/blog/rewrite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        type: body.type || undefined,
        topic: body.topic || undefined,
        accent: body.accent || undefined,
        content: body.content,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      },
      { status: 500 }
    );
  }
}

