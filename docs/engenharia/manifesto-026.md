# Manifesto de alterações — Marco026

Comparação com baseline626 fontes após checkpoint025, mais dois modelos CSV estáticos criados nesta entrega. Preserva alterações anteriores não commitadas. Hashes em `test-results/026/source-audit.json`; não comparar somente com HEAD, que precede várias entregas já existentes.

## Modificados

- `CHANGELOG.md`
- `db/operations/runtime-grants.sql`
- `docs/README.md`
- `docs/arquitetura/visao-atual-e-evolucao.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/modulos/alunos.md`
- `docs/modulos/exercicios.md`
- `docs/modulos/modelos-de-treinamento.md`
- `docs/planejamento/roadmap.md`
- `docs/privacidade/inventario-e-retencao.md`
- `docs/produto/inventario-funcional.md`
- `package.json`
- `src/modules/professional/navigation.ts`
- `src/server/privacy/erasure.ts`
- `src/server/workouts/repository.ts`
- `tests/dashboard.test.ts`
- `tests/operations-e2e.ts`
- `tests/security-production-e2e.ts`

## Criados

- `db/migrations/025_professional_imports.sql`
- `docs/arquitetura/ADR-027-importacao-transacional.md`
- `docs/engenharia/api-importacao.md`
- `docs/engenharia/entrega-026.md`
- `docs/engenharia/manifesto-026.md`
- `docs/modulos/importacao.md`
- `docs/operacao/importacao.md`
- `public/import-models/alunos.csv`
- `public/import-models/exercicios.csv`
- `scripts/cleanup-imports.ts`
- `src/app/(app)/importar/page.tsx`
- `src/app/api/imports/route.ts`
- `src/modules/imports/api.ts`
- `src/modules/imports/area.tsx`
- `src/modules/imports/file-form.tsx`
- `src/modules/imports/files.ts`
- `src/modules/imports/preview.tsx`
- `src/modules/imports/schema.ts`
- `src/server/imports/handlers.ts`
- `src/server/imports/repository.ts`
- `tests/helpers/imports-browser-flow.ts`
- `tests/imports.test.ts`

Nenhuma fonte da baseline foi excluída. Migrations001–024, relatórios/manifestos anteriores inclusive025, AGENTS, lockfile e next.config preservados. package.json recebe somente comando operacional imports:cleanup; nenhuma dependência nova. Writer010 extraído sem novo modelo, grants e eliminação ampliados para026; relatório independente registra testes/evidências/limites. Artefatos sintéticos permanecem em test-results/026, separados dos históricos. Sem commit, deploy ou migration persistente.
