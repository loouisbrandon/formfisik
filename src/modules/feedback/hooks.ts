'use client'
import {useCallback,useRef,useState,type SetStateAction} from 'react'
import {friendlyMessage} from './messages'
import {toast} from './service'
export function useFeedbackError(fallback='Não foi possível concluir a ação. Tente novamente.'){
 const [value,setValue]=useState(''),latest=useRef('')
 const update=useCallback((action:SetStateAction<string>)=>{const raw=typeof action==='function'?action(latest.current):action;if(!raw){latest.current='';setValue('');return}const safe=friendlyMessage(raw,fallback);latest.current=safe;setValue(safe);toast(safe,'error',fallback)},[fallback])
 return [value,update] as const
}
export function useFeedbackMessage(initial='',fallback='Não foi possível concluir a ação. Tente novamente.'){
 const [value,setValue]=useState(()=>friendlyMessage(initial,initial?'Confira as informações para continuar.':'')),latest=useRef(value)
 const update=useCallback((action:SetStateAction<string>)=>{const raw=typeof action==='function'?action(latest.current):action;if(!raw){latest.current='';setValue('');return}const safe=friendlyMessage(raw,fallback);latest.current=safe;setValue(safe);const error=/(?:não foi|não é possível|falha|erro|inválid|indisponível|expirad|incorret|não confere)/i.test(safe)||/^(?:Confira|Selecione|Informe|Aguarde)/i.test(safe);if(error)toast(safe,'error',fallback)},[fallback])
 return [value,update] as const
}
