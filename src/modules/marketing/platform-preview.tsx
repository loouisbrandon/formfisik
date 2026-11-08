'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, CalendarCheck, Dumbbell, Play, UserRound, X } from 'lucide-react'
import s from './landing.module.css'

const views = [
  { id: 'alunos', image: 'platform-students', alt: 'Tela de Alunos da FormFisik, com indicadores, filtros e carteira de alunos.', title: 'Alunos', label: 'Gestão de alunos', summary: 'Cadastro, anamnese e histórico completo.', icon: UserRound, heading: 'Conheça cada aluno. Acompanhe cada etapa.', description: 'Cadastro, anamnese, avaliações e histórico reunidos no perfil. Encontre as informações que você precisa para dar o próximo passo.' },
  { id: 'treinos', image: 'platform-workouts', alt: 'Tela de Treinos da FormFisik, com fichas de alunos, modelos e filtros de planejamento.', title: 'Treinos', label: 'Treinos inteligentes', summary: 'Criação, periodização e evolução.', icon: Dumbbell, heading: 'Prescreva com organização. Ajuste com contexto.', description: 'Monte fichas individuais, organize divisões e reutilize seus modelos. Cada aluno mantém sua própria prescrição e histórico.' },
  { id: 'agenda', image: 'platform-agenda', alt: 'Agenda semanal da FormFisik, com calendário, disponibilidade e horários de atendimento.', title: 'Agenda', label: 'Agenda e atendimentos', summary: 'Organize consultas, revisões e rotinas.', icon: CalendarCheck, heading: 'Veja seu dia antes de ele começar.', description: 'Organize atendimentos, avaliações e horários disponíveis. Consulte o aluno e o compromisso no mesmo fluxo.' },
] as const

export function PlatformPreview() {
  const [selected, setSelected] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const view = views[selected]
  const dialog = useRef<HTMLDialogElement>(null)
  const enlarge = useRef<HTMLButtonElement | null>(null)
  const scenery = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = scenery.current
    if (!element) return
    const observer = new ResizeObserver(entries => {
      element.style.setProperty('--scene-scale', String(entries[0].contentRect.width / 1919))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  function openPreview(button: HTMLButtonElement) { enlarge.current = button; dialog.current?.showModal() }
  function closePreview() { dialog.current?.close(); enlarge.current?.focus() }
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % views.length : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + views.length - 1) % views.length : event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : null
    if (next !== null) { event.preventDefault(); setSelected(next); buttons.current[next]?.focus() }
  }
  return <div className={s.productShowcase}>
    <div className={s.previewSidebar}>
      <div className={s.previewTabs} role="tablist" aria-label="Explorar a plataforma" aria-orientation="vertical">
        {views.map((item, index) => <button key={item.id} ref={element => { buttons.current[index] = element }} type="button" role="tab" aria-label={item.title} id={`preview-tab-${item.id}`} aria-controls={`preview-panel-${item.id}`} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => onKeyDown(event, index)}><span className={s.featureIcon}><item.icon size={30} aria-hidden/></span><span><strong>{item.label}</strong><small>{item.summary}</small></span></button>)}
      </div>
      <div className={s.previewExplanation} id="platform-preview-description" aria-live="polite"><div><span className={s.platformEyebrow}>NA PRÁTICA / 0{selected + 1}</span><h3>{view.heading}</h3></div><p>{view.description}</p></div>
      <div className={s.platformActions}><a href="#profissionais" className={s.platformCta}>Conhecer o plano <ArrowRight size={21} aria-hidden/></a><button type="button" onClick={event => openPreview(event.currentTarget)}><span><Play size={15} fill="currentColor" aria-hidden/></span>Ver a plataforma</button></div>
    </div>
    <div role="tabpanel" id={`preview-panel-${view.id}`} aria-labelledby={`preview-tab-${view.id}`} aria-describedby="platform-preview-description" tabIndex={0} className={s.previewPanel}>
      <div className={s.platformScenery} ref={scenery}>
        <div className={s.sceneCanvas}>
          <Image src="/images/marketing/platform-laptop-scene.png" alt="" width={1919} height={820} sizes="(max-width: 1000px) 160vw, 100vw" className={s.scenePhoto}/>
          <div className={s.platformScreen}><Image key={view.image} src={`/images/marketing/${view.image}.png`} alt={view.alt} width={1920} height={1047} sizes="(max-width: 1000px) 85vw, 60vw"/></div>
        </div>
      </div>
    </div>
    <dialog ref={dialog} className={s.previewDialog} aria-labelledby="preview-dialog-title" onCancel={event => { event.preventDefault(); closePreview() }}>
      <div className={s.previewDialogHeader}><h3 id="preview-dialog-title">Tela de {view.title}</h3><button type="button" aria-label="Fechar imagem ampliada" onClick={closePreview}><X size={22} aria-hidden/></button></div>
      <Image src={`/images/marketing/${view.image}.png`} alt={view.alt} width={1920} height={1047} sizes="100vw"/>
    </dialog>
  </div>
}
