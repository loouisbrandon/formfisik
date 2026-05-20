"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  { ssr: false }
)

const navItems = ["Inicio", "Recursos", "Para profissionais", "Para alunos", "Planos"]

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <Container className="flex h-24 items-center justify-between gap-4 pt-4 sm:h-28 sm:pt-5">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/nomelogo.png"
            alt="FORMFISIK"
            width={340}
            height={62}
            priority
            className="h-auto w-[148px] sm:w-[180px] lg:w-[220px]"
          />
        </Link>

        <nav className="hidden items-center rounded-full border border-white/12 bg-black/70 px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl md:flex lg:px-4">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-ui rounded-full px-4 py-2 text-sm font-medium tracking-wide text-white/90 transition-colors hover:text-white lg:px-6"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="outline" className="text-ui border-white/25 bg-black/30 text-white uppercase tracking-wider hover:bg-black/50 hover:text-white">
            Baixar App
          </Button>
        </div>
      </Container>
    </header>
  )
}
