import 'server-only'
import sharp from 'sharp'
import {db} from '../db'
import {transaction} from '../exercises/repository'
import {WorkoutError} from '../workouts/repository'
import {emptyPresentation,savePresentation,type Presentation} from '../../modules/workout-documents/schema'
import type {z} from 'zod'
export async function presentation(owner:string):Promise<Presentation&{logo:Buffer|null}>{const r=await db().query('SELECT * FROM professional_presentations WHERE owner_id=$1',[owner]);if(!r.rowCount)return {...emptyPresentation,logo:null};const p=r.rows[0];return {professionalName:p.professional_name,brand:p.brand,registration:p.registration,contact:p.contact,revision:p.revision,hasLogo:!!p.logo,logo:p.logo}}
export async function normalizeLogo(base64:string){
 try{const bytes=Buffer.from(base64,'base64');if(!bytes.length||bytes.length>262144||bytes.toString('base64')!==base64)throw Error();
 const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(!png&&!jpeg)throw Error();
 if(png){for(let offset=8;offset+12<=bytes.length;){const length=bytes.readUInt32BE(offset);if(offset+length+12>bytes.length||bytes.toString('ascii',offset+4,offset+8)==='acTL')throw Error();offset+=length+12}}
 const image=sharp(bytes,{failOn:'warning',limitInputPixels:4000000});const meta=await image.metadata();if(!['png','jpeg'].includes(meta.format??'')||(meta.pages??1)>1||!meta.width||!meta.height||meta.width>2000||meta.height>2000)throw Error();
 const clean=await image.rotate().resize({width:600,height:600,fit:'inside',withoutEnlargement:true}).png().toBuffer();if(clean.length>262144)throw Error();return clean
 }catch{throw new WorkoutError(400,'Envie uma imagem PNG ou JPEG válida, estática, de até 256 KiB e 2000 × 2000 pixels.')}}
export async function updatePresentation(owner:string,b:z.infer<typeof savePresentation>){const logo=b.logo===undefined?undefined:b.logo===null?null:await normalizeLogo(b.logo);await transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,10011))',[owner]);const old=await c.query('SELECT revision FROM professional_presentations WHERE owner_id=$1 FOR UPDATE',[owner]);if((old.rows[0]?.revision??0)!==b.revision)throw new WorkoutError(409,'A apresentação mudou. Recarregue antes de salvar.');await c.query(`INSERT INTO professional_presentations(owner_id,professional_name,brand,registration,contact,logo) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(owner_id) DO UPDATE SET professional_name=$2,brand=$3,registration=$4,contact=$5,logo=CASE WHEN $7 THEN $6 ELSE professional_presentations.logo END,revision=professional_presentations.revision+1,updated_at=now()`,[owner,b.professionalName,b.brand,b.registration,b.contact,logo??null,logo!==undefined])});return presentation(owner)}
