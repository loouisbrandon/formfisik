'use client'
import {useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'

export function VerifyEmail() {
  const [token, setToken] = useState('')
  const [state, setState] = useState<'ready' | 'busy' | 'success' | 'error'>('ready')
  const [message, setMessage] = useFeedbackMessage('Clique abaixo para confirmar seu endereço. O link só pode ser usado uma vez.',errorFallbacks.default)
  useEffect(() => {
    const value = window.location.hash.slice(1)
    window.history.replaceState(null, '', window.location.pathname)
    // Keep the bearer token in memory only; fragments are never sent in HTTP URLs.
    if (value) queueMicrotask(() => setToken(value))
  }, [])
  async function confirm() {
    if (state === 'busy') return
    setState('busy')
    try {
      const response = await fetch(endpoints.verifyEmail, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const result = await response.json()
      setMessage(result.message)
      setState(response.ok ? 'success' : 'error')
      if (response.ok) setToken('')
    } catch { setMessage('Falha de conexão. Tente confirmar novamente.'); setState('error') }
  }
  return <div className="space-y-5" aria-busy={state === 'busy'}>
    <p role="status" aria-live="polite" className="leading-7 text-muted-foreground">{message}</p>
    {state === 'success' && <Link href="/login" className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Entrar na minha conta</Link>}
    {state !== 'success' && <Button className="h-12 w-full" disabled={state === 'busy'} onClick={confirm}>{state === 'busy' ? 'Confirmando…' : 'Confirmar meu e-mail'}</Button>}
    <Link href="/cadastro" className="block text-primary underline underline-offset-4">{state === 'success' ? 'Voltar ao cadastro' : 'Solicitar novo link pelo cadastro'}</Link>
    <Link href="/" className="block text-sm text-muted-foreground underline underline-offset-4">Voltar ao início</Link>
  </div>
}
