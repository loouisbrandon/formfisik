'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {confirmAction} from '@/modules/feedback/service'
export function AccountSecurity({id,disabled,self,closure}:{id:string;disabled:boolean;self:boolean;closure:boolean}){
 const [reason,setReason]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const router=useRouter()
 async function submit(){if(busy||!reason)return;setBusy(true);setMessage('');try{
  const accepted=await confirmAction(disabled?'Reativar esta conta? Será necessário um novo login. A assinatura não será alterada.':'Bloquear esta conta? As sessões serão encerradas imediatamente. A assinatura e as cobranças não serão canceladas.')
  if(!accepted)return
  const response=await fetch('/api/admin/usuarios/'+id+'/seguranca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({disabled:!disabled,expectedDisabled:disabled,reason})});const data=await response.json();setMessage(data.message??'Não foi possível concluir.');if(response.ok){setReason('');router.refresh()}
 }catch{setMessage('Não foi possível concluir agora. Tente novamente.')}finally{setBusy(false)}}
 return <section className="rounded-xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Controle de acesso</h2><p className="my-3 text-sm leading-6 text-muted-foreground">O bloqueio encerra sessões e impede novos logins. Não exclui dados nem cancela a assinatura.</p>{self?<p className="text-sm text-muted-foreground">Você não pode alterar o bloqueio da própria conta.</p>:disabled&&closure?<p className="text-sm text-muted-foreground">Conta em encerramento. A reativação não está disponível.</p>:<><label className="flex max-w-lg flex-col gap-2 text-sm">Motivo obrigatório<select value={reason} onChange={e=>setReason(e.target.value)} disabled={busy} className="min-h-11 rounded-lg border border-border bg-background px-3"><option value="">Selecione um motivo</option><option value="owner_request">Solicitação do titular</option><option value="security_incident">Incidente de segurança</option><option value="administrative_review">Revisão administrativa</option></select></label><Button className="mt-4" variant={disabled?'default':'destructive'} disabled={busy||!reason} onClick={()=>void submit()}>{busy?'Aguarde…':disabled?'Reativar conta':'Bloquear conta'}</Button></>}<p role="status" className="mt-3 text-sm">{message}</p></section>
}
