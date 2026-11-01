'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
export function LogoutButton() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function logout() {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(endpoints.logout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!response.ok) throw new Error('LOGOUT_FAILED')
      window.location.replace('/login')
    } catch { setBusy(false); setMessage('Não foi possível encerrar a sessão. Tente novamente.') }
  }
  return <div className="space-y-2">
    <Button onClick={logout} disabled={busy} variant="outline" className="h-11 px-5">{busy ? 'Encerrando…' : 'Sair da conta'}</Button>
    <p role="alert" className="max-w-xs text-sm text-red-300">{message}</p>
  </div>
}
