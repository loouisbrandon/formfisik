import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/modules/auth/logout-button'
export function Topbar({ title, fullName, onMenu, menuOpen }: { title: string; fullName: string; onMenu: () => void; menuOpen: boolean }) {
  return <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-4 sm:px-8">
    <div className="flex min-w-0 items-center gap-3"><Button variant="outline" className="min-h-11 lg:hidden" onClick={onMenu} aria-label="Abrir navegação" aria-expanded={menuOpen} aria-controls="professional-menu"><Menu aria-hidden="true" className="size-5" /></Button><p className="font-ui text-lg font-semibold">{title}</p></div>
    <div className="flex min-w-0 flex-wrap items-center gap-3"><Link href="/conta" aria-label="Abrir minha conta" className="max-w-52 break-words rounded-lg py-2 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">{fullName}</Link><div className="lg:hidden"><LogoutButton /></div></div>
  </header>
}
