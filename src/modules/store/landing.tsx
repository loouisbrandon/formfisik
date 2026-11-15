import Link from 'next/link'
import Image from 'next/image'
import {ArrowRight,ArrowUpRight,BadgeCheck,LockKeyhole,Package,Zap} from 'lucide-react'
import {storeCategories,desiredProducts,kitProducts} from './content'
import s from './store.module.css'
import {StoreShell} from './shell'
import {StoreProductCard,StoreMedia} from './components'
function Products({items}:{items:typeof desiredProducts}){return <div className={`${s.products} ${items===desiredProducts?s.desiredProducts:''}`}>{items.map(item=><StoreProductCard key={item.id} item={item}/>)}</div>}
function Heading({children,href,label}:{children:React.ReactNode;href?:string;label?:string}){return <div className={s.sectionHeading}><h2>{children}</h2><span aria-hidden/>{href&&<a href={href}>{label}<ArrowRight size={17} aria-hidden/></a>}</div>}
export function StoreLanding(){return <StoreShell>

 <section className={s.hero} aria-labelledby="store-title"><div className={s.heroArt} aria-hidden="true"><Image className={s.heroImage} src="/images/store/hero-neon-duo.png" alt="" width={1916} height={821} sizes="(min-width: 1916px) 1916px, 100vw" priority/></div><div className={s.heroCopy}><p className={s.eyebrow}>FORMFISIK STORE / PRIMEIRA COLEÇÃO</p><h1 id="store-title">VISTA SUA<br/><span className={s.heroMentality}>MENTALIDADE.</span></h1><p className={s.heroSubtitle}>Performance dentro e fora do treino.</p><div className={s.actions}><a className={s.cta} href="#categorias">Explorar coleção<ArrowRight size={20} aria-hidden/></a><Link className={s.textLink} href="/#sobre">Conhecer a FormFisik<ArrowUpRight size={16} aria-hidden/></Link></div></div></section>
 <div className={s.benefits}>{[{Icon:BadgeCheck,text:'Coleção em preparação'},{Icon:LockKeyhole,text:'Vendas ainda não abertas'},{Icon:Package,text:'Detalhes no lançamento'},{Icon:Zap,text:'Performance & lifestyle'}].map(({Icon,text})=><div key={text}><Icon size={23} aria-hidden/><span>{text}</span></div>)}</div>
 <section id="categorias" className={s.section} aria-labelledby="categories-title"><div className={s.sectionHeading}><h2 id="categories-title">ESCOLHA SUA PEGADA</h2><span aria-hidden/></div><div className={s.categories}>{storeCategories.map(c=><article id={c.id} key={c.id} className={s.category}><StoreMedia label={c.name} image={c.image} category/><div className={s.categoryCopy}><span>COLEÇÃO EM BREVE</span><h3><Link href={c.href} className={s.categoryLink}>{c.name}<ArrowRight size={23} aria-hidden/></Link></h3><p>{c.caption}</p></div></article>)}</div></section>
 <section id="mais-desejados" className={s.section}><Heading href="#kit" label="Conhecer o kit">MAIS DESEJADOS</Heading><p className={s.sectionNote}>Uma prévia da coleção. Produtos, preços e disponibilidade serão confirmados no lançamento.</p><Products items={desiredProducts}/></section>
 <section className={`${s.identity} ${s.identityPhoto}`}><div className={s.identityPhotoArt} aria-hidden="true"><Image src="/images/store/banner-identity.png" alt="" width={2172} height={724} sizes="100vw"/></div><h2>NÃO É SÓ ROUPA.<br/><em>É IDENTIDADE.</em></h2></section>
 <section id="kit" className={`${s.section} ${s.kit}`}><Heading>KIT DE TREINO</Heading><p className={s.sectionNote}>Essenciais para acompanhar sua rotina. Monte seu kit no lançamento.</p><Products items={kitProducts}/></section>
 <section className={`${s.identity} ${s.mindset} ${s.identityPhoto} ${s.mindsetPhoto}`}><div className={s.identityPhotoArt} aria-hidden="true"><Image src="/images/store/banner-mindset.png" alt="" width={1672} height={941} sizes="(max-width:700px) 100vw, 58vw"/></div><h2>O CORPO MUDA, <em>A MENTALIDADE FICA.</em></h2></section>
 <section className={s.movement}><h2>ENTRE PARA O MOVIMENTO.</h2><p>Novidades, lançamentos e conteúdos da FormFisik.<br/><span>Inscrições para novidades em breve.</span></p><button disabled className={s.cta}>Quero receber<ArrowRight size={19} aria-hidden/><small>EM BREVE</small></button></section>


 </StoreShell>}