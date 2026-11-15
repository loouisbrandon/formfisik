# Entrega 009 — Biblioteca de exercícios e contribuições

## Resultado funcional

Implementada a biblioteca web `/exercicios`, com catálogo oficial real PostgreSQL, busca sem distinção de caixa/acentos e por aliases, filtros, ordenação/paginação SQL, detalhes, exercícios particulares, arquivo/reativação, solicitações acompanháveis e moderação restrita. O seletor reutilizável funciona na biblioteca, conserva escolhas entre pesquisas/páginas, remove individualmente e confirma IDs/versões atuais no servidor. Nenhuma ficha fictícia foi criada.

A FormFisik permanece empresa independente, fundada por Brandon Louis. Não foram presumidos formalização jurídica, infraestrutura ou propriedade intelectual compartilhadas. Não houve deploy, commit, modificação de credenciais, serviço financeiro externo ou concessão de privilégio a conta real.

## Catálogo e licenças

| Resultado auditado | Quantidade |
| --- | ---: |
| Registros PT-BR auditados / IDs únicos | 873 |
| Publicados estruturalmente no PostgreSQL isolado | 868 |
| Excluídos por falta de instruções | 5 |
| Sinalizados no arquivo completo | 106 |
| Sinalizados entre os publicados | 104 |
| Grupos de nomes iguais normalizados, preservados sem fusão | 4 |
| Mídias importadas | 0 |

Fonte: gugeldev/exercicios-bd-ptbr, revisão `6bb9118e46cf8d0ee98b42e0285bae5036d04a19`, JSON de tradução completa, CC0-1.0. Original: yuhonas/free-exercise-db, revisão `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`, Unlicense. Os 873 IDs PT-BR correspondem a IDs da base original auditada de 876 entradas; somente nomes originais foram derivados para aliases. Licenças reais, manifesto e checksums estão versionados em `db/catalog/`.

A fonte JSON contém caminhos textuais de imagens, mas nenhum desses campos é persistido/renderizado pelo importador; nenhuma imagem ou mídia foi baixada. A licença dos JSONs não foi presumida para imagens. Não foi copiado código de interface, nem inventadas instruções ou classificações técnicas. A importação **não homologa tecnicamente o catálogo**: revisão profissional das descrições/traduções é pendência anterior ao lançamento comercial. [Auditoria completa e procedimento](../catalogo/exercicios.md).

## Implementação, dados e segurança

Migration aditiva `008_exercise_library.sql`: nove tabelas de catálogo, versões/eventos, idempotência, pedidos e permissão/eventos de moderação. Entidade canônica UUID e snapshots por versão preparam referências futuras sem textos soltos ou alteração retroativa de prescrições. Atualizações de particulares preservam versões; aprovação cria oficial separado. Não há exclusão destrutiva, conversão silenciosa ou atualização automática de fonte em reimportação.

Importador confere checksum/schema/auditoria, registra fonte/revisão/licenças, usa transação/lock e mantém UUIDs na reexecução. Busca/filtros operam no banco, com SQL parametrizado e ordenação por whitelist. Capacidade administrativa é persistente e adicional à identidade; não depende de assinatura nem é concedida por role/e-mail conhecido/env. Pedido é bloqueado e verificado por versão, permissão revalidada sob lock, autor impedido de decidir, responsável e motivo registrados.

APIs verificam sessão opaca confirmada, acesso profissional/comercial nas operações comuns, proprietário nas entidades particulares, CSRF, corpo JSON até 8 KiB, schemas estritos e rate limits duráveis. Retornos são privados/no-store/no-referrer. IDs aleatórios não concedem acesso. Sem JWT, credenciais em storage ou confiança em permissões do frontend.

[Contratos, campos e tabelas](../modulos/exercicios.md), [provisionamento controlado](../operacao/moderacao-exercicios.md), [ADR-009](../arquitetura/ADR-009-exercicios.md).

## Arquivos e reutilização

- `db/catalog/*`, `db/migrations/008_exercise_library.sql`: fonte local, licenças, manifesto e persistência.
- `scripts/import-exercises.ts`, `scripts/provision-exercise-moderator.ts`, scripts npm: operação reprodutível e permissão restrita.
- `src/server/exercises/{repository,handlers}.ts`, `src/app/api/exercises/**/route.ts`: consultas, transações, autorização, pedidos e decisões reais.
- `src/modules/exercises/{taxonomy,schema,browser,form,selector,area}.tsx/ts`: schemas/taxonomias compartilhados, apresentação e seletor reutilizável.
- `src/app/(app)/exercicios/{page,loading,error}.tsx`, `moderacao/page.tsx`: rotas protegidas e estados.
- Navegação profissional, Sidebar e texto do dashboard: módulo disponível, sem métricas inventadas ou habilitação de Treinos.
- Testes novos `tests/exercises.test.ts`, `tests/exercises-e2e.ts`, `tests/helpers/exercises-browser-server.ts`; regressões de navegação/rotas atualizadas em `dashboard.test.ts` e `e2e.ts`.
- Documentação: módulo, catálogo, operação de moderação, ADR-009, Design System, documentação do dashboard, roadmap, README, CHANGELOG e este relatório.

Reutilizados PostgreSQL/migrator, sessões opacas, autorização canônica de assinatura, utilitários CSRF/JSON/limitação/headers, shell, menu, monitor de acesso, aviso profissional, tokens e fontes. Não foi adicionada dependência ou serviço externo.

## Validação e evidências

Verificação final em PostgreSQL 18 isolado, sem substituir persistência ou autorização por mocks:

| Comando / verificação | Resultado |
| --- | --- |
| `npm test` com TEST_DATABASE_URL isolada | **114/114 aprovados**, 0 falhas/skips; aproximadamente 127 s |
| 14 cenários novos de Exercícios dentro da suíte | Auditoria/checksums/licenças, fonte adulterada/IDs repetidos/campos inválidos, importação idempotente/IDs/versões, busca/aliases/acentos/filtros/ordenação/paginação, particular CRUD/conflito/isolamento, seleção, pedidos/estados/reenvio, moderação/permissão/autorrevisão, decisões concorrentes/duplicatas, sessão/CSRF/abuso e CLI grant/revoke |
| `npm run test:e2e` | Aprovado: cadastro/SMTP, confirmação, login, recuperação/reset/replay/expiração, revogação, cookies, rotas privadas incluindo Exercícios e bloqueio comercial |
| `npm run test:dashboard:e2e` | Aprovado: identidade/entitlement de teste real, navegação/modal/foco, quatro larguras, axe, zoom, retry e logout |
| `npm run test:students:e2e` | Aprovado: CRUD/arquivo/reativação, busca/PDFs, IDOR, contagens reais, menu/logout e axe em três larguras |
| `npm run test:exercises:e2e` | Aprovado na versão final: catálogo, seleção entre páginas/buscas, remoção, confirmação, Tab/Shift+Tab/Space/Escape/foco restaurado, particulares, pedidos, revisão autorizada, publicação oficial e acompanhamento |
| Axe 009 | 8 estados × 3 larguras (1440/768/320): zero violações nas regras WCAG A/AA/2.1/2.2 executadas |
| Reflow/texto 009 | Sem overflow horizontal nas três larguras; fonte ampliada a 200% na biblioteca |
| Falha transitória e retry | Resposta HTTP 503 deliberadamente injetada no transporte do harness; mensagem/axe/retry aprovados, seguido de consulta real. Não substitui banco ou autorização |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Aprovado |
| `npm run build -- --webpack` | Aprovado, incluindo rotas dinâmicas de biblioteca e moderação |
| `git diff --check` | Aprovado |

Os runners visuais usam componentes reais em UI temporária e encaminham APIs para handlers reais, PostgreSQL e sessões opacas reais. O gateway financeiro controlado é injetado explicitamente apenas no teste. Os guards da aplicação principal também são exercitados no runner E2E principal; nenhuma flag de desenvolvimento libera acesso no runtime. O teste de CLI usa somente contas sintéticas verificadas do banco isolado.

São **25 capturas** da 009, com dados exclusivamente sintéticos/controlados. Inspeção visual direta de catálogo desktop, seletor mobile e acompanhamento de solicitações; revisão automatizada de reflow/axe em todos os oito estados.

- [Catálogo desktop](../../test-results/009/browser/catalog-1440.png), [tablet](../../test-results/009/browser/catalog-768.png), [mobile](../../test-results/009/browser/catalog-320.png).
- [Seletor desktop](../../test-results/009/browser/selector-1440.png), [seletor mobile](../../test-results/009/browser/selector-320.png).
- [Cadastro particular](../../test-results/009/browser/private-form-320.png), [proposta](../../test-results/009/browser/request-form-320.png), [acompanhamento](../../test-results/009/browser/requests-1440.png).
- [Moderação](../../test-results/009/browser/moderation-1440.png), [vazio](../../test-results/009/browser/empty-320.png), [erro recuperável](../../test-results/009/browser/error-320.png), [fonte 200%](../../test-results/009/browser/text-zoom-200.png).

Os artefatos estão em diretório ignorado pelo Git, disponível localmente; não foram enviados a serviço externo.

## Limites e operação

Não foi aplicado seed financeiro ou bypass à aplicação principal. Homologação Stripe hospedada e acesso manual com assinatura real seguem dependentes das credenciais que o responsável configurará futuramente. Os testes usam gateway explicitamente controlado apenas no harness, PostgreSQL real, sessões reais e handlers reais; o harness visual não substitui o guard das páginas da aplicação principal.

Banco de desenvolvimento existente e credenciais foram preservados. Para aplicar localmente em ambiente configurado, executar `npm run db:migrate` e `npm run exercises:import`. A importação e as migrations foram exercitadas no banco isolado, não no banco de dados existente do responsável.

Nenhum moderador real foi provisionado. O responsável deve verificar identidade e executar o procedimento CLI documentado; até isso ocorrer, a moderação permanece fechada. A conta sintética com capacidade administrativa existe somente nos testes isolados e não constitui processo de autorização de uma pessoa real.

Revisão técnica profissional do catálogo e definição jurídica da política de contribuições antes da abertura comercial permanecem pendentes. A declaração de compartilhamento é registrada na proposta; não atribui licença CC0 automática a conteúdo particular. Atualização das fontes e traduções requer revisão explícita/versionamento; não existe edição administrativa genérica do catálogo nesta entrega.

Busca atual usa índices/filtros básicos; volume significativamente maior pode justificar índice especializado. Axe e testes de teclado/reflow não são certificação WCAG nem teste humano com leitor de tela. Ampliação de fonte não cobre todos os navegadores/recursos nativos de zoom.

A 010 pode consumir IDs e versões do seletor e criar relações por FK, revalidando autorização e disponibilidade no servidor. Séries, repetições, fichas, aluno executando treino, PDF de treino, mídia, mobile e WhatsApp permanecem fora desta entrega.

Encerramento: verificações finais aprovadas; servidores temporários encerrados e diretórios de harness removidos pelos runners. PostgreSQL descartável parado/removido. Conferência das portas 3108, 3109, 3111 e 5549 sem listeners. Nenhum servidor da entrega ficou rodando. Não foram alterados os arquivos de migrations anteriores ou executados deploy/commit.
