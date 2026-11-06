/** Civil time is never parsed by Date's host-timezone dependent constructor. */
const cache=new Map<string,Intl.DateTimeFormat>()
export class CalendarTimeError extends Error{constructor(public code:string){super(code)}}
export function validZone(zone:string){try{return !!new Intl.DateTimeFormat('en',{timeZone:zone}).resolvedOptions().timeZone}catch{return false}}
function formatter(zone:string){let f=cache.get(zone);if(!f){if(cache.size>80)cache.clear();f=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});cache.set(zone,f)}return f}
export function localParts(instant:number|string|Date,zone:string){const p=Object.fromEntries(formatter(zone).formatToParts(new Date(instant)).map(p=>[p.type,p.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,second:p.second}}
const naive=(date:string,time:string)=>Date.parse(date+'T'+time+':00Z')
export function resolveLocal(date:string,time:string,zone:string,fold:'reject'|'earlier'|'later'='reject'){
 if(!validZone(zone)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new CalendarTimeError('invalid_time')
 const n=naive(date,time);if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,16)!==date+'T'+time)throw new CalendarTimeError('invalid_time')
 const offsets=new Set<number>();for(let h=-36;h<=36;h+=6){const t=n+h*3600000,p=localParts(t,zone);offsets.add(naive(p.date,p.time)-t)}
 const candidates=[...offsets].map(offset=>n-offset).filter(t=>{const p=localParts(t,zone);return p.date===date&&p.time===time}).sort((a,b)=>a-b)
 if(!candidates.length)throw new CalendarTimeError('nonexistent_time');if(candidates.length>1&&fold==='reject')throw new CalendarTimeError('ambiguous_time');return candidates[fold==='later'?candidates.length-1:0]
}
export const addDays=(date:string,days:number)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10)
export function addMonthsExact(date:string,months:number){const [y,m,d]=date.split('-').map(Number),v=new Date(Date.UTC(y,m-1+months,d,12));return v.getUTCDate()===d?v.toISOString().slice(0,10):null}
export const weekday=(date:string)=>new Date(date+'T12:00:00Z').getUTCDay()
export const minuteOfDay=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3))
export function horizon(date:string){const [y,m,d]=date.split('-').map(Number);return new Date(Date.UTC(y+1,m-1,Math.min(d,new Date(Date.UTC(y+1,m,0)).getUTCDate()),12)).toISOString().slice(0,10)}
export type Recurrence={frequency:'once'|'weekly'|'fortnightly'|'monthly';end:{mode:'count';count:number}|{mode:'date';date:string}}
export function recurrenceDates(start:string,r:Recurrence){const limit=horizon(start),dates:string[]=[],skipped:string[]=[];if(r.frequency==='once')return {dates:[start],skipped};const end=r.end.mode==='date'?r.end.date:limit;if(end<start||end>limit)throw new CalendarTimeError('recurrence_horizon');for(let i=0;i<370;i++){let date:string|null;if(r.frequency==='monthly'){date=addMonthsExact(start,i);if(!date){const [y,m]=start.split('-').map(Number),v=new Date(Date.UTC(y,m-1+i,1,12)).toISOString().slice(0,7);if(v>limit.slice(0,7))break;skipped.push(v);continue}}else date=addDays(start,i*(r.frequency==='weekly'?7:14));if(date>end||date>limit)break;dates.push(date);if(dates.length>100)throw new CalendarTimeError('recurrence_limit');if(r.end.mode==='count'&&dates.length===r.end.count)break}if(r.end.mode==='count'&&dates.length!==r.end.count)throw new CalendarTimeError('recurrence_horizon');return {dates,skipped}}
export const overlaps=(a:number,b:number,c:number,d:number)=>a<d&&c<b
/** Start of a civil day can be 01:00 after a midnight DST jump; skipped dates have zero elapsed length. */
export function dayBoundary(date:string,zone:string){for(let m=0;m<=1440;m++){const d=m===1440?addDays(date,1):date,t=String(Math.floor(m%1440/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');try{return resolveLocal(d,t,zone,'earlier')}catch(e){if(!(e instanceof CalendarTimeError)||e.code!=='nonexistent_time')throw e}}throw new CalendarTimeError('nonexistent_time')}
