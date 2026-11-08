'use client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import {reportError} from '@/modules/feedback/service'
import {useFeedbackError} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import {useEffect,useRef,useState} from 'react'
import {mediaApi} from './api'
import type {DemoReference,Playback} from './schema'
import {action} from '../exercises/browser'
type YTPlayer={destroy():void}
type YTAPI={Player:new(element:HTMLIFrameElement,options:{events:{onError:(event:{data:number})=>void}})=>YTPlayer}
let youtubeReady:Promise<YTAPI>|undefined
function youtubeAPI(){if(!youtubeReady)youtubeReady=new Promise((resolve,reject)=>{const w=window as Window&{YT?:YTAPI;onYouTubeIframeAPIReady?:()=>void};if(w.YT?.Player){resolve(w.YT);return}const prior=w.onYouTubeIframeAPIReady;w.onYouTubeIframeAPIReady=()=>{prior?.();if(w.YT)resolve(w.YT)};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.nonce=(document.querySelector('script[nonce]') as HTMLScriptElement|null)?.nonce??'';script.onerror=()=>{youtubeReady=undefined;reject(Error('Player do YouTube indisponível.'))};document.head.append(script)});return youtubeReady}
const errors:Record<number,string>={100:'Vídeo indisponível, removido ou privado.',101:'O autor bloqueou a incorporação deste vídeo.',150:'O autor bloqueou a incorporação deste vídeo.',153:'O YouTube não reconheceu a origem do player. Tente abrir no YouTube.',2:'Identificador de vídeo inválido.',5:'O navegador não conseguiu reproduzir o vídeo.'}
export function DemoPlayer({reference,title='Demonstração'}:{reference:DemoReference;title?:string}){
 const [play,setPlay]=useState<Playback|null>(null),[error,setError]=useFeedbackError(errorFallbacks.media),[busy,setBusy]=useState(false),[expired,setExpired]=useState(false),iframe=useRef<HTMLIFrameElement>(null)
 useEffect(()=>{if(!play?.expiresAt)return;const timer=setTimeout(()=>setExpired(true),Math.max(0,Date.parse(play.expiresAt)-Date.now()));return()=>clearTimeout(timer)},[play])
 useEffect(()=>{if(!play||play.source!=='youtube'||!iframe.current)return;let active=true,player:YTPlayer|undefined;youtubeAPI().then(api=>{if(active&&iframe.current)player=new api.Player(iframe.current,{events:{onError:e=>{if(active)setError(errors[e.data]??'Demonstração indisponível no YouTube.')}}})}).catch(()=>{if(active)setError('API do player indisponível. Tente novamente ou abra no YouTube.')});return()=>{active=false;player?.destroy()}},[play,setError])
 async function load(){setBusy(true);setError('');setPlay(null);setExpired(false);try{setPlay(await mediaApi<Playback>(`?view=playback&id=${reference.videoId}&revision=${reference.revision}`))}catch(e){setError(reportError(e,errorFallbacks.media))}finally{setBusy(false)}}
 let src=play?.url;if(play?.source==='youtube'){const u=new URL(play.url);u.searchParams.set('enablejsapi','1');u.searchParams.set('origin',window.location.origin);src=u.href}
 return <section className="relative space-y-3 rounded-xl border border-border p-3" aria-label={title}><p className="text-sm">{title} · reprodução sob demanda</p>{!play&&<p className="text-sm text-muted-foreground">Carregar vídeo conecta ao provedor externo. O YouTube pode exibir anúncios e aplicar restrições próprias.</p>}{(!play||expired||error)&&<button type="button" disabled={busy} className={action} onClick={()=>void load()}>{busy?<LoadingSkeleton variant="inline" label="Carregando…"/>:play?'Tentar novamente':'Carregar vídeo'}</button>}{play&&!expired&&<><iframe ref={iframe} key={src} src={src} title={play.title||title} referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen className="min-h-[200px] w-full aspect-video border-0" onError={()=>setError('Falha ao carregar o player.')}/><button type="button" className={action} onClick={()=>{setPlay(null);setError('')}}>Fechar vídeo</button></>}{expired&&<p role="status">A autorização de reprodução expirou. Carregue novamente.</p>}{error&&<p role="alert">{error}</p>}{play?.externalUrl&&<a href={play.externalUrl} target="_blank" rel="noopener" referrerPolicy="strict-origin-when-cross-origin" className="underline">Abrir no YouTube (nova aba)</a>}</section>
}
