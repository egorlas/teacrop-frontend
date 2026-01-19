import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(n: number) {
  if (typeof n !== "number" || isNaN(n)) return "";
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
