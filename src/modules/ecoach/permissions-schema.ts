import {z} from '@/lib/validation'
export const coachPermission=z.enum(['read','create','manage'])
export type CoachPermission=z.infer<typeof coachPermission>
export const permissionChoices=[
 {value:'read',title:'Somente leitura',description:'Consultar e resumir informações autorizadas, sem criar ou alterar registros.'},
 {value:'create',title:'Criação',description:'Leitura e propostas de novos treinos, anamneses e agendamentos, com sua confirmação.'},
 {value:'manage',title:'Criação e edição',description:'Leitura, criação e edição de rascunhos e remarcação de compromissos, com confirmação. Não concede o papel admin.'},
] as const
