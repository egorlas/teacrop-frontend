/**
 * Strapi API client wrapper
 * Handles base URL, authentication headers, and error handling
 * TODO: Set STRAPI_URL in .env.local
 */

// TODO: Add STRAPI_URL to .env.local
// NEXT_PUBLIC_STRAPI_URL=http://192.168.31.187:1337
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://192.168.31.187:1337";

export interface StrapiRequestOptions extends RequestInit {
  token?: string | null;
  requiresAuth?: boolean;
}

/**
 * Strapi API client
 * Automatically injects authentication token when provided
 */
export async function strapiClient<T>(
  endpoint: string,
  options: StrapiRequestOptions = {}
): Promise<T> {
  const { token, requiresAuth = false, headers, ...fetchOptions } = options;

  // Build full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${STRAPI_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Prepare headers as Record<string, string> for easier manipulation
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  // Add authorization header if token is provided
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  } else if (requiresAuth) {
    // TODO: Get token from httpOnly cookie via route handler instead
    throw new Error("Authentication required but no token provided");
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.text()) as T;
    }

    const data = await response.json();

    // Handle Strapi error responses
    if (!response.ok) {
      const error = data.error || data;
      throw new Error(
        error.message || error.statusText || `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * GET request helper
 */
export function strapiGet<T>(endpoint: string, options?: StrapiRequestOptions): Promise<T> {
  return strapiClient<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request helper
 */
export function strapiPost<T>(
  endpoint: string,
  body?: any,
  options?: StrapiRequestOptions
): Promise<T> {
  return strapiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export function strapiPut<T>(
  endpoint: string,
  body?: any,
  options?: StrapiRequestOptions
): Promise<T> {
  return strapiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function strapiDelete<T>(endpoint: string, options?: StrapiRequestOptions): Promise<T> {
  return strapiClient<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}
