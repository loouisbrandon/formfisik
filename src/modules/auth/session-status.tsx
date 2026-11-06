'use client'
import { useEffect, useState } from 'react'
import { endpoints } from '@/services/api/endpoints'
import {sessionChangeSource} from './session-change'

// These checks NEVER refresh the server's idle deadline. User navigations do.
export function SessionStatus({identityContext,onIdentityChange}:{identityContext?:string;onIdentityChange?:()=>void}) {
  const [warning, setWarning] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    let pending = false
    async function check() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try {
        const response = await fetch(endpoints.session, { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) {onIdentityChange?.();window.location.replace('/login?reason=session')}
        else if(response.ok){const data=await response.json();if(identityContext&&data.context!==identityContext){onIdentityChange?.();window.location.replace('/conta');return}setWarning('')}
        else {setWarning('Não foi possível verificar sua sessão agora. Tente atualizar a página.');await response.body?.cancel()}
      } catch { if (!controller.signal.aborted) setWarning('Sem conexão. Seu acesso será verificado ao reconectar.') }
      finally { pending = false }
    }
    // The server layout already validated this navigation. Poll only later/focus.
    const timer = window.setInterval(check, 60000)
    const channel=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel('formfisik-session-change')
    if(channel)channel.onmessage=event=>{if(event.data?.kind!=='changed'||event.data?.source===sessionChangeSource)return;onIdentityChange?.();window.location.replace('/conta')}
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      controller.abort()
      channel?.close()
      window.clearInterval(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [identityContext,onIdentityChange])
  return <p role="status" className="text-sm text-muted-foreground">{warning}</p>
}
