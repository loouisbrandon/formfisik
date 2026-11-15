'use client'
import {useFeedbackError,useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import { FormEvent, useRef, useState } from 'react'
import { LoaderCircle, MailCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { recoverySchema } from './recovery-schema'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useFeedbackError(errorFallbacks.login)
  const [fieldError, setFieldError] = useState('')
  const [message, setMessage] = useFeedbackMessage('',errorFallbacks.login)
  const feedback = useRef<HTMLDivElement>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const parsed = recoverySchema.safeParse({ email })
    setError('')
    if (!parsed.success) { setFieldError('Informe um e-mail válido.'); document.getElementById('email')?.focus(); return }
    setFieldError('')
    setBusy(true)
    try {
      const response = await fetch(endpoints.forgotPassword, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
      const result = await response.json()
      if (response.ok) { setSent(true); setEmail(''); setMessage(result.message) }
      else setError(result.message || 'Não foi possível solicitar. Tente novamente.')
    } catch { setError('Falha de conexão. Confira sua rede e tente novamente.') }
    finally { setBusy(false); requestAnimationFrame(() => feedback.current?.focus()) }
  }
  if (sent) return <div ref={feedback} tabIndex={-1} role="status" className="space-y-5 outline-none">
    <MailCheck className="size-9 text-primary" aria-hidden="true" />
    <h2 className="text-heading text-3xl">Confira seu e-mail</h2>
    <p className="leading-7 text-muted-foreground">{message}</p>
    <p className="text-sm leading-6 text-muted-foreground">O link vale por 30 minutos e só pode ser usado uma vez. Solicitar um link não altera sua senha nem encerra suas sessões.</p>
    <Button variant="outline" onClick={() => { setSent(false); setError('') }} className="min-h-12 w-full">Solicitar outro link</Button>
  </div>
  return <form method="post" action={endpoints.forgotPassword} noValidate onSubmit={submit} aria-busy={busy} className="space-y-5">
    <p className="leading-7 text-muted-foreground">Informe o e-mail da sua conta. Enviaremos as orientações para escolher uma nova senha.</p>
    <div className="space-y-2">
      <label htmlFor="email" className="text-ui font-semibold">E-mail</label>
      <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} disabled={busy} value={email}
        onChange={event => { setEmail(event.target.value); setFieldError('') }} className="h-12 text-base" aria-invalid={!!fieldError} aria-describedby="email-error" />
      <p id="email-error" className="text-sm text-red-300">{fieldError}</p>
    </div>
    <div ref={feedback} role="alert" tabIndex={-1} className="text-sm leading-6 text-red-300 outline-none">{error}</div>
    <Button type="submit" disabled={busy} className="font-ui h-12 w-full text-base font-semibold hover:bg-primary/90">
      {busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}{busy ? 'Enviando…' : 'Enviar link de recuperação'}
    </Button>
  </form>
}
