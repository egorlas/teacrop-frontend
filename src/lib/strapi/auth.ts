/**
 * Strapi authentication functions
 * TODO: Move JWT storage to httpOnly cookie via route handler
 * TODO: Integrate with real Strapi user/role schema
 */

import { strapiClient, strapiPost } from "./strapiClient";

export interface StrapiLoginResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: any; // TODO: Define proper Strapi role type based on schema
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

/**
 * Login to Strapi
 * POST /api/auth/local
 */
export async function strapiLogin(
  credentials: LoginCredentials
): Promise<StrapiLoginResponse> {
  const response = await strapiPost<StrapiLoginResponse>(
    "/api/auth/local",
    {
      identifier: credentials.identifier,
      password: credentials.password,
    }
  );

  return response;
}

/**
 * Get current user from Strapi
 * GET /api/users/me
 * TODO: This should be called via route handler to use httpOnly cookie
 */
export async function strapiGetMe(token: string): Promise<StrapiUser> {
  // TODO: Replace with route handler that uses httpOnly cookie
  // Example: /api/auth/me (server-side route handler)
  const response = await strapiClient<StrapiUser>("/api/users/me", {
    token,
    requiresAuth: true,
  });

  return response;
}

/**
 * Logout (client-side cleanup)
 * TODO: Add server-side logout route handler to clear httpOnly cookie
 */
export function strapiLogout(): void {
  // TODO: Call server-side route handler to clear httpOnly cookie
  // Example: /api/auth/logout
  // For now, just document that client should clear local storage/cookies
}
