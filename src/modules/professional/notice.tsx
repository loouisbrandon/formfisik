'use client'
import {createContext,useContext,type ReactNode} from 'react'
import {toast} from '../feedback/service'
const notify=(message:string)=>{if(message)toast(message,'success','Operação concluída.')}
const NoticeContext=createContext(notify)
export function ProfessionalNoticeProvider({children}:{children:ReactNode}){return <NoticeContext.Provider value={notify}>{children}</NoticeContext.Provider>}
export function useProfessionalNotice(){return useContext(NoticeContext)}
export function ProfessionalNotice(){return null}
