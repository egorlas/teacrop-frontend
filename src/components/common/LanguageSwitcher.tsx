"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocaleStore, type Locale } from "@/store/locale";
import { useTranslation } from "@/lib/i18n";

const locales: { value: Locale; labelKey: string }[] = [
  { value: "vi", labelKey: "lang.vi" },
  { value: "en", labelKey: "lang.en" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9"
          aria-label={t("lang.switch")}
          type="button"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ value, labelKey }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setLocale(value)}
            className="cursor-pointer"
          >
            <span className={locale === value ? "font-semibold" : ""}>
              {t(labelKey)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
