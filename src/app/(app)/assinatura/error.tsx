'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
export default function SubscriptionError({ retry }: { retry: () => void }) {
  return <div className="auth-surface flex  items-center justify-center px-4 py-10"><section className="premium-surface w-full max-w-lg space-y-5 rounded-2xl border border-border p-6">
    <h1 className="text-heading text-4xl">Não foi possível abrir sua assinatura</h1>
    <p role="alert" className="leading-7 text-muted-foreground">Tente novamente em instantes ou volte à sua conta para continuar.</p>
    <Button onClick={retry} className="min-h-12 w-full">Tentar novamente</Button>
    <Link href="/conta" className="inline-block min-h-11 py-3 text-primary underline underline-offset-4">Ir para minha conta</Link>
  </section></div>
}
