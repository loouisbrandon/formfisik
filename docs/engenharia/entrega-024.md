# Marco 024 — Central de Comunicação Profissional

Estado: **IMPLEMENTADO — GO LOCAL CONTROLADO**, validado em02/11/2026 (America/Sao_Paulo). FormFisik independente, fundada por Brandon Louis, sem presunção de formalização jurídica. Produção e dados reais permanecem **NO-GO**. Entrega funcional única; não antecipa Connect, canais externos ou mobile.

## Objetivo e resultado implementado

Central `/comunicacao` e contexto `/alunos/[id]/comunicacao`: carteira canônica, busca/filtros, histórico paginado e detalhe sob demanda, modelos reutilizáveis/versionados, prévia server-side, preparado versus contato declarado, correções imutáveis, contexto autorizado e mínimo, avisos internos, pendências CRM e indicadores honestos. [Manual](../modulos/comunicacao.md).

## Auditoria e preservação

AGENTS/guias Next instalados e fontes oficiais lidos antes de codificar; módulos008/017/018/019/021/022, autenticação, SMTP, eventos, segurança, privacidade e DS auditados. Outro chat do projeto não estava ativo.589 arquivos observados duas vezes sem mudança concorrente; baseline de hashes/status anterior à escrita. Worktree001–023 já não commitado preservado, sem reset/checkout/branch/commit. Relatórios e migrations anteriores não reescritos. [ADR-025](../arquitetura/ADR-025-central-comunicacao.md) registra escolhas e exceções.

## Reutilização e arquitetura

Mesmo shell/rolagem, navegação/memória/aviso de perda, action/control/Feedback/Pagination, schemas de texto/data/CRM, sessões opacas/entitlement, Origin/rate/HMAC/body/headers, pg/transações/ownerLock/studentLock/digest e carteira. Serviços CRM criam/concluem as mesmas tarefas. Consultas contextuais são projeções novas mínimas porque os DTOs completos das origens trariam documento/medidas/notas desnecessários; aplicam owner/aluno/versão e não reproduzem regras de execução, agenda ou pagamento.

Não havia central de notificações geral. Projeção SQL usa fatos canônicos e recibos únicos, sem outbox/scheduler ou cópias de eventos de saúde. SMTP permanece transacional da conta. Sem identidade adequada do aluno, nenhuma interface de chat ou credencial paralela. Novas entidades próprias são necessárias à finalidade de comunicação; sem dependência nova ou framework especulativo. [API/modelo e contratos futuros](api-comunicacao.md).

## Persistência e regras

Migration024: seis tabelas (templates, template_versions, records, reads, events, operations), FKs compostas e histórico protegido. Texto simples/variáveis whitelist; prévia com digest, revalidação e confirmação. Modelos versionados e arquiváveis; registros imutáveis com correções da mesma natureza/aluno. Instantes de preparação no servidor e contato declarado no dispositivo com limite técnico. Nenhuma interação gera sent/delivered/read do aluno. Copiar texto não envia. Indicadores excluem duplicação de correções e separam preparado de contato.

Avisos atuais por fato/revisão; leitura apenas do profissional, resolução na origem retira aviso. Pendências são as tarefas018, sem segunda fila. Contexto de avaliação exige atestado/finalidade e nunca projeta medidas no texto. Referência não concede acesso ampliado nem restaura fonte eliminada. Sem execução de treino019/agenda, alteração de pagamento020, diagnóstico ou recomendação clínica automática.

## Segurança e ciclo de vida

Autorização por operação/contexto, DTO mínimo, body32KiB/15s, GET120/POST40/min, schemas strict, texto sem execução, sem conteúdo em logs/eventos/resultados idempotentes. Transações/versões/locks preservam intenção e concorrência. [Privacidade](../privacidade/comunicacao.md): finalidade, minimização, acesso, retenção em governança, correções, arquivo e eliminação016 antes das fontes; retries saneados e invalidados. Backup/restauração reaplicam ledger assinado antes de tráfego. [Operação](../operacao/comunicacao.md) distingue ensaios e gates.

## Testes e evidências verificadas

Regressão integral:433/433 testes aprovados,25 arquivos, zero falhas, cancelamentos ou ignorados (345,5s no ensaio). Repetição final isolada:55/55 (26check-ins +29comunicação), zero falhas/ignorados, após corrigir destinos de artefatos. Testes cobrem templates/variáveis/conteúdo, natureza honesta, contexto/IDOR, datas/preview, versões/correções/retry/concorrência/rollback, fonte resolvida, avisos/leitura única, CRM, DTOs, rate/Origin/sessão, eliminação e2501registros/páginas20. ESLint e TypeScript finais exit0. Build real Next16.4.3/webpack, PostgreSQL18.6, Node24.22.0 e Google Chrome156.0.8078.47 aprovados. Chrome repetiu regressões integradas017–023 e percorreu criação/edição/arquivo/reativação de modelo, prévia/contexto, preparado, correção, contato declarado, clipboard, tarefaCRM, aviso/leitura profissional, indicadores, perfil e histórico.49 capturas:12estados em1440/768/375/320px, mais texto200%/altura reduzida. Axe WCAG2A/AA/2.1AA/2.2AA sem violações nesses estados; envio final e navegação/Escape por teclado, proteção de rascunho e recuperação após503 controlado aprovados. Canários no build estático/público/HTML/respostas/logs: nenhum vazamento detectado. Sem violação CSP ou erro de console inesperado; um erro503 de console esperado da injeção controlada está identificado separadamente, sem ocultar erros gerais. Nenhum envio real.

Medição do percurso:35requisições ao domínio communication; maior payload946bytes. Passagem pelo perfil também chamou os resumos existentes aluno/intake/checkin/workout uma vez cada. Não é teste de carga ou SLA. Snapshot de runtime e hashes dos dois runners conferidos após build, sem mudança durante a validação. Trace do health inclui as24migrations e a nova024.

Operacional aprovado:24migrations,194FKs, nenhuma constraint não validada; atualização013→atual, repetição/rollback/checksum, pg_dump379ms/restore1482ms no ensaio (não SLA), comunicação restaurada e eliminada por replay, outros titulares preservados e runtime restrito. Evidência test-results/024/operations/operations-proof.json.

Falhas intermediárias corrigidas: fixtures tentavam atualizar student_records pelo ID de vínculo e arquivar sem archived_at; instantes clock_timestamp distintos violavam limites de ocupação da agenda. Teste também identificou ausência do trigger de imutabilidade do novo registro: corrigido na migration024 em construção, banco exclusivamente descartável recriado e28/28 aprovados. Verificação de checksum não foi enfraquecida. Erro de tipagem na montagem de comando negativo corrigido. Primeiro Chrome não localizou textarea de modelo preenchido pelo rótulo implícito: aria-label explícito adicionado, fluxo completo repetido e aprovado. A regressão identificou também que o teste022 usava caminho fixo e regenerou test-results/022/query-plan.json; o original não é recuperável dos hashes de baseline. Relatório/veredito histórico não foi reescrito; hash esperado/regenerado e cópia estão em test-results/024/historical-artifact-note.json. Os testes022/024 passaram a usar o helper de artefatos existente, repetição55/55 confirmou isolamento e nenhuma nova alteração do artefato histórico. Esta exceção de evidência gerada está explícita no manifesto. Resultados intermediários não são GO.

## Arquivos, manifesto e reprodução

Novos módulos src/modules/communication e src/server/communication, rotas privadas e migration024; integrações delimitadas em navegação/shell/perfil/CRM, worker016/grants e runners. [Manifesto](manifesto-024.md) e hashes test-results/024/source-audit.json distinguem esta entrega do baseline já alterado.

[Verificação consolidada](../../test-results/024/verification-summary.json), [manifesto de hashes](../../test-results/024/source-audit.json), [Chrome](../../test-results/024/production/communication-proof.json), [backup/restore](../../test-results/024/operations/operations-proof.json).

Evidências: test-results/024/{baseline-source,baseline-git-status,build-source,source-audit,verification-summary,query-plan,cleanup}, logs de integração/regressão/lint/typecheck, production/{after-build,after-production,communication-proof,communication-api-measurements} e capturas, operations/operations-proof.json. Reproduzir somente em `_test`: npm test com TEST_DATABASE_URL exclusivo e TEST_ARTIFACT_ROOT=test-results/024/regression-artifacts; npm run test:operations com TEST_POSTGRES_CONTAINER=formfisik-024-test/OPERATIONS_EVIDENCE_DIR; npm run test:security:e2e -- --build com flags TEST_INTAKE_FLOW/CRM/CONSULTANCIES/FINANCE/AGENDA/MEDIA/CHECKIN/COMMUNICATION_FLOW=1, SECURITY_EVIDENCE_DIR e banco de produção sintético separado. Nenhuma credencial real necessária.

## Limitações e veredito

**GO LOCAL CONTROLADO** para o escopo autorizado, implementado, integrado, testado e documentado. Container descartável removido; portas3443/3112/5554/15260/3130/3131 fechadas, sem serviços temporários em execução. Produção/dados reais NO-GO015–023, governança/infraestrutura/provedores/piloto e Personal1.0 não homologados. Não há canal externo, chat autenticado de aluno, anexos, push, taxa de entrega/leitura/resposta ou envio real. Avisos são projeções atuais, não caixa externa nem arquivo de todas as condições resolvidas; históricos permanecem nas fontes. Clipboard/canais manuais não comprovam entrega. Auditoria local automatizada não certifica dispositivos físicos, leitores humanos ou conformidade jurídica. Sem deploy, commit, serviço pago, credencial real ou migration persistente.
