'use client'

import Link from 'next/link'
import {MarketingBrand} from '@/modules/marketing/brand'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import s from '@/modules/marketing/landing.module.css'

const navigation = [['Plataforma', 'plataforma'], ['Store', '/store'], ['Studio', 'studio'], ['Para profissionais', 'profissionais'], ['Sobre', 'sobre']]

type HeaderItem={label:string;href:string}
export function Header({items,badge,actions,homeHref='/',homeLabel='FormFisik, início'}:{homeHref?:string;homeLabel?:string;items?:HeaderItem[];badge?:string;actions?:import('react').ReactNode}={}) {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  function closeMenu() { setOpen(false); toggle.current?.focus() }
  return <header className={s.header} onKeyDown={event => { if (event.key === 'Escape' && open) closeMenu() }}>
    <a href="#conteudo" className={s.skip}>Pular para o conteúdo</a>
    <div className={s.headerInner}>
      <Link href={homeHref} aria-label={homeLabel} className={s.logo}><MarketingBrand className={s.brand} decorative/></Link>
      {badge&&<span className={s.productBadge}>{badge}</span>}
      <button ref={toggle} type="button" className={s.menuToggle} aria-expanded={open} aria-controls="marketing-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>{open ? <X aria-hidden/> : <Menu aria-hidden/>}</button>
      <nav id="marketing-navigation" aria-label="Navegação principal" className={`${s.navigation} ${open ? s.navigationOpen : ''}`}>
        {(items??navigation.map(([label,id])=>({label,href:id.startsWith('/')?id:'#'+id}))).map(({label,href}) => <a href={href} key={href} onClick={closeMenu}>{label}</a>)}
        {!items&&<Link href="/login" className={s.mobileLogin}>Entrar na plataforma</Link>}
      </nav>
      <div className={s.headerActions}>{actions??<><Link href="/login" className={s.login}>Entrar</Link><Link href="/cadastro" className={s.headerCta}>Criar conta <ArrowUpRight size={16} aria-hidden/></Link></>}</div>
    </div>
  </header>
}
