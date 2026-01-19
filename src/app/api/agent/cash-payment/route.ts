import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      items, 
      total, 
      customerInfo 
    } = body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" }, 
        { status: 400 }
      );
    }

    // Validate total
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { error: "Valid total is required" }, 
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customerInfo || typeof customerInfo !== "object") {
      return NextResponse.json(
        { error: "Customer information is required" }, 
        { status: 400 }
      );
    }

    const { name, address, phone } = customerInfo;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Customer name is required" }, 
        { status: 400 }
      );
    }

    if (!address || typeof address !== "string" || address.trim().length === 0) {
      return NextResponse.json(
        { error: "Customer address is required" }, 
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json(
        { error: "Customer phone is required" }, 
        { status: 400 }
      );
    }

    // Validate phone format (Vietnamese phone numbers: 10-11 digits)
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    const normalizedPhone = phone.replace(/\s+/g, "");
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" }, 
        { status: 400 }
      );
    }

    // Generate transaction ID
    const transactionId = `cash-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // TODO: In production, save order to database here
    // await saveCashOrder({
    //   transactionId,
    //   items,
    //   total,
    //   customerInfo: {
    //     name: name.trim(),
    //     address: address.trim(),
    //     phone: normalizedPhone,
    //   },
    //   paymentMethod: "cash",
    //   status: "pending",
    //   createdAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      id: transactionId, // Alias for compatibility
      items,
      total,
      customer_info: {
        name: name.trim(),
        address: address.trim(),
        phone: normalizedPhone,
      },
      payment_method: "cash",
      status: "pending",
      created_at: new Date().toISOString(),
      message: "Cash payment order created successfully",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Cash payment error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}

