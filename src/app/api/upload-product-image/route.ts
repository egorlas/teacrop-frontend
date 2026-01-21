import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sku = formData.get("sku") as string;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { message: "No file provided" } },
        { status: 400 }
      );
    }

    if (!sku) {
      return NextResponse.json(
        { ok: false, error: { message: "SKU is required" } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: { message: "File must be an image" } },
        { status: 400 }
      );
    }

    // Get file extension
    const extension = file.name.split(".").pop() || "jpg";
    
    // Create filename: SKU-ID.extension
    const filename = `${sku}-${Date.now()}.${extension}`;
    
    // Create directory path: public/products/image
    const productsDir = join(process.cwd(), "public", "products", "image");
    
    // Ensure directory exists
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true });
    }

    // Save file
    const filePath = join(productsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Return the public URL
    const imageUrl = `/products/image/${filename}`;

    return NextResponse.json({
      ok: true,
      data: {
        url: imageUrl,
        filename: filename,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
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
