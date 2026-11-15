'use client'
import {useEffect,useRef,useState} from 'react'
import {AudioLines,FileText,ImageIcon,LoaderCircle,Paperclip,Pause,X} from 'lucide-react'
import styles from './chat.module.css'
import {useCoachConversation} from './conversation'

type Props={disabled:boolean;epoch:{current:number};authorize:()=>Promise<boolean>;onText:(text:string,send:boolean)=>void;onNotice:(text:string)=>void}
export function useCoachMedia({disabled,epoch,authorize,onText,onNotice}:Props){
 const {addAttachment,finishAttachment,setAttachmentsOpen}=useCoachConversation()
 const [menu,setMenu]=useState(false),[recording,setRecording]=useState(false),[processing,setProcessing]=useState(false),[seconds,setSeconds]=useState(0)
 const picker=useRef<HTMLInputElement>(null),menuRef=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),context=useRef<AudioContext|null>(null),frame=useRef(0),timer=useRef<ReturnType<typeof setInterval>|null>(null),controller=useRef<AbortController|null>(null),mounted=useRef(true),locked=useRef(false),elapsed=useRef(0)
 function release(){stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void context.current?.close().catch(()=>{});context.current=null;cancelAnimationFrame(frame.current);if(timer.current)clearInterval(timer.current);timer.current=null}
 function cancel(){controller.current?.abort();if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop();recorder.current=null}release();locked.current=false;setRecording(false);setProcessing(false);onNotice('Gravação ou leitura cancelada.')}
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort();if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop()}stream.current?.getTracks().forEach(t=>t.stop());void context.current?.close().catch(()=>{});cancelAnimationFrame(frame.current);if(timer.current)clearInterval(timer.current)}},[])
 useEffect(()=>{if(!menu)return;function outside(e:PointerEvent){if(e.target instanceof Node&&!menuRef.current?.contains(e.target))setMenu(false)}function escape(e:KeyboardEvent){if(e.key==='Escape'){setMenu(false);menuRef.current?.querySelector('button')?.focus()}}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[menu])
 async function read(blob:Blob,send=false){
  setProcessing(true);const startedEpoch=epoch.current,abort=new AbortController();controller.current=abort
  try{const response=await fetch('/api/ecoach/media',{method:'POST',headers:{'Content-Type':blob.type.split(';')[0]},body:blob,signal:abort.signal});const data=await response.json();if(!response.ok)throw Error(data.message??'Não foi possível ler o arquivo.');if(mounted.current&&!abort.signal.aborted&&epoch.current===startedEpoch){onText(data.text,send);onNotice(send?'':'Conteúdo no rascunho. Revise antes de enviar.');return true}}catch(e){if(mounted.current&&!abort.signal.aborted)onNotice(e instanceof Error?e.message:'Não foi possível ler.')}finally{if(controller.current===abort){controller.current=null;locked.current=false;if(mounted.current)setProcessing(false)}}
  return false
 }
 async function attach(files:FileList|File[]){
  if(disabled||locked.current)return
  if(files.length!==1){onNotice('Adicione um arquivo por vez.');return}
  const file=files[0];if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)){onNotice('Use uma imagem JPG, PNG, WebP ou documento PDF.');return}
  if(file.size>(file.type==='application/pdf'?8388608:2097152)){onNotice('Limite: imagem de 2 MB ou PDF de 8 MB.');return}
  locked.current=true
  try{if(!await authorize()){locked.current=false;return}const item=addAttachment(file);const success=await read(file);finishAttachment(item,success)}catch(e){locked.current=false;onNotice(e instanceof Error?e.message:'Não foi possível autorizar a leitura.')}
 }
 function finish(send=false){const r=recorder.current;if(!r||r.state==='inactive')return;r.onstop=()=>{const chunks=(r as MediaRecorder&{chunks:Blob[]}).chunks;recorder.current=null;release();setRecording(false);void read(new Blob(chunks,{type:r.mimeType}),send)};r.stop()}
 async function start(){
  if(disabled||locked.current)return;locked.current=true
  try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Error('Seu navegador não permite gravação. Use HTTPS ou localhost e um navegador atualizado.')
   if(!await authorize()){locked.current=false;return}
   const tracks=await navigator.mediaDevices.getUserMedia({audio:true});if(!mounted.current){tracks.getTracks().forEach(t=>t.stop());return}stream.current=tracks
   const mime=['audio/webm;codecs=opus','audio/mp4'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('Formato de gravação não suportado neste navegador.')
   const r=new MediaRecorder(tracks,{mimeType:mime,audioBitsPerSecond:64000}) as MediaRecorder&{chunks:Blob[]};r.chunks=[];let size=0;r.ondataavailable=e=>{size+=e.data.size;if(size>4194304){cancel();onNotice('Gravação ultrapassou 4 MB. Grave uma mensagem mais curta.');return}if(e.data.size)r.chunks.push(e.data)};r.onerror=()=>{cancel();onNotice('Não foi possível gravar o áudio. Tente novamente.')};recorder.current=r;r.start(250);elapsed.current=0;setSeconds(0);setRecording(true);onNotice('Gravando · pause para transcrever e revisar, ou envie quando terminar.');timer.current=setInterval(()=>{elapsed.current++;setSeconds(elapsed.current);if(elapsed.current>=120)finish(false)},1000)
  }catch(e){release();locked.current=false;onNotice(e instanceof DOMException&&e.name==='NotAllowedError'?'Permita o microfone no navegador para gravar.':e instanceof Error?e.message:'Não foi possível acessar o microfone.')}
 }
 useEffect(()=>{if(!recording||!stream.current)return;const audio=new AudioContext();context.current=audio;const source=audio.createMediaStreamSource(stream.current),analyser=audio.createAnalyser();analyser.fftSize=256;source.connect(analyser);const values=new Uint8Array(analyser.frequencyBinCount);function draw(){const el=canvas.current,ctx=el?.getContext('2d');if(el&&ctx){analyser.getByteFrequencyData(values);ctx.clearRect(0,0,el.width,el.height);ctx.fillStyle=getComputedStyle(el).color;for(let i=0;i<48;i++){const h=Math.max(3,values[i*2]/255*44);ctx.beginPath();ctx.roundRect(i*6,24-h/2,3,h,2);ctx.fill()}}frame.current=requestAnimationFrame(draw)}draw();return()=>{cancelAnimationFrame(frame.current);void audio.close().catch(()=>{});if(context.current===audio)context.current=null}},[recording])
 const controls=<><div className={styles.attachmentMenu} ref={menuRef}><button type="button" disabled={recording} aria-label="Adicionar anexo" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Paperclip size={19}/></button>{menu&&<div className={styles.attachmentPanel} aria-label="Tipos de anexo"><strong>Adicionar ao rascunho</strong>{[{label:'Imagem',accept:'image/jpeg,image/png,image/webp',icon:ImageIcon},{label:'PDF com texto',accept:'application/pdf',icon:FileText}].map(item=><button type="button" disabled={disabled||processing} key={item.label} onClick={()=>{if(picker.current){picker.current.accept=item.accept;picker.current.click()}setMenu(false)}}><item.icon size={18}/>{item.label}</button>)}<button type="button" className={styles.viewAttachments} onClick={()=>{setAttachmentsOpen(true);setMenu(false)}}><Paperclip size={18}/>Ver anexos do chat</button><small>Esporte, saúde e gestão · PDF com texto selecionável · revise antes de enviar</small></div>}</div><input ref={picker} type="file" hidden onChange={e=>{if(e.target.files)void attach(e.target.files);e.target.value=''}}/>{!recording&&!processing&&<button type="button" disabled={disabled} aria-label="Gravar áudio" onClick={start}><AudioLines size={19}/></button>}{processing&&<><LoaderCircle size={18} className={styles.mediaSpinner}/><button type="button" aria-label="Cancelar leitura" onClick={cancel}><X size={18}/></button></>}</>
 const recorderUI=recording&&<div className={styles.recording} role="group" aria-label="Gravação de áudio"><button type="button" aria-label="Cancelar gravação" onClick={cancel}><X size={20}/></button><canvas ref={canvas} width={288} height={48} aria-hidden/><time>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</time><button type="button" aria-label="Pausar e transcrever sem enviar" title="Transcrever para revisar" onClick={()=>finish(false)}><Pause size={20}/></button></div>
 return {controls,recorderUI,recording,processing,attach,finish,cancel}
}
