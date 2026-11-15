'use client'
import {useEffect} from 'react'
import {toast} from '@/modules/feedback/service'
import { Button } from '@/components/ui/button'
export default function DashboardError({ reset:retry }: { reset: () => void }) { useEffect(()=>{toast("Não foi possível abrir esta tela. Tente novamente.")},[]);return <section role="alert" className="space-y-5 rounded-2xl border border-border p-6"><h1 className="text-heading text-3xl">Não foi possível abrir o dashboard</h1><p className="text-muted-foreground">Tente carregar sua área profissional novamente.</p><Button onClick={retry}>Tentar novamente</Button></section> }
