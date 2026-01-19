/**
 * Staff authorization utilities
 * TODO: Map real Strapi role schema to role string
 * TODO: Integrate with Strapi user role response
 */

export type StaffRole = "staff" | "admin";

/**
 * Check if a user role can access staff area
 * @param role - User role from auth state
 * @returns true if user can access staff area
 */
export function canAccessStaff(role: string | null | undefined): role is StaffRole {
  return role === "staff" || role === "admin";
}

/**
 * Get user role from Strapi user response
 * TODO: Map real Strapi role schema (role.role.name or role.type)
 * Currently returns a placeholder role for development
 */
export function getUserRole(user: any): string | null {
  // TODO: Extract real role from Strapi user response
  // Strapi Users & Permissions plugin returns roles in different formats:
  // - user.role (object with name)
  // - user.role.name (string)
  // - user.role.type (string)
  
  if (!user || !user.role) {
    return null;
  }

  // Placeholder implementation
  // TODO: Replace with actual Strapi role mapping
  const roleName = user.role?.name || user.role?.type || user.role;
  console.log("Role name", roleName);
  if (typeof roleName === "string") {
    return roleName.toLowerCase();
  }

  return null;
}
