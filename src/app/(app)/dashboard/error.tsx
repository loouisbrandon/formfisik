'use client'
import { Button } from '@/components/ui/button'
export default function DashboardError({ retry }: { retry: () => void }) { return <section role="alert" className="space-y-5 rounded-2xl border border-border p-6"><h1 className="text-heading text-3xl">Não foi possível abrir o dashboard</h1><p className="text-muted-foreground">Tente carregar sua área profissional novamente.</p><Button onClick={retry}>Tentar novamente</Button></section> }
