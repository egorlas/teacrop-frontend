import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserRole, type StaffRole, canAccessStaff } from "@/lib/auth/staffAuth";

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: {
    id?: number;
    name?: string;
    type?: string;
  } | string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: StaffRole | string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (userData: any) => Promise<void>;
  clear: () => void;
}

// Base URL for Strapi auth APIs
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.31.187:1337";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isStaff: false,
      isLoading: false,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/api/auth/local`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: email, // Strapi uses 'identifier' for email/username
              password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Login failed");
          }

          const data = await response.json();
          const user = data.user;
          const role = getUserRole(user);
          const isStaff = canAccessStaff(role);
          
          // Set role cookie for middleware (temporary solution)
          // TODO: Replace with httpOnly cookie set via route handler
          if (typeof document !== "undefined") {
            if (isStaff) {
              document.cookie = `role=${role}; path=/; max-age=86400`; // 24 hours
            } else {
              document.cookie = "role=; path=/; max-age=0";
            }
          }
          
          set({
            user,
            token: data.jwt,
            role,
            isAuthenticated: true,
            isStaff,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/api/auth/local/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.error?.message || "Registration failed"
            );
          }

          const data = await response.json();
          const user = data.user;
          const role = getUserRole(user);
          const isStaff = canAccessStaff(role);
          
          // Set role cookie for middleware (temporary solution)
          // TODO: Replace with httpOnly cookie set via route handler
          if (typeof document !== "undefined") {
            if (isStaff) {
              document.cookie = `role=${role}; path=/; max-age=86400`; // 24 hours
            } else {
              document.cookie = "role=; path=/; max-age=0";
            }
          }
          
          set({
            user,
            token: data.jwt,
            role,
            isAuthenticated: true,
            isStaff,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear role cookie
        // TODO: Clear httpOnly cookie via route handler
        if (typeof document !== "undefined") {
          document.cookie = "role=; path=/; max-age=0";
        }
        
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isStaff: false,
        });
      },

      checkAuth: async () => {
        const { token, hasHydrated } = get();
        
        // Wait for hydration to complete before checking auth
        if (!hasHydrated) {
          // State hasn't been restored from localStorage yet
          // Return early and let onRehydrateStorage handle it
          return;
        }
        
        if (!token) {
          set({ isAuthenticated: false, user: null, hasHydrated: true });
          return;
        }

        set({ isLoading: true, hasHydrated: true });
        try {
          const response = await fetch(`${API_URL}/api/users/me?populate=role`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Not authenticated");
          }

          const user = await response.json();
          
          // Extract and normalize role from response
          // Strapi returns role as object { id, name, type } when populated
          let normalizedRole = null;
          if (user.role) {
            if (typeof user.role === "object" && user.role !== null) {
              // Role is populated as object
              normalizedRole = user.role.name || user.role.type || null;
            } else if (typeof user.role === "string") {
              // Role is already a string
              normalizedRole = user.role;
            }
          }
          
          // Normalize role name to lowercase for consistency
          if (normalizedRole && typeof normalizedRole === "string") {
            normalizedRole = normalizedRole.toLowerCase();
          }
          
          // Update user with normalized role
          const userWithRole = {
            ...user,
            role: normalizedRole ? {
              ...(typeof user.role === "object" ? user.role : {}),
              name: normalizedRole,
            } : null,
          };
          
          // Extract role and check if staff
          const extractedRole = getUserRole(userWithRole);
          const isStaff = canAccessStaff(extractedRole);
          
          // Set role cookie for middleware (temporary solution)
          // TODO: Replace with httpOnly cookie set via route handler
          if (typeof document !== "undefined") {
            if (isStaff) {
              document.cookie = `role=${extractedRole}; path=/; max-age=86400`; // 24 hours
            } else {
              document.cookie = "role=; path=/; max-age=0";
            }
          }
          
          set({
            user: userWithRole,
            role: extractedRole,
            isAuthenticated: true,
            isStaff,
            isLoading: false,
            hasHydrated: true,
          });
        } catch (error) {
          // Clear role cookie on auth error
          if (typeof document !== "undefined") {
            document.cookie = "role=; path=/; max-age=0";
          }
          
          set({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isStaff: false,
            isLoading: false,
            hasHydrated: true,
          });
        }
      },

      setUser: (user: User | null) => {
        const role = user ? getUserRole(user) : null;
        const isStaff = canAccessStaff(role);
        
        // Set role cookie for middleware (temporary solution)
        // TODO: Replace with httpOnly cookie set via route handler
        if (typeof document !== "undefined") {
          if (isStaff) {
            document.cookie = `role=${role}; path=/; max-age=86400`; // 24 hours
          } else {
            document.cookie = "role=; path=/; max-age=0";
          }
        }
        
        set({ 
          user, 
          role,
          isAuthenticated: !!user,
          isStaff,
        });
      },

      setToken: (token: string | null) => {
        set({ token, isAuthenticated: !!token });
      },

      updateUser: async (userData: any) => {
        const { token } = get();
        if (!token) {
          throw new Error("Not authenticated");
        }

        try {
          // Fetch updated user with role populated
          const response = await fetch(`${API_URL}/api/users/me?populate=role`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch updated user");
          }

          const updatedUser = await response.json();
          
          // Extract and normalize role from response
          let normalizedRole = null;
          if (updatedUser.role) {
            if (typeof updatedUser.role === "object" && updatedUser.role !== null) {
              normalizedRole = updatedUser.role.name || updatedUser.role.type || null;
            } else if (typeof updatedUser.role === "string") {
              normalizedRole = updatedUser.role;
            }
          }
          
          if (normalizedRole && typeof normalizedRole === "string") {
            normalizedRole = normalizedRole.toLowerCase();
          }
          
          const userWithRole = {
            ...updatedUser,
            role: normalizedRole ? {
              ...(typeof updatedUser.role === "object" ? updatedUser.role : {}),
              name: normalizedRole,
            } : null,
          };
          
          const role = normalizedRole;
          const isStaff = canAccessStaff(role);
          
          // Set role cookie
          if (typeof document !== "undefined") {
            if (isStaff) {
              document.cookie = `role=${role}; path=/; max-age=86400`;
            } else {
              document.cookie = "role=; path=/; max-age=0";
            }
          }
          
          set({
            user: userWithRole,
            role,
            isStaff,
          });
        } catch (error) {
          console.error("Error updating user:", error);
          throw error;
        }
      },

      clear: () => {
        // Clear role cookie
        // TODO: Clear httpOnly cookie via route handler
        if (typeof document !== "undefined") {
          document.cookie = "role=; path=/; max-age=0";
        }
        
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isStaff: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        isStaff: state.isStaff,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating auth state:", error);
          // Mark as hydrated even on error
          if (state) {
            state.hasHydrated = true;
          }
          return;
        }
        
        // Mark as hydrated first
        if (state) {
          state.hasHydrated = true;
        }
        
        // After state is rehydrated from localStorage, verify token with server
        if (state?.token) {
          // Call checkAuth to verify token is still valid
          // Use setTimeout to ensure this runs after component mounts
          setTimeout(() => {
            state.checkAuth().catch((error) => {
              console.error("Error verifying auth after rehydration:", error);
            });
          }, 100);
        } else {
          // No token, ensure state is cleared
          if (state) {
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
            state.isStaff = false;
          }
        }
      },
    }
  )
);

