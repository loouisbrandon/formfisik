'use client'
import {useEffect,useRef} from 'react'
import {DemoPlayer} from './player'
import type {DemoReference} from './schema'
import {action} from '../exercises/browser'
export function MediaPreview({reference,onClose}:{reference:DemoReference;onClose:()=>void}){const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const trigger=document.activeElement as HTMLElement|null,el=dialog.current;el?.showModal();return()=>{el?.close();trigger?.focus()}},[]);return <dialog ref={dialog} onCancel={e=>{e.preventDefault();onClose()}} aria-labelledby="media-preview-title" className="relative m-auto max-h-[90dvh] w-[min(60rem,calc(100%_-_1rem))] overflow-y-auto rounded-2xl border border-border bg-background p-3 text-foreground backdrop:bg-black/80 sm:p-6"><div className="space-y-4"><h2 id="media-preview-title" className="text-heading text-3xl">Pré-visualização da demonstração</h2><button type="button" className={action} onClick={onClose} autoFocus>Fechar pré-visualização</button><DemoPlayer reference={reference}/></div></dialog>}
