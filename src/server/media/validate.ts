import 'server-only'
import sharp from 'sharp'
export class PrivateFileError extends Error{constructor(public status:number,message:string){super(message)}}
export async function validatePrivateFile(bytes:Buffer,kind:'cover'|'pdf',maxPdfPages=500){
 if(kind==='cover'){if(!(bytes[0]===255&&bytes[1]===216||bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'))throw new PrivateFileError(400,'Formato de imagem não permitido.');if(bytes.length>2097152)throw new PrivateFileError(413,'Use uma imagem de até 2 MB.');try{const image=sharp(bytes,{limitInputPixels:16000000,animated:false}),meta=await image.metadata();if(!['jpeg','png','webp'].includes(meta.format??'')||(meta.pages??1)>1)throw Error();const clean=await image.rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();if(clean.length>1048576)throw Error();return clean}catch{throw new PrivateFileError(400,'Selecione uma imagem JPG, PNG ou WebP válida.')}}
 return (await inspectPrivatePdf(bytes,maxPdfPages)).bytes
}
export async function inspectPrivatePdf(bytes:Buffer,maxPdfPages=500,extractText=false){
 if(bytes.length>8388608)throw new PrivateFileError(413,'Use um PDF de até 8 MB.')
 if(!bytes.subarray(0,8).toString('ascii').startsWith('%PDF-')||!bytes.subarray(-1024).includes(Buffer.from('%%EOF')))throw new PrivateFileError(400,'O arquivo não é um PDF válido.')
 const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs')
 const task=getDocument({data:new Uint8Array(bytes),verbosity:0,useSystemFonts:false,stopAtErrors:true})
 let timer:ReturnType<typeof setTimeout>|undefined
 try{
  return await Promise.race([(async()=>{
   const pdf=await task.promise
   if(pdf.numPages<1||pdf.numPages>maxPdfPages||(await pdf.getJSActions())||Object.keys(await pdf.getAttachments()??{}).length)throw Error()
   let text=''
   if(extractText){for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),content=await page.getTextContent();text+=content.items.map(item=>'str' in item?item.str:'').join(' ')+'\n';if(text.length>20000)throw Error();page.cleanup()}}
   return {bytes,text:text.trim()}
  })(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('PDF_TIMEOUT')),10000)})])
 }catch{throw new PrivateFileError(400,`PDF inválido, protegido, com scripts/anexos, acima de ${maxPdfPages} páginas ou texto excessivo.`)}
 finally{clearTimeout(timer);await task.destroy()}
}
