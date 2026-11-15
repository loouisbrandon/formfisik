'use client'
import {useState} from 'react'
import Link from 'next/link'
import {Archive,UsersRound,ClipboardList,Plus,UserRoundPlus,Download,Search,ArrowUpRight,ChevronLeft,ChevronRight,List,LayoutGrid} from 'lucide-react'
import type {StudentList,StudentQuery} from './schema'
import styles from './portfolio.module.css'
const date=(v:string)=>new Date(v).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})
type Props={list:StudentList|null;loading:boolean;busy:boolean;filters:StudentQuery;setFilters:(q:StudentQuery)=>void;applied:StudentQuery;apply:(q:StudentQuery)=>void;download:()=>void}
export function StudentPortfolio({list,loading,busy,filters,setFilters,applied,apply,download}:Props){
 const [grid,setGrid]=useState(false)
 const stats=[{label:'alunos ativos',value:list?.summary?.active,Icon:UsersRound},{label:'arquivados',value:list?.summary?.archived,Icon:Archive},{label:'sem avaliação nos últimos 30 dias',value:list?.summary?.withoutRecentAssessment,Icon:ClipboardList}]
 return <>
  <div className={styles.actions}><Link href="/anamneses" className={styles.outline}><UserRoundPlus aria-hidden="true"/>Convidar aluno</Link><Link href="/alunos/novo" className={styles.primary}><Plus aria-hidden="true"/>Cadastrar aluno</Link><button className={styles.outline} disabled={busy||loading||!list} onClick={download} aria-label="Exportar filtros em PDF" title="Exportar filtros em PDF"><Download aria-hidden="true"/></button></div>
  <section className={styles.stats} aria-label="Resumo da carteira completa">{stats.map(({label,value,Icon})=><article key={label}><span className={styles.statIcon}><Icon aria-hidden="true"/></span><div><strong>{loading?'—':value??'—'}</strong><p>{label}</p></div></article>)}</section>
  <section className={styles.panel} aria-label="Carteira de alunos"><div className={styles.panelHeading}><h2>Carteira de alunos</h2><span>{loading?'Consultando…':`${list?.total??0} ${list?.total===1?'registro':'registros'}`}</span></div>
   <form className={styles.filters} onSubmit={e=>{e.preventDefault();apply({...filters,page:1})}}>
    <label className={styles.search}><span>Pesquisar por nome</span><div><Search aria-hidden="true"/><input value={filters.q} maxLength={120} placeholder="Buscar por nome…" onChange={e=>setFilters({...filters,q:e.target.value})}/></div></label>
    <label><span>Situação</span><select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value as StudentQuery['status']})}><option value="all">Todos</option><option value="active">Ativos</option><option value="archived">Arquivados</option></select></label>
    <label><span>Ordenar por</span><select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value as StudentQuery['sort']})}><option value="name_asc">Nome A–Z</option><option value="name_desc">Nome Z–A</option><option value="newest">Mais recentes</option><option value="oldest">Mais antigos</option></select></label>
    <button className={styles.outline} disabled={loading}>Aplicar filtros</button><button type="button" className={styles.clear} disabled={loading} onClick={()=>{const q:StudentQuery={q:'',status:'active',sort:'name_asc',page:1};setFilters(q);apply(q)}}>Limpar filtros</button>
    <div className={styles.views} aria-label="Apresentação da carteira"><button type="button" aria-label="Visualização em lista" aria-pressed={!grid} onClick={()=>setGrid(false)}><List aria-hidden="true"/></button><button type="button" aria-label="Visualização em cards" aria-pressed={grid} onClick={()=>setGrid(true)}><LayoutGrid aria-hidden="true"/></button></div>
   </form>
   {list&&!loading&&<><div className={grid?styles.cards:styles.table}>
    {!grid&&<div className={styles.tableHead} aria-hidden="true"><span>Aluno</span><span>Situação</span><span>Cadastro</span><span>Atualização cadastral</span><span>Ações</span></div>}
    {!list.items.length?<div className={styles.empty}><UsersRound aria-hidden="true"/><h3>Nenhum aluno encontrado</h3><p>Cadastre seu primeiro aluno ou ajuste os filtros da pesquisa.</p></div>:<ul aria-label="Alunos encontrados">{list.items.map(item=><li key={item.id}>
     <div className={styles.person}><span className={styles.avatar} aria-hidden="true">{item.fullName.split(/\s+/).slice(0,2).map(s=>s[0]).join('')}</span><Link href={'/alunos/'+item.id}>{item.fullName}</Link></div>
     <div><span className={item.status==='active'?styles.active:styles.archived}>{item.status==='active'?'Ativo':'Arquivado'}</span></div>
     <div className={styles.date}><span>Cadastro</span><time dateTime={item.createdAt}>{date(item.createdAt)}</time></div><div className={styles.date}><span>Atualização cadastral</span><time dateTime={item.updatedAt}>{date(item.updatedAt)}</time></div>
     <Link className={styles.outline} href={'/alunos/'+item.id} aria-label={'Ver perfil de '+item.fullName}>Ver perfil<ArrowUpRight aria-hidden="true"/></Link>
    </li>)}</ul>}
   </div><footer className={styles.footer}><p role="status">{list.items.length?`Exibindo ${(list.page-1)*list.pageSize+1}–${(list.page-1)*list.pageSize+list.items.length} de ${list.total} alunos`:`0 alunos nesta página · ${list.total} registros encontrados`}</p><nav aria-label="Paginação de alunos"><button className={styles.outline} disabled={list.page<=1} onClick={()=>apply({...applied,page:list.page-1})} aria-label="Página anterior"><ChevronLeft aria-hidden="true"/></button><span>Página <strong>{list.page}</strong> de {list.pages}</span><button className={styles.outline} disabled={list.page>=list.pages} onClick={()=>apply({...applied,page:list.page+1})} aria-label="Próxima página"><ChevronRight aria-hidden="true"/></button></nav><p>{list.pageSize} por página</p></footer></>}
  </section>
 </>
}
