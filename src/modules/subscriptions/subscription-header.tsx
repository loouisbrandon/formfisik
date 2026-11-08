import Link from 'next/link'
import { CreditCard, Layers, ShieldCheck } from 'lucide-react'
import s from './subscriptions.module.css'
export function SubscriptionHeader({ title, description, active }: { title:string;description:string;active:'plans'|'manage'|'return' }) {
 return <><header className={s.header}><div><p className={s.eyebrow}>SUA ASSINATURA FORMFISIK</p><h1>{title}</h1><p>{description}</p></div><span className={s.testBadge}><ShieldCheck size={16} aria-hidden/>Ambiente de testes</span></header><nav className={s.navigation} aria-label="Assinatura"><Link href="/assinatura" aria-current={active==='plans'?'page':undefined}><Layers size={16} aria-hidden/>Planos</Link><Link href="/assinatura/gerenciar" aria-current={active==='manage'?'page':undefined}><CreditCard size={16} aria-hidden/>Minha assinatura</Link>{active==='return'&&<Link href="/assinatura/retorno" aria-current="page"><ShieldCheck size={16} aria-hidden/>Confirmação</Link>}</nav></>
}
