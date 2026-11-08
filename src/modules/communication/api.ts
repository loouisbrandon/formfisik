'use client'
import {reportError} from '@/modules/feedback/service'
import {useFeedbackError} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import {useEffect,useRef,useState} from 'react'
import {action as baseAction,control} from '../intake/fields'
export {control}
export const action=baseAction+' max-w-full [overflow-wrap:anywhere]'
export type Page<T>={items:T[];total:number;page:number;pageSize?:number}
export type Student={id:string;fullName:string}
export type Template={id:string;title:string;body:string;version:number;archived:boolean}
export async function api<T>(params:Record<string,string>,body?:object,signal?:AbortSignal):Promise<T>{const r=await fetch('/api/communication'+(body?'':'?'+new URLSearchParams(params)),{method:body?'POST':'GET',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal});if(r.status===401)location.replace('/login?reason=session');const data=await r.json();if(!r.ok)throw Error(data.message??'Comunicação indisponível. Tente novamente.');return data}
export function useRead<T>(params:Record<string,string>,refresh=0,enabled=true){const key=JSON.stringify(params),[result,setResult]=useState<{key:string;refresh:number;data:T}|null>(null),[failure,setFailure]=useState<{key:string;refresh:number;message:string}|null>(null)
 useEffect(()=>{if(!enabled)return;const c=new AbortController(),timer=setTimeout(()=>{void api<T>(JSON.parse(key),undefined,c.signal).then(data=>{if(!c.signal.aborted){setResult({key,refresh,data});setFailure(null)}}).catch(e=>{if(!c.signal.aborted)setFailure({key,refresh,message:reportError(e instanceof TypeError?'Falha de conexão. Tente atualizar a consulta.':e,errorFallbacks.communication)})})},180);return()=>{clearTimeout(timer);c.abort()}},[key,refresh,enabled])
 return {data:enabled&&result?.key===key&&result.refresh===refresh?result.data:null,error:enabled&&failure?.key===key&&failure.refresh===refresh?failure.message:''}
}
export function useMutation(onBusy?:(v:boolean)=>void){const [busy,setBusy]=useState(false),[error,setError]=useFeedbackError(errorFallbacks.communication),pending=useRef(false),attempt=useRef<{digest:string;key:string}|null>(null)
 useEffect(()=>{onBusy?.(busy);return()=>onBusy?.(false)},[busy,onBusy])
 async function run<T>(body:object,done:(value:T)=>Promise<void>|void){if(pending.current)return;pending.current=true;setBusy(true);setError('');try{const digest=JSON.stringify(body);if(attempt.current?.digest!==digest)attempt.current={digest,key:crypto.randomUUID()};const r=await api<T>({}, {...body,...(('action'in body&&body.action==='preview')?{}:{operationKey:attempt.current.key})});await done(r)}catch(e){setError(e instanceof TypeError?'Falha de conexão. Seus campos foram preservados; repita a mesma tentativa.':reportError(e,errorFallbacks.communication))}finally{pending.current=false;setBusy(false)}}
 return {busy,error,run}
}
