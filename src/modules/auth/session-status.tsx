'use client'
import { useEffect, useState } from 'react'
import { endpoints } from '@/services/api/endpoints'

// These checks NEVER refresh the server's idle deadline. User navigations do.
export function SessionStatus() {
  const [warning, setWarning] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    let pending = false
    async function check() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try {
        const response = await fetch(endpoints.session, { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) window.location.replace('/login?reason=session')
        else setWarning(response.ok ? '' : 'Não foi possível verificar sua sessão agora. Tente atualizar a página.')
      } catch { if (!controller.signal.aborted) setWarning('Sem conexão. Seu acesso será verificado ao reconectar.') }
      finally { pending = false }
    }
    void check()
    const timer = window.setInterval(check, 60000)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return <p role="status" className="text-sm text-muted-foreground">{warning}</p>
}
