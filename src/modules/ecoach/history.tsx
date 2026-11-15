'use client'
import {useEffect,useState,useRef,useId,useCallback} from 'react'
import {createPortal} from 'react-dom'
import {History,Pencil,Trash2,ChevronLeft,ChevronRight} from 'lucide-react'
import {useCoachConversation} from './conversation'
import {confirmAction} from '../feedback/service'
import type {ConversationSummary} from './history-schema'
import {Button} from '@/components/ui/button'
import {LoadingSkeleton} from '@/components/ui/loading-skeleton'
import s from './chat.module.css'

export function ConversationHistory({dock,onOpenChange}:{dock?:HTMLElement|null;onOpenChange?:(open:boolean)=>void}={}){
 const {requestHistory,openConversation,renameConversation,deleteConversation,active,historyBusy}=useCoachConversation()
 const [open,setOpenState]=useState(false),[page,setPage]=useState(1),[refresh,setRefresh]=useState(0)
 const [data,setData]=useState<{items:ConversationSummary[];total:number}|null>(null)
 const [error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [renaming,setRenaming]=useState<ConversationSummary|null>(null),[title,setTitle]=useState('')
 const panelId=useId()
 const setOpen=useCallback((value:boolean)=>{setOpenState(value);onOpenChange?.(value)},[onOpenChange])
 const container=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  if(!open||dock)return
  function dismiss(event:PointerEvent){
   const target=event.target
   if(!(target instanceof Node)||container.current?.contains(target))return
   // Confirmation dialogs are rendered outside this panel. Keep their flow intact.
   if(target instanceof Element&&target.closest('dialog[open]'))return
   setOpen(false)
  }
  document.addEventListener('pointerdown',dismiss,true)
  return()=>document.removeEventListener('pointerdown',dismiss,true)
 },[open,dock,setOpen])
 const renameDialog=useRef<HTMLDialogElement>(null),renameInput=useRef<HTMLInputElement>(null)
 useEffect(()=>{if(renaming){renameDialog.current?.showModal();renameInput.current?.focus()}else renameDialog.current?.close()},[renaming])
 useEffect(()=>{
  if(!open)return
  const controller=new AbortController();let stale=false
  queueMicrotask(()=>{if(!stale){setBusy(true);setError('')}})
  requestHistory('?page='+page,undefined,controller.signal).then(result=>{
   if(!stale){if(!result.items.length&&page>1)setPage(p=>p-1);else setData(result)}
  }).catch(e=>{if(!stale)setError(e.message)}).finally(()=>{if(!stale)setBusy(false)})
  return()=>{stale=true;controller.abort()}
 },[open,page,refresh,requestHistory,active?.updatedAt])
 async function remove(item:ConversationSummary){
  if(!await confirmAction('Excluir permanentemente esta conversa e suas mensagens?'))return
  setBusy(true)
  try{await deleteConversation(item);setRefresh(n=>n+1)}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível excluir.')}
  finally{setBusy(false)}
 }
 const panel=open&&<section id={panelId} className={`${s.historyPanel} ${dock?s.historyDocked:''}`} aria-label="Histórico de conversas">
   <div className="mb-2 flex items-center justify-between"><strong>Suas conversas</strong><button aria-label="Fechar histórico" onClick={()=>setOpen(false)}>Fechar</button></div>
   {error&&<p role="alert">{error}</p>}
   {busy?<LoadingSkeleton variant="inline" label="Buscando conversas"/>:!data?.items.length?<p>Nenhuma conversa salva ainda.</p>:data.items.map(item=><div className={s.historyRow} key={item.id} data-active={active?.id===item.id}>
    <button disabled={historyBusy} onClick={async()=>{await openConversation(item.id);if(!dock)setOpen(false)}}><strong>{item.title}</strong><small>{new Date(item.updatedAt).toLocaleDateString('pt-BR')}</small></button>
    <button disabled={busy||historyBusy} aria-label={'Renomear '+item.title} onClick={()=>{setTitle(item.title);setRenaming(item)}}><Pencil size={15}/></button>
    <button disabled={busy||historyBusy} aria-label={'Excluir '+item.title} onClick={()=>void remove(item)}><Trash2 size={15}/></button>
   </div>)}
   {!!data&&data.total>20&&<div className="mt-3 flex items-center justify-between">
    <button disabled={page===1||busy} aria-label="Conversas anteriores" onClick={()=>setPage(p=>p-1)}><ChevronLeft size={16}/></button><span>{page} de {Math.ceil(data.total/20)}</span><button disabled={page*20>=data.total||busy} aria-label="Próximas conversas" onClick={()=>setPage(p=>p+1)}><ChevronRight size={16}/></button>
   </div>}
   <small className="mt-3 block text-muted-foreground">Salvas na sua conta até você excluir. Não envie informações sensíveis desnecessárias.</small>
  </section>
 return <div ref={container} className={s.history}>
  <button type="button" className={s.historyToggle} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(!open)}><History size={16}/> Conversas</button>
  {dock?createPortal(panel,dock):panel}
  <dialog ref={renameDialog} aria-labelledby="coach-rename-title" onCancel={e=>{e.preventDefault();setRenaming(null)}} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(460px,calc(100%_-_24px))] overflow-auto rounded-2xl border border-border bg-card p-6 text-foreground">
   <h2 id="coach-rename-title" className="mb-4 text-lg font-bold">Renomear conversa</h2>
   <form onSubmit={async event=>{event.preventDefault();if(!renaming)return;setBusy(true);try{await renameConversation(renaming,title.trim());setRenaming(null);setRefresh(n=>n+1)}catch(e){setError(e instanceof Error?e.message:'Não foi possível renomear.');setRenaming(null)}finally{setBusy(false)}}}>
    <label className="text-sm">Nome da conversa<input ref={renameInput} className="my-3 w-full rounded-lg border border-border bg-background px-3 py-2" required minLength={1} maxLength={100} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={()=>setRenaming(null)}>Cancelar</Button><Button type="submit" disabled={busy||!title.trim()}>Salvar nome</Button></div>
   </form>
  </dialog>
 </div>
}
