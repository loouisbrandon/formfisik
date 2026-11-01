'use client'
import { useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { SessionStatus } from '@/modules/auth/session-status'
import { ProfessionalNotice,ProfessionalNoticeProvider } from './notice'
import { pageTitle } from './navigation'
export function ProfessionalShell({ fullName, professional, children }: { fullName: string; professional: boolean; children: ReactNode }) {
  const pathname = usePathname()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  function close() { dialog.current?.close(); setOpen(false); trigger.current?.focus() }
  function show() { trigger.current = document.activeElement as HTMLElement; dialog.current?.showModal(); setOpen(true) }
  return <ProfessionalNoticeProvider><div className="auth-surface min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
    <a href="#app-content" className="sr-only z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Ir para o conteúdo</a>
    <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-r border-border bg-background lg:block"><Sidebar pathname={pathname} professional={professional} /></aside>
    <dialog ref={dialog} id="professional-menu" aria-label="Menu profissional" onCancel={event => { event.preventDefault(); close() }} onClose={() => setOpen(false)} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(20rem,100%)] max-w-full overflow-y-auto border-r border-border bg-background text-foreground backdrop:bg-black/70"><div className="flex justify-end px-5 pt-4"><Button variant="outline" onClick={close}>Fechar menu</Button></div><Sidebar pathname={pathname} professional={professional} onNavigate={close} /></dialog>
    <div className="min-w-0"><Topbar title={pageTitle(pathname)} fullName={fullName} onMenu={show} menuOpen={open} /><main id="app-content" tabIndex={-1} className="min-w-0 px-4 py-7 outline-none sm:px-8 sm:py-10"><div className="mx-auto max-w-7xl"><ProfessionalNotice />{children}</div></main><div className="px-4 pb-4 sm:px-8"><SessionStatus /></div></div>
  </div></ProfessionalNoticeProvider>
}
