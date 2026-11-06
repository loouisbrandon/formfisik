'use client'
import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { endpoints } from '@/services/api/endpoints'
import { loginSchema } from './schema'
import {notifySessionChanged} from './session-change'

import styles from './login-visual.module.css'

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
        notifySessionChanged()
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
  return <form method="post" action={endpoints.login} onSubmit={submit} noValidate aria-busy={busy} className={styles.form}>
    <div className="space-y-2">
      <label htmlFor="email" className={styles.fieldLabel}>E-mail</label>
      <div className={styles.field}><Mail aria-hidden="true" className={styles.fieldIcon} /><Input id="email" type="email" name="email" autoComplete="username" required maxLength={254} disabled={busy} className={styles.input} placeholder="E-mail"
        value={values.email} onChange={event => { setValues(v => ({ ...v, email: event.target.value })); setErrors(e => ({ ...e, email: undefined })) }}
        aria-invalid={!!errors.email} aria-describedby="email-error" /></div>
      <p id="email-error" className="text-sm text-red-300">{errors.email?.[0]}</p>
    </div>
    <div className="space-y-2">
      <label htmlFor="password" className={styles.fieldLabel}>Senha</label>
      <div className={styles.field}>
        <LockKeyhole aria-hidden="true" className={styles.fieldIcon} /><Input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} disabled={busy}
          className={styles.input} placeholder="Senha" value={values.password}
          onChange={event => { setValues(v => ({ ...v, password: event.target.value })); setErrors(e => ({ ...e, password: undefined })) }}
          aria-invalid={!!errors.password} aria-describedby="password-error" />
        <Button type="button" variant="ghost" disabled={busy} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible}
          onClick={() => setVisible(v => !v)} className={styles.visibility}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      <p id="password-error" className="text-sm text-red-300">{errors.password?.[0]}</p>
    </div>
    <div className={styles.formOptions}><span><ShieldCheck size={16} aria-hidden="true" /> Sessão protegida</span><Link href="/esqueci-senha">Esqueci minha senha</Link></div>
    <div ref={feedback} tabIndex={-1} role="alert" className="text-sm leading-6 text-red-300 outline-none">{message}</div>
    <Button type="submit" disabled={busy} className={styles.submit}>
      {busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {busy ? 'Entrando…' : 'Entrar na minha conta'}<ArrowRight aria-hidden="true" />
    </Button>
    <p className={styles.verification}>Ainda não confirmou seu e-mail? Abra o link recebido ou <Link href="/cadastro" className={styles.inlineLink}>envie o cadastro novamente</Link>.</p>
  </form>
}
