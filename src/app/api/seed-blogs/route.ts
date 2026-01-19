import { NextRequest, NextResponse } from "next/server";
import { mockBlogs } from "@/data/blogs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

/**
 * API endpoint to seed blog posts from frontend data to Strapi backend
 * POST /api/seed-blogs
 * 
 * Requires: STRAPI_API_TOKEN in .env.local for authentication
 */
export async function POST(req: NextRequest) {
  try {
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

    const results: Array<{ blog: string; status: string; id?: number }> = [];
    const errors: Array<{ blog: string; error: string }> = [];

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    };

    // Process each blog post
    for (const blog of mockBlogs) {
      try {
        // Prepare blog data
        const blogData: any = {
          title: blog.title,
          excerpt: blog.excerpt,
          readingTime: blog.readingTime || 5,
          featured: blog.featured || false,
          pinned: false,
          views: 0,
          likes: 0,
        };

        // Add content (dynamic zone) - format for Strapi v5
        if (blog.content && Array.isArray(blog.content)) {
          blogData.content = blog.content.map((block: any) => {
            // Ensure __component is set
            const formattedBlock: any = {
              __component: block.__component,
            };
            
            // Add block-specific fields
            if (block.__component === 'blocks.paragraph') {
              formattedBlock.body = block.body || '';
            } else if (block.__component === 'blocks.quote') {
              formattedBlock.quote = block.quote || '';
              if (block.author) {
                formattedBlock.author = block.author;
              }
            } else if (block.__component === 'blocks.image') {
              // Skip image blocks (no images needed for now)
              return null;
            } else if (block.__component === 'blocks.gallery') {
              // Skip gallery blocks (no images needed for now)
              return null;
            } else if (block.__component === 'blocks.embed') {
              formattedBlock.url = block.url || '';
              if (block.caption) {
                formattedBlock.caption = block.caption;
              }
            } else if (block.__component === 'blocks.cta') {
              formattedBlock.title = block.title || '';
              formattedBlock.link = block.link || '';
              if (block.description) {
                formattedBlock.description = block.description;
              }
            }
            
            return formattedBlock;
          }).filter(Boolean); // Remove null entries
        }

        // Skip SEO, coverImage, category, and tags for now
        
        const createResponse = await fetch(`${API_URL}/api/blogs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            data: blogData 
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          let errorMessage = `HTTP ${createResponse.status}: ${errorText}`;
          
          if (createResponse.status === 405) {
            errorMessage += '\n💡 Hint: Make sure your API Token has "Create" permission for Blogs in Strapi Admin → Settings → API Tokens → Your Token → Permissions';
          } else if (createResponse.status === 403) {
            errorMessage += '\n💡 Hint: Your API Token may not have permission to create blogs. Check permissions in Strapi Admin.';
          }
          
          errors.push({
            blog: blog.title,
            error: errorMessage,
          });
          continue;
        }

        const createdData = await createResponse.json();
        results.push({
          blog: blog.title,
          status: 'created',
          id: createdData.data?.id,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          blog: blog.title,
          error: errorMessage,
        });
      }
    }

    const summary = {
      total: mockBlogs.length,
      created: results.length,
      errors: errors.length,
    };

    return NextResponse.json({
      success: errors.length === 0,
      message: `Seeded ${summary.created} blog posts`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed blogs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

