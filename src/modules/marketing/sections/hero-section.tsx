import Image from "next/image"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-14 pt-12 sm:pb-20 sm:pt-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-7">
          <p className="text-ui text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Performance sem limites
          </p>

          <h1 className="text-heading max-w-xl text-4xl font-semibold uppercase leading-[1.02] tracking-[0.07em] text-foreground sm:text-5xl lg:text-6xl">
            Evolua. Supere. <span className="text-primary">Seja FF.</span>
          </h1>

          <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            A plataforma premium para consultoria fitness com gestao de alunos, criacao de treinos
            e entregas profissionais.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="text-ui h-11 px-6 text-base uppercase tracking-widest">Comecar agora</Button>
            <Button
              variant="outline"
              className="text-ui h-11 px-6 text-base uppercase tracking-widest"
            >
              Sou profissional
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
          <Image
            src="/images/hero-mobile-mock.png"
            alt="Mock mobile FORMFISIK"
            width={1080}
            height={2340}
            priority
            className="h-auto w-full drop-shadow-[0_26px_68px_rgba(0,0,0,0.7)]"
          />
        </div>
      </Container>
    </section>
  )
}
