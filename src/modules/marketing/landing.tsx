import Link from 'next/link'
import Image from 'next/image'
import { Exo_2 } from 'next/font/google'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Zap, Target, ShieldCheck, ChartNoAxesColumnIncreasing, Plus, Minus, CalendarDays, Dumbbell, Layers, LockKeyhole, Shirt } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { proPlan, proPrice } from '@/modules/subscriptions/plan'
import { PlatformPreview } from './platform-preview'
import { PricingPreview } from './pricing-preview'
import s from './landing.module.css'

const campaign = Exo_2({ weight: '900', style: 'italic', subsets: ['latin'], variable: '--font-campaign', display: 'swap' })
function Brand() { return <Image className={s.brand} src="/images/nomelogo.png" alt="FormFisik" width={2488} height={292} sizes="180px"/> }
function Action({ href, children, secondary = false, label }: { href: string; children: ReactNode; secondary?: boolean; label?: string }) {
  return <Link href={href} aria-label={label} className={secondary ? s.secondary : s.cta}>{children}<ArrowRight size={18} aria-hidden/></Link>
}
const collections = [
  { name: 'Oversized', line: '01 / EVERYDAY', tagline: 'Do treino ao resto do dia.', description: 'A linha de camisetas de modelagem ampla da FormFisik. Uma proposta para quem leva o treino também no jeito de vestir.', style: 'oversized', icon: Shirt, image: '/images/marketing/wear-oversized-atlas.png', alt: 'Camiseta preta oversized FormFisik: frente com logo discreta e costas com a estampa Atlas Neon.' },
  { name: 'Compressão', line: '02 / TRAINING', tagline: 'Foco no movimento.', description: 'A proposta de peças ajustadas ao corpo para compor sua rotina de treinos. Modelos, materiais e tamanhos serão apresentados no lançamento.', style: 'compression', icon: Layers, image: '/images/marketing/wear-compression.png', alt: 'Camiseta preta de compressão FormFisik, de manga longa, com logo FK branco no peito.' },
  { name: 'Acessórios', line: '03 / ESSENTIALS', tagline: 'A identidade está nos detalhes.', description: 'Mochilas, garrafas e acessórios para acompanhar você dentro e fora da academia. A seleção completa será apresentada com a primeira coleção.', style: 'accessories', icon: Dumbbell, image: '/images/marketing/wear-accessories.png', alt: 'Acessórios FormFisik em preto com iluminação rosa: mochila, garrafa, toalha, cinto e faixas de treino.' },
]
const questions = [
  { question: 'Para quem é a plataforma FormFisik?', answer: 'Para personal trainers que querem organizar alunos, treinos, avaliações, agenda e a gestão dos seus serviços em um só lugar. O foco atual é a rotina profissional de musculação e treinamento personalizado.' },
  { question: 'Como funciona o período de teste?', answer: `O FormFisik Pro oferece ${proPlan.trialDays} dias de teste com cartão obrigatório. Após esse período, a assinatura custa ${proPrice} por mês. Cancele antes do fim do teste para evitar a cobrança.` },
  { question: 'Preciso receber dos meus alunos pela plataforma?', answer: 'Você escolhe como recebe. É possível registrar recebimentos externos no financeiro sem conectar uma conta de processamento. Sua assinatura FormFisik Pro é independente dos serviços vendidos aos seus alunos.' },
  { question: 'Posso usar pelo celular?', answer: 'A área profissional funciona no navegador do computador, tablet e celular. O aplicativo dedicado ao aluno está em desenvolvimento e ainda não está disponível para download.' },
  { question: 'A loja Wear e o Studio já estão disponíveis?', answer: 'Ainda não. A primeira coleção Wear e o projeto Studio estão em preparação. Os produtos, preços, unidades e condições serão apresentados quando cada operação estiver disponível.' },
]

export function Landing() {
  return <div className={`${s.landing} ${campaign.variable}`}>
    <Header/>
    <main id="conteudo" tabIndex={-1}>
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroVisual} aria-hidden="true"><Image className={s.heroImage} src="/images/marketing/hero-bodybuilder-magenta.png" alt="" fill sizes="(min-width: 1800px) 1600px, 100vw" loading="eager" fetchPriority="high"/></div>
        <div className={s.container}>
          <div className={s.heroGrid}>
            <div className={s.heroContent}>
              <h1 id="hero-title">NÃO É SÓ<br/>TREINO.<br/><em>É QUEM VOCÊ<br/><span>SE TORNA.</span></em></h1>
              <p className={s.intro}>Ferramentas para quem orienta. Estilo para quem treina. Espaço para o que vem depois.</p>
              <div className={s.actions}><Action href="#plataforma">Conhecer a plataforma</Action><a href="#wear" className={s.quietLink}>Explorar a Wear <ArrowUpRight size={17} aria-hidden/></a></div>
            </div>

          </div>
          <div className={s.heroBottom}><a href="#plataforma">Conheça a FormFisik <ArrowRight size={17} aria-hidden/></a></div>
        </div>
      </section>

            <nav className={`${s.container} ${s.heroDirectory}`} aria-label="Explore a FormFisik">
              <a href="#plataforma"><span className={s.directoryNumber}>01</span><div><strong>Organize sua rotina.</strong><p>Alunos, treinos e gestão profissional.</p><span>PLATAFORMA</span></div><ArrowUpRight aria-hidden/></a>
              <a href="#wear"><span className={s.directoryNumber}>02</span><div><strong>Vista o movimento.</strong><p>Conheça a proposta da primeira coleção.</p><span>FORMFISIK WEAR · EM BREVE</span></div><ArrowUpRight aria-hidden/></a>
              <a href="#studio"><span className={s.directoryNumber}>03</span><div><strong>Treine no seu espaço.</strong><p>Um novo projeto para o treino presencial.</p><span>FORMFISIK STUDIO · EM BREVE</span></div><ArrowUpRight aria-hidden/></a>
            </nav>

      <section id="plataforma" className={s.platform} aria-labelledby="platform-title">
        <div className={s.platformHeading}>
          <div><p className={s.platformEyebrow}>01 <span>/</span> PLATAFORMA<i aria-hidden/></p><h2 id="platform-title">Mais tempo com o aluno.<br/><em>Mais clareza na gestão.</em></h2></div>
          <div className={s.platformLead}><span><Layers size={36} aria-hidden/></span><p>Da primeira anamnese à próxima revisão de treino. Conheça as ferramentas que conectam seu atendimento.</p></div>
        </div>
        <PlatformPreview/>
      </section>

      <section id="wear" className={s.wear} aria-labelledby="wear-title">
        <div className={s.container}>
          <div className={s.wearHeading}>
            <div><p className={s.wearEyebrow}>02 <span>/</span> FORMFISIK WEAR<i aria-hidden/></p><h2 id="wear-title">O TREINO FAZ PARTE<br/><em>DO SEU ESTILO.</em></h2></div>
            <div className={s.wearIntro}><span className={s.wearRelease}><Layers size={32} aria-hidden/>PRIMEIRA COLEÇÃO — EM PREPARAÇÃO</span><p>Do oversized aos essenciais. Conheça as linhas que vão dar forma à Wear.</p></div>
          </div>
          <div className={s.wearGrid}>{collections.map((item, index) => <article className={s.collection} key={item.name} data-featured={index === 0}>
            <div className={s.collectionCover}><Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (min-width: 1800px) 580px, 33vw" className={s.collectionImage}/></div>
            <div className={s.collectionBody}>
              <div className={s.collectionInfo}><span className={s.collectionIcon}><item.icon size={31} aria-hidden/></span><div><h3>{item.name}</h3><p>{item.tagline}</p></div><ArrowRight className={s.collectionArrow} size={26} aria-hidden/></div>
              <details><summary>Conhecer a linha <ArrowRight size={22} aria-hidden/></summary><p>{item.description}</p><small>Coleção em preparação. Vendas ainda não abertas.</small></details>
            </div>
          </article>)}</div>
        </div>
      </section>

      <section id="profissionais" className={s.professionals} aria-labelledby="pro-title">
        <PricingPreview/>
      </section>

      <section id="studio" className={s.studio} aria-labelledby="studio-title">
        <div className={s.container}>
          <div className={s.studioHeading}><p className={s.kicker}>03 / FORMFISIK STUDIO</p><span className={s.releaseLabel}><Dumbbell size={24} aria-hidden/>PROJETO EM DESENVOLVIMENTO</span></div>
          <div className={s.studioGrid}><div><h2 id="studio-title">SEU ESPAÇO.<br/><em>SEU TEMPO.</em></h2><p className={s.studioLead}>A experiência de treino presencial que queremos construir: mais privacidade, mais autonomia e espaço para o seu personal.</p><a href="#studio-project" className={s.studioProjectLink}>Conhecer o projeto <ArrowUpRight size={20} aria-hidden/></a></div><div className={s.studioConcept}>
            <h3>O treino no centro de tudo.</h3>
            <ul>{[[LockKeyhole,'Privacidade para focar','Ambientes pensados para o atendimento individual.'],[CalendarDays,'Uma rotina que cabe na sua','A proposta é reservar o espaço pelo tempo de uso.'],[Dumbbell,'Seu personal, seu treino','Estrutura para a prática e o acompanhamento profissional.']].map(([Icon,title,text]) => {const FeatureIcon=Icon as typeof Dumbbell;return <li key={String(title)}><FeatureIcon size={23} aria-hidden/><div><strong>{String(title)}</strong><p>{String(text)}</p></div></li>})}</ul>
            <details id="studio-project" className={s.studioDetails}><summary>Em que etapa está o Studio? <Plus className={s.plus} size={18} aria-hidden/><Minus className={s.minus} size={18} aria-hidden/></summary><p>Estamos desenvolvendo o conceito. Ainda não há unidades, preços ou reservas disponíveis. Essas informações serão publicadas aqui quando o projeto estiver pronto para receber você.</p></details>
          </div></div>
        </div>
      </section>

      <section id="sobre" className={s.about} aria-labelledby="about-title"><div className={`${s.container} ${s.aboutGrid}`}><div className={s.aboutTitle}><p className={s.kicker}>NOSSA ESSÊNCIA</p><h2 id="about-title">O corpo muda.<br/><em>A mentalidade fica.</em></h2></div><div><p>A FormFisik nasce da vontade de aproximar treino, trabalho e estilo de vida. Começamos pelas ferramentas de quem acompanha a evolução de outras pessoas.</p><p>Queremos ser uma marca presente no digital e no físico, criando ferramentas, experiências e espaços que ajudem as pessoas a viver melhor. Plataforma, Wear e Studio fazem parte desse caminho.</p></div></div></section>

      <section id="duvidas" className={s.faq} aria-labelledby="faq-title"><div className={`${s.container} ${s.faqGrid}`}><div><p className={s.kicker}>ANTES DE COMEÇAR</p><h2 id="faq-title">Dúvidas?<br/>Vamos por partes.</h2></div><div className={s.questions}>{questions.map(item => <details key={item.question}><summary>{item.question}<Plus className={s.plus} size={20} aria-hidden/><Minus className={s.minus} size={20} aria-hidden/></summary><p>{item.answer}</p></details>)}</div></div></section>

      <section className={s.finalCta} aria-labelledby="start-title"><div className={s.container}><div className={s.finalCtaCopy}><p className={s.kicker}>SEU PRÓXIMO PASSO COMEÇA AQUI<span aria-hidden/></p><h2 id="start-title">Coloque sua rotina<br/><em>em movimento.</em></h2><ul className={s.finalBenefits}><li><Zap size={28} aria-hidden/>Organize seus treinos</li><li><ChartNoAxesColumnIncreasing size={28} aria-hidden/>Acompanhe a evolução</li><li><Target size={28} aria-hidden/>Conecte sua rotina</li></ul><Action href="/cadastro">Criar minha conta</Action><p className={s.finalTerms}><ShieldCheck size={23} aria-hidden/>{proPlan.trialDays} dias de teste<span aria-hidden>·</span>Cartão obrigatório</p></div></div></section>
    </main>
    <footer className={s.footer}><svg className={s.footerNoise} aria-hidden="true" width="100%" height="100%"><filter id="footer-noise"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#footer-noise)"/></svg><div className={s.container}><div className={s.footerTop}><div className={s.footerIntro}><Link href="/" aria-label="FormFisik, início"><Brand/></Link><p>Performance, evolução e estilo de vida.<br/>Para quem vive o movimento.</p></div><nav aria-label="Plataforma"><h3>Plataforma</h3><a href="#plataforma">Conheça o sistema</a><a href="#profissionais">Plano profissional</a><Link href="/login">Entrar na minha conta</Link><a href="#duvidas">Dúvidas frequentes</a></nav><nav aria-label="Universo FormFisik"><h3>Universo FormFisik</h3><a href="#wear">Wear <span>Em breve</span></a><a href="#studio">Studio <span>Em breve</span></a><a href="#sobre">Nossa história</a></nav><div className={s.footerStatement}>FEITO DE<br/><em>MOVIMENTO.</em></div></div><div className={s.footerDivider}><span aria-hidden/><Link href="/" aria-label="FormFisik, voltar ao início"><Brand/></Link><span aria-hidden/></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} FormFisik. Todos os direitos reservados.</span><span>Do Rio de Janeiro, Brasil. <ArrowUpRight size={16} aria-hidden/></span></div></div></footer>
  </div>
}
