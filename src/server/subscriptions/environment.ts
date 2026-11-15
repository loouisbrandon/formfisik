import 'server-only'
import {config} from '../config'
export class BillingUnavailable extends Error {}
export class BillingConflict extends Error {}
/** Explicit deployment/origin pairing. NODE_ENV alone cannot distinguish staging from production. */
export function billingEnvironment(){
 const origin=config().appUrl,url=new URL(origin),deployment=process.env.RAILWAY_ENVIRONMENT_NAME
 const local=!deployment&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)
 const mode=process.env.STRIPE_BILLING_MODE??(local?'test':'disabled')
 if(!['test','live'].includes(mode))throw new BillingUnavailable()
 if(mode==='live'&&(deployment!=='production'||origin!=='https://formfisik.com.br'))throw new BillingUnavailable()
 if(mode==='test'&&!local&&!(deployment==='staging'&&origin==='https://sta.formfisik.com.br'))throw new BillingUnavailable()
 const live=mode==='live',key=process.env.STRIPE_SECRET_KEY,accountId=process.env.STRIPE_ACCOUNT_ID
 if(!key||!new RegExp(`^(?:sk|rk)_${live?'live':'test'}_[A-Za-z0-9_]+$`).test(key))throw new BillingUnavailable()
 if((!local||accountId)&&!/^acct_[A-Za-z0-9]+$/.test(accountId??''))throw new BillingUnavailable()
 return {mode:mode as 'test'|'live',live,key,accountId,origin}
}
export function assertBillingMode(value:{livemode:boolean}){if(value.livemode!==billingEnvironment().live)throw new BillingUnavailable()}
/** Safe display only; never an authorization or a secret-bearing DTO. */
export function billingDisplayMode():'test'|'live'|'disabled'{try{return billingEnvironment().mode}catch{return 'disabled'}}
