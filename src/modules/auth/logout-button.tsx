'use client'
import {confirmAction} from '@/modules/feedback/service'
import {useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import { useState,useRef } from 'react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import {notifySessionChanged} from './session-change'
export function LogoutButton() {
  const [busy, setBusy] = useState(false)
  const [confirming,setConfirming]=useState(false)
  const button=useRef<HTMLButtonElement>(null)
  const [message, setMessage] = useFeedbackMessage('',errorFallbacks.login)
  async function logout() {
    if(busy||confirming)return
    setConfirming(true)
    const accepted=await confirmAction('Deseja fazer logout? Você precisará entrar novamente para continuar.')
    setConfirming(false)
    if(!accepted){requestAnimationFrame(()=>button.current?.focus());return}
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(endpoints.logout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!response.ok) throw new Error('LOGOUT_FAILED')
      notifySessionChanged()
      window.location.replace('/login')
    } catch { setBusy(false); setMessage('Não foi possível encerrar a sessão. Tente novamente.') }
  }
  return <div className="space-y-2">
    <Button ref={button} type="button" onClick={logout} disabled={busy||confirming} variant="outline" className="h-11 px-5">{busy ? 'Saindo…' : 'Logout'}</Button>
    <p role="alert" className="max-w-xs text-sm text-red-300">{message}</p>
  </div>
}
