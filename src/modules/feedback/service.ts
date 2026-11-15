'use client'
import {friendlyMessage} from './messages'
export type ToastKind='error'|'success'|'info'
export type Toast={id:number;kind:ToastKind;message:string;duration:number}
export type Decision={id:number;message:string;title:string;confirmLabel:string;danger:boolean;input:boolean;initial:string}
type State={toasts:Toast[];decision:Decision|null}
const empty:State={toasts:[],decision:null}
let state:State=empty,sequence=0,ready=0,resolver:((value:boolean|string|null)=>void)|undefined,navigate:((href:string)=>void)|undefined,onAccepted:(()=>void)|undefined
const listeners=new Set<()=>void>()
const emit=()=>{for(const listen of listeners)listen()}
export const subscribe=(listen:()=>void)=>{listeners.add(listen);return()=>{listeners.delete(listen)}}
export const getFeedback=()=>state
export const getServerFeedback=()=>empty
export function dismissToast(id:number){state={...state,toasts:state.toasts.filter(t=>t.id!==id)};emit()}
export function toast(message:string,kind:ToastKind='error',fallback?:string){if(typeof window==='undefined')return;const safe=friendlyMessage(message,fallback??(kind==='error'?'Não foi possível concluir a ação. Tente novamente.':'Operação concluída.'));if(!safe)return;if(state.toasts.some(t=>t.message===safe&&t.kind===kind))return;state={...state,toasts:[...state.toasts.slice(-2),{id:++sequence,kind,message:safe,duration:5000}]};emit()}
function ask(message:string,input=false,initial='',accepted?:()=>void):Promise<boolean|string|null>{if(typeof window==='undefined'||!ready||resolver)return Promise.resolve(input?null:false);const discard=/descartar|sair sem salvar/i.test(message),remove=/remover|excluir|revogar|invalidar/i.test(message),cancel=/^cancelar/i.test(message);const decision:Decision={id:++sequence,message,title:input?'Informe o motivo':discard?'Descartar alterações?':remove?'Confirmar remoção?':cancel?'Confirmar cancelamento?':'Confirmar ação',confirmLabel:input?'Confirmar':discard?'Descartar alterações':remove?'Confirmar remoção':cancel?'Confirmar cancelamento':'Confirmar',danger:discard||remove||cancel,input,initial};return new Promise(resolve=>{resolver=resolve;onAccepted=accepted;state={...state,decision};emit()})}
export async function confirmAction(message:string,accepted?:()=>void){return (await ask(message,false,'',accepted))===true}
export async function requestInput(message:string,initial=''){const result=await ask(message,true,initial);return typeof result==='string'?result:null}
export function settleDecision(value:boolean|string|null){const resolve=resolver,accept=onAccepted;resolver=undefined;onAccepted=undefined;if(value===true){try{accept?.()}catch{value=false;toast('Não foi possível abrir a página. Tente novamente.')}}state={...state,decision:null};emit();resolve?.(value)}
export function attachFeedback(route:(href:string)=>void){ready++;navigate=route;return()=>{ready--;if(!ready){navigate=undefined;settleDecision(false);state=empty;emit()}}}
export function navigateAfterConfirmation(href:string){if(navigate)navigate(href);else window.location.assign(href)}
export function reportError(value:unknown,fallback='Não foi possível concluir a ação. Tente novamente.'){if(value instanceof Error&&value.name==='AbortError')return '';const safe=friendlyMessage(value,fallback)||fallback;toast(safe,'error',fallback);return safe}
export function validationErrors<T>(errors:T):T{if(errors&&typeof errors==='object'&&Object.values(errors).some(value=>Array.isArray(value)?value.length>0:Boolean(value)))toast('Confira os campos antes de continuar.');return errors}
