import { z } from '@/lib/validation'
import { studentFields } from '../students/schema'
const text=(n:number)=>z.string().trim().normalize('NFC').max(n).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))
export const questionTypes=['boolean','short','long','integer','decimal','single','multiple','select','scale','date','info'] as const
export const questionSchema=z.object({id:z.uuid(),title:text(180).min(1),description:text(600),type:z.enum(questionTypes),required:z.boolean(),options:z.array(z.object({id:z.uuid(),label:text(120).min(1)}).strict()).max(30),min:z.number().finite().min(-1000000).max(1000000).nullable(),max:z.number().finite().min(-1000000).max(1000000).nullable(),condition:z.object({questionId:z.uuid(),equals:text(120)}).strict().nullable()}).strict()
export const formSchema=z.object({title:text(120).min(2),description:text(1200),sections:z.array(z.object({id:z.uuid(),title:text(120).min(1),questions:z.array(questionSchema).min(1).max(30)}).strict()).min(1).max(12)}).strict().superRefine((form,ctx)=>{
 const seen=new Set<string>(),prior=new Map<string,z.infer<typeof questionSchema>>();let count=0
 for(const section of form.sections){if(seen.has(section.id))ctx.addIssue({code:'custom',message:'Identificadores repetidos.'});seen.add(section.id)
 for(const q of section.questions){count++;if(seen.has(q.id))ctx.addIssue({code:'custom',message:'Identificadores repetidos.'});seen.add(q.id)
 if(q.min!==null&&q.max!==null&&q.min>q.max)ctx.addIssue({code:'custom',message:'Limites inválidos.'})
 if(['single','multiple','select'].includes(q.type)&&(q.options.length<2||new Set(q.options.map(o=>o.id)).size!==q.options.length))ctx.addIssue({code:'custom',message:'Informe alternativas distintas.'})
 if(!['single','multiple','select'].includes(q.type)&&q.options.length)ctx.addIssue({code:'custom',message:'Tipo sem alternativas.'})
 if(['integer','scale'].includes(q.type)&&[q.min,q.max].some(n=>n!==null&&!Number.isInteger(n)))ctx.addIssue({code:'custom',message:'Limites inteiros obrigatórios.'})
 if(q.type==='info'&&q.required)ctx.addIssue({code:'custom',message:'Bloco informativo não recebe resposta.'})
 if(q.condition){const parent=prior.get(q.condition.questionId);if(!parent||!['boolean','single'].includes(parent.type)||(parent.type==='boolean'?!['yes','no'].includes(q.condition.equals):!parent.options.some(o=>o.id===q.condition!.equals)))ctx.addIssue({code:'custom',message:'Condição exige escolha anterior válida.'})}
 prior.set(q.id,q)
 }}if(count>100)ctx.addIssue({code:'custom',message:'Limite de 100 perguntas.'})
})
export type FormDefinition=z.infer<typeof formSchema>
export type Question=z.infer<typeof questionSchema>
export type Answer=string|number|string[]
export type Answers=Record<string,Answer>
export const registrationSchema=studentFields.pick({fullName:true,email:true,phone:true,birthDate:true}).strict()
export const submissionSchema=z.object({registration:registrationSchema.optional(),answers:z.record(z.string().uuid(),z.union([z.string().max(4000),z.number().finite(),z.array(z.uuid()).max(30)])),acknowledged:z.literal(true)}).strict()
export function visible(q:Question,answers:Answers){return !q.condition||answers[q.condition.questionId]===q.condition.equals}
export function validateAnswers(form:FormDefinition,input:Answers):Answers{
 const known=new Set(form.sections.flatMap(s=>s.questions.map(q=>q.id)));if(Object.keys(input).some(k=>!known.has(k)))throw Error('INVALID_ANSWERS')
 const result:Answers={}
 for(const q of form.sections.flatMap(s=>s.questions)){
  if(!visible(q,result)||q.type==='info')continue
  let v=input[q.id];if(v===undefined||v===''||Array.isArray(v)&&!v.length){if(q.required)throw Error('INVALID_ANSWERS');continue}
  if(['short','long','date','boolean','single','select'].includes(q.type)){
   if(typeof v!=='string')throw Error('INVALID_ANSWERS');v=v.trim().normalize('NFC')
   if(!v||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))throw Error('INVALID_ANSWERS')
   if(q.type==='short'&&v.length>300||q.type==='long'&&v.length>4000)throw Error('INVALID_ANSWERS')
   if(q.type==='boolean'&&!['yes','no'].includes(v))throw Error('INVALID_ANSWERS')
   if(['single','select'].includes(q.type)&&!q.options.some(o=>o.id===v))throw Error('INVALID_ANSWERS')
   if(q.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw Error('INVALID_ANSWERS')
  }else if(q.type==='multiple'){
   if(!Array.isArray(v)||new Set(v).size!==v.length||v.some(id=>!q.options.some(o=>o.id===id)))throw Error('INVALID_ANSWERS')
  }else if(typeof v!=='number'||!Number.isFinite(v)||['integer','scale'].includes(q.type)&&!Number.isSafeInteger(v)||q.min!==null&&v<q.min||q.max!==null&&v>q.max)throw Error('INVALID_ANSWERS')
  result[q.id]=v
 }return result
}

export function applicableAnswers(form:FormDefinition,input:Answers):Answers{const out:Answers={};for(const q of form.sections.flatMap(s=>s.questions)){if(visible(q,out)&&q.type!=='info'&&input[q.id]!==undefined)out[q.id]=input[q.id]}return out}
