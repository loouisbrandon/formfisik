'use client'
import {useId,useRef} from 'react'
import {FileText,ImageIcon,LoaderCircle,Paperclip,X} from 'lucide-react'
import {useCoachConversation} from './conversation'
import s from './chat.module.css'
export type CoachAttachment={id:string;name:string;size:number;kind:'image'|'pdf';state:'reading'|'ready'|'failed'}
export function ChatAttachments(){
 const {attachments,attachmentsOpen,setAttachmentsOpen}=useCoachConversation(),heading=useId(),panel=useRef<HTMLElement>(null)
 function dismiss(){const trigger=panel.current?.closest('section[aria-label="eCoach, assistente do personal"]')?.querySelector<HTMLButtonElement>('button[aria-label="Adicionar anexo"]');setAttachmentsOpen(false);trigger?.focus({preventScroll:true})}
 if(!attachmentsOpen)return null
 return <aside ref={panel} className={s.chatAttachments} aria-labelledby={heading} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();dismiss()}}}>
  <header><div><Paperclip size={18} aria-hidden/><h2 id={heading}>Anexos do chat <span>{attachments.length}</span></h2></div><button type="button" aria-label="Fechar anexos do chat" onClick={dismiss}><X size={18}/></button></header>
  <div className={s.attachmentList}>{attachments.length?attachments.map(item=><article key={item.id}>{item.kind==='pdf'?<FileText size={20} aria-hidden/>:<ImageIcon size={20} aria-hidden/>}<div><strong title={item.name}>{item.name}</strong><small>{item.kind==='pdf'?'PDF':'Imagem'} · {item.size<1048576?Math.max(1,Math.ceil(item.size/1024))+' KB':(item.size/1048576).toFixed(1)+' MB'}</small><span>{item.state==='reading'?<><LoaderCircle size={12} className={s.mediaSpinner}/> Lendo arquivo…</>:item.state==='ready'?'Leitura concluída · revise o rascunho':'Leitura não concluída · adicione novamente'}</span></div></article>):<p>Nenhum anexo adicionado nesta sessão da conversa.</p>}</div>
  <footer>Lista temporária desta sessão. Os arquivos originais não são salvos; apenas o texto que você enviar entra no histórico.</footer>
 </aside>
}
