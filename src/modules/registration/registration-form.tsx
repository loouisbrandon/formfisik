'use client'
import {validationErrors} from '@/modules/feedback/service'
import {friendlyFieldError} from '@/modules/feedback/messages'
import {useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'

import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LoaderCircle, MailCheck, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { registrationSchema } from './schema'

import { PasswordStrength } from '@/modules/auth/password-strength'

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword'
const fields: { name: Field; label: string; type: string; autoComplete: string; hint?: string }[] = [
  { name: 'fullName', label: 'Nome completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'E-mail profissional', type: 'email', autoComplete: 'email', hint: 'Você precisará confirmar este endereço.' },
  { name: 'password', label: 'Senha', type: 'password', autoComplete: 'new-password', hint: 'Use de 8 a 128 caracteres, com uma letra maiúscula, uma minúscula e um caractere especial.' },
  { name: 'confirmPassword', label: 'Confirme sua senha', type: 'password', autoComplete: 'new-password' },
]

export function RegistrationForm() {
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<Field, string[]>>>({})
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState({ password: false, confirmPassword: false })
  const [message, setMessage] = useFeedbackMessage('',errorFallbacks.default)
  const [success, setSuccess] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)
  const passwordsMatch = values.password.length > 0 && values.password === values.confirmPassword
  const passwordsDiffer = values.confirmPassword.length > 0 && !passwordsMatch

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setMessage('')
    const form = new FormData(event.currentTarget)
    const parsed = registrationSchema.safeParse({ ...values, website: form.get('website') || '' })
    if (!parsed.success) {
      const nextErrors = parsed.error.flatten().fieldErrors
      setErrors(validationErrors(nextErrors))
      const field = Object.keys(nextErrors)[0]
      document.getElementById(field)?.focus()
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const response = await fetch(endpoints.register, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
      const data = await response.json()
      if (!response.ok) {
        setErrors(validationErrors(data.errors || {}))
        setMessage(data.message || 'Não foi possível concluir. Tente novamente.')
      } else {
        setValues({ fullName: '', email: '', password: '', confirmPassword: '' })
        setSuccess(true)
        setMessage(data.message)
      }
    } catch { setMessage('Não foi possível conectar. Confira sua conexão e tente novamente.') }
    finally {
      setBusy(false)
      requestAnimationFrame(() => feedback.current?.focus())
    }
  }
  if (success) return (
    <div ref={feedback} tabIndex={-1} className="space-y-5 outline-none" role="status">
      <MailCheck className="size-10 text-primary" aria-hidden="true" />
      <h2 className="text-heading text-3xl">Confira seu e-mail</h2>
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">O link vale por 30 minutos. Para receber outro, envie novamente o cadastro. Apenas o cadastro confirmado será utilizado.</p>
      <Button variant="outline" className="h-11 w-full" onClick={() => { setSuccess(false); setMessage('') }}>Enviar cadastro novamente</Button>
      <Link href="/login" className="block text-center text-primary underline underline-offset-4">Voltar para o login</Link>
    </div>
  )
  return (
    <form method="post" action={endpoints.register} onSubmit={submit} noValidate className="space-y-5" aria-busy={busy}>
      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className="text-ui text-base font-semibold">{field.label}</label>
          <div className="relative">
          <Input id={field.name} name={field.name} type={field.type === 'password' && visible[field.name as keyof typeof visible] ? 'text' : field.type} autoComplete={field.autoComplete}
            required disabled={busy} maxLength={field.name === 'email' ? 254 : field.name === 'fullName' ? 120 : 128}
            value={values[field.name]} onChange={event => {
              setValues(v => ({ ...v, [field.name]: event.target.value }))
              setErrors(current => ({ ...current, [field.name]: undefined }))
            }}
            className={`h-12 text-base ${field.type === 'password' ? `pr-14 ${passwordsMatch ? 'border-[#a9e600]! focus-visible:border-[#a9e600]! focus-visible:ring-[#a9e600]/25' : ''}` : ''}`} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-hint ${field.name}-error${field.type === 'password' ? ' password-match' : ''}`} />
          {field.type === 'password' && <button type="button" disabled={busy} aria-controls={field.name} aria-pressed={visible[field.name as keyof typeof visible]} aria-label={`${visible[field.name as keyof typeof visible] ? 'Ocultar' : 'Mostrar'} ${field.name === 'password' ? 'senha' : 'confirmação da senha'}`} onClick={() => setVisible(current => ({ ...current, [field.name]: !current[field.name as keyof typeof current] }))} className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50">{visible[field.name as keyof typeof visible] ? <EyeOff size={20} aria-hidden="true"/> : <Eye size={20} aria-hidden="true"/>}</button>}
          </div>
          <p id={`${field.name}-hint`} className="text-xs leading-5 text-muted-foreground">{field.hint}</p>
          {field.name === 'password' && <PasswordStrength password={values.password} />}
          {field.name === 'confirmPassword' && <p id="password-match" aria-live="polite" className={`text-xs leading-5 ${passwordsMatch ? 'text-[#a9e600]' : 'text-muted-foreground'}`}>{passwordsMatch ? 'As senhas coincidem.' : passwordsDiffer ? 'As senhas ainda não coincidem.' : ''}</p>}
          <p id={`${field.name}-error`} className="text-sm text-red-300">{friendlyFieldError(errors[field.name]?.[0])}</p>
        </div>
      ))}
      <div hidden aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" autoComplete="off" tabIndex={-1} /></div>
      <div ref={feedback} tabIndex={-1} role="alert" className="text-sm text-red-300 outline-none">{message}</div>
      <Button type="submit" disabled={busy} className="font-ui h-12 w-full text-base font-semibold uppercase tracking-wider hover:bg-primary/90">
        {busy && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {busy ? 'Enviando cadastro…' : 'Criar conta profissional'}
      </Button>
      <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Sua senha é protegida. A confirmação de e-mail é obrigatória e não inicia uma assinatura.</p>
    </form>
  )
}
