import { cn } from '@/lib/utils'

/** Neutral placeholders only; status text remains available to assistive technology. */
export function LoadingSkeleton({ label = 'Carregando conteúdo', variant = 'list', className }: { label?: string; variant?: 'list' | 'page' | 'inline'; className?: string }) {
  return <span role="status" aria-live="polite" className={cn('relative block min-w-0 w-full',variant==='inline'?'py-1':'py-4',className)}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="block animate-pulse space-y-4 motion-reduce:animate-none">
      {variant==='page'&&<><span className="block h-8 w-56 max-w-full rounded-lg bg-muted"/><span className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0,1,2,3].map(i=><span key={i} className="block h-24 rounded-xl border border-border bg-card p-4"><span className="block h-3 w-3/4 rounded bg-muted"/><span className="mt-4 block h-6 w-1/3 rounded bg-muted"/></span>)}</span></>}
      {variant==='inline'?<span className="block h-5 w-40 max-w-full rounded bg-muted"/>:<span className="block rounded-xl border border-border bg-card p-4"><span className="mb-5 block h-5 w-1/3 rounded bg-muted"/>{[0,1,2].map(i=><span key={i} className="flex min-w-0 items-center gap-4 border-t border-border py-4"><span className="block size-9 shrink-0 rounded-full bg-muted"/><span className="block flex-1 space-y-2"><span className="block h-3 w-2/3 rounded bg-muted"/><span className="block h-2 w-1/3 rounded bg-muted"/></span><span className="block h-7 w-16 rounded bg-muted"/></span>)}</span>}
    </span>
  </span>
}
