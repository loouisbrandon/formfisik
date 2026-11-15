import {randomUUID} from 'node:crypto'
import {configureAgendaTests,agendaFixture,db,migrate} from './agenda-fixture'
import {createExercise} from '../../src/server/exercises/repository'
import {exerciseFields} from '../../src/modules/exercises/schema'
import {mediaCommand,type MediaCommand} from '../../src/modules/media/schema'
import {executeMedia} from '../../src/server/media/repository'
import {ControlledVideo} from './controlled-media'
export {db,migrate,configureAgendaTests}
export async function mediaFixture(){const base=await agendaFixture(),videoProvider=new ControlledVideo();const exercise=await createExercise(base.owner,{...exerciseFields.parse({name:'Supino sintético mídia',category:'forca',primaryMuscles:['peito'],instructions:['Instrução sintética de homologação local.']}),creationKey:randomUUID()});return {...base,exercise,videoProvider}}
export const youtube=(extra:object={})=>mediaCommand.parse({action:'youtube',operationKey:randomUUID(),confirmed:true,title:'Demonstração sintética',description:'Orientação de execução sintética',url:'https://youtu.be/abcdefghijk',rightsReference:'Licença sintética somente teste',rightsConfirmed:true,peopleAuthorized:true,...extra}) as Extract<MediaCommand,{action:'youtube'}>
export const upload=(extra:object={})=>mediaCommand.parse({action:'upload',operationKey:randomUUID(),confirmed:true,title:'Upload sintético',description:'',bytes:1024,mime:'video/mp4',seconds:60,rightsReference:'Direitos sintéticos de teste',rightsConfirmed:true,peopleAuthorized:true,...extra}) as Extract<MediaCommand,{action:'upload'}>
export async function addYoutube(f:Awaited<ReturnType<typeof mediaFixture>>,extra:object={}){return executeMedia(f.owner,youtube(extra),f.videoProvider) as Promise<{id:string;version:number}>}
