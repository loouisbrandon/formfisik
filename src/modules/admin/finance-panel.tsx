'use client'
import type {ReactNode} from 'react'
import {useNavigationState} from '@/modules/professional/navigation-memory'
export function FinancePanel({id,title,initialOpen=false,children}:{id:string;title:string;initialOpen?:boolean;children:ReactNode}){
 const [open,setOpen]=useNavigationState('admin-finance:'+id,initialOpen)
 return <details open={open} onToggle={e=>setOpen(e.currentTarget.open)} className="rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-semibold">{title}</summary><div className="mt-5">{children}</div></details>
}
