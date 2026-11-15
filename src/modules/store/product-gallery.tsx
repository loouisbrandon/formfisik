'use client'
import Image from 'next/image'
import {useRef,useState} from 'react'
import {ZoomIn,X,ChevronLeft,ChevronRight} from 'lucide-react'
import type {StoreImage} from './content'
import s from './product.module.css'
export function ProductGallery({images}:{images:StoreImage[]}){
 const [selected,setSelected]=useState(0),[zoomed,setZoomed]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null),image=images[selected]
 function close(){dialog.current?.close();setZoomed(false)}
 return <div className={s.gallery}><div className={s.photo}>{image?<button className={s.openPhoto} onClick={()=>dialog.current?.showModal()} aria-label="Ampliar imagem do produto"><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width:800px) 100vw, 45vw" priority/><span className={s.zoomHint}><ZoomIn size={18} aria-hidden/>Ampliar</span></button>:<p>Imagens em preparação</p>}</div>{images.length>1&&<div className={s.thumbnails} aria-label="Imagens do produto">{images.map((item,index)=><button key={item.src} onClick={()=>setSelected(index)} aria-label={`Ver imagem ${index+1}`} aria-pressed={selected===index}><Image src={item.src} alt={item.alt} width={80} height={80}/></button>)}</div>}
 <dialog className={s.imageDialog} ref={dialog} aria-label="Imagem ampliada do produto" onCancel={()=>setZoomed(false)} onClick={event=>{if(event.target===event.currentTarget)close()}}><div className={s.viewerHeader}><p aria-live="polite">Imagem {selected+1} de {images.length}</p><button onClick={close} aria-label="Fechar imagem ampliada" autoFocus><X aria-hidden/></button></div>{image&&<button className={`${s.zoomStage} ${zoomed?s.zoomed:''}`} aria-label={zoomed?'Reduzir zoom da imagem':'Aumentar zoom da imagem'} aria-pressed={zoomed} onClick={()=>setZoomed(!zoomed)} onPointerMove={event=>{if(event.pointerType==='mouse'){const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--zoom-x',`${(event.clientX-rect.left)/rect.width*100}%`);event.currentTarget.style.setProperty('--zoom-y',`${(event.clientY-rect.top)/rect.height*100}%`)}}}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="100vw" loading="eager"/></button>}{images.length>1&&<div className={s.viewerNavigation}><button aria-label="Imagem anterior" onClick={()=>{setSelected((selected-1+images.length)%images.length);setZoomed(false)}}><ChevronLeft aria-hidden/></button><button aria-label="Próxima imagem" onClick={()=>{setSelected((selected+1)%images.length);setZoomed(false)}}><ChevronRight aria-hidden/></button></div>}<p className={s.viewerHelp}>Passe o mouse ou toque na imagem para ampliar. Esc para fechar.</p></dialog>
 </div>
}
