'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'

type Status = { state: string; paidAccess: boolean; trialStart: string | null; trialEnd: string | null }
export function SubscriptionResult() {
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function check() {
      try {
        const response = await fetch(endpoints.billingStatus + '?refresh=1', { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { window.location.replace('/login?reason=session'); return }
        if (!response.ok) throw new Error('UNAVAILABLE')
        if (!controller.signal.aborted) setStatus(await response.json())
      } catch { if (!controller.signal.aborted) setError('Não foi possível consultar sua assinatura agora. Tente atualizar novamente.') }
      finally { if (!controller.signal.aborted) setBusy(false) }
    }
    void check()
    return () => controller.abort()
  }, [attempt])
  return <div className="space-y-5" aria-busy={busy}>
    <p role="status" className="leading-7 text-muted-foreground">{busy ? 'Consultando sua assinatura…' : status?.paidAccess ? 'Seu acesso está confirmado. Confira os detalhes da sua assinatura.' : status?.state === 'unavailable' ? 'Não foi possível consultar sua assinatura. Nenhuma alteração foi confirmada nesta consulta.' : status?.state === 'expired' ? 'Seu período de acesso terminou. Confira os detalhes da assinatura.' : status?.state === 'blocked' ? 'Seu acesso não está ativo. Consulte sua assinatura para conferir as opções disponíveis.' : 'Ainda não há acesso ativo confirmado. Consulte os detalhes e as opções da sua assinatura.'}</p>
    {!busy && status?.trialEnd && <p className="text-sm text-muted-foreground">Término do teste: {new Date(status.trialEnd).toLocaleString('pt-BR')}.</p>}
    <p role="alert" className="text-sm leading-6 text-red-300">{error}</p>
    <Button disabled={busy} className="min-h-12 w-full" onClick={() => { setBusy(true); setStatus(null); setError(''); setAttempt(a => a + 1) }}>Atualizar confirmação</Button>
    <Link href="/assinatura" className="block min-h-11 py-3 text-primary underline underline-offset-4">Voltar ao plano</Link>
    <Link href="/assinatura/gerenciar" className="block min-h-11 py-3 text-primary underline underline-offset-4">Gerenciar minha assinatura</Link>
    <Link href="/conta" className="block min-h-11 py-3 text-primary underline underline-offset-4">Minha conta</Link>
  </div>
}
