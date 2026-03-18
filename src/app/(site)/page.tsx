import { Suspense } from "react";
import { TopBar } from "@/components/home/TopBar";
import { Header } from "@/components/home/Header";
import { HomeNavSearch } from "@/components/home/HomeNavSearch";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeatureIcons } from "@/components/home/FeatureIcons";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ImpactBanner } from "@/components/home/ImpactBanner";
import { IngredientsHighlight } from "@/components/home/IngredientsHighlight";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BundlesBanner } from "@/components/home/BundlesBanner";
import { BrandSlide } from "@/components/home/BrandSlide";
import { CommunitySection } from "@/components/home/CommunitySection";
import { SocialVideoSlider } from "@/components/home/SocialVideoSlider";
import { UserReviews } from "@/components/home/UserReviews";
import { AuthCtaSection } from "@/components/home/AuthCtaSection";
import { AboutUs } from "@/components/home/AboutUs";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingHearts } from "@/components/home/FloatingHearts";

// ISR: regenerate homepage HTML tối đa mỗi 5 phút
export const revalidate = 300;

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50"
      style={{ zoom: 1.5 }}
    >
      <FloatingHearts />
      <TopBar />
      {/* Thanh đăng nhập / đăng ký nhanh */}
      <AuthCtaSection />
      {/* useSearchParams bên trong SearchBar (Header) cần được bọc Suspense */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <HomeNavSearch />
      <main className="space-y-6 md:space-y-8">
        {/* Hero & campaign */}
        <HeroBanner />
        <FeaturedProducts />
        <BundlesBanner />

        {/* Discover categories & benefits */}
        <FeatureIcons />
        <CategoryGrid />
        <ImpactBanner />

        {/* Brands & community */}
        <BrandSlide />
        <CommunitySection />

        {/* Social / reviews & about */}
        <SocialVideoSlider />
        <UserReviews />
        <AboutUs />
      </main>
      <HomeFooter />
    </div>
  );
}
