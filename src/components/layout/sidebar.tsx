'use client'
import Link, { useLinkStatus } from 'next/link'
import Image from 'next/image'
import {useSearchParams} from 'next/navigation'
import { LogoutButton } from '@/modules/auth/logout-button'
import { Activity, UsersRound, LayoutDashboard, CreditCard, UserRound, Dumbbell, ClipboardList, CalendarDays, BriefcaseBusiness, ListChecks, MessagesSquare, ChartNoAxesCombined, Upload, Video, Settings, Layers3, BookOpen } from 'lucide-react'
import { professionalNavigation, activeNavigation } from '@/modules/professional/navigation'
import styles from '@/modules/professional/workspace.module.css'
function NavigationPending() { const { pending } = useLinkStatus(); return <span aria-hidden="true" data-pending={pending} className={styles.navigationPending}/> }
const icons = { '/dashboard':LayoutDashboard,'/indicadores':ChartNoAxesCombined,'/importar':Upload,'/alunos':UsersRound,'/agenda':CalendarDays,'/consultorias':BriefcaseBusiness,'/financeiro':CreditCard,'/crm':UsersRound,'/comunicacao':MessagesSquare,'/checkins':ListChecks,'/anamneses':ClipboardList,'/videos':Video,'/exercicios':Layers3,'/treinos':Dumbbell,'/acompanhamento':Activity,'/assinatura/gerenciar':CreditCard,'/conta':UserRound,'/configuracoes':Settings,'/tutoriais':BookOpen }
const groups = [
  {title:'',paths:['/dashboard']},
  {title:'Gestão',paths:['/alunos','/treinos','/exercicios','/acompanhamento','/agenda','/anamneses','/videos']},
  {title:'Operação',paths:['/consultorias','/checkins','/financeiro','/crm','/comunicacao']},
  {title:'Sistema',paths:['/indicadores','/tutoriais']},
]
export function Sidebar({ pathname, professional = true, onNavigate,fullName='',avatarVersion }: { pathname: string; professional?: boolean; onNavigate?: () => void;fullName?:string;avatarVersion?:number }) {
  const search=useSearchParams(),accountSelected=pathname==='/configuracoes'&&search.get('section')==='account'
  const isCurrent=(href:string)=>accountSelected?href==='/conta':activeNavigation(pathname,href)
  const initials=fullName.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()||'P'
  return <div className={styles.sidebar}>
    <Link href={professional ? '/dashboard' : '/conta'} onClick={onNavigate} aria-label="FormFisik, início" className={styles.brand}><Image src="/images/nomelogo.png" alt="FormFisik" width={2488} height={292} priority className={styles.brandImage}/></Link>
    <div className={styles.navigation}><nav aria-label="Navegação profissional">{groups.map(group=>{
      const items=group.paths.flatMap(path=>professionalNavigation.filter(item=>item.href===path&&(professional||path==='/conta')))
      if(!items.length)return null
      return <section key={group.title||'Início'} className={styles.group} aria-label={group.title||'Início'}>{group.title&&<h2 className={styles.groupTitle}>{group.title}</h2>}{items.map(item=>{const Icon=icons[item.href];return <Link key={item.href} href={item.href==='/conta'&&professional?'/configuracoes?section=account':item.href} onClick={onNavigate} aria-current={isCurrent(item.href)?'page':undefined} className={styles.navLink}><Icon aria-hidden="true" /><span>{item.label}</span><NavigationPending/></Link>})}</section>
    })}</nav></div>
    <nav aria-label="Conta e configurações" className={styles.accountNavigation}>{professionalNavigation.filter(item=>['/assinatura/gerenciar','/conta','/configuracoes'].includes(item.href)&&(professional||item.href==='/conta')).map(item=>{const Icon=icons[item.href];return <Link key={item.href} href={item.href==='/conta'&&professional?'/configuracoes?section=account':item.href} aria-label={item.label} onClick={onNavigate} aria-current={isCurrent(item.href)?'page':undefined} className={styles.navLink}><Icon aria-hidden/><span>{item.label}{item.href==='/assinatura/gerenciar'&&<small>Meus planos</small>}</span><NavigationPending/></Link>})}</nav>
    <div className={styles.profile}><Link href={professional?'/configuracoes?section=account':'/conta'} onClick={onNavigate} className={styles.identity}><span className={styles.avatar} aria-hidden="true">{avatarVersion?<Image unoptimized src={"/api/settings/avatar?v="+avatarVersion} alt="" width={40} height={40} className="h-full w-full rounded-full object-cover"/>:initials}</span><span><strong>{fullName||'Minha conta'}</strong><small>{professional?'Profissional':'Minha conta'}</small></span></Link><LogoutButton /></div>
  </div>
}
