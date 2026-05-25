"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"
import { useSyncExternalStore, useState } from "react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const AUTH_USER_KEY = "formfisik-auth-user"

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  { ssr: false }
)

const navItems = ["Inicio", "Recursos", "Para profissionais", "Para alunos", "Planos"]

function readAuthUserName() {
  if (typeof window === "undefined") {
    return ""
  }

  const rawAuthUser = window.localStorage.getItem(AUTH_USER_KEY)
  if (!rawAuthUser) {
    return ""
  }

  try {
    const parsed = JSON.parse(rawAuthUser) as { fullName?: string }
    return parsed.fullName?.trim() || "Usuario"
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY)
    return ""
  }
}

function subscribeToAuthChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleChange = () => onStoreChange()
  window.addEventListener("storage", handleChange)
  window.addEventListener("formfisik-auth-change", handleChange)

  return () => {
    window.removeEventListener("storage", handleChange)
    window.removeEventListener("formfisik-auth-change", handleChange)
  }
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const authUserName = useSyncExternalStore(subscribeToAuthChange, readAuthUserName, () => "")

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_USER_KEY)
    window.dispatchEvent(new Event("formfisik-auth-change"))
    setIsMobileMenuOpen(false)
  }

  const userInitial = authUserName ? authUserName.charAt(0).toUpperCase() : "U"

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
            className="h-auto w-[132px] sm:w-[180px] lg:w-[220px]"
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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-8 w-8 border-white/25 bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white md:hidden"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <ThemeToggle />
          {authUserName ? (
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 p-1 pr-1.5 backdrop-blur-xl">
              <div className="hidden items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 sm:flex">
                <span className="text-ui inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {userInitial}
                </span>
                <span className="text-ui max-w-28 truncate text-xs font-semibold uppercase tracking-wider text-white/90">
                  {authUserName}
                </span>
              </div>
              <Button
                variant="outline"
                className="text-ui h-8 rounded-full border-white/25 bg-white/10 px-2.5 text-white uppercase tracking-wider hover:bg-white/20 hover:text-white sm:px-3"
                onClick={handleLogout}
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="text-ui h-8 border-white/25 bg-black/30 px-2.5 text-[11px] text-white uppercase tracking-wider hover:bg-black/50 hover:text-white sm:h-9 sm:px-4 sm:text-sm"
              >
                Login/Cadastro
              </Button>
            </Link>
          )}
        </div>
        </div>

        {isMobileMenuOpen ? (
          <nav className="mb-2 rounded-2xl border border-white/15 bg-black/70 p-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl md:hidden">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
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
