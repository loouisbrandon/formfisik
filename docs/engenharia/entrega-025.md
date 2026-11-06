# Marco 025 — Inteligência de negócio e indicadores profissionais

Estado: IMPLEMENTADO — GO local controlado em02/11/2026. Produção permanece NO-GO015–024; Personal1.0 não homologada. FormFisik é independente, fundada por Brandon Louis; não se presume constituição jurídica formalizada.

## Escopo e implementação

Área `/indicadores`, integrada ao ProfessionalShell e navegação, com visão executiva e cinco áreas: carteira, comercial/consultorias, financeiro, agenda e acompanhamento. Filtro de até367 datas civis, comparação adjacente de duração igual, definições e escopo por métrica, numerador/denominador de resposta, gráfico acessível e tabelas HTML equivalentes, links canônicos e estados de carregamento/erro/retry. Sem dados de saúde ou identidade individual de alunos no DTO.

[Definição formal de todas as métricas](../modulos/inteligencia-de-negocio.md) · [API](api-inteligencia.md) · [ADR026](../arquitetura/ADR-026-indicadores-canonicos.md) · [manifesto](manifesto-025.md).

Carteira atual é separada de contrato vigente. Evolução acumulada considera vínculos ainda existentes, sem retenção histórica inventada. Etapas CRM são contagens de vínculos atuais, não oportunidades qualificadas. Conversão comercial retorna null: não existe classificação histórica confiável de ganha/perdida nem denominador aprovado. Ativações/retomadas e renovações administrativas têm semânticas distintas. Cancelamentos usam eventos canônicos, não estado terminal como data fictícia.

Financeiro separa valor contratado, nominal previsto, cobrança referenciada, confirmado pelo provedor, externo declarado, externo conferido, saldo pendente, reembolso/contestação atuais da coorte e divergências. Não somar conferido ao declarado novamente, não tratar contrato como receita, nem afirmar Stripe Connect externo homologado. Agenda reutiliza duração/interseções/ocupação021 e não presume pagamento/cumprimento. Check-ins usam ocorrências, não revisões como novas respostas; cancelados e prazos futuros ficam fora do denominador da taxa.

## Auditoria e reutilização

Antes das alterações: AGENTS, fontes oficiais, roadmap/inventário, arquitetura, segurança/privacidade/Design System e módulos existentes consultados; estado Git registrado sem reset. Outro chat do projeto estava notLoaded, sem concorrente ativo identificado. Baseline613 arquivos em `test-results/025/baseline-source.json`, estado Git separado; trabalhos anteriores não commitados preservados.

| Fonte existente | Reutilização / justificativa |
| --- | --- |
| Identidade001–003 e acesso004–007 | Sessões opacas/role/e-mail/habilitação/entitlement, SSR e API, sem JWT ou novo login |
| Carteira008, CRM018 e acordos019 | Agregações SQL sobre tabelas canônicas; nenhum cadastro, conversão ou evento duplicado |
| Financeiro020 | `queryFinance` com executor transacional opcional, mantendo consumidores anteriores; nenhuma regra de recebimento reimplementada |
| Agenda021 | `queryAgenda` com executor opcional e leitura de configuração sem inicialização na transação read-only; algoritmo de ocupação mantido |
| Ocorrências022 | Contagens sem consultar respostas/feedback clínico; correções não multiplicam ocorrências |
| Shell/Design System/feedback | Componentes, tokens e memória privada existentes; sem biblioteca gráfica ou dependência nova |
| Documentos011/014 | Não reutilizados para exportação empresarial: contratos exigem aluno/prescrição/finalidade individual. Exportação é opcional e permanece fora desta versão, com justificativa documentada |
| Eliminação/restore016 | Nenhuma persistência analítica nova; agregados leem fatos após eliminação/replay, sem cache que ressuscite dados |

Novo serviço de consulta e DTO por domínio são necessários para reunir fontes num snapshot consistente; não há contrato anterior que entregue essa projeção empresarial. Transação READ ONLY REPEATABLE READ cobre ambos os períodos, com fusoSãoPaulo e agenda no próprio fuso. Séries usam GROUP BY e janela SQL; consultas fixas em relação ao número de alunos, sem N+1 ou leitura de documentos individuais. Migrations existentes não foram alteradas e não há migration025 para esta área somente de leitura.

## Segurança e privacidade

Autenticação e autorização no servidor em página e API; owner exclusivamente da sessão e predicados em todas as fontes. Schema strict de datas/limites, rate durável HMAC30/min, SQL parametrizado, DTO mínimo, no-store/no-referrer/nosniff e falhas estáticas sem dados/SQL. Sem POST de análise, identidade pública, tokens, exportação, dados corporais ou compartilhamento externo. Nomes privados de etapas não são anonimização. Inventário de tratamento atualizado; nenhum prazo jurídico inventado.

Canários no build efetivo, CSP, cookies Secure/HttpOnly/SameSite, troca de conta, logout e regressões de autenticação foram exercitados no navegador. Produção permanece bloqueada e não há dados reais.

## Validação verificável

Ambiente: Node24.22.0, Next16.4.3/webpack, Chrome156.0.8078.47, PostgreSQL18 em contêiner descartável exclusivamente sintético, sem serviços externos. Relatórios e logs em `test-results/025/`.

| Verificação | Resultado / evidência |
| --- | --- |
| Regressão completa | 446 testes executados,445 passaram e1 expectativa antiga de navegação falhou; corrigida e revalidada abaixo. `regression.log` preserva a execução inicial, sem ocultar a falha |
| Navegação + indicadores + agenda + financeiro após correções | 80/80,0 falhas/skip/cancel em `target-final.log` |
| Indicadores finais, incluindo escritor concorrente | 13/13,0 falhas/skip/cancel em `intelligence-final.log`; snapshot coerente enquanto estado cadastral muda |
| ESLint / TypeScript | Sem erros nos logs próprios; build real também executa TypeScript |
| Build real / Chrome final | `production-release/after-build.log`, `after-production.json` e `intelligence-proof.json`: PASS;28 capturas,0 violações Axe,4 larguras, altura500, texto200%, teclado,2 tabelas semânticas e erro503/retry controlado. Canários/CSP/erros inesperados vazios |
| Chrome integrado | `production-final/after-production.json`: todos os fluxos habilitados de anamneses,CRM,consultorias,financeiro,agenda,mídia,check-ins,comunicação e indicadores verificados, além do núcleo profissional; canários/CSP/erros inesperados vazios. Dois503 controlados (inteligência/comunicação), classificados separadamente |
| Backup/restore e menor privilégio | `operations/operations-proof.json`:24 migrations,194FK,0 inválidas; upgrade/rollback/checksum, pg_dump/restore, replay de eliminação e runtime restrito PASS. Nenhuma persistência analítica adicional |
| Volume sintético | 2.501 vínculos,30 datas por série, relatório23.102bytes; `performance/025/query-plan.json`. Plano de uma agregação executou em cerca de4ms neste ensaio; não é latência total da API nem SLA/p95 |
| Preservação | Hashes e manifesto comparados à baseline; migrations/relatórios anteriores e arquivos de configuração protegidos, sem exclusões autorizadas |

Foram corrigidas incompatibilidades do build (literais BigInt/alvo e inferência do leitor de agenda) e rotulagem do seletor. A alternativa do gráfico foi refinada para tabelas HTML semânticas, com nova validação focada do build final. Falhas intermediárias permanecem nos logs `production-initial-build-failure.log` e `production-first-browser.log`. Regressões dos módulos de origem e o teste integrado precedente permanecem válidos; as alterações finais se restringem às tabelas da nova área e metadado de unidade da conversão indisponível.

Testes antigos de cinco módulos gravavam artefatos em caminhos históricos fixos. Foram migrados ao helper existente `artifactPath`, com `TEST_ARTIFACT_ROOT` desta execução, sem mudar regras/assertions dos domínios. Evita repetir a sobrescrita histórica registrada na024; evidências anteriores não foram deliberadamente regeneradas.

## Limites e veredito

Não é demonstrativo contábil, taxa comercial presumida, retenção reconstruída, ocupação histórica comprovada, diagnóstico ou adesão automática. Exportação empresarial, carga representativa/p95, aparelhos físicos/leitor de tela humano, integrações externas, política jurídica/operacional e homologação Personal1.0 continuam fora do aceite local. Axe não certifica WCAG global.

Sem deploy, commit automático, credenciais reais, recursos externos, cobrança ou migrations em banco persistente. Marco026 não será iniciado antes do GO local e checkpoint estável documentado.

**Veredito independente025: GO local controlado.** Os achados intermediários foram corrigidos e as verificações finais pertinentes passaram. Não existe falha de teste conhecida pendente; a execução inicial com1 falha foi preservada e a cobertura afetada foi revalidada. Sem afirmar446/446 em uma única execução limpa. Build final corresponde aos hashes em `build-source.json`; snapshot inicial, manifesto, verificações e cleanup constam de `verification-summary.json` e `checkpoint.json`. Marco026 só começa após esse checkpoint. Produção e dados reais continuam NO-GO.
