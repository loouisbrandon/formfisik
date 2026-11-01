import Link from 'next/link'
import { requireUser } from '@/server/current-user'
import { accessFor } from '@/server/access'
export const metadata = { title: 'Minha conta | FormFisik', robots: { index: false, follow: false } }
export default async function AccountPage() {
  const user = await requireUser()
  const access = await accessFor(user)
  return <div className="min-w-0">
    <div className="mx-auto max-w-4xl space-y-8">
      
      <section className="premium-surface space-y-5 rounded-2xl border border-border p-6 sm:p-8" aria-labelledby="account-title">
        <p className="text-ui text-sm font-semibold uppercase tracking-[0.2em] text-primary">Minha conta</p>
        <h1 id="account-title" className="text-heading break-words text-4xl sm:text-5xl">Olá, {user.fullName}</h1>
        <p className="break-all text-muted-foreground">{user.email}</p>
        <p className="text-sm">E-mail confirmado</p>
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <h2 className="text-heading text-2xl">{access.account === 'confirmed_professional' ? 'Sua conta profissional está pronta' : 'Perfil ainda não habilitado'}</h2>
          <p className="mt-2 leading-7 text-muted-foreground">{access.account === 'confirmed_professional'
            ? 'Você está autenticado. Consulte o FormFisik Pro e o estado da contratação. Checkout disponível somente em testes locais configurados; módulos de gestão ainda estão em desenvolvimento.'
            : 'Este perfil não possui acesso aos recursos profissionais. Nenhuma permissão paga foi concedida.'}</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Este cadastro não ativou assinatura ou período experimental. Nenhuma cobrança foi criada.</p>
        {user.role === 'professional' && <Link href="/assinatura" className="font-ui inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Conhecer o FormFisik Pro</Link>}
        {user.role === 'professional' && <Link href="/assinatura/gerenciar" className="block min-h-11 py-3 text-primary underline">Gerenciar minha assinatura</Link>}
        
      </section>
    </div>
  </div>
}
