import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getStoreProduct} from '@/modules/store/product'
import {StoreShell} from '@/modules/store/shell'
import {ProductDetail} from '@/modules/store/product-detail'
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const product=getStoreProduct(slug);return {title:product?`${product.name} | FormFisik Store`:'Produto não encontrado | FormFisik Store',description:product?.description}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const product=getStoreProduct(slug);if(!product)notFound();return <StoreShell><ProductDetail product={product}/></StoreShell>}
