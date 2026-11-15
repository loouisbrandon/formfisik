// No configuration or secrets. Shared with Proxy and regression tests.
export function browserPolicy(nonce:string,development=false){
 if(!/^[A-Za-z0-9+/]{43}=$/.test(nonce))throw Error('INVALID_CSP_NONCE')
 const customer=process.env.STREAM_CUSTOMER_CODE??'',streamFrame=/^customer-[a-z0-9]+$/.test(customer)?` https://${customer}.cloudflarestream.com`:''
 return ["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development?" 'unsafe-eval'":''}`,
  development?"style-src 'self' 'unsafe-inline'":`style-src 'self' 'nonce-${nonce}'`,
  // React positioning/SVG/PDF canvas use style attributes; scripts remain nonce-only.
  "style-src-attr 'unsafe-inline'","img-src 'self' blob: data:","font-src 'self'","connect-src 'self' https://upload.videodelivery.net",
  `frame-src https://www.youtube-nocookie.com${streamFrame}`,"worker-src 'self' blob:","object-src 'none'","base-uri 'none'","form-action 'self'","frame-ancestors 'none'"].join('; ')
}
