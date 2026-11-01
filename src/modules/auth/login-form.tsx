'use client'
import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { endpoints } from '@/services/api/endpoints'
import { loginSchema } from './schema'

type Errors = { email?: string[]; password?: string[] }
export function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const feedback = useRef<HTMLDivElement>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const parsed = loginSchema.safeParse(values)
    setMessage('')
    if (!parsed.success) {
      const nextErrors = parsed.error.flatten().fieldErrors
      setErrors(nextErrors)
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const response = await fetch(endpoints.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
      const result = await response.json()
      if (response.ok) {
        // Server owns the destination; do not accept arbitrary returnTo URLs.
        setValues({ email: '', password: '' })
        window.location.replace(result.destination === '/dashboard' ? '/dashboard' : '/conta')
        return
      }
      setErrors(result.errors || {})
      setMessage(result.message || 'Não foi possível entrar. Tente novamente.')
    } catch { setMessage('Falha de conexão. Confira sua rede e tente novamente.') }
    setBusy(false)
    requestAnimationFrame(() => feedback.current?.focus())
  }
  return <form method="post" action={endpoints.login} onSubmit={submit} noValidate aria-busy={busy} className="space-y-5">
    <div className="space-y-2">
      <label htmlFor="email" className="text-ui text-base font-semibold">E-mail</label>
      <Input id="email" type="email" name="email" autoComplete="username" required maxLength={254} disabled={busy} className="h-12 text-base"
        value={values.email} onChange={event => { setValues(v => ({ ...v, email: event.target.value })); setErrors(e => ({ ...e, email: undefined })) }}
        aria-invalid={!!errors.email} aria-describedby="email-error" />
      <p id="email-error" className="text-sm text-red-300">{errors.email?.[0]}</p>
    </div>
    <div className="space-y-2">
      <label htmlFor="password" className="text-ui text-base font-semibold">Senha</label>
      <div className="relative">
        <Input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} disabled={busy}
          className="h-12 pr-14 text-base" value={values.password}
          onChange={event => { setValues(v => ({ ...v, password: event.target.value })); setErrors(e => ({ ...e, password: undefined })) }}
          aria-invalid={!!errors.password} aria-describedby="password-error" />
        <Button type="button" variant="ghost" disabled={busy} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible}
          onClick={() => setVisible(v => !v)} className="absolute right-1 top-1 h-10 w-11 text-muted-foreground">
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      <p id="password-error" className="text-sm text-red-300">{errors.password?.[0]}</p>
    </div>
    <div ref={feedback} tabIndex={-1} role="alert" className="text-sm leading-6 text-red-300 outline-none">{message}</div>
    <Button type="submit" disabled={busy} className="font-ui h-12 w-full text-base font-semibold uppercase tracking-wider hover:bg-primary/90">
      {busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {busy ? 'Entrando…' : 'Entrar na minha conta'}
    </Button>
    <p className="text-sm leading-6 text-muted-foreground">Ainda não confirmou seu e-mail? Abra o link recebido ou <Link href="/cadastro" className="text-primary underline underline-offset-4">envie o cadastro novamente</Link>.</p>
    <Link href="/esqueci-senha" className="inline-block min-h-11 py-3 text-sm text-primary underline underline-offset-4">Esqueci minha senha</Link>
  </form>
}
