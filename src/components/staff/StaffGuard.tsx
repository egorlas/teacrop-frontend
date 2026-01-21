"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { canAccessStaff } from "@/lib/auth/staffAuth";

interface StaffGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side guard component for staff pages
 * Checks if user has staff/admin role before rendering children
 * NOTE: Middleware handles server-side protection, this is an extra client-side check
 */
export function StaffGuard({ children }: StaffGuardProps) {
  const router = useRouter();
  const { user, role, isStaff, isLoading, isAuthenticated, checkAuth, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check auth when component mounts - wait for persist hydration
  useEffect(() => {
    console.log("[StaffGuard] Component mounted - Initial state:", {
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated,
      isLoading,
      role,
    });

    // Wait for Zustand persist to hydrate, then check auth
    const timer = setTimeout(async () => {
      const state = useAuthStore.getState();
      console.log("[StaffGuard] After hydration delay - Direct state check:", {
        hasUser: !!state.user,
        hasToken: !!state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
      });

      // If we have token, always call checkAuth to ensure user is loaded
      if (state.token) {
        console.log("[StaffGuard] Token found, calling checkAuth() to load user");
        try {
          await checkAuth();
          const updatedState = useAuthStore.getState();
          console.log("[StaffGuard] checkAuth completed - User loaded:", {
            hasUser: !!updatedState.user,
            username: updatedState.user?.username,
            role: updatedState.role,
          });
          setHasChecked(true);
        } catch (error) {
          console.error("[StaffGuard] checkAuth error:", error);
          setHasChecked(true);
        }
      } else if (state.user || state.isAuthenticated) {
        // Already have user or authenticated
        console.log("[StaffGuard] Already authenticated, user exists");
        setHasChecked(true);
      } else {
        // No token and no user
        console.log("[StaffGuard] No token and no user - not authenticated");
        setHasChecked(true);
      }
    }, 200); // Small delay to allow persist hydration

    return () => clearTimeout(timer);
  }, []); // Only run on mount

  // Also react to changes in token/user state after mount
  useEffect(() => {
    if (hasChecked) return; // Don't re-check if already checked

    if (token && !user && !isLoading) {
      console.log("[StaffGuard] Token detected in state, calling checkAuth()");
      checkAuth()
        .then(() => {
          console.log("[StaffGuard] checkAuth completed after token detected");
          setHasChecked(true);
        })
        .catch((error) => {
          console.error("[StaffGuard] checkAuth error:", error);
          setHasChecked(true);
        });
    } else if (user || isAuthenticated) {
      console.log("[StaffGuard] User/authenticated state changed, setting hasChecked");
      setHasChecked(true);
    }
  }, [token, user, isLoading, isAuthenticated, checkAuth, hasChecked]);

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading || !hasChecked) {
      return;
    }

    console.log("[StaffGuard] Auth check complete:", {
      user: user ? { id: user.id, username: user.username, email: user.email } : null,
      role,
      isAuthenticated,
      isStaff,
      token: token ? "exists" : "null",
    });

    // If not authenticated, redirect to login
    if (!user && !isAuthenticated) {
      console.log("[StaffGuard] Not authenticated, redirecting to login");
      const currentPath = window.location.pathname;
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    // DEBUG: If authenticated but doesn't have staff role, allow access for debugging
    // Don't redirect - keep the page accessible to debug
    if (user && !canAccessStaff(role)) {
      console.log("[StaffGuard] DEBUG MODE: User authenticated but not staff/admin. Allowing access for debugging.", {
        user: { id: user.id, username: user.username, email: user.email },
        role,
        isStaff,
        canAccess: canAccessStaff(role),
      });
      // Continue - don't redirect, allow access for debugging
    }

    setIsChecking(false);
  }, [user, role, isStaff, isLoading, isAuthenticated, hasChecked, token, router]);

  // Show loading state while checking
  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Only render children if user has staff access
  if (!isStaff) {
    return null;
  }

  return <>{children}</>;
}
