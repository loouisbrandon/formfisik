import type {ReactNode} from 'react'
import {Dumbbell,ShieldCheck,LockKeyhole,Layers3,ChartNoAxesColumn,Target,BookOpen,Info,Video} from 'lucide-react'
import type {Exercise} from './schema'
import {exerciseLabel} from './taxonomy'
import styles from './library.module.css'

export function ExerciseDetails({exercise:e,demonstrations,actions}:{exercise:Exercise;demonstrations?:ReactNode;actions?:ReactNode}) {
 const official=e.scope==='official'
 return <article className={styles.detailView}>
  <header className={styles.detailHero}>
   <span className={styles.detailArtwork} aria-hidden><Dumbbell/></span>
   <div className={styles.detailTitle}><div className={styles.detailBadges}><span>{official?<ShieldCheck size={14}/>:<LockKeyhole size={14}/>} {official?'Catálogo oficial':'Exercício particular'}</span>{e.state==='archived'&&<span>Arquivado</span>}<small>Versão {e.version}</small></div><h2>{e.name}</h2><p>{e.primaryMuscles.map(exerciseLabel).join(' · ')}<span aria-hidden> / </span>{exerciseLabel(e.category)}</p></div>
  </header>
  <dl className={styles.detailMetrics}>{([[Layers3,'Categoria',exerciseLabel(e.category)],[Dumbbell,'Equipamento',exerciseLabel(e.equipment)],[ChartNoAxesColumn,'Nível',exerciseLabel(e.level)]] as const).map(([Icon,label,value])=><div key={label}><Icon size={20} aria-hidden/><div><dt>{label}</dt><dd>{value}</dd></div></div>)}</dl>
  <div className={styles.detailColumns}>
   <div className={styles.detailMain}>
    <section className={styles.detailPanel}><header><span><BookOpen size={20} aria-hidden/></span><div><h3>Como executar</h3><p>Instruções cadastradas para este movimento.</p></div>{e.instructions.length>0&&<small>{e.instructions.length} etapas</small>}</header>{e.instructions.length?<ol className={styles.detailSteps}>{e.instructions.map((step,i)=><li key={i}><span aria-hidden>{String(i+1).padStart(2,'0')}</span><p>{step}</p></li>)}</ol>:<div className={styles.detailMissing}>Nenhuma instrução cadastrada para este exercício.</div>}</section>
    {demonstrations&&<section className={styles.detailPanel}><header><span><Video size={20} aria-hidden/></span><div><h3>Demonstrações</h3><p>Vídeos e referências associados ao exercício.</p></div></header><div className={styles.detailMedia}>{demonstrations}</div></section>}
   </div>
   <aside className={styles.detailAside}>
    <section className={styles.detailPanel}><header><span><Target size={20} aria-hidden/></span><div><h3>Grupos musculares</h3><p>Participação no movimento.</p></div></header><dl className={styles.detailMuscles}><div><dt>Principais</dt><dd>{e.primaryMuscles.map(m=><span key={m} data-primary>{exerciseLabel(m)}</span>)}</dd></div><div><dt>Secundários</dt><dd>{e.secondaryMuscles.length?e.secondaryMuscles.map(m=><span key={m}>{exerciseLabel(m)}</span>):<p>Não informado</p>}</dd></div></dl></section>
    <section className={styles.detailPanel}><div className={styles.detailAliases}><h3>Nomes alternativos</h3>{e.aliases.length?<ul>{e.aliases.map(a=><li key={a}>{a}</li>)}</ul>:<p>Não informado</p>}</div></section>
    {e.source.dataset&&<section className={styles.detailProvenance}><Info size={18} aria-hidden/><div><strong>Conteúdo importado</strong><p>Descrições e classificações aguardam revisão técnica profissional antes do lançamento comercial.</p><details><summary>Consultar origem e licença</summary><dl>{[['Fonte',e.source.dataset],['Referência',e.source.sourceId],['Licença',e.source.license],['Revisão',e.source.revision]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v||'Não informado'}</dd></div>)}</dl></details></div></section>}
    {e.qualityFlags.length>0&&<section className={styles.detailProvenance}><Info size={18} aria-hidden/><div><strong>Dados sinalizados para revisão</strong><ul>{e.qualityFlags.map(f=><li key={f}>{{equipment_not_informed:'Equipamento não informado',name_not_translated:'Nome ainda não traduzido',similar_name_requires_review:'Nome semelhante a outro movimento'}[f]??f}</li>)}</ul></div></section>}
   </aside>
  </div>
  {actions&&<footer className={styles.detailActions}>{actions}</footer>}
 </article>
}
