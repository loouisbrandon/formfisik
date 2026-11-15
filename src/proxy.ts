import {randomBytes} from 'node:crypto'
import {NextRequest,NextResponse} from 'next/server'
import {browserPolicy} from './server/browser-policy'
import {releaseClosed} from './server/release-state'
export function proxy(request:NextRequest){
 if(releaseClosed()&&!(request.nextUrl.pathname==='/api/health'&&['GET','HEAD'].includes(request.method))){
  return NextResponse.json({message:'FormFisik em preparação. Tente novamente em breve.'},{status:503,headers:{'Cache-Control':'private, no-store','Retry-After':'300','X-Robots-Tag':'noindex, nofollow, noarchive','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}})
 }
 const policy=browserPolicy(randomBytes(32).toString('base64'),process.env.NODE_ENV==='development')
 const headers=new Headers(request.headers)
 headers.set('Content-Security-Policy',policy)
 headers.delete('x-nonce')
 const response=NextResponse.next({request:{headers}})
 response.headers.set('Content-Security-Policy',policy)
 response.headers.set('Cache-Control','private, no-store')
 return response
}
export const config={matcher:'/((?!_next/static/|_next/image|images/|icon.png|favicon.ico).*)'}
