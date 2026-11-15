'use client'
import {Heart,ShoppingBag} from 'lucide-react'
import {useSavedItems} from './saved-items'
import s from './shop.module.css'
export function LikeButton({id,name}:{id:string;name:string}){const {ids,toggle,error}=useSavedItems('likes');const liked=ids.includes(id);return <><button className={s.like} aria-label={`${liked?'Descurtir':'Curtir'} ${name}`} aria-pressed={liked} onClick={()=>toggle(id)}><Heart size={19} aria-hidden fill={liked?'currentColor':'none'}/></button>{error&&<p role="alert" className={s.error}>{error}</p>}</>}
export function ProductSaveActions({id,name}:{id:string;name:string}){const {ids,toggle,error}=useSavedItems('bag');return <div className={s.saveActions}><button className={s.add} onClick={()=>toggle(id)}><ShoppingBag size={20} aria-hidden/>{ids.includes(id)?'Remover da sacola':'Salvar na sacola'}</button><LikeButton id={id} name={name}/>{error&&<p role="alert">{error}</p>}<p>Seleção salva somente neste navegador. Não reserva estoque nem inicia uma compra.</p></div>}
