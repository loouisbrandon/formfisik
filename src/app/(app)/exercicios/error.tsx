'use client'
import {useEffect} from 'react'
import {toast} from '@/modules/feedback/service'
export default function ErrorPage({reset:retry}:{reset:()=>void}){useEffect(()=>{toast("Não foi possível abrir esta tela. Tente novamente.")},[]);return <section role="alert" className="space-y-4"><h1 className="text-heading text-3xl">Biblioteca indisponível</h1><p>Tente novamente em alguns instantes.</p><button className="min-h-12 rounded-xl border border-border px-4 focus-visible:outline-2 focus-visible:outline-primary" onClick={retry}>Tentar novamente</button></section>}
