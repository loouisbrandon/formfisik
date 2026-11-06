'use client'
import Link from 'next/link'
import {useEffect,useRef,useState} from 'react'
import { Menu, House, Search, Bell, ChevronDown,Sun,Moon,X,Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {LogoutButton} from '@/modules/auth/logout-button'
import {Notifications} from '@/modules/communication/panels'
import styles from '@/modules/professional/workspace.module.css'
type Hit={id:string;name:string;href:string}
export function Topbar({ title, fullName, onMenu, menuOpen,theme,onTheme }: { title: string; fullName: string; onMenu: () => void; menuOpen: boolean;theme:'dark'|'light';onTheme:()=>void }) {
 const initials=fullName.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()||'P'
 const [panel,setPanel]=useState<'search'|'notifications'|'account'|null>(null),[q,setQ]=useState(''),[hits,setHits]=useState<Hit[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[refresh,setRefresh]=useState(0),[searched,setSearched]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null),controller=useRef<AbortController|null>(null),trigger=useRef<HTMLElement|null>(null)
 useEffect(()=>()=>controller.current?.abort(),[])
 function show(next:NonNullable<typeof panel>){trigger.current=document.activeElement as HTMLElement;setPanel(next);dialog.current?.showModal()}
 function close(){controller.current?.abort();setBusy(false);dialog.current?.close();setPanel(null);trigger.current?.focus()}
 async function search(event:React.FormEvent){event.preventDefault();controller.current?.abort();const c=new AbortController();controller.current=c;setBusy(true);setError('');setHits([]);setSearched(false);const term=q.trim();if(term.length<2){setError('Digite pelo menos dois caracteres.');setBusy(false);return}try{const urls=['/api/students?status=all&q=','/api/workouts?q=','/api/exercises?q='];const results=await Promise.all(urls.map(async(url,i)=>{const r=await fetch(url+encodeURIComponent(term),{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('Não foi possível completar a busca. Tente novamente.');const d=await r.json();return d.items.slice(0,5).map((v:{id:string;fullName?:string;name?:string})=>({id:i+':'+v.id,name:(['Aluno: ','Treino: ','Exercício: '][i])+(v.fullName??v.name),href:i===0?'/alunos/'+v.id:i===1?'/treinos/'+v.id:'/exercicios?q='+encodeURIComponent(v.name??term)}))}));if(!c.signal.aborted){setHits(results.flat());setSearched(true)}}catch(e){if(!c.signal.aborted)setError((e as Error).message)}finally{if(!c.signal.aborted)setBusy(false)}}
 return <header className={styles.topbar}>
  <div className={styles.breadcrumb}><Button variant="outline" className="min-h-11 lg:hidden" onClick={onMenu} aria-label="Abrir navegação" aria-expanded={menuOpen} aria-controls="professional-menu"><Menu aria-hidden="true" className="size-5" /></Button><House aria-hidden="true"/><span>Gestão</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
  <div className={styles.toolbar}><button className={styles.search} onClick={()=>show('search')} aria-label="Buscar na plataforma"><Search aria-hidden="true"/><span>Buscar alunos, treinos, exercícios…</span></button><button className={styles.bell} onClick={onTheme} aria-label={theme==='dark'?'Ativar modo claro':'Ativar modo noturno'}>{theme==='dark'?<Sun aria-hidden="true"/>:<Moon aria-hidden="true"/>}</button><button className={styles.bell} onClick={()=>show('notifications')} aria-label="Abrir notificações"><Bell aria-hidden="true"/></button><button aria-label={`Abrir menu da conta: ${fullName}`} onClick={()=>show('account')} className={styles.accountLink}><span className={styles.avatar} aria-hidden="true">{initials}</span><ChevronDown aria-hidden="true"/></button></div>
  <dialog data-panel={panel} ref={dialog} className={styles.topDialog} aria-label={panel==='account'?'Menu da conta':panel==='search'?'Busca na plataforma':'Notificações'} onCancel={e=>{e.preventDefault();close()}} onClose={()=>trigger.current?.focus()}><div className={styles.dialogHeader}><h2>{panel==='account'?'Minha conta':panel==='search'?'Buscar na plataforma':'Notificações'}</h2><button onClick={close} aria-label="Fechar painel"><X aria-hidden="true"/></button></div>
   {panel==='account'&&<div className={styles.accountMenu}><p>{fullName}</p><Link href="/configuracoes" onClick={close}><Settings aria-hidden="true"/>Configurações</Link><Link href="/conta" onClick={close}>Minha conta</Link><LogoutButton/></div>}
   {panel==='search'&&<><form onSubmit={search} className={styles.searchForm}><label htmlFor="global-search">Nome do aluno, treino ou exercício</label><input id="global-search" value={q} maxLength={120} onChange={e=>setQ(e.target.value)} autoFocus/><button disabled={busy}>{busy?'Buscando…':'Buscar'}</button></form>{error&&<p role="alert">{error}</p>}<p role="status">{hits.length?`${hits.length} resultados · até 5 por categoria`:busy?'Consultando…':searched?'Nenhum resultado encontrado.':'Pesquise para consultar sua carteira e biblioteca.'}</p><ul className={styles.searchHits}>{hits.map(h=><li key={h.id}><Link href={h.href} onClick={close}>{h.name}</Link></li>)}</ul></>}
   {panel==='notifications'&&<><p role="status">{notice}</p><Notifications refresh={refresh} onBusy={setBusy} onChanged={value=>{setNotice(value);setRefresh(n=>n+1)}}/></>}
  </dialog>
 </header>
}
