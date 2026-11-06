import Link from 'next/link'
import { AuthVisualShell } from './auth-visual-shell'
import styles from './login-visual.module.css'
export function RecoveryShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <AuthVisualShell title={title} description="Sua conta protegida em cada etapa." intro="Sua evolução continua. Proteja o acesso à sua conta profissional e siga sua jornada na FormFisik com segurança." formStyle>
    {children}
    <div className={styles.signup}><Link href="/login">Voltar para o login</Link></div>
  </AuthVisualShell>
}
