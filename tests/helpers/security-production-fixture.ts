import {saveService,savePlan} from '../../src/server/consultancies/catalog'
import {saveContract} from '../../src/server/consultancies/contracts'
// Disposable PostgreSQL fixture only; application runtime never imports this module.
import {hash,argon2id} from 'argon2'
import {configureReportTests,reportFixture} from './physical-report-fixture'
import {migrate} from '../../scripts/migrate'
import {db} from '../../src/server/db'
import {randomUUID} from 'node:crypto'
import {createExercise} from '../../src/server/exercises/repository'
import {createPlan,editPlan,changePlanState} from '../../src/server/workouts/repository'
import {emptyWorkout} from '../../src/modules/workouts/schema'
async function main(){
 const connection=configureReportTests('https://localhost:3443');await migrate(connection)
 const f=await reportFixture(),password='Synthetic security phrase 015!'
 for(const id of [f.owner,f.other])await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[id,await hash(password,{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})])
 const exercise=await createExercise(f.owner,{creationKey:randomUUID(),name:'Exercício sintético 015',category:'forca',primaryMuscles:['peito'],secondaryMuscles:[],equipment:null,level:null,instructions:['Instrução particular sintética carregada somente no detalhe.'],aliases:[]})
 const plan=await createPlan(f.owner,{...emptyWorkout('individual',f.student.id),name:'Ficha sintética 015'},randomUUID())
 if(process.env.TEST_CHECKIN_FLOW==='1'){const fields={...emptyWorkout('individual',f.student.id),name:'Ficha sintética 015',objective:'Objetivo sintético do feedback022',divisions:[{id:randomUUID(),name:'Treino A',description:'',notes:'',groups:[],exercises:[{id:randomUUID(),exerciseId:exercise.id,exerciseVersion:1,technique:'standard' as const,notes:'',sets:[{id:randomUUID(),repetition:{mode:'reps' as const,value:10,perSide:false},load:null,unit:'kg' as const,restSeconds:null,executionSeconds:null,phase:'work' as const,notes:''}]}]}]};await editPlan(f.owner,plan.id,1,fields);await changePlanState(f.owner,plan.id,2,'active')}
 let foreignContract:string|undefined
 if(process.env.TEST_CONSULTANCIES_FLOW==='1'){const service=await saveService(f.other,{operationKey:randomUUID(),fields:{name:'Foreign commercial service',description:'',category:'custom',channel:'online',commercialNotes:''}}),plan=await savePlan(f.other,{operationKey:randomUUID(),fields:{serviceId:service.id,name:'Foreign confidential plan',description:'',priceCents:10000,duration:1,unit:'months',sessions:null,conditions:'',available:true,billingIntent:'unspecified',deliveries:[]}}),contract=await saveContract(f.other,{operationKey:randomUUID(),fields:{studentId:f.foreign.id,planId:plan.id,planVersion:1,start:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date()),agreedPriceCents:10000,sessions:null,administrativeNotes:'FOREIGN_COMMERCIAL'},allowOverlap:false,confirmed:true});foreignContract=contract.id}
 process.send?.({owner:f.owner,other:f.other,student:f.student.id,foreign:f.foreign.id,foreignContract,exercise:exercise.id,workout:plan.id,password,subscriptions:[...f.provider.subscriptions.values(),...f.otherProvider.subscriptions.values()],price:f.provider.fixturePrice,portal:f.provider.portalConfig})
 await db().end()
}
main().catch(()=>{console.error('security_fixture_failed');process.exitCode=1})
