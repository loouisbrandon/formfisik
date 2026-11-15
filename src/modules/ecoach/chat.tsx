'use client'
import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {ArrowUp,Square,Settings2,Upload,CalendarDays,ChartNoAxesCombined,CheckCheck,Dumbbell,MessagesSquare,Plus,Sparkles,UsersRound} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {confirmAction} from '@/modules/feedback/service'
import styles from './chat.module.css'
import {useCoachConversation} from './conversation'
import {useCoachMedia} from './media'
import {ChatAttachments} from './attachments'
import {ConversationHistory} from './history'
import {CoachProposal} from './proposal'
import Link from 'next/link'
import {ContextBar,useCoachContext} from './context'

const capabilities=[
  {icon:Dumbbell,title:'Treinos e exercícios',description:'Planejar treinos, sugerir exercícios e adaptar a rotina.',prompt:'Como você poderá me ajudar a montar um treino?'},
  {icon:UsersRound,title:'Alunos e acompanhamento',description:'Organizar alunos, anamneses e evolução em um só lugar.',prompt:'Como você poderá acompanhar meus alunos?'},
  {icon:CalendarDays,title:'Agenda organizada',description:'Consultar compromissos e lembrar dos próximos atendimentos.',prompt:'Como você poderá organizar minha agenda?'},
  {icon:CheckCheck,title:'Check-ins e evolução',description:'Analisar respostas e preparar resumos para sua revisão.',prompt:'Como você poderá analisar os check-ins?'},
  {icon:ChartNoAxesCombined,title:'Financeiro e indicadores',description:'Entender resultados e preparar relatórios da operação.',prompt:'Como você poderá me ajudar com o financeiro?'},
  {icon:MessagesSquare,title:'Comunicação conectada',description:'Apoiar conversas e mensagens pelo WhatsApp e Instagram.',prompt:'Como funcionarão WhatsApp e Instagram?'},
]
export function ECoachChat({compact=false}:{compact?:boolean}){
  const {draft,setDraft,messages,respond,clearConversation,generating,authorize,historyBusy,historyError,active,runtime,loadPermission,cancelRequest,conversationEpoch}=useCoachConversation()
  const screenContext=useCoachContext()
  const [historyHost,setHistoryHost]=useState<HTMLDivElement|null>(null),[historyOpen,setHistoryOpen]=useState(false)
  const [notice,setNotice]=useState(''),[away,setAway]=useState(false),[dragging,setDragging]=useState(false)
  const dragDepth=useRef(0)
  const media=useCoachMedia({disabled:historyBusy||generating||!runtime.ready,epoch:conversationEpoch,authorize,onNotice:setNotice,onText:(text,submit)=>{const value=[draft,text].filter(Boolean).join('\n\n');if(value.length>2000){setNotice('O conteúdo não cabe no rascunho. Encurte a mensagem antes de tentar novamente.');return}setDraft(value);if(submit)void send(value);else input.current?.focus({preventScroll:true})}})
  const transcript=useRef<HTMLDivElement>(null),transcriptContent=useRef<HTMLDivElement>(null),follow=useRef(true),scrollIntent=useRef(0)
  function latest(){follow.current=true;setAway(false);const box=transcript.current;if(box)box.scrollTop=box.scrollHeight}
  useLayoutEffect(()=>{if(follow.current){const box=transcript.current;if(box)box.scrollTop=box.scrollHeight}},[messages.length])
  useEffect(()=>{const box=transcript.current,body=transcriptContent.current;if(!box||!body)return;const observer=new ResizeObserver(()=>{if(follow.current)box.scrollTop=box.scrollHeight});observer.observe(box);observer.observe(body);return()=>observer.disconnect()},[])
  const input=useRef<HTMLTextAreaElement>(null),sending=useRef(false)
  useEffect(()=>{void loadPermission().catch(()=>{})},[loadPermission])
  useEffect(()=>{if(compact)input.current?.focus({preventScroll:true})},[compact])
  async function send(override?:string){
    const value=(override??draft).trim();if(!value||messages.length>=40||generating||historyBusy||sending.current)return
    sending.current=true
    try{if(!await authorize())return}catch{setNotice('Não foi possível carregar as permissões. Tente novamente.');return}finally{sending.current=false}
    const capability=capabilities.find(item=>item.prompt===value)||capabilities.find(item=>item.title.toLocaleLowerCase('pt-BR').split(' ').some(word=>word.length>4&&value.toLocaleLowerCase('pt-BR').includes(word)))
    follow.current=true;setAway(false);setNotice('')
    const saved=await respond(value,capability?.title==='Treinos e exercícios'?'Estruturando exemplo de treino…':capability?.title==='Financeiro e indicadores'?'Organizando exemplo de resumo financeiro…':'Estruturando a resposta…',screenContext)
    if(!saved)return
    setDraft('');setNotice('');input.current?.focus({preventScroll:true})
  }
  async function reset(){if(draft&&!(await confirmAction('Descartar rascunho não enviado e iniciar outra conversa?')))return;follow.current=true;setAway(false);clearConversation();setNotice('');input.current?.focus({preventScroll:true})}
  return <section className={`${styles.workspace} ${compact?styles.compact:''} ${dragging?styles.dragging:''}`} onDragEnter={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();dragDepth.current++;setDragging(true)}}} onDragOver={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();e.dataTransfer.dropEffect='copy'}}} onDragLeave={e=>{e.preventDefault();if(--dragDepth.current<=0){dragDepth.current=0;setDragging(false)}}} onDrop={e=>{e.preventDefault();dragDepth.current=0;setDragging(false);if(e.dataTransfer.files.length)void media.attach(e.dataTransfer.files)}} aria-label="eCoach, assistente do personal">
    {dragging&&<div className={styles.dropOverlay}><Upload size={36} aria-hidden/><strong>Solte seu arquivo aqui</strong><span>Imagem ou PDF · adicionar ao rascunho</span></div>}
    <div className={styles.chatLayout}>
    {!compact&&<aside className={styles.historyRail} aria-label="Conversas do eCoach" hidden={!historyOpen}><div ref={setHistoryHost} className={styles.historyHost}/></aside>}
    <div className={styles.chatMain}>
    {!compact&&<header className={styles.header}><div className={styles.identity}><span className={styles.mark}><Sparkles aria-hidden/></span><div><h1>eCoach <span>{runtime.enabled?'IA':'PRÉVIA'}</span></h1><p>{active?.title??'A inteligência ao lado do personal.'}</p></div></div><div className="flex flex-wrap items-center gap-2"><ConversationHistory dock={historyHost} onOpenChange={setHistoryOpen}/><Button variant="outline" nativeButton={false} render={<Link href="/configuracoes?section=ecoach"/>}><Settings2 size={16} aria-hidden/> Ajustes</Button><Button variant="outline" disabled={historyBusy} onClick={reset}><Plus size={16} aria-hidden/> Nova conversa</Button></div></header>}
    {!compact&&<ContextBar/>}
    <div className={styles.canvas}>
      <ChatAttachments/>
      <div ref={transcript} className={styles.transcript} tabIndex={0} aria-label="Histórico da conversa" onWheel={()=>{scrollIntent.current=Date.now()}} onTouchMove={()=>{scrollIntent.current=Date.now()}} onPointerDown={()=>{scrollIntent.current=Date.now()}} onKeyDown={event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))scrollIntent.current=Date.now()}} onScroll={event=>{const box=event.currentTarget;const near=box.scrollHeight-box.scrollTop-box.clientHeight<72;if(near){follow.current=true;setAway(false)}else if(Date.now()-scrollIntent.current<700){follow.current=false;setAway(true)}}}><div ref={transcriptContent} className={styles.transcriptContent}>{!messages.length?<div className={styles.welcome}><span className={styles.heroMark}><Sparkles aria-hidden/></span><p className={styles.eyebrow}>SEU PRÓXIMO PASSO, COM MAIS INTELIGÊNCIA</p><h2>Mais tempo para cuidar.<br/><span>Mais espaço para evoluir.</span></h2><p className={styles.intro}>{runtime.enabled?'Consulte seu financeiro e sua agenda. Prepare treinos, anamneses e agendamentos para revisar e confirmar. Adicione imagens e PDFs ao rascunho ou dite sua mensagem. Atendimento assistido disponível em Comunicação; canais externos e check-ins ainda estão em desenvolvimento.':'Conheça o que o eCoach poderá fazer pela sua rotina. Escolha uma ideia e comece uma conversa demonstrativa.'}</p><div className={styles.grid}>{capabilities.map(item=><button key={item.title} className={styles.capability} onClick={()=>{setDraft(item.prompt);input.current?.focus({preventScroll:true})}}><item.icon size={21} aria-hidden/><strong>{item.title}</strong><span>{item.description}</span></button>)}</div></div>:<div className={styles.messages} role="log" aria-label="Conversa com eCoach" aria-live="polite" aria-busy={generating||historyBusy}>{messages.map((message,index)=><article key={index} className={message.role==='user'?styles.user:styles.assistant}><span className={styles.author}>{message.role==='user'?'Você':<><Sparkles size={15} aria-hidden/> eCoach{message.mode==='ai'?' · IA':message.mode==='policy'?' · orientação de escopo':' · exemplo'}</>}</span><p>{message.text}{message.phase&&message.text&&<span className={styles.cursor} aria-hidden/>}</p>{message.context&&<small className={styles.messageContext}>Contexto: {message.context.module}{message.context.period&&` · ${message.context.period.from} a ${message.context.period.to}`}{message.context.filters?.map(filter=>` · ${filter.label}: ${filter.value}`).join('')}{message.context.record&&` · ${message.context.record.kind==='student'?'Aluno':'Cobrança'} ${message.context.record.id.slice(0,8)}`}</small>}{message.sources?.length? <div className="mt-3 flex flex-wrap gap-2 text-xs">{message.sources.map((source,i)=><Link key={i} href={source.href} className="rounded-lg border border-border px-2 py-1 text-primary">{source.label}</Link>)}</div>:null}{message.proposalId&&<CoachProposal id={message.proposalId}/>} {message.phase&&<div className={styles.thinking} aria-hidden><span/><span/><span/><small>{message.phase}</small></div>}</article>)}</div>}
      </div></div>
      <div className={styles.composerArea}>{away&&messages.length>0&&<button type="button" className={styles.latest} onClick={latest}><ArrowUp className="rotate-180" size={15} aria-hidden/> Ir para as últimas mensagens</button>}<form className={styles.composer} onSubmit={event=>{event.preventDefault();if(!media.recording&&!media.processing)void send()}}><label className="sr-only" htmlFor={compact?"ecoach-finder-message":"ecoach-message"}>Mensagem para o eCoach</label>{media.recorderUI}{!media.recording&&<textarea ref={input} id={compact?"ecoach-finder-message":"ecoach-message"} placeholder="O que vamos organizar hoje?" value={draft} maxLength={2000} rows={2} disabled={media.processing||historyBusy||generating} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();if(!media.processing)void send()}}}/>}<div className={styles.tools}><div>{media.controls}<span>{media.processing?'Preparando conteúdo…':runtime.enabled?'IA · alterações com confirmação':'Prévia interativa'}</span></div><button type="button" className={styles.send} disabled={media.processing||(!media.recording&&!historyBusy&&!generating&&(!draft.trim()||messages.length>=40))} onClick={()=>{if(historyBusy||generating)cancelRequest();else if(media.recording)media.finish(true);else void send()}} aria-label={historyBusy||generating?'Parar resposta':media.recording?'Transcrever e enviar':'Enviar mensagem'}>{historyBusy||generating?<Square size={17} fill="currentColor" aria-hidden/>:<ArrowUp size={20} aria-hidden/>}</button></div></form><p role="status" className={styles.notice}>{notice||historyError||(historyBusy?'Consultando e preparando a resposta…':'')||messages.at(-1)?.phase|| (messages.length>=40?'Limite da prévia atingido. Inicie uma nova conversa.':runtime.enabled?'Esporte, saúde e gestão do personal · Revise as respostas · Conversas salvas.':'Prévia sem IA · Conversas salvas na sua conta · Sem ações reais.')}</p><p className={styles.footnote}>Áudio e anexos viram texto para revisão. Arquivos temporários; somente a mensagem enviada fica no histórico.</p></div>
    </div>
    </div></div>
  </section>
}
