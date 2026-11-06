# Entrega 014 — relatórios físicos e shell profissional

A FormFisik é uma empresa independente fundada por Brandon Louis. Implementação local, sem commit, deploy, criação de recursos externos ou alteração de credenciais. Migração aditiva testada exclusivamente em PostgreSQL descartável. Nenhum dado real modificado.

## Resultado funcional

Exportar relatório no acompanhamento e ficha do aluno abre configuração por período/conteúdo, comparação e modelo Compacto/Premium. Gera PDF real com peso, medidas, gráficos vetoriais, observações autorizadas e fotografias opcionais. PDF.js e download autenticado usam os mesmos bytes. Prévia é invalidada por alterações; pode ser descartada explicitamente. Sem R2 os relatórios sem fotos funcionam; fotos não são simuladas no produto. Documentação de [fluxo](../modulos/relatorios-fisicos.md), [API](api-relatorios-fisicos.md), [consistência](../arquitetura/ADR-014-relatorios-e-shell.md) e [operação](../operacao/relatorios-fisicos.md).

## Arquivos e reutilização comprovada

| Área | Alterações 014 |
| --- | --- |
| Documento compartilhado | `src/server/documents/{composition,artifacts}.ts`: fábrica PDFKit/fontes e convenções reutilizadas por treinos/relatórios; mesma tabela temporária e resposta privada |
| Relatórios | `src/server/physical-reports/{repository,handlers,pdf}.ts`, `src/modules/physical-reports/schema.ts` e `src/modules/physical-reports/export-area.tsx`, página exportar e três endpoints reais |
| Precisão | `src/modules/assessments/series.ts` extraído do gráfico012; renderer web usa a mesma geometria. `comparison()` e schemas012 reutilizados diretamente |
| Apresentação e prévia | Apresentação011 ganha cliente transacional opcional; PDF.js aceita rótulo de relatório e mantém rótulos originais de treino. Apresentação pública ganha aviso de alterações não salvas reutilizado013 |
| Fotos | `readPhoto`, schema de autorização e verificação de menor013 reutilizados; `checkMinor` exportado. Adaptador R2 existente sem novos serviços |
| Persistência | `db/migrations/014_physical_reports.sql`, tabela existente estendida, novas referências/declarações temporárias e triggers de invalidação |
| Shell | `professional/shell.tsx`, sidebar/topbar, `navigation-memory.tsx`; listas e painéis de alunos, exercícios, treinos, avaliações, gráficos, fotografias, comparação e calendário conservam contexto em memória |
| Navegação | Dois links de exportação, hook013 de rascunhos estendido para histórico Chrome; sem Web Storage. Botão Aplicar filtros dos alunos recebeu `type=submit`, pois o componente Base UI tem tipo button por padrão |
| Testes | Integração de relatórios, fixture sintética, servidor de teste isolado, Chrome para relatório/shell e renderização Poppler |

A auditoria e justificativa da extração estão no ADR014, redigido antes das novas abstrações. Renderer de treino mantém composição de séries/divisões, usando a mesma fábrica e persistência; não há segundo viewer, identidade, provedor ou armazenamento de PDFs. Documentos011/011.5 permanecem compatíveis. Arquivos anteriores não foram revertidos.

## Configuração e fidelidade

Checkboxes independentes para identificação, peso/gráfico, medidas/gráficos selecionados, comparação, notas, fotos e resumo. Objetivo do acompanhamento não existe no modelo atual: opção indisponível explicada, sem inferência de notas administrativas/objetivo do treino. Dados ausentes permanecem ausentes. Comparações primeira/última, anterior/última e duas avaliações explícitas usam a função012. Arquivadas podem participar da escolha manual, identificadas. Datas civis, kg/cm e decimais preservados.

Compacto branco e econômico, pontos pretos, adequado a cinza; Premium editorial com hierarquia maior/seções escuras/detalhe verde. Mesmas fontes DejaVu e apresentação sanitizada011. Gráficos vetoriais, sem screenshots/interpolação/classificações de saúde. Fotos fit sem corte, data/posição/descrição, até duas por linha. Cabeçalhos/continuações/rodapés e tabelas paginadas. Revisão visual corrigiu página final apenas com aviso e reserva desnecessária de espaço para gráficos vazios.

Snapshot consistente em REPEATABLE READ. Manifest privado contém dados selecionados, versões e instante; edição concorrente de avaliação/apresentação não mistura valores. Fotos lidas pelo mecanismo013 e revalidadas após I/O e sob locks antes de gravar. Nada de reconstrução histórica ou alteração de avaliações para apresentação.

## Segurança e fotografias

Sessão opaca, confirmação de e-mail, proprietário e assinatura autorizados no servidor em cada endpoint, inclusive download. Mesma origem nas mutações, entrada estrita, limites duráveis 5 gerações/minuto e 120 outras operações/minuto. Sem JWT, credenciais no Web Storage, chaves de objeto no cliente/manifest ou logs de dados privados.

Autorização de armazenamento não autoriza PDF compartilhável. Exige nova finalidade explícita, referência verificável, data, sujeito/responsável e declaração vinculada aos IDs/versões e digest do contexto. O software registra declaração do profissional, não verifica documentos juridicamente. Menores conhecidos exigem responsável compatível. Fotos sem declaração, alheias, fora do período, modificadas ou indisponíveis não entram. Sem R2, sem imagem fictícia. Exclusão/substituição/revogação da origem apaga PDFs temporários associados na mesma transação. Não é possível recolher cópias externas já baixadas.

Mesma política011: privado15min, até três artefatos por profissional compartilhados com treinos, cleanup existente. Até500 avaliações,12 imagens,120 páginas,8MiB; excesso recusado sem truncar. Vínculos e manifest/declaração somem em cascata. Nenhuma nova configuração secreta.

## Shell e navegação

Raiz `100dvh`, Grid/Flex min-height zero e uma área `main` com scroll independente. Header fora do main, estável em todos os módulos; sidebar integral sem compensações por página. Marca/logout fixos na coluna; região de navegação rola se a altura é insuficiente. Mobile usa o dialog nativo, Escape, foco contido/retornado e bloqueio do main ao abrir qualquer dialog. VisualViewport adapta altura útil; teclado virtual físico continua uma validação de homologação.

Memória React limitada de filtros/páginas/seleções, destruída com o shell autenticado. Retorno de detalhe e histórico restaura scroll; outra área abre no topo. Filtro/página explícitos reposicionam lista. Painéis preservam rascunhos e usam aviso de descarte013. Não há dados sensíveis no Web Storage. Regra permanente acrescentada em AGENTS.md e Design System.

## Evidências e verificações finais

Ambiente: PostgreSQL18-alpine descartável `formfisik-014-test`, porta loopback5549, bancos exclusivos `formfisik_test` (Chrome) e `formfisik_unit_test` (segunda suite/cleanup). Nenhuma fixture/TRUNCATE/migration apontou para banco existente. Chrome executado em série no banco de navegador; a segunda suite usou banco separado para evitar concorrência de fixtures. Adaptadores comerciais e de objetos privados são controlados exclusivamente nos testes; sessões, PostgreSQL, handlers e renderers são reais. Páginas temporárias de componentes não substituem a autorização SSR de produção; a integração de API e a regressão de autenticação real cobrem essas fronteiras. Nenhuma alegação de homologação R2/Stripe externos.

| Verificação | Resultado verificável |
| --- | --- |
| Suite completa | **200/200 PASS**, zero falhas/ignorados; 19 relatórios +181 anteriores. Segunda execução final:236,979s. Logs [suite-final](../../test-results/014/logs/suite-final.log) |
| Integração014 | Persistência/migrations, modelos, precisão/ausências/comparações, privacidade/identidade/logo, fotos/consentimento/menor, sem R2, IDOR/origem/assinatura/sessão/rate, expiração/capacidade/descarte e concorrência; todos incluídos nos200 |
| Chrome relatórios/shell | PASS; PDF.js concluído, páginas navegáveis, bytes do download iguais à prévia, Compacto/Premium, fotos/declaração, revisão/remoção de seleção, sem storage, erro/retry, vazio, descarte, rascunho bloqueando link e histórico, filtros/página/scroll preservados, dialogs e foco |
| Axe e reflow | Zero violações nas verificações Chrome;014 a1440/768/320, teclado, texto200%. Não equivale a certificação/leitor de tela manual |
| Contenção externa | **21 estados/larguras**, documentHeight=viewport=1000, windowY=0 mesmo após window.scrollTo(100000), com PDF renderizado. [Prova](../../test-results/014/viewport-proof.json) |
| ESLint / TypeScript / produção | PASS; logs [lint](../../test-results/014/logs/lint.log), [typecheck](../../test-results/014/logs/typecheck.log), [build](../../test-results/014/logs/build.log). Build webpack local, sem deploy |
| Tracing | Ambos os endpoints incluem duas fontes DejaVu; zero helpers de teste no tracing. [Prova](../../test-results/014/production-tracing.json) |
| Poppler / limites de texto | 11 PDFs reais,40 páginas A4, zero problemas de margens detectados, rodapés/numeração conferidos. [Inspeção](../../test-results/014/pdf-inspection.json) |
| Cleanup operacional | CLI existente executado:2 PDFs expirados→0,1 declaração→0,2 referências→0. [Prova](../../test-results/014/cleanup-proof.json), [log](../../test-results/014/logs/cleanup.log) |
| Preservação |20 arquivos runtime alterados,14 adicionados, nenhum removido; hashes das migrations anteriores preservados. [Auditoria](../../test-results/014/source-audit.json) |
| Whitespace | `git diff --check` sem erros; [log](../../test-results/014/logs/diff-check.log) |

A primeira passagem completa e todas as regressões anteriores passaram. Na inspeção final de captura foi acrescentado teste de tentativa de rolar a janela, que revelou overflow do texto acessível absoluto do PDF. Corrigida a referência de posicionamento do shell/main/viewer, repetidos build/lint/typecheck, teste014 e as oito regressões Chrome completas abaixo. Capturas finais usam viewport: fullPage não representa o scroll interno de uma aplicação com shell fixo.

| Regressão final após contenção | Resultado / log |
| --- | --- |
| Dashboard e assinatura | PASS — [dashboard](../../test-results/014/logs/dashboard-browser.log) |
| Alunos | PASS — [students](../../test-results/014/logs/students-browser.log) |
| Exercícios / seleção / moderação | PASS — [exercises](../../test-results/014/logs/exercises-browser.log) |
| Treinos / editor / histórico / aplicação | PASS — [workouts](../../test-results/014/logs/workouts-browser.log) |
| Documentos011/011.5 / apresentação / PDF.js | PASS — [documents](../../test-results/014/logs/documents-browser.log) |
| Avaliações / gráficos / comparação | PASS — [assessments](../../test-results/014/logs/assessments-browser.log) |
| Fotografias / calendário / comparação / rascunhos | PASS — [photos](../../test-results/014/logs/photos-browser.log) |
| Autenticação / recuperação SMTP / conta / comercial | PASS — [auth](../../test-results/014/logs/auth-browser.log) |
| Novos relatórios / shell | PASS — [reports](../../test-results/014/logs/report-browser.log) |

Códigos de saída finais em [regressions.json](../../test-results/014/regressions.json) e [status do repasse](../../test-results/014/final-browser-status.tsv). Testes de assinatura usam o provedor canônico controlado; autenticação roda o Next real, PostgreSQL e SMTP loopback. Nenhum fluxo simulado foi incorporado ao produto.

### Prova de scroll e capturas

A sidebar permaneceu top=0,bottom=800,height=800 antes/depois. O main foi de scrollTop=0 até335 (máximo335); windowY permaneceu0. Header top=0,bottom=69 em ambos. Na viewport de360px, logout ficou entre220 e264px, com último link alcançável por scroll apenas da navegação. [Medição](../../test-results/014/scroll-proof.json).

40 capturas finais com hashes em [captures.json](../../test-results/014/captures.json), incluindo:

- [Dashboard desktop](../../test-results/014/browser/regressions/dashboard-desktop.png), [acompanhamento](../../test-results/014/browser/regressions/acompanhamento-desktop.png), [treinos](../../test-results/014/browser/regressions/treinos-desktop.png), [editor](../../test-results/014/browser/regressions/editor-treinos-desktop.png).
- [Antes](../../test-results/014/browser/shell-before.png), [conteúdo rolado/sidebar estável](../../test-results/014/browser/shell-after.png), [altura reduzida](../../test-results/014/browser/shell-short.png).
- [Menu aberto](../../test-results/014/browser/menu-mobile-open.png), [fechado](../../test-results/014/browser/menu-mobile-closed.png), [contexto restaurado](../../test-results/014/browser/list-context-restored.png).
- [Exportação desktop](../../test-results/014/browser/report-configuration-1440.png), [mobile](../../test-results/014/browser/report-configuration-320.png), [prévia PDF.js](../../test-results/014/browser/report-preview-1440.png), [fotos autorizadas](../../test-results/014/browser/report-authorized-photos-1440.png), [sem R2](../../test-results/014/browser/report-without-storage-320.png), [texto200%](../../test-results/014/browser/text-zoom-200.png).
- [Calendário](../../test-results/014/browser/regressions/calendario-desktop.png), [comparação fotográfica](../../test-results/014/browser/regressions/comparacao-fotografica-mobile.png), [conta](../../test-results/014/browser/regressions/conta-desktop.png), [assinatura](../../test-results/014/browser/regressions/assinatura-desktop.png).

Revisão visual: contato das40 páginas, primeira/intermediárias/última do relatório extenso, gráficos/tabelas, pares de fotos, identidade/logo e versão em cinza do Compacto; inspeção em tamanho maior das páginas representativas. [Contato](../../test-results/014/pdf-contact-sheet.png), PNGs Poppler em `test-results/014/pdf-renders/`. Dados exclusivamente sintéticos e figuras geométricas, sem fotografias de pessoas.

### Exemplos PDF

| Exemplo | Páginas |
| --- | --- |
| [apresentacao-personalizada.pdf](../../output/pdf/014/apresentacao-personalizada.pdf) | 2 |
| [avaliacao-parcial.pdf](../../output/pdf/014/avaliacao-parcial.pdf) | 1 |
| [compacto-simples.pdf](../../output/pdf/014/compacto-simples.pdf) | 1 |
| [comparacao-avaliacoes.pdf](../../output/pdf/014/comparacao-avaliacoes.pdf) | 2 |
| [evolucao-medidas.pdf](../../output/pdf/014/evolucao-medidas.pdf) | 3 |
| [evolucao-peso.pdf](../../output/pdf/014/evolucao-peso.pdf) | 2 |
| [fotografias-autorizadas.pdf](../../output/pdf/014/fotografias-autorizadas.pdf) | 2 |
| [periodo-vazio.pdf](../../output/pdf/014/periodo-vazio.pdf) | 1 |
| [premium-simples.pdf](../../output/pdf/014/premium-simples.pdf) | 1 |
| [relatorio-extenso.pdf](../../output/pdf/014/relatorio-extenso.pdf) | 24 |
| [sem-fotografias.pdf](../../output/pdf/014/sem-fotografias.pdf) | 1 |

Hashes dos11 arquivos em [pdf-hashes.json](../../test-results/014/pdf-hashes.json). Nenhum desses dados/objetos é fallback no runtime.

## Limitações e pendências operacionais

- Banco existente não recebeu migration014. Instalação futura depende de autorização, backup e revisão operacional; código014 requer schema014.
- Configuração R2 permanece para o proprietário. Só armazenamento controlado e imagens geométricas sintéticas foram usados em testes.
- Cleanup existente não foi agendado no Railway. Expiração impede leitura imediatamente; exclusão física depende do cleanup, e backups seguem retenção operacional.
- PDFs muito grandes são rejeitados explicitamente; geração síncrona limitada. Worker futuro somente se volume real justificar.
- Não há objetivo próprio de acompanhamento, recomendações clínicas, portal do aluno, mobile, envio automático de arquivos nem nova funcionalidade comercial.
- Chrome desktop/Axe não certificam acessibilidade global ou equivalência a testes de leitores de tela/dispositivos físicos. Validar teclados virtuais e outros navegadores na homologação.
- Independência operacional não pressupõe constituição jurídica formalizada. Declaração de autorização não equivale a verificação jurídica automatizada.

Ambiente de testes encerrado ao final: contêiner descartável removido, portas3108/3109/3111/5549/15260 livres. [Evidência de encerramento](../../test-results/014/runtime-cleanup.json). Nenhuma aplicação de teste ficou rodando.

## Índice dos arquivos desta entrega

Índice relativo ao início da014; não confundir com o conjunto acumulado não commitado das001–013.

- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
- `db/migrations/014_physical_reports.sql`
- `docs/arquitetura/ADR-014-relatorios-e-shell.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/engenharia/api-exportacao-treinos.md`
- `docs/engenharia/api-relatorios-fisicos.md`
- `docs/engenharia/entrega-014.md`
- `docs/modulos/acompanhamento.md`
- `docs/modulos/relatorios-fisicos.md`
- `docs/operacao/relatorios-fisicos.md`
- `docs/planejamento/roadmap.md`
- `docs/privacidade/acompanhamento.md`
- `docs/privacidade/fotografias.md`
- `next.config.ts`
- `package.json`
- `src/app/(app)/acompanhamento/[studentId]/exportar/page.tsx`
- `src/app/api/physical-reports/[id]/route.ts`
- `src/app/api/students/[id]/physical-reports/photos/route.ts`
- `src/app/api/students/[id]/physical-reports/route.ts`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/topbar.tsx`
- `src/modules/assessments/area.tsx`
- `src/modules/assessments/chart.tsx`
- `src/modules/assessments/comparison.tsx`
- `src/modules/assessments/evolution.tsx`
- `src/modules/assessments/series.ts`
- `src/modules/exercises/browser.tsx`
- `src/modules/physical-reports/export-area.tsx`
- `src/modules/physical-reports/schema.ts`
- `src/modules/professional/navigation-memory.tsx`
- `src/modules/professional/shell.tsx`
- `src/modules/progress-photos/area.tsx`
- `src/modules/progress-photos/calendar.tsx`
- `src/modules/progress-photos/compare.tsx`
- `src/modules/shared/use-unsaved-changes.ts`
- `src/modules/students/student-area.tsx`
- `src/modules/workout-documents/pdf-preview.tsx`
- `src/modules/workout-documents/presentation-form.tsx`
- `src/modules/workouts/area.tsx`
- `src/server/documents/artifacts.ts`
- `src/server/documents/composition.ts`
- `src/server/physical-reports/handlers.ts`
- `src/server/physical-reports/pdf.ts`
- `src/server/physical-reports/repository.ts`
- `src/server/progress-photos/repository.ts`
- `src/server/workout-documents/handlers.ts`
- `src/server/workout-documents/pdf.ts`
- `src/server/workout-documents/presentation.ts`
- `tests/helpers/physical-report-fixture.ts`
- `tests/helpers/physical-reports-browser-server.ts`
- `tests/physical-reports-e2e.ts`
- `tests/physical-reports.test.ts`
- `tests/render-physical-reports.py`
- `tests/students-e2e.ts`
