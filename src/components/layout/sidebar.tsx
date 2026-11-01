import Link from 'next/link'
import { LogoutButton } from '@/modules/auth/logout-button'
import { Activity, UsersRound, LayoutDashboard, CreditCard, UserRound, LockKeyhole, Dumbbell, ClipboardList } from 'lucide-react'
import { professionalNavigation, futureModules, activeNavigation } from '@/modules/professional/navigation'
const icons = { assessments: Activity, workouts: ClipboardList, exercises: Dumbbell, students: UsersRound, dashboard: LayoutDashboard, subscription: CreditCard, account: UserRound }
export function Sidebar({ pathname, professional = true, onNavigate }: { pathname: string; professional?: boolean; onNavigate?: () => void }) {
  return <div className="flex h-full flex-col gap-8 p-5">
    <Link href={professional ? '/dashboard' : '/conta'} onClick={onNavigate} aria-label="FormFisik, início" className="w-fit rounded text-heading text-3xl tracking-wider text-primary focus-visible:outline-2 focus-visible:outline-primary">FORMFISIK</Link>
    <nav aria-label="Navegação profissional" className="space-y-2">
      {professionalNavigation.filter(item => professional || item.href === '/conta').map(item => { const Icon = icons[item.icon]; const active = activeNavigation(pathname, item.href); return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon aria-hidden="true" className="size-5 shrink-0" />{item.label}</Link> })}
    </nav>
    {professional && <section aria-label="Próximos módulos" className="border-t border-border pt-5"><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Em desenvolvimento</p><ul className="space-y-4">{futureModules.map(label => <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground"><LockKeyhole className="size-4 shrink-0" aria-hidden="true" /><span>{label}</span><span className="sr-only"> indisponível</span></li>)}</ul></section>}
    <div className="mt-auto space-y-5 border-t border-border pt-5"><LogoutButton /><p className="text-xs leading-6 text-muted-foreground">Seu espaço profissional.<br />Uma base para evoluir.</p></div>
  </div>
}
