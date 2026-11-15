// Vocabulary taken from the pinned PT-BR JSON. Labels normalize orthography only.
export const categories=['forca','alongamento','pliometria','strongman','powerlifting','cardio','levantamento-olimpico'] as const
export const muscles=['abdominais','isquiotibiais','panturrilhas','ombros','adutores','gluteos','quadriceps','biceps','antebracos','abdutores','triceps','peito','inferior-das-costas','trapezio','meio-das-costas','dorsais','pescoco'] as const
export const equipment=['peso-do-corpo','maquina','outros','rolo-de-espuma','kettlebell','halteres','cabo','barra','faixas','bola-medicinal','bola-de-exercicio','barra-w'] as const
export const levels=['iniciante','intermediario','avancado'] as const
const labels:Record<string,string>={forca:'Força',gluteos:'Glúteos',quadriceps:'Quadríceps',biceps:'Bíceps',triceps:'Tríceps',antebracos:'Antebraços',trapezio:'Trapézio',pescoco:'Pescoço',maquina:'Máquina',intermediario:'Intermediário',avancado:'Avançado','levantamento-olimpico':'Levantamento olímpico'}
export const exerciseLabel=(value:string|null)=>value?(labels[value]??value.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase())):'Não informado'
export const requestLabels={pending:'Pendente',approved:'Aprovada',linked_existing:'Vinculada a existente',rejected:'Rejeitada'} as const
export function foldExercise(value:string){return value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim().replace(/\s+/g,' ')}
