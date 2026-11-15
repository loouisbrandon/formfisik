import 'server-only'
import {limit,RateLimit} from '../http'
import {CoachError} from './provider'
const bounded=(value:string|undefined,fallback:number,max:number)=>Math.max(1,Math.min(max,Math.floor(Number(value)||fallback)))
// Shared across text/tool rounds, assistance, voice and vision. Reserve before every external call.
export async function reserveCoachCall(owner:string){try{await limit('ecoach-provider:user:'+owner,bounded(process.env.ECOACH_AI_CALL_DAILY_LIMIT,30,200),86400);await limit('ecoach-provider:global',bounded(process.env.ECOACH_AI_CALL_GLOBAL_DAILY_LIMIT,300,2000),86400)}catch(e){if(e instanceof RateLimit)throw new CoachError(429,'Limite compartilhado de chamadas do eCoach atingido. Tente novamente mais tarde.');throw e}}
