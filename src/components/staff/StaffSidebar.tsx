"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Warehouse, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  todo?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/staff",
    icon: LayoutDashboard,
  },
  {
    label: "Create Order",
    href: "/staff/orders",
    icon: ShoppingCart,
  },
  {
    label: "View Orders",
    href: "/staff/orders-list",
    icon: List,
  },
  {
    label: "Inventory",
    href: "/staff/inventory",
    icon: Package,
  },
  {
    label: "Warehouse",
    href: "#",
    icon: Warehouse,
    todo: true,
  },
];

export function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Staff Area</h2>
        <p className="text-sm text-muted-foreground mt-1">Quản lý hệ thống</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isTodo = item.todo;

          if (isTodo) {
            return (
              <div
                key={item.label} // Change key to item.label to avoid key="#"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                )}
                title="Coming soon"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">TODO</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Staff Portal v1.0
        </p>
      </div>
    </aside>
  );
}
