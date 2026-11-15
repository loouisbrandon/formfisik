import type {FormDefinition,Question} from './schema'
// Stable IDs: official model v1 is immutable; no clinical scoring or aptitude decision.
const id=(n:number)=>`17000000-0000-4000-8000-${String(n).padStart(12,'0')}`
let n=1
const q=(title:string,type:Question['type']='long',required=false):Question=>({id:id(n++),title,type,required,description:'',options:[],min:null,max:null,condition:null})
const limitation=q('Você possui alguma limitação física relevante para o treinamento?','boolean')
const detail={...q('Descreva somente a limitação relevante ao treinamento.'),condition:{questionId:limitation.id,equals:'yes'}}
export const standardForm:FormDefinition={title:'Anamnese inicial — Personal',description:'Planejamento do acompanhamento pelo personal trainer. Responda apenas o necessário. Este formulário não produz diagnóstico nem conclusão de aptidão física.',sections:[
 {id:id(101),title:'Identificação e objetivos',questions:[q('Objetivo principal','short',true),q('Objetivos secundários e expectativas'),q('Preferências de treinamento')]},
 {id:id(102),title:'Histórico esportivo',questions:[q('Experiência e atividades anteriores'),q('Familiaridade com exercícios')]},
 {id:id(103),title:'Rotina',questions:[{...q('Disponibilidade semanal','select'),options:Array.from({length:7},(_,i)=>({id:id(201+i),label:`${i+1} dia(s)`}))},q('Duração e horários preferidos','short')]},
 {id:id(104),title:'Ambiente e equipamentos',questions:[q('Local, equipamentos disponíveis e limitações estruturais')]},
 {id:id(105),title:'Informações de saúde relevantes',questions:[limitation,detail,q('Histórico de lesões pertinente ao treinamento (opcional)')]},
 {id:id(106),title:'Hábitos',questions:[q('Rotina de sono e hábitos pertinentes ao planejamento (opcional)')]},
 {id:id(107),title:'Observações',questions:[q('Informações complementares necessárias ao acompanhamento (opcional)')]},
]}
export const STANDARD_ID='17000000-0000-4000-8000-999999999999'
