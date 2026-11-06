import {randomBytes} from 'node:crypto'
import {NextRequest,NextResponse} from 'next/server'
import {browserPolicy} from './server/browser-policy'
export function proxy(request:NextRequest){
 const policy=browserPolicy(randomBytes(32).toString('base64'),process.env.NODE_ENV==='development')
 const headers=new Headers(request.headers)
 headers.set('Content-Security-Policy',policy)
 headers.delete('x-nonce')
 const response=NextResponse.next({request:{headers}})
 response.headers.set('Content-Security-Policy',policy)
 response.headers.set('Cache-Control','private, no-store')
 return response
}
export const config={matcher:'/((?!api/|_next/static/|_next/image|images/|icon.png|favicon.ico).*)'}
