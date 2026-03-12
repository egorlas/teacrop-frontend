import { TopBar } from "@/components/home/TopBar";
import { Header } from "@/components/home/Header";
import { NavMenu } from "@/components/home/NavMenu";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeatureIcons } from "@/components/home/FeatureIcons";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BrandSlide } from "@/components/home/BrandSlide";
import { AboutUs } from "@/components/home/AboutUs";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingHearts } from "@/components/home/FloatingHearts";

// ISR: regenerate homepage HTML tối đa mỗi 5 phút
export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50/80 to-pink-50">
      <FloatingHearts />
      <TopBar />
      <Header />
      <NavMenu />
      <main>
        <HeroBanner />
        <FeatureIcons />
        <CategoryGrid />
        <BrandSlide />
        <AboutUs />
      </main>
      <HomeFooter />
    </div>
  );
}
