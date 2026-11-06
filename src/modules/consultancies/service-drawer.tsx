'use client'
import {useEffect,useId,useRef,type ReactNode} from 'react'
import {X} from 'lucide-react'
import styles from './consultancies.module.css'
export function ServiceDrawer({children,onClose,busy,title,closeLabel='Fechar serviço'}:{children:ReactNode;onClose:()=>void;busy:boolean;title:string;closeLabel?:string}){const dialog=useRef<HTMLDialogElement>(null),id=useId();useEffect(()=>{const trigger=document.activeElement as HTMLElement|null,element=dialog.current;element?.showModal();return()=>{element?.close();if(trigger?.isConnected)trigger.focus()}},[]);return <dialog ref={dialog} aria-labelledby={id} className={styles.drawer} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}><header><h2 id={id}>{title}</h2><button type="button" disabled={busy} aria-label={closeLabel} onClick={onClose}><X size={21}/></button></header><div className={styles.drawerBody}>{children}</div></dialog>}
