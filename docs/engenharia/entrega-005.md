# Entrega 005 — Stripe Checkout e trial local

Estado: implementação preparada e validada com PostgreSQL e provedor controlado. **Validação no Checkout hospedado pendente**: o responsável informou não possuir chaves e solicitou deixar tudo preparado para configurar depois. Não declarar fluxo com cartão Stripe validado ou entrega comercial homologada.

FormFisik é empresa independente. Nenhum recurso financeiro externo foi criado, nenhuma credencial real foi inventada, nenhum deploy ou cobrança real foi realizado. Não alteramos arquivo de ambiente existente.

## Resultado funcional

Backend oficial Stripe, Checkout autenticado exclusivo para profissional confirmado, oferta única Pro BRL 13990/mês, cartão obrigatório e 30 dias de trial. Usuário/cliente e tentativas persistidos no PostgreSQL. Chaves de idempotência duráveis e locks/índices previnem sessões e assinaturas duplicadas; trial só pode ser utilizado uma vez por usuário elegível.

Webhook verifica assinatura e timestamp sobre bytes brutos, recusa modo live, deduplica eventos e consulta estado canônico sob lock. Confirmação e registro do evento são transacionais. Falhas ficam retryáveis, sem ativação antecipada. Não persistimos cartão/CVV/payload bruto.

Oferta habilita o botão somente quando existe configuração local completa e conta elegível. Sem chaves permanece indisponível. Retorno protegido consulta somente o Checkout associado à sessão do usuário; parâmetros da URL não concedem acesso ou selecionam clientes de terceiros. Acesso inicial requer trial confirmado/vigente e verificação recente no servidor. Expiração independe de webhook; falha de reconciliação nega acesso. Login continua independente da Stripe.

## Arquivos e módulos

| Área | Arquivos |
| --- | --- |
| Persistência | `db/migrations/004_stripe_checkout.sql` |
| SDK/configuração | `src/server/subscriptions/stripe.ts`, `.env.example`, `package.json`, `package-lock.json` |
| Domínio/segurança | `src/server/subscriptions/service.ts`, `status.ts`, `handlers.ts`, `availability.ts`, `src/server/access.ts` |
| HTTP | `src/app/api/subscriptions/checkout/route.ts`, `status/route.ts`, `src/app/api/stripe/webhook/route.ts`, `src/services/api/endpoints.ts` |
| UI e navegação | `src/modules/subscriptions/checkout-status.tsx`, `subscription-result.tsx`, `contracts.ts`, `src/app/(app)/assinatura/page.tsx`, `assinatura/retorno/page.tsx`, `conta/page.tsx`, `dashboard/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/server/auth.ts` |
| Testes | `tests/stripe.test.ts`, `tests/auth.test.ts`, `tests/e2e.ts` |
| Documentação | módulo assinaturas/autenticação, operação Stripe/ambientes, ADR-005, Design System, modelo de negócio, roadmap, README, CHANGELOG e este relatório |

Arquivos de entregas anteriores já estavam alterados no diretório; foram preservados. Não houve commit ou limpeza destrutiva.

## Validação executada

- `TEST_DATABASE_URL=.../formfisik_test npm test`: **52 testes passaram**, zero falhas/skips. PostgreSQL 18 isolado, migrations aplicadas e reaplicadas pelo runner sem duplicação.
- Dos 52, **14 testes Stripe controlados**: proteção test-only; autenticação/origem e manipulação de oferta; parâmetros de cartão/preço/trial; concorrência; timeout após criação com retry idempotente; tentativa conhecida expirada versus incerta; preço inválido/live; trial canônico persistido; eventos duplicados/fora de ordem; assinatura criptográfica real via SDK com segredo artificial de teste; associação/método inválidos; retorno sem autoridade; falha retryável/colunas sem dados sensíveis; expiração e limites persistentes.
- Regressões de cadastro, Argon2id, confirmação SMTP, login, expiração/logout e recuperação com revogação mantidas.
- `npm run lint` e `npm run typecheck`: passaram sem avisos.
- `npm run build -- --webpack`: passou como build de produção Next.js 16.4.3. `npm run build` padrão Turbopack falhou primeiro por acesso a fontes e depois por bloqueio de porta interna no ambiente; Webpack foi a alternativa validada, sem alterar o script padrão do projeto.
- `npm run test:e2e`: Chrome com PostgreSQL/SMTP reais locais. Verifica oferta, indisponibilidade real sem chaves, erro/retry, retorno com URL forjada sem concessão de acesso, navegação e regressões completas da autenticação. Cenário adicional de botão pronto/POST com erro usa interceptação explicitamente controlada de UI, sem Stripe externa.
- Axe nas telas Pro/retorno em 375 px e 1440 px: zero violações nas tags WCAG 2 A/AA, 2.1 AA e 2.2 AA avaliadas. Sem overflow; captura mobile do retorno inspecionada. Não equivale a certificação global ou teste com leitor de tela real.
- `git diff --check`: passou. Evidências locais ignoradas pelo Git em `test-results/checkout-return-375.png`, `checkout-return-1440.png`, `pro-mobile.png` e `pro-desktop.png`.

Os testes controlados não validam o contrato real em rede com a versão atual da API Stripe. Não houve aceitação/recusa de cartão no Checkout hospedado, cobrança, recurso financeiro externo ou fluxo hospedado completo. Não existe provider simulado selecionável por ambiente em runtime.

`npm audit --json` consultado: 21 alertas (2 baixos, 19 moderados; zero altos/críticos) na árvore atual, incluindo ferramentas ESLint/shadcn e transitivas. O relatório propõe downgrades incompatíveis em dependências existentes; não foi aplicado `audit fix --force`. Requer revisão de dependências antes de liberação de produção; não é alegado audit limpo. Nenhum alerta foi atribuído ao SDK Stripe pelo relatório consultado.

## Configuração pendente e limites

Configurar futuramente `.env.local` com STRIPE_SECRET_KEY (sk_test_), STRIPE_PRODUCT_ID, STRIPE_PRICE_ID e STRIPE_WEBHOOK_SECRET do listener Stripe CLI, mantendo APP_URL local. [Procedimento completo e roteiro de homologação](../operacao/stripe-local.md).

Após configurar, validar cartão aceito/recusado e autenticação adicional no provedor, retorno confirmado, webhook real, persistência e impedimento de segundo trial. Não enviar segredos pelo chat. Sem configuração não é possível concluir esta homologação; a interface mostra indisponibilidade correta.

Contratos, estados, limites de rate limiting, esquema e falhas: [módulo](../modulos/assinaturas.md). Decisões de concorrência/reconciliação: [ADR-005](../arquitetura/ADR-005-stripe-checkout.md).

006 permanece responsável por ciclo completo de cobrança/renovação, inadimplência, cancelamento e Portal. Cancelamento neste ambiente de teste é operacional pelo Dashboard de teste; não há lançamento público ou produção habilitada. Suspeita de operação externa incerta exige reconciliação manual antes de nova chave. O controle de um trial é por usuário, sem deduplicação legal entre múltiplas contas de uma mesma pessoa. Nenhum módulo mobile/treinos foi desenvolvido.

## Encerramento do ambiente

E2E final passou incluindo botão pronto/erro controlado. PostgreSQL Docker descartável encerrado e removido (--rm), Next/SMTP temporários encerrados pelo runner; porta 3108 conferida sem servidor acessível. O projeto não foi deixado rodando.
