import { NextRequest, NextResponse } from "next/server";

// Server-side only: Use API_URL (runtime) or fallback to NEXT_PUBLIC_API_URL (build-time) or default
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://192.168.31.187:1337";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Use custom endpoint to get tokens
    const response = await fetch(`${API_URL}/api/users/me/tokens`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Fallback: try to get from /api/users/me with populate
      try {
        const fallbackResponse = await fetch(`${API_URL}/api/users/me?populate[sub]=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (fallbackResponse.ok) {
          const user = await fallbackResponse.json();
          let remainingTokens = 0;
          if (user.sub) {
            remainingTokens = typeof user.sub === 'object' ? (user.sub.token ?? 0) : 0;
          } else if (user.sub?.data) {
            remainingTokens = user.sub.data?.token ?? 0;
          }
          return NextResponse.json({
            ok: true,
            data: {
              tokens: remainingTokens,
            },
          });
        }
      } catch (fallbackError) {
        // Ignore fallback error
      }

      return NextResponse.json(
        { ok: false, error: "Failed to fetch tokens" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
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

