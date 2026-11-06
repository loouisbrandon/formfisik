import 'server-only'
import {dashboardOverview} from './dashboard-overview'
import type { Identity } from './sessions'
import { readSession, sessionToken } from './sessions'
import { subscriptionStatus } from './subscriptions/status'
import type { BillingGateway } from './subscriptions/stripe'
import type { ProfessionalDashboard } from '../modules/professional/dashboard'
import {assessmentCounts} from './assessments/repository'
import {workoutCounts} from './workouts/repository'
import { studentCounts } from './students/repository'
import { failure, limit, reply } from './http'
export type DashboardResult = { status: 'allowed'; data: ProfessionalDashboard } | { status: 'denied'; destination: '/conta' | '/assinatura' | '/assinatura/gerenciar' } | { status: 'unavailable' }
// The optional gateway is explicit dependency injection for isolated tests, never a request option.
export async function professionalAccess(user: Identity, gateway?: BillingGateway): Promise<Exclude<DashboardResult,{status:'allowed'}>|{status:'allowed'}> {
  if (user.role !== 'professional') return { status: 'denied', destination: '/conta' }
  try {
    const access = await subscriptionStatus(user.id, true, gateway, false)
    if (access.state === 'unavailable') return access.financialStatus === null ? { status: 'denied', destination: '/assinatura' } : { status: 'unavailable' }
    if (!access.paidAccess) return { status: 'denied', destination: access.state === 'none' ? '/assinatura' : '/assinatura/gerenciar' }
    return { status: 'allowed' }
  } catch { console.error('dashboard_access_unavailable'); return { status: 'unavailable' } }
}
export async function professionalDashboard(user:Identity,gateway?:BillingGateway):Promise<DashboardResult>{
 const access=await professionalAccess(user,gateway)
 if(access.status!=='allowed')return access
 const [counts,workouts,assessments,overview]=await Promise.all([studentCounts(user.id),workoutCounts(user.id),assessmentCounts(user.id),dashboardOverview(user.id)])
 return {status:'allowed',data:{fullName:user.fullName,overview,studentTotal:counts.active+counts.archived,indicators:[{label:'Alunos ativos',value:String(counts.active),description:'Vínculos ativos na sua carteira.'},{label:'Alunos arquivados',value:String(counts.archived),description:'Vínculos arquivados na sua carteira.'},{label:'Planejamentos ativos',value:String(workouts.active),description:'Fichas individuais no estado ativo.'},{label:'Modelos de treino',value:String(workouts.templates),description:'Seus modelos em rascunho ou ativos.'},{label:'Alunos com avaliações',value:String(assessments.assessed),description:'Alunos ativos com pelo menos uma avaliação ativa.'},{label:'Avaliações em 30 dias',value:String(assessments.recent),description:'Registros ativos de alunos ativos, de hoje e dos 29 dias anteriores (Brasília).'},{label:'Sem avaliação recente',value:String(assessments.overdue),description:'Alunos ativos sem avaliação ativa nos últimos 30 dias, incluindo quem nunca foi avaliado.'}],activities:[]}}
}
export function createDashboardHandler(gateway?: BillingGateway) {
  return async (request: Request) => {
    try {
      const user = await readSession(sessionToken(request.headers.get('cookie')))
      if (!user) return reply({ message: 'Entre novamente para continuar.' }, 401)
      await limit(`dashboard:${user.id}`, 30, 60)
      const query = new URL(request.url).searchParams
      if ([...query.keys()].some(key=>key!=='view') || (query.has('view') && query.get('view')!=='access')) return reply({message:'Parâmetros inválidos.'},400)
      const result = query.get('view') === 'access' ? await professionalAccess(user,gateway) : await professionalDashboard(user, gateway)
      return reply(result, result.status === 'allowed' ? 200 : result.status === 'denied' ? 403 : 503)
    } catch (error) { return failure(error, 'dashboard_unavailable') }
  }
}
