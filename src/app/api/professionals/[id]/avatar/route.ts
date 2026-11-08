import {z} from '@/lib/validation'
import {db} from '@/server/db'
import {privateHeaders,reply,failure} from '@/server/http'
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;if(!z.uuid().safeParse(id).success)return reply({},404);const r=await db().query('SELECT p.avatar FROM professional_settings p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1 AND p.published_profile IS NOT NULL AND u.disabled_at IS NULL',[id]);if(!r.rows[0]?.avatar)return reply({},404);return new Response(new Uint8Array(r.rows[0].avatar),{headers:{...privateHeaders,'Content-Type':'image/jpeg'}})}catch(e){return failure(e,'public_avatar_unavailable')}}
