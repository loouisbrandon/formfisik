import {desiredProducts,kitProducts,type StoreImage} from './content'
export const catalogGroups={
 roupas:{title:'ROUPAS',description:'Do treino ao resto do dia. Encontre sua pegada.',eyebrow:'VISTA SUA MENTALIDADE',types:[{id:'oversized',label:'Oversized'},{id:'compressao',label:'Compressão'}]},
 acessorios:{title:'ACESSÓRIOS',description:'Os detalhes que acompanham cada movimento.',eyebrow:'COMPLETE SUA ROTINA',types:[{id:'bones',label:'Bonés'},{id:'straps',label:'Straps'},{id:'garrafas',label:'Garrafas'},{id:'bolsas',label:'Bolsas'},{id:'toalhas',label:'Toalhas'},{id:'munhequeiras',label:'Munhequeiras'}]},
 suplementacao:{title:'SUPLEMENTAÇÃO',description:'Uma nova linha em preparação. Conheça os produtos no lançamento.',eyebrow:'O PRÓXIMO PASSO ESTÁ CHEGANDO',types:[]},
} as const
export type CatalogGroup=keyof typeof catalogGroups
export type CatalogProduct={id:string;name:string;category:string;group:CatalogGroup;type:string;order:number;image?:StoreImage}
// Editorial launch previews only; not inventory, price, popularity or nutrition data.
export const catalogProducts:CatalogProduct[]=[
 ...desiredProducts.map((p,i)=>({...p,group:(p.category==='Acessórios'?'acessorios':'roupas') as CatalogGroup,type:({ 'oversized-black':'oversized','compression-lava':'compressao',bone:'bones',straps:'straps','compression-fk':'compressao'} as Record<string,string>)[p.id],order:i})),
 ...kitProducts.map((p,i)=>({...p,group:'acessorios' as const,type:['bolsas','toalhas','garrafas','munhequeiras'][i],order:i+desiredProducts.length})),
]
export function isCatalogGroup(value:string):value is CatalogGroup{return Object.hasOwn(catalogGroups,value)}
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')
export function filterCatalog(group:CatalogGroup,{type='',query='',sort='collection'}:{type?:string;query?:string;sort?:string}){
 const terms=normalize(query.slice(0,100)).trim().split(/\s+/).filter(Boolean)
 return catalogProducts.filter(p=>p.group===group&&(!type||p.type===type)&&terms.every(t=>normalize(p.name+' '+p.category).includes(t))).sort((a,b)=>sort==='name_asc'?a.name.localeCompare(b.name,'pt-BR'):sort==='name_desc'?b.name.localeCompare(a.name,'pt-BR'):a.order-b.order)
}
