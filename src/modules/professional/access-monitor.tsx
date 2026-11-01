'use client'
import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
export function AccessUnavailable() {
  return <section role="status" className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border p-6"><h1 className="text-heading text-3xl">Não foi possível confirmar seu acesso</h1><p className="text-sm leading-7 text-muted-foreground">A verificação da assinatura está indisponível. Tente novamente ou consulte sua assinatura.</p><div className="flex flex-wrap gap-4"><Button onClick={() => window.location.reload()}>Tentar novamente</Button><Link className="inline-flex min-h-11 items-center text-primary underline" href="/assinatura">Consultar FormFisik Pro</Link></div></section>
}
// Passive checks never renew idle sessions. Every protected server operation still authorizes independently.
export function DashboardAccessMonitor({ children }: { children: ReactNode }) {
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    let pending = false
    async function check() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try {
        const response = await fetch('/api/professional/dashboard', { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { setUnavailable(true); window.location.replace('/login?reason=session') }
        else if (response.status === 403) { setUnavailable(true); const result = await response.json(); window.location.replace(result.destination === '/conta' ? '/conta' : result.destination === '/assinatura' ? '/assinatura' : '/assinatura/gerenciar') }
        else setUnavailable(!response.ok)
      } catch { if (!controller.signal.aborted) setUnavailable(true) }
      finally { pending = false }
    }
    void check()
    const timer = window.setInterval(check, 60000)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', check); window.removeEventListener('pageshow', check); document.removeEventListener('visibilitychange', check) }
  }, [])
  return unavailable ? <AccessUnavailable /> : children
}
