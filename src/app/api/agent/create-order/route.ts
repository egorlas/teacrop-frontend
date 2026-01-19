import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, total } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "Valid total is required" }, { status: 400 });
    }

    // TODO: Integrate with actual payment gateway (e.g., VNPay, MoMo)
    // For now, return a mock response
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const paymentUrl = process.env.PAYMENT_GATEWAY_URL
      ? `${process.env.PAYMENT_GATEWAY_URL}?order_id=${orderId}&amount=${total}`
      : undefined;

    // In production, save order to database here
    // await saveOrder({ orderId, items, total, createdAt: new Date() });

    return NextResponse.json({
      order_id: orderId,
      id: orderId, // Alias for compatibility
      items,
      total,
      payment_url: paymentUrl,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

