import {RecoveryShell} from '@/modules/auth/recovery-shell'
import {ConfirmEmailChange} from '@/modules/settings/confirm-email'
export const metadata={title:'Confirmar novo e-mail | FormFisik',robots:{index:false,follow:false},referrer:'no-referrer'}
export default function ConfirmEmailPage(){return <RecoveryShell title="Confirme seu novo e-mail"><ConfirmEmailChange/></RecoveryShell>}
