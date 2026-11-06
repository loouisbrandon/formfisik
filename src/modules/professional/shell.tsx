'use client'
import { useCallback,useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { SessionStatus } from '@/modules/auth/session-status'
import { ProfessionalNotice,ProfessionalNoticeProvider } from './notice'
import {NavigationMemory} from './navigation-memory'
import styles from './workspace.module.css'
import { pageTitle } from './navigation'
export function ProfessionalShell({ fullName, professional, children,identityContext }: { fullName: string; professional: boolean; children: ReactNode;identityContext?:string }) {
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  useEffect(()=>{const timer=setTimeout(()=>{try{if(localStorage.getItem('formfisik:theme')==='light')setTheme('light')}catch{}},0);return()=>clearTimeout(timer)},[])
  function toggleTheme(){setTheme(t=>{const next=t==='dark'?'light':'dark';try{localStorage.setItem('formfisik:theme',next)}catch{}return next})}
  const [identityChanged,setIdentityChanged]=useState(false)
  const clearIdentity=useCallback(()=>setIdentityChanged(true),[])
  const pathname = usePathname()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false),[modal,setModal]=useState(false)
  const content=useRef<HTMLElement>(null),root=useRef<HTMLDivElement>(null),positions=useRef(new Map<string,number>()),current=useRef(pathname),back=useRef(false)
  useEffect(()=>{const pop=()=>{back.current=true};const reset=()=>{if(!document.querySelector('dialog[open]'))content.current?.scrollTo({top:0})};window.addEventListener('popstate',pop);window.addEventListener('formfisik:list-change',reset);return()=>{window.removeEventListener('popstate',pop);window.removeEventListener('formfisik:list-change',reset)}},[])
  useLayoutEffect(()=>{const box=content.current;if(!box)return;const old=current.current,returning=back.current||(['/comunicacao','/checkins','/agenda','/financeiro','/consultorias','/crm','/alunos','/treinos','/exercicios','/acompanhamento'].includes(pathname)&&old.startsWith(pathname+'/'));const target=returning?(positions.current.get(pathname)??0):0;back.current=false;current.current=pathname;let done=false;const observer=new ResizeObserver(()=>restore());const restore=()=>{if(done)return;box.scrollTop=target;if(box.scrollTop>=target-1){done=true;observer.disconnect()}};const cancel=()=>{done=true;observer.disconnect()};if(box.firstElementChild)observer.observe(box.firstElementChild);restore();const timer=setTimeout(cancel,3000);box.addEventListener('wheel',cancel,{once:true});box.addEventListener('touchstart',cancel,{once:true});if(!returning&&old!==pathname)box.focus({preventScroll:true});return()=>{cancel();clearTimeout(timer);box.removeEventListener('wheel',cancel);box.removeEventListener('touchstart',cancel)}},[pathname])
  useEffect(()=>{const update=()=>setModal(!!document.querySelector('dialog[open]'));const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open'],childList:true});return()=>observer.disconnect()},[])
  useEffect(()=>{const viewport=window.visualViewport;function resize(){if(!root.current)return;if(window.innerWidth<1024&&viewport){root.current.style.setProperty('--professional-viewport',viewport.height+'px');const field=document.activeElement;if(field instanceof HTMLElement&&content.current?.contains(field)&&field.matches('input,textarea,select'))field.scrollIntoView({block:'nearest'})}else root.current.style.removeProperty('--professional-viewport')}resize();viewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);return()=>{viewport?.removeEventListener('resize',resize);window.removeEventListener('resize',resize)}},[])

  function close() { dialog.current?.close(); setOpen(false); trigger.current?.focus() }
  function show() { trigger.current = document.activeElement as HTMLElement; dialog.current?.showModal(); setOpen(true) }
  if(identityChanged)return <main role="status" className="auth-surface min-h-dvh p-8">Verificando sua conta…</main>
  return <NavigationMemory><ProfessionalNoticeProvider><div data-theme={theme} ref={root} style={{height:'var(--professional-viewport,100dvh)'}} className={`${styles.workspace} auth-surface relative min-h-0 w-full shrink-0 overflow-hidden lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]`}>
    <a href="#app-content" className="sr-only z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Ir para o conteúdo</a>
    <aside className="hidden h-full min-h-0 border-r border-border bg-background lg:block"><Sidebar fullName={fullName} pathname={pathname} professional={professional} /></aside>
    <dialog ref={dialog} id="professional-menu" aria-label="Menu profissional" onCancel={event => { event.preventDefault(); close() }} onClose={() => {setOpen(false);trigger.current?.focus()}} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(20rem,100%)] max-w-full flex-col overflow-hidden [&[open]]:flex border-r border-border bg-background text-foreground backdrop:bg-black/70"><div className="flex shrink-0 justify-end px-5 pt-4"><Button variant="outline" onClick={close}>Fechar menu</Button></div><Sidebar fullName={fullName} pathname={pathname} professional={professional} onNavigate={close} /></dialog>
    <div className="flex h-full min-h-0 min-w-0 flex-col"><Topbar title={pageTitle(pathname)} fullName={fullName} onMenu={show} menuOpen={open} theme={theme} onTheme={toggleTheme} /><main ref={content} id="app-content" tabIndex={-1} onScroll={e=>{if(positions.current.size>=40&&!positions.current.has(current.current))positions.current.delete(positions.current.keys().next().value!);positions.current.set(current.current,e.currentTarget.scrollTop)}} style={{overflowY:modal?'hidden':'auto'}} className="relative min-h-0 min-w-0 flex-1 overscroll-contain px-4 py-7 outline-none sm:px-8 sm:py-7"><div className={(['/dashboard','/indicadores','/alunos'].includes(pathname)||pathname.startsWith('/treinos')||pathname.startsWith('/exercicios')||pathname.startsWith('/acompanhamento')||pathname==='/agenda'||pathname==='/anamneses'||pathname==='/videos'||pathname==='/consultorias'||pathname==='/checkins'||pathname==='/financeiro'||/^\/alunos\/[^/]+$/.test(pathname)) ? styles.overviewContainer : "mx-auto max-w-[1600px]"}><ProfessionalNotice />{children}<div className="pt-6"><SessionStatus identityContext={identityContext} onIdentityChange={clearIdentity} /></div></div></main></div>
  </div></ProfessionalNoticeProvider></NavigationMemory>
}
