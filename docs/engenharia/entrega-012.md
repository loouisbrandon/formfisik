# Entrega 012 — Acompanhamento físico

## Resultado funcional

Avaliações físicas reais e parciais por vínculo privado do aluno, PostgreSQL, edição otimista, autoria, arquivo/reativação e auditoria administrativa. Acompanhamento ativo no menu e na ficha do aluno; resumo mais recente, histórico completo paginado, gráficos de peso/medida com períodos, tabela acessível e comparação primeira/anterior/manual. Dashboard acrescenta indicadores reais sem interpretação clínica. FormFisik é empresa independente fundada por Brandon Louis.

Nenhum fluxo usa dados simulados na aplicação. Provedor financeiro controlado e alunos/medidas sintéticos existem exclusivamente nos testes isolados, com sessões e persistência reais. Stripe permanece sem credenciais reais neste ambiente; não foi criado bypass de assinatura.

## Auditoria e reutilização

Auditados Alunos 008, Treinos 010, exportação 011/refinamento 011.5, dashboard, autenticação/assinatura e Design System. A [ADR-012](../arquitetura/ADR-012-acompanhamento.md) registra evidências por arquivo e justificativas. Reutilizados vínculo privado, busca/paginação e picker de alunos, Pool/migrator/transaction, sessão opaca e confirmação, guard comercial canônico, Origin, limitação HMAC, jsonBody, respostas privadas, shell/monitor/notice e action/control.

O modelo separado impede misturar medidas com notas administrativas ou prescrição. Não foi adicionada biblioteca gráfica: auditoria do manifest/lock não encontrou uma instalada; SVG/React e tabela HTML atendem ao escopo sem dependência, CDN ou abstração genérica.

`test-results/012/preservation-audit.json` compara hashes com a base capturada antes da 011.5. Checkout e migrations anteriores permanecem idênticos. A diferença de pdf.ts nessa base já pertence à 011.5 concluída; o gerador não foi editado na 012. Sem reset, limpeza de checkout, commit, deploy, recursos externos ou credenciais alteradas.

## Arquivos e módulos

Novos:

- `db/migrations/012_physical_assessments.sql`.
- `src/modules/assessments/{schema,api,chart,comparison,editor,area,page}.ts[x]`.
- `src/server/assessments/{repository,handlers}.ts`.
- `src/app/(app)/acompanhamento/page.tsx` e `[studentId]/page.tsx`.
- `src/app/api/assessments/route.ts`, `[id]/route.ts`, `[id]/status/route.ts`, `[id]/history/route.ts`.
- `tests/assessments.test.ts`, `tests/assessments-e2e.ts`, `tests/helpers/assessments-browser-server.ts`.
- Documentação de módulo, API/modelo, ADR, privacidade e este relatório.

Integrados: `src/modules/professional/{navigation,dashboard-content}.ts[x]`, `src/components/layout/sidebar.tsx`, `src/modules/students/student-area.tsx`, `src/server/professional-dashboard.ts`. `package.json` adiciona somente o comando de E2E; sem dependências novas. Testes existentes de dashboard/alunos/treinos atualizam expectativas dos indicadores e menu; E2E de autenticação passa a verificar também as novas rotas guardadas.

Documentação atualizada: `docs/design/DESIGN_SYSTEM.md`, `docs/modulos/{alunos,dashboard-profissional}.md`, `docs/planejamento/roadmap.md`, README e CHANGELOG. As demais entregas e documentação histórica foram preservadas.

## Persistência, regras e APIs

Migration aditiva 012 cria physical_assessments e physical_assessment_events, reutilizando chave composta já existente de student_links. Peso e 14 medidas são NUMERIC(5,2), strings decimais/null na API; data é DATE. Propriedade/autor com FKs e checks. Edição/situação/auditoria atômicas; versionamento otimista e idempotência de criação. Histórico administrativo preserva operações, não snapshots anteriores de saúde. Múltiplas avaliações do dia são independentes e ordenadas deterministicamente.

Somente profissionais confirmados com entitlement canônico e propriedade recebem conteúdo; cada endpoint revalida. Mutações exigem mesma origem, payload estrito e tamanho limitado; SQL parametrizado e enums fechados. GET/list/series/compare/get/history retornam respostas privadas. Nenhuma rota pública, PDF de avaliação, DELETE ou acesso do aluno. [Contratos completos e modelo](api-acompanhamento.md).

Períodos em Brasília; datas civis não viram instantes. Comparação calcula diferenças exatas em centésimos e percentuais racionais; ausência não vira zero. Arquivar remove de gráficos/comparações automáticas e preserva consulta, auditoria e reativação. Aluno arquivado bloqueia alterações até reativação. Limites técnicos amplos não são diagnóstico. [Regras funcionais](../modulos/acompanhamento.md).

## Testes executados e resultados

Validação em 1º de novembro de 2026, com PostgreSQL 18 descartável `formfisik-012-test`, sem conexão ou migrations no banco existente. Suítes que limpam o banco executadas sequencialmente. Sessões, dados, transações e SQL reais; somente o gateway financeiro usa a injeção controlada já existente para testes.

| Verificação | Resultado verificável |
| --- | --- |
| `npm test` | **154/154 aprovados**, zero falhas/ignorados, 186,14 s. Cadastro, autenticação, recuperação, assinatura, dashboard, alunos, catálogo, treinos, documentos e 16 casos novos de acompanhamento. |
| Integração final `tests/assessments.test.ts` | **16/16 aprovados**, zero falhas/ignorados, 11,80 s; reexecutada após o refinamento final de datas e interface. |
| `npm run test:assessments:e2e` | **Aprovado**, rodada final 76,88 s, Chrome/Next/PostgreSQL reais e gateway controlado. |
| `npm run test:e2e` | **Aprovado**, 247,74 s; aplicação completa, SMTP controlado, cadastro/confirmar/login/recuperar, revogação, rotas privadas incluindo acompanhamento, estados comerciais e ausência de credenciais no navegador. Não é homologação Stripe hospedada. |
| `npm run test:dashboard:e2e` | **Aprovado**, 28,47 s; componentes reais em harness com dados produzidos pelo teste PostgreSQL e respostas de monitor controladas; navegação, estados, teclado e Axe. |
| `npm run test:students:e2e` | **Aprovado**, 47,46 s; CRUD, arquivo/reativação, busca, PDFs cadastrais, isolamento, contagens e navegação, com banco/sessão reais. |
| `npm run test:workouts:e2e` | **Aprovado**, 81,33 s; editor, catálogo/seletor, modelos/aplicação, versões, alunos, conflitos/erros, teclado e Axe. |
| `npm run test:workout-documents:e2e` | **Aprovado**, 59,90 s; layouts/opções, apresentação, prévia e download de bytes idênticos, histórico e retry, com banco/sessão reais. |
| `npm run lint` | **Aprovado**, zero erros/avisos, 12,31 s. |
| `npm run typecheck` | **Aprovado**, 11,79 s. |
| `npm run build -- --webpack` | **Aprovado**, produção, 45,64 s, incluindo páginas e Route Handlers novos. |
| `git diff --check` | **Aprovado**. Verificação adicional de whitespace dos arquivos novos e links da documentação também passou. |

Logs completos em `test-results/012/logs/`, comandos/códigos de saída/tempos em `test-results/012/verification.json`. O log da suíte completa é `full-tests.log`; os dois logs finais do módulo são `assessments-integration-final.log` e `assessments-browser-final.log`. Tempos de testes não são benchmark de produção. Exercícios tem regressão na suíte completa e no seletor de treinos; seu E2E isolado não foi reexecutado nesta entrega.

### Cobertura do módulo

Schemas estritos, todos os 15 valores numéricos, vírgula/ponto e centésimos exatos; limites, datas impossíveis/futuras, ano bissexto e instante UTC atravessando a data em Brasília. Persistência parcial, campos ausentes, autores e headers privados. Criação concorrente idempotente, múltiplos registros do dia, cronologia, isolamento por proprietário e vínculo e integridade por FK. Edição concorrente com um único vencedor, conflito 409, arquivo/reativação/no-op, bloqueio de alterações em aluno arquivado. Auditoria de **24 versões** em duas páginas sem payloads anteriores. Série de **502 medições**, em páginas de 500 + 2, com ausência de dados e filtros de período. Comparações primeira/anterior/manual, diferenças exatas e indefinições. Sessões, confirmação, entitlement, falha do provedor, CSRF, abuso, campos extras, body excedente, IDs e métricas inválidos. Dashboard com números reais, exclusão de outros proprietários e situações arquivadas.

Chrome cobre seleção, vazio, formulário parcial, validação/foco, loading com resposta retida e submit desativado, um ponto, vários pontos e **35 avaliações** com histórico paginado; três modos de comparação, incluindo seleção preservada **entre páginas diferentes**; edição e conflito com alteração real concorrente via API; detalhe/auditoria; arquivo com foco/Escape/confirmar e reativação; ausência por medida/período; falha de serviço/retry; negação de vínculo estrangeiro; link da ficha, menu mobile e confirmação ao descartar edição por navegação. Abertura da tabela por Enter e foco de erro foram verificados. Não se confunde o teste de API com 502 medições com a fixture visual de 35 avaliações.

### Capturas e acessibilidade

**25 capturas originais**: oito estados × 1440/768/320 px, mais reflow de texto a 200% em 1280 px. Axe WCAG 2 A/AA, 2.1 AA e 2.2 AA: **zero violações** nos estados/larguras auditados; dialog de arquivamento também auditado. Sem overflow horizontal nas três larguras e no teste de texto ampliado. Inspeção direta de composição, campos, tabela, escala e pontos; marcadores conservam tamanho visual no desktop/mobile, sem distorção pela escala SVG.

| Estado | Desktop | Mobile |
| --- | --- | --- |
| Seleção | [1440](../../test-results/012/browser/student-selection-1440.png) | [320](../../test-results/012/browser/student-selection-320.png) |
| Vazio | [1440](../../test-results/012/browser/empty-1440.png) | [320](../../test-results/012/browser/empty-320.png) |
| Nova avaliação | [1440](../../test-results/012/browser/editor-1440.png) | [320](../../test-results/012/browser/editor-320.png) |
| Um ponto | [1440](../../test-results/012/browser/single-point-1440.png) | [320](../../test-results/012/browser/single-point-320.png) |
| Comparação/tabela | [1440](../../test-results/012/browser/comparison-1440.png) | [320](../../test-results/012/browser/comparison-320.png) |
| Histórico extenso | [1440](../../test-results/012/browser/extensive-history-1440.png) | [320](../../test-results/012/browser/extensive-history-320.png) |
| Conflito concorrente | [1440](../../test-results/012/browser/concurrency-error-1440.png) | [320](../../test-results/012/browser/concurrency-error-320.png) |
| Falha de serviço | [1440](../../test-results/012/browser/service-error-1440.png) | [320](../../test-results/012/browser/service-error-320.png) |

As versões 768 px têm o mesmo prefixo em `test-results/012/browser/`; [texto 200%](../../test-results/012/browser/text-zoom-200.png). Contato visual e recortes de inspeção usam prefixo `review-`; os originais permanecem preservados. Dados e nomes dessas imagens são sintéticos do teste. Artefatos são ignorados pelo Git, disponíveis neste workspace, não um repositório público de dados.

## Encerramento e operação

PostgreSQL descartável parado e removido após os testes; Next/harnesses/SMTP encerrados. Portas 3108, 3109, 3111, 5549 e 15260 verificadas sem listeners (`test-results/012/cleanup.json`). Não houve deploy, commit, criação de serviços externos, alteração de credenciais, importação em banco existente ou dados fictícios na aplicação.

## Limitações e pendências operacionais

- Migration aplicada exclusivamente a PostgreSQL descartável. Aplicação ao banco existente/Railway depende de autorização operacional; nenhuma migration foi aplicada nesse ambiente.
- Homologação comercial hospedada depende de futuras chaves Stripe, pendência anterior. Testes usam gateway controlado explícito, sem alegar pagamento externo ou acesso manual pago homologado.
- Valores anteriores não são recuperáveis por snapshots: histórico é administrativo. Correção altera valores atuais, com operação/autoria/versão auditadas.
- Acima de 500 medições por gráfico, carregar páginas adicionais explicitamente. Sem truncamento/amostragem invisível; volumes excepcionalmente grandes podem exigir futura virtualização. Paginação sobre dados alterados concorrentemente deve ser recarregada para recompor o estado atual.
- Comparação manual permite localizar outras opções paginando o histórico; referências selecionadas são mantidas.
- Política operacional de retenção, procedimento de direitos, acesso administrativo e ciclo seguro de backups devem ser definidos antes do uso real. Não há expurgo ou interface de eliminação física. [Cuidados e procedimento](../privacidade/acompanhamento.md).
- Axe e teclado não equivalem a certificação global ou homologação manual com leitor de tela.
- Fora do escopo: fotos, IA, teleconsulta, portal, mobile e PDF de acompanhamento. Futuras evoluções devem ter autorização própria e preservar a finalidade dos dados.
