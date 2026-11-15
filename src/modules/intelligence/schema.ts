import {z} from '@/lib/validation'
import {addDays} from '../agenda/time'
export const intelligenceQuery=z.object({from:z.iso.date(),to:z.iso.date()}).strict().refine(v=>v.from<=v.to&&(Date.parse(v.to)-Date.parse(v.from))/86400000<=366,'Escolha até 367 datas.')
export type Period=z.infer<typeof intelligenceQuery>
export function previousPeriod(p:Period):Period{const days=Math.round((Date.parse(p.to)-Date.parse(p.from))/86400000)+1;return {from:addDays(p.from,-days),to:addDays(p.from,-1)}}
export type Metric={id:string;label:string;value:string|null;unit:'count'|'cents'|'hours'|'percent';definition:string;scope:'period'|'current';numerator?:number;denominator?:number}
export type Group={id:string;label:string;href:string;metrics:Metric[]}
export type Snapshot={period:Period;groups:Group[];stages:{name:string;total:number}[];series:{date:string;newStudents:number;portfolio:number;providerReceived:string;externalDeclared:string}[]}
export type IntelligenceReport={generatedAt:string;timezone:string;current:Snapshot;previous:Snapshot;limitations:string[]}
export function displayMetric(m:Pick<Metric,'value'|'unit'>){if(m.value===null)return 'Não calculável';if(m.unit==='cents'){const n=BigInt(m.value);return `R$ ${(n/BigInt(100)).toLocaleString('pt-BR')},${String(n%BigInt(100)).padStart(2,'0')}`}return Number(m.value).toLocaleString('pt-BR',{maximumFractionDigits:2})+(m.unit==='hours'?' h':m.unit==='percent'?'%':'')}
