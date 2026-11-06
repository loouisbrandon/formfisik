import Link from 'next/link'
import { RegistrationForm } from '@/modules/registration/registration-form'
import { AuthVisualShell } from '@/modules/auth/auth-visual-shell'
import styles from '@/modules/auth/login-visual.module.css'

export const metadata = { title: 'Criar conta profissional | FormFisik' }
export default function RegistrationPage() {
  return <AuthVisualShell title="Criar conta profissional" description="Seu próximo passo começa aqui. Preencha todos os campos." intro="Crie sua conta profissional na FormFisik e confirme seu e-mail para começar sua jornada com segurança." formStyle>
    <RegistrationForm />
    <p className={styles.privacyNote}>Usamos nome, e-mail e senha para criar e proteger sua conta e enviar a confirmação. Não informe dados de alunos neste formulário.</p>
    <details className={styles.planNote}><summary>Conta e assinatura são etapas diferentes</summary><p>Criar sua conta não ativa assinatura ou trial. O FormFisik Pro custa R$ 139,90/mês, com teste de 30 dias mediante cartão e cobrança automática ao término, salvo cancelamento anterior. A contratação é uma etapa separada.</p></details>
    <div className={styles.signup}><p>Já tem uma conta?</p><Link href="/login">Entrar na minha conta</Link></div>
  </AuthVisualShell>
}
