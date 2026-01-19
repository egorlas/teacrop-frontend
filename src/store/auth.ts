import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserRole, type StaffRole, canAccessStaff } from "@/lib/auth/staffAuth";

export interface User {
  id: number;
  username: string;
  email: string;
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
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clear: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.31.187:1337";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isStaff: false,
      isLoading: false,

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
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
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
    }
  )
);

