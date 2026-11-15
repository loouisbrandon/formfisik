'use client'
import {CalendarDays,Clock3,FileText,TriangleAlert} from 'lucide-react'
import type {Card,Stage} from './schema'
import styles from './crm.module.css'
export const intakeLabels:Record<string,string>={none:'Não solicitada',waiting:'Aguardando resposta',received:'Resposta recebida',reviewing:'Em revisão',reviewed:'Revisada',expired:'Solicitação expirada',revoked:'Solicitação revogada'}
export function nextAction(c:Card){return c.overdue?'Verificar tarefas atrasadas':c.intake==='received'||c.intake==='reviewing'?'Revisar anamnese':c.intake==='waiting'?'Aguardar anamnese':c.workout!=='active'?'Preparar treino':c.checkin_review?'Revisar check-in':c.checkin_overdue?'Verificar check-in pendente':c.delivery_overdue?'Revisar entrega atrasada':c.pending?'Consultar tarefas abertas':c.next_appointment?'Preparar atendimento':'Definir próxima ação'}
export const stamp=(value:string)=>new Date(value).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
export const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('')
export function CrmCard({card,stage,onMove,onTasks,onOpen,onDrag}:{card:Card;stage?:Stage;onMove:()=>void;onTasks:()=>void;onOpen:()=>void;onDrag?:(id:string|null)=>void}){
 return <article draggable={card.status==='active'} onDragStart={e=>{e.dataTransfer.setData('application/x-formfisik-crm',card.id);e.dataTransfer.effectAllowed='move';onDrag?.(card.id)}} onDragEnd={()=>onDrag?.(null)} aria-label={'Atendimento de '+card.full_name} className={styles.card}>
 <button className={styles.identity} onClick={onOpen} aria-label={'Detalhes de '+card.full_name}><span className={styles.avatar} aria-hidden>{initials(card.full_name)}</span><span><strong>{card.full_name}</strong><span className={styles.badge}>{stage?.name}</span></span></button>
 <p className={styles.line}><FileText aria-hidden/>{nextAction(card)}</p>
 {card.next_due_at&&<p className={styles.line+' '+(card.overdue?styles.danger:styles.muted)}>{card.overdue?<TriangleAlert aria-hidden/>:<Clock3 aria-hidden/>}{card.overdue?'Atrasada · ':''}{stamp(card.next_due_at)}</p>}
 {card.next_appointment&&<p className={styles.line}><CalendarDays aria-hidden/>{stamp(card.next_appointment)}</p>}
 <p className={'text-xs '+styles.muted}>{card.pending} tarefas abertas · {card.days_in_stage} dia(s) na etapa{card.status==='archived'?' · Aluno arquivado':''}</p>
 <div className={styles.cardActions}><button disabled={card.status!=='active'} onClick={onMove} aria-label={'Mover '+card.full_name}>Mover etapa</button><button aria-label={'Tarefas de '+card.full_name} onClick={onTasks}>+ Tarefa</button></div>
 </article>
}
