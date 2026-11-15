import Image from "next/image"

import { Container } from "@/components/layout/container"
import Link from "next/link"
import gymBackground from "@/styles/gymff.png"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden pb-8 pt-28 sm:min-h-[92vh] sm:pb-12 sm:pt-36">
      <Image
        src={gymBackground}
        alt="Academia FORMFISIK"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.56)_42%,rgba(0,0,0,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,255,255,0.08),transparent_32%)]" />

      <Container className="relative z-10 grid items-end gap-7 pb-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-8">
        <div className="space-y-4">
          <p className="text-ui text-xs font-medium uppercase tracking-[0.24em] text-zinc-100/90 sm:text-sm">
            Plataforma online | Consultoria fitness premium
          </p>

          <h1 className="max-w-4xl text-[clamp(2rem,5.5vw,4.2rem)] font-medium uppercase leading-[0.96] tracking-[0.01em] text-white">
            A formula da evolucao
          </h1>

          <p className="max-w-3xl pt-2 text-ui text-base leading-7 text-zinc-200 sm:text-[1.7rem] sm:leading-[1.35]">
            A FORMFISIK conecta personal trainers e alunos com treinos inteligentes, gestao profissional e
            entrega premium para resultados reais.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-[260px] lg:justify-self-end lg:pb-2">
          <Link href="/cadastro" className="text-ui inline-flex items-center justify-center h-12 rounded-xl bg-primary text-base font-semibold uppercase tracking-[0.1em] text-primary-foreground shadow-[0_10px_24px_rgba(0,0,0,0.3)] hover:bg-primary/90 sm:h-13 sm:text-lg">
            Comecar agora
          </Link>
          <Link href="/cadastro"
            className="text-ui inline-flex items-center justify-center h-12 rounded-xl border-white/45 bg-[#f4f4f4] text-base font-semibold uppercase tracking-[0.1em] text-black shadow-[0_10px_24px_rgba(0,0,0,0.24)] hover:bg-[#ececec] sm:h-13 sm:text-lg"
          >
            Sou profissional
          </Link>
        </div>
      </Container>
    </section>
  )
}
