'use client'
import Link from 'next/link'
import Image from 'next/image'
import {useEffect,useRef,useState} from 'react'
import { Menu, House, Search, Bell, ChevronDown,Sun,Moon,X,Settings,UserRound,CreditCard,ArrowUpRight,ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {LogoutButton} from '@/modules/auth/logout-button'
import {Notifications} from '@/modules/communication/panels'
import styles from '@/modules/professional/workspace.module.css'
import {CommandSearch} from '@/modules/search/command-search'
export function Topbar({ section='Gestão', title, fullName, onMenu, menuOpen,theme,onTheme,avatarVersion,planLabel }: { section?:string;title: string; fullName: string; onMenu: () => void; menuOpen: boolean;theme:'dark'|'light';onTheme:()=>void;avatarVersion?:number;planLabel?:string }) {
 const initials=fullName.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()||'P'
 const [panel,setPanel]=useState<'search'|'notifications'|'account'|null>(null),[,setBusy]=useState(false),[notice,setNotice]=useState(''),[refresh,setRefresh]=useState(0)
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null),outsidePointer=useRef(false)
 useEffect(()=>{function hotkey(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){if(document.querySelector('dialog[open]')&&!dialog.current?.open)return;e.preventDefault();if(dialog.current?.open){dialog.current.close();setPanel(null);trigger.current?.focus()}else{trigger.current=document.activeElement as HTMLElement;setPanel('search');dialog.current?.showModal()}}}window.addEventListener('keydown',hotkey);return()=>window.removeEventListener('keydown',hotkey)},[])

 function show(next:NonNullable<typeof panel>){trigger.current=document.activeElement as HTMLElement;setPanel(next);dialog.current?.showModal()}
 function outside(x:number,y:number){const r=dialog.current?.getBoundingClientRect();return !!r&&(x<r.left||x>r.right||y<r.top||y>r.bottom)}
 function close(){setBusy(false);dialog.current?.close();setPanel(null);trigger.current?.focus()}

 return <header className={styles.topbar}>
  <div className={styles.breadcrumb}><Button variant="outline" className="min-h-11 lg:hidden" onClick={onMenu} aria-label="Abrir navegação" aria-expanded={menuOpen} aria-controls="professional-menu"><Menu aria-hidden="true" className="size-5" /></Button><House aria-hidden="true"/><span>{section}</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
  <button className={styles.search} onClick={()=>show('search')} aria-label="Buscar na plataforma"><Search aria-hidden="true"/><span>Buscar alunos, treinos, exercícios…</span><kbd className={styles.searchShortcut}>Ctrl K</kbd></button><div className={styles.toolbar}><button className={styles.bell} onClick={onTheme} aria-label={theme==='dark'?'Ativar modo claro':'Ativar modo noturno'}>{theme==='dark'?<Sun aria-hidden="true"/>:<Moon aria-hidden="true"/>}</button><Link href="/assinatura/gerenciar" className={styles.planBadge} aria-label={`Plano contratado: ${planLabel ?? 'Sem plano'}`}>{planLabel ?? 'Sem plano'}</Link><button className={styles.bell} onClick={()=>show('notifications')} aria-label="Abrir notificações" aria-haspopup="dialog" aria-expanded={panel==='notifications'}><Bell aria-hidden="true"/></button><button aria-label={`Abrir menu da conta: ${fullName}`} aria-haspopup="dialog" aria-expanded={panel==='account'} onClick={()=>show('account')} className={styles.accountLink}><span className={styles.avatar} aria-hidden="true">{avatarVersion?<Image unoptimized src={"/api/settings/avatar?v="+avatarVersion} alt="" width={40} height={40} className="h-full w-full rounded-full object-cover"/>:initials}</span><ChevronDown aria-hidden="true"/></button></div>
  <dialog onPointerDown={e=>{outsidePointer.current=(panel==='account'||panel==='notifications')&&e.target===e.currentTarget&&outside(e.clientX,e.clientY)}} onPointerUp={e=>{if(outsidePointer.current&&e.target===e.currentTarget&&outside(e.clientX,e.clientY))close();outsidePointer.current=false}} onPointerCancel={()=>{outsidePointer.current=false}} data-panel={panel} ref={dialog} className={styles.topDialog} aria-label={panel==='account'?'Menu da conta':panel==='search'?'Busca na plataforma':'Notificações'} onCancel={e=>{e.preventDefault();close()}} onClose={()=>trigger.current?.focus()}><div className={styles.dialogHeader}><h2>{panel==='account'?'Minha conta':panel==='search'?'Buscar na plataforma':'Notificações'}</h2><button onClick={close} aria-label="Fechar painel"><X aria-hidden="true"/></button></div>
   {panel==='account'&&<div className={styles.accountMenu}><div className={styles.accountSummary}><span className={styles.accountAvatar}>{avatarVersion?<Image unoptimized src={'/api/settings/avatar?v='+avatarVersion} alt="" width={52} height={52}/>:initials}</span><div><strong>{fullName}</strong><span><ShieldCheck size={13}/>{planLabel??'Sem plano'}</span></div></div><nav aria-label="Opções da conta">{([['/conta','Minha conta','Dados pessoais e segurança',UserRound],['/configuracoes','Configurações','Preferências e perfil profissional',Settings],['/assinatura/gerenciar','Minha assinatura','Plano, faturas e pagamentos',CreditCard]] as const).map(([href,label,description,Icon])=><Link key={href} href={href} onClick={close}><span className={styles.accountOptionIcon}><Icon size={19}/></span><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={15}/></Link>)}</nav><footer><LogoutButton/></footer></div>}
   {panel==='search'&&<CommandSearch onClose={close}/>}
   {panel==='notifications'&&<div className={styles.notificationContent}>{notice&&<p role="status" className={styles.notificationNotice}>{notice}</p>}<Notifications refresh={refresh} onBusy={setBusy} onChanged={value=>{setNotice(value);setRefresh(n=>n+1)}}/></div>}
  </dialog>
 </header>
}
