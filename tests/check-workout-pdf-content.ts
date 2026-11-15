// Verify the same canonical fields survive visual changes, independently of typography/layout.
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {repetitionLabel,loadLabel} from '../src/server/workout-documents/pdf'
import {techniqueLabels,type Workout} from '../src/modules/workouts/schema'
import type {ExportOptions,Presentation} from '../src/modules/workout-documents/schema'
const root='test-results/011.5'
async function main(){
const fixtures=JSON.parse(await readFile(root+'/comparison-inputs.json','utf8')) as Record<string,{plan:Workout;options:ExportOptions;identity:Presentation;historical:boolean}>
const normalize=(v:string)=>v.normalize('NFC').replace(/\s/g,'').toLowerCase()
const results=[]
for(const phase of ['before','after']){
 for(const [name,{plan:p,options:o,identity:i,historical}]of Object.entries(fixtures)){
  const file=phase==='before'?`${root}/before/${name}.pdf`:`output/pdf/011.5/${name}.pdf`
  const extracted=execFileSync('pdftotext',['-raw',file,'-']).toString(),text=normalize(extracted.split('\n').filter(line=>!/(FORMFISIK \/ TREINAMENTO|Produzido com FormFisik|RASCUNHO|FICHA ATIVA|ARQUIVADO|VERSÃO HISTÓRICA|continuação)/.test(line)&&!/^\s*\d+\s*\/\s*\d+\s*$/.test(line)).join('\n'))
  const values:string[]=[p.studentName!,p.fields.name,p.fields.objective]
  if(o.professional)values.push(p.professionalName,i.professionalName,i.registration,i.contact)
  if(o.brand)values.push(i.brand)
  if(o.guidance)values.push(p.fields.notes)
  const selected=p.fields.divisions.filter(d=>o.divisionIds===null||o.divisionIds.includes(d.id))
  let previous=-1
  for(const d of selected){const position=text.indexOf(normalize(d.name),previous+1);assert.ok(position>previous,`${phase}/${name}: division order`);previous=position;values.push(d.name,d.description);if(o.notes)values.push(d.notes)
   for(const e of d.exercises){values.push(p.exerciseDefinitions[e.exerciseId+':'+e.exerciseVersion].name,techniqueLabels[e.technique]);if(o.notes)values.push(e.notes)
    for(const s of e.sets){values.push(repetitionLabel(s.repetition));if(o.loads)values.push(loadLabel(s));if(s.restSeconds!==null)values.push(s.restSeconds+' s');if(s.executionSeconds!==null)values.push('Execução: '+s.executionSeconds+' s');if(o.notes)values.push(s.notes)}
   }
   for(const g of d.groups){values.push(techniqueLabels[g.technique]);if(g.roundRestSeconds!==null)values.push('Descanso entre voltas: '+g.roundRestSeconds+' s');if(o.notes)values.push(g.notes);for(const [n,id]of g.members.entries()){const e=d.exercises.find(v=>v.id===id)!;values.push(`${n+1} → exercício ${d.exercises.indexOf(e)+1}: ${p.exerciseDefinitions[e.exerciseId+':'+e.exerciseVersion].name}`)}}
  }
  for(const value of values.filter(Boolean))assert.ok(text.includes(normalize(value)),`${phase}/${name}: missing ${value.slice(0,90)}`)
  // Walk the rendered exercise headings and each series in canonical order (not a set of values).
  let exerciseCursor=0
  for(const d of selected)for(const [index,e]of d.exercises.entries()){
   const heading=normalize(String(index+1).padStart(2,'0')+(phase==='before'||o.layout==='compact'?'.':'')+p.exerciseDefinitions[e.exerciseId+':'+e.exerciseVersion].name)
   const start=text.indexOf(heading,exerciseCursor);assert.ok(start>=exerciseCursor,`${phase}/${name}: exercise order ${index+1}`)
   let cursor=start+heading.length
   for(const s of e.sets){for(const value of [repetitionLabel(s.repetition),...(o.loads?[loadLabel(s)]:[]),...(s.restSeconds!==null?[s.restSeconds+' s']:[])]){const token=normalize(value),at=text.indexOf(token,cursor);assert.ok(at>=cursor,`${phase}/${name}: series parameter order`);cursor=at+token.length}}
   exerciseCursor=cursor
  }

  const pages=extracted.split('\f').filter(t=>t.trim());for(const page of pages){assert.ok(page.includes('Produzido com FormFisik'));if(p.state==='draft')assert.ok(page.includes('RASCUNHO'));if(historical)assert.ok(page.includes('VERSÃO HISTÓRICA'))}
  results.push({phase,name,canonicalFieldsChecked:values.filter(Boolean).length,pages:pages.length})
 }
}
await writeFile(root+'/content-check.json',JSON.stringify(results,null,2));console.info('Canonical content, parameters, notes, structured group order, states and versions PASS:',results.length,'documents')

}
main().catch(e=>{console.error(e);process.exitCode=1})
