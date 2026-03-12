"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/locale";

export function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale === "vi" ? "vi" : "en";
  }, [locale]);

  return null;
}
