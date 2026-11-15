import { readSession,sessionToken } from '@/server/sessions'
import { professionalAccess } from '@/server/professional-dashboard'
import { db } from '@/server/db'
import { reply,failure,limit } from '@/server/http'
import { searchDates } from '@/modules/search/dates'
import { defaultAvailability } from '@/modules/agenda/schema'
import { dayBoundary,addDays } from '@/modules/agenda/time'
import { fold } from '@/modules/search/catalog'
export async function GET(request:Request){try{
 const user=await readSession(sessionToken(request.headers.get('cookie')))
 if(!user)return reply({message:'Entre novamente para continuar.'},401)
 if(user.role!=='professional')return reply({message:'Acesso não permitido.'},403)
 const q=new URL(request.url).searchParams.get('q')?.trim()??''
 if(q.length<1||q.length>80)return reply({message:'Digite entre 3 e 80 caracteres.'},400)
 await limit(`global-search:${user.id}`,90,60)
 const access=await professionalAccess(user)
 if(access.status!=='allowed')return reply({items:[],restricted:true},200)
 const zone=(await db().query('SELECT timezone FROM agenda_settings WHERE professional_id=$1',[user.id])).rows[0]?.timezone??defaultAvailability().timezone
 const range=searchDates(q,zone)
 if(range){
  const page=Math.min(10000,Math.max(1,Math.floor(Number(new URL(request.url).searchParams.get('page'))||1)))
  const args=[user.id,new Date(dayBoundary(range.from,zone)),new Date(dayBoundary(addDays(range.to,1),zone))]
  const where=" FROM agenda_occurrences WHERE professional_id=$1 AND starts_at >= $2 AND starts_at < $3 AND kind<>'block'"
  const [rows,count]=await Promise.all([db().query("SELECT id,title,kind,state,starts_at"+where+' ORDER BY starts_at,id LIMIT 20 OFFSET $4',[...args,(page-1)*20]),db().query('SELECT count(*)::int AS total'+where,args)])
  return reply({items:rows.rows.map(r=>({id:'agenda:'+r.id,name:r.kind==='personal'?'Compromisso pessoal':r.title,category:new Intl.DateTimeFormat('pt-BR',{timeZone:zone,dateStyle:'short',timeStyle:'short'}).format(r.starts_at)+' · '+(({scheduled:'Agendado',completed:'Concluído',canceled:'Cancelado',no_show:'Ausente'} as Record<string,string>)[r.state]??'Compromisso'),href:'/agenda?occurrence='+r.id+'&date='+range.from})),agenda:{...range,timezone:zone,total:count.rows[0].total,page,pageSize:20}},200)
 }
 if(q.length<3)return reply({items:[]},200)
 const normalized=fold(q).replace(/[^\p{L}\p{N} ]/gu,'').trim()
 if(normalized.length<3)return reply({items:[]},200)
 const pattern='%'+[...normalized].join('%')+'%'
 const sql=`WITH candidates AS (
 SELECT l.id::text,'Aluno' AS category,s.full_name AS name,'/alunos/'||l.id::text AS href FROM student_links l JOIN student_records s ON s.id=l.student_id AND s.professional_id=l.professional_id WHERE l.professional_id=$1 AND l.status='active'
 UNION ALL SELECT id::text,'Treino',name,'/treinos/'||id::text FROM workout_plans WHERE owner_id=$1 AND state<>'archived'
 UNION ALL SELECT id::text,'Exercício',name,'/exercicios?q='||name FROM exercise_entries WHERE (scope='official' AND state='published') OR (owner_id=$1 AND state='active')
 ), matched AS (SELECT *,translate(lower(name),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc') AS folded FROM candidates)
 SELECT id,category,name,href FROM matched WHERE folded LIKE $2 ORDER BY CASE WHEN folded LIKE $3 THEN 0 ELSE 1 END,length(name),name,id LIMIT 18`
 const rows=(await db().query(sql,[user.id,pattern,'%'+normalized+'%'])).rows
 return reply({items:rows.map(r=>({id:r.category+':'+r.id,name:r.name,category:r.category,href:r.category==='Exercício'?'/exercicios?q='+encodeURIComponent(r.name):r.href}))},200)
}catch(e){return failure(e,'global_search_unavailable')}}
