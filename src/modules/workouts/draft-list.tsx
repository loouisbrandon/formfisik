'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {draftHref,type DraftSummary} from './draft-schema'
import {action} from '../exercises/browser'
export function WorkoutDraftList(){
 const [page,setPage]=useState(1),[retry,setRetry]=useState(0),[data,setData]=useState<{items:DraftSummary[];total:number;pages:number}|null>(null),[error,setError]=useState('')
 useEffect(()=>{const controller=new AbortController();void fetch('/api/workouts/drafts?page='+page,{cache:'no-store',signal:controller.signal}).then(async r=>{const body=await r.json();if(!r.ok)throw Error(body.message??'Não foi possível consultar os rascunhos.');setData(body);setError('')}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Não foi possível consultar os rascunhos.')});return()=>controller.abort()},[page,retry])
 if(error)return <section role="alert"><p>{error}</p><button className={action} onClick={()=>setRetry(v=>v+1)}>Repetir consulta de rascunhos</button></section>
 if(!data?.total)return null
 return <section aria-label="Rascunhos automáticos" className="space-y-3 rounded-2xl border border-border p-4"><h2 className="text-heading text-3xl">Continuar criando</h2><p className="text-sm">Rascunhos salvos automaticamente. Alterações de treinos ativos aguardam sua confirmação para publicação.</p><ul className="space-y-2">{data.items.map(d=><li key={d.context}><Link className={action} href={draftHref(d.context)}>Continuar {d.name}</Link> <time dateTime={d.updatedAt}>{new Date(d.updatedAt).toLocaleString('pt-BR')}</time></li>)}</ul><nav aria-label="Páginas de rascunhos" className="flex flex-wrap gap-3"><button className={action} disabled={page<=1} onClick={()=>setPage(v=>v-1)}>Rascunhos anteriores</button><span>{page} de {data.pages}</span><button className={action} disabled={page>=data.pages} onClick={()=>setPage(v=>v+1)}>Próximos rascunhos</button></nav></section>
}
