'use client'
import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { invalidResetLink, resetPasswordSchema } from './recovery-schema'

type Phase = 'checking' | 'ready' | 'unavailable' | 'invalid' | 'success'
export function ResetPasswordForm() {
  const [token, setToken] = useState('')
  const [phase, setPhase] = useState<Phase>('checking')
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const [values, setValues] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<{ password?: string[]; confirmPassword?: string[] }>({})
  const [message, setMessage] = useState('')
  const feedback = useRef<HTMLDivElement>(null)
  async function check(value: string, signal?: AbortSignal) {
    try {
      const response = await fetch(endpoints.validateReset, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: value }), signal })
      if (signal?.aborted) return
      setPhase(response.ok ? 'ready' : response.status === 400 ? 'invalid' : 'unavailable')
    } catch { if (!signal?.aborted) setPhase('unavailable') }
  }
  const tokenRef = useRef('')
  useEffect(() => {
    const controller = new AbortController()
    // Preserve in memory through StrictMode effect replay, never in storage/URL/query.
    const fragment = window.location.hash.slice(1)
    if (fragment) tokenRef.current = fragment
    window.history.replaceState(null, '', window.location.pathname)
    queueMicrotask(() => {
      if (controller.signal.aborted) return
      setToken(tokenRef.current)
      void check(tokenRef.current, controller.signal)
    })
    return () => controller.abort()
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const parsed = resetPasswordSchema.safeParse({ token, ...values })
    setMessage('')
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      setErrors(fields)
      document.getElementById(Object.keys(fields)[0])?.focus()
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const response = await fetch(endpoints.resetPassword, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
      const result = await response.json()
      if (response.ok) {
        setValues({ password: '', confirmPassword: '' }); setToken(''); tokenRef.current = ''; setPhase('success'); setMessage(result.message)
      } else if (response.status === 400 && !result.errors) { setPhase('invalid'); setValues({ password: '', confirmPassword: '' }) }
      else { setErrors(result.errors || {}); setMessage(result.message || 'Não foi possível alterar. Tente novamente.') }
    } catch { setMessage('Falha de conexão. Tente novamente. Se a alteração já foi concluída, entre com a nova senha.') }
    finally { setBusy(false); requestAnimationFrame(() => feedback.current?.focus()) }
  }
  if (phase === 'checking') return <p role="status" className="text-muted-foreground">Verificando seu link…</p>
  if (phase === 'invalid') return <div ref={feedback} tabIndex={-1} role="alert" className="space-y-5 outline-none">
    <p className="leading-7 text-muted-foreground">{invalidResetLink}</p>
    <Link href="/esqueci-senha" className="inline-block min-h-11 py-3 text-primary underline underline-offset-4">Solicitar novo link</Link>
  </div>
  if (phase === 'unavailable') return <div role="alert" className="space-y-5">
    <p className="leading-7 text-muted-foreground">Não foi possível verificar seu link agora. Confira a conexão e tente novamente.</p>
    <Button className="min-h-12" onClick={() => { setPhase('checking'); void check(token) }}>Tentar novamente</Button>
  </div>
  if (phase === 'success') return <div ref={feedback} tabIndex={-1} role="status" className="space-y-5 outline-none">
    <h2 className="text-heading text-3xl">Senha alterada</h2>
    <p className="leading-7 text-muted-foreground">{message}</p>
    <Link href="/login?reason=reset" className="font-ui flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Entrar com a nova senha</Link>
  </div>
  return <form method="post" action={endpoints.resetPassword} noValidate onSubmit={submit} aria-busy={busy} className="space-y-5">
    <p className="leading-7 text-muted-foreground">Escolha uma senha de 12 a 128 caracteres. Ao confirmar, todas as sessões anteriores serão encerradas.</p>
    {(['password', 'confirmPassword'] as const).map(name => <div key={name} className="space-y-2">
      <label htmlFor={name} className="text-ui font-semibold">{name === 'password' ? 'Nova senha' : 'Confirme a nova senha'}</label>
      <div className="relative">
        <Input id={name} name={name} required type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} disabled={busy}
          value={values[name]} onChange={event => { setValues(v => ({ ...v, [name]: event.target.value })); setErrors(e => ({ ...e, [name]: undefined })) }}
          className={`h-12 text-base ${name === 'password' ? 'pr-14' : ''}`} aria-invalid={!!errors[name]} aria-describedby={`${name}-error`} />
        {name === 'password' && <Button type="button" variant="ghost" className="absolute right-1 top-1 h-10 w-11" disabled={busy} aria-pressed={visible} aria-label={visible ? 'Ocultar senhas' : 'Mostrar senhas'} onClick={() => setVisible(v => !v)}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>}
      </div>
      <p id={`${name}-error`} className="text-sm text-red-300">{errors[name]?.[0]}</p>
    </div>)}
    <div ref={feedback} role="alert" tabIndex={-1} className="text-sm leading-6 text-red-300 outline-none">{message}</div>
    <Button type="submit" disabled={busy} className="font-ui h-12 w-full text-base font-semibold hover:bg-primary/90">
      {busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}{busy ? 'Alterando…' : 'Salvar nova senha'}
    </Button>
  </form>
}
