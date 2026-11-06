import {studentFields} from '../students/schema'
import {exerciseFields} from '../exercises/schema'
import {templateFields,type ImportKind,type PreviewCommand,type ImportInput} from './schema'
import {z} from '@/lib/validation'
export class ImportFileError extends Error{constructor(public code:string){super('Arquivo inválido: '+code)}}
export function parseCSV(text:string,delimiter:','|';'){
 if(new TextEncoder().encode(text).length>1048576)throw new ImportFileError('limite de 1 MiB')
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\uFFFD]/u.test(text)||/[\uD800-\uDFFF]/u.test(text))throw new ImportFileError('codificação ou controle')
 text=text.replace(/^\uFEFF/,'');const all:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false,started=false
 const pushCell=()=>{if(cell.length>4000)throw new ImportFileError('célula acima de 4000 caracteres');row.push(cell);if(row.length>20)throw new ImportFileError('até 20 colunas');cell='';closed=false;started=false}
 const pushRow=()=>{pushCell();if(!(row.length===1&&row[0]===''))all.push(row);row=[];if(all.length>501)throw new ImportFileError('até 500 registros')}
 for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=ch}else if(ch==='"'){if(started||cell||closed)throw new ImportFileError('aspas fora de posição');quoted=true;started=true}else if(ch===delimiter)pushCell();else if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;pushRow()}else{if(closed)throw new ImportFileError('texto após aspas');cell+=ch;started=true}if(cell.length>4000)throw new ImportFileError('célula acima de 4000 caracteres')}
 if(quoted)throw new ImportFileError('aspas não fechadas');if(cell||row.length||started||closed)pushRow()
 if(all.length<2)throw new ImportFileError('cabeçalho e ao menos um registro obrigatórios');const headers=all.shift()!.map(s=>s.trim().normalize('NFC'));if(headers.some(s=>!s||s.length>80||/[\r\n]/.test(s))||new Set(headers.map(s=>s.toLowerCase())).size!==headers.length)throw new ImportFileError('cabeçalhos inválidos ou repetidos');if(all.some(r=>r.length!==headers.length))throw new ImportFileError('quantidade de colunas inconsistente');return {headers,rows:all}
}
export function parseFile(p:PreviewCommand):{input:ImportInput|null;error:string|null}[]{
 if(new TextEncoder().encode(p.text).length>1048576)throw new ImportFileError('limite de 1 MiB')
 if(p.kind==='templates'){let raw:unknown;try{raw=JSON.parse(p.text)}catch{throw new ImportFileError('JSON malformado')}const envelope=z.object({format:z.literal('formfisik.templates.v1'),templates:z.array(z.unknown()).min(1).max(20)}).strict().safeParse(raw);if(!envelope.success)throw new ImportFileError('formato formfisik.templates.v1, até 20 modelos');return envelope.data.templates.map(v=>{const r=templateFields.safeParse(v);return r.success?{input:r.data,error:null}:{input:null,error:'invalid_fields'}})}
 const file=parseCSV(p.text,p.delimiter);if(Object.values(p.mapping).some(i=>i>=file.headers.length))throw new ImportFileError('coluna não encontrada')
 return file.rows.map(row=>{const mapped=Object.fromEntries(Object.entries(p.mapping).map(([key,index])=>[key,row[index].trim()]));if(Object.entries(mapped).some(([key,value])=>/^[=+@-]/.test(value)&&!(key==='phone'&&/^\+?[\d\s().-]+$/.test(value))))return {input:null,error:'unsafe_cell'}
 const list=(k:string)=>(mapped[k]??'').split('|').map(s=>s.trim()).filter(Boolean)
 const raw=p.kind==='students'?{fullName:mapped.fullName,email:mapped.email??'',phone:mapped.phone??'',birthDate:mapped.birthDate??'',adminNotes:mapped.adminNotes??''}:{name:mapped.name,category:mapped.category,primaryMuscles:list('primaryMuscles'),secondaryMuscles:list('secondaryMuscles'),equipment:mapped.equipment||null,level:mapped.level||null,instructions:list('instructions'),aliases:list('aliases')}
 const r=(p.kind==='students'?studentFields:exerciseFields).safeParse(raw);return r.success?{input:r.data,error:null}:{input:null,error:'invalid_fields'}
 })
}
export const identifying=(kind:ImportKind,input:ImportInput)=>{if(kind==='students'){const f=input as ReturnType<typeof studentFields.parse>;return {name:f.fullName.toLowerCase(),email:f.email,phone:f.phone}}return {name:(input as {name:string}).name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim().replace(/\s+/g,' '),email:'',phone:''}}
/** No user-supplied names or values enter the downloadable operational report. */
export function safeCSV(cells:(string|number)[][]){return '\uFEFF'+cells.map(row=>row.map(v=>{let s=String(v);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}).join(';')).join('\r\n')+'\r\n'}
