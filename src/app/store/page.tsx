import type {Metadata} from 'next'
import {StoreLanding} from '@/modules/store/landing'
export const metadata:Metadata={title:'FormFisik Store — Performance, atitude e estilo',description:'Conheça a proposta da primeira coleção FormFisik. Oversized, compressão e acessórios. Lançamento em breve.'}
export default function StorePage(){return <StoreLanding/>}
