'use client'
import {useEffect,useRef,type ReactNode} from 'react'
import {X} from 'lucide-react'
import styles from './media.module.css'
export function MediaDrawer({title,onClose,children,busy=false}:{busy?:boolean;title:string;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const trigger=document.activeElement as HTMLElement|null,el=dialog.current;el?.showModal();return()=>{el?.close();if(trigger?.isConnected)trigger.focus()}},[])
 return <dialog ref={dialog} className={styles.drawer} onCancel={e=>{e.preventDefault();onClose()}} aria-labelledby="media-drawer-title"><header><h2 id="media-drawer-title">{title}</h2><button type="button" aria-label="Fechar painel" disabled={busy} onClick={onClose}><X size={21}/></button></header><div className={styles.drawerBody}>{children}</div></dialog>
}
