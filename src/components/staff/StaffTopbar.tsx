"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StaffTopbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // TODO: Call server-side logout route handler to clear httpOnly cookie
    // Example: await fetch('/api/auth/logout', { method: 'POST' })
    router.push("/login");
  };

  // Helper: extract role name if user.role is an object, else show as string
  function getRoleDisplay(role: any): string | null {
    if (!role) return null;
    if (typeof role === "string") return role;
    // If it's an object with "name", return the name
    if (typeof role === "object" && typeof role.name === "string") {
      return role.name;
    }
    // Otherwise, fallback to JSON string
    return JSON.stringify(role);
  }

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Website
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.username || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.username || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {!!getRoleDisplay(user.role) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Role: {getRoleDisplay(user.role)}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
