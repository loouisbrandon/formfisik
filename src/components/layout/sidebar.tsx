import Link from 'next/link'
import { LogoutButton } from '@/modules/auth/logout-button'
import { Activity, UsersRound, LayoutDashboard, CreditCard, UserRound, Dumbbell, ClipboardList, CalendarDays, BriefcaseBusiness, ListChecks, MessagesSquare, ChartNoAxesCombined, Upload, Video, Settings, Layers3 } from 'lucide-react'
import { professionalNavigation, activeNavigation } from '@/modules/professional/navigation'
import styles from '@/modules/professional/workspace.module.css'
const icons = { '/dashboard':LayoutDashboard,'/indicadores':ChartNoAxesCombined,'/importar':Upload,'/alunos':UsersRound,'/agenda':CalendarDays,'/consultorias':BriefcaseBusiness,'/financeiro':CreditCard,'/crm':UsersRound,'/comunicacao':MessagesSquare,'/checkins':ListChecks,'/anamneses':ClipboardList,'/videos':Video,'/exercicios':Layers3,'/treinos':Dumbbell,'/acompanhamento':Activity,'/assinatura/gerenciar':CreditCard,'/conta':UserRound }
const groups = [
  {title:'',paths:['/dashboard']},
  {title:'Gestão',paths:['/alunos','/treinos','/exercicios','/acompanhamento','/agenda','/anamneses','/videos']},
  {title:'Operação',paths:['/consultorias','/checkins','/financeiro','/crm','/comunicacao']},
  {title:'Sistema',paths:['/indicadores','/importar','/assinatura/gerenciar','/conta']},
]
export function Sidebar({ pathname, professional = true, onNavigate,fullName='' }: { pathname: string; professional?: boolean; onNavigate?: () => void;fullName?:string }) {
  const initials=fullName.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()||'P'
  return <div className={styles.sidebar}>
    <Link href={professional ? '/dashboard' : '/conta'} onClick={onNavigate} aria-label="FormFisik, início" className={styles.brand}>FORMFISIK</Link>
    <div className={styles.navigation}><nav aria-label="Navegação profissional">{groups.map(group=>{
      const items=group.paths.flatMap(path=>professionalNavigation.filter(item=>item.href===path&&(professional||path==='/conta')))
      if(!items.length)return null
      return <section key={group.title||'Início'} className={styles.group} aria-label={group.title||'Início'}>{group.title&&<h2 className={styles.groupTitle}>{group.title}</h2>}{items.map(item=>{const Icon=icons[item.href];return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={activeNavigation(pathname,item.href)?'page':undefined} className={styles.navLink}><Icon aria-hidden="true" /><span>{item.label}</span></Link>})}{group.title==='Sistema'&&professional&&<p className={styles.future}><Settings aria-hidden="true" /><span>Configurações <small>em breve</small></span></p>}</section>
    })}</nav></div>
    <div className={styles.profile}><Link href="/conta" onClick={onNavigate} className={styles.identity}><span className={styles.avatar} aria-hidden="true">{initials}</span><span><strong>{fullName||'Minha conta'}</strong><small>{professional?'Profissional':'Minha conta'}</small></span></Link><LogoutButton /></div>
  </div>
}
