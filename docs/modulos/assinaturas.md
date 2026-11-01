# Módulo 02 — Assinaturas e planos

Estado: oferta (004), Checkout/trial (005) e gestão do ciclo (006) implementados para uso **local Stripe de teste**. Homologação externa pendente das credenciais. Não há provedor falso selecionável na aplicação, cobrança real ou deploy. FormFisik é empresa independente. Fonte comercial: [modelo de negócio](../estrategia/modelo-de-negocio.md).

## Fluxo e responsabilidades

Profissional com sessão opaca e e-mail confirmado acessa `/assinatura` para oferta e Checkout. `/assinatura/gerenciar` apresenta plano, mensalidade, datas, próxima cobrança estimada quando disponível, cancelamento, acesso e últimas cinco faturas sincronizadas. Conta, oferta, painel e regularização permanecem disponíveis sem entitlement pago. `/dashboard` apresenta a área profissional somente com entitlement confirmado no servidor; sem assinatura encaminha à oferta e sem acesso vigente ao gerenciamento. Ver [área profissional](dashboard-profissional.md).

Stripe é o único motor de cobrança recorrente. Checkout exige cartão e preço recorrente de teste BRL 13990/mês, quantidade 1 e trial de 30 dias. FormFisik persiste somente representação necessária ao acesso/apresentação. Portal completo permite cartão, dados de faturamento e histórico/pagamento de faturas; conferir no Portal a aplicação do novo cartão à assinatura, incluindo remoção de eventual preferência específica por cartão antigo. Alterar o e-mail de faturamento não modifica login.

Cancelamento é feito no painel FormFisik com confirmação explícita; o Portal deve ter cancelamento e atualização de plano/quantidade desabilitados. Isso preserva uma única política, sem término antecipado de trial pelo Portal ou plano adicional. Portal ausente/configuração incompatível produz indisponibilidade explícita, sem botão falso de sucesso. A API verifica a configuração novamente antes de abrir.

Retorno de Checkout ou Portal não comprova ação financeira. Todas as consultas usam IDs vinculados no PostgreSQL à identidade da sessão; IDs e estado do navegador são ignorados como autoridade. Somente resposta canônica da Stripe atualiza fatos financeiros.

## Política comercial e autorização

- Um trial de 30 dias por usuário confirmado elegível; cadastro não ativa assinatura. Marca trial_used_at é permanente, inclusive após cancelamento. Não há deduplicação jurídica entre contas da mesma pessoa.
- Cancelamento durante trial agenda `cancel_at=trial_end`, sem prorations: preserva acesso até o fim dos 30 dias, sem primeira cobrança de renovação da assinatura cancelada. Cancelamento pago agenda a data final do período corrente contratado, sem reembolso automático. Dívidas/faturas já existentes não são perdoadas.
- Não há carência comercial: pagamento pendente/recusado, past_due/unpaid, pausa, fim ou estado não confirmado não concedem acesso pago. Regularização é feita na Stripe; só `active` com fatura corrente paga e cobertura do período restaura acesso.
- Trial confirmado e vigente permite acesso. Ativa regular permite acesso quando fatura `paid`, saldo restante zero e linha do preço contratado cobrindo o período corrente. Fatura de trial de valor zero ou fatura antiga não comprova pagamento de uma renovação. Cancelamento agendado mantém somente o acesso que já seria elegível até a menor data entre fim do período/trial e cancel_at.
- `src/server/subscriptions/status.ts` centraliza decisão; `accessFor` a consome. `/api/access` força consulta canônica para operações sensíveis. Demais consultas usam snapshot verificado há no máximo cinco minutos. Falha conhecida marca sync_state=error e nega imediatamente, mesmo que snapshot ainda seja recente. Identidade/login não dependem da Stripe. Novos recursos pagos deverão também validar vínculo ao recurso no servidor.

Não há bypass local de assinatura. Testes injetam provedor somente em funções/handlers de teste e interceptam UI explicitamente, sem concessão real de acesso.

## Estados e transições

Status Stripe, situação da fatura, trial e direito efetivo são campos distintos. UI exibe estado resumido e acesso separadamente:

| Origem canônica / condição | Estado interno | Acesso |
| --- | --- | --- |
| Sem assinatura/tentativa | none | Não |
| Checkout creating/open | checkout_pending | Não |
| trialing, trial vigente | trialing | Sim, se sincronização válida |
| active, fatura corrente paga/cobrindo período | active | Sim, se sincronização válida |
| cancel_at ou cancel_at_period_end, ainda elegível | cancel_scheduled | Até o limite confirmado |
| Fatura open sem falha observável | payment_pending | Não para período pago |
| Fatura open com tentativa ou PaymentIntent requires_action | payment_failed | Não para período pago; paymentIssue distingue failed/action_required |
| past_due/unpaid sem fatura open mais específica | past_due | Não |
| incomplete | payment_pending | Não |
| incomplete_expired ou prazo encerrado sem novo período válido | expired | Não |
| canceled | canceled | Não |
| paused ou pause_collection | paused | Não; não oferecemos ação de pausa/retomada nesta UI |
| Ativa sem prova de cobertura, estado desconhecido/divergente | blocked | Não |
| Configuração ausente, verificação vencida ou erro conhecido | unavailable | Não |

Resumo não é transição local de cobrança: a Stripe determina trialing→active/past_due/paused, active→past_due/unpaid/canceled, recuperação→active e término de cancelamento agendado→canceled. Não alteramos status por clique, tempo local ou evento isolado. Expiração local apenas retira entitlement. Não há fluxo de nova assinatura/novo trial após encerramento ou desfazer cancelamento nesta entrega; regularização atua na assinatura/fatura existente quando a Stripe permitir. Encerrada é terminal no aplicativo.

## Contratos HTTP

Respostas private/no-store. Cookie opaco, profissional confirmado e Origin da aplicação nos POST, exceto webhook público autenticado por assinatura.

| Método / rota | Contrato |
| --- | --- |
| GET `/api/subscriptions/availability` | `{status:ready|unavailable|ineligible,reason:test_mode|test_configuration_missing|trial_already_used}` |
| POST `/api/subscriptions/checkout` | JSON `{}` apenas; 200 `{url}` de checkout.stripe.com; oferta/identidade exclusivamente do servidor |
| GET `/api/subscriptions/status?refresh=1` | `SubscriptionView` em `src/modules/subscriptions/status.ts`: state, paidAccess, financialStatus, invoiceStatus, paymentIssue, datas trial/período/início/fim/cancelamento, accessUntil, próxima data/estimativa, syncState, verifiedAt, cancellationPending, ações e faturas resumidas. Sem IDs externos, cartão ou URLs de fatura. refresh força reconciliação; parâmetros userId/customer/session_id não selecionam outra conta. |
| POST `/api/subscriptions/cancel` | `{confirm:true,expectedEnd:ISO}`. expectedEnd apenas compara o período exibido, não define data no provedor; divergência 409. 200 `{message,subscription}` somente após confirmação canônica. Repetição já confirmada é no-op. |
| POST `/api/subscriptions/portal` | `{action:manage|payment_method|payments|regularize}`; 200 `{url}` temporária billing.stripe.com da própria conta e retorno fixo `/assinatura/gerenciar?retorno=portal`. Todas as ações abrem Portal completo para permitir gestão de preferências de cartão específicas da assinatura. regularize exige fatura corrente open. |
| POST `/api/stripe/webhook` | Assinatura/timestamp SDK sobre corpo bruto até 256 KiB, somente test/sem Connect. 200 recebido/duplicado/ignorado; 400 assinatura/live inválido; 413 tamanho; 503 falha para retry. |

Demais erros: 400 corpo/confirmação inválidos ou campos extras; 401 sessão ausente/não confirmada; 403 origem/perfil; 409 ação não permitida/resultado incerto; 429 limite; 503 configuração/provedor/persistência. Checkout, cancelamento e Portal limitados a 10/min por usuário; refresh explícito 30/min. Não enviar secrets/IDs Stripe no frontend.

## Persistência

Migrations imutáveis: `004_stripe_checkout.sql` e `005_subscription_lifecycle.sql`.

| Tabela | Responsabilidade |
| --- | --- |
| billing_accounts | usuário/cliente únicos, marca permanente de trial, sync_state pending/ok/error e última tentativa de sync |
| billing_checkouts | intenção durável, ID externo único, snapshot preço/produto/origem, prazo, creating/open/confirmed/expired; uma pendente por conta |
| billing_subscriptions | uma assinatura vinculada ao Checkout, status financeiro, trial, início/período, cancel_at/cancel_at_period_end/canceled_at/ended_at, pausa, fatura corrente, paid_through, estimativa opcional e verified_at |
| billing_invoices | referências canônicas de faturas da assinatura, BRL, valores devidos/pagos, status, tentativas, payment_issue, próxima tentativa e datas; sem payload ou cartão |
| billing_cancellations | intenção única por assinatura da conta, UUID/chave estável, alvo imutável, pending/confirmed e datas |
| billing_events | ID único, tipo, data do provedor, processamento e processed/ignored; sem payload bruto |

005 adiciona colunas/tabelas e invalida snapshots antigos para exigir nova reconciliação; não remove usuários/dados. Próxima cobrança é estimativa opcional via invoice preview; falha de preview deixa valor indisponível e não autoriza ou invalida acesso por si. Histórico completo e comprovantes ficam no Portal; lista local contém somente faturas já sincronizadas.

## Webhooks, concorrência e recuperação

Eventos tratados: checkout.session.completed/expired; customer.subscription.created/updated/deleted/trial_will_end/paused/resumed; invoice.paid/payment_failed/payment_action_required/updated/finalized/voided/marked_uncollectible; customer.updated; payment_method.updated/attached/detached.

SDK valida corpo bruto/assinatura/timestamp antes de processamento. Eventos Connect/live são recusados; desconhecidos e clientes não vinculados são registrados como ignorados. Faturas manuais sem assinatura são ignoradas. Método detached sem customer é ignorado e coberto pela reconciliação canônica da assinatura. Não usamos horário do evento ou snapshots históricos para sobrescrever fatos atuais.

Advisory lock por usuário serializa Checkout, cancelamento, Portal e reconciliação. Leitura canônica (assinatura, fatura/PaymentIntent atual) ocorre sob lock, fora da transação SQL; persistência de snapshot/faturas/intenção confirmada e evento é atômica. Falha desfaz o evento/snapshot e marca sync_state error separadamente. Reentrega pode recuperar. Não há logs de payloads, cartão, URLs de Portal, e-mails ou secrets; somente códigos estáticos.

Checkout usa intenções duráveis e chaves estáveis por conta/tentativa, já implementadas na 005. Cancelamento persiste alvo e chave antes da chamada externa. Timeout não gera nova chave; reconciliação confirma a operação já aplicada antes de repetir. Prazo alvo vencido ou intenção incerta com mais de 23h bloqueia nova mutação e exige operador, evitando retenção expirada da idempotência Stripe ou cancelamento em período diferente. Marca de trial nunca é removida para contornar conflito.

Página/retorno e refresh explícito reconciliam; autorização normal reconcilia após cinco minutos. Em falha conhecida, consultas passivas negam e aguardam até 60 segundos entre retries; refresh/ação explícita pode recuperar sob rate limit. `/api/access` força verificação. `npm run billing:reconcile` permite recuperar todos os clientes vinculados sequencialmente; é operador local com configuração de teste, não cron provisionado. Não depende de Checkout antigo para acompanhar renovações após vínculo da assinatura.

## Operação e homologação

[Configuração Stripe/roteiro de homologação](../operacao/stripe-local.md), [ADR-006](../arquitetura/ADR-006-ciclo-assinaturas.md), [relatório 006](../engenharia/entrega-006.md). Fontes oficiais verificadas: [webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [cancelamento](https://docs.stripe.com/billing/subscriptions/cancel), [Portal/cartão](https://docs.stripe.com/customer-management/integrate-customer-portal), [faturas](https://docs.stripe.com/api/invoices/object).

Sem credenciais não houve homologação de Checkout/Portal, aceite/recusa de cartão, cancelamento ou renovação na Stripe de teste real. Não declarar produção pronta: guardas test-only/local permanecem, e Railway/serviços/segredos não foram criados.

## Apresentação — refinamento 006.5

Painel organizado em Meu plano, Meu período, Gerenciamento e Histórico de faturas, com estado de acesso separado do financeiro. Datas/dias restantes e valores são apresentação dos dados recebidos, sem mudar entitlement. Capacidades de ação continuam exclusivamente na resposta da API. Indisponibilidade, valores ausentes e cancelamento pendente têm linguagem simples; nenhum dado fictício é introduzido na aplicação.

Composição, componentes, estados e microcopy têm fonte única no [Design System — seção 006.5](../design/DESIGN_SYSTEM.md). Oferta e retorno usam a mesma linguagem; logs/contratos backend permanecem técnicos e intactos. Relatório: [entrega 006.5](../engenharia/entrega-006.5.md). Homologação externa Stripe continua pendente conforme documentação operacional.
