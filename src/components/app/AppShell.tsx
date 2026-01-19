"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { CartModal } from "@/components/cart/CartModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, LogIn, UserPlus, LogOut, FileText } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

type AppShellProps = {
  children: ReactNode;
  rightPane?: ReactNode;
  sidebar?: ReactNode;
};

export function AppShell({ children, rightPane, sidebar }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const { items } = useCartStore();
  const { user, isAuthenticated, logout, checkAuth, isLoading, token } = useAuthStore();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isPostsPage = pathname === "/posts";

  useEffect(() => {
    // Check auth status on mount
    checkAuth();
  }, [checkAuth]);

  // Fetch remaining tokens when user is authenticated
  useEffect(() => {
    const fetchTokens = async () => {
      if (!isAuthenticated || !token || isLoading) {
        setRemainingTokens(null);
        return;
      }

      setIsLoadingTokens(true);
      try {
        const response = await fetch("/api/user/token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.data) {
            const tokens = result.data.tokens ?? result.data.token ?? 0;
            setRemainingTokens(tokens);
          }
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokens();
  }, [isAuthenticated, token, isLoading]);

  const handleLogout = () => {
    logout();
    router.push("/");
    window.location.reload(); // Refresh to clear any cached data
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      {!isAuthPage && (
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              Tea
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {!isPostsPage && (
            <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setCartModalOpen(true)}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="h-4 w-4" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {items.length > 9 ? "9+" : items.length}
                  </span>
                )}
              </Button>
            </CartModal>
          )}
          
          {/* Auth Menu */}
          {isLoading ? (
            <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
              <User className="h-4 w-4 animate-pulse" />
            </Button>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Token Display */}
              {remainingTokens !== null && (
                <div className="hidden items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground sm:flex">
                  {isLoadingTokens ? (
                    <span className="h-3 w-3 animate-pulse">...</span>
                  ) : (
                    <>
                      <span className="text-muted-foreground">Token:</span>
                      <span className="font-semibold">{remainingTokens.toLocaleString()}</span>
                    </>
                  )}
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/posts" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Quản lý bài viết</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-9">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Đăng ký</span>
                </Button>
              </Link>
            </div>
          )}
          
          <ThemeToggle />
          {!isPostsPage && <SettingsDialog />}
        </div>
      </header>
      )}

      {/* Main Content */}
      <div className={cn(
        "flex flex-1",
        isAuthPage ? "overflow-y-auto" : "overflow-hidden"
      )}>
        {/* Sidebar (hidden on mobile) */}
        {sidebar && (
          <aside className="hidden w-80 border-r border-border bg-muted/30 md:block">
            {sidebar}
          </aside>
        )}

        {/* Chat Pane */}
        <main className={cn(
          "flex flex-1 flex-col",
          isPostsPage ? "overflow-y-auto" : isAuthPage ? "overflow-y-auto" : "overflow-hidden"
        )}>{children}</main>

        {/* Right Pane (hidden on mobile/tablet) */}
        {rightPane && (
          <aside className="hidden w-80 border-l border-border bg-muted/30 lg:block">
            {rightPane}
          </aside>
        )}
      </div>
    </div>
  );
}

