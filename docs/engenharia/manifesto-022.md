# Manifesto de alterações — Marco 022

Escopo relativo ao snapshot anterior à implementação, não ao HEAD: o worktree já continha as entregas anteriores. Sem exclusões, dependências novas, commit ou deploy. Hashes verificáveis em `test-results/022/source-audit.json`. O próprio manifesto integra os arquivos novos.

## Arquivos novos

- `db/migrations/023_student_checkins.sql`
- `docs/arquitetura/ADR-024-checkins-e-finalidades.md`
- `docs/engenharia/api-checkins.md`
- `docs/engenharia/entrega-022.md`
- `docs/modulos/checkins.md`
- `docs/privacidade/checkins.md`
- `src/app/(app)/alunos/[id]/checkins/page.tsx`
- `src/app/(app)/checkins/page.tsx`
- `src/app/api/checkins/public/route.ts`
- `src/app/api/checkins/route.ts`
- `src/app/responder/check-in/page.tsx`
- `src/modules/checkins/api.ts`
- `src/modules/checkins/area.tsx`
- `src/modules/checkins/assignment.tsx`
- `src/modules/checkins/detail.tsx`
- `src/modules/checkins/feedback.tsx`
- `src/modules/checkins/page.tsx`
- `src/modules/checkins/public-form.tsx`
- `src/modules/checkins/schedule.ts`
- `src/modules/checkins/schema.ts`
- `src/modules/checkins/standard.ts`
- `src/modules/checkins/student-summary.tsx`
- `src/server/checkins/handlers.ts`
- `src/server/checkins/queries.ts`
- `src/server/checkins/repository.ts`
- `src/server/forms/capability.ts`
- `tests/checkins.test.ts`
- `docs/engenharia/manifesto-022.md`

## Arquivos alterados

- `CHANGELOG.md`
- `README.md`
- `db/operations/runtime-grants.sql`
- `docs/README.md`
- `docs/arquitetura/visao-atual-e-evolucao.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/engenharia/api-anamneses.md`
- `docs/engenharia/api-consultorias.md`
- `docs/engenharia/api-crm.md`
- `docs/modulos/alunos.md`
- `docs/modulos/anamneses.md`
- `docs/modulos/crm.md`
- `docs/modulos/treinos.md`
- `docs/operacao/estabilizacao-016.md`
- `docs/planejamento/roadmap.md`
- `docs/privacidade/inventario-e-retencao.md`
- `docs/produto/inventario-funcional.md`
- `docs/seguranca/controles-e-operacao.md`
- `docs/seguranca/requisicoes-frontend.md`
- `docs/seguranca/superficies-e-endpoints.md`
- `src/modules/assessments/series.ts`
- `src/modules/crm/card.tsx`
- `src/modules/crm/schema.ts`
- `src/modules/intake/builder.tsx`
- `src/modules/intake/public-form.tsx`
- `src/modules/professional/navigation.ts`
- `src/modules/professional/shell.tsx`
- `src/modules/students/student-area.tsx`
- `src/server/crm/facts.ts`
- `src/server/intake/repository.ts`
- `src/server/privacy/erasure.ts`
- `tests/dashboard.test.ts`
- `tests/helpers/security-production-fixture.ts`
- `tests/operations-e2e.ts`
- `tests/security-production-e2e.ts`

## Preservação

AGENTS.md, package.json, package-lock.json, next.config.ts, migrations anteriores e relatórios das entregas anteriores permanecem idênticos ao baseline. Alterações de módulos existentes limitam-se às integrações/reutilização descritas no [relatório](entrega-022.md). Evidências temporárias, builds e logs em test-results/022 não são atribuídos como código de entregas anteriores. Nenhuma migration foi executada em banco persistente.
