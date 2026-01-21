import { NextRequest, NextResponse } from "next/server";

// Server-side only: Use API_URL (runtime) or fallback to NEXT_PUBLIC_API_URL (build-time) or default
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://192.168.31.187:1337";

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

    // Transform items to match backend format
    const products = items.map((item) => ({
      id: item.id,
      name: item.title,
      title: item.title,
      price: item.price,
      quantity: item.qty,
      variant: item.variant || null,
    }));

    // Get auth header if user is logged in
    const authHeader = req.headers.get("authorization");

    // Create order in backend with status = "pending" (customer order)
    // If user is authenticated, backend will automatically link order to customer
    const orderResponse = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        data: {
          customerName: name.trim(),
          customerPhone: normalizedPhone,
          contactAddress: address.trim(),
          products: products,
          subtotal: total,
          shippingFee: 0,
          discount: 0,
          totalAmount: total,
          paymentMethod: "cash",
          status: "pending", // Customer order starts with pending
          notes: null,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      const errorMessage = errorData.error?.message || errorData.message || "Không thể tạo đơn hàng";
      console.error("Backend order creation error:", errorData);
      return NextResponse.json(
        { error: errorMessage, details: errorData.error?.details || errorData.details },
        { status: orderResponse.status }
      );
    }

    const orderData = await orderResponse.json();
    const order = orderData.data;

    return NextResponse.json({
      success: true,
      order_id: order.id,
      orderNumber: order.orderNumber,
      id: order.orderNumber, // For compatibility with existing code
      transaction_id: order.orderNumber, // For compatibility with existing code
      items,
      total,
      customer_info: {
        name: name.trim(),
        address: address.trim(),
        phone: normalizedPhone,
      },
      payment_method: "cash",
      status: order.status,
      created_at: order.createdAt || new Date().toISOString(),
      message: "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.",
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

