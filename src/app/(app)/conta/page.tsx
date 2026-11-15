import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
export const metadata={title:'Minha conta | FormFisik',robots:{index:false,follow:false}}
export default async function AccountPage(){const user=await requireUser();if(user.role==='professional')redirect('/configuracoes?section=account');return <section className="space-y-4 rounded-xl border border-border bg-card p-6"><h1 className="text-2xl font-semibold">Minha conta</h1><p>Este perfil ainda não possui acesso aos recursos profissionais.</p></section>}
