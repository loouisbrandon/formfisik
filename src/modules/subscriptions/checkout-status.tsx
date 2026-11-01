'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { proPlan } from './plan'
export function CheckoutStatus() {
  const [state, setState] = useState<'loading' | 'unavailable' | 'error' | 'forbidden' | 'ready' | 'ineligible' | 'starting'>('loading')
  const [message, setMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function check() {
      try {
        const response = await fetch(endpoints.checkoutAvailability, { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { window.location.replace('/login?reason=session'); return }
        if (response.status === 403) { setState('forbidden'); return }
        const result = await response.json()
        if (!controller.signal.aborted) setState(response.ok && ['unavailable','ready','ineligible'].includes(result.status) ? result.status : 'error')
      } catch { if (!controller.signal.aborted) setState('error') }
    }
    void check()
    return () => controller.abort()
  }, [attempt])
  async function start() {
    if (state !== 'ready') return
    setState('starting'); setMessage('')
    try {
      const response = await fetch(endpoints.checkout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const result = await response.json()
      if (response.status === 401) { window.location.replace('/login?reason=session'); return }
      if (!response.ok) { setState(response.status === 409 ? 'ineligible' : 'error'); setMessage(response.status === 409 ? 'Sua contratação já foi iniciada ou seu teste já foi utilizado. Consulte sua assinatura para continuar.' : 'Não foi possível abrir a página de pagamento. Tente novamente em instantes.'); return }
      const url = new URL(result.url)
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.port || url.username || url.password) throw new Error('INVALID_CHECKOUT_URL')
      window.location.assign(url.href)
    } catch { setState('error'); setMessage('Não foi possível abrir a página de pagamento. Atualize a disponibilidade antes de tentar novamente.') }
  }
  return <div className="space-y-4" aria-busy={state === 'loading' || state === 'starting'}>
    <Button onClick={start} disabled={state !== 'ready'} aria-describedby="checkout-status" className="font-ui min-h-12 w-full text-base font-semibold">
      {(state === 'loading' || state === 'starting') && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {state === 'starting' ? 'Abrindo página de pagamento…' : `Iniciar teste de ${proPlan.trialDays} dias`}
    </Button>
    <p id="checkout-status" role={state === 'error' ? 'alert' : 'status'} className="text-sm leading-6 text-muted-foreground">
      {message || (state === 'loading' ? 'Verificando disponibilidade…' : state === 'starting' ? 'Aguarde enquanto abrimos a página segura de pagamento.' : state === 'ready'
        ? 'Ambiente de testes. Use somente cartões de teste na página segura da Stripe.' : state === 'error'
        ? 'Não foi possível verificar a disponibilidade agora. Atualize o estado antes de tentar novamente.' : state === 'ineligible'
        ? 'Seu teste já foi utilizado ou existe uma contratação em andamento. Consulte sua assinatura para continuar.'
        : state === 'forbidden' ? 'A contratação não está disponível para este perfil.'
        : 'Contratação indisponível no momento. Tente novamente mais tarde. Nenhum teste ou cobrança foi iniciado.')}
    </p>
    {(state === 'error') && <Button variant="outline" className="min-h-11 w-full" onClick={() => { setState('loading'); setMessage(''); setAttempt(a => a + 1) }}>Tentar verificar novamente</Button>}
    <Link href="/assinatura/retorno" className="inline-block min-h-11 py-3 text-sm text-primary underline underline-offset-4">Consultar estado da assinatura</Link>
  </div>
}
