import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

const buttonVariants = (props?: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) => {
  const { variant = "default", size = "default" } = props || {};
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
        variant === "outline",
      "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
      "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
      "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
      "text-primary underline-offset-4 hover:underline": variant === "link",
      "h-10 px-4 py-2": size === "default",
      "h-9 rounded-md px-3 text-sm": size === "sm",
      "h-11 rounded-md px-8": size === "lg",
      "h-9 w-9": size === "icon",
    }
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

