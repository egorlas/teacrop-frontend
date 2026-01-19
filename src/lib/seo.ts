import type { Metadata } from "next";

type BuildMetadataOptions = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  manifest?: string;
  themeColor?: string;
  appleWebApp?: {
    capable?: boolean;
    statusBarStyle?: "default" | "black-translucent" | "black";
    title?: string;
  };
};

export function buildMetadata({
  title,
  description,
  image = "/og-image.jpg",
  url = "https://viettea.com",
  manifest,
  themeColor,
  appleWebApp,
}: BuildMetadataOptions): Metadata {
  const siteName = "Tea Store";
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    manifest,
    themeColor,
    appleWebApp: appleWebApp
      ? {
          capable: appleWebApp.capable ?? true,
          statusBarStyle: appleWebApp.statusBarStyle ?? "default",
          title: appleWebApp.title ?? fullTitle,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    metadataBase: url ? (() => { try { return new URL(url); } catch { return undefined; } })() : undefined,
  };
}

