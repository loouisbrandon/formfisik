import {muscles} from '../exercises/taxonomy'
import {z} from '@/lib/validation'
export const text=(max:number)=>z.string().trim().normalize('NFC').max(max).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')
/** Parse only known HTTPS URL shapes. Never fetch a supplied URL. */
export function youtubeId(input:string){try{if(input.length>2048||/[<>\s\\]/.test(input))return null;const u=new URL(input);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;const h=u.hostname.toLowerCase(),p=u.pathname.split('/').filter(Boolean);let id:string|null=null;if(h==='youtu.be'&&p.length===1)id=p[0];else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com'].includes(h)){if(u.pathname==='/watch'&&u.searchParams.getAll('v').length===1)id=u.searchParams.get('v');else if(p.length===2&&['embed','shorts','live'].includes(p[0]))id=p[1]}else if(['youtube-nocookie.com','www.youtube-nocookie.com'].includes(h)&&p.length===2&&p[0]==='embed')id=p[1];return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null}catch{return null}}
export const demoReference=z.object({videoId:z.uuid(),revision:z.int().positive()}).strict()
export type DemoReference=z.infer<typeof demoReference>
const base={operationKey:z.uuid(),confirmed:z.literal(true)}
const metadata={title:text(160),description:text(2000),rightsReference:text(500).min(5),rightsConfirmed:z.literal(true),peopleAuthorized:z.literal(true)}
export const mediaCommand=z.discriminatedUnion('action',[
 z.object({...base,action:z.literal('youtube'),...metadata,url:text(2048).refine(v=>!!youtubeId(v),'Informe uma URL HTTPS válida do YouTube.'),id:z.uuid().optional(),version:z.int().positive().optional()}).strict(),
 z.object({...base,action:z.literal('upload'),...metadata,exerciseId:z.uuid(),bytes:z.int().min(1).max(200000000),mime:z.enum(['video/mp4','video/quicktime']),seconds:z.int().min(1).max(120),id:z.uuid().optional(),version:z.int().positive().optional()}).strict(),
 z.object({...base,action:z.literal('metadata'),id:z.uuid(),version:z.int().positive(),...metadata}).strict(),
 z.object({...base,action:z.literal('state'),id:z.uuid(),version:z.int().positive(),state:z.enum(['active','archived','revoked']),reason:text(500).min(5)}).strict(),
 z.object({...base,action:z.literal('associate'),exerciseId:z.uuid(),version:z.int().min(0),scope:z.enum(['private','official']),videos:z.array(demoReference).max(10).refine(v=>new Set(v.map(x=>x.videoId)).size===v.length,'Demonstração repetida.')}).strict(),
 z.object({...base,action:z.literal('review_reject'),id:z.uuid(),version:z.int().positive(),reason:text(500).min(10)}).strict(),
 z.object({...base,action:z.literal('submit'),id:z.uuid(),version:z.int().positive()}).strict(),
 z.object({...base,action:z.literal('publish'),id:z.uuid(),version:z.int().positive(),reason:text(500).min(10),technicalReviewed:z.literal(true),rightsReviewed:z.literal(true)}).strict(),
 z.object({...base,action:z.literal('reconcile'),id:z.uuid()}).strict(),
])
export type MediaCommand=z.infer<typeof mediaCommand>
export const mediaQuery=z.object({view:z.enum(['library','associations','detail','history','quota','playback','capability','review']).default('library'),id:z.uuid().optional(),exerciseId:z.uuid().optional(),revision:z.coerce.number().int().positive().optional(),page:z.coerce.number().int().min(1).max(100000).default(1),q:text(160).default(''),scope:z.enum(['all','official','mine']).default('all'),source:z.enum(['all','youtube','stream']).default('all'),state:z.enum(['all','active','archived','revoked']).default('active'),muscle:z.enum(muscles).optional(),sort:z.enum(['name_asc','newest','oldest']).default('name_asc')}).strict()
export type MediaQuery=z.infer<typeof mediaQuery>
export type VideoSummary={id:string;version:number;title:string;description?:string;source:'youtube'|'stream';scope:'private'|'official';state:'active'|'archived'|'revoked';processing:string;seconds:number|null;own:boolean;exercises?:{id:string;name:string}[]}
export type Associations={private:{version:number;videos:DemoReference[]};official:{version:number;videos:DemoReference[]};items:VideoSummary[]}
export type Playback={source:'youtube'|'stream';url:string;externalUrl?:string;expiresAt?:string;title:string}
