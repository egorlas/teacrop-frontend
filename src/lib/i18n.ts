import { useLocaleStore } from "@/store/locale";
import vi from "@/messages/vi.json";
import en from "@/messages/en.json";

export type Locale = "vi" | "en";

const messages: Record<Locale, Record<string, string>> = {
  vi: vi as Record<string, string>,
  en: en as Record<string, string>,
};

function translate(
  locale: Locale,
  key: string,
  paramsOrFallback?: Record<string, string | number> | string
): string {
  let text = messages[locale]?.[key] || messages.vi?.[key] || key;
  if (paramsOrFallback !== undefined) {
    if (typeof paramsOrFallback === "string") {
      return text !== key ? text : paramsOrFallback;
    }
    for (const [k, v] of Object.entries(paramsOrFallback)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (
    key: string,
    paramsOrFallback?: Record<string, string | number> | string
  ) => translate(locale, key, paramsOrFallback);
  return { t, locale };
}

export function t(
  key: string,
  paramsOrFallback?: Record<string, string | number> | string
): string {
  const locale = useLocaleStore.getState().locale;
  return translate(locale, key, paramsOrFallback);
}

// Legacy exports for components that use getTranslations
export function getLocale(): Locale {
  return useLocaleStore.getState().locale;
}

export function setLocale(locale: Locale) {
  useLocaleStore.getState().setLocale(locale);
}

export function getTranslations(namespace: string): Record<string, string> {
  const locale = useLocaleStore.getState().locale;
  const prefix = `${namespace}.`;
  const result: Record<string, string> = {};
  const localeMessages = messages[locale] || messages.vi || {};
  for (const [key, value] of Object.entries(localeMessages)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}
