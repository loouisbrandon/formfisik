'use client'
import {useRouter} from 'next/navigation'
import {Brain,Search,Expand,X,Plus} from 'lucide-react'
import {CommandSearch} from './command-search'
import {ECoachChat} from '../ecoach/chat'
import {useCoachConversation} from '../ecoach/conversation'
import {useNavigationState} from '../professional/navigation-memory'
import {ContextBar} from '../ecoach/context'
import {ConversationHistory} from '../ecoach/history'
import {confirmAction} from '../feedback/service'
import s from './search.module.css'
export function Finder({onClose}:{onClose:()=>void}){
 const [mode,setMode]=useNavigationState<'search'|'coach'>('finder:mode','search')
 const {setDraft,clearConversation,draft,runtime}=useCoachConversation(),router=useRouter()

 async function reset(){if(draft&&!(await confirmAction('Descartar rascunho não enviado e iniciar outra conversa?')))return;clearConversation()}
 return <div className={`${s.finder} ${mode==='coach'?s.finderCoach:''}`}><div className={s.modeBar}><div className={s.modes} role="group" aria-label="Modo do Finder"><button aria-pressed={mode==='search'} onClick={()=>setMode('search')}><Search size={16} aria-hidden/> Buscar</button><button aria-pressed={mode==='coach'} onClick={()=>setMode('coach')}><Brain size={16} aria-hidden/> eCoach <small>{runtime.enabled?'IA':'PRÉVIA'}</small></button></div><div className={s.finderActions}>{mode==='coach'&&<><ConversationHistory/><button aria-label="Nova conversa" title="Nova conversa" onClick={reset}><Plus size={17}/></button><button aria-label="Expandir conversa" title="Expandir conversa" onClick={()=>{onClose();router.push('/ecoach')}}><Expand size={17}/></button></>}<button aria-label="Fechar Finder" onClick={onClose}><X size={18}/></button></div></div>{mode==='search'?<CommandSearch onClose={onClose} onAsk={text=>{if(text.trim())setDraft(text);setMode('coach')}}/>:<><ContextBar/><ECoachChat compact/></>}</div>
}
