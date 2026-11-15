# Stripe Billing — preparação para homologação local

Data: 07/11/2026. Estado: PREPARADO / homologação externa BLOQUEADA por configuração incompleta. Não comprova produção. Primeira entrega: auditoria e instruções; nenhuma chamada Stripe externa, operação financeira, migration ou alteração de banco executada.

## Evidências da auditoria

Lidos AGENTS.md, entregas005/006, runbook Stripe local, SDK/gateway, handlers, disponibilidade, autorização e testes existentes. Checkout, webhooks, ciclo, Portal e reconciliação já existem e serão reutilizados. Rota correta: POST /api/stripe/webhook, distinta de Connect. Configuração test-only exige sk_test_, origem local, produto/preço e assinatura whsec_. O catálogo canônico valida teste, ativos, BRL13990, recorrência mensal intervalo1/licensed e produto esperado. Trial30 dias é definido no servidor; retorno não concede acesso. Sessão e vínculo do cliente são conferidos; eventos assinados/deduplicados, persistência transacional, trial único e reconciliação existentes.

Inspeção local sem revelar valores: APP_URL corresponde a localhost:3000; STRIPE_SECRET_KEY tem prefixo de teste (validade não verificada); STRIPE_PRODUCT_ID corresponde ao produto informado prod_Va5qCRAdfT5JFO; STRIPE_PRICE_ID preenchido (catálogo ainda não consultado); STRIPE_WEBHOOK_SECRET e STRIPE_PORTAL_CONFIGURATION_ID ausentes/vazios. .env.local ignorado e não rastreado. Stripe CLI não encontrado no PATH. Preservados os valores existentes; placeholders ausentes preparados sem segredos.

## Passos do responsável

1. Instalar Stripe CLI conforme https://docs.stripe.com/cli/install (por exemplo npm install -g @stripe/cli no terminal local). Conferir stripe --version e executar stripe login no mesmo sandbox de teste.
2. Abrir .env.local no editor local. Preservar chave sk_test_ e produto existentes; conferir o price_ no produto já criado, lookup formfisik_pro_monthly. Não criar produto/preço novo.
3. Executar stripe listen --forward-to http://localhost:3000/api/stripe/webhook. Copiar o segredo do listener diretamente para STRIPE_WEBHOOK_SECRET local, sem enviar ao chat ou registrar em evidência. Manter listener aberto.
4. No Customer Portal de teste obter STRIPE_PORTAL_CONFIGURATION_ID bpc_. Exigido: ativo/teste, payment_method_update e invoice_history habilitados; subscription_cancel e subscription_update desabilitados. Cancelamento usa a aplicação. Não criar configuração live.
5. Reiniciar Next após salvar. Antes de Checkout/mutações, conferir preço na API: moeda brl, unit_amount13990, recurring.interval month, interval_count1, usage_type licensed, produto esperado e ambos ativos/teste. Lookup key não substitui price_ na implementação existente.
6. Homologar com dados sintéticos em banco descartável separado. Não apontar suites ao banco local existente: executam TRUNCATE. Não rodar migrations ou reconciliação no banco persistente nesta etapa.

## Validações e limites

Nesta etapa: leitura do código/configuração, confirmação de ignore Git, ausência do CLI e git diff --check. Não executados nesta entrega: suites de integração, lint global, typecheck, build, Checkout/Portal hospedados, webhooks reais, renovação, recusa, cancelamento ou Test Clocks. Resultados históricos de005/006 são controlados, não homologação real. Nenhum evento Stripe real recebido/verificado nesta execução.

Próxima fase após configuração: testes Stripe/lifecycle em PostgreSQL descartável, lint/typecheck/build com canários sem credenciais reais no build, roteiro hospedado com usuário sintético, webhooks/persistência/acesso, trial único, Portal/cancelamento e renovação/recusa/regularização em Test Clocks compatíveis. Ver runbook docs/operacao/stripe-local.md. Clientes criados pelo fluxo atual não recebem test_clock; definir a preparação do cenário antes de prometer avanço de tempo.

Status: GO para preparação; NO-GO para iniciar homologação funcional externa enquanto faltarem segredos/Portal, CLI e confirmação canônica do preço. Produção continua NO-GO conforme015 e guardas test-only. Sem deploy, commit ou integração Connect.


Atualização posterior em07/11/2026: evolução multiplanos autorizada e catálogo criado no sandbox via CLI, com migration028 aplicada localmente mediante autorização específica. [Relatório atualizado](assinaturas-multiplanos-2026-11.md). Webhook e Portal ainda dependem das configurações descritas; estado anterior deste documento é histórico da primeira auditoria.
