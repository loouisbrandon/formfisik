import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {configureAgendaTests,agendaFixture,appointment,today,reserve,migrate,db} from './helpers/agenda-fixture'
import {addDays} from '../src/modules/agenda/time'
import {emptyAppointment} from '../src/modules/agenda/schema'
import {formSchema} from '../src/modules/intake/schema'
import {proposalAction,type ProposalAction} from '../src/modules/ecoach/ai-schema'
import {getForm} from '../src/server/intake/repository'
import {readTool,validateProposalRead} from '../src/server/ecoach/tools'
import {proposalsHandler} from '../src/server/ecoach/proposals'
import {consentFingerprint} from '../src/server/ecoach/provider'
import {createSession,cookieName} from '../src/server/sessions'
import {executeAgenda,agendaSettings} from '../src/server/agenda/repository'
import {aiTurn} from '../src/server/ecoach/engine'
const origin='http://localhost:3000',connection=configureAgendaTests(origin)
Object.assign(process.env,{ECOACH_AI_ENABLED:'true',ECOACH_AI_PROVIDER:'openai',ECOACH_AI_MODEL:'synthetic-model',ECOACH_OPENAI_API_KEY:'SYNTHETIC_NOT_REAL',ECOACH_AI_DATA_APPROVED:'true'})
after(async()=>{await db().end()})
test('internal management reuses intake drafts and canonical agenda with isolation, revisions, preview and atomic confirmation',async()=>{
 await migrate(connection);const f=await agendaFixture(),foreign=await createSession(f.other)
 await db().query('INSERT INTO professional_settings(user_id,preferences) VALUES($1,$2)',[f.owner,{ecoach:'manage',ecoachExternalConsent:consentFingerprint()}])
 const conversation=randomUUID();await db().query("INSERT INTO ecoach_conversations(id,owner_id,title) VALUES($1,$2,'Internal test')",[conversation,f.owner])
 const save=async(action:ProposalAction)=>{const prepared=await validateProposalRead(f.owner,proposalAction.parse(action)),id=randomUUID();await db().query('INSERT INTO ecoach_proposals(id,owner_id,conversation_id,operation_id,action) VALUES($1,$2,$3,$4,$5)',[id,f.owner,conversation,randomUUID(),prepared]);return id}
 const apply=(id:string,session=f.session,confirmed=true)=>proposalsHandler(new Request(origin+'/api/ecoach/proposals',{method:'POST',headers:{origin,cookie:cookieName()+'='+session.token,'Content-Type':'application/json'},body:JSON.stringify({id,action:'apply',confirmed})}))
 const definition=formSchema.parse({title:'Anamnese sintética',description:'Sem respostas clínicas',sections:[{id:randomUUID(),title:'Objetivos',questions:[{id:randomUUID(),title:'Qual seu objetivo?',description:'',type:'short',required:true,options:[],min:null,max:null,condition:null}]}]})
 const formProposal=await save({kind:'create_intake',definition})
 assert.equal((await db().query('SELECT 1 FROM intake_forms WHERE professional_id=$1',[f.owner])).rowCount,0)
 assert.equal((await apply(formProposal,foreign)).status,403);assert.equal((await apply(formProposal,f.session,false)).status,400)
 const created=await apply(formProposal);assert.equal(created.status,200);const formId=(await created.json()).resultId;for(const response of await Promise.all([apply(formProposal),apply(formProposal)]))assert.equal(response.status,200)
 assert.equal((await db().query('SELECT 1 FROM intake_versions WHERE professional_id=$1',[f.owner])).rowCount,0)
 assert.equal((await db().query('SELECT 1 FROM intake_requests WHERE professional_id=$1',[f.owner])).rowCount,0)
 const edited=await save({kind:'edit_intake',id:formId,revision:1,definition:{...definition,title:'Anamnese revisada'}});assert.equal((await apply(edited)).status,200);assert.equal((await getForm(f.owner,formId)).revision,2)
 await assert.rejects(validateProposalRead(f.other,{kind:'edit_intake',id:formId,revision:2,definition}),/indisponível/)
 await assert.rejects(validateProposalRead(f.owner,{kind:'edit_intake',id:formId,revision:1,definition}),/mudou/)
 const formRead=await readTool(f.owner,{kind:'query',name:'intake_form',args:{id:formId}});assert.equal('answers' in (formRead.data as object),false)
 const fields={...emptyAppointment(),kind:'personal' as const,title:'Compromisso pessoal sintético',date:addDays(today(),3),time:'09:00'}
 const personal=await save({kind:'create_appointment',fields,previewDigest:'a'.repeat(64)}) // forged digest is replaced by server
 assert.equal((await db().query('SELECT 1 FROM agenda_occurrences WHERE professional_id=$1',[f.owner])).rowCount,0)
 const booked=await apply(personal);assert.equal(booked.status,200);const occurrence=(await booked.json()).resultId;assert.equal((await apply(personal)).status,200)
 const remap=await save({kind:'edit_appointment',id:occurrence,version:1,reason:'Horário solicitado pelo personal',fields:{...fields,time:'11:00'}});assert.equal((await apply(remap)).status,200)
 const detail=await readTool(f.owner,{kind:'query',name:'appointment',args:{id:occurrence}});assert.equal((detail.data as {version:number}).version,2)
 await assert.rejects(readTool(f.other,{kind:'query',name:'appointment',args:{id:occurrence}}))
 const blockFields={...emptyAppointment(),kind:'block' as const,title:'Indisponibilidade sintética',date:addDays(today(),4),time:'08:00',endDate:addDays(today(),4),endTime:'18:00'}
 const blocked=await save({kind:'create_appointment',fields:blockFields});assert.equal((await apply(blocked)).status,200)
 await assert.rejects(validateProposalRead(f.owner,{kind:'create_appointment',fields:appointment(f,{date:blockFields.date,time:'10:00'})}),/conflito/)
 const sessionFields=appointment(f,{date:addDays(today(),5),duration:5}),sessionProposal=await save({kind:'create_appointment',fields:sessionFields});assert.equal((await apply(sessionProposal)).status,200)
 const stored=(await db().query("SELECT extract(epoch FROM ends_at-starts_at)::int AS duration FROM agenda_occurrences WHERE professional_id=$1 AND kind='session'",[f.owner])).rows[0];assert.equal(stored.duration,3600)
 const stale=await save({kind:'create_appointment',fields:{...fields,date:addDays(today(),6)}}),cfg=await agendaSettings(f.owner)
 await executeAgenda(f.owner,{action:'availability_save',operationKey:randomUUID(),version:cfg.version,fields:{timezone:cfg.timezone,weekly:cfg.weekly},confirmed:true});assert.equal((await apply(stale)).status,409)
 assert.equal((await db().query("SELECT 1 FROM ecoach_proposals WHERE id=$1 AND state='pending'",[stale])).rowCount,1)
 const raceFields={...fields,date:addDays(today(),7)},race=await save({kind:'create_appointment',fields:raceFields});await reserve(f.owner,raceFields);assert.equal((await apply(race)).status,409)
 const q=await readTool(f.owner,{kind:'query',name:'agenda',args:{from:today(),to:addDays(today(),8)}});assert.ok((q.data as {items:unknown[]}).items.length>=4)
 await assert.rejects(validateProposalRead(f.owner,{kind:'create_appointment',fields:{...fields,date:addDays(today(),-1)}}),/futuros/)
 await assert.rejects(validateProposalRead(f.owner,{kind:'create_appointment',fields:appointment(f,{date:addDays(today(),9),studentId:f.foreign.id})}))
 const nextProposal=await save({kind:'create_intake',definition})
 await db().query("UPDATE professional_settings SET preferences=jsonb_set(preferences,'{ecoach}','\"read\"') WHERE user_id=$1",[f.owner]);assert.equal((await apply(nextProposal)).status,403)
 await db().query("UPDATE professional_settings SET preferences=jsonb_set(preferences,'{ecoach}','\"manage\"') WHERE user_id=$1",[f.owner])
 let rounds=0;const turn=await aiTurn(f.owner,f.session.token,{action:'turn',id:randomUUID(),version:0,operationId:randomUUID(),text:'Crie uma anamnese com objetivo',context:{module:'Anamneses'}},undefined,{async complete(){rounds++;return {decision:rounds===1?{kind:'query',name:'intake_forms',args:{}}:{kind:'proposal',text:'Revise a anamnese',action:{kind:'create_intake',definition}},inputTokens:5,outputTokens:10}}});assert.equal(turn.action?.kind,'create_intake');assert.equal(rounds,2)
 let attempts=0;await assert.rejects(aiTurn(f.owner,f.session.token,{action:'turn',id:randomUUID(),version:0,operationId:randomUUID(),text:'Consulte minha agenda',context:null},undefined,{async complete(){attempts++;return {decision:{kind:'query',name:'agenda_settings',args:{}},inputTokens:1,outputTokens:1}}}),/mais etapas/);assert.equal(attempts,6)
})
