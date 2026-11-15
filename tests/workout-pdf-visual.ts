// Visual QA only. Inputs are immutable synthetic snapshots captured from the real PG test harness.
import assert from 'node:assert/strict'
import {createHash,randomUUID} from 'node:crypto'
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import sharp from 'sharp'
import {workoutPdf} from '../src/server/workout-documents/pdf'
import {type Workout,cloneDivisions} from '../src/modules/workouts/schema'
import type {ExportOptions,Presentation} from '../src/modules/workout-documents/schema'
type Fixture={plan:Workout;options:ExportOptions;identity:Presentation&{logo:string|null};historical:boolean}
const root='test-results/011.5',issued=new Date('2026-11-01T15:00:00Z')
async function main(){
 const mode=process.argv[2];assert.ok(mode==='before'||mode==='after','Use before or after')
 const fixtures:Record<string,Fixture>={}
 if(mode==='before'){
  const current=await readFile('src/server/workout-documents/pdf.ts'),original=await readFile(root+'/original/pdf.ts.txt');assert.equal(createHash('sha256').update(current).digest('hex'),createHash('sha256').update(original).digest('hex'),'Capture baseline before editing the renderer; do not replace the preserved 011 baseline with refined output')
  for(const file of await readdir(root+'/fixtures')){const name=file.replace('.json','');if(file.endsWith('.json'))fixtures[name]=JSON.parse(await readFile(root+'/fixtures/'+file,'utf8'))}
  assert.equal(Object.keys(fixtures).length,10,'Run PDF_VISUAL_CAPTURE=1 isolated integration first')
  fixtures['compacta-abc']=structuredClone(fixtures.abc);fixtures['compacta-abc'].options.layout='compact'
  fixtures['premium-muitas-divisoes']=structuredClone(fixtures['muitas-divisoes']);fixtures['premium-muitas-divisoes'].options.layout='premium'
  fixtures['nomes-longos']=structuredClone(fixtures['textos-longos']);fixtures['nomes-longos'].plan.fields.notes='';fixtures['nomes-longos'].plan.fields.divisions[0].exercises=fixtures['nomes-longos'].plan.fields.divisions[0].exercises.slice(0,2);fixtures['nomes-longos'].plan.fields.divisions[0].groups=[];fixtures['nomes-longos'].plan.fields.divisions[0].exercises.forEach(e=>e.notes='')
  for(const [name,width,height]of [['marca-horizontal',300,70],['marca-quadrada',100,100]] as const){const f=structuredClone(fixtures['premium-simples']);f.identity={...fixtures.personalizada.identity,brand:name==='marca-horizontal'?'Marca profissional de teste com nome extenso para avaliar alinhamento e proporção':'MARCA QUADRADA DE TESTE',registration:'',contact:'',logo:(await sharp({create:{width,height,channels:4,background:'#96d100'}}).png().toBuffer()).toString('base64')};fixtures[name]=f}
  const unbroken=structuredClone(fixtures['nomes-longos']);unbroken.plan.studentName='Aluno '+('NomeSemEspaco'.repeat(12));unbroken.plan.fields.divisions[0].name='Divisão '+('NomeLongo'.repeat(10));unbroken.plan.fields.divisions[0].description='Descrição da divisão informada no ambiente controlado de teste. '.repeat(8);fixtures['palavras-longas']=unbroken
  const split=structuredClone(fixtures['premium-simples']);const exercise=split.plan.fields.divisions[0].exercises[0];exercise.sets=Array.from({length:50},(_,i)=>({...exercise.sets[i%exercise.sets.length],id:randomUUID()}));split.options.annotations=true;fixtures['series-extensas']=split
  const pyramid=structuredClone(fixtures['premium-simples']);pyramid.plan.fields.name='Pirâmide informada pelo profissional de teste';pyramid.plan.fields.divisions=cloneDivisions(pyramid.plan.fields.divisions);pyramid.plan.fields.divisions[0].exercises[0].sets=pyramid.plan.fields.divisions[0].exercises[0].sets.map((s,i)=>({...s,repetition:{mode:'reps',value:12-i*2,perSide:false},load:20+i*5,unit:'kg',phase:'work'}));fixtures.piramide=pyramid
  await writeFile(root+'/comparison-inputs.json',JSON.stringify(fixtures))
 }else Object.assign(fixtures,JSON.parse(await readFile(root+'/comparison-inputs.json','utf8')))
 const dest=mode==='before'?root+'/before':'output/pdf/011.5';await mkdir(dest,{recursive:true})
 const results=[]
 for(const [name,f]of Object.entries(fixtures)){
  const hash=createHash('sha256').update(JSON.stringify(f)).digest('hex')
  const pdf=await workoutPdf(f.plan,f.options,{...f.identity,logo:f.identity.logo?Buffer.from(f.identity.logo,'base64'):null},f.historical,issued)
  const file=dest+'/'+name+'.pdf';await writeFile(file,pdf)
  const info=execFileSync('pdfinfo',[file]).toString(),text=execFileSync('pdftotext',['-layout',file,'-']).toString()
  assert.ok(text.includes('Produzido com FormFisik'));assert.ok(text.includes('01')||text.includes('1'))
  const result={name,inputHash:hash,pages:Number(info.match(/Pages:\s+(\d+)/)?.[1]),bytes:pdf.length,file}
  results.push(result)
 }
 await writeFile(root+'/'+mode+'-metrics.json',JSON.stringify(results,null,2));console.info(JSON.stringify(results))
}
main().catch(e=>{console.error(e);process.exitCode=1})
