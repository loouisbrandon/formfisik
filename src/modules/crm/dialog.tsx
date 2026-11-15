'use client'
import {useEffect,useId,useRef,type ReactNode} from 'react'
import {X} from 'lucide-react'
import styles from './crm.module.css'
export function CrmDialog({title,children,onClose,drawer=false,busy=false}:{title:string;children:ReactNode;onClose:()=>void;drawer?:boolean;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),id=useId()
 useEffect(()=>{const trigger=document.activeElement as HTMLElement|null,dialog=ref.current;dialog?.showModal();return()=>{dialog?.close();if(trigger?.isConnected)trigger.focus()}},[])
 return <dialog ref={ref} className={drawer?styles.drawer:styles.modal} aria-labelledby={id} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}><header className={styles.dialogHeader}><h2 id={id}>{title}</h2><button type="button" aria-label={'Fechar '+title} disabled={busy} onClick={onClose}><X aria-hidden size={20}/></button></header><div className={styles.dialogBody}>{children}</div></dialog>
}
