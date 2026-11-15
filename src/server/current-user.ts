import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cookieName, readSession } from './sessions'

export async function currentUser() {
  return readSession((await cookies()).get(cookieName())?.value, true)
}
export async function requireUser() {
  const user = await currentUser()
  if (!user) redirect('/login?reason=session')
  return user
}
