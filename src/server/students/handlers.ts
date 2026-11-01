import 'server-only'
import { z } from 'zod'
import { readSession, sessionToken } from '../sessions'
import { professionalAccess } from '../professional-dashboard'
import type { BillingGateway } from '../subscriptions/stripe'
import { failure,jsonBody,limit,privateHeaders,reply,sameOrigin } from '../http'
import { createStudentSchema,editStudentSchema,statusStudentSchema,studentQuerySchema } from '../../modules/students/schema'
import { createStudent,getStudent,listStudents,updateStudent,StudentConflict,StudentNotFound,ExportLimit } from './repository'
import { studentPdf } from './pdf'
export function createStudentHandler(operation:'list'|'create'|'get'|'edit'|'status'|'pdf'|'export',gateway?:BillingGateway){
 return async(request:Request,id?:string)=>{
  try{
   if(['create','edit','status'].includes(operation)&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
   const user=await readSession(sessionToken(request.headers.get('cookie')))
   if(!user)return reply({message:'Entre novamente para continuar.'},401)
   await limit(`students:${operation}:${user.id}`,['pdf','export'].includes(operation)?5:operation==='list'?120:40,60)
   const access=await professionalAccess(user,gateway)
   if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
   if(id&&!z.uuid().safeParse(id).success)throw new StudentNotFound()
   if(operation==='list'||operation==='export'){
    const query=studentQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if(!query.success)return reply({message:'Filtros inválidos.'},400)
    const list=await listStudents(user.id,query.data,operation==='export')
    if(operation==='list')return reply(list,200)
    const pdf=await studentPdf(user.fullName,list.items,query.data)
    return new Response(new Uint8Array(pdf),{headers:{...privateHeaders,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="formfisik-alunos.pdf"','X-Content-Type-Options':'nosniff'}})
   }
   if(operation==='create'){
    const input=createStudentSchema.safeParse(await jsonBody(request));if(!input.success)return reply({message:'Confira os campos.',errors:input.error.flatten().fieldErrors},400)
    return reply({student:await createStudent(user.id,input.data)},201)
   }
   if(!id)throw new StudentNotFound()
   if(operation==='get')return reply({student:await getStudent(user.id,id)},200)
   if(operation==='pdf'){
    const pdf=await studentPdf(user.fullName,[await getStudent(user.id,id)])
    return new Response(new Uint8Array(pdf),{headers:{...privateHeaders,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="formfisik-aluno.pdf"','X-Content-Type-Options':'nosniff'}})
   }
   if(operation==='status'){
    const input=statusStudentSchema.safeParse(await jsonBody(request));if(!input.success)return reply({message:'Situação ou versão inválida.'},400)
    return reply({student:await updateStudent(user.id,id,input.data.version,{status:input.data.status})},200)
   }
   const input=editStudentSchema.safeParse(await jsonBody(request));if(!input.success)return reply({message:'Confira os campos.',errors:input.error.flatten().fieldErrors},400)
   return reply({student:await updateStudent(user.id,id,input.data.version,input.data)},200)
  }catch(error){
   if(error instanceof StudentNotFound)return reply({message:'Aluno não encontrado.'},404)
   if(error instanceof StudentConflict)return reply({message:error.reason==='duplicate'?'Há um cadastro com os mesmos dados. Confira a carteira antes de cadastrar outra pessoa.':error.reason==='version'?'Este registro foi atualizado. Recarregue o perfil antes de salvar.':'Esta tentativa de cadastro já foi utilizada. Reabra o formulário.',code:error.reason},409)
   if(error instanceof ExportLimit)return reply({message:'O relatório aceita até 500 alunos. Refine os filtros para exportar.'},422)
   return failure(error,'students_operation_unavailable')
  }
 }
}
