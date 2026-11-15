import { RecoveryShell } from '@/modules/auth/recovery-shell'
import { ForgotPasswordForm } from '@/modules/auth/forgot-password-form'
export const metadata = { title: 'Esqueci minha senha | FormFisik', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default function ForgotPasswordPage() {
  return <RecoveryShell title="Esqueci minha senha"><ForgotPasswordForm /></RecoveryShell>
}
