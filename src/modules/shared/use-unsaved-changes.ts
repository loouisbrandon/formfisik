'use client'
import {useEffect} from 'react'
// Progressive panels remain mounted. Multiple dirty forms share one navigation warning.
const drafts=new Map<symbol,string>()
const unload=(e:BeforeUnloadEvent)=>{if(drafts.size)e.preventDefault()}
const navigate=(e:MouseEvent)=>{if(e.defaultPrevented||!drafts.size||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;const a=(e.target as Element).closest?.('a[href]'),href=a?.getAttribute('href');if(!href||href.startsWith('#'))return;const message=drafts.size===1?[...drafts.values()][0]:'Existem alterações não salvas. Deseja descartá-las ao sair?';if(!window.confirm(message)){e.preventDefault();e.stopPropagation()}}
export function useUnsavedChanges(dirty:boolean,message:string){useEffect(()=>{if(!dirty)return;const key=Symbol('draft');if(!drafts.size){window.addEventListener('beforeunload',unload);document.addEventListener('click',navigate,true)}drafts.set(key,message);return()=>{drafts.delete(key);if(!drafts.size){window.removeEventListener('beforeunload',unload);document.removeEventListener('click',navigate,true)}}},[dirty,message])}
