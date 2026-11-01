# Entrega 010 — Prescrição profissional e modelos reutilizáveis

## Resultado funcional

Área `/treinos` integrada ao shell profissional com criação individual/modelo, pesquisa/filtros/paginação, editor central, divisões ordenadas, seletor múltiplo da 009, séries individuais e técnicas estruturadas. Consulta/edição/duplicação/arquivo/reabertura, ativação explícita e histórico real de versões. Modelos ativos podem gerar fichas independentes para vários alunos em transação atômica, com confirmação e idempotência.

Perfil do aluno consulta fichas reais e inicia criação/aplicação com vínculo preselecionado. Dashboard acrescenta indicadores persistidos de fichas ativas e modelos não arquivados. Nenhum dado fictício ou recomendação técnica é inserido em runtime.

A FormFisik permanece empresa independente fundada por Brandon Louis, sem presumir formalização jurídica ou compartilhamento societário/operacional. Não houve deploy, commit, mudança de credenciais, recurso financeiro externo, aplicativo mobile ou conta de aluno.

## Fluxos e decisões

- Criação sempre em rascunho, inclusive modelos completos. Rascunho não é prescrição final.
- Ativação exige objetivo, divisões/exercícios/séries e repetições/tempo definidos. No máximo uma ficha individual ativa por aluno; nenhuma anterior é arquivada silenciosamente.
- Editor usa divisões e ocorrências com UUIDs estáveis, arrays ordenados, controles explícitos por teclado, parâmetros inline e áreas recolhíveis. Não depende de drag-and-drop ou armazenamento local. Remoções e saída com alterações exigem confirmação.
- Séries são linhas individuais: quantidade/faixa/falha/tempo, por lado, carga/unidade, descanso, execução e notas. Valores novos começam vazios. Pirâmides mantêm valores distintos; drop-set/rest-pause usam fases estruturadas; bi-set/tri-set/superset/circuito mantêm membros por ID e sequência.
- Cada gravação relevante/transição gera snapshot de documento, estado, identidade mínima, origem, ator e data. Concorrência usa locks e versão otimista. Revisões anteriores não são reescritas.
- Exercícios são referências canônicas à versão da 009, com FK relacional. Metadados vêm da revisão referenciada; alterar catálogo não muda fichas antigas. Novas gravações exigem disponibilidade/propriedade; arquivo do exercício não impede leitura histórica ou arquivo da ficha.
- Aplicação de modelo a 1–50 alunos próprios ativos é atômica. Cópias têm UUIDs internos distintos e grupos remapeados; cada ficha nasce em rascunho, vinculada à revisão de origem. Editar modelo/ficha não propaga mudanças.
- Falha em qualquer aluno/escrita reverte o lote inteiro e a tentativa. Reenvio da mesma chave/conteúdo recupera os mesmos IDs; outra intenção com a mesma chave retorna conflito. Resultado é resumido por aluno.

## Módulos, arquivos e contratos

| Grupo | Arquivos e responsabilidade |
| --- | --- |
| Dados | `db/migrations/009_workout_prescriptions.sql` e `010_workout_copy_origin.sql`: planos, versões, referências e idempotência, FKs de proprietário/origem e índice parcial de uma ficha ativa |
| Domínio | `src/modules/workouts/schema.ts`: documento, séries, técnicas, limites, estados, cópia de identidades e critérios de ativação |
| Servidor | `src/server/workouts/{repository,handlers}.ts`: transações, consultas SQL, snapshots, cópia/aplicação, autorização e tratamento seguro |
| Rotas | `src/app/api/workouts/**/route.ts`, `src/app/(app)/treinos/**`: API e páginas protegidas, loading/erro |
| Interface | `src/modules/workouts/{area,editor,sets-editor,students-picker,view,page}.tsx`, `api.ts`: editor central, lista, ficha, histórico, seleção de alunos e prévia de aplicação |
| Integrações | Navegação/Sidebar, StudentArea, professional-dashboard e dashboard-content; limite interno opcional no helper JSON, sem mudar padrão de rotas anteriores |
| Testes | `tests/workouts.test.ts`, `tests/workouts-e2e.ts`, `tests/helpers/workouts-browser-server.ts`; regressões atualizadas de navegação, dashboard, alunos e rotas privadas |
| Documentação | Treinos, modelos, API, ADR-010, Design System, roadmap, dashboard/alunos, README, CHANGELOG e este relatório |

Reutilizados sessões opacas/HttpOnly, guard comercial, PostgreSQL/migrator, schemas Zod, utilitários HTTP/CSRF/limites, shell, notice, monitor de acesso, alunos e **ExerciseSelector da 009**. Sem novas dependências ou serviço externo.

Endpoints: GET/POST `/api/workouts`; GET/PUT `/:id`; GET `/:id/history`; POST `/:id/status`, `/:id/duplicate`, `/:id/apply`. [Contrato completo](api-treinos.md), [modelo e comportamento](../modulos/treinos.md), [modelos/aplicação](../modulos/modelos-de-treinamento.md), [ADR-010](../arquitetura/ADR-010-prescricoes-versionadas.md).

## Segurança e isolamento

Páginas e cada API exigem sessão opaca confirmada, perfil profissional e assinatura/trial canônicos. Não há JWT ou bypass. IDs nunca substituem proprietário. FKs compostas, queries por proprietário, validação de aluno ativo e revisão/disponibilidade do catálogo impedem associação cruzada. Leitura histórica continua própria/autenticada, sem reintroduzir referências particulares de terceiros.

CSRF, schemas strict, SQL parametrizado, ordenação por whitelist, limites de tamanho/quantidade/paginação e rate limiting persistente. Até 512 KiB apenas para handlers de treinos; 8 KiB permanece padrão anterior. Leituras 120/min, mutações 30/min, aplicação 5/min. Retornos private/no-store/no-referrer, sem SQL/segredos/corpo em logs. Edição arquivada e ativação incompleta bloqueadas no servidor. Nenhuma alteração de regras financeiras.

Snapshots guardam identidade mínima e conteúdo profissional da prescrição, sem contatos/nascimento/notas administrativas do aluno. Arquivo não elimina dados. Política organizacional de retenção/eliminação deve considerar histórico e futuras exportações; não foi inventado prazo universal.

## Verificações e evidências

Verificações realizadas com PostgreSQL 18 isolado, sessões opacas reais e handlers reais. Não foram utilizados mocks de persistência ou autorização. O provedor financeiro controlado é injetado explicitamente apenas nos testes, sem flag/bypass no runtime.

| Verificação | Resultado final |
| --- | --- |
| `npm test` | **128/128 aprovados**, zero falhas/skips, aproximadamente 130,6 s |
| 14 grupos novos de integração de treinos | Schemas, criação/aluno, idempotência/duplicação, divisões/ordem, formatos de séries/técnicas, concorrência, estados/completude, referências/versões, aplicação independente, lote inválido, rollback real, pesquisa/paginação/IDOR, HTTP/CSRF/abuso e métricas/identidade histórica |
| `npm run test:e2e` | Aprovado: cadastro/SMTP, login, recuperação/sessões, rotas privadas incluindo Treinos e bloqueio comercial |
| `npm run test:dashboard:e2e` | Aprovado: indicadores reais, navegação/foco/menu, quatro larguras, axe, reflow/texto 200%, retry/logout |
| `npm run test:students:e2e` | Aprovado: CRUD/arquivo/reativação, busca/PDFs reais, isolamento, dashboard e seção integrada sem regressão |
| `npm run test:exercises:e2e` | Aprovado: biblioteca, seletor, particular, pedidos/moderação, reflow/axe/zoom; repetido após ajuste de hover compartilhado |
| `npm run test:workouts:e2e` | Aprovado: editor, seleção múltipla da 009, séries/cargas/tempo, reordenação por teclado, cópia de divisão, modelo/ativação/lote, edição independente, histórico, arquivo/reabertura/cópia, perfil/preseleção, criação individual direta, cancelamento de saída sem perder alterações e erro/retry |
| Axe 010 | 8 estados × 3 larguras (1440/768/320), zero violações nas regras WCAG A/AA/2.1/2.2 executadas; hover de Salvar verificado explicitamente |
| Reflow e ampliação | Sem overflow horizontal nas três larguras; texto a 200% na lista e regressão corrigida dos indicadores do dashboard |
| `npm run lint` / `npm run typecheck` | Aprovados |
| `npm run build -- --webpack` | Aprovado, com páginas e APIs dinâmicas protegidas |
| `git diff --check` | Aprovado |

A integração provocou uma falha real no segundo INSERT do lote via trigger exclusiva do banco descartável: nenhuma ficha, versão, referência ou chave parcial permaneceu; repetição da mesma tentativa após retirar a falha concluiu o lote. Chaves de criação/cópia/aplicação concorrentes e conflitos de edição foram exercitados no PostgreSQL.

A regressão visual encontrou e corrigiu dois problemas: colunas fixas de indicadores com texto 200% e hover neutro herdado pelo botão verde, causando baixo contraste. Grade auto-fit e hover de borda preservam reflow/contraste; os runners afetados foram repetidos e aprovados. Nenhuma regra financeira mudou.

O E2E de erro injeta uma única resposta HTTP 503 no transporte do harness e depois repete a consulta real. Isso verifica feedback/retry sem substituir banco ou autorização. Os componentes autorizados são servidos em Next temporário e encaminham APIs reais ao processo controlado; guards das páginas da aplicação principal são verificados separadamente no E2E principal. Esse ambiente não homologa Stripe hospedada.

### Capturas

**25 capturas finais da 010**, com dados exclusivamente sintéticos/controlados, em diretório local ignorado pelo Git. Inspeção direta de editor desktop, lista desktop, ficha mobile e prévia de aplicação mobile, além da revisão automatizada de axe/reflow dos oito estados.

- [Lista desktop](../../test-results/010/browser/list-1440.png), [tablet](../../test-results/010/browser/list-768.png), [mobile](../../test-results/010/browser/list-320.png).
- [Editor desktop](../../test-results/010/browser/editor-1440.png), [editor mobile](../../test-results/010/browser/editor-320.png), [criação individual](../../test-results/010/browser/individual-create-320.png).
- [Modelo](../../test-results/010/browser/model-1440.png), [prévia de aplicação mobile](../../test-results/010/browser/apply-preview-320.png), [ficha individual](../../test-results/010/browser/individual-320.png).
- [Treinos no aluno](../../test-results/010/browser/student-plans-1440.png), [vazio](../../test-results/010/browser/empty-320.png), [texto 200%](../../test-results/010/browser/text-zoom-200.png).

## Limitações e pendências operacionais

Migrations e fluxos são exercitados no PostgreSQL isolado, preservando banco existente e credenciais. Para o ambiente local já configurado, executar `npm run db:migrate`; catálogo continua usando `npm run exercises:import`. Não há seed de modelo/ficha ou assinatura no runtime.

Stripe hospedada/manual continua sem homologação externa, dependente de configuração pelo responsável. Gateway controlado é injetado apenas no harness; não é sucesso financeiro externo. Revisão profissional das traduções/instruções do catálogo e provisionamento legítimo de moderador continuam pendências da 009.

Técnicas são descrições estruturadas, sem motor de execução, sincronização automática de séries, cálculo de carga ou recomendação clínica. Não há autosave/offline: crash/encerramento forçado ou interrupção por perda de sessão/verificação comercial pode perder alterações locais ainda não salvas. Axe/teclado/reflow não equivalem a certificação WCAG ou leitor de tela humano. Ampliação de fonte não cobre todos os controles de zoom/navegadores.

A 011 poderá gerar PDF premium a partir do snapshot canônico da versão solicitada: profissional/aluno, nome/objetivo, divisões/ordem, séries/repetições/cargas/descanso/tempo/técnicas/notas/datas/versão. Não foi criado modelo paralelo ou gerador final de PDF. Execução pelo aluno, desempenho, IA, mídia, mobile, WhatsApp e deploy permanecem fora do escopo.

A origem de duplicação também registra a versão específica por FK (`copied_from_version`). A migration 010 é aditiva e não inventa revisão de origem para eventual cópia preexistente; novas cópias sempre registram ID e versão. Snapshots anteriores continuam preservados.

Encerramento: verificações finais aprovadas. Servidores e diretórios temporários dos harnesses foram encerrados/removidos pelos runners; PostgreSQL descartável parado/removido. Conferência das portas 3108, 3109, 3111 e 5549 sem listeners. Nenhum servidor ficou rodando. Banco existente, credenciais, migrations anteriores e alterações acumuladas das entregas anteriores foram preservados. Nenhum deploy, commit ou provisionamento financeiro foi executado.
