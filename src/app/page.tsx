import { Header } from "@/components/layout/header"
import { HeroSection } from "@/modules/marketing/sections/hero-section"
import { OQueOferecemosSection } from "@/modules/marketing/sections/o-que-oferecemos-section"
import { OfferingsMarqueeSection } from "@/modules/marketing/sections/offerings-marquee-section"

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <OfferingsMarqueeSection />
        <OQueOferecemosSection />
      </main>
    </>
  )
}
