'use client'
import {useEffect} from 'react'
import {toast} from '@/modules/feedback/service'
import {Button} from '@/components/ui/button'
export default function Error({reset:retry}:{reset:()=>void}){useEffect(()=>{toast("Não foi possível abrir esta tela. Tente novamente.")},[]);return <section role="alert" className="space-y-5"><h1 className="text-heading text-3xl">Não foi possível carregar a carteira</h1><Button className="min-h-11" onClick={retry}>Tentar novamente</Button></section>}
