'use client'
import {useEffect,useId,useRef,type ReactNode} from 'react'
import {CalendarDays,X} from 'lucide-react'
import styles from './agenda.module.css'
export function AppointmentDialog({title,date,busy,error,onClose,children,returnFocus}:{title:string;date:string;busy:boolean;error:string;onClose:()=>void;children:ReactNode;returnFocus?:HTMLElement|null}){
 const dialog=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),id=useId(),focusTarget=useRef(returnFocus)
 useEffect(()=>{const opener=focusTarget.current??document.activeElement as HTMLElement|null;const node=dialog.current;node?.showModal();heading.current?.focus();return()=>{node?.close();requestAnimationFrame(()=>{if(opener?.isConnected)opener.focus({preventScroll:true})})}},[])
 const label=/^\d{4}-\d{2}-\d{2}$/.test(date)?new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):''
 return <dialog ref={dialog} aria-labelledby={id} aria-describedby={id+'-date'} className={styles.appointmentDialog} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}>
  <header className={styles.modalHeader}><span className={styles.modalIcon}><CalendarDays aria-hidden="true"/></span><div><h2 ref={heading} tabIndex={-1} id={id}>{title}</h2><p id={id+'-date'}>{label}</p></div><button type="button" aria-label="Fechar agendamento" disabled={busy} onClick={onClose}><X aria-hidden="true"/></button></header>
  <div className={styles.modalContent}>{error&&<p role="alert" className={styles.modalError}>{error}</p>}{children}</div>
 </dialog>
}
