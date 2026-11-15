import type {Detail} from './api'
import {emptyAppointment,type AppointmentFields} from './schema'
import {localParts,resolveLocal} from './time'
export function fieldsFromDetail(d:Detail):AppointmentFields{return {...emptyAppointment(d.timezone),kind:d.kind,studentId:d.student_link_id,typeId:d.type_id,title:d.private_title,date:d.date,time:d.local_time,timezone:d.timezone,fold:d.fold,duration:d.kind==='block'?60:Math.round((Date.parse(d.ends_at)-Date.parse(d.starts_at))/60000),endDate:localParts(d.ends_at,d.timezone).date,endTime:localParts(d.ends_at,d.timezone).time,mode:d.mode,location:d.location,notes:d.notes,contractId:d.contract_id,deliveryId:d.delivery_id}}
/** Destination uses the visible calendar zone; retain the occurrence's own zone and elapsed duration. */
export function movedFields(d:Detail,date:string,time:string,calendarZone:string,fold:AppointmentFields['fold']='reject'):AppointmentFields{
 const start=resolveLocal(date,time,calendarZone,fold),end=start+Date.parse(d.ends_at)-Date.parse(d.starts_at),a=localParts(start,d.timezone),b=localParts(end,d.timezone)
 let originalFold:AppointmentFields['fold']='reject'
 try{resolveLocal(a.date,a.time,d.timezone)}catch{originalFold=resolveLocal(a.date,a.time,d.timezone,'earlier')===start?'earlier':'later'}
 if(d.kind==='block'){
 const compatible=([originalFold,'earlier','later'] as const).find(option=>{try{return resolveLocal(a.date,a.time,d.timezone,option)===start&&resolveLocal(b.date,b.time,d.timezone,option)===end}catch{return false}})
 if(!compatible)throw Error('O término atravessa um horário ambíguo. Revise o bloqueio pelo editor antes de movê-lo.')
 originalFold=compatible
 }
 return {...fieldsFromDetail(d),date:a.date,time:a.time,fold:originalFold,endDate:b.date,endTime:b.time}
}
