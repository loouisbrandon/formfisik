import { RecoveryShell } from '@/modules/auth/recovery-shell'
import { ResetPasswordForm } from '@/modules/auth/reset-password-form'
export const metadata = { title: 'Redefinir senha | FormFisik', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default function ResetPasswordPage() {
  return <RecoveryShell title="Redefinir senha"><ResetPasswordForm /></RecoveryShell>
}
