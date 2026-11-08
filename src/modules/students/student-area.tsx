'use client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import {reportError,validationErrors} from '@/modules/feedback/service'
import {friendlyFieldError} from '@/modules/feedback/messages'
import {useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import styles from './portfolio.module.css'
import {StudentPortfolio} from './portfolio'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfessionalNotice } from '@/modules/professional/notice'
import {useNavigationState,listChanged} from '../professional/navigation-memory'
import {StudentProfile} from './student-profile'
import { studentFields, type Student, type StudentFields, type StudentList, type StudentQuery } from './schema'
const link='inline-flex min-h-11 items-center rounded-lg px-2 py-2 text-sm text-primary underline focus-visible:outline-2 focus-visible:outline-primary'
const empty:StudentFields={fullName:'',email:'',phone:'',birthDate:'',adminNotes:''}
const initial:StudentQuery={q:'',status:'active',sort:'name_asc',page:1}
async function responseData(response:Response){
 let data
 try{data=await response.json()}catch{throw new Error('Não foi possível consultar o serviço agora. Tente novamente.')} 
 if(response.status===401)window.location.replace('/login?reason=session')
 if(response.status===403)window.location.replace(data.destination==='/conta'?'/conta':data.destination==='/assinatura'?'/assinatura':'/assinatura/gerenciar')
 return data
}
export function StudentArea({mode,id}:{mode:'list'|'new'|'profile'|'edit';id?:string}){
 const notify=useProfessionalNotice()
 const router=useRouter(),[student,setStudent]=useState<Student|null>(null),[list,setList]=useState<StudentList|null>(null),[values,setValues]=useState<StudentFields>(empty)
 const [filters,setFilters]=useNavigationState<StudentQuery>('students:filters',initial),[applied,setApplied]=useNavigationState<StudentQuery>('students:applied',initial),[busy,setBusy]=useState(false),[loading,setLoading]=useState(mode!=='new'),[message,setMessage]=useFeedbackMessage('',errorFallbacks.students),[errors,setErrors]=useState<Record<string,string[]|undefined>>({}),[duplicate,setDuplicate]=useState(false),[confirmed,setConfirmed]=useState(false),[success,setSuccess]=useState('')
 const queryRef=useRef(applied);useEffect(()=>{queryRef.current=applied},[applied])
 const readController=useRef<AbortController|null>(null)
 const creationKey=useRef(''),feedback=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),pending=useRef(false)
 const load=useCallback(async(query:StudentQuery=queryRef.current)=>{
  readController.current?.abort();const controller=new AbortController();readController.current=controller;setLoading(true);setMessage('')
  try{const response=await fetch(mode==='list'?'/api/students?'+new URLSearchParams({...query,page:String(query.page)}):'/api/students/'+id,{cache:'no-store',signal:controller.signal});const data=await responseData(response);if(controller.signal.aborted)return
   if(!response.ok)throw new Error(data.message||'Não foi possível carregar os alunos.')
   if(mode==='list'){setList(data);setApplied(query)}else{setStudent(data.student);setValues({fullName:data.student.fullName,email:data.student.email,phone:data.student.phone,birthDate:data.student.birthDate,adminNotes:data.student.adminNotes})}
  }catch(error){if(controller.signal.aborted)return;setList(null);setStudent(null);setMessage(error instanceof Error&&!(error instanceof TypeError)?reportError(error,errorFallbacks.students):'Falha de conexão. Tente novamente.')}finally{if(!controller.signal.aborted)setLoading(false)}
 },[mode,id,setApplied,setMessage])
 useEffect(()=>{if(mode==='new')return;const timer=window.setTimeout(()=>void load(),0);return ()=>{window.clearTimeout(timer);readController.current?.abort()}},[mode,load])
 async function save(event:FormEvent){
  event.preventDefault();if(pending.current)return
  setMessage('');setSuccess('');notify('');const parsed=studentFields.safeParse(values)
  if(!parsed.success){const fields=parsed.error.flatten().fieldErrors;setErrors(validationErrors(fields));document.getElementById(Object.keys(fields)[0])?.focus();return}
  pending.current=true;setBusy(true);setErrors({});if(!creationKey.current)creationKey.current=crypto.randomUUID()
  try{const response=await fetch(mode==='new'?'/api/students':'/api/students/'+id,{method:mode==='new'?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...parsed.data,...(mode==='new'?{creationKey:creationKey.current,allowDuplicate:confirmed}:{version:student?.version})})});const data=await responseData(response)
   if(!response.ok){setErrors(validationErrors(data.errors||{}));setDuplicate(data.code==='duplicate');throw new Error(data.message||'Não foi possível salvar.')}
   notify('Cadastro salvo com sucesso.');setStudent(data.student);router.push('/alunos/'+data.student.id)
  }catch(error){setMessage(error instanceof Error&&!(error instanceof TypeError)?reportError(error,errorFallbacks.students):'Falha de conexão. Tente novamente.');requestAnimationFrame(()=>feedback.current?.focus())}finally{setBusy(false);pending.current=false}
 }
 async function changeStatus(){if(!student||pending.current)return;pending.current=true;setBusy(true);setMessage('')
  try{const response=await fetch('/api/students/'+student.id+'/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:student.status==='active'?'archived':'active',version:student.version})});const data=await responseData(response);if(!response.ok)throw new Error(data.message||'Não foi possível atualizar a situação.');setStudent(data.student);setSuccess(data.student.status==='archived'?'Aluno arquivado.':'Aluno reativado.');dialog.current?.close()}catch(error){dialog.current?.close();setMessage(error instanceof Error&&!(error instanceof TypeError)?reportError(error,errorFallbacks.students):'Falha de conexão.')}finally{setBusy(false);pending.current=false;requestAnimationFrame(()=>feedback.current?.focus())}
 }
 async function download(individual=false){if(pending.current)return;pending.current=true;setBusy(true);setMessage('')
  try{const response=await fetch(individual?'/api/students/'+id+'/pdf':'/api/students/export?'+new URLSearchParams({...applied,page:'1'}),{cache:'no-store'});if(!response.ok){const data=await responseData(response);throw new Error(data.message||'Não foi possível exportar. Tente novamente.')}
   const url=URL.createObjectURL(await response.blob());const anchor=document.createElement('a');anchor.href=url;anchor.download=individual?'formfisik-aluno.pdf':'formfisik-alunos.pdf';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setSuccess('PDF gerado. Guarde o documento com segurança.')
  }catch(error){setMessage(error instanceof Error&&!(error instanceof TypeError)?reportError(error,errorFallbacks.students):'Falha na exportação.')}finally{setBusy(false);pending.current=false}
 }
 return <div className={mode==='list'?styles.area:"space-y-6"}>
  <header hidden={mode==='profile'&&!!student&&!loading} className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-ui text-sm uppercase tracking-widest text-primary">Carteira profissional</p><h1 className="text-heading mt-2 break-words text-4xl sm:text-5xl">{mode==='list'?'Alunos':mode==='new'?'Cadastrar aluno':mode==='edit'?'Editar cadastro':student?.fullName||'Perfil do aluno'}</h1>{mode==='list'&&<p className={styles.subtitle}>Gerencie seus alunos, acompanhe seu progresso e organize seus atendimentos.</p>}</div>{mode!=='list'&&<Link href={mode==='edit'?'/alunos/'+id:'/alunos'} className={link}>{mode==='profile'?'Voltar à listagem':'Voltar sem alterar'}</Link>}</header>
  <div ref={feedback} tabIndex={-1} className="outline-none"><p role="status" className="text-sm text-primary">{success}</p>{message&&<div role="alert" className="space-y-3 rounded-xl border border-border p-4 text-sm text-red-300"><p>{message}</p>{mode!=='new'&&<Button className="min-h-11" variant="outline" disabled={busy} onClick={()=>void load(applied)}>Recarregar dados</Button>}</div>}</div>
  {loading&&<LoadingSkeleton label="Carregando alunos…"/>}
  {mode==='list'&&<StudentPortfolio list={list} loading={loading} busy={busy} filters={filters} setFilters={setFilters} apply={query=>{listChanged();void load(query)}} applied={applied} download={()=>void download()} />}
  {(mode==='new'||mode==='edit'&&student&&!loading)&&<form onSubmit={save} noValidate aria-busy={busy} className="max-w-3xl space-y-5 rounded-2xl border border-border p-5 sm:p-7">
   <p className="text-sm leading-7 text-muted-foreground">Este cadastro é privado da sua carteira. Não cria acesso à plataforma para o aluno.</p>
   {(['fullName','email','phone','birthDate','adminNotes'] as const).map(field=><div key={field} className="space-y-2"><label htmlFor={field} className="font-semibold">{{fullName:'Nome completo',email:'E-mail (opcional)',phone:'Telefone (opcional)',birthDate:'Data de nascimento (opcional)',adminNotes:'Observações administrativas (opcional)'}[field]}{field==='fullName'?' *':''}</label>{field==='adminNotes'?<textarea id={field} value={values[field]} disabled={busy} maxLength={1000} rows={5} onChange={event=>{setValues({...values,[field]:event.target.value});setErrors(validationErrors({...errors,[field]:undefined}))}} aria-invalid={!!errors[field]} aria-describedby={field+'-hint '+field+'-error'} className="w-full rounded-lg border border-input bg-background p-3 text-base" />:<Input id={field} value={values[field]} disabled={busy} type={field==='email'?'email':field==='birthDate'?'date':field==='phone'?'tel':'text'} required={field==='fullName'} maxLength={field==='email'?254:field==='fullName'?120:30} onChange={event=>{setValues({...values,[field]:event.target.value});setErrors(validationErrors({...errors,[field]:undefined}));setDuplicate(false);setConfirmed(false)}} aria-invalid={!!errors[field]} aria-describedby={field+'-error'} className="min-h-12 text-base" />}{field==='adminNotes'&&<p id={field+'-hint'} className="text-xs leading-6 text-muted-foreground">Até 1.000 caracteres. Use apenas informações administrativas. Não insira dados de saúde, anamnese ou histórico médico.</p>}<p id={field+'-error'} className="text-sm text-red-300">{friendlyFieldError(errors[field]?.[0])}</p></div>)}
   {duplicate&&<label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} className="mt-2 size-5 shrink-0" />Conferi a carteira e confirmo que se trata de outro aluno com os mesmos dados.</label>}
   <Button type="submit" disabled={busy||duplicate&&!confirmed} className="min-h-12">{busy?'Salvando…':mode==='new'?'Cadastrar aluno':'Salvar alterações'}</Button>
  </form>}
  {mode==='profile'&&student&&!loading&&<StudentProfile student={student} busy={busy} download={()=>void download(true)} changeStatus={()=>student.status==='active'?dialog.current?.showModal():void changeStatus()}/>}
  <dialog ref={dialog} aria-labelledby="archive-title" aria-describedby="archive-description" className="fixed inset-0 m-auto max-h-[90dvh] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-border bg-background p-6 text-foreground backdrop:bg-black/70"><h2 id="archive-title" className="text-heading text-3xl">Arquivar aluno?</h2><p id="archive-description" className="my-5 text-sm leading-7 text-muted-foreground">O cadastro ficará arquivado e poderá ser reativado. Isso não exclui dados pessoais nem substitui uma solicitação formal de eliminação.</p><div className="flex flex-wrap gap-3"><Button className="min-h-11" variant="outline" autoFocus onClick={()=>dialog.current?.close()}>Manter ativo</Button><Button className="min-h-11" disabled={busy} onClick={()=>void changeStatus()}>Confirmar arquivamento</Button></div></dialog>
 </div>
}
