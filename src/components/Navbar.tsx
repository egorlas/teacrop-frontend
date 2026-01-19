"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, User, LogOut, UserCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/Container";
import { AudioToggle } from "@/components/AudioToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/agent-chat", label: "Chat AI" },
];

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth, isStaff, role } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/login");
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
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
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
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
    </nav>
  );
}

