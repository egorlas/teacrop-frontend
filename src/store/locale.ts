import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "vi" | "en";

interface LocaleState {
  locale: Locale;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "vi",
      hasHydrated: false,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "viettea-locale",
      onRehydrateStorage: () => () => {
        useLocaleStore.setState({ hasHydrated: true });
      },
    }
  )
);
