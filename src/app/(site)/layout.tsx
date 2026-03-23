"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingButtons } from "@/components/common/FloatingButtons";
import { Header } from "@/components/home/Header";
import { NavMenu } from "@/components/home/NavMenu";
import { HomeNavSearch } from "@/components/home/HomeNavSearch";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "/vi" || pathname === "/en";
  const isProductsPage = pathname?.startsWith("/products");
  const showFixedTop = !pathname?.startsWith("/login");
  const fixedTop = (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <div className="bg-[#fbfbfb] shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <HomeNavSearch inline />
            </div>
          </div>
        </div>
      </div>
      <div className="h-[150px] md:h-[160px]" aria-hidden />
    </>
  );

  if (isHomePage) {
    return (
      <>
        {showFixedTop && fixedTop}
        {children}
      </>
    );
  }

  if (isProductsPage) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50">
        {showFixedTop && fixedTop}
        <NavMenu />
        <main className="flex-1">{children}</main>
        <HomeFooter />
        <FloatingButtons />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50">
      {showFixedTop && fixedTop}
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

