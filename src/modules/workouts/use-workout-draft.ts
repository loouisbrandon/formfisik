'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
import type {Workout,WorkoutFields} from './schema'
import type {SelectedStudent} from './students-picker'
import {draftFields,type WorkoutDraft} from './draft-schema'

async function request<T>(context:string,body?:unknown,keepalive=false):Promise<T>{
 const payload=body===undefined?undefined:JSON.stringify(body)
 const r=await fetch('/api/workouts/drafts'+(body===undefined?'?context='+encodeURIComponent(context):''),{cache:'no-store',method:body===undefined?'GET':'PUT',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:payload,keepalive:keepalive&&!!payload&&new TextEncoder().encode(payload).length<60000})
 const data=await r.json();if(!r.ok)throw Error(data.message??'Não foi possível salvar o rascunho.');return data
}
export function useWorkoutDraft(initial:Workout,context:string){
 const [fields,setFields]=useState(initial.fields),[definitions,setDefinitions]=useState(initial.exerciseDefinitions),[students,setStudents]=useState<SelectedStudent[]>(initial.fields.studentId?[{id:initial.fields.studentId,fullName:initial.studentName??'Aluno associado'}]:[])
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[saving,setSaving]=useState(false),[restored,setRestored]=useState(false),[ack,setAck]=useState(JSON.stringify(initial.fields)),[attempt,setAttempt]=useState(0)
 const state=useRef({fields:initial.fields,revision:0,baseVersion:initial.version,ack:JSON.stringify(initial.fields),closed:false}),flight=useRef<Promise<void>|null>(null),live=useRef(false)
 const dirty=JSON.stringify(fields)!==ack
 useEffect(()=>{live.current=true;let active=true;void request<{draft:WorkoutDraft|null}>(context).then(({draft})=>{if(!active)return;if(draft){state.current={fields:draft.fields,revision:draft.revision,baseVersion:draft.baseVersion,ack:JSON.stringify(draft.fields),closed:false};setFields(draft.fields);setAck(JSON.stringify(draft.fields));setDefinitions(draft.exerciseDefinitions);setStudents(draft.fields.studentId?[{id:draft.fields.studentId,fullName:draft.studentName??'Aluno associado'}]:[]);setRestored(true);if(draft.baseVersion!==initial.version)setError('O planejamento mudou desde este rascunho. O conteúdo foi recuperado para consulta; revise a versão atual antes de salvar.')}setReady(true)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Não foi possível recuperar o rascunho.')});return()=>{active=false;live.current=false}},[context,initial.version,attempt])
 const change=useCallback((f:WorkoutFields)=>{state.current.fields=f;setFields(f);setError('')},[])
 const flush=useCallback(async(keepalive=false,drain=true)=>{
  // One request at a time, with a trailing snapshot if editing continues in flight.
  while(!state.current.closed&&JSON.stringify(state.current.fields)!==state.current.ack){
   if(flight.current){await flight.current;continue}
   const s=state.current,snapshot=s.fields,serialized=JSON.stringify(snapshot),parsed=draftFields.safeParse(snapshot)
   if(!parsed.success){const message='Rascunho pendente: '+parsed.error.issues[0].message;setError(message);throw Error(message)}
   const task=(async()=>{if(live.current){setSaving(true);setError('')}try{const result=await request<{revision:number}>(context,{context,revision:s.revision,baseVersion:s.baseVersion,fields:parsed.data},keepalive);s.revision=result.revision;s.ack=serialized;if(live.current)setAck(serialized)}catch(e){if(live.current)setError(e instanceof Error?e.message:'Não foi possível salvar o rascunho.');throw e}finally{if(live.current)setSaving(false)}})()
   flight.current=task;try{await task}finally{flight.current=null}
   if(!drain)break
  }
  return state.current.revision?{context,revision:state.current.revision}:undefined
 },[context])
 useEffect(()=>{if(!ready||!dirty)return;const timer=setTimeout(()=>void flush(false,false).catch(()=>{}),1500);return()=>clearTimeout(timer)},[ready,dirty,fields,ack,flush])
 useEffect(()=>{if(!ready)return;const timer=setInterval(()=>{if(JSON.stringify(state.current.fields)!==state.current.ack)void flush(false,false).catch(()=>{})},5000);return()=>clearInterval(timer)},[ready,flush])
 useEffect(()=>{const hidden=()=>{if(document.visibilityState==='hidden'&&ready)void flush(true).catch(()=>{})},online=()=>{if(ready)void flush().catch(()=>{})},unload=(e:BeforeUnloadEvent)=>{if(JSON.stringify(state.current.fields)!==state.current.ack){void flush(true).catch(()=>{});e.preventDefault();e.returnValue=''}};document.addEventListener('visibilitychange',hidden);window.addEventListener('online',online);window.addEventListener('beforeunload',unload);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('online',online);window.removeEventListener('beforeunload',unload)}},[ready,flush])
 useEffect(()=>()=>{if(ready)void flush(true).catch(()=>{})},[ready,flush])
 function committed(){state.current.closed=true;state.current.ack=JSON.stringify(state.current.fields);setAck(state.current.ack)}
 return {fields,change,definitions,setDefinitions,students,setStudents,ready,error,saving,restored,dirty,flush,committed,retry:()=>ready?void flush().catch(()=>{}):setAttempt(v=>v+1)}
}
