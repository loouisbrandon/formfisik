import { Activity, BadgeCheck, Crown, HeartPulse, Target, Users } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Card } from "@/components/ui/card"

const brandItems = ["Under Armour", "Reebok", "adidas", "PUMA", "The North Face", "NIKE"]

const features = [
  { label: "Nutrition Guidance", icon: HeartPulse },
  { label: "Expert Trainers", icon: BadgeCheck },
  { label: "Progress Tracking", icon: Activity },
  { label: "Premium Membership", icon: Crown },
  { label: "Community Support", icon: Users },
  { label: "Next-Level Fitness Space", icon: Target },
]

export function EcosystemSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pb-28 sm:pt-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(182,255,0,0.08),transparent_34%)]"
        aria-hidden
      />

      <Container className="relative space-y-10 sm:space-y-14">
        <div className="relative overflow-hidden rounded-[1.45rem] border border-[#2c313f] bg-[#0d1010] px-4 py-5 sm:px-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(182,255,0,0.04)_0%,rgba(0,0,0,0)_40%)]" />
          <div className="flex gap-6 overflow-x-auto whitespace-nowrap">
            {brandItems.map((brand) => (
              <div
                key={brand}
                className="text-ui flex min-w-max items-center gap-2 text-sm font-semibold tracking-[0.16em] text-zinc-100/85 uppercase sm:text-base"
              >
                <span className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(182,255,0,0.9)]" />
                {brand}
              </div>
            ))}
          </div>
        </div>

        <header className="space-y-4 text-center sm:space-y-5">
          <h2 className="text-heading text-[clamp(2.2rem,7vw,4.3rem)] leading-[0.95] font-semibold tracking-[-0.01em] text-white uppercase">
            Inspired to
            <span className="mt-2 block text-primary">Inspire Your Best Self</span>
          </h2>
          <p className="mx-auto max-w-2xl text-ui text-base leading-7 text-zinc-300 sm:text-lg">
            We are your partner in achieving a healthier, stronger, and more confident version of yourself.
          </p>
        </header>

        <Card className="relative overflow-hidden rounded-[1.7rem] border border-[#343949] bg-[linear-gradient(155deg,#121611_5%,#0d0e10_58%,#0a0a0a_100%)] p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(182,255,0,0.12),transparent_44%)]" />
          <div className="absolute inset-0 border border-white/5" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <li key={feature.label} className="text-ui flex items-center gap-3 text-base font-semibold text-zinc-100 sm:text-lg">
                    <span className="grid size-9 place-items-center rounded-full border border-[#46512f] bg-[#1a1f12] text-primary shadow-[0_0_18px_rgba(182,255,0,0.26)]">
                      <Icon className="size-4" />
                    </span>
                    {feature.label}
                  </li>
                )
              })}
            </ul>

            <div className="relative mx-auto h-[290px] w-full max-w-[360px] overflow-hidden rounded-[1.25rem] border border-[#3a3f4d] bg-[linear-gradient(175deg,#131417_0%,#070708_100%)] sm:h-[360px] lg:h-[380px] lg:max-w-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_18%,rgba(182,255,0,0.18),transparent_36%)]" />
              <div className="absolute -bottom-12 left-1/2 h-[320px] w-[280px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.7),rgba(70,70,70,0.14)_44%,transparent_70%)] blur-[1px]" />
              <div className="absolute bottom-0 left-1/2 h-[220px] w-[180px] -translate-x-1/2 rounded-t-[90px] bg-[linear-gradient(180deg,rgba(14,14,15,0.05),rgba(0,0,0,0.95))]" />
              <div className="absolute inset-x-10 bottom-0 h-12 rounded-t-full bg-black/90" />
              <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-primary/35 bg-primary/10 blur-2xl" />
              <div className="absolute left-6 top-6 h-14 w-14 rounded-full border border-white/20 bg-white/6 blur-xl" />
              <div className="absolute left-4 right-4 top-4 bottom-4 rounded-[1rem] border border-white/6" />
            </div>
          </div>
        </Card>

        <footer className="space-y-4 pt-2 text-center">
          <h3 className="text-heading text-[clamp(2rem,6vw,3.8rem)] leading-[0.95] font-semibold tracking-[-0.01em] uppercase text-white">
            Discover
            <span className="mt-2 block text-primary">What Sets Us Apart</span>
          </h3>
          <p className="text-ui mx-auto max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            We deliver a fitness experience that is truly one-of-a-kind, helping you achieve your goals faster and smarter.
          </p>
        </footer>
      </Container>
    </section>
  )
}
