import 'server-only'
import type {PoolClient} from 'pg'
import {db} from '../db'
import {CrmError} from '../crm/core'
import {contextLabels,type ContextRef,type CommunicationQuery} from '@/modules/communication/schema'
type Sql=Pick<PoolClient,'query'>
export async function contextSummary(c:Sql,owner:string,student:string,ref:ContextRef,write=false){
 let sql:string;const args:unknown[]=[owner,student,ref.id,ref.version]
 switch(ref.kind){
 case 'workout':sql="SELECT v.version FROM workout_versions v JOIN workout_plans p ON p.owner_id=v.owner_id AND p.id=v.plan_id WHERE v.owner_id=$1 AND p.student_link_id=$2 AND p.kind='individual' AND v.plan_id=$3 AND v.version=$4"+(write?' FOR SHARE OF p':'');break
 case 'checkin':sql="SELECT o.version FROM checkin_occurrences o WHERE o.professional_id=$1 AND o.student_link_id=$2 AND o.id=$3 AND (($4=0"+(write?" AND NOT EXISTS(SELECT 1 FROM checkin_submissions s WHERE s.professional_id=$1 AND s.occurrence_id=o.id)":"")+") OR EXISTS(SELECT 1 FROM checkin_submissions s WHERE s.professional_id=$1 AND s.occurrence_id=o.id AND s.revision=$4))"+(write?' FOR SHARE OF o':'');break
 case 'appointment':sql='SELECT version FROM agenda_occurrences WHERE professional_id=$1 AND student_link_id=$2 AND id=$3 AND version'+(write?'=':'>=')+'$4'+(write?' FOR SHARE':'');break
 case 'contract':sql='SELECT v.version FROM professional_contract_versions v JOIN professional_contracts c ON c.professional_id=v.professional_id AND c.id=v.contract_id WHERE v.professional_id=$1 AND c.student_link_id=$2 AND v.contract_id=$3 AND v.version=$4'+(write?' FOR SHARE OF c':'');break
 case 'assessment':if(!ref.assessmentAuthorized||ref.assessmentPurpose.length<5)throw new CrmError(403,'assessment_authorization');sql='SELECT version FROM physical_assessments WHERE professional_id=$1 AND student_link_id=$2 AND id=$3 AND version'+(write?'=':'>=')+'$4'+(write?' FOR SHARE':'');break
 }
 const r=await c.query(sql,args);if(!r.rowCount)throw new CrmError(404,'context')
 const href=ref.kind==='workout'?'/treinos/'+ref.id:ref.kind==='assessment'?'/acompanhamento/'+student:'/alunos/'+student+'/'+({checkin:'checkins',appointment:'agenda',contract:'consultorias'}[ref.kind as 'checkin'|'appointment'|'contract'])
 return {kind:ref.kind,id:ref.id,version:ref.version,label:contextLabels[ref.kind],href,available:true,currentVersion:r.rows[0].version as number}
}
export async function listContexts(owner:string,q:CommunicationQuery){if(!q.studentId)throw new CrmError(400,'student');if(q.contextKind==='assessment'&&q.assessmentAuthorized!=='yes')throw new CrmError(403,'assessment_authorization')
 let source:string
 switch(q.contextKind){
 case 'workout':source="SELECT p.id,v.version,v.document->>'name' AS label,v.created_at AS date FROM workout_versions v JOIN workout_plans p ON p.owner_id=v.owner_id AND p.id=v.plan_id WHERE p.owner_id=$1 AND p.student_link_id=$2 AND p.kind='individual'";break
 case 'checkin':source="SELECT o.id,COALESCE((SELECT max(s.revision) FROM checkin_submissions s WHERE s.professional_id=$1 AND s.occurrence_id=o.id),0)::int AS version,'Check-in · '||to_char(o.period_end,'DD/MM/YYYY') AS label,o.created_at AS date FROM checkin_occurrences o WHERE o.professional_id=$1 AND o.student_link_id=$2";break
 case 'appointment':source="SELECT id,version,'Atendimento · '||to_char(starts_at AT TIME ZONE timezone,'DD/MM/YYYY HH24:MI') AS label,starts_at AS date FROM agenda_occurrences WHERE professional_id=$1 AND student_link_id=$2";break
 case 'contract':source="SELECT c.id,v.version,'Contratação · '||to_char(c.starts_on,'DD/MM/YYYY') AS label,v.created_at AS date FROM professional_contract_versions v JOIN professional_contracts c ON c.professional_id=v.professional_id AND c.id=v.contract_id WHERE c.professional_id=$1 AND c.student_link_id=$2";break
 case 'assessment':source="SELECT id,version,'Avaliação · '||to_char(assessment_date,'DD/MM/YYYY') AS label,created_at AS date FROM physical_assessments WHERE professional_id=$1 AND student_link_id=$2";break
 }
 const r=await db().query('WITH source AS('+source+"),filtered AS(SELECT * FROM source WHERE lower(label) LIKE $3 ESCAPE '\\') SELECT (SELECT count(*)::int FROM filtered) AS total,COALESCE((SELECT json_agg(p) FROM(SELECT id,version,label FROM filtered ORDER BY date DESC,id,version DESC LIMIT 20 OFFSET $4)p),'[]') AS items",[owner,q.studentId,'%'+q.q.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%',(q.page-1)*20]);return {...r.rows[0],page:q.page}
}
