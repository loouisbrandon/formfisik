import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, CalendarDays, Layers3, ShieldCheck, Zap } from 'lucide-react'
import styles from './login-visual.module.css'
const features = [
  { icon: BarChart3, title: 'Evolução', detail: 'do aluno' },
  { icon: Layers3, title: 'Gestão', detail: 'profissional' },
  { icon: CalendarDays, title: 'Agenda', detail: 'organizada' },
  { icon: Zap, title: 'Prescrições', detail: 'personalizadas' },
]
export function AuthVisualShell({title,description,intro='Acesse sua conta FormFisik e organize alunos, treinos e acompanhamento em um só lugar.',formStyle=false,children}:{title:string;description:string;intro?:string;formStyle?:boolean;children:React.ReactNode}) {
  return <main className={styles.scene}>
    <div className={styles.backdrop} aria-hidden="true"><div className={styles.orbit} /><div className={styles.stripes} /><div className={styles.contours} /></div>
    <div className={styles.corner} aria-hidden="true"><span>+</span><p>FORMFISIK<br />PERSONAL 1.0</p></div>
    <p className={styles.manifesto} aria-hidden="true">Performance<br />Disciplina<br />Evolução<br />Lifestyle</p>
    <div className={styles.composition}>
      <section className={styles.story} aria-labelledby="auth-heading">
        <Link href="/" className={styles.brand} aria-label="FormFisik — início"><Image src="/images/nomelogo.png" alt="FORMFISIK" width={340} height={40} priority /></Link>
        <p className={styles.eyebrow}>Plataforma profissional</p>
        <span className={styles.rule} aria-hidden="true" />
        <h1 id="auth-heading">Disciplina <br />para evoluir. <br /><em>Tecnologia <br />para ir além.</em></h1>
        <p className={styles.intro}>{intro}</p>
        <ul className={styles.features}>{features.map(({icon: Icon,title,detail})=><li key={title}><span><Icon aria-hidden="true" strokeWidth={1.5} /></span><p>{title}<br />{detail}</p></li>)}</ul>
      </section>
      <div className={styles.account}>
        <section aria-labelledby="auth-title" className={`${styles.card} ${formStyle ? styles.relatedForms : ''}`}>
          <div className={styles.cardMarks} aria-hidden="true"><i /><i /><i /></div>
          <Link href="/" className={`${styles.brand} ${styles.cardBrand}`} aria-label="FormFisik — início"><Image src="/images/nomelogo.png" alt="FORMFISIK" width={224} height={27} /></Link>
          <h2 id="auth-title">{title}</h2>
          <p className={styles.cardIntro}>{description}</p>
          {children}
        </section>
        <div className={styles.assurances}><p><ShieldCheck aria-hidden="true" /><span>Conta<br /><strong>protegida</strong></span></p><p><Layers3 aria-hidden="true" /><span>Gestão<br /><strong>integrada</strong></span></p><p><Zap aria-hidden="true" /><span>Foco na<br /><strong>evolução</strong></span></p></div>
      </div>
    </div>
    <footer className={styles.footer}><Link href="/" aria-label="FormFisik — início" className={styles.monogram}>F</Link><span className={styles.footerBars} aria-hidden="true">{'/////'}</span><p>FORMFISIK © {new Date().getFullYear()}<br />Todos os direitos reservados.</p></footer>
  </main>
}
