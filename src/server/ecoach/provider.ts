import 'server-only'
import {aiDecision,type AiDecision,type AiRuntime} from '@/modules/ecoach/ai-schema'
export class CoachError extends Error{constructor(public status:number,message:string){super(message)}}
export type AiMessage={role:'user'|'assistant';content:string}
export interface CoachProvider{complete(system:string,messages:AiMessage[],signal:AbortSignal):Promise<{decision:AiDecision;inputTokens:number;outputTokens:number}>}
export function aiRuntime():AiRuntime{const enabled=process.env.ECOACH_AI_ENABLED==='true',provider=process.env.ECOACH_AI_PROVIDER||'openai',candidate=process.env.ECOACH_AI_MODEL,model=candidate&&/^[a-zA-Z0-9._:/-]{1,120}$/.test(candidate)?candidate:null;const valid=provider==='openai'||provider==='anthropic';const key=provider==='openai'?process.env.ECOACH_OPENAI_API_KEY:process.env.ECOACH_ANTHROPIC_API_KEY;return {enabled,ready:!!(enabled&&valid&&model&&key&&process.env.ECOACH_AI_DATA_APPROVED==='true'),provider:valid?provider:null,model:model??null}}
export function consentFingerprint(){const runtime=aiRuntime();return `${runtime.provider}:${runtime.model}:v3:${process.env.ECOACH_TRANSCRIPTION_MODEL||'gpt-4o-mini-transcribe'}`}
export function outputTokenLimit(){return Math.max(512,Math.min(4096,Math.floor(Number(process.env.ECOACH_AI_MAX_OUTPUT_TOKENS)||4096)))}
export function configuredProvider(givenFetch:typeof fetch=fetch):CoachProvider{
 const runtime=aiRuntime();if(!runtime.ready)throw new CoachError(503,'Configure o provedor, modelo, chave e aprovação de dados do eCoach antes de ativar a IA.')
 const provider=runtime.provider,model=runtime.model,key=provider==='openai'?process.env.ECOACH_OPENAI_API_KEY:process.env.ECOACH_ANTHROPIC_API_KEY
 return {async complete(system,messages,signal){
  const openai=provider==='openai',response=await givenFetch(openai?'https://api.openai.com/v1/responses':'https://api.anthropic.com/v1/messages',{method:'POST',redirect:'error',signal,headers:{'Content-Type':'application/json',...(openai?{Authorization:'Bearer '+key}:{'x-api-key':key!,'anthropic-version':'2023-06-01'})},body:JSON.stringify(openai?{model,input:[{role:'developer',content:system},...messages],max_output_tokens:outputTokenLimit(),store:false,text:{format:{type:'json_object'}}}:{model,system,messages,max_tokens:outputTokenLimit()})})
  if(!response.ok)throw await providerFailure(response)
  const reader=response.body?.getReader();if(!reader)throw new CoachError(502,'Resposta vazia do provedor.');let bytes=0;const chunks:Uint8Array[]=[];try{while(true){const item=await reader.read();if(item.done)break;bytes+=item.value.length;if(bytes>131072)throw new CoachError(502,'Resposta do provedor excedeu o limite.');chunks.push(item.value)}}catch(e){await reader.cancel();throw e}
  const raw=JSON.parse(Buffer.concat(chunks).toString('utf8'))
  const text=openai?raw.output?.filter((o:{type:string})=>o.type==='message').flatMap((o:{content:{type:string;text:string}[]})=>o.content.filter(c=>c.type==='output_text').map(c=>c.text)).join(''):raw.content?.filter((o:{type:string})=>o.type==='text').map((o:{text:string})=>o.text).join('')
  if(typeof text!=='string'||text.length>32768||(!openai&&raw.stop_reason==='max_tokens')||(openai&&raw.status!=='completed'))throw new CoachError(502,'A resposta ficou incompleta. Reformule o pedido.')
  try{return {decision:aiDecision.parse(JSON.parse(text)),inputTokens:Math.min(10000000,Math.max(0,Math.floor(Number(raw.usage?.input_tokens)||0))),outputTokens:Math.min(10000000,Math.max(0,Math.floor(Number(raw.usage?.output_tokens)||0)))}}catch{throw new CoachError(502,'A IA retornou uma estrutura inválida. Nenhuma ação foi executada.')}
 }}
}

// Provider payloads may echo credentials or user text: only fixed messages leave this boundary.
export async function providerFailure(response:Response){
 let code:unknown
 const reader=response.body?.getReader()
 if(reader){try{let bytes=0;const chunks:Uint8Array[]=[];while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>8192){await reader.cancel();break}chunks.push(part.value)}if(bytes<=8192){const error=JSON.parse(Buffer.concat(chunks).toString('utf8'))?.error;code=error?.type==='insufficient_quota'?'insufficient_quota':error?.code}}catch{try{await reader.cancel()}catch{/* no raw provider error is logged */}}}
 if(response.status===401)return new CoachError(502,'O provedor recusou a autenticação. Confira a chave da API no ambiente local.')
 if(response.status===403)return new CoachError(502,'A chave da API não tem permissão para esta operação. Confira as permissões do projeto no provedor.')
 if(response.status===404||code==='model_not_found')return new CoachError(502,'O modelo configurado não está disponível para este projeto. Confira ECOACH_AI_MODEL e o acesso no provedor.')
 if(response.status===429&&code==='insufficient_quota')return new CoachError(429,'A conta da OpenAI está sem créditos ou com a cota de uso esgotada. Confira o faturamento e os limites do projeto.')
 if(response.status===429)return new CoachError(429,'O provedor atingiu o limite de requisições. Aguarde e tente novamente.')
 if(response.status===400)return new CoachError(502,'O provedor recusou o formato da solicitação. Confira a compatibilidade do modelo configurado.')
 return new CoachError(502,'O provedor não concluiu a resposta. Tente novamente em instantes.')
}
