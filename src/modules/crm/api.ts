'use client'
export async function crmApi(query:string,body?:object,signal?:AbortSignal){
 let response:Response
 try{response=await fetch('/api/crm'+query,{method:body?'POST':'GET',cache:'no-store',signal,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})}
 catch(error){if(signal?.aborted)throw error;throw Error('Falha de conexão. Confira sua rede e tente novamente.')}
 let data
 try{data=await response.json()}catch{throw Error('CRM temporariamente indisponível. Tente novamente.')}
 if(response.status===401)window.location.replace('/login?reason=session')
 if(response.status===403&&['/conta','/assinatura','/assinatura/gerenciar'].includes(data.destination))window.location.replace(data.destination)
 if(!response.ok)throw Error(data.message||'Não foi possível consultar o CRM.')
 return data
}
export {action,control} from '../intake/fields'
