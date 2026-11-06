# Inventário de requisições do frontend — 015

Levantamento estático de todos os pontos de fetch e consumidores dos wrappers de API em `src`, acompanhado por medição do build real. Uma linha minificada pode conter múltiplas operações; a classificação abrange cada chamada nessa linha, não representa contagem de rede. Imagens `PrivatePhoto` são recursos nativos autenticados e estão descritas abaixo, mesmo sem fetch explícito.

Nenhuma resposta privada é candidata a cache compartilhado. Preferência de tema é pública/local; dados de usuário permanecem em memória e são descartados na saída/troca de documento. Candidata a reutilização curta: disponibilidade/configuração de armazenamento durante a mesma área; não substituir validação real de cada upload. SSR autoriza navegações e operações; não otimizar eliminando o guard comercial canônico. Falha de mutação não é repetida automaticamente; operações idempotentes possuem chave persistida.

| Fonte | Chamada(s) | Classificação | Decisão / observação |
| --- | --- | --- | --- |
| `src/modules/assessments/api.ts:1` | assessmentApi, fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/area.tsx:23` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/area.tsx:24` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/area.tsx:25` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/chart.tsx:10` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/chart.tsx:11` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/comparison.tsx:11` | assessmentApi | Carregamento sob demanda; consulta oculta excessiva removida | Somente painel aberto/ativo; DTO datas/variações; abort de consulta obsoleta. |
| `src/modules/assessments/detail.tsx:9` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/assessments/editor.tsx:13` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/auth/forgot-password-form.tsx:26` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/auth/login-form.tsx:33` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/auth/logout-button.tsx:13` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/auth/reset-password-form.tsx:22` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/auth/reset-password-form.tsx:55` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/auth/session-status.tsx:16` | fetch | Necessária passiva; consulta inicial redundante removida | Resposta mínima; intervalo/foco; não renova inatividade; AbortController. |
| `src/modules/exercises/area.tsx:13` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/area.tsx:16` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/area.tsx:21` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/area.tsx:30` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/area.tsx:35` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/browser.tsx:6` | exerciseApi, fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Lista paginada com resumo; busca debounce/cancelável; detalhes sob demanda. |
| `src/modules/exercises/browser.tsx:11` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Lista paginada com resumo; busca debounce/cancelável; detalhes sob demanda. |
| `src/modules/exercises/browser.tsx:12` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Lista paginada com resumo; busca debounce/cancelável; detalhes sob demanda. |
| `src/modules/exercises/form.tsx:11` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/form.tsx:12` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/exercises/selector.tsx:9` | exerciseApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/physical-reports/export-area.tsx:23` | documentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/physical-reports/export-area.tsx:24` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/physical-reports/export-area.tsx:25` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/physical-reports/export-area.tsx:29` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/physical-reports/export-area.tsx:30` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/physical-reports/export-area.tsx:31` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/professional/access-monitor.tsx:18` | fetch | Necessária passiva; payload anterior excessivo corrigido | view=access sem contagens; montagem SSR não refaz consulta; entitlement canônico fresco. |
| `src/modules/progress-photos/area.tsx:15` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:18` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:20` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:21` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:30` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:31` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/area.tsx:33` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/calendar.tsx:12` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/calendar.tsx:13` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/calendar.tsx:19` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/compare.tsx:11` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/forms.tsx:11` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/progress-photos/forms.tsx:19` | assessmentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/registration/registration-form.tsx:43` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/registration/verify-email.tsx:21` | fetch | Necessária; autenticação/validação servidor; sem cache | Tokens só no corpo/fragmento; feedback neutro; nenhuma concessão por cliente. |
| `src/modules/students/student-area.tsx:31` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/students/student-area.tsx:42` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/students/student-area.tsx:48` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/students/student-area.tsx:51` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/subscriptions/checkout-status.tsx:16` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Financeiro necessário à decisão; servidor define estado/URLs; retry explícito/abort; nenhum cache permissivo de entitlement. |
| `src/modules/subscriptions/checkout-status.tsx:30` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Financeiro necessário à decisão; servidor define estado/URLs; retry explícito/abort; nenhum cache permissivo de entitlement. |
| `src/modules/subscriptions/subscription-dashboard.tsx:29` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Financeiro necessário à decisão; servidor define estado/URLs; retry explícito/abort; nenhum cache permissivo de entitlement. |
| `src/modules/subscriptions/subscription-dashboard.tsx:48` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Financeiro necessário à decisão; servidor define estado/URLs; retry explícito/abort; nenhum cache permissivo de entitlement. |
| `src/modules/subscriptions/subscription-result.tsx:17` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Financeiro necessário à decisão; servidor define estado/URLs; retry explícito/abort; nenhum cache permissivo de entitlement. |
| `src/modules/workout-documents/export-area.tsx:13` | documentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/workout-documents/export-area.tsx:18` | documentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/workout-documents/export-area.tsx:20` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/workout-documents/export-area.tsx:21` | documentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Configuração/candidatos paginados e geração/download explícitos; reautoriza. Download separado da prévia é deliberado, sem regenerar bytes. |
| `src/modules/workout-documents/pdf-preview.tsx:10` | fetch | Necessária sob demanda; autorizada | Mesmo PDF autenticado, abort/destroy ao desmontar; worker local, sem CDN. |
| `src/modules/workout-documents/presentation-form.tsx:6` | documentApi, fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workout-documents/presentation-form.tsx:9` | documentApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/api.ts:1` | fetch, workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:17` | fetch, workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:19` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:20` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:26` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:31` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:36` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/area.tsx:37` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/editor.tsx:22` | workoutApi | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |
| `src/modules/workouts/students-picker.tsx:7` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Pesquisa paginada 20 resultados, debounce e abort; seleção conservada; sem lista inteira. |
| `src/services/api/client.ts:9` | fetch | Necessária; dependente de autorização; privada/no-store; sem cache compartilhado | Leitura/mutação do módulo; detalhes autorizados novamente e erros tratados na UI. |

## Recursos e navegação implícitos

`src/modules/progress-photos/private-image.tsx`: JPEG privado com `unoptimized`, no-store, retry e zoom somente ao abrir. Não carrega versão ampliada em dialog fechado. `<Link>` pode antecipar RSC de rota; servidor reautoriza sem entregar carteira de terceiros. Imagens/logo e fontes estáticas não incluem dados privados; PDF.js/worker empacotados localmente. Não há analytics de saúde/fotos, SSE ou WebSocket de produto.

## Sobreposição e limites

Busca de exercícios, seletor de alunos, listagem de alunos/treinos, monitoramento e PDF possuem cancelamento quando obsoletos. Outros painéis usam flag de validade para ignorar resposta desmontada e preservam estado progressivo; não se afirma cancelamento de toda mutação já enviada. Isso é deliberado: o servidor pode ter concluído uma escrita e a UI precisa permitir reconciliação/reenvio idempotente. Nova navegação/logout usa documento completo; nenhum cache privado global ou Web Storage de resultados foi introduzido.

A comparação de medidas e escolhas de comparação fotográfica só consultam quando ativas; listas clínicas/fotográficas retornam resumos. Contexto de aluno usa `view=identity`; ficha administrativa completa é obtida somente em sua tela. Valores comparativos e gráficos continuam reais, sem omitir medições para reduzir payload. Candidatos de exportação são paginados e os bytes só chegam mediante consulta explícita.

Medições antes/depois e variação de prefetch/foco estão no relatório 015. Otimizações remanescentes de disponibilidade/queries SQL devem ser guiadas por volume e latência reais em staging, sem refazer telas indiscriminadamente.

## Requisições017

Anamneses: uma lista paginada por painel/filtro/página, cancelada na mudança; detalhes/versões completos somente por clique. Perfil do aluno adiciona uma consulta de resumo mínimo, sem respostas; histórico só na subárea própria. Público: umPOSTopen por link e umPOSTsubmit, retries somente por ação/erro, sempolling/persistência de rascunho. Frontend não consulta endpoints para simular autorização: SSR e cada operação mantêm guards. Leituras entre etapas públicas são locais, não geramrequests. Medições atuais no relatório017, sem reutilizar métricas015/016 como se fossem desta execução.

## Agenda021

`agendaApi` usa no-store e AbortController para leituras obsoletas. Configuração consultada na entrada/atualização; resumo agregado e lista20 apenas no período selecionado; detalhe e histórico sob demanda. Candidatos de aluno/tipo/contrato/obrigação paginados20, pesquisa com cancelamento. Preview limitada100, sem carregar carteira integral. Medições sintéticas Chrome em `test-results/021/api-measurements.json`; não representam SLA nem teste de carga. Sem requisições a Google/iCloud/Outlook ou Connect externo. Todas as leituras preservam autorização no servidor.

No mesmo cenário completo sintético021, estabilizar as dependências do detalhe durante mudança de viewport reduziu leituras de detalhe20→8 e total91→79; bytes da API agenda57797→43891. Autorizações inalteradas. Evidência `test-results/021/request-comparison.json`; contagens incluem o fluxo de criação por teclado e não são promessa de produção.

## Check-ins022

Resumo mínimo no perfil; listas20 e detalhes/correções/devolutivas sob demanda. Pesquisa/leituras substituídas abortadas; indicadores agregados e série limitada por período/pergunta/versão,100 por página. Nenhuma resposta no CRM. Fluxo público usa POST sem cookies e memória apenas. Medições do navegador em test-results/022/production/checkin-api-measurements.json, quando verificado; não representa SLA.

## Comunicação024

Uma consulta paginada por área ativa; detalhes só na seleção. Busca com debounce e AbortController; modelos/contextos opcionais não consultam enquanto fechados, seleção obsoleta cancelada. Atualização explícita, sem polling/notificações externas novos; contagens via agregação SQL. Paginação20, corpo32KiB, registro só após prévia e confirmação, chave preservada em retry. Medições do percurso, limites do ensaio e canários no relatório024.
