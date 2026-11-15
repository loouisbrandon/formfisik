'use client'
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react'
import type {Occurrence} from './api'
import {minuteText} from './api'
type Source={item:Occurrence;pointer:number;x:number;y:number;offset:number;active:boolean}
type Drop={date:string;time:string;minutes:number;duration:number}
export function useCalendarDrag(onMove:(o:Occurrence,date:string,time:string)=>void,onShift:(n:number)=>void){
 const ghost=useRef<HTMLDivElement>(null),root=useRef<HTMLElement>(null),source=useRef<Source|null>(null),target=useRef<Drop|null>(null)
 const navigation=useRef<ReturnType<typeof setInterval>|null>(null),scrolling=useRef<ReturnType<typeof setInterval>|null>(null),direction=useRef(0),point=useRef({x:0,y:0}),edge=useRef({key:'',since:0}),shift=useRef(onShift),suppressed=useRef(false)
 const [draggedItem,setDraggedItem]=useState<Occurrence|null>(null),[drop,setDrop]=useState<Drop|null>(null),[label,setLabel]=useState('')
 useEffect(()=>{shift.current=onShift},[onShift])
 function stopNavigation(){if(navigation.current)clearInterval(navigation.current);navigation.current=null;direction.current=0}
 function cancel(){const old=source.current;source.current=null;target.current=null;stopNavigation();if(scrolling.current)clearInterval(scrolling.current);scrolling.current=null;edge.current={key:'',since:0};if(old&&root.current?.hasPointerCapture(old.pointer))root.current.releasePointerCapture(old.pointer);setDraggedItem(null);setDrop(null);setLabel('')}
 useEffect(()=>{
  const blur=()=>{const old=source.current;source.current=null;target.current=null;if(old&&root.current?.hasPointerCapture(old.pointer))root.current.releasePointerCapture(old.pointer);if(navigation.current)clearInterval(navigation.current);if(scrolling.current)clearInterval(scrolling.current);navigation.current=null;scrolling.current=null;direction.current=0;edge.current={key:'',since:0};setDraggedItem(null);setDrop(null);setLabel('')}
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&source.current?.active){e.preventDefault();suppressed.current=true;blur();setTimeout(()=>{suppressed.current=false},0)}}
  window.addEventListener('blur',blur);window.addEventListener('keydown',escape)
  return()=>{window.removeEventListener('blur',blur);window.removeEventListener('keydown',escape);if(navigation.current)clearInterval(navigation.current);if(scrolling.current)clearInterval(scrolling.current)}
 },[])
 function locate(x:number,y:number){
  const s=source.current;if(!s?.active)return
  const day=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-calendar-date]')
  if(!day){target.current=null;setDrop(null);setLabel(direction.current?'Mantenha sobre a seta para mudar o período.':'Solte sobre um dia e horário. Escape cancela.');return}
  const minutes=Math.max(0,Math.min(1439,Math.round(((y-day.getBoundingClientRect().top)/1.2+Number(day.dataset.startHour)*60-s.offset)/15)*15))
  const next={date:day.dataset.calendarDate!,time:minuteText(minutes),minutes,duration:(Date.parse(s.item.ends_at)-Date.parse(s.item.starts_at))/60000}
  target.current=next;setDrop(old=>old?.date===next.date&&old.time===next.time?old:next);setLabel('Mover para '+next.date.split('-').reverse().join('/')+' às '+next.time+' · solte para revisar')
 }
 function down(e:ReactPointerEvent<HTMLButtonElement>,item:Occurrence){if(e.button!==0||item.state!=='scheduled'||Date.parse(item.starts_at)<Date.now())return;e.currentTarget.focus({preventScroll:true});source.current={item,pointer:e.pointerId,x:e.clientX,y:e.clientY,offset:(e.clientY-e.currentTarget.getBoundingClientRect().top)/1.2,active:false}}
 function move(e:ReactPointerEvent<HTMLElement>){
  const s=source.current;if(!s||s.pointer!==e.pointerId)return
  if(!s.active){if(Math.hypot(e.clientX-s.x,e.clientY-s.y)<8)return;s.active=true;root.current?.setPointerCapture(e.pointerId);setDraggedItem(s.item)}
  e.preventDefault();point.current={x:e.clientX,y:e.clientY}
  if(!scrolling.current)scrolling.current=setInterval(()=>{
   const grid=root.current?.querySelector<HTMLElement>('[data-calendar-scroller]');if(!grid)return
   const r=grid.getBoundingClientRect(),p=point.current,inside=p.y>=r.top&&p.y<=r.bottom&&p.x>=r.left&&p.x<=r.right
   const dy=inside?(p.y<r.top+35?-14:p.y>r.bottom-35?14:0):0,dx=inside?(p.x<r.left+35?-14:p.x>r.right-35?14:0):0,key=dx+':'+dy
   if(key!==edge.current.key){edge.current={key,since:Date.now()};return}
   if((dx||dy)&&Date.now()-edge.current.since>=180){grid.scrollTop+=dy;grid.scrollLeft+=dx;locate(p.x,p.y)}
  },60)
  if(ghost.current){const g=ghost.current,w=g.offsetWidth,h=g.offsetHeight;g.style.transform=`translate3d(${e.clientX+w+18>innerWidth?Math.max(8,e.clientX-w-14):e.clientX+14}px,${e.clientY+h+18>innerHeight?Math.max(8,e.clientY-h-14):e.clientY+14}px,0)`;g.style.visibility='visible'}
  const nav=Number(document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-drag-shift]')?.dataset.dragShift??0)
  if(nav!==direction.current){stopNavigation();if(nav){direction.current=nav;navigation.current=setInterval(()=>shift.current(nav),1000)}}
  locate(e.clientX,e.clientY)
 }
 function up(e:ReactPointerEvent<HTMLElement>){const s=source.current;if(!s||s.pointer!==e.pointerId)return;if(s.active)locate(e.clientX,e.clientY);const destination=target.current;if(s.active){suppressed.current=true;setTimeout(()=>{suppressed.current=false},0);e.preventDefault()}cancel();if(s.active&&destination)onMove(s.item,destination.date,destination.time)}
 function clickAllowed(){return !suppressed.current}
 return {root,ghost,dragging:draggedItem?.id??null,draggedItem,drop,label,down,move,up,cancel,clickAllowed}
}
