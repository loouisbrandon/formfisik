import {Suspense} from 'react'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {isCatalogGroup,catalogGroups} from '@/modules/store/catalog'
import {StoreShell} from '@/modules/store/shell'
import {CatalogArea} from '@/modules/store/catalog-area'
export async function generateMetadata({params}:{params:Promise<{department:string}>}):Promise<Metadata>{const {department}=await params;return {title:isCatalogGroup(department)?`${catalogGroups[department].title} | FormFisik Store`:'Coleção não encontrada | FormFisik Store'}}
export default async function CatalogPage({params}:{params:Promise<{department:string}>}){const {department}=await params;if(!isCatalogGroup(department))notFound();return <StoreShell><Suspense fallback={<p role="status">Carregando coleção…</p>}><CatalogArea group={department}/></Suspense></StoreShell>}
