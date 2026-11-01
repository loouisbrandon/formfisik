import Link from 'next/link'
import Image from 'next/image'
import { RegistrationForm } from '@/modules/registration/registration-form'

export const metadata = { title: 'Criar conta profissional | FormFisik' }
export default function RegistrationPage() {
  return (
    <main className="auth-surface flex min-h-dvh flex-1 items-center px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
        <section className="space-y-5">
          <Link href="/" aria-label="FormFisik — início"><Image src="/images/nomelogo.png" alt="FORMFISIK" width={220} height={40} className="mb-8 h-auto w-44" /></Link>
          <p className="text-ui text-sm font-semibold uppercase tracking-[0.2em] text-primary">Para profissionais de educação física</p>
          <h1 className="text-heading text-5xl uppercase leading-tight sm:text-6xl">Sua próxima evolução<br /><span className="text-primary">começa aqui.</span></h1>
          <p className="max-w-md leading-7 text-muted-foreground">Crie sua identidade profissional na FormFisik. Confirme seu e-mail para concluir o cadastro com segurança.</p>
          <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Criar conta não ativa o FormFisik Pro.</p>
            <p>O plano será R$ 139,90/mês, com teste de 30 dias mediante cartão e cobrança automática após o teste, salvo cancelamento. Assinatura e trial não estão disponíveis nesta etapa.</p>
          </div>
          <Link href="/login" className="inline-block text-sm text-primary underline underline-offset-4">Já tem conta? Entrar</Link>
        </section>
        <section className="premium-surface rounded-2xl border border-border p-6 sm:p-8" aria-labelledby="registration-title">
          <h2 id="registration-title" className="text-heading text-3xl uppercase">Criar conta profissional</h2>
          <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">Todos os campos são obrigatórios.</p>
          <RegistrationForm />
          <p className="mt-6 text-xs leading-5 text-muted-foreground">Usamos nome, e-mail e senha para criar e proteger sua conta e enviar a confirmação. Não informe dados de pacientes ou alunos neste formulário.</p>
        </section>
      </div>
    </main>
  )
}
