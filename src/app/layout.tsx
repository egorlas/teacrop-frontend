import type { Metadata } from "next";
import { Geist, Geist_Mono, Audiowide } from "next/font/google";
import { buildMetadata } from "@/lib/seo";
import { Toaster } from "sonner";
import { LocaleSync } from "@/components/common/LocaleSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = buildMetadata({
  title: "Tea Love",
  description:
    "Chúng tôi yêu trà và chúng tôi bán tất cả những gì các bạn biết về trà - với chất lượng tương xứng với sự tin tưởng của các bạn",
  image: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1773301630/Tea_Love_fsaoqq.png",
  manifest: "/manifest.webmanifest",
  themeColor: "#f9a8d4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tea Love",
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${audiowide.variable} min-h-screen antialiased`}
      >
        <LocaleSync />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
