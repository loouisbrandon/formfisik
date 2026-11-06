import { VerifyEmail } from '@/modules/registration/verify-email'
import { RecoveryShell } from '@/modules/auth/recovery-shell'
export const metadata = { title: 'Confirmar e-mail | FormFisik', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default function VerifyEmailPage() {
  return <RecoveryShell title="Confirme seu e-mail"><VerifyEmail /></RecoveryShell>
}
