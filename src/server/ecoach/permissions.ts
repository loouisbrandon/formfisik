import 'server-only'
import {aiRuntime,consentFingerprint,CoachError} from './provider'
import {readSession,sessionToken,sessionDigest} from '@/server/sessions'
import {reply,failure,jsonBody,sameOrigin,limit} from '@/server/http'
import {db} from '@/server/db'
import {saveSettings,SettingsConflict,SettingsUnauthorized} from '@/server/settings/repository'
import {coachPermission} from '@/modules/ecoach/permissions-schema'
import {z} from '@/lib/validation'
const input=z.object({mode:coachPermission,version:z.number().int().nonnegative(),externalConsent:z.boolean().optional()}).strict()
export async function permissionsHandler(request:Request){try{
 if(request.method!=='GET'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token)
 if(!user||!token)return reply({message:'Entre novamente.'},401)
 if(user.role!=='professional')return reply({message:'Área exclusiva do profissional.'},403)
 await limit('ecoach-permission:'+request.method+':'+user.id,request.method==='GET'?60:15,60)
 if(request.method==='GET'){const r=await db().query('SELECT preferences,version FROM professional_settings WHERE user_id=$1',[user.id]);const mode=coachPermission.safeParse(r.rows[0]?.preferences?.ecoach);return reply({mode:mode.success?mode.data:null,version:r.rows[0]?.version??0,runtime:aiRuntime(),externalConsent:r.rows[0]?.preferences?.ecoachExternalConsent===consentFingerprint()},200)}
 const data=input.parse(await jsonBody(request,1024))
 if(data.externalConsent&&!aiRuntime().ready)throw new CoachError(503,'Configure o provedor antes de autorizar o compartilhamento.');const preferences={ecoach:data.mode,...(data.externalConsent!==undefined?{ecoachExternalConsent:data.externalConsent?consentFingerprint():null}:{})}
 const result=await saveSettings(user.id,data.version,{preferences},{tokenHash:sessionDigest(token)})
 const stored=await db().query('SELECT preferences FROM professional_settings WHERE user_id=$1',[user.id]);return reply({mode:data.mode,version:result.version,runtime:aiRuntime(),externalConsent:stored.rows[0]?.preferences?.ecoachExternalConsent===consentFingerprint()},200)
 }catch(e){if(e instanceof CoachError)return reply({message:e.message},e.status);if(e instanceof SettingsUnauthorized)return reply({message:'Entre novamente.'},401);if(e instanceof SettingsConflict)return reply({message:'As configurações mudaram. Recarregue antes de salvar.'},409);if(e instanceof z.ZodError)return reply({message:'Escolha uma permissão válida.'},400);return failure(e,'ecoach_permissions_unavailable')}}
