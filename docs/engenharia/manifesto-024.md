# Manifesto — Marco024

Escopo relativo ao baseline anterior à implementação, não ao HEAD; preserva o worktree001–023 já alterado. Hashes em test-results/024/source-audit.json. Sem exclusões, dependências novas, commit ou deploy.

## Arquivos novos

- `db/migrations/024_professional_communication.sql`
- `docs/arquitetura/ADR-025-central-comunicacao.md`
- `docs/engenharia/api-comunicacao.md`
- `docs/engenharia/entrega-024.md`
- `docs/modulos/comunicacao.md`
- `docs/operacao/comunicacao.md`
- `docs/privacidade/comunicacao.md`
- `src/app/(app)/alunos/[id]/comunicacao/page.tsx`
- `src/app/(app)/comunicacao/page.tsx`
- `src/app/api/communication/route.ts`
- `src/modules/communication/api.ts`
- `src/modules/communication/area.tsx`
- `src/modules/communication/editors.tsx`
- `src/modules/communication/page.tsx`
- `src/modules/communication/panels.tsx`
- `src/modules/communication/schema.ts`
- `src/server/communication/contexts.ts`
- `src/server/communication/handlers.ts`
- `src/server/communication/notifications.ts`
- `src/server/communication/queries.ts`
- `src/server/communication/repository.ts`
- `tests/communication.test.ts`
- `tests/helpers/communication-browser-flow.ts`
- `docs/engenharia/manifesto-024.md`

## Arquivos alterados

- `CHANGELOG.md`
- `README.md`
- `db/operations/runtime-grants.sql`
- `docs/README.md`
- `docs/arquitetura/visao-atual-e-evolucao.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/modulos/alunos.md`
- `docs/modulos/crm.md`
- `docs/operacao/estabilizacao-016.md`
- `docs/planejamento/roadmap.md`
- `docs/privacidade/inventario-e-retencao.md`
- `docs/produto/inventario-funcional.md`
- `docs/seguranca/controles-e-operacao.md`
- `docs/seguranca/requisicoes-frontend.md`
- `docs/seguranca/superficies-e-endpoints.md`
- `src/modules/crm/card.tsx`
- `src/modules/professional/navigation.ts`
- `src/modules/professional/shell.tsx`
- `src/modules/students/student-area.tsx`
- `src/server/privacy/erasure.ts`
- `tests/checkins.test.ts`
- `tests/dashboard.test.ts`
- `tests/operations-e2e.ts`
- `tests/security-production-e2e.ts`

## Preservação e exceção de artefato

AGENTS, package.json/package-lock, next.config, migrations001–023, relatórios001–023 e módulos de origem permanecem idênticos ao baseline, salvo integrações delimitadas listadas. tests/checkins.test.ts só muda o destino do query-plan para o helper de artefatos existente. Nenhuma alteração de regra de check-in.

A regressão regenerou test-results/022/query-plan.json porque o teste anterior tinha caminho fixo; os bytes originais não estão no baseline de hashes. Não reescrever o relatório ou hash histórico. Ocorrência, hash esperado/regenerado e cópia em test-results/024/historical-artifact-note.json e prior-022-query-plan-rerun.json. Após correção e55testes, o artefato anterior não mudou novamente. Evidências locais geradas não são parte da contagem de fontes; nenhuma sobrescrita conhecida de outros artefatos históricos.
