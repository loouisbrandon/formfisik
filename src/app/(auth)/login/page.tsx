import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/modules/auth/login-form'
import { destinationFor } from '@/server/access'
import { currentUser } from '@/server/current-user'
export const metadata = { title: 'Entrar | FormFisik', robots: { index: false, follow: false } }
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const user = await currentUser()
  if (user) redirect(destinationFor(user))
  const { reason } = await searchParams
  return <main className="auth-surface flex min-h-dvh flex-1 items-center px-4 py-10 sm:px-6">
    <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
      <section className="space-y-5">
        <Link href="/" aria-label="FormFisik — início"><Image src="/images/nomelogo.png" alt="FORMFISIK" width={220} height={40} className="mb-8 h-auto w-44" /></Link>
        <p className="text-ui text-sm font-semibold uppercase tracking-[0.2em] text-primary">Sua evolução continua</p>
        <h1 className="text-heading text-5xl uppercase leading-tight sm:text-6xl">Disciplina para evoluir.<br /><span className="text-primary">Tecnologia para ir além.</span></h1>
        <p className="max-w-md leading-7 text-muted-foreground">Entre com sua conta profissional e acesse sua área FormFisik com segurança.</p>
        <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">Sua conta e assinatura ficam disponíveis para consulta. O acesso à área profissional depende de uma assinatura ou teste ativo confirmado. Os módulos de gestão estão em desenvolvimento.</p>
      </section>
      <section aria-labelledby="login-title" className="premium-surface rounded-2xl border border-border p-6 sm:p-8">
        <h2 id="login-title" className="text-heading text-3xl uppercase">Bem-vindo de volta</h2>
        <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">Use o e-mail confirmado no cadastro.</p>
        {reason === 'reset' && <p role="status" className="mb-5 text-sm leading-6 text-muted-foreground">Senha redefinida. Entre com suas novas credenciais.</p>}
        {reason === 'session' && <p role="status" className="mb-5 rounded-lg border border-border p-3 text-sm leading-6 text-foreground">Entre novamente para acessar sua conta. A sessão anterior pode ter expirado ou sido encerrada.</p>}
        <LoginForm />
        <div className="mt-6 border-t border-border pt-6 text-center text-sm">
          <p className="text-muted-foreground">Ainda não tem conta?</p>
          <Link href="/cadastro" className="mt-2 inline-block text-primary underline underline-offset-4">Criar conta profissional</Link>
        </div>
      </section>
    </div>
  </main>
}
