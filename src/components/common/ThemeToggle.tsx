"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeType = "light" | "dark" | "system";

function getSystemTheme(): ThemeType {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeType) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  
  // Add transition class for smooth color transitions
  root.style.setProperty("color-scheme", resolved);
  
  // Use requestAnimationFrame for smoother transition
  requestAnimationFrame(() => {
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  });
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeType>("system");
  const [mounted, setMounted] = useState(false);

  // Effect to set up theme on mount and restore from localStorage
  useEffect(() => {
    const savedTheme = (typeof window !== "undefined"
      ? window.localStorage.getItem("theme")
      : null) as ThemeType | null;

    setTheme(savedTheme || "system");
    setMounted(true);
  }, []);

  // Effect to apply the theme and subscribe to system changes
  useEffect(() => {
    if (!mounted) return;

    applyTheme(theme);

    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    const mediaQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    if (theme === "system" && mediaQuery) {
      mediaQuery.addEventListener("change", handleSystemChange);
    }

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", handleSystemChange);
      }
    };
  }, [theme, mounted]);

  const toggleTheme = () => {
    // cycle: light -> dark -> system -> light ...
    let newTheme: ThemeType;
    if (theme === "light") newTheme = "dark";
    else if (theme === "dark") newTheme = "system";
    else newTheme = "light";

    // Apply theme immediately for better UX
    applyTheme(newTheme);
    setTheme(newTheme);
    
    // Save to localStorage after state update
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Fix button type error: size should be "sm", "lg" or undefined, not "icon"
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9" aria-label="Chuyển đổi giao diện">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  // Show icon based on the currently effective theme
  const actualTheme = theme === "system" ? getSystemTheme() : theme;
  const ariaLabel =
    theme === "dark"
      ? "Chuyển sang chế độ sáng"
      : theme === "light"
      ? "Chuyển sang chế độ tối"
      : "Theo hệ thống";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 relative"
      aria-label={ariaLabel}
      type="button"
    >
      <span className="relative inline-block w-4 h-4">
        <Sun
          className={cn(
            "h-4 w-4 absolute inset-0 transition-all duration-300",
            actualTheme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 absolute inset-0 transition-all duration-300",
            actualTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
    </Button>
  );
}
