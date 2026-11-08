export const professionalNavigation = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Indicadores', href: '/indicadores', icon: 'dashboard' },
  { label: 'Tutoriais', href: '/tutoriais', icon: 'account' },
  { label: 'Alunos', href: '/alunos', icon: 'students' },
  { label: 'Agenda', href: '/agenda', icon: 'dashboard' },
  { label: 'Consultorias', href: '/consultorias', icon: 'workouts' },
  { label: 'Financeiro', href: '/financeiro', icon: 'subscription' },
  { label: 'CRM', href: '/crm', icon: 'students' },
  { label: 'Comunicação', href: '/comunicacao', icon: 'students' },
  { label: 'Check-ins', href: '/checkins', icon: 'workouts' },
  { label: 'Anamneses', href: '/anamneses', icon: 'workouts' },
  { label: 'Vídeos', href: '/videos', icon: 'exercises' },
  { label: 'Exercícios', href: '/exercicios', icon: 'exercises' },
  { label: 'Treinos', href: '/treinos', icon: 'workouts' },
  { label: 'Acompanhamento', href: '/acompanhamento', icon: 'assessments' },
  { label: 'Minha assinatura', href: '/assinatura/gerenciar', icon: 'subscription' },
  { label: 'Minha conta', href: '/conta', icon: 'account' },
  { label: 'Configurações', href: '/configuracoes', icon: 'account' },
] as const
export const futureModules = [] as const
export function activeNavigation(path: string, href: string) {
  return href === '/assinatura/gerenciar' ? path.startsWith('/assinatura') : path === href || path.startsWith(href+'/')
}
export function pageTitle(path: string) {
  if(path==='/importar')return 'Importar dados'
  return professionalNavigation.find(item => activeNavigation(path, item.href))?.label ?? 'Área profissional'
}
