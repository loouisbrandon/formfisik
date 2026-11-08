'use client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useFeedbackError } from '@/modules/feedback/hooks'
import { errorFallbacks } from '@/modules/feedback/messages'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import type { SubscriptionView } from './status'
import { subscriptionPlans, formatPlanAmount } from './plan'
import { billingDate, billingMoney } from './presentation'
import { AccessStatus, SubscriptionBadge } from './billing-components'
import s from './subscriptions.module.css'

export function SubscriptionResult() {
  const [status,setStatus]=useState<SubscriptionView|null>(null)
  const [busy,setBusy]=useState(true)
  const [error,setError]=useFeedbackError(errorFallbacks.default)
  const [attempt,setAttempt]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    async function check(){try{
      const response=await fetch(endpoints.billingStatus+'?refresh=1',{cache:'no-store',signal:controller.signal})
      if(response.status===401){window.location.replace('/login?reason=session');return}
      if(!response.ok)throw new Error('UNAVAILABLE')
      const data=await response.json()
      if(!controller.signal.aborted)setStatus(data)
    }catch{if(!controller.signal.aborted)setError('Não foi possível consultar sua assinatura agora. Tente atualizar novamente.')}
    finally{if(!controller.signal.aborted)setBusy(false)}}
    void check();return()=>controller.abort()
  },[attempt,setError])
  const confirmed=!!status?.paidAccess
  const Icon=confirmed?CheckCircle2:Clock3
  return <div className={s.resultGrid} aria-busy={busy}>
    <section className={s.resultCard} aria-labelledby="confirmation-status"><span className={s.resultIcon}><Icon size={32} aria-hidden/></span><h2 id="confirmation-status">{busy?'Conferindo sua assinatura…':confirmed?'Tudo pronto para continuar.':'Vamos conferir seu plano.'}</h2><p role="status">{busy?'Aguarde a confirmação da sua assinatura.':confirmed?'Seu acesso está confirmado. Seu próximo passo é organizar a rotina e acompanhar seus alunos.':'Ainda não há acesso ativo confirmado. Consulte a situação da assinatura antes de continuar.'}</p>
      <div className={s.resultActions}>{confirmed?<Link href="/dashboard">Ir para o dashboard <ArrowRight size={18} aria-hidden/></Link>:<Link href="/assinatura">Ver planos <ArrowRight size={18} aria-hidden/></Link>}<Link href="/assinatura/gerenciar">Gerenciar assinatura</Link></div>
      <div className={s.notice}><ShieldCheck size={19} aria-hidden/><p>{confirmed?'A confirmação considera a situação atual da assinatura. O período de teste não representa um pagamento recebido.':'O retorno do Checkout, por si só, não confirma sua assinatura ou libera o acesso.'}</p></div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button variant="outline" disabled={busy} className="min-h-11 font-ui" onClick={()=>{setBusy(true);setStatus(null);setError('');setAttempt(a=>a+1)}}><RefreshCw size={16} aria-hidden/>Atualizar confirmação</Button>
    </section>
    <section className={s.resultCard} aria-labelledby="confirmed-plan"><p className={s.eyebrow}>Sua assinatura</p><h2 id="confirmed-plan">{status?.planId?subscriptionPlans[status.planId].name:busy?<LoadingSkeleton variant="inline" label="Carregando plano…"/>:'Plano ainda não confirmado'}</h2>{status&&<SubscriptionBadge view={status}/>}
      <dl className={s.details}><div><dt>Valor contratado</dt><dd>{status?.contractedAmount?`${formatPlanAmount(status.contractedAmount)}/${status.billingInterval==='year'?'ano':'mês'}`:'Não disponível'}</dd></div><div><dt>Alunos ativos</dt><dd>{status?.planId?(status.studentLimit===null?'Ilimitados':`Até ${status.studentLimit}`):'Não disponível'}</dd></div><div><dt>Término do teste</dt><dd>{billingDate(status?.trialEnd??null)}</dd></div><div><dt>Próxima cobrança prevista</dt><dd>{status?.nextBillingAt?billingDate(status.nextBillingAt):'Sem data prevista'}</dd></div><div><dt>Valor previsto</dt><dd>{billingMoney(status?.nextBillingAmount??null)}</dd></div><div><dt>Periodicidade</dt><dd>{status?.billingInterval==='year'?'Anual — cobrança única':status?.billingInterval==='month'?'Mensal':'Não disponível'}</dd></div></dl>
      {status&&<div className="mt-6"><AccessStatus view={status}/></div>}
    </section>
  </div>
}
