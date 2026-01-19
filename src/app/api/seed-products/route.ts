import { NextRequest, NextResponse } from "next/server";
import { mockProducts } from "@/data/products";

// Server-side only: Use API_URL (runtime) or fallback to NEXT_PUBLIC_API_URL (build-time) or default
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337';
// API Token từ Strapi Admin Panel (Settings → API Tokens → Create new API Token)
// Hoặc set trong .env.local: STRAPI_API_TOKEN=your-token-here
const API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

/**
 * API endpoint to seed products from frontend data to Strapi backend
 * POST /api/seed-products
 * 
 * Requires: STRAPI_API_TOKEN in .env.local for authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check if API token is available
    if (!API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'API Token not configured. Please set STRAPI_API_TOKEN in .env.local or create an API Token in Strapi Admin Panel.',
          hint: 'Go to Strapi Admin → Settings → API Tokens → Create new API Token (Full access)',
        },
        { status: 401 }
      );
    }
    // Map product names to category slugs
    const categoryMap: Record<string, string> = {
      'Trà Sen Tây Hồ': 'tra-thao-moc',
      'Trà Lài': 'tra-thao-moc',
      'Trà Ô Long': 'tra-o-long',
      'Trà Xanh Thái Nguyên': 'tra-xanh',
      'Trà Đen Shan Tuyết': 'tra-shan-tuyet',
      'Trà Hoa Cúc': 'tra-thao-moc',
    };

    const results = [];
    const errors = [];

    // Prepare headers with API token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    };

    // First, fetch or create categories
    // Category mapping for auto-creation
    const categoryDefinitions: Record<string, { name: string; slug: string; description: string }> = {
      'tra-thao-moc': {
        name: 'Trà Thảo Mộc',
        slug: 'tra-thao-moc',
        description: 'Trà thảo mộc và trà hoa',
      },
      'tra-o-long': {
        name: 'Trà Ô Long',
        slug: 'tra-o-long',
        description: 'Trà Ô Long truyền thống',
      },
      'tra-xanh': {
        name: 'Trà Xanh',
        slug: 'tra-xanh',
        description: 'Các loại trà xanh cao cấp',
      },
      'tra-shan-tuyet': {
        name: 'Trà Shan Tuyết',
        slug: 'tra-shan-tuyet',
        description: 'Trà Shan Tuyết cổ thụ',
      },
    };

    let categories: any[] = [];
    const createdCategoryIds: Record<string, number> = {};

    // Try to fetch existing categories
    try {
      const categoriesResponse = await fetch(`${API_URL}/api/product-categories?pagination[pageSize]=100&publicationState=live`, { headers });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        categories = categoriesData.data || [];
      } else if (categoriesResponse.status === 404) {
        // Categories endpoint not found - try without publicationState
        const fallbackResponse = await fetch(`${API_URL}/api/product-categories?pagination[pageSize]=100`, { headers });
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          categories = fallbackData.data || [];
        }
      }
    } catch (e) {
      console.warn('Could not fetch categories (will create if needed):', e);
    }

    // Helper to get or create category
    const getOrCreateCategory = async (categorySlug: string): Promise<number | null> => {
      if (!categorySlug || !categoryDefinitions[categorySlug]) {
        return null;
      }

      // Check if already created in this session
      if (createdCategoryIds[categorySlug]) {
        return createdCategoryIds[categorySlug];
      }

      // Check if exists in fetched categories
      const existing = categories.find(
        (cat: any) => cat.attributes?.slug === categorySlug
      );
      if (existing) {
        createdCategoryIds[categorySlug] = existing.id;
        return existing.id;
      }

      // Create category if not exists
      try {
        const categoryDef = categoryDefinitions[categorySlug];
        const createCategoryResponse = await fetch(`${API_URL}/api/product-categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              ...categoryDef,
              publishedAt: new Date().toISOString(), // Publish immediately
            },
          }),
        });

        if (createCategoryResponse.ok) {
          const createdCategoryData = await createCategoryResponse.json();
          const categoryId = createdCategoryData.data?.id;
          if (categoryId) {
            createdCategoryIds[categorySlug] = categoryId;
            categories.push(createdCategoryData.data); // Add to local cache
            return categoryId;
          }
        } else {
          // If creation failed, try to check error
          const errorText = await createCategoryResponse.text();
          console.warn(`Could not create category ${categorySlug}: ${createCategoryResponse.status} - ${errorText}`);
        }
      } catch (e) {
        console.warn(`Could not create category ${categorySlug}:`, e);
      }

      return null;
    };

    // Helper to find category ID by slug (from cache)
    const findCategoryId = (productName: string): Promise<number | null> => {
      const categorySlug = categoryMap[productName];
      if (!categorySlug) return Promise.resolve(null);
      return getOrCreateCategory(categorySlug);
    };

    // Process each mock product
    for (const product of mockProducts) {
      try {
        // Check if product already exists by checking for similar title
        const searchResponse = await fetch(
          `${API_URL}/api/products?filters[title][$contains]=${encodeURIComponent(product.name)}`,
          { headers }
        );
        const searchData = await searchResponse.json();
        
        if (searchData.data && searchData.data.length > 0) {
          results.push({
            product: product.name,
            status: 'exists',
            id: searchData.data[0].id,
          });
          continue;
        }

        // Generate slug from product name
        const slug = product.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Get or create category for this product
        const categoryId = await findCategoryId(product.name);

        // Prepare product data for Strapi
        const productData = {
          data: {
            title: product.name,
            slug,
            description: product.note || '',
            price: product.price,
            sku: `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            inventory: Math.floor(Math.random() * 100) + 20, // Random inventory 20-120
            attributes: {
              aliases: product.aliases || [],
              specifications: [], // Can be added later
            },
            ...(categoryId && {
              category: categoryId,
            }),
            publishedAt: new Date().toISOString(), // Publish immediately
          },
        };

        // Create product in Strapi
        const createResponse = await fetch(`${API_URL}/api/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          let errorMessage = `HTTP ${createResponse.status}: ${errorText}`;
          
          // Add helpful hints for common errors
          if (createResponse.status === 405) {
            errorMessage += '\n💡 Hint: Make sure your API Token has "Create" permission for Products in Strapi Admin → Settings → API Tokens → Your Token → Permissions';
          } else if (createResponse.status === 403) {
            errorMessage += '\n💡 Hint: Your API Token may not have permission to create products. Check permissions in Strapi Admin.';
          }
          
          errors.push({
            product: product.name,
            error: errorMessage,
          });
          continue;
        }

        const createdData = await createResponse.json();
        results.push({
          product: product.name,
          status: 'created',
          id: createdData.data?.id,
        });
      } catch (error) {
        errors.push({
          product: product.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${mockProducts.length} products`,
      results,
      errors,
      summary: {
        total: mockProducts.length,
        created: results.filter((r) => r.status === 'created').length,
        exists: results.filter((r) => r.status === 'exists').length,
        errors: errors.length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check seed status
 */
export async function GET() {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` }),
    };

    const response = await fetch(`${API_URL}/api/products?pagination[pageSize]=100`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    const products = data.data || [];

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      mockProductsCount: mockProducts.length,
      message: `Backend has ${products.length} products, frontend has ${mockProducts.length} mock products`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

