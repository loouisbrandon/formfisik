import Link from 'next/link'
import Image from 'next/image'
export function RecoveryShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="auth-surface flex min-h-dvh flex-1 items-center justify-center px-4 py-10 sm:px-6">
    <section className="premium-surface w-full max-w-lg space-y-6 rounded-2xl border border-border p-6 sm:p-8">
      <Link href="/" aria-label="FormFisik — início"><Image src="/images/nomelogo.png" alt="FORMFISIK" width={220} height={40} className="mb-6 h-auto w-44" /></Link>
      <h1 className="text-heading text-4xl">{title}</h1>
      {children}
      <Link href="/login" className="inline-block min-h-11 py-3 text-primary underline underline-offset-4">Voltar para o login</Link>
    </section>
  </main>
}
