import { NextRequest, NextResponse } from "next/server";

// Server-side only: Use API_URL (runtime) or fallback to NEXT_PUBLIC_API_URL (build-time) or default
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://192.168.31.187:1337";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: { message: "Authorization header is required" } },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      },
      { status: 500 }
    );
  }
}
