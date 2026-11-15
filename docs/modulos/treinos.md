# Prescrição profissional de treinos — 010

A FormFisik é empresa independente, fundada por Brandon Louis. O módulo web reutiliza identidade/sessões, assinatura, alunos privados e catálogo da plataforma. Não pressupõe constituição jurídica formalizada, compartilhamento de infraestrutura ou propriedade intelectual com outra empresa.

## Fluxo e estados

`/treinos` lista fichas individuais e modelos privados, com pesquisa por nome sem distinção de acentos/caixa, tipo, estado, aluno, ordenação e páginas SQL de 20. Criação oferece “para um aluno” e “modelo”. `/treinos/novo`, `/treinos/:id`, `/treinos/:id/editar` e `/treinos/:id/aplicar` reutilizam guard e shell profissionais.

Individual pertence a um vínculo real da carteira, não a e-mail ou identidade global do aluno. Tipo e aluno não são transferíveis por edição. Modelo não exige aluno nem datas. Ambos usam o mesmo editor e documento canônico. Nome obrigatório; objetivo exigido para ativar; observações e datas individuais opcionais. Datas devem ser reais e término não anterior ao início. Não há recomendações clínicas, avaliações ou parâmetros automáticos.

| Estado | Semântica |
| --- | --- |
| draft | Rascunho, inclusive incompleto; nunca prescrição final automática |
| active | Versão explicitamente marcada como pronta; exige objetivo, divisões, exercícios e séries com repetições/tempo preenchidos |
| archived | Consulta/histórico preservados; edição bloqueada; reabrir somente como draft |

Há no máximo uma ficha individual ativa por aluno/profissional, com índice único parcial e validação transacional. Ativar outra exige arquivar ou retornar a anterior a rascunho; nada é substituído silenciosamente. Salvar uma ficha ativa publica explicitamente uma nova versão ativa, sempre completa; versões anteriores permanecem consultáveis. Modelos ativos significam prontos para aplicação, sem relação com assinatura financeira ou execução por aluno.

Arquivo administrativo do aluno não reescreve sua prescrição: histórico continua legível, mas novas criações/edições/duplicações/ativações/aplicações exigem vínculo ativo. É possível arquivar uma ficha cujo aluno/exercício foi arquivado, preservando o registro. Retorno a rascunho não ativa nem concede acesso a aluno. Não existe login ou execução de treino pelo aluno.

## Editor e organização

Até 30 divisões, sem limite rígido de cinco. Cada divisão tem UUID estável, nome, descrição, observações, exercícios e grupos ordenados. Arrays canônicos determinam ordem persistida; botões explícitos permitem subir/descer, duplicar/remover divisão, duplicar/remover exercício e mover/copiar entre divisões. Duplicar cria identidades novas; mover preserva a identidade da ocorrência. Remoções e movimentos que desfazem grupos exigem confirmação; grupos dependentes são removidos, sem deixar relações inválidas.

Somente a divisão escolhida é editada. Parâmetros ficam em painéis expansíveis, sem outra página por exercício. Metadados gerais são recolhíveis; barra de salvamento distingue alterações locais e versão persistida. Dados são salvos explicitamente no PostgreSQL; não há autosave ou armazenamento do conteúdo em localStorage/sessionStorage. Antes de sair por link, histórico do navegador ou descarregar a página, há proteção de alterações não salvas. Fechamento forçado/crash não oferece recuperação offline.

O seletor **ExerciseSelector da 009** é reutilizado integralmente: filtros, checkboxes, seleção entre páginas, confirmação no servidor e foco. Escolhas já presentes na divisão não são adicionadas novamente pelo seletor; repetição intencional usa Duplicar exercício. Ocorrências diferentes podem referenciar o mesmo exercício canônico com parâmetros distintos.

## Séries, cargas e técnicas

Cada ocorrência referencia UUID e versão do catálogo; possui UUID próprio, notas, técnica individual e linhas de séries/etapas com UUID próprio. Nenhuma carga, repetição ou descanso técnico é sugerido automaticamente. Ao adicionar série, seus valores começam vazios; é possível duplicar uma linha definida pelo profissional e ajustar individualmente.

Repetição é união estruturada:

- `reps`: quantidade e indicador por lado;
- `range`: mínimo/máximo e indicador por lado;
- `failure`: até a falha, sem número fictício;
- `duration`: segundos por série/etapa.

Cada linha tem carga opcional decimal, unidade `kg/lb/percent/bodyweight`, descanso opcional em segundos, tempo de execução opcional, fase e notas. Percentual é informado/interpretado pelo profissional, sem cálculo de 1RM ou referência inferida. Pirâmides são linhas ordenadas com repetições/cargas distintas. Repetições por lado não alteram automaticamente quantidade/volume.

Técnicas individuais: `standard`, `drop_set`, `rest_pause`. Fase `work` inicia uma série; fases `drop` e `rest_pause` representam continuação da série anterior. A primeira etapa deve ser normal. Drop-set exige pelo menos duas etapas, uma redução e não admite fase rest-pause; rest-pause exige retomada e não admite drop. Convencional só admite fases normais. Interface diferencia número de séries e etapas; não inventa redução percentual, tempos, execução ou sincronização.

Grupos estruturados: `bi_set`/`superset` com 2 ocorrências, `tri_set` com 3, `circuit` com 2 ou mais. Cada grupo tem UUID, membros por UUID de ocorrência em sequência explícita, descanso entre voltas opcional e notas. Membros devem pertencer à mesma divisão, sem repetição e sem participar de dois grupos. A ordem de seleção define a sequência do grupo; a lista geral preserva sua ordem própria. Reordenar a lista não reescreve silenciosamente o grupo. Para mudar composição/sequência, remover e recriar o grupo, preservando exercícios.

Grupos descrevem relação e ordem, não são um motor de execução: não igualam automaticamente número de séries, não geram voltas nem monitoram desempenho. O profissional define as séries de cada membro e orientações necessárias. Técnicas avançadas são informações da prescrição, não recomendações automáticas.

Limites de proteção: 300 ocorrências e 1000 linhas por planejamento, até 100 ocorrências por divisão e 50 linhas por ocorrência; corpo HTTP de criação/edição até 512 KiB. Nome 160, objetivo 1000, notas gerais 3000, nome de divisão 120, descrição/notas de divisão 1000, notas de ocorrência 1000 e de série/grupo 500 caracteres. Repetições 1–1000, tempos até 86400 s e carga 0–100000. Rascunhos admitem valores técnicos nulos; ativação exige repetições/tempo definidos. Campos desconhecidos e identidades internas repetidas são rejeitados.

## Persistência e versões

Migrations aditivas `009_workout_prescriptions.sql` e `010_workout_copy_origin.sql`; nenhuma migration anterior foi modificada.

| Tabela | Fonte e finalidade |
| --- | --- |
| workout_plans | Cabeçalho atual por proprietário, tipo, aluno, estado, versão, nome/chave de busca, documento estruturado, origem e datas |
| workout_versions | Snapshot canônico completo por `(plan_id,version)`, estado, identidade mínima do profissional/aluno, origem, ator, operação e data |
| workout_exercise_references | Projeção transacional de cada ocorrência por plano/versão/divisão; FK real para `(exercise_id,exercise_version)` da 009 |
| workout_operation_keys | Idempotência por proprietário/UUID, digest e IDs resultantes; sem segredo ou credencial |

JSONB é um documento tipado, com campos numéricos/enums e relações estruturadas; exercícios não são nomes soltos. Não há segunda estrutura independente para PDF. O snapshot é preservado pelo fluxo de aplicação, somente inserido; alterações incrementam versão e nunca atualizam snapshots anteriores. A projeção relacional é gravada na mesma transação e assegura FK a revisões reais. FKs compostas ligam proprietário, aluno, plano e versão; origem de modelo aponta para versão específica.

Writes usam lock transacional por profissional, bloqueio da ficha e comparação de versão. Associações ao aluno são bloqueadas para leitura enquanto validações/escrita ocorrem. Referências do catálogo também são bloqueadas durante validação, protegendo corrida com edição/arquivo. Operações concorrentes não sobrescrevem silenciosamente dados. Um conflito exige recarregar, com confirmação de descarte local.

Novas referências exigem exercício oficial publicado ou particular ativo do próprio profissional e versão atual. Ao editar/duplicar/aplicar um documento já prescrito, suas revisões anteriores podem ser preservadas exatamente, desde que o exercício permaneça disponível e autorizado. Não se pode forjar outra revisão histórica que não pertença ao documento de origem. Metadados exibidos vêm de `exercise_versions`; mudar nome/instruções do catálogo não reescreve ficha. Após arquivo de exercício, histórico continua consultável, mas uma nova gravação/ativação/aplicação exige substituir a referência indisponível. Arquivo da ficha continua possível.

Histórico paginado de 20 versões, com acesso autenticado a uma revisão específica. A identidade mínima (nome/ID de vínculo e nome do profissional) é registrada por versão para futura exportação fiel; não copia contato, nascimento ou notas administrativas da carteira. Leitura histórica é somente consulta, com ações de mutação reservadas à versão corrente. Retenção/eliminação organizacional de prescrições e snapshots precisa de política própria; arquivar não elimina dados nem constitui prazo de retenção universal.

## Integrações e próxima entrega

Perfil do aluno consulta fichas reais, identifica estado ativo, abre versões correntes, inicia criação com vínculo preselecionado e oferece aplicação de modelo com aluno preselecionado. Dashboard consulta duas contagens adicionais reais por proprietário: fichas individuais ativas e modelos não arquivados, sem inventar atividades ou execução.

A 011 poderá usar exatamente o snapshot canônico: profissional/aluno, nome/objetivo, divisões/ordem, séries, repetições, cargas/unidades, descanso, tempo, técnicas, observações, datas, estado e versão. Não existe gerador final de PDF ou link de exportação fictício nesta entrega.

Ver [modelos e aplicação em lote](modelos-de-treinamento.md), [API](../engenharia/api-treinos.md), [ADR-010](../arquitetura/ADR-010-prescricoes-versionadas.md), [Design System](../design/DESIGN_SYSTEM.md) e [relatório 010](../engenharia/entrega-010.md).

A origem de duplicação também registra a versão específica por FK (`copied_from_version`). A migration 010 é aditiva e não inventa revisão de origem para eventual cópia preexistente; novas cópias sempre registram ID e versão. Snapshots anteriores continuam preservados.

## Exportação — 011

Exportar PDF nas fichas individuais atuais/históricas e seção do aluno, com configuração, Compacta/Premium, personalização e prévia real. Fonte são os snapshots existentes. [Módulo de exportação](exportacao-treinos.md). Referências à exportação futura acima descrevem o escopo original da 010.

## Demonstrações prescritas023

Itens aceitam demos opcionais com vídeo/revisão e ordem. Validação confere associação autorizada ao exercício, pronto/ativo para nova seleção; referências anteriores podem sobreviver a arquivo/remoção da associação. Snapshot eFK preservam versão; reprodução revalida revogação atual. Modelos/cópias usam o mesmo domínio. [Demonstrações](demonstracoes.md).

## Feedback declarado022

Check-in pode referenciar exatamente uma revisão histórica ativa da ficha individual e divisão daquela revisão. Alterar prescrição não reescreve o relato. Realização é declaração pelo convite, sem comprovação automática, execução série a série, atualização de carga/treino ou cumprimento019. Mídia023 não é exposta pelo convite de feedback.

## Refinamento visual — 05/11/2026

Listagem, criação, edição, consulta, aplicação e histórico seguem o shell noturno compartilhado. Novos estilos em workouts.module.css; area.tsx oferece abas e lista/cards, editor.tsx adiciona resumo derivado do documento local e prévia em dialog utilizando WorkoutView. Consulta/histórico recebem os mesmos cards e tipografia. Séries, técnicas, agrupamentos, biblioteca, demonstrações, confirmações e contratos de gravação preservados. Contagem do resumo em edição representa séries/etapas registradas; não estima volume ou cumprimento de treino. Conferência visual não substitui activationIssue no servidor. Prévia não persiste nem publica alterações.

GET /api/workouts acrescenta summary:{active,drafts,templates}: fichas individuais ativas, todos os rascunhos e modelos não arquivados. Consulta agregada privada por owner_id, independente de busca/tipo/estado, respeitando studentId quando fornecido. Resumo e página são leituras separadas, sujeitas a diferenças durante alterações concorrentes. Nenhum dado clínico novo, migration, biblioteca ou serviço externo. Busca continua por nome do planejamento, paginação SQL20; não simular busca por aluno nem dias da semana, não existentes no contrato atual.

Validação: jornada Chrome real com PostgreSQL e gateway controlado em banco auxiliar isolado, incluindo criação de modelo, biblioteca multisseleção, séries, ordenação, edição, prévia local, ativação, aplicação em lote, edição independente, histórico, arquivar/reabrir/duplicar, ficha pelo perfil, seleção prévia, proteção de alterações e erro/retry. Axe em1440/768/320px nos estados da jornada e texto200% sem overflow externo. Evidências em test-results/010/browser (artefatos locais ignorados). Não executado novo build de produção nesta alteração; nenhum deploy. Ambiente local usa Webpack e assinatura explicitamente simulada para testes.

Resultado final dos testes desta alteração:15/15 testes automatizados de treinos aprovados (incluindo resumo isolado por proprietário e aluno), TypeScript e ESLint dos arquivos alterados aprovados. Jornada E2E concluída com sucesso.
