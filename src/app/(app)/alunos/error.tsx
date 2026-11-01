'use client'
import {Button} from '@/components/ui/button'
export default function Error({retry}:{retry:()=>void}){return <section role="alert" className="space-y-5"><h1 className="text-heading text-3xl">Não foi possível carregar a carteira</h1><Button className="min-h-11" onClick={retry}>Tentar novamente</Button></section>}
