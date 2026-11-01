export const professionalNavigation = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Alunos', href: '/alunos', icon: 'students' },
  { label: 'Exercícios', href: '/exercicios', icon: 'exercises' },
  { label: 'Treinos', href: '/treinos', icon: 'workouts' },
  { label: 'Acompanhamento', href: '/acompanhamento', icon: 'assessments' },
  { label: 'Minha assinatura', href: '/assinatura/gerenciar', icon: 'subscription' },
  { label: 'Minha conta', href: '/conta', icon: 'account' },
] as const
export const futureModules = ['Configurações'] as const
export function activeNavigation(path: string, href: string) {
  return href === '/assinatura/gerenciar' ? path.startsWith('/assinatura') : path === href || path.startsWith(href+'/')
}
export function pageTitle(path: string) {
  return professionalNavigation.find(item => activeNavigation(path, item.href))?.label ?? 'Área profissional'
}
