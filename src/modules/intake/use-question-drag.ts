'use client'
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react'

type Drag={id:string;target:string|null;after:boolean;x:number;y:number;width:number}
export function useQuestionDrag(onDrop:(id:string,target:string,after:boolean)=>void){
 const root=useRef<HTMLElement>(null),cleanup=useRef<(()=>void)|null>(null)
 const [drag,setDrag]=useState<Drag|null>(null)
 useEffect(()=>()=>cleanup.current?.(),[])
 function start(event:ReactPointerEvent<HTMLButtonElement>,id:string){
  if(event.button!==0||!event.isPrimary||!root.current)return
  event.preventDefault();event.currentTarget.focus();cleanup.current?.()
  const container=root.current,handle=event.currentTarget,origin={x:event.clientX,y:event.clientY}
  const card=handle.closest<HTMLElement>('[data-question-id]')!
  const width=Math.min(card.getBoundingClientRect().width,380)
  let active=false,last:Drag|null=null,point=origin
  handle.setPointerCapture(event.pointerId)
  function locate(){
   const bounds=container.getBoundingClientRect()
   let target:string|null=null,after=false
   if(point.x>=bounds.left&&point.x<=bounds.right&&point.y>=bounds.top&&point.y<=bounds.bottom){
    const cards=Array.from(container.querySelectorAll<HTMLElement>('[data-question-id]'))
    const nearest=cards.find(c=>point.y<c.getBoundingClientRect().bottom)??cards.at(-1)
    if(nearest){const rect=nearest.getBoundingClientRect();target=nearest.dataset.questionId!;after=point.y>rect.top+rect.height/2}
   }
   last={id,target,after,x:Math.max(8,Math.min(point.x+16,window.innerWidth-width-8)),y:Math.max(8,Math.min(point.y+12,window.innerHeight-90)),width}
   setDrag(last)
  }
  function move(e:PointerEvent){
   if(e.pointerId!==event.pointerId)return
   point={x:e.clientX,y:e.clientY}
   if(!active&&Math.hypot(point.x-origin.x,point.y-origin.y)<6)return
   active=true;e.preventDefault();locate()
  }
  function stop(){
   window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',cancel);window.removeEventListener('keydown',key);window.removeEventListener('blur',cancel)
   clearInterval(timer);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId)
   setDrag(null);cleanup.current=null
  }
  function end(e:PointerEvent){if(e.pointerId!==event.pointerId)return;const result=last;stop();if(result?.target&&result.target!==id)onDrop(id,result.target,result.after)}
  function cancel(){stop()}
  function key(e:KeyboardEvent){if(e.key==='Escape'){e.preventDefault();stop()}}
  const timer=setInterval(()=>{
   if(!active)return
   const scroller=container.closest<HTMLElement>('#app-content')
   if(!scroller)return
   const rect=scroller.getBoundingClientRect(),delta=point.y<rect.top+65?-18:point.y>rect.bottom-65?18:0
   if(delta){scroller.scrollTop+=delta;locate()}
  },50)
  window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end);window.addEventListener('pointercancel',cancel);window.addEventListener('keydown',key);window.addEventListener('blur',cancel)
  cleanup.current=stop
 }
 return {root,drag,start}
}
