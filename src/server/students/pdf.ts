import 'server-only'
import PDFDocument from 'pdfkit'
import path from 'node:path'
import type { Student,StudentSummary,StudentQuery } from '../../modules/students/schema'
export async function studentPdf(professional:string,students:(Student|StudentSummary)[],filters?:StudentQuery){
 const font=path.join(process.cwd(),'assets/fonts/DejaVuSans.ttf')
 const doc=new PDFDocument({size:'A4',margins:{top:104,bottom:66,left:48,right:48},font,bufferPages:true,info:{Title:filters?'Carteira de alunos':'Cadastro individual',Author:'FormFisik'}})
 const chunks:Buffer[]=[];const finished=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)})
 const width=doc.page.width-96
 function header(){doc.save();doc.rect(48,34,width,4).fill('#96d100');doc.fontSize(18).fillColor('#111111').text('FORMFISIK',48,49,{width});doc.fontSize(9).fillColor('#444444').text('Gestão profissional de alunos',48,75,{width});doc.restore();doc.fontSize(11).fillColor('#111111');doc.x=48;doc.y=104}
 header();doc.on('pageAdded',header)
 const paragraph=(label:string,value:string)=>{doc.fontSize(10).fillColor('#444444').text(label,{width});doc.fontSize(11).fillColor('#111111').text(value||'Não informado',{width,lineGap:3});doc.moveDown(0.7)}
 doc.fontSize(20).fillColor('#111111').text(filters?'Carteira de alunos':'Cadastro individual',{width});doc.moveDown(0.7)
 paragraph('Profissional responsável',professional)
 paragraph('Emitido em',new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})+' (Brasília)')
 const date=(iso:string)=>iso?new Date(iso.length===10?iso+'T12:00:00Z':iso).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}):''
 if(filters){paragraph('Critérios',`Nome: ${filters.q||'Todos'} | Situação: ${filters.status==='all'?'Todas':filters.status==='active'?'Ativos':'Arquivados'} | Ordenação: ${{name_asc:'Nome A-Z',name_desc:'Nome Z-A',newest:'Mais recentes',oldest:'Mais antigos'}[filters.sort]}`);paragraph('Total de registros',String(students.length))
  for(const student of students){doc.fontSize(11);const text=`${student.fullName}\n${student.status==='active'?'Ativo':'Arquivado'} | Cadastro: ${date(student.createdAt)}`;const height=doc.heightOfString(text,{width,lineGap:4})+22;if(doc.y+height>doc.page.height-70)doc.addPage();doc.fillColor('#111111').text(text,{width,lineGap:4});doc.moveDown();doc.moveTo(48,doc.y).lineTo(doc.page.width-48,doc.y).strokeColor('#dddddd').stroke();doc.moveDown()}
  if(!students.length)paragraph('Listagem','Nenhum aluno corresponde aos filtros selecionados.')
 }else{const student=students[0];if(!('email' in student))throw new Error('Individual report requires private record');paragraph('Aluno',student.fullName);paragraph('Situação',student.status==='active'?'Ativo':'Arquivado');paragraph('Identificação do vínculo',student.id);paragraph('E-mail',student.email);paragraph('Telefone',student.phone);paragraph('Data de nascimento',date(student.birthDate));paragraph('Data de cadastro',date(student.createdAt));paragraph('Última atualização',date(student.updatedAt));paragraph('Observações administrativas',student.adminNotes)}
 const pages=doc.bufferedPageRange();for(let i=pages.start;i<pages.start+pages.count;i++){doc.switchToPage(i);const bottom=doc.page.margins.bottom;doc.page.margins.bottom=0;doc.fontSize(8).fillColor('#555555').text(`FormFisik | Uso administrativo privado | Página ${i+1} de ${pages.count}`,48,doc.page.height-43,{width,lineBreak:false});doc.page.margins.bottom=bottom}
 doc.end();return finished
}
