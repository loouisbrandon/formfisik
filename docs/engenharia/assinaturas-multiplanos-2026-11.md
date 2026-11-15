# Assinaturas SaaS — Standard, Premium e Pro

Data:07/11/2026. Backend IMPLEMENTADO e testado localmente com provedor controlado. Catálogo Stripe de TESTE criado/verificado pela API. Homologação Checkout/Portal/webhooks hospedados pendente. Produção NO-GO015 preservado.

## Catálogo e regras

| Plano | Ativos | Mensal centavos | Anual centavos | Lookup keys |
|---|---:|---:|---:|---|
|Standard|30|4990|47904|formfisik_standard_monthly / formfisik_standard_annual|
|Premium|50|8990|86304|formfisik_premium_monthly / formfisik_premium_annual|
|Pro|ilimitado|13990|134304|formfisik_pro_monthly / formfisik_pro_annual|

Anual é cobrança única, equivalente mensal39,92/71,92/111,92. Trial30 dias por conta e cartão obrigatório mantidos. IA e parceria futuras, sem motores de IA/comissões. Nada de Stripe Connect nesta entrega.

## Reuso, arquitetura e persistência

Reutilizados gateway oficial, Checkout, locks/idempotência, metadados/vínculo do cliente, handlers de assinatura, webhooks assinados, reconciliação canônica, Portal e cancelamento no fim do período. Catálogo puro compartilhado plan.ts define valores e capacidade. Nenhum segundo motor financeiro.

Migration028 adiciona plan_id/billing_interval/amount ao Checkout e snapshot da assinatura e mantém monthly_amount como preço-base mensal. CHECKs garantem os seis pares do catálogo. Linhas anteriores recebem Pro mensal sem reescrever preço/data/trial ou criar assinaturas externas. Migration validada em banco descartável e aplicada somente ao banco local após autorização explícita.

Cada tentativa persiste a oferta antes da chamada externa; retry mantém idempotência e não muda parâmetros. Tentativa pendente de outra seleção retorna409, sem trocar silenciosamente o Checkout. Snapshot valida preço/produto/intervalo/modo teste com termos da tentativa, não com dados enviados pelo browser. Cobertura paga usa o valor do período contratado, inclusive ano. Arquivamento de preço não revoga assinatura já contratada.

## API e autorização

POST /api/subscriptions/checkout aceita somente {plan:standard|premium|pro,interval:month|year}. Corpo vazio continua Pro mensal por compatibilidade. Valores, IDs Stripe, usuário e trial são proibidos no corpo. Disponibilidade aceita esses enums na query. Status devolve planId/billingInterval/contractedAmount/studentLimit, sem IDs Stripe.

Autenticação, confirmação de e-mail, origem, ownership, rate limit e autorização existentes preservados. Frontend não concede acesso por redirecionamento. Dashboard/período/configurações atualizados para não apresentar todo plano como Pro139,90. Landing encaminha seleção para a página autenticada; cada opção ainda depende das credenciais de teste.

Alunos: criação (inclusive importação) e reativação consultam a capacidade do plano confirmado e contam somente vínculos ativos do proprietário sob lock transacional comum. Retry de criação já persistida não consome outra vaga. Arquivar libera vaga; reativar carteira cheia retorna409 com mensagem amigável. Sem remoção de alunos ou bloqueio por pagamento do aluno. Sem assinatura, capacidade não substitui a autorização existente dos handlers. Pro e dados legados preservam capacidade ilimitada.

## Configuração e provisionamento

.env.local ignorado recebe apenas IDs não secretos dos produtos/preços; chaves/segredos existentes preservados. Novas variáveis em .env.example: STRIPE_PRODUCT_STANDARD/PREMIUM/PRO e STRIPE_PRICE_{STANDARD|PREMIUM|PRO}_{MONTHLY|ANNUAL}. Aliases legados STRIPE_PRODUCT_ID/STRIPE_PRICE_ID seguem prioritários para Pro mensal. Nenhum NEXT_PUBLIC_ secreto.

Script scripts/provision-subscription-catalog.ts é leitura por padrão. --apply é mutação explícita somente com sk_test_ e APP_URL local; consulta antes, reutiliza equivalentes, falha em duplicação e usa idempotência na criação via Stripe CLI. Chave passada pelo ambiente, nunca em argumentos/logs; respostas completas não são impressas. Criados2 produtos e5 preços; Pro mensal existente preservado. Não rodar contra produção.

## Evidências e limites

86 testes distintos passaram: Stripe14, ciclo25, alunos12, novos planos12 e importação23, em PostgreSQL18 descartável removido após execução, SDK/provedor controlado sem Checkout financeiro externo. Casos novos: seis ofertas, trial/paid coverage e negação de linha insuficiente, snapshot correto, trial único, conflito de seleção pendente, preço/live/produto/intervalo inválidos, limites30/50, Pro, concorrência, arquivo/reativação e isolamento entre carteiras. Typecheck e lint direcionado aprovados. Build Webpack aprovado com credenciais sintéticas; varredura de235 arquivos estáticos com zero canários encontrados. Lint global aprovado. Harness de navegador com endpoints explicitamente controlados validou seis seleções, valores anuais, corpo POST correto, erro amigável e larguras1440/768/320. Landing real validada em1440/320 com links e totais anuais. O harness não cria assinaturas nem simula homologação Stripe hospedada.

Pendências operacionais: STRIPE_WEBHOOK_SECRET e STRIPE_PORTAL_CONFIGURATION_ID ainda ausentes na inspeção; listener e Portal exigem configuração no sandbox correto. Não foi criada assinatura, cliente ou cobrança via API nesta execução. Catálogo não comprova webhook/Checkout/Portal/Test Clocks reais. Novos testes não atestam produção. Sem deploy/commit/upgrade de dependências.


## Resultado e arquivos

GO para implementação local e catálogo Stripe TESTE; NO-GO para homologação hospedada completa enquanto faltarem webhook/Portal. Produção NO-GO, sem alteração das guardas locais/test-only. Execução inicial62 testes e execução complementar35 (11 repetidos), total86 distintos. Nenhuma falha final nas suites executadas. Não executada a suite global completa de todos os módulos. Banco descartável removido; local preservado com028 autorizada.

Principais arquivos: src/modules/subscriptions/{plan,checkout-status,status,subscription-dashboard,subscription-period}; src/server/subscriptions/{stripe,service,lifecycle,store,status,handlers,availability}; src/server/students/{repository,handlers}; src/server/imports/repository e src/modules/imports/schema; página assinaturas, cadastro e settings para consistência comercial; PricingPreview da landing; migration028; teste subscription-plans.test.ts; script provision-subscription-catalog.ts; .env.example e documentos vinculados.

### Passo a passo das configurações restantes

Webhook: manter stripe listen aberto no sandbox correto; copiar o whsec_ exibido diretamente para STRIPE_WEBHOOK_SECRET em .env.local. Não compartilhar o segredo no chat. A rota é /api/stripe/webhook.

Portal: Dashboard no mesmo sandbox → Configurações → Billing/Faturamento → Portal do cliente (https://dashboard.stripe.com/settings/billing/portal). Salvar configuração ativa com atualização de cartão e histórico de faturas habilitados, mudança/cancelamento de assinatura desabilitados. Não é necessário ativar um link público de login: a aplicação cria sessões autenticadas do Portal. Executar stripe billing_portal configurations list --limit 10 e copiar o id bpc_ da configuração correspondente, active=true/livemode=false, para STRIPE_PORTAL_CONFIGURATION_ID. ID não é a URL do Portal nem uma sessão bps_. Reiniciar Next depois de salvar e confirmar o listener continua aberto.

Fontes: https://docs.stripe.com/cli/listen e https://docs.stripe.com/api/customer_portal/configurations/list. Nenhuma chave real é incluída neste relatório.


## Preflight após configuração pelo responsável —07/11/2026

STRIPE_WEBHOOK_SECRET e STRIPE_PORTAL_CONFIGURATION_ID preenchidos localmente. Segredo comparado em memória com stripe listen --all-snapshot --print-secret: corresponde; nenhum valor registrado. Portal consultado pela API: teste/ativo, payment_method_update e invoice_history true, subscription_update e subscription_cancel false. Os seis pares passam billingConfigured. PostgreSQL responde e /login retorna200 após inicialização da aplicação.

Atualiza o bloqueio anterior por configuração: GO para iniciar o teste hospedado, sem declarar Checkout/trial/webhook/Portal homologados. Ainda não foi criada assinatura ou cobrança neste preflight. Próximo cenário: profissional confirmado conclui Checkout com cartão sintético; observar webhook, persistência, vínculo e acesso canônico. Não repetirtrial em conta já utilizada. Produção permanece NO-GO.


## Redesign das três telas —07/11/2026

Planos com cards compartilhados verdes; retorno com resumo canônico; gestão com tipografia e largura profissional, capacidade e comparação recolhível. Novos PlanCards/SubscriptionHeader e CSS scoped justificados pelo reuso entre rotas. Disponibilidade autenticada reutiliza SubscriptionView já calculado para exibir plano atual, sem nova consulta Stripe/SQL ou IDs externos no DTO. BillingCard/histórico reaproveitados. Faturas não presumem Pro/mensal; total zero não representa recebimento. Regras financeiras, endpoints de mutação e limites não alterados. Lint direcionado aprovado, inspeção autenticada local desktop1440/mobile320 sem overflow; seleção anual e comparação testadas, nenhuma mutação financeira acionada.
