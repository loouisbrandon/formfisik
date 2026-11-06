import type {Charge,Movement} from './api'
import {chargeStates} from './schema'
const methods:Record<string,string>={pix:'Pix próprio',cash:'Dinheiro',bank:'Transferência',other:'Outro meio externo',provider:'Processador'}
/** Quoted CSV plus spreadsheet-formula neutralization; no private notes or processor references. */
export function financeCsv(dataset:'charges'|'receipts',items:(Charge|Movement)[]){
 const cell=(value:unknown)=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
 const rows=dataset==='charges'?[['Aluno','Serviço/plano','Vencimento','Origem','Situação','Valor (centavos BRL)','Provedor (centavos)','Externo (centavos)','Reembolsado (centavos)'],...(items as Charge[]).map(c=>[c.full_name,c.service_name,c.due_on,['external','installments'].includes(c.mode)?'Externo declarado':'Integrado',chargeStates[c.effective_state as keyof typeof chargeStates],c.amount_cents,c.paid_cents,c.manual,c.refunded_cents])]:[['Aluno','Serviço/plano','Data','Origem','Método','Conferência','Valor (centavos BRL)','Reembolsado (centavos)'],...(items as Movement[]).map(r=>[r.full_name,r.service_name,r.paid_on,r.origin==='external'?'Declarado pelo profissional':'Confirmado pelo processador',methods[r.method],r.origin==='external'?(r.checked?'Conferido pelo profissional':'Registrado pelo profissional'):'Processador',r.amount,r.refunded])]
 return '\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n')
}
