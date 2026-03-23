import { Be_Vietnam_Pro } from "next/font/google";
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
import { AboutUs } from "@/components/home/AboutUs";
import { AboutVideoSection } from "@/components/home/AboutVideoSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingHearts } from "@/components/home/FloatingHearts";
import { HomeHeroImageSlider } from "@/components/home/HomeHeroImageSlider";
import { TeaFeelingPromoSection } from "@/components/home/TeaFeelingPromoSection";

// ISR: regenerate homepage HTML tối đa mỗi 5 phút
export const revalidate = 300;

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function HomePage() {
  return (
    <div
      className={`${beVietnamPro.className} min-h-screen bg-white via-rose-50/80 to-pink-50`}
      style={{ zoom: 1 }}
    >
      <FloatingHearts />
      <main className="space-y-6 md:space-y-8">
        <HomeHeroImageSlider />

        <TeaFeelingPromoSection />

        {/* Hero & campaign */}
        {/* <HeroBanner /> */}
        <FeaturedProducts />

        <BundlesBanner />

        {/* Discover categories & benefits */}
        {/* <FeatureIcons /> */}
        {/* <CategoryGrid /> */}
        {/* <ImpactBanner /> */}

        {/* Brands & community */}
        {/* <BrandSlide /> */}
        {/* <CommunitySection /> */}
        
        <AboutVideoSection />
        {/* Social / reviews & about */}
        <SocialVideoSlider />

        
        {/* <UserReviews /> */}
        {/* <AboutUs /> */}
      </main>
      <HomeFooter />
    </div>
  );
}
