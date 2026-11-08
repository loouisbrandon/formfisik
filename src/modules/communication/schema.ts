import {z} from '@/lib/validation'
import {taskFields} from '../crm/schema'
import {date} from '../agenda/schema'
import {text as safeText} from '../consultancies/schema'
export const variables=['aluno.nome','profissional.nome','contexto.tipo','hoje','aluno.primeiroNome','compromisso.data','compromisso.hora'] as const
export const contextLabels={workout:'Prescrição de treino',checkin:'Check-in',appointment:'Atendimento da agenda',contract:'Contratação',assessment:'Avaliação física'} as const
export const channels={email:'E-mail',whatsapp:'WhatsApp',phone:'Telefone',in_person:'Presencial',other:'Outro'} as const
export const kinds={prepared:'Mensagem preparada — não enviada',external_declared:'Contato externo declarado'} as const
export const notificationLabels={checkin_review:'Check-in recebido para revisão',checkin_adjustment:'Solicitação de conversa sobre o treino',appointment_near:'Atendimento nas próximas 24 horas',attendance_pending:'Presença pendente nos últimos 7 dias',contract_ending:'Contratação vence em até 7 dias'} as const
const text=(max:number)=>safeText(max).min(1)
export function validBody(s:string){if(/<\/?[a-z][^>]*>|<%|\$\{|(?:sk_(?:live|test)_|whsec_|Bearer\s)|\/responder(?:\/check-in)?#|\/(?:redefinir-senha|verificar-email)#/i.test(s))return false;const stripped=s.replace(/\{\{([^{}]+)\}\}/g,(_,name:string)=>variables.includes(name as typeof variables[number])?'':'INVALID_TEMPLATE');return !stripped.includes('INVALID_TEMPLATE')&&!/[{}]/.test(stripped)}
export const messageBody=text(4000).refine(validBody,'Use texto simples e somente as variáveis permitidas; não inclua credenciais ou links de acesso individuais.')
export const templateFields=z.object({title:text(120),body:messageBody}).strict()
export const contextRef=z.object({kind:z.enum(['workout','checkin','appointment','contract','assessment']),id:z.uuid(),version:z.int().min(0).max(2147483647),assessmentAuthorized:z.boolean().default(false),assessmentPurpose:safeText(300).default('')}).strict().superRefine((c,ctx)=>{if(c.kind!=='checkin'&&c.version<1||c.kind==='assessment'&&(!c.assessmentAuthorized||c.assessmentPurpose.length<5)||c.kind!=='assessment'&&(c.assessmentAuthorized||c.assessmentPurpose))ctx.addIssue({code:'custom',message:'Confira versão, necessidade e autorização do contexto.'})})
export const recordFields=z.object({studentId:z.uuid(),kind:z.enum(['prepared','external_declared']),channel:z.enum(['email','whatsapp','phone','in_person','other']),occurredAt:z.iso.datetime().nullable().refine(v=>v===null||(v>='2000-01-01'&&v<'2101-01-01')),body:messageBody,templateId:z.uuid().nullable(),templateVersion:z.int().positive().max(2147483647).nullable(),context:contextRef.nullable(),correctsId:z.uuid().nullable()}).strict().refine(f=>(f.templateId===null)===(f.templateVersion===null)&&((f.kind==='prepared')===(f.occurredAt===null)),'Confira modelo, tipo e instante declarado.')
const key={operationKey:z.uuid()},version=z.int().positive().max(2147483647)
export const communicationCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('template_save'),...key,id:z.uuid().optional(),version:version.optional(),fields:templateFields}).strict(),
 z.object({action:z.literal('template_archive'),...key,id:z.uuid(),version,archived:z.boolean()}).strict(),
 z.object({action:z.literal('preview'),fields:recordFields}).strict(),
 z.object({action:z.literal('record_save'),...key,fields:recordFields,digest:z.string().regex(/^[a-f0-9]{64}$/),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('notification_read'),...key,sourceKey:z.string().min(1).max(180)}).strict(),
 z.object({action:z.literal('task_save'),...key,studentId:z.uuid(),fields:taskFields}).strict(),
 z.object({action:z.literal('task_status'),...key,id:z.uuid(),version,status:z.enum(['pending','in_progress','completed','canceled'])}).strict(),
])

export const communicationQuery=z.object({view:z.enum(['contacts','history','record','templates','template','contexts','notifications','indicators','tasks','journal','prepared']),id:z.uuid().optional(),studentId:z.uuid().optional(),page:z.coerce.number().int().min(1).max(100000).default(1),q:z.string().trim().max(120).default(''),kind:z.enum(['all','prepared','external_declared']).default('all'),channel:z.enum(['all','email','whatsapp','phone','in_person','other']).default('all'),state:z.enum(['active','archived','all']).default('active'),recent:z.enum(['all','recent','stale','pending']).default('all'),unread:z.enum(['all','yes']).default('all'),contextKind:z.enum(['workout','checkin','appointment','contract','assessment']).default('workout'),assessmentAuthorized:z.enum(['yes','no']).default('no'),from:date.optional(),to:date.optional()}).strict().refine(q=>(!q.from&&!q.to)||!!q.from&&!!q.to&&q.to>=q.from&&Date.parse(q.to)-Date.parse(q.from)<=366*86400000,'Período máximo de 367 datas.')
export type ContextRef=z.infer<typeof contextRef>
export type RecordFields=z.infer<typeof recordFields>
export type CommunicationCommand=z.infer<typeof communicationCommand>
export type CommunicationQuery=z.infer<typeof communicationQuery>
export const defaultTemplates=[{title:'Boas-vindas',body:'Olá, {{aluno.nome}}! Boas-vindas ao acompanhamento com {{profissional.nome}}.'},{title:'Lembrete de check-in',body:'Olá, {{aluno.nome}}! Podemos combinar o preenchimento do seu check-in? Acesse apenas o link individual compartilhado pelo canal acordado.'},{title:'Orientação sobre treino',body:'Olá, {{aluno.nome}}! Gostaria de conversar sobre sua prescrição de treino.'},{title:'Acompanhamento semanal',body:'Olá, {{aluno.nome}}! Como foi sua semana de acompanhamento?'},{title:'Confirmação de atendimento',body:'Olá, {{aluno.nome}}! Podemos confirmar os detalhes do nosso próximo atendimento?'},{title:'Solicitação de retorno',body:'Olá, {{aluno.nome}}! Quando puder, gostaria de combinar um retorno.'},{title:'Renovação de consultoria',body:'Olá, {{aluno.nome}}! Podemos conversar sobre a continuidade da consultoria?'}]
