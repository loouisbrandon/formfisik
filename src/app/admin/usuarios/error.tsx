'use client'
import {Button} from '@/components/ui/button'
export default function ErrorPage({reset}:{reset:()=>void}){return <section role="alert" className="rounded-xl border border-border bg-card p-6"><h1 className="text-xl font-semibold">Não foi possível consultar os usuários</h1><p className="my-4 text-sm text-muted-foreground">Tente novamente em instantes.</p><Button onClick={reset}>Tentar novamente</Button></section>}
