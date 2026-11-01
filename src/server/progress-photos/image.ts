import 'server-only'
import sharp from 'sharp'
export class InvalidPhoto extends Error{constructor(){super('Envie uma imagem JPEG, PNG ou WebP estática válida, de até 5 MiB, 6000 pixels por lado e 24 megapixels.')}}
export async function normalizePhoto(data:string){try{
 const bytes=Buffer.from(data,'base64');if(!bytes.length||bytes.length>5*1024*1024||bytes.toString('base64')!==data)throw Error()
 const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!png&&!jpeg&&!webp)throw Error()
 if(png){for(let offset=8;offset+12<=bytes.length;){const n=bytes.readUInt32BE(offset);if(offset+n+12>bytes.length||bytes.toString('ascii',offset+4,offset+8)==='acTL')throw Error();offset+=n+12}}
 const image=sharp(bytes,{failOn:'warning',limitInputPixels:24000000}),m=await image.metadata();if(!['png','jpeg','webp'].includes(m.format??'')||(m.pages??1)>1||!m.width||!m.height||m.width>6000||m.height>6000||m.width*m.height>24000000)throw Error()
 const {data:clean,info}=await image.rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:88}).toBuffer({resolveWithObject:true});if(clean.length>3145728)throw Error();return {bytes:clean,width:info.width,height:info.height}
 }catch{throw new InvalidPhoto()}}
