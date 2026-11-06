// Test-process preload only. Official Stripe SDK serializes/validates requests;
// its HTTPS transport is redirected to a loopback fixture. No runtime bypass.
import https from 'node:https'
import http from 'node:http'
import {syncBuiltinESMExports} from 'node:module'
const original=https.request
https.request=function(options,...args){
 const host=typeof options==='object'?(options.hostname||options.host):new URL(options).hostname
 if(host==='api.stripe.com')return http.request({...options,hostname:'127.0.0.1',host:'127.0.0.1',port:3112,protocol:'http:',agent:undefined},...args)
 if(['localhost','127.0.0.1'].includes(host))return original.call(this,options,...args)
 throw Error('External HTTPS forbidden in isolated security test')
}
syncBuiltinESMExports()
