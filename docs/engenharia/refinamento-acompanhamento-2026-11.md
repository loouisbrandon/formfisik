# Refinamento visual do acompanhamento — 05/11/2026

Estado: IMPLEMENTADO e validado localmente. FormFisik é empresa independente fundada por Brandon Louis. Sem deploy, commit, nova dependência ou migration. Homologação de produção permanece fora deste escopo.

## Entrega

Carteira com busca literal por nome, filtros administrativos, ordenação, paginação real de 20 alunos, três indicadores existentes e painel de atenção limitado a cinco vínculos. Seleção para nova avaliação em dialog reutiliza StudentsPicker. Detalhe individual com identidade, ações, indicadores, resumo de evolução em duas colunas, última avaliação, agenda e painéis progressivos de avaliações/histórico e fotografias. Claro/noturno por tokens compartilhados; largura do shell até 2200px.

Reutilização: assessmentCounts, autorização comercial e sessão, AssessmentEditor, EvaluationDetail, ComparisonPanel, EvolutionWorkspace, EvolutionChart, ProgressCalendar, PhotoArea e exportação existentes. Nova consulta de carteira necessária porque o seletor anterior não fornecia data/situação agregada por aluno; DTO mínimo não expõe medidas, notas ou contatos. Somente leitura, dados existentes. Nenhum dado das referências inserido no ambiente do usuário.

## Manifesto desta alteração

- `src/modules/assessments/portfolio.tsx` e `assessment.module.css`: carteira, seleção e linguagem visual.
- `src/modules/assessments/area.tsx`: composição individual; operações existentes preservadas.
- `src/modules/assessments/evolution.tsx` e `chart.tsx`: controles compactos e títulos sem duplicação; cálculos e pontos preservados.
- `src/modules/assessments/schema.ts`: query e DTO de carteira.
- `src/server/assessments/repository.ts`, `handlers.ts` e `src/app/api/assessments/portfolio/route.ts`: consulta paginada isolada e autorizada.
- `src/modules/professional/shell.tsx`: largura compartilhada para acompanhamento.
- `tests/assessments.test.ts`: caso de isolamento, minimização, filtros, paginação e autorização da carteira.
- `tests/assessments-e2e.ts` e `tests/helpers/assessments-browser-server.ts`: adaptação da regressão às novas telas/rota.
- Documentação: módulo, contrato da API, Design System e este relatório.

O checkout já continha alterações anteriores nesses módulos e em outros; este manifesto não atribui todo o diff existente à presente entrega.

## Evidências

- TypeScript: `npm run typecheck` aprovado.
- ESLint: `npx eslint src tests` aprovado. `npm run lint` global encontra 25 erros de imports CommonJS nos scripts temporários anteriores em `test-results/local`; código da aplicação e testes fonte sem erros. Esses artefatos não foram apagados nem regras de lint relaxadas.
- Build real: `npm run build -- --webpack` aprovado após os ajustes finais. Primeira execução restrita falhou ao consultar `tsc --showConfig`; execução com permissões de processo adequadas passou.
- Integração: 17/17 testes em PostgreSQL auxiliar `formfisik_dashboard_test`; não usa o banco da carteira local. Inclui autorização, isolamento, concorrência, idempotência, arquivamento, precisão e nova consulta.
- Chrome E2E: criação parcial, validação de campos, edição, concorrência/409, arquivar/reativar, comparação automática/manual, histórico extenso, períodos, IDOR, falha controlada/retry, integração com perfil, teclado e texto a 200%. Axe em 1440/768/320 px sem violações detectadas. Evidências em `test-results/012/browser/`.
- Chrome nas rotas reais: 20 combinações (carteira/detalhe × claro/escuro × 1920×1080,1440×900,768×900,320×740,1440×500), Axe WCAG A/AA sem violações detectadas. Sem overflow horizontal/documento externo; rolagem interna preservada. Busca sem resultados, seleção/Escape, painéis e abertura do editor verificados. `test-results/local/assessment-verification.json` e `assessment-*.png`.
- Logs desta execução: `/tmp/formfisik-assessment-e2e.log`, `/tmp/formfisik-assessment-build.log`, `/tmp/formfisik-assessment-visual.log`. Artefatos locais não versionados.

## Limitações e decisões

Não há conceito persistido de próxima revisão ou avaliação pendente de revisão: a interface usa ausência de avaliação em 30 dias, sem alegar atraso clínico. Não há composição corporal estimada nem linha interpolada. Variação continua disponível na comparação entre avaliações existentes; o resumo mostra a data real da última avaliação. Gráficos vazios na carteira de testes refletem ausência real de medições. Fotografias e exportação reutilizadas, sem nova homologação de armazenamento externo. Assinatura do usuário local continua usando provedor controlado, não Stripe real. Revisão visual não equivale a certificação de acessibilidade ou liberação de produção.
