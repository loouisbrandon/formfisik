import {StoreShell} from '@/modules/store/shell'
import {StoreCheckout} from '@/modules/store/checkout'
export const metadata={title:'Checkout de demonstração | FormFisik Store',robots:{index:false,follow:false}}
export default function CheckoutPage(){return <StoreShell><StoreCheckout/></StoreShell>}
