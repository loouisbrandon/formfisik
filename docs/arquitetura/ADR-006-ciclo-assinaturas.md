# ADR-006 — Ciclo de assinatura, Portal e autorização

Decisão aceita para a entrega 006; homologação financeira externa pendente. FormFisik é empresa independente; constituição jurídica/societária não é presumida. Railway é hospedagem futura, sem deploy nesta execução.

## Decisão

Expandir o serviço Stripe existente, mantendo Checkout, vínculo de cliente, SQL migrations, sessão opaca e SDK oficial. Não substituir autenticação ou introduzir motor de cobranças, fila distribuída ou framework genérico de provedores. `store.ts` concentra lock/transação reutilizados, `lifecycle.ts` valida e persiste snapshots, `management.ts` executa ações, `status.ts` decide entitlement e `handlers.ts` aplica contratos HTTP.

Status financeiro, trial, período contratado, cancelamento e direito efetivo são representados separadamente. Ativa exige fatura corrente paga cobrindo período/price; trial gratuito não comprova pagamento futuro. Sem carência de acesso em inadimplência. Usuário mantém acesso a conta/regularização. Cobrança continua exclusiva da Stripe.

Cancelamento usa data fixa de término do trial/período e `proration_behavior=none`; não reembolsa ou perdoa dívidas. UUID/chave e data são persistidos antes da operação. Confirmação do usuário inclui data esperada para detectar mudança de período antes de executar. Timeout exige consulta canônica antes de retry; mesma chave/alvo dentro da janela segura, sem nova chave após incerteza superior a 23h. Marca de trial permanece definitiva.

Portal completo com cartão/histórico habilitados, cancelamento e mudança de assinatura/plano desabilitados. Cancelamento ocorre somente no painel FormFisik, protegendo política de preservar trial. Usamos Portal completo inclusive para atualizar cartão, permitindo gerir eventual preferência específica da assinatura que sobreponha o padrão do cliente. Não inferimos sucesso por retorno ou alteramos credencial de login a partir do faturamento.

Eventos assinados consultam estado atual sob lock por usuário, fora da transação SQL; estado/faturas/evento/intenção confirmada são persistidos transacionalmente. Faturas/PaymentIntent canônicos determinam pagamento e ação necessária; tipo/horário do evento antigo não reverte estado atual. Erro conhecido bloqueia entitlement imediatamente. Snapshot recente vale por cinco minutos em consultas comuns; acesso sensível força reconciliação. Após erro, consulta passiva espera até 60 segundos entre tentativas; refresh explícito possui limite. Script local de reconciliação é operado manualmente; nenhum cron foi criado.

## Consequências e limites

Confiabilidade prioriza negação de acesso quando estado financeiro é desconhecido, com possível interrupção temporária durante indisponibilidade Stripe. Preview de próxima fatura é opcional e não decide acesso. Não dependemos da sessão antiga de Checkout para acompanhar uma assinatura já vinculada. Histórico completo fica no Portal; PostgreSQL conserva somente referências e resumos necessários.

Não há bypass de desenvolvimento: provedor controlado apenas nos testes. Chaves live e APP_URL remoto continuam rejeitados. Produção exige homologação externa, revisão de política/retentativas/configurações Stripe, infraestrutura e autorização próprias. Não há novo trial, nova contratação pós-encerramento ou desfazer cancelamento nesta UI; encerrada permanece terminal e regularização só opera sobre assinatura/fatura existente.

Fontes oficiais verificadas nesta implementação: [ciclo e webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [datas de cancelamento](https://docs.stripe.com/billing/subscriptions/cancel), [Portal e preferência de cartão](https://docs.stripe.com/customer-management/integrate-customer-portal), [objetos de assinatura](https://docs.stripe.com/api/subscriptions/object) e [fatura](https://docs.stripe.com/api/invoices/object). Contrato SDK instalado: Stripe 23.1.0; períodos estão nos itens e vínculo de fatura em parent.subscription_details.
