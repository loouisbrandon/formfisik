import {StoreShell} from '@/modules/store/shell'
import {StoreCart} from '@/modules/store/cart'
export const metadata={title:'Sua sacola | FormFisik Store'}
export default function CartPage(){return <StoreShell><StoreCart/></StoreShell>}
