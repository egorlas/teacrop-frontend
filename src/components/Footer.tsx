"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    pages: [
      { href: "/", labelKey: "footer.linkHome" },
      { href: "/about", labelKey: "footer.linkAbout" },
      { href: "/products", labelKey: "footer.linkProducts" },
      { href: "/contact", labelKey: "footer.linkContact" },
    ],
    legal: [
      { href: "#", labelKey: "footer.linkPrivacy" },
      { href: "#", labelKey: "footer.linkTerms" },
    ],
  };

  return (
    <footer className="border-t border-pink-200/60 bg-white/80 backdrop-blur-sm">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <span className="font-audiowide text-2xl font-bold text-primary">Tea Love</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("footer.pages")}</h3>
            <ul className="space-y-2">
              {footerLinks.pages.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, idx) => (
                <li key={`${link.href}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-200/40 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: String(currentYear) })}
          </p>
        </div>
      </Container>
    </footer>
  );
}

