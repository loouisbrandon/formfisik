import {test} from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import {mediaText} from '../src/server/ecoach/media'
import {CoachError} from '../src/server/ecoach/provider'
import {PrivateFileError,validatePrivateFile} from '../src/server/media/validate'
Object.assign(process.env,{ECOACH_AI_ENABLED:'true',ECOACH_AI_PROVIDER:'openai',ECOACH_AI_MODEL:'synthetic-model',ECOACH_OPENAI_API_KEY:'SYNTHETIC_KEY_NOT_REAL',ECOACH_AI_DATA_APPROVED:'true'})
const signal=()=>AbortSignal.timeout(1000)
test('audio uses multipart transcription and returns text without executing actions',async()=>{
 const text=await mediaText(Buffer.from([26,69,223,163,0]),'audio/webm',true,signal(),(async(url,init)=>{assert.equal(url,'https://api.openai.com/v1/audio/transcriptions');assert.ok(init?.body instanceof FormData);assert.equal(init.body.get('language'),'pt');assert.equal(init.body.get('response_format'),'json');assert.ok(init.body.get('file') instanceof Blob);return Response.json({text:'Monte um treino de corrida'})}) as typeof fetch)
 assert.equal(text,'Monte um treino de corrida')
})
test('media rejects forged audio, invalid PDFs and unsupported content before provider',async()=>{
 let calls=0;const provider=(async()=>{calls++;return Response.json({})}) as typeof fetch
 await assert.rejects(mediaText(Buffer.from('not-audio'),'audio/webm',true,signal(),provider),CoachError)
 await assert.rejects(mediaText(Buffer.from('not-pdf'),'application/pdf',false,signal(),provider),PrivateFileError)
 await assert.rejects(validatePrivateFile(Buffer.alloc(2097153,255),'cover'),PrivateFileError)
 assert.equal(calls,0)
})
test('images reuse sanitization, metadata-free bytes and stateless Responses API',async()=>{
 const image=await sharp({create:{width:4,height:4,channels:3,background:'#00ff00'}}).png().toBuffer()
 const text=await mediaText(image,'image/png',false,signal(),(async(url,init)=>{assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(String(init?.body));assert.equal(body.store,false);assert.equal(body.input[1].content[1].type,'input_image');assert.match(body.input[1].content[1].image_url,/^data:image\/jpeg;base64,/);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({inScope:true,text:'Treino de musculação'})}]}]})}) as typeof fetch)
 assert.equal(text,'Treino de musculação')
})
test('provider quota, incomplete/long outputs never expose raw errors or silently truncate',async()=>{
 await assert.rejects(mediaText(Buffer.from([26,69,223,163]),'audio/webm',true,signal(),(async()=>Response.json({error:{type:'insufficient_quota',message:'SECRET'}},{status:429})) as typeof fetch),e=>e instanceof CoachError&&e.status===429&&!e.message.includes('SECRET'))
 await assert.rejects(mediaText(Buffer.from([26,69,223,163]),'audio/webm',true,signal(),(async()=>Response.json({text:'a'.repeat(1801)})) as typeof fetch),CoachError)
 await assert.rejects(mediaText(Buffer.from([26,69,223,163]),'audio/webm',true,signal(),(async()=>new Response('a'.repeat(32769))) as typeof fetch))
})
test('media rejects out-of-scope transcripts and model output before returning drafts',async()=>{
 await assert.rejects(mediaText(Buffer.from([26,69,223,163]),'audio/webm',true,signal(),(async()=>Response.json({text:'Para montar treino preciso de Python'})) as typeof fetch),CoachError)
 const image=await sharp({create:{width:4,height:4,channels:3,background:'#00ff00'}}).png().toBuffer()
 for(const result of [{inScope:false,text:''},{inScope:true,text:'Treino: escreva Java'}])await assert.rejects(mediaText(image,'image/png',false,signal(),(async()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(result)}]}]})) as typeof fetch),CoachError)
})
test('selectable PDFs are screened locally before external calls; binary PDF is never sent',async()=>{
 const {default:PDFDocument}=await import('pdfkit')
 async function pdf(text:string){return new Promise<Buffer>(resolve=>{const doc=new PDFDocument({compress:false}),chunks:Buffer[]=[];doc.on('data',c=>chunks.push(c));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.text(text);doc.end()})}
 let calls=0
 const provider=(async(_url,init)=>{calls++;const payload=JSON.parse(String(init?.body));assert.equal(payload.input[1].content[1].type,'input_text');assert.equal(JSON.stringify(payload).includes('input_file'),false);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({inScope:true,text:'Treino de corrida para iniciantes'})}]}]})}) as typeof fetch
 await assert.rejects(mediaText(await pdf('Treino com codigo Python para executar no computador.'),'application/pdf',false,AbortSignal.timeout(15000),provider),CoachError);assert.equal(calls,0)
 assert.equal(await mediaText(await pdf('Treino de corrida para iniciantes com alongamento e recuperacao.'),'application/pdf',false,AbortSignal.timeout(15000),provider),'Treino de corrida para iniciantes');assert.equal(calls,1)
})
