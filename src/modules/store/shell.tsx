import Link from 'next/link'
import {ShopTools} from './shop-tools'
import {Header} from '@/components/layout/header'
import {MarketingBrand} from '@/modules/marketing/brand'
import {campaign} from '@/modules/marketing/campaign-font'
import marketing from '@/modules/marketing/landing.module.css'
import s from './store.module.css'

export function StoreShell({children}:{children:React.ReactNode}){return <div className={`${marketing.landing} ${campaign.variable} ${s.store}`}>
 <div className={s.announcement}>PERFORMANCE, ATITUDE E ESTILO <span>•</span> NOVA COLEÇÃO EM BREVE</div>
 <Header homeHref="/store" homeLabel="FormFisik Store, início" badge="STORE" items={[{label:'Novidades',href:'/store#mais-desejados'},{label:'Roupas',href:'/store/roupas'},{label:'Compressão',href:'/store/roupas?tipo=compressao'},{label:'Acessórios',href:'/store/acessorios'},{label:'Suplementação',href:'/store/suplementacao'},{label:'Coleções',href:'/store#categorias'}]} actions={<ShopTools/>}/>
<main id="conteudo" tabIndex={-1}>{children}</main>
 <footer className={s.footer}><div className={s.footerGrid}><div><Link className={s.footerBrand} href="/store" aria-label="FormFisik Store, início"><MarketingBrand className={s.footerLogo}/><span className={marketing.productBadge}>STORE</span></Link><p>Performance, estilo e disciplina para quem vive o treino como parte da identidade. Mais que roupas, um jeito de viver.</p></div><nav aria-label="Loja"><h2>LOJA</h2><Link href="/store#mais-desejados">Novidades</Link><Link href="/store/roupas">Roupas e compressão</Link><Link href="/store/acessorios">Acessórios</Link><Link href="/store/suplementacao">Suplementação</Link><Link href="/store/acessorios">Kit de treino</Link></nav><div><h2>AJUDA</h2><p>Atendimento, entregas, trocas e condições de pagamento serão apresentados na abertura da loja.</p><span className={s.release}>VENDAS EM BREVE</span></div><nav aria-label="FormFisik"><h2>FORMFISIK</h2><Link href="/#sobre">Sobre a marca</Link><Link href="/">Conheça a plataforma</Link><Link href="/store#store-title">Nossa mentalidade</Link><span>Políticas da loja em preparação</span></nav></div><div className={s.footerBottom}><p>© {new Date().getFullYear()} FormFisik. Todos os direitos reservados.</p><span>PERFORMANCE <i>/</i> LIFESTYLE <i>/</i> DISCIPLINA</span></div></footer>
</div>}
