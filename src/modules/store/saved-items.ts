'use client'
import {useState,useSyncExternalStore} from 'react'
import {catalogProducts} from './catalog'
const event='formfisik-store-saved'
export type SavedKind='likes'|'bag'
const key=(kind:SavedKind)=>`formfisik.store.${kind}.v1`
const valid=new Set(catalogProducts.map(p=>p.id))
export function parseSavedItems(raw:string|null):string[]{try{const value=JSON.parse(raw??'[]');return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==='string'&&valid.has(id)))].slice(0,50):[]}catch{return []}}
function subscribe(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener(event,callback);return ()=>{window.removeEventListener('storage',callback);window.removeEventListener(event,callback)}}
export function useSavedItems(kind:SavedKind){const [error,setError]=useState('');const raw=useSyncExternalStore(subscribe,()=>{try{return localStorage.getItem(key(kind))??'[]'}catch{return '[]'}},()=>'[]');const ids=parseSavedItems(raw);function toggle(id:string){if(!valid.has(id))return;try{const current=parseSavedItems(localStorage.getItem(key(kind)));localStorage.setItem(key(kind),JSON.stringify(current.includes(id)?current.filter(item=>item!==id):[...current,id].slice(0,50)));window.dispatchEvent(new Event(event));setError('')}catch{setError('Não foi possível salvar neste navegador. Verifique as permissões de armazenamento.')}}return {ids,toggle,error}}
