# Entrega 004 — Plano Pro e fluxo de apresentação da contratação

Estado: implementado e validado. Não há operação financeira nesta entrega. Nenhum deploy ou recurso externo foi criado.

## Resultado funcional

Página autenticada `/assinatura`, exclusiva para profissional com e-mail confirmado, apresenta o único plano FormFisik Pro. Informa R$ 139,90/mês, 30 dias gratuitos, cartão obrigatório, cobrança automática após o teste salvo cancelamento anterior e acesso completo durante trial/assinatura ativa como regra comercial futura. A página deixa claro que checkout e módulos de gestão ainda não estão disponíveis.

Login e entrada de profissionais em `/login` ou `/dashboard` encaminham à oferta; `/conta` permanece acessível por navegação e possui link para o plano. Link Planos do header público aponta para a rota protegida. Não confirmado/sem sessão é encaminhado ao login; outro perfil permanece na conta, sem contratação.

Botão “Iniciar teste de 30 dias” desativado, com justificativa visível e acessível desde a renderização. A consulta real de disponibilidade no servidor possui loading e erro recuperável, sem iniciar checkout. Endpoint não aceita ou processa cartão e não cria registros comerciais. paidAccess permanece false no servidor.

## Arquivos envolvidos

| Área | Arquivos |
| --- | --- |
| Página e estados | `src/app/(app)/assinatura/page.tsx`, `loading.tsx`, `error.tsx`, `src/modules/subscriptions/checkout-status.tsx` |
| Oferta e contratos | `src/modules/subscriptions/plan.ts`, `src/modules/subscriptions/contracts.ts` |
| Backend | `src/server/subscriptions/availability.ts`, `src/app/api/subscriptions/availability/route.ts`, `src/services/api/endpoints.ts` |
| Navegação/auth | `src/server/access.ts`, `src/server/auth.ts`, `src/modules/auth/login-form.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/conta/page.tsx`, `src/components/layout/header.tsx` |
| Testes | `tests/auth.test.ts`, `tests/e2e.ts` |
| Documentação | modelo de negócio, módulo de assinaturas, autenticação, Design System, ADR-004, roadmap, README, CHANGELOG, este relatório |

Nenhuma migration necessária: não há fato financeiro ou assinatura a persistir nesta etapa. Não foi instalado SDK ou adicionado segredo de gateway. Alterações anteriores no diretório foram preservadas.

## Regras e arquitetura

Fonte comercial: [modelo de negócio](../estrategia/modelo-de-negocio.md). Catálogo em centavos/moeda/periodicidade separado da apresentação. Tipos internos planejados para Checkout, Portal e estados normalizados não executam integração. Backend de disponibilidade separado da futura camada de provedor. Decisão: Stripe escolhida para Checkout, Billing, Portal e webhooks; implementação desses serviços continua planejada, conforme [ADR-004](../arquitetura/ADR-004-plano-pro.md).

Endpoint implementado GET /api/subscriptions/availability: valida sessão/role/confirmação e retorna indisponibilidade explícita; 401/403/503 para falhas apropriadas. Não expõe segredos, não concede acesso e usa no-store. Contratos futuros exigirão autenticação, preço do servidor, eventos assinados/idempotentes e estado real antes de liberar recursos; não há antecipação das entregas 005/006.

## Validação

- `npm test`: **38 testes passaram**, zero falhas/skips. Inclui catálogo único, preço/periodicidade/trial/cartão, disponibilidade para profissional confirmado, recusa de sessão ausente/não confirmada/outro perfil e negação de acesso pago; regressões de cadastro/login/reset mantidas.
- `npm run lint`, `npm run typecheck` e `git diff --check`: passaram.
- `npm run build`: passou, Next.js 16.4.3 com Turbopack; página de assinatura e API de disponibilidade dinâmicas.
- `npm run test:e2e`: passou no Chrome, incluindo preço/formatação, trial de 30 dias, cartão, cobrança e cancelamento, botão desativado, erro 503 controlado e retry, navegação assinatura/conta/dashboard/login, proteção de rota e regressões completas das entregas anteriores.
- Axe com tags WCAG 2 A/AA, 2.1 AA e 2.2 AA: zero violações reportadas na página Pro em desktop e mobile avaliados. Capturas 1440 px e 375 px revisadas visualmente e sem overflow horizontal no mobile. Não equivale a certificação global de acessibilidade.
- Evidências visuais locais: test-results/pro-desktop.png e test-results/pro-mobile.png (ignoradas pelo Git). Injeção de 503 é exclusivamente um cenário de falha do teste, não simulação de contratação.
- Aplicação/SMTP temporários e PostgreSQL local descartável encerrados após os testes. Nenhuma chamada financeira Stripe ocorreu.

Ambiente: PostgreSQL 18 isolado e SMTP local para as regressões de autenticação. Teste de UI usa Chrome. Comandos reproduzíveis com TEST_DATABASE_URL apontando para banco descartável terminado em `_test`; testes fazem TRUNCATE e não devem compartilhar banco de produção.

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build
git diff --check
```

## Limitações e pendências

Checkout, coleta de cartão, trial, cobrança, Billing, Portal, webhooks, persistência de assinatura e entitlement comercial não implementados por restrição explícita desta entrega. Benefícios não incluem PDF, biblioteca, métricas ou módulos não definidos; descrição fica no escopo do produto de gestão de treinos.

Regras após cobrança (inadimplência, reembolso, efeitos do cancelamento) precisam de definição antes da implementação correspondente. Stripe não foi chamada e nenhum recurso financeiro foi criado. Railway permanece hospedagem inicial planejada, sem deploy.

Verificação de acessibilidade automatizada e teclado não é certificação global nem teste com leitor de tela real. Configuração operacional de produção, provedor, ambiente de teste Stripe e credenciais dependerão de autorização futura. Contratação indisponível é o resultado correto atual, não um bloqueio escondido nem sucesso simulado.
