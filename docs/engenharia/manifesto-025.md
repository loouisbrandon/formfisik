# Manifesto de alterações — Marco025

Comparação com baseline local613 arquivos, preservando alterações anteriores não commitadas. Sem deploy/commit ou exclusão de fontes. Evidência de hashes: `test-results/025/source-audit.json`.

## Arquivos modificados

- `src/server/finance/queries.ts`
- `src/server/agenda/queries.ts`
- `src/modules/professional/navigation.ts`
- `tests/security-production-e2e.ts`
- `tests/crm.test.ts`
- `tests/agenda.test.ts`
- `tests/finance.test.ts`
- `tests/operations-e2e.ts`
- `tests/students.test.ts`
- `tests/dashboard.test.ts`
- `tests/consultancies.test.ts`
- `docs/README.md`
- `docs/arquitetura/visao-atual-e-evolucao.md`
- `docs/produto/inventario-funcional.md`
- `docs/privacidade/inventario-e-retencao.md`
- `docs/planejamento/roadmap.md`
- `docs/design/DESIGN_SYSTEM.md`
- `CHANGELOG.md`

## Arquivos criados

- `docs/arquitetura/ADR-026-indicadores-canonicos.md`
- `docs/engenharia/api-inteligencia.md`
- `docs/engenharia/entrega-025.md`
- `docs/engenharia/manifesto-025.md`
- `docs/modulos/inteligencia-de-negocio.md`
- `src/app/(app)/indicadores/page.tsx`
- `src/app/api/intelligence/route.ts`
- `src/modules/intelligence/area.tsx`
- `src/modules/intelligence/schema.ts`
- `src/server/intelligence/handlers.ts`
- `src/server/intelligence/repository.ts`
- `tests/helpers/intelligence-browser-flow.ts`
- `tests/intelligence.test.ts`

Reutilização: leitores transacionais opcionais020/021, shell/navegação, API privada e componentes existentes. Testes de cinco módulos somente redirecionam artefatos ao helper existente; teste de navegação inclui a rota real. Nenhuma migration anterior, relatório histórico, lockfile ou AGENTS alterado. Relatório025 detalha evidências, achados resolvidos e limites.
