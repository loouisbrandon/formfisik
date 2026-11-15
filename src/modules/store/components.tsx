import Link from 'next/link'
import Image from 'next/image'
import type {StoreImage} from './content'
import {LikeButton} from './shop-actions'
import s from './store.module.css'
export function StorePlaceholder({label}:{label:string}){return <div className={s.placeholder} role="img" aria-label={`${label}: imagem em breve`}><span className={s.mediaMark} aria-hidden>FK</span><span className={s.placeholderLabel}><span className={s.dot}/>EM BREVE<small>{label}</small></span></div>}
export function StoreMedia({image,label,category=false}:{image?:StoreImage;label:string;category?:boolean}){return image?<div className={`${s.cardMedia} ${category?s.categoryMedia:s.productMedia}`}><Image src={image.src} alt={image.alt} fill={category} width={category?undefined:image.width} height={category?undefined:image.height} sizes="(max-width:700px) 50vw, (max-width:1200px) 33vw, 25vw"/></div>:<StorePlaceholder label={label}/>}
export function StoreProductCard({item}:{item:{id:string;name:string;category:string;image?:StoreImage}}){return <article className={s.product}><StoreMedia label={item.name} image={item.image}/><div className={s.productInfo}><div><small>{item.category}</small><h3><Link className={s.productLink} href={`/store/produto/${item.id}`}>{item.name}</Link></h3><p>Lançamento em breve</p></div><LikeButton id={item.id} name={item.name}/></div></article>}
