import {fold} from './catalog'
import {localParts,addDays} from '@/modules/agenda/time'
const months=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
export function searchDates(input:string,zone:string,now:Date=new Date()){
 const q=fold(input).trim().replace(/^(?:agenda|compromissos)(?: de| do| para)?\s+/,'')
 const today=localParts(now,zone).date,year=Number(today.slice(0,4))
 if(['hoje','amanha','ontem'].includes(q)){const date=addDays(today,q==='amanha'?1:q==='ontem'?-1:0);return {from:date,to:date}}
 const m=q.match(/^(\d{1,2})(?:\/(\d{1,2})(?:\/(\d{4}))?| de ([a-z]+)(?: de (\d{4}))?)?$/)
 let y=year,month=Number(today.slice(5,7)),day:number|undefined
 if(m){day=Number(m[1]);month=m[2]?Number(m[2]):m[4]?months.indexOf(m[4])+1:month;y=Number(m[3]||m[5]||year)}else{const a=q.match(/^([a-z]+)(?: (?:de )?(\d{4}))?$/);if(!a||!months.includes(a[1]))return null;month=months.indexOf(a[1])+1;y=Number(a[2]||year)}
 if(y<2000||y>2100||month<1||month>12)return null
 const date=`${y}-${String(month).padStart(2,'0')}-${String(day??1).padStart(2,'0')}`
 if(day&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)return null
 return {from:date,to:day?date:new Date(Date.UTC(y,month,0,12)).toISOString().slice(0,10)}
}
