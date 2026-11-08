'use client'
import {useEffect} from 'react'
import {toast} from './service'
export function ScreenError({reset}:{reset:()=>void}){useEffect(()=>{toast('Não foi possível abrir esta tela. Tente novamente.')},[]);return <section role="alert" className="space-y-4 rounded-xl border border-border bg-card p-6"><h1 className="text-2xl font-bold">Não foi possível abrir esta tela</h1><p>Seus registros foram preservados. Tente carregar a página novamente.</p><button className="min-h-11 rounded-lg border border-primary px-4 py-2 font-semibold hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary" onClick={reset}>Tentar novamente</button></section>}
