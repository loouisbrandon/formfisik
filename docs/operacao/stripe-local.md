# Stripe local — entregas 005 e 006

Estado: código preparado, sem credenciais Stripe disponíveis. Não houve criação de produto/preço/cliente externo nem chamada financeira nos testes controlados. Railway continua hospedagem inicial planejada; nenhum deploy autorizado ou executado.

## Configuração futura pelo responsável

1. Criar conta/ambiente de teste Stripe. No Dashboard em modo de teste, criar produto ativo **FormFisik Pro** e preço recorrente **BRL 139,90/mês**, quantidade licenciada. Copiar prod_… e price_…; não criar outros planos. Não configurar o trial no preço: o servidor define 30 dias na sessão.
2. Obter chave secreta de teste sk_test_…. Não usar chave live ou chave publicável pk_…. Não enviar segredos pelo chat.
3. Copiar `.env.example` para `.env.local` somente se este ainda não existir. Preencher DATABASE_URL, APP_URL=http://localhost:3000 e ABUSE_HMAC_SECRET conforme documentação de ambientes; preservar valores existentes. Configurar SMTP para cadastro/recuperação.
4. Instalar Stripe CLI conforme documentação oficial e autenticar `stripe login` usando o mesmo ambiente de teste. Executar:

```bash
stripe listen --events checkout.session.completed,checkout.session.expired,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.trial_will_end,customer.subscription.paused,customer.subscription.resumed,invoice.paid,invoice.payment_failed,invoice.payment_action_required,invoice.updated,invoice.finalized,invoice.voided,invoice.marked_uncollectible,customer.updated,payment_method.updated,payment_method.attached,payment_method.detached --forward-to http://localhost:3000/api/stripe/webhook
```

5. Copiar o segredo whsec_… exibido pelo listener para STRIPE_WEBHOOK_SECRET. Preencher STRIPE_SECRET_KEY, STRIPE_PRODUCT_ID, STRIPE_PRICE_ID no `.env.local`. O segredo do listener não é necessariamente o de um endpoint do Dashboard. Não registrar valores em Git, screenshots, logs ou relatórios.
6. Executar `npm run db:migrate` e `npm run dev`; reiniciar Next após alterar ambiente. Todos os quatro valores são necessários; origens remotas e chaves live são rejeitadas pelo backend. Nenhuma variável secreta possui prefixo NEXT_PUBLIC_.

O catálogo é conferido no servidor: produto/preço ativos, teste, moeda BRL, 13990 centavos, recorrência mensal, intervalo 1. Preço incorreto bloqueia a contratação. Ausência de configuração não gera sucesso nem cria assinatura fictícia.

## Validação hospedada ainda pendente

Com profissional confirmado e autenticado, abrir `/assinatura`, iniciar Checkout e utilizar somente cartões de teste publicados pela Stripe. Nunca informar cartão real. Validar aceitação (4242 4242 4242 4242, validade futura e dados de teste), recusa e eventual autenticação adicional conforme os cenários oficiais adequados a SetupIntent/trial. Cartão de recusa de cobrança pode ser aceito no cadastro de método; não confundir configuração do método com cobrança imediata — trial não cobra ao iniciar.

Confirmar retorno com trial verificado, datas de 30 dias, preço, associação ao próprio usuário, webhook no listener e registros no PostgreSQL. Reabrir a oferta não pode criar outro trial. Cancelar antes de concluir Checkout deve retornar sem acesso. Testar assinatura inválida, reentrega e indisponibilidade. Eventos sintéticos `stripe trigger` sem metadata de um Checkout criado pela aplicação não comprovam fluxo integrado.

Cancelamento e Portal estão implementados na entrega 006; configurar e homologar conforme roteiro abaixo. Não lançar para clientes antes da homologação completa.

## Testes locais reproduzíveis

Banco descartável cujo nome termine em `_test`; suites fazem TRUNCATE. Não usar banco compartilhado/produção. PostgreSQL e Chrome devem estar disponíveis.

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

`tests/stripe.test.ts` injeta um provedor controlado somente nos serviços/handler de teste; nenhuma variável de ambiente habilita provider falso na aplicação. Verifica SQL real e assinaturas criptográficas de webhook com segredo artificial exclusivamente de teste. Esses testes não provam aceitação de cartão ou compatibilidade ponta a ponta do Checkout hospedado. E2E força Stripe ausente para confirmar indisponibilidade e ausência de ativação por URL, com SMTP/banco reais locais.

Eventos pendentes podem ser reenviados pelo CLI/Dashboard de teste. Tentativa incerta deve ser reconciliada pelo operador com IDs persistidos e metadata; não remover a marca trial_used_at ou criar manualmente assinatura para contornar conflitos. Se o listener ficar offline, após cinco minutos o servidor exige consulta canônica para autorizar. Não há processo de fila/cron nesta entrega.

Referências oficiais: [trial no Checkout](https://docs.stripe.com/payments/checkout/free-trials), [webhooks/CLI](https://docs.stripe.com/webhooks), [idempotência](https://docs.stripe.com/api/idempotent_requests), [cartões e cenários de teste](https://docs.stripe.com/testing).

## Configuração do Portal de teste — 006

No mesmo ambiente de teste Stripe do produto/preço, abrir Settings → Billing → Customer portal, salvar configuração ativa e obter o identificador bpc_… da configuração (Dashboard/Workbench/API oficial, quando necessário). Configurações de sandbox/live são distintas. Preencher STRIPE_PORTAL_CONFIGURATION_ID no `.env.local`, preservando valores existentes. Não criar ou configurar recursos live.

Configuração exigida pelo backend:

- features.payment_method_update.enabled=true: atualização de cartão.
- features.invoice_history.enabled=true: consultar/pagar faturas e obter comprovantes.
- features.subscription_cancel.enabled=false: cancelamento ocorre no painel FormFisik, preservando trial até seu fim.
- features.subscription_update.enabled=false: não permitir mudar preço, quantidade ou encerrar trial por mudança de assinatura.
- Permitir atualização de informações de faturamento se desejado; isso não altera identidade/login FormFisik. Não habilitar planos adicionais, cupons ou mecanismos de renovação independentes.

Se precisar inspecionar/criar uma configuração específica no futuro, usar os campos acima na API oficial de Portal Configurations ou editar a configuração padrão no Dashboard; esta execução não criou nada. Não confundir ID da configuração bpc_… com URL do Portal ou sessão bps_…. Backend consulta e valida active/livemode/capacidades a cada abertura e na apresentação de ações; configuração incompatível desabilita ações ou retorna 503.

## Homologação futura completa — obrigatória antes de liberar operação

1. Cadastrar/confirmar/logar profissional real no ambiente local com SMTP controlado. Iniciar Checkout de teste da própria conta; validar BRL 13990/mês, cartão obrigatório e 30 dias. Testar cartão aceito, recusado e autenticação adicional conforme cenários oficiais. Não confundir autorização de cadastro de cartão com cobrança na abertura de trial.
2. Conferir `/assinatura/gerenciar`: datas, acesso, próxima data e estimativa de fatura quando disponível. Reabrir oferta deve impedir novo trial. URL success/retorno não deve conceder acesso sozinha.
3. Abrir Portal pelas ações de gerenciamento, cartão e histórico. Verificar cliente correto, configurações e retorno seguro; atualizar cartão e confirmar que é o efetivo da assinatura (remover preferência específica por cartão antigo se o Portal apresentar essa opção). Conferir customer.updated/customer.subscription.updated e reconciliação. Fatura aberta pode ser paga/autenticada pelo Portal; apenas voltar não restaura acesso.
4. Durante trial, confirmar cancelamento no painel: data deve ser trial_end, acesso continua até lá e renovação fica ausente. Usar Test Clocks da Stripe em cliente compatível para avançar tempo, confirmar término/cancelamento sem primeira cobrança. Testar request repetido, concorrente e timeout/retry. Não afirmar ausência de cobrança até verificar efetivamente no ambiente de teste Stripe.
5. Em outro usuário elegível, concluir trial sem cancelar e avançar Test Clock até a primeira cobrança; validar invoice.paid, active, período do item e cobertura de fatura. Avançar nova renovação mensal e repetir com pagamento falho/autenticação exigida/cartão expirado. Verificar bloqueio imediato pela política sem carência, Portal de regularização e restauração somente após confirmação canônica.
6. Cancelar assinatura paga: preservar acesso até fim do período pago, não gerar reembolso automático, impedir renovação. Não remover faturas anteriores em aberto. Conferir fatura/assinatura no Dashboard de teste e eventos no listener.
7. Parar listener e recuperar foco/atualizar página; após cinco minutos acesso comum exige sync canônico, acesso sensível exige sempre. Simular indisponibilidade de rede: erro conhecido deve negar acesso. Reativar listener, reenviar eventos e executar `npm run billing:reconcile` para recuperar eventos perdidos. Não apagar marca de trial/operação para contornar conflitos.
8. Reenviar eventos duplicados/fora de ordem e testar assinatura inválida no webhook, conta de terceiro, corpo alterado e IDs arbitrários no browser. Testar cancelamento não autorizado e ausência de chaves/configuração do Portal.

Test Clocks devem ser criados/configurados manualmente pelo responsável no ambiente de teste, seguindo [documentação oficial](https://docs.stripe.com/billing/testing/test-clocks). Não executar relógios de teste contra bancos compartilhados ou credenciais live. Cada nova conta de homologação deve respeitar o trial único por usuário.

## Recuperação operacional

`npm run billing:reconcile` carrega `.env.local`, valida modo teste/origem local e percorre sequencialmente clientes vinculados, consultando fatos canônicos. Não cria cobranças, clientes ou assinaturas; pode confirmar uma intenção de cancelamento já aplicada. Saída contém apenas contagens/códigos estáticos. Nenhum cron/serviço foi provisionado. Sem configuração retorna erro antes de tocar no banco ou chamar Stripe.

Reenvio pelo Stripe CLI/Dashboard usa o mesmo endpoint assinado. Após falha de persistência, evento não é confirmado no banco e pode ser reprocessado. Após resultado externo incerto, comparar IDs e metadata persistidos com Stripe antes de qualquer alteração operacional; não gerar nova chave depois de 23 horas ou mover alvo de cancelamento para outro período. Não imprimir respostas completas da Stripe, URLs temporárias, client_secret, payloads de cartão ou segredos em logs.

## Produção/Railway ainda pendentes

Guardas local/test-only permanecem no código. Não basta inserir chaves Railway para habilitar cobrança de produção. Futura entrega operacional deverá autorizar e configurar domínio HTTPS, secrets, webhook de produção, Portal/produto/preço correspondentes, backup/migrations, monitoramento de códigos estáticos/retentativas e eventual agenda de reconciliação. Homologar staging, privacidade/retentiva, políticas pós-cobrança e comportamento de indisponibilidade antes de remover guardas em mudança revisada. Nenhuma configuração Railway ou Stripe externa foi aplicada nesta entrega.

## Complemento016

Reauditados e revalidados localmente os fluxos SaaS, sem credenciais externas disponíveis. Webhook preserva corpo bruto do SDK com limite256KiB e agora prazo total15s, compartilhando leitor limitado existente. Eliminação de conta com `billing_accounts` é bloqueada por retenção financeira pendente; suspensão/expurgo não cancela cobrança. [Auditoria016](../engenharia/016/integracoes.md) distingue cenários controlados aprovados de Checkout/Portal/Test Clocks reais não executados. Connect continua fora do escopo.

## Financeiro profissional020

O webhook /api/stripe/connect/webhook é distinto do SaaS e usa STRIPE_CONNECT_WEBHOOK_SECRET próprio. A verificação criptográfica está implementada, mas transporte financeiro/Accounts v2 externo permanece bloqueado; apenas inserir segredo não habilita checkout ou onboarding. Não alterar credenciais nesta entrega. [Runbook e roteiro futuro](financeiro-profissional.md).
