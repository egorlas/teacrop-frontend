import type { Product } from "@/types/product";
import type { Message } from "@/types/chat";
import type { BlogPost, BlogListResponse } from "@/types/blog";

// Base URL for Strapi API (client + server)
// Prefer STRAPI URL, fallback to legacy NEXT_PUBLIC_API_URL, then default
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.31.187:1337";

// Fallback image URL from env (configurable in .env.local)
const FALLBACK_PRODUCT_IMAGE = process.env.NEXT_PUBLIC_FALLBACK_PRODUCT_IMAGE || '';

/**
 * Get product image URL with fallback
 */
export function getProductImageUrl(imageUrl?: string): string | undefined {
  if (imageUrl) {
    return imageUrl;
  }
  return FALLBACK_PRODUCT_IMAGE || undefined;
}

// API Token configuration
// IMPORTANT: In Next.js, client-side code can ONLY access NEXT_PUBLIC_* variables
// These are injected at build time, not runtime
// For client-side: NEXT_PUBLIC_STRAPI_API_TOKEN=your-token-here
// For server-side (API routes): STRAPI_API_TOKEN=your-token-here (more secure)

// Note: This file is used in both client and server contexts
// Client components can only read NEXT_PUBLIC_STRAPI_API_TOKEN
// Server components/API routes can read both, prefer STRAPI_API_TOKEN

// Helper to create headers with API token
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get API token
  // IMPORTANT: In Next.js client components, only NEXT_PUBLIC_* vars are available
  // They are injected at BUILD TIME, not runtime
  const apiToken =
    process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
    (typeof window === 'undefined' ? process.env.STRAPI_API_TOKEN : undefined);

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    if (!apiToken) {
      console.warn(
        '[API] ⚠️ No API token found!\n' +
        '   For client-side: Add NEXT_PUBLIC_STRAPI_API_TOKEN to .env.local\n' +
        '   For server-side: Add STRAPI_API_TOKEN to .env.local\n' +
        '   Current context: ' + (typeof window !== 'undefined' ? 'CLIENT' : 'SERVER') + '\n' +
        '   Available env vars: NEXT_PUBLIC_STRAPI_API_TOKEN=' +
        (process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? '✅ Set' : '❌ Not set')
      );
    } else {
      // Only log first few chars for security
      const tokenPreview = apiToken.substring(0, 10) + '...';
      console.debug('[API] ✅ Using API token:', tokenPreview);
    }
  }

  // Add API token if available
  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`;
  }

  return headers;
}

// Strapi v5 may return flat structure or nested structure
export interface StrapiProduct {
  id: number;
  // For nested structure (Strapi v4 style)
  attributes?: {
    title: string;
    slug: string;
    description?: string;
    price: number;
    sku?: string;
    inventory: number;
    productType?: "trà" | "trà cụ";
    images?: {
      id: number;
      url: string;
      formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
      };
    };
    attributes?: any; // JSON field for aliases, specifications
    category?: {
      data?: {
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
  // For flat structure (Strapi v5 style) - fields directly on the object
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  sku?: string;
  inventory?: number;
  productType?: "trà" | "trà cụ";
  images?: {
    data?: Array<{
      id: number;
      attributes: {
        url: string;
        formats?: {
          thumbnail?: { url: string };
          small?: { url: string };
        };
      };
    }>;
  };
  // In flat structure, the JSON attributes field might be at root level
  // Use a different name to avoid conflict with nested structure's attributes
  [key: string]: any; // Allow any additional fields for flexibility
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Helper function to convert Strapi blocks format to plain text string
function blocksToString(blocks: any): string | undefined {
  if (!blocks) return undefined;

  // If it's already a string, return it
  if (typeof blocks === 'string') return blocks;

  // If it's an array of block nodes, extract text
  if (Array.isArray(blocks)) {
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (node?.text) return node.text;
      if (node?.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join('');
      }
      return '';
    };

    return blocks.map(extractText).join('\n').trim() || undefined;
  }

  // If it's a single block object
  if (blocks && typeof blocks === 'object') {
    if (blocks.text) return blocks.text;
    if (blocks.children && Array.isArray(blocks.children)) {
      return blocks.children.map((child: any) =>
        typeof child === 'string' ? child : child?.text || ''
      ).join('').trim() || undefined;
    }
  }

  return undefined;
}

// Transform Strapi product to frontend Product type
// Handles both nested (v4 style) and flat (v5 style) structures
function transformProduct(strapiProduct: StrapiProduct): Product {
  // Check if structure is flat (Strapi v5) or nested (Strapi v4)
  // In Strapi v5, fields are directly on the object, not nested in attributes
  const isFlat = !strapiProduct.attributes || 'title' in strapiProduct;

  // Get data from nested structure or flat structure
  const title = isFlat ? strapiProduct.title : strapiProduct.attributes?.title;
  const slug = isFlat ? strapiProduct.slug : strapiProduct.attributes?.slug;
  const descriptionRaw = isFlat ? strapiProduct.description : strapiProduct.attributes?.description;
  const price = isFlat ? strapiProduct.price : strapiProduct.attributes?.price;
  const sku = isFlat ? strapiProduct.sku : strapiProduct.attributes?.sku;
  const inventory = isFlat ? strapiProduct.inventory : strapiProduct.attributes?.inventory;
  const productType = isFlat ? strapiProduct.productType : strapiProduct.attributes?.productType;
  const images = isFlat ? strapiProduct.images : strapiProduct.attributes?.images;
  // New enum fields for filtering
  const teaType = isFlat
    ? (strapiProduct as any).teaType
    : (strapiProduct.attributes as any)?.teaType;
  const ingredient = isFlat
    ? (strapiProduct as any).ingredient
    : (strapiProduct.attributes as any)?.ingredient;
  const finishedGoods = isFlat
    ? (strapiProduct as any).finished_goods
    : (strapiProduct.attributes as any)?.finished_goods;

  // Get JSON attributes field (aliases, specifications)
  // In nested structure: attributes.attributes (first attributes is the wrapper, second is the JSON field)
  // In flat structure: attributes is at root level
  const jsonAttributes = isFlat
    ? (strapiProduct as any).attributes
    : strapiProduct.attributes?.attributes;

  // Convert blocks format description to string
  const description = blocksToString(descriptionRaw);

  // Safe access to the first image's formats using Strapi's nested data structure
  // Strapi image structure differs between v4 and v5; handle both cases for safety
  let thumbnailUrl: string | undefined;

  if (
    images &&
    typeof images === "object" &&
    "data" in images &&
    Array.isArray((images as { data?: any[] }).data)
  ) {
    // v4 nested: images.data is an array; use the first image if available
    const imgObj =
      ((images as { data?: any[] }).data?.[0]?.attributes) ??
      ((images as { data?: any[] }).data?.[0]);
    thumbnailUrl =
      imgObj?.formats?.thumbnail?.url ||
      imgObj?.formats?.small?.url ||
      imgObj?.url ||
      FALLBACK_PRODUCT_IMAGE;
  } else if (images && typeof images === 'object' && ('url' in images || 'formats' in images)) {
    // v5+ flat: images is a single object or already the actual image obj
    thumbnailUrl =
      (images as any).formats?.large?.url ||
      (images as any).formats?.medium?.url ||
      (images as any).url ||
      FALLBACK_PRODUCT_IMAGE;
  } else {
    // Fallback if images field is undefined or in unexpected form
    thumbnailUrl = FALLBACK_PRODUCT_IMAGE;
  }
  // Build image URL with fallback
 
  console.log('images', images);
  return {
    id: String(strapiProduct.id),
    name: title || '',
    slug: slug || undefined,
    description: description,
    note: description, // Use same description for note
    price: price || 0,
    image: thumbnailUrl,
    aliases: jsonAttributes?.aliases || undefined,
    specifications: jsonAttributes?.specifications || undefined,
    sku: sku || undefined,
    inventory: inventory ?? undefined,
    productType: productType as "tea" | "tea_tools" | undefined,
    teaType: teaType || undefined,
    ingredient: ingredient || undefined,
    finished_goods: finishedGoods || undefined,
    attributes: jsonAttributes ? {
      brand: jsonAttributes.brand || undefined,
      expiry: jsonAttributes.expiry || undefined,
      origin: jsonAttributes.origin || undefined,
      weight: jsonAttributes.weight || undefined,
      package: jsonAttributes.package || undefined,
    } : undefined,
  };
}

/**
 * Fetch all products from Strapi with filters, search, and sorting
 */
export async function getProducts(params?: {
  populate?: string;
  pagination?: { page?: number; pageSize?: number };
  filters?: Record<string, any>;
  search?: string;
  sort?: string[];
}): Promise<{ data: Product[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } }> {
  try {
    const queryParams = new URLSearchParams({
      'pagination[pageSize]': String(params?.pagination?.pageSize || 12),
      'pagination[page]': String(params?.pagination?.page || 1),
      'populate': params?.populate || '*',
    });

    // Add search filter (search in title, description, SKU)
    if (params?.search && params.search.trim()) {
      const searchTerm = params.search.trim();
      queryParams.append('filters[$or][0][title][$containsi]', searchTerm);
      queryParams.append('filters[$or][1][sku][$containsi]', searchTerm);
      queryParams.append('filters[$or][2][description][$containsi]', searchTerm);
    }

    // Add filters (support nested filters for Strapi v5)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && '$eq' in value) {
            // Handle nested filter like { $eq: 'value' }
            queryParams.append(`filters[${key}][$eq]`, String(value.$eq));
          } else {
            // Simple filter value
            queryParams.append(`filters[${key}][$eq]`, String(value));
          }
        }
      });
    }

    // Add sort
    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach((sortItem, index) => {
        queryParams.append(`sort[${index}]`, sortItem);
      });
    }

    // Products API is public, no authentication needed
    const response = await fetch(`${API_URL}/api/products?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data: StrapiListResponse<StrapiProduct> = await response.json();
    return {
      data: data.data.map(transformProduct),
      meta: {
        pagination: data.meta?.pagination || {
          page: 1,
          pageSize: 12,
          pageCount: 1,
          total: data.data.length,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID from Strapi
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // Products API is public, no authentication needed
    // Fetch product by slug instead of ID
    const response = await fetch(`${API_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(id)}&populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const data: StrapiListResponse<StrapiProduct> = await response.json();
    if (!data.data || data.data.length === 0) {
      return null;
    }
    return transformProduct(data.data[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Product Category type
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Fetch all product categories from Strapi
 */
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const queryParams = new URLSearchParams({
      'pagination[pageSize]': '100',
      'populate': '*',
    });

    const response = await fetch(`${API_URL}/api/product-categories?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product categories: ${response.status}`);
    }

    const data: StrapiListResponse<{ id: number; name: string; slug: string; description?: string }> = await response.json();
    return data.data.map((category) => ({
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      description: category.description,
    }));
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
}

/**
 * Seed products from frontend mock data to backend
 */
export async function seedProducts(): Promise<{
  success: boolean;
  message?: string;
  results?: Array<{ product: string; status: string; id?: number }>;
  errors?: Array<{ product: string; error: string }>;
  summary?: {
    total: number;
    created: number;
    exists: number;
    errors: number;
  };
  error?: string;
  hint?: string;
}> {
  try {
    const response = await fetch('/api/seed-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Return error data from API (includes hint)
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        hint: data.hint,
      };
    }

    return data;
  } catch (error) {
    console.error('Error seeding products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Seed blogs from frontend mock data to backend
 */
export async function seedBlogs(): Promise<{
  success: boolean;
  message?: string;
  results?: Array<{ blog: string; status: string; id?: number }>;
  errors?: Array<{ blog: string; error: string }>;
  summary?: {
    total: number;
    created: number;
    exists: number;
    errors: number;
  };
  error?: string;
  hint?: string;
}> {
  try {
    const response = await fetch('/api/seed-blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        hint: data.hint,
      };
    }

    return data;
  } catch (error) {
    console.error('Error seeding blogs:', error);
    throw error;
  }
}

/**
 * Send chat message to backend and stream response
 */
export async function sendChatMessage(params: {
  messages: Array<{ role: string; content: string }>;
  promptTemplateId?: number;
  conversationId?: number;
  onChunk?: (chunk: string) => void;
}): Promise<string> {
  const { messages, promptTemplateId, conversationId, onChunk } = params;

  try {
    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        messages,
        promptTemplateId,
        conversationId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    // Read stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;

      if (onChunk) {
        onChunk(chunk);
      }
    }

    return fullContent;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Transform Strapi blog post to frontend BlogPost type
 */
function transformBlogPost(strapiBlog: any): BlogPost {
  const isFlat = !strapiBlog.attributes || 'title' in strapiBlog;

  const id = String(isFlat ? strapiBlog.id : strapiBlog.id);
  const title = isFlat ? strapiBlog.title : strapiBlog.attributes?.title;
  const slug = isFlat ? strapiBlog.slug : strapiBlog.attributes?.slug;
  const excerpt = isFlat ? strapiBlog.excerpt : strapiBlog.attributes?.excerpt;
  const content = isFlat ? strapiBlog.content : strapiBlog.attributes?.content;
  const coverImage = isFlat ? strapiBlog.coverImage : strapiBlog.attributes?.coverImage;
  const gallery = isFlat ? strapiBlog.gallery : strapiBlog.attributes?.gallery;
  const category = isFlat ? strapiBlog.category : strapiBlog.attributes?.category;
  const tag = isFlat ? strapiBlog.tag : strapiBlog.attributes?.tag;
  const author = isFlat ? strapiBlog.author : strapiBlog.attributes?.author;
  const readingTime = isFlat ? strapiBlog.readingTime : strapiBlog.attributes?.readingTime;
  const featured = isFlat ? strapiBlog.featured : strapiBlog.attributes?.featured;
  const pinned = isFlat ? strapiBlog.pinned : strapiBlog.attributes?.pinned;
  const views = isFlat ? strapiBlog.views : strapiBlog.attributes?.views;
  const likes = isFlat ? strapiBlog.likes : strapiBlog.attributes?.likes;
  const seo = isFlat ? strapiBlog.seo : strapiBlog.attributes?.seo;
  const publishedAt = isFlat ? strapiBlog.publishedAt : strapiBlog.attributes?.publishedAt;
  const createdAt = isFlat ? strapiBlog.createdAt : strapiBlog.attributes?.createdAt;
  const updatedAt = isFlat ? strapiBlog.updatedAt : strapiBlog.attributes?.updatedAt;

  // Transform cover image
  const coverImageUrl = coverImage?.data?.attributes?.url
    ? `${API_URL}${coverImage.data.attributes.url}`
    : undefined;

  // Transform gallery
  const galleryUrls = gallery?.data?.map((img: any) =>
    `${API_URL}${img.attributes?.url || ''}`
  ).filter(Boolean) || [];

  // Transform category
  const transformedCategory = category?.data
    ? {
      id: String(category.data.id),
      name: category.data.attributes?.name || category.data.name || '',
      slug: category.data.attributes?.slug || category.data.slug || '',
      description: category.data.attributes?.description || category.data.description,
    }
    : undefined;

  // Transform tag
  const transformedTag = tag?.data
    ? {
      id: String(tag.data.id),
      name: tag.data.attributes?.name || tag.data.name || '',
      slug: tag.data.attributes?.slug || tag.data.slug || '',
    }
    : undefined;

  // Transform author
  const transformedAuthor = author?.data
    ? {
      id: String(author.data.id),
      username: author.data.username || '',
      email: author.data.email,
      avatar: author.data.avatar?.url ? `${API_URL}${author.data.avatar.url}` : undefined,
    }
    : undefined;

  return {
    id,
    title: title || '',
    slug: slug || '',
    excerpt,
    content,
    coverImage: coverImageUrl,
    gallery: galleryUrls,
    category: transformedCategory,
    tag: transformedTag,
    author: transformedAuthor,
    readingTime,
    featured,
    pinned,
    views,
    likes,
    seo,
    publishedAt,
    createdAt,
    updatedAt,
  };
}

/**
 * Fetch all blog posts from Strapi
 */
export async function getBlogPosts(params?: {
  populate?: string;
  pagination?: { page?: number; pageSize?: number };
  filters?: Record<string, any>;
  sort?: string[];
}): Promise<BlogListResponse> {
  try {
    const queryParams = new URLSearchParams({
      'pagination[pageSize]': String(params?.pagination?.pageSize || 12),
      'pagination[page]': String(params?.pagination?.page || 1),
      'populate': params?.populate || '*',
    });

    // Add filters (support nested filters for Strapi v5)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && '$eq' in value) {
            // Handle nested filter like { $eq: 'value' }
            queryParams.append(`filters[${key}][$eq]`, String(value.$eq));
          } else {
            // Simple filter value
            queryParams.append(`filters[${key}][$eq]`, String(value));
          }
        }
      });
    }

    // Add sort
    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach((sortItem, index) => {
        queryParams.append(`sort[${index}]`, sortItem);
      });
    }

    const response = await fetch(`${API_URL}/api/blogs?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status}`);
    }

    const data: BlogListResponse = await response.json();
    return {
      ...data,
      data: data.data.map(transformBlogPost),
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug from Strapi
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch blog post: ${response.status}`);
    }

    const data: BlogListResponse = await response.json();
    if (!data.data || data.data.length === 0) {
      return null;
    }
    return transformBlogPost(data.data[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
}

