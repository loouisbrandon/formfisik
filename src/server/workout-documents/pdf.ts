import 'server-only'
import PDFDocument from 'pdfkit'
import path from 'node:path'
import type {Workout,PrescribedSet,PrescribedExercise,Division} from '../../modules/workouts/schema'
import {techniqueLabels} from '../../modules/workouts/schema'
import type {ExportOptions,Presentation} from '../../modules/workout-documents/schema'
import {WorkoutError} from '../workouts/repository'

const INK='#161a18',GRAY='#536059',GREEN='#96d100',LIGHT='#f1f4ef',LINE='#d8dfd8'
export function repetitionLabel(r:PrescribedSet['repetition']){if(r.mode==='failure')return 'Até a falha';if(r.mode==='duration')return `${r.seconds??'—'} s`;if(r.mode==='range')return `${r.min??'?'} a ${r.max??'?'} rep.${r.perSide?' / lado':''}`;return `${r.value??'—'} rep.${r.perSide?' / lado':''}`}
export function loadLabel(s:PrescribedSet){if(s.unit==='bodyweight')return s.load===null?'Peso corporal':`${s.load.toLocaleString('pt-BR')} peso corporal`;return s.load===null?'—':`${s.load.toLocaleString('pt-BR')} ${{kg:'kg',lb:'lb',percent:'%'}[s.unit]}`}

/** Presentation only: canonical content, options, limits and authorization remain in the 011 flow. */
export async function workoutPdf(p:Workout,o:ExportOptions,identity:Presentation&{logo:Buffer|null},historical:boolean,issued=new Date()){
 const premium=o.layout==='premium',left=42,width=511,right=left+width,top=82,bottom=778
 const bodySize=premium?10:9.5
 const doc=new PDFDocument({size:'A4',margins:{top,bottom:64,left,right:42},font:path.join(process.cwd(),'assets/fonts/DejaVuSans.ttf'),bufferPages:true,autoFirstPage:false,info:{Title:'Ficha de treinamento',Author:'FormFisik',CreationDate:issued}})
 doc.registerFont('regular',path.join(process.cwd(),'assets/fonts/DejaVuSans.ttf'))
 doc.registerFont('bold',path.join(process.cwd(),'assets/fonts/DejaVuSans-Bold.ttf'))
 const chunks:Buffer[]=[]
 const finished=new Promise<Buffer>((resolve,reject)=>{doc.on('data',(b:Buffer)=>chunks.push(b));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)})
 let y=top,pages=0,continuation=''
 const context=[p.state==='draft'?'RASCUNHO - NÃO É PRESCRIÇÃO FINAL':p.state==='archived'?'ARQUIVADO':'FICHA ATIVA',historical?'VERSÃO HISTÓRICA':''].filter(Boolean).join(' | ')
 const clean=(v:string)=>v.replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'')
 function lines(value:string,w:number,size:number,bold=false){
  doc.font(bold?'bold':'regular').fontSize(size)
  const result:string[]=[]
  for(const paragraph of clean(value).split('\n')){
   let line=''
   for(const word of paragraph.split(/\s+/)){
    if(!word)continue
    if(doc.widthOfString((line?line+' ':'')+word)<=w){line+=(line?' ':'')+word;continue}
    if(line){result.push(line);line=''}
    for(const char of word){if(doc.widthOfString(line+char)>w){result.push(line);line=''}line+=char}
   }
   result.push(line)
  }
  return result
 }
 const height=(v:string,w=width,size=bodySize,bold=false)=>lines(v,w,size,bold).length*size*1.4
 function paint(value:string,x:number,at:number,w:number,size:number,bold=false,color=INK,align:'left'|'center'|'right'='left'){
  const ls=lines(value,w,size,bold)
  ls.forEach((line,i)=>{let offset=0;doc.font(bold?'bold':'regular').fontSize(size);if(align!=='left')offset=(w-doc.widthOfString(line))/(align==='center'?2:1);doc.fillColor(color).text(line,x+offset,at+i*size*1.4,{width:w-offset,lineBreak:false})})
  return ls.length*size*1.4
 }
 function newPage(){
  if(++pages>120)throw new WorkoutError(422,'Documento muito extenso. Exporte menos divisões por vez.')
  doc.addPage()
  if(premium){doc.rect(left,30,26,4).fill(GREEN);paint('FORMFISIK / TREINAMENTO',left+36,28,width-36,8,true);doc.moveTo(left,49).lineTo(right,49).strokeColor(LINE).lineWidth(.6).stroke()}
  else{doc.rect(left,30,width,1.5).fill(GREEN);paint('FORMFISIK / TREINAMENTO',left,40,width,8,true)}
  paint(context,left,59,width,8.5,true)
  y=top
  if(continuation){paint(continuation+' / continuação',left,y,width,8.5,true,GRAY);y+=height(continuation+' / continuação',width,8.5,true)+12}
 }
 function ensure(h:number){if(y+h>bottom)newPage()}
 function text(value:string,size=bodySize,bold=false,color=INK,x=left,w=width){const lh=size*1.4;for(const line of lines(value,w,size,bold)){ensure(lh);paint(line,x,y,w,size,bold,color);y+=lh}}
 function rule(gap=10){if(y<bottom)doc.moveTo(left,y).lineTo(right,y).strokeColor(LINE).lineWidth(.6).stroke();y+=gap}
 function paragraph(label:string,value:string){
  if(!value)return
  const h=height(label.toUpperCase(),width,8,true)+3+height(value)+10
  // Keep short notes intact; long notes start with a label and at least two lines.
  ensure(h<=170?h:8*1.4+3+bodySize*2.8)
  text(label.toUpperCase(),8,true,GRAY);y+=3;text(value);y+=10
 }
 const definition=(e:PrescribedExercise)=>{const name=p.exerciseDefinitions[e.exerciseId+':'+e.exerciseVersion]?.name;if(!name)throw new WorkoutError(409,'Referência histórica incompleta. Não foi possível exportar.');return name}
 const phaseLabels=(e:PrescribedExercise)=>{let series=0,stage=0;return e.sets.map(s=>{if(s.phase==='work'){series++;stage=0}else stage++;return s.phase==='work'?String(series):`${series}.${stage} ${s.phase==='drop'?'Drop':'Retomada'}`})}
 const rowNote=(s:PrescribedSet)=>[s.executionSeconds!==null?`Tempo de execução: ${s.executionSeconds} s`:'',o.notes?s.notes:''].filter(Boolean).join(' • ')
 const columns=()=>{
  const available=width-(premium?24:0),first=premium?72:70,load=o.loads?(premium?102:94):0,rest=premium?77:67,annotation=o.annotations&&!premium?83:0
  const sizes=[first,available-first-load-rest-annotation,...(o.loads?[load]:[]),rest,...(o.annotations&&!premium?[annotation]:[])]
  return {sizes,headers:['Série / etapa','Prescrição',...(o.loads?['Carga sugerida']:[]),'Descanso',...(o.annotations&&!premium?['Realizada']:[])]}
 }
 function setRows(e:PrescribedExercise){const phases=phaseLabels(e);return e.sets.map((s,i)=>[phases[i],repetitionLabel(s.repetition),...(o.loads?[loadLabel(s)]:[]),s.restSeconds===null?'—':s.restSeconds+' s',...(o.annotations&&!premium?['________']:[])])}
 function headerHeight(){const {sizes,headers}=columns();return Math.max(...headers.map((h,i)=>height(h,sizes[i]-12,8,true)))+14}
 function rowHeight(row:string[]){const {sizes}=columns();return Math.max(...row.map((v,i)=>height(v,sizes[i]-12,premium?(i===1?13:10):9.5,premium&&(i===1||i===0))))+(premium?13:12)+(o.annotations&&premium?13:0)}
 function notesHeight(s:PrescribedSet){const note=rowNote(s);return note?height(note,width-(premium?38:14),9)+9:0}
 function exerciseHeaderHeight(e:PrescribedExercise){return Math.max(height(definition(e),width-(premium?44:0),premium?12:10.5,true),premium?24:0)+24}
 function exerciseHeight(e:PrescribedExercise){const rows=setRows(e);return exerciseHeaderHeight(e)+(rows.length?headerHeight()+rows.reduce((sum,row,i)=>sum+rowHeight(row)+notesHeight(e.sets[i]),0):30)+(o.notes&&e.notes?height(e.notes)+26:0)+16}
 function reserveExercise(e:PrescribedExercise){const total=exerciseHeight(e);return total<=350?total:exerciseHeaderHeight(e)+headerHeight()+(e.sets.length?rowHeight(setRows(e)[0]):30)+20}
 function tableHeader(){const {sizes,headers}=columns(),h=headerHeight(),x0=left+(premium?12:0);doc.rect(left,y,width,h).fill(premium?LIGHT:'#f4f5f2');let x=x0;headers.forEach((v,i)=>{paint(v,x+6,y+7,sizes[i]-12,8,true,GRAY,i>1?'center':'left');x+=sizes[i]});y+=h;doc.moveTo(left,y).lineTo(right,y).strokeColor(LINE).lineWidth(.6).stroke()}
 function exerciseHeader(e:PrescribedExercise,index:number,d:Division){
  const name=definition(e),start=y
  if(premium){doc.rect(left,start,24,24).fill(INK);paint(String(index+1).padStart(2,'0'),left,start+5,24,10,true,'#ffffff','center');text(name,12,true,INK,left+44,width-44)}else text(`${String(index+1).padStart(2,'0')}. ${name}`,10.5,true)
  y=Math.max(y,start+(premium?24:0))+4
  const group=d.groups.find(g=>g.members.includes(e.id))
  const relationship=group?` • ${techniqueLabels[group.technique]} / passo ${group.members.indexOf(e.id)+1} de ${group.members.length}`:''
  text(`${techniqueLabels[e.technique]} • referência v${e.exerciseVersion}${relationship}`,8,false,GRAY,premium?left+44:left,premium?width-44:width);y+=9
 }
 function series(e:PrescribedExercise,index:number,d:Division){
  const rows=setRows(e),{sizes}=columns(),x0=left+(premium?12:0)
  tableHeader()
  rows.forEach((row,n)=>{
   const s=e.sets[n],h=rowHeight(row),note=rowNote(s),nh=notesHeight(s)
   // A short annotation belongs to its series; large notes may continue with context.
   const tail=rows.length-n===2?h+nh+rowHeight(rows[n+1])+Math.min(notesHeight(e.sets[n+1]),55):h+Math.min(nh,55)
   if(y+tail>bottom){newPage();exerciseHeader(e,index,d);tableHeader()}
   const start=y
   if(premium){doc.rect(left,start,width,h).fill(n%2===0?'#f7f8f5':'#ffffff');if(s.phase!=='work')doc.rect(left,start,2,h).fill(GREEN)}else if(n%2===0)doc.rect(left,start,width,h).fill('#f8f9f6')
   let x=x0
   row.forEach((v,i)=>{const font=premium?(i===1?13:10):9.5;paint(v,x+6,start+(premium?8:6),sizes[i]-12,font,i===1||premium&&i===0,INK,i>1?'center':'left');x+=sizes[i]})
   if(o.annotations&&premium)paint('Carga realizada: __________________________________',x0+6,start+h-18,width-36,8.5,false,GRAY)
   y=start+h
   if(note){y+=3;text(note,9,false,GRAY,left+(premium?18:7),width-(premium?36:14));y+=6}
   doc.moveTo(left,y).lineTo(right,y).strokeColor(LINE).lineWidth(.4).stroke()
  })
  y+=10
 }
 function groupHeight(g:Division['groups'][number],d:Division){return height(techniqueLabels[g.technique]+' / SEQUÊNCIA PRESCRITA',width-24,9,true)+g.members.reduce((sum,id,i)=>{const e=d.exercises.find(v=>v.id===id)!;return sum+height(`${i+1} → exercício ${d.exercises.indexOf(e)+1}: ${definition(e)}`,width-36,9.5)+4},0)+(g.roundRestSeconds!==null?21:0)+(o.notes&&g.notes?height(g.notes,width-24,9)+18:0)+24}
 function group(g:Division['groups'][number],d:Division){
  const h=groupHeight(g,d);ensure(Math.min(h,190));const start=y
  if(premium){doc.moveTo(left,start).lineTo(left+width,start).strokeColor(LINE).lineWidth(.8).stroke();y+=10}
  text(techniqueLabels[g.technique].toUpperCase()+' / SEQUÊNCIA PRESCRITA',9,true,INK,left+12,width-24);y+=7
  for(const [i,id]of g.members.entries()){const e=d.exercises.find(v=>v.id===id)!;text(`${i+1} → exercício ${d.exercises.indexOf(e)+1}: ${definition(e)}`,9.5,false,INK,left+18,width-36);y+=4}
  if(g.roundRestSeconds!==null){text(`Descanso entre voltas: ${g.roundRestSeconds} s`,9,false,GRAY,left+12,width-24);y+=5}
  if(o.notes&&g.notes){text('Observação do grupo: '+g.notes,9,false,GRAY,left+12,width-24);y+=5}
  y+=10
 }
 function divisionHeader(d:Division,index:number){
  const nameWidth=premium?width-81:width-15,h=height(d.name,nameWidth,premium?18:13,true)+(premium?25:15)
  const description=d.description?height(d.description)+10:0
  continuation='';const content=d.groups.length?Math.min(groupHeight(d.groups[0],d),180):d.exercises[0]?reserveExercise(d.exercises[0]):30
  ensure(Math.min(h+description+content,bottom-top-35))
  continuation=`Divisão ${index+1} / ${d.name}`
  if(premium){doc.rect(left,y,width,h).fill(INK);doc.rect(left,y,53,h).fill(LIGHT);paint(String(index+1).padStart(2,'0'),left+8,y+11,37,20,true);doc.rect(left,y,3,h).fill(GREEN);paint(d.name,left+68,y+12,nameWidth,18,true,'#ffffff');y+=h+12}
  else{doc.rect(left,y,3,h-5).fill(GREEN);paint(`${index+1}. ${d.name}`,left+12,y+3,width-12,13,true);y+=h+6}
  if(d.description){text(d.description);y+=12}
 }
 function presentation(){
  if(o.brand&&(identity.brand||identity.logo)){
   const start=y,logoWidth=premium?100:82,logoHeight=premium?48:37,hasLogo=!!identity.logo
   if(identity.logo)doc.image(identity.logo,left,start,{fit:[logoWidth,logoHeight],valign:'center'})
   const x=hasLogo?left+logoWidth+16:left,w=width-(x-left)
   if(identity.brand)paint(identity.brand,x,start+3,w,premium?14:11,true)
   y=start+Math.max(hasLogo?logoHeight:0,identity.brand?height(identity.brand,w,premium?14:11,true)+5:0)+18
  }
  text(premium?'FICHA INDIVIDUAL / PLANEJAMENTO':'FICHA INDIVIDUAL',8,true,GRAY);y+=6
  text(p.studentName??'Aluno',premium?30:19,true);y+=7
  text(p.fields.name,premium?16:11,true);y+=premium?18:12
  if(premium&&p.fields.objective){const start=y,h=height(p.fields.objective,width-28,10.5)+32;if(h<200){ensure(h);doc.rect(left,y,width,h).fill(LIGHT);paint('OBJETIVO',left+14,y+10,width-28,8,true,GRAY);paint(p.fields.objective,left+14,y+25,width-28,10.5);y+=h+16}else{y=start;paragraph('Objetivo',p.fields.objective)}}
  if(o.professional){
   paragraph('Profissional responsável na versão',p.professionalName)
   if(identity.professionalName)paragraph('Apresentação profissional atual',identity.professionalName)
   if(identity.registration)paragraph('Registro informado pelo profissional (não verificado)',identity.registration)
   if(identity.contact)paragraph('Contato profissional de apresentação',identity.contact)
  }
  const stamp=issued.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})
  ensure(40);text(`Versão ${p.version} • Emitido em ${stamp} (Brasília)`,8,false,GRAY);y+=3
  text(`Registro da versão: ${new Date(p.updatedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}`,8,false,GRAY);y+=10
  if(p.fields.startDate||p.fields.endDate){text(`Período: ${p.fields.startDate?p.fields.startDate.split('-').reverse().join('/'):'não informado'} a ${p.fields.endDate?p.fields.endDate.split('-').reverse().join('/'):'não informado'}`,9,false,GRAY);y+=10}
  if(!premium)paragraph('Objetivo',p.fields.objective)
  if(o.guidance)paragraph('Orientações gerais',p.fields.notes)
  rule(premium?18:12)
 }
 newPage();presentation()
 const selected=p.fields.divisions.filter(d=>o.divisionIds===null||o.divisionIds.includes(d.id))
 if(!selected.length)text('Nenhuma divisão cadastrada nesta versão.',10)
 for(const d of selected){
  divisionHeader(d,p.fields.divisions.findIndex(v=>v.id===d.id))
  for(const g of d.groups)group(g,d)
  for(const [index,e]of d.exercises.entries()){
   const name=definition(e)
   continuation=`Divisão / ${d.name}`
   if(index>0||d.groups.length)ensure(reserveExercise(e))
   continuation=`${d.name} / ${String(index+1).padStart(2,'0')}. ${name}`
   exerciseHeader(e,index,d)
   if(e.sets.length)series(e,index,d);else{text('Séries não informadas neste rascunho.',10,false,GRAY);y+=12}
   if(o.notes&&e.notes)paragraph('Observações do exercício',e.notes)
   y+=5
  }
  continuation=`Divisão / ${d.name}`
  if(o.notes&&d.notes)paragraph('Observações da divisão',d.notes)
  y+=premium?14:10
 }
 const range=doc.bufferedPageRange()
 for(let i=0;i<range.count;i++){
  doc.switchToPage(i);const saved=doc.page.margins.bottom;doc.page.margins.bottom=0
  doc.moveTo(left,794).lineTo(right,794).strokeColor(LINE).lineWidth(.6).stroke()
  paint('Produzido com FormFisik',left,805,300,8,false,GRAY)
  paint(`${i+1} / ${range.count}`,right-70,805,70,8,true,GRAY,'right')
  doc.page.margins.bottom=saved
 }
 doc.end();const bytes=await finished
 if(bytes.length>8388608)throw new WorkoutError(422,'Documento muito grande. Selecione menos divisões.')
 return bytes
}
