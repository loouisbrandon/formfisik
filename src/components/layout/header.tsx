'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import s from '@/modules/marketing/landing.module.css'

const navigation = [['Plataforma', 'plataforma'], ['Wear', 'wear'], ['Studio', 'studio'], ['Para profissionais', 'profissionais'], ['Sobre', 'sobre']]

export function Header() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  function closeMenu() { setOpen(false); toggle.current?.focus() }
  return <header className={s.header} onKeyDown={event => { if (event.key === 'Escape' && open) closeMenu() }}>
    <a href="#conteudo" className={s.skip}>Pular para o conteúdo</a>
    <div className={s.headerInner}>
      <Link href="/" aria-label="FormFisik, início" className={s.logo}><Image className={s.brand} src="/images/nomelogo.png" alt="" width={2488} height={292} sizes="185px" loading="eager"/></Link>
      <button ref={toggle} type="button" className={s.menuToggle} aria-expanded={open} aria-controls="marketing-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>{open ? <X aria-hidden/> : <Menu aria-hidden/>}</button>
      <nav id="marketing-navigation" aria-label="Navegação principal" className={`${s.navigation} ${open ? s.navigationOpen : ''}`}>
        {navigation.map(([label, id]) => <a href={`#${id}`} key={id} onClick={closeMenu}>{label}</a>)}
        <Link href="/login" className={s.mobileLogin}>Entrar na plataforma</Link>
      </nav>
      <div className={s.headerActions}><Link href="/login" className={s.login}>Entrar</Link><Link href="/cadastro" className={s.headerCta}>Criar conta <ArrowUpRight size={16} aria-hidden/></Link></div>
    </div>
  </header>
}
