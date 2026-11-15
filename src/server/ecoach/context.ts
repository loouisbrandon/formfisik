import 'server-only'
import type {Pool,PoolClient} from 'pg'
import type {CoachContext} from '@/modules/ecoach/history-schema'
import {CoachError} from './provider'
export async function validateContext(client:Pool|PoolClient,owner:string,context:CoachContext|null){
 if(context?.period&&context.period.from>context.period.to)throw new CoachError(400,'Período inválido.')
 if(context?.record){const record=context.record;const query=record.kind==='student'?'SELECT 1 FROM student_links WHERE professional_id=$1 AND id=$2':'SELECT 1 FROM finance_charges WHERE professional_id=$1 AND id=$2';if(!(await client.query(query,[owner,record.id])).rowCount)throw new CoachError(404,'Registro de contexto indisponível.')}
}
