import Link from "next/link"

import { Container } from "@/components/layout/container"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

const navItems = ["Inicio", "Recursos", "Para profissionais", "Para alunos", "Planos"]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="text-heading text-lg tracking-[0.22em] text-foreground">
          <span className="text-primary">FF</span> FORMFISIK
        </Link>

        <nav className="hidden items-center gap-6 text-ui text-sm uppercase tracking-wider text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition-colors hover:text-foreground">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" className="text-ui uppercase tracking-wider">
            Baixar App
          </Button>
        </div>
      </Container>
    </header>
  )
}
