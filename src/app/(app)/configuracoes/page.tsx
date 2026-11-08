import {requireUser} from '@/server/current-user'
import {subscriptionStatus} from '@/server/subscriptions/status'
import {SettingsArea} from '@/modules/settings/area'
import type {SubscriptionState} from '@/modules/subscriptions/status'
export const metadata={title:'Configurações | FormFisik'}
export default async function SettingsPage({searchParams}:{searchParams:Promise<{section?:string|string[]}>}){const initialSection=(await searchParams).section==='account'?'account':'overview';const user=await requireUser();let subscription:{state:SubscriptionState;nextBillingAt:string|null;paidAccess:boolean}={state:'unavailable',nextBillingAt:null,paidAccess:false};if(user.role==='professional'){try{const view=await subscriptionStatus(user.id,false,undefined,false);subscription={state:view.state,nextBillingAt:view.nextBillingAt,paidAccess:view.paidAccess}}catch{console.error('settings_subscription_unavailable')}}return <SettingsArea key={initialSection} initialSection={initialSection} fullName={user.fullName} email={user.email} subscription={subscription}/>}
