import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {isAdministrator} from '@/server/admin/dashboard'
import {destinationFor} from '@/server/access'
import {ProfessionalShell} from '@/modules/professional/shell'
import {sessionContext} from '@/server/sessions'
export const metadata={title:'Administração | FormFisik',robots:{index:false,follow:false}}
export default async function AdminLayout({children}:{children:React.ReactNode}) {
  const user=await requireUser()
  if(!isAdministrator(user))redirect(destinationFor(user))
  return <ProfessionalShell admin professional={false} fullName={user.fullName} identityContext={sessionContext(user.id)}>{children}</ProfessionalShell>
}
