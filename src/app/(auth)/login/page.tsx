import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { AuthVisualShell } from '@/modules/auth/auth-visual-shell'
import { LoginForm } from '@/modules/auth/login-form'
import { destinationFor } from '@/server/access'
import { currentUser } from '@/server/current-user'
import styles from '@/modules/auth/login-visual.module.css'
export const metadata = { title: 'Entrar | FormFisik', robots: { index: false, follow: false } }
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const user = await currentUser()
  if (user) redirect(destinationFor(user))
  const { reason } = await searchParams
  return <AuthVisualShell title="Bem-vindo de volta" description="Use o e-mail e senha da sua conta para acessar.">
          {reason === 'reset' && <p role="status" className={styles.notice}>Senha redefinida. Entre com suas novas credenciais.</p>}
          {reason === 'session' && <p role="status" className={styles.notice}>Entre novamente. A sessão anterior pode ter expirado ou sido encerrada.</p>}
          <LoginForm />
          <div className={styles.divider}><span />Ou continue com<span /></div>
          <div className={styles.social} aria-describedby="social-availability">
            <button type="button" disabled><b className={styles.google} aria-hidden="true">G</b> Google</button>
            <button type="button" disabled><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.2 12.8c0-2 1.6-3 1.7-3.1-1-1.5-2.5-1.7-3.1-1.7-1.3-.1-2.5.8-3.2.8-.6 0-1.6-.8-2.6-.8-1.4 0-2.8.9-3.5 2.1-1.5 2.6-.4 6.5 1 8.6.7 1 1.4 2.1 2.5 2 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7s1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.6ZM15.1 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.6-.9 2.5.9.1 1.8-.5 2.5-1.1Z" /></svg> Apple</button>
          </div>
          <p id="social-availability" className={styles.socialNote}>Login social ainda não disponível. Use e-mail e senha.</p>
          <div className={styles.signup}><p>Ainda não tem conta?</p><Link href="/cadastro">Criar conta profissional <ArrowRight size={17} aria-hidden="true" /></Link></div>
  </AuthVisualShell>
}
