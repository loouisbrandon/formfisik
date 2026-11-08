'use client'
import {useEffect} from 'react'
import {confirmAction,navigateAfterConfirmation} from '../feedback/service'
// Progressive panels share one guard. No beforeunload/native browser confirmation.
const drafts=new Map<symbol,string>()
let pending=false,traversing:string|undefined
const text=()=>drafts.size===1?[...drafts.values()][0]:'Existem alterações não salvas. Deseja descartá-las ao sair?'
const navigate=(e:MouseEvent)=>{if(e.defaultPrevented||!drafts.size||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;const a=(e.target as Element).closest?.('a[href]') as HTMLAnchorElement|null,href=a?.getAttribute('href');if(!a||!href||href.startsWith('#')||a.target==='_blank'||a.hasAttribute('download'))return;e.preventDefault();e.stopImmediatePropagation();if(pending)return;pending=true;void confirmAction(text()).then(accepted=>{if(accepted)navigateAfterConfirmation(a.href)}).finally(()=>{pending=false})}
type Navigation=EventTarget&{traverseTo:(key:string)=>unknown}
const historyNavigate=(e:Event)=>{const n=e as Event&{navigationType?:string;destination?:{key:string}};if(n.navigationType!=='traverse'||!drafts.size)return;if(traversing===n.destination?.key){traversing=undefined;return}if(!n.cancelable||!n.destination)return;n.preventDefault();if(pending)return;pending=true;const key=n.destination.key;void confirmAction(text()).then(accepted=>{if(accepted){traversing=key;(window as Window&{navigation?:Navigation}).navigation?.traverseTo(key)}}).finally(()=>{pending=false})}
export function useUnsavedChanges(dirty:boolean,message:string){useEffect(()=>{if(!dirty)return;const key=Symbol('draft');if(!drafts.size){document.addEventListener('click',navigate,true);(window as Window&{navigation?:Navigation}).navigation?.addEventListener('navigate',historyNavigate)}drafts.set(key,message);return()=>{drafts.delete(key);if(!drafts.size){document.removeEventListener('click',navigate,true);(window as Window&{navigation?:Navigation}).navigation?.removeEventListener('navigate',historyNavigate)}}},[dirty,message])}
