import { VerifyEmail } from '@/modules/registration/verify-email'
export const metadata = { title: 'Confirmar e-mail | FormFisik', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default function VerifyEmailPage() {
  return <main className="auth-surface flex min-h-dvh items-center justify-center px-4 py-12">
    <section className="premium-surface w-full max-w-md space-y-5 rounded-2xl border border-border p-8">
      <p className="text-ui uppercase tracking-widest text-primary">FormFisik</p>
      <h1 className="text-heading text-4xl">Confirme seu e-mail</h1>
      <VerifyEmail />
    </section>
  </main>
}
