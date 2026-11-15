'use client'
export const sessionChangeSource=typeof window==='undefined'?'server':crypto.randomUUID()
/** No identity or credential payload; no persistence. Other tabs discard old DOM. */
export function notifySessionChanged(){
 if(typeof BroadcastChannel==='undefined')return
 const channel=new BroadcastChannel('formfisik-session-change')
 channel.postMessage({kind:'changed',source:sessionChangeSource});channel.close()
}
