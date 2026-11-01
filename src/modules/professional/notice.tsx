'use client'
import { createContext,useContext,useState,type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
const NoticeContext=createContext<{message:string;notify:(message:string)=>void}>({message:'',notify:()=>{}})
export function ProfessionalNoticeProvider({children}:{children:ReactNode}){const [message,notify]=useState('');return <NoticeContext.Provider value={{message,notify}}>{children}</NoticeContext.Provider>}
export function useProfessionalNotice(){return useContext(NoticeContext).notify}
export function ProfessionalNotice(){const {message,notify}=useContext(NoticeContext);return <div className={message?'mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 p-4':''}><p role="status" className="text-sm text-primary">{message}</p>{message&&<Button variant="ghost" className="min-h-11" onClick={()=>notify('')}>Fechar confirmação</Button>}</div>}
