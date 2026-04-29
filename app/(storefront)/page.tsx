import Hero from "@/components/homepage/Hero";
import FeaturedCollections from "@/components/homepage/FeaturedCollections";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import TrustBadges from "@/components/homepage/TrustBadges";
import NewArrivals from "@/components/homepage/NewArrivals";
import Testimonials from "@/components/homepage/Testimonials";
import Storytelling from "@/components/homepage/Storytelling";
import PromoBanners from "@/components/homepage/PromoBanners";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <FeaturedProducts />
      <PromoBanners />
      <TrustBadges />
      <NewArrivals />
      <Testimonials />
      <Storytelling />
    </>
  );
}
