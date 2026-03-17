"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingButtons } from "@/components/common/FloatingButtons";
import { TopBar } from "@/components/home/TopBar";
import { Header } from "@/components/home/Header";
import { NavMenu } from "@/components/home/NavMenu";
import { AuthCtaSection } from "@/components/home/AuthCtaSection";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "/vi" || pathname === "/en";
  const isProductsPage = pathname?.startsWith("/products");
  const hideAuthBar = pathname?.startsWith("/orders") || pathname?.startsWith("/profile");

  if (isHomePage) {
    return <>{children}</>;
  }

  if (isProductsPage) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50">
        <TopBar />
        {!hideAuthBar && <AuthCtaSection />}
        <Header />
        <NavMenu />
        <main className="flex-1">{children}</main>
        <HomeFooter />
        <FloatingButtons />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50">
      {!hideAuthBar && <AuthCtaSection />}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

