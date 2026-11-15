# Entrega 013 — Fotografias, calendário e organização do acompanhamento

A FormFisik é empresa independente fundada por Brandon Louis. Entrega exclusivamente web e local. Nenhum deploy, commit, recurso externo ou mudança comercial foi realizado. As alterações acumuladas das entregas anteriores foram preservadas.

## Resultado funcional

Fotografias datadas independentes de avaliações, autorização específica (incluindo responsável quando aplicável), várias imagens/posição, edição, substituição segura, arquivo/reativação, remoção controlada e autoria/histórico. Calendário brasileiro mensal/anual agregado, integrado ao período dos gráficos, com consulta paginada do dia. Comparação de duas datas/posição lado a lado, seleção entre múltiplas imagens, troca de datas, ausência explícita e ampliação individual. Painéis, medidas recolhíveis e expansão de campos ausentes tornam o acompanhamento mais organizado.

Sem credenciais R2, a aplicação informa indisponibilidade e impede criação/upload de fotos, sem simular sucesso. A funcionalidade foi exercitada com PostgreSQL descartável e armazenamento controlado injetado exclusivamente nos testes. R2 externo **não homologado**.

## Auditoria, reutilização e decisões

Foram auditados AGENTS, política de desenvolvimento, diretriz institucional, arquitetura/autenticação/comercial, módulo 012, cadastro/carteira 008, biblioteca 009, editor/histórico 010 e exportação 011/011.5, dependências e upload de logo. Guias locais do Next foram consultados antes das alterações de rotas.

Reutilizados: vínculo de aluno e propriedade; sessão opaca e autorização comercial canônica; StudentsPicker e shell; action/control; transação PostgreSQL; Sharp já instalado; datas civis, períodos, pontos SVG, detalhes e cálculos exatos da 012. O upload de logo em bytea não serve às fotografias corporais; não foi duplicado como fallback. Adicionado `@aws-sdk/client-s3` para protocolo S3/R2 por interface simples put/get/remove. A justificativa e consequências estão no [ADR 013](../arquitetura/ADR-013-fotografias-privadas.md).

Regra permanente incorporada ao AGENTS e Design System: organizar telas extensas em painéis/seções/etapas ou listas paginadas, preservar alterações/filtros/seleção, não carregar milhares de itens para escondê-los. Auditoria retrospectiva, propostas e prioridades no [roadmap](../planejamento/roadmap.md); prescrições e PDFs não foram redesenhados.

## Arquivos e migration

| Grupo | Arquivos envolvidos |
| --- | --- |
| Banco | `db/migrations/013_progress_photographs.sql` — cinco tabelas aditivas, FKs compostas, índices e estados |
| Servidor | `src/server/progress-photos/{storage,image,repository,handlers}.ts` |
| APIs | `src/app/api/photo-records/**`, `photo-images/[id]`, `photos/{availability,choices}`, `progress/calendar` |
| UI fotografias | `src/modules/progress-photos/{schema,forms,area,private-image,compare,calendar}` |
| Integração 012 | `src/modules/assessments/{area,editor,chart,comparison,schema}`, novos `detail/evolution`, reuso de períodos em `src/server/assessments/repository.ts` |
| Estado não salvo | `src/modules/shared/use-unsaved-changes.ts` |
| Operação/config | `scripts/cleanup-photos.ts`, `.env.example`, `package.json`, lockfile |
| Testes | `tests/progress-photos.test.ts`, `progress-photos-e2e.ts`, `helpers/private-photo-store.ts`, `helpers/progress-photos-browser-server.ts`, adaptação da navegação em `assessments-e2e.ts` |
| Documentação | AGENTS, Design System, acompanhamento, API/modelo, privacidade, ADR, operação R2/ambientes, roadmap, README e CHANGELOG |

A migration foi aplicada e reaplicada pelo executor idempotente somente no banco Docker `formfisik_test` da entrega, nunca no banco existente. As migrations 001–012 não foram alteradas. A comparação SHA-256 dos 218 arquivos de runtime existentes antes desta execução identifica somente seis arquivos modificados, todos ligados à integração/refinamento da 012; inventário em `test-results/013/source-audit.json`. Autenticação, assinatura, prescrição, gerador de PDF, ativos e migrações anteriores permanecem iguais à linha de base capturada, inclusive alterações anteriores ainda não commitadas.

## Armazenamento, segurança e operação

PostgreSQL armazena metadados/referências, nunca bytes das fotos. R2 usa objetos privados com chave aleatória de 256 bits sem identidade/data no caminho. JPEG/PNG/WebP estáticos passam por assinatura, decodificação real, dimensões/pixels e reencodificação JPEG, rotação correta e remoção EXIF/localização/ICC. Limites: 5 MiB original, 24 MP/6.000 px por lado; 2.000 px por lado e 3 MiB na saída; 12 fotos por registro, uma reserva adicional transitória na substituição.

Todas as APIs revalidam sessão, identidade confirmada, direito comercial e propriedade. Mutações exigem mesma origem, limites compartilhados no PostgreSQL e entrada estrita. Imagens são entregues por proxy autenticado, no-store/no-referrer/CORP, sem URL pública, CDN de otimização ou chave no DTO. Revalidação após I/O impede entregar imagem revogada durante a leitura. Não há JWT, dados em Web Storage, imagem pública ou fallback em disco.

Reserva durável precede PUT. Falha/interrupção/conflito nunca torna imagem pronta e deixa referência de limpeza. Substituição só bloqueia a antiga depois de confirmar a nova. Criação/upload/remoção têm UUID/digest idempotente; versão/locks impedem sobrescrita concorrente. Limpeza revalida locks/estado, apaga objeto e depois saneia metadados. DELETE falho conserva pendência/retry; tombstones opacos repetem exclusão diária para recuperar PUT atrasado.

Autorização por registro exige referência/data/finalidade/declaração, sem presumir consentimento cadastral. Menor conhecido exige responsável; idade desconhecida exige declaração explícita. Não há verificação jurídica automática. Remoção integral revoga acesso imediatamente; exclusão física depende do worker/serviço. Após conclusão, fotos, notas/data/posições e referência descritiva da autorização são removidas; ficam auditoria mínima/identificadores/chaves opacas. Backups/retenção e purga desses identificadores precisam de decisão operacional própria, sem prometer apagamento de cópias externas. [Política completa](../privacidade/fotografias.md).

Configuração server-only: R2_ACCOUNT_ID, R2_PHOTOS_BUCKET, R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY, todas sem valores reais em `.env.example`. A presença não comprova conectividade/permissões. `npm run photos:cleanup` preparado, sem scheduler externo criado. [Runbook e recuperação](../operacao/fotografias-r2.md).

## Calendário, comparação e paginação

Datas civis ISO canônicas da 012, domingo primeiro e apresentação brasileira sem conversão de fuso. SQL agregado retorna até 31 dias ou 12 meses, sem ler bytes. Indicadores A/F/A+F têm rótulos e legenda; registros arquivados/em remoção ficam fora. Apenas fotos confirmadas produzem indicadores; registros de autorização sem imagens continuam no histórico. Detalhes do dia permitem abrir medidas/observações ou galeria privada. Controles de visualização mantêm aluno e período.

Comparação conserva proporção, sem filtros corporais ou análise por IA. Duas colunas utilizáveis a 320px; zoom individual por dialog, Escape e retorno de foco. Ausência não é preenchida artificialmente.

| Coleção | Limite por página/consulta |
| --- | --- |
| Carteira/seletor existente | 20 |
| Avaliações existentes / auditoria de fotografias | 20 |
| Histórico fotográfico | 10 |
| Escolhas de imagem na comparação | 12 |
| Registros do dia | 10 de cada tipo |
| Pontos do indicador ativo | 500, com carga adicional explícita |
| Indicadores anuais/mensais | 12 / até 31 agregações |

Filtros/página/seleção e rascunhos são preservados entre painéis montados. Regiões recolhíveis não apagam campos. Há aviso compartilhado antes de saída/descarte; sem persistência de conteúdo sensível no cliente.

## Validação e evidências

`npm test` passou com **181 testes, 181 aprovados, zero falhas, zero ignorados**, em 216,29 s. Inclui 27 cenários da 013 e regressões de cadastro, login/sessões, recuperação, assinatura, dashboard, alunos, catálogo, treinos, documentos e avaliações. Banco PostgreSQL 18 descartável, migrations idempotentes, sem credenciais reais.

Os 27 cenários da 013 cobrem conteúdo real JPEG/PNG/WebP e metadados, arquivos incompatíveis/malformados/animação/limites, autorização/menores, isolamento, ausência de R2, datas independentes, mesma posição, quantidade, idempotência, substituição segura, falhas/abort antes e depois de PUT, uploads simultâneos, edição concorrente, leitura revogada durante GET, exclusão/retry/saneamento/tombstone tardio, arquivo/reativação, calendários/períodos/contagens sem bytes, páginas/filtros, escolhas e auditoria, CSRF, sessão/comercial e rate limiting. SDK S3 testado por comandos controlados, sem afirmar conexão real.

Build de produção (`npm run build -- --webpack`), TypeScript e ESLint passaram sem erros/avisos. `git diff --check` e inspeção de whitespace nas fontes/documentos passaram. Auditoria de dependências: 21 ocorrências (2 baixas, 19 moderadas, nenhuma alta/crítica), relacionadas às cadeias ESLint/shadcn/ts-morph/minimatch já utilizadas; nenhuma em `@aws-sdk/client-s3`. Não foi aplicado upgrade forçado fora do escopo. JSON e logs em `test-results/013/logs/`.

A validação fotográfica no Chrome passou em 15 estados × 1440/768/320px, com 45 análises Axe nesses estados e outra no dialog de remoção, sem violações. Inclui calendário mensal/anual, troca de período/visualização, abertura de fotos pelo calendário, histórico paginado e filtros preservados, comparação/ausências/escolha/zoom, autorização, upload múltiplo, edição/substituição/arquivo, remoção/limpeza, rascunho preservado entre painéis e ao abrir/cancelar avaliação, falhas de calendário e imagem/retry, teclado e texto a 200%. Foram geradas 46 capturas (45 dos estados e uma de zoom de texto). As imagens de teste são formas geométricas, nunca corpos de pessoas.

A passagem final repetiu os **27 testes fotográficos (27 aprovados, zero falhas/ignorados, 9,59 s)** e o fluxo Chrome após os ajustes de legibilidade e semântica dos controles. Acrescentou envio múltiplo com um arquivo realmente inválido: a primeira imagem permanece persistida, o erro informa exatamente uma confirmação, o loading é encerrado e só o arquivo faltante é reenviado. A mensagem de indisponibilidade se refere à operação atual, sem contradizer confirmações anteriores.

| Regressão no navegador | Resultado / limite |
| --- | --- |
| Fotografias 013 | PASS; APIs/PG/sessões reais, objeto privado e cobrança canônica controlados somente em testes |
| Avaliações 012 | PASS; criação/edição/conflito/arquivo, valores e modos de comparação, expansão de ausências, gráficos/períodos, históricos extensos, teclado/Axe/reflow |
| Dashboard / assinaturas | PASS; UI com fixture derivada dos testes PostgreSQL e respostas controladas, autorização real coberta separadamente pelas integrações |
| Alunos 008 | PASS; CRUD, arquivo, busca/filtros, PDFs, isolamento, dashboard, navegação e acessibilidade |
| Exercícios 009 | PASS; catálogo, seleção entre páginas, particulares, pedidos/moderação/publicação, vazio e acessibilidade |
| Treinos 010 | PASS; editor/séries/ordenação, modelo/lote, versões independentes, histórico, aluno, falha/retry e acessibilidade |
| Documentos 011/011.5 | PASS; opções, dois layouts, PDF real/preview/download idênticos, histórico, falha/retry, foco e acessibilidade |
| Autenticação 001–003 / comercial | PASS; aplicação Next real, PG/SMTP locais, confirmação, login/cookie, logout, recuperação/reset, revogação/replay/expiração, rotas privadas e negação comercial; apresentação comercial usa fixtures controladas |

Comandos e saídas correspondentes em `test-results/013/logs/{photos,assessments,dashboard,students,exercises,workouts,documents,auth}-browser.log`. Todos executados sequencialmente para não compartilhar TRUNCATE/portas. O CLI `npm run photos:cleanup` também foi executado contra o banco descartável, com R2 vazio e fila sem itens vencidos: `{removed:0,failed:0,scanned:0}`; falhas/exclusão física/retry foram exercitadas pelo worker real com armazenamento controlado nos testes de integração. O PostgreSQL descartável foi encerrado e as portas 3108, 3109, 3111, 5549 e 15260 ficaram livres. Não permaneceu aplicação de teste rodando. Não há cobrança real, autorização paga fictícia em produção ou alegação de R2 externo homologado.

O harness de navegador usa componentes reais Next/React, APIs reais, sessões reais e PostgreSQL descartável, com provedor comercial controlado e armazenamento em memória somente no processo de teste. Páginas temporárias não substituem a autorização comercial das páginas de produção; testes de API e regressão completa cobrem esses controles. Nenhum teste comprova R2 real ou cobrança Stripe hospedada.

Capturas em `test-results/013/browser/`, somente figuras geométricas TESTE A/B (não pessoas):

| Evidência | Arquivo |
| --- | --- |
| Calendário mensal desktop | `monthly-calendar-1440.png` |
| Calendário anual desktop | `annual-calendar-1440.png` |
| Calendário mensal mobile | `monthly-calendar-320.png` |
| Formulário de autorização | `photo-form-1440.png` e `photo-form-320.png` |
| Upload real controlado | `photo-upload-1440.png` |
| Histórico / galeria | `photo-history-1440.png`, `photo-gallery-1440.png` |
| Comparação lado a lado | `side-by-side-1440.png` e `side-by-side-320.png` |
| Gráficos ↔ calendário | `graph-calendar-switch-1440.png` |
| Medidas reorganizadas | `organized-measurements-1440.png` |
| Ausência / comparação vazia | `missing-photo-320.png`, `organized-comparison-empty-1440.png` |
| Indisponibilidade / erro | `storage-unavailable-1440.png`, `calendar-error-320.png`, `image-error-320.png` |
| Remoção pendente | `removal-pending-1440.png` |
| Texto a 200% | `text-zoom-200.png` |

[Calendário mensal desktop](../../test-results/013/browser/monthly-calendar-1440.png) · [Calendário anual](../../test-results/013/browser/annual-calendar-1440.png) · [Calendário mobile](../../test-results/013/browser/monthly-calendar-320.png) · [Comparação mobile](../../test-results/013/browser/side-by-side-320.png) · [Formulário](../../test-results/013/browser/photo-form-1440.png).

Índice SHA-256 das 46 capturas em `test-results/013/captures.json`. Revisão visual amostral de calendário mensal/anual desktop, medidas em tablet, comparação/formulário/erro em mobile, além das verificações automatizadas em todos os estados.

São evidências locais geradas, não ativos de produto nem comprovação jurídica de consentimento. Axe/teclado/reflow não equivalem a certificação ou teste manual de leitor de tela.

## Limitações e próximos passos operacionais

- Proprietário ainda configurará bucket privado/credenciais R2 e autorizará homologação externa, incluindo falhas e exclusão. Não foi solicitado segredo no chat nem criada infraestrutura externa.
- Banco existente não recebeu a migration; aplicação manual no ambiente escolhido depende de autorização e backup.
- Agendamento/monitoramento do worker não foi provisionado; deve existir antes de uso real. Sem worker, acesso bloqueado permanece com exclusão física pendente.
- Retenção institucional, políticas de backup/provedor e purga/reconciliação dos tombstones permanecem decisões operacionais explícitas. Não presumem formalização jurídica da empresa.
- Upload JSON/base64 limitado e sequencial; sem resumable/multipart ou processamento assíncrono de grandes arquivos. Limites são intencionais.
- Não há fotos em PDFs, IA, portal do aluno, compartilhamento público, pagamentos novos, mobile ou alterações de prescrição. Homologação Stripe externa segue pendência independente das entregas 005/006.
