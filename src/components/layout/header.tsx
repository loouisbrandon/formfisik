"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  { ssr: false }
)

const navItems = ["Inicio", "Recursos", "Para profissionais", "Para alunos", "Planos"]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <Container className="pt-4 sm:pt-5">
        <div className="flex h-20 items-center justify-between gap-3 sm:h-24 sm:gap-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/nomelogo.png"
            alt="FORMFISIK"
            width={340}
            height={62}
            priority
            className="h-auto w-[112px] sm:w-[180px] lg:w-[220px]"
          />
        </Link>

        <nav className="hidden items-center rounded-full border border-white/12 bg-black/70 px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl xl:flex lg:px-4">
          {navItems.map((item) => (
            <a
              key={item}
              href={item === "Planos" ? "/assinatura" : "#"}
              className="text-ui rounded-full px-4 py-2 text-sm font-medium tracking-wide text-white/90 transition-colors hover:text-white lg:px-6"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-8 w-8 border-white/25 bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white xl:hidden"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <div className="hidden sm:block"><ThemeToggle /></div>
          <Link href="/login" className="text-ui inline-flex min-h-11 items-center px-2 text-sm font-semibold text-white underline-offset-4 hover:underline">Entrar</Link>
          <Link href="/cadastro" className="text-ui inline-flex min-h-11 items-center rounded-lg border border-white/25 bg-black/30 px-3 text-xs font-semibold uppercase text-white hover:bg-black/50 sm:text-sm">
            Criar conta
          </Link>
        </div>
        </div>

        {isMobileMenuOpen ? (
          <nav className="mb-2 rounded-2xl border border-white/15 bg-black/70 p-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl xl:hidden">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Planos" ? "/assinatura" : "#"}
                className="text-ui block rounded-xl px-3 py-2 text-sm font-medium tracking-wide text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
        ) : null}
      </Container>
    </header>
  )
}
