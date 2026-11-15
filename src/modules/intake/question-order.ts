import type {FormDefinition} from './schema'

/** Reorders only one section, retaining the question objects and historical IDs. */
export function reorderQuestion(form:FormDefinition,section:number,from:number,to:number):FormDefinition|null {
 const current=form.sections[section]
 if(!current||![from,to].every(i=>Number.isInteger(i)&&i>=0&&i<current.questions.length))return null
 if(from===to)return form
 const questions=[...current.questions]
 questions.splice(to,0,questions.splice(from,1)[0])
 const next={...form,sections:form.sections.map((s,i)=>i===section?{...s,questions}:s)}
 const seen=new Set<string>()
 for(const q of next.sections.flatMap(s=>s.questions)){
  if(q.condition&&!seen.has(q.condition.questionId))return null
  seen.add(q.id)
 }
 return next
}
