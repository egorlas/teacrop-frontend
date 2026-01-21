"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, User, LogOut, UserCircle, Settings, Package, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/Container";
import { AudioToggle } from "@/components/AudioToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { CartModal } from "@/components/cart/CartModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Navigation links
const navLinks: Array<{ href: string; label: string; icon?: any }> = [];

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth, isStaff, role, hasHydrated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  useEffect(() => {
    // Only check auth after state has been hydrated from localStorage
    if (hasHydrated) {
      checkAuth();
    }
  }, [hasHydrated, checkAuth]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/login");
  };

  const handleOpenCart = () => {
    setCartModalOpen(true);
    setIsOpen(false); // Close mobile menu if open
  };

  // Helper: extract role name if user.role is an object, else show as string
  function getRoleDisplay(role: any): string | null {
    if (!role) return null;
    if (typeof role === "string") return role;
    if (typeof role === "object" && typeof role.name === "string") {
      return role.name;
    }
    return JSON.stringify(role);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground" onClick={closeMenu}>
            Tea Store
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Auth Buttons, Theme Toggle, Audio Toggle and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Desktop Login Button */}
            {!isAuthenticated ? (
              <Link href="/login" className="hidden md:block">
                <Button variant="default" size="sm" className="h-9 gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-2 hidden md:flex">
                    <UserCircle className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">
                      {user?.username || user?.email || "Tài khoản"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user?.username || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                        {!!getRoleDisplay(user?.role) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                              {getRoleDisplay(user?.role)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleOpenCart}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h2l.4 2M7 13h10l4-8H5.4" />
                        <path d="M7 13l-1.35-5.41A1 1 0 0 1 6.62 6h14.48" />
                      </svg>
                      <span>Giỏ hàng</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Lịch sử đơn hàng</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/products" className="flex items-center">
                      <Store className="mr-2 h-4 w-4" />
                      <span>Cửa hàng</span>
                    </Link>
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/staff" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Khu vực nhân viên</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Desktop Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <AudioToggle />
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden"
              aria-label={isOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-foreground" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-4 pb-4 pt-4">
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm font-medium text-foreground">Giao diện</span>
              <ThemeToggle />
            </div>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* Mobile Login Button */}
            <div className="pt-4 border-t border-border">
              {!isAuthenticated ? (
                <Link href="/login" onClick={closeMenu} className="w-full">
                  <Button variant="default" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </Button>
                </Link>
              ) : (
                <Link href="/profile" onClick={closeMenu} className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <User className="h-4 w-4" />
                    {user?.username || user?.email || "Tài khoản"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Cart Modal */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </nav>
  );
}

