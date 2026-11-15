# API privada — Financeiro profissional 020

[Semântica do módulo](../modulos/financeiro-profissional.md). Node.js; GET/POST `/api/finance`. Sessão opaca atual, profissional confirmado/habilitado, assinatura SaaS autorizada, isolamento owner em todas as consultas e FKs compostas. UUID não concede acesso. Headers no-store/private/Vary Cookie/no-referrer/nosniff. POST exige Origin igual ao APP_URL e JSON, 16 KiB/15 s; GET 120 e POST 30 por minuto/profissional. Sem JWT, dados de cartão ou segredo em DTO.

## Leituras

`view`, `from`, `to` obrigatórios (view default overview); até 367 datas inclusivas. `page` 1..100000, `q` até 100, `status` enum. IDs UUID quando necessários; chaves desconhecidas são recusadas. Ordenação estável e 20 por página, contagem SQL; páginas vazias devolvem items vazio e total real.

| view | Resposta mínima |
| --- | --- |
| overview | Totais centavos em strings decimais: provider_received, manual_recorded, manual_checked, pending, overdue, refunded, disputed, fees_known, net_known, contracted; unknown_fees, discrepancies, scope e BRL. Não soma manual registrado e conferido como receitas diferentes |
| account | Status/capacidades/requisitos, flags charges/payouts e sync; nenhum acct_ID, KYC ou conta bancária. externalEnabled false em runtime; testes injetados identificam ambiente controlado |
| contracts | Contratações elegíveis ainda sem configuração financeira: ID, versão, aluno, nome do plano preservado, preço e datas. Busca por aluno/página; sem respostas clínicas |
| charges | Identidade da obrigação/acordo, aluno, ciclo, valor, vencimento, modo/estado, totais manuais/provedor, ajustes e disponibilidade observada; sem referências privadas do processador |
| charge + id | Mesmos campos e correções/recebimentos externos paginados; referência/nota somente no detalhe |
| agreements | Configurações próprias: acordo 019, valor total, modo, ciclos/intervalo, estado, datas |
| history | Eventos mínimos próprios por data/criação: tipo, razão quando aplicável, valores/status e referências locais |
| payouts | ID público de referência do processador, valor/estado/data de chegada; não fornece dados bancários nem vínculo inventado por cobrança |
| events | Eventos assinados próprios: ID, tipo, estado, tentativas e datas; sem payload, segredo ou conta de terceiro |
| operations | Intenções próprias pendentes, 20/página por criação/chave: chave de idempotência, ação, alvo, reserva e data; não expõe comando/nota original. Abrange pendências atuais independentemente do período |

Período de cobranças usa vencimento. overview distingue data do pagamento, início de acordo e vencimento; reembolsos/líquidos são posição atual da coorte de recebimentos selecionada, sem alegação contábil. history/agreements usam criação; events recebimento; payouts chegada. account/contracts/charge/operations não ocultam detalhes por período. Lista de status inclui projeções overdue/manual_recorded/manual_reconciled.

## Comandos discriminados strict

Todos usam `action`, `operationKey` UUID e campos abaixo. Mesma chave/mesmos parâmetros repete resultado; diferença 409. Dados de intenção original permanecem somente no servidor. Confirmed é literal true quando indicado e não significa aceite jurídico do aluno.

| action | Campos adicionais / regra |
| --- | --- |
| onboard | confirmed; conta é obtida pelo proprietário, nunca por acct_ID do cliente; link hospedado validado |
| account_refresh | consulta a conta já vinculada, ou inicia reserva segura pelo gateway; sem KYC próprio |
| prepare | contractId, contractVersion, mode, cycles, intervalMonths, confirmed; preço/moeda/vínculo vêm de 019; único exige cycles=1; recorrência exige parcelas iguais, sem trial |
| checkout | id da obrigação, confirmed; revalida acordo e conta atual; uma intenção por configuração, sem ativação pelo retorno |
| cancel | id da obrigação, reason 5..500, confirmed; configuração e futuras obrigações, preserva 019/valores recebidos |
| receipt | id da obrigação, amountCents inteiro 1..1e9, paidOn, method pix/bank/cash/other, reference 120, note 500, checked boolean, confirmed; saldo conferido no servidor |
| receipt (correção) | replacesId e reason obrigatória; mesmo owner/cobrança, anterior não invalidado; invalidação + inserção atômicas |
| void_receipt | id do recebimento, reason, confirmed; invalidação imutável/auditada, sem apagar original |
| refund | id da obrigação, amountCents, reason, confirmed; disponível positivo, sem contestação e sem outra intenção incerta; não implementa estorno bancário manual |
| reconcile | id da obrigação; fatos atuais do provedor, sem marcar pago pelo cliente |
| retry_event | eventId próprio; reaplica leitura canônica, não payload antigo |
| resume_operation | id da chave original; recupera comando privado e reutiliza a intenção original, não recebe valores substitutos |

Resultados: IDs locais/updated/created/canceled ou URL hospedada permitida. URL temporária não é logada nem persistida em resultado; reenvio de checkout confirmado consulta link por referência. Operação incerta com mais de 23 h exige revisão operacional e não nova chave externa. Sem autorização externa/gateway runtime: 503 external_blocked, sem sucesso simulado.

Erros públicos estáticos: 400 entrada/origem de evento inválida, 401 sessão, 403 origem/permissão/assinatura, 404 inexistente ou carteira alheia, 409 conflito/versão/associação/idempotência, 422 vigência/saldo/reembolso, 429 abuso, 503 dependência/ativação bloqueada. Não retornar SQL, PII alheia, segredo, payload ou stack.

## Webhook Connect

POST `/api/stripe/connect/webhook`, domínio separado do webhook SaaS. SDK Stripe verifica assinatura/timestamp 300 s sobre bytes brutos limitados a 256 KiB e 15 s. Segredo próprio STRIPE_CONNECT_WEBHOOK_SECRET; ausente retorna 503. Somente livemode false e event.account já associado pelo servidor. Eventos sem conta/plataforma ou desconhecida são recusados; tipos irrelevantes autenticados são ignorados.

Tipos snapshot v1: account.updated; checkout.session.completed/expired; payment_intent.succeeded/payment_failed; invoice.paid/payment_failed; customer.subscription.updated/deleted; charge.refunded; refund.updated; charge.dispute.created/updated/closed; payout.created/updated/paid/failed/canceled. Thin/v2 não é aceito por equivalência presumida.

Persiste ID/conta associada/tipo/objeto e estado/tentativas; nenhum body bruto. Evento duplicado deve ter mesma identidade. Reprocessamento sob lock do profissional consulta gateway canônico; valida conta/domain, modo, referência previamente vinculada ou assinatura conhecida, BRL, total exato, limites e datas. Atualização e confirmação do evento são transacionais. Falha retorna 503 e permanece retryável; suspensão do usuário não impede observação de verdade financeira via evento assinado. Runtime continua bloqueado por ausência de transporte homologado, sem apagar pendências.

## Evolução gerencial — 06/11/2026

Leituras adicionais: `dashboard`, `receipts`, `export`. Filtros aditivos: `origin=all|provider|external`, `service` até100, `method=all|pix|bank|cash|other|provider`, `dataset=charges|receipts` para exportação. q filtra aluno. Charges filtra vencimento, estado, aluno, origem e nome do plano preservado. Receipts filtra data recebida, estado da cobrança, aluno, serviço, origem e método;20/página, data DESC/id. Não retorna nota/referência ou payload.

Dashboard usa snapshot read-only repeatable-read: origem/aluno/plano/estado, totais, até367 pontos diários e cinco cobranças recentes. Overview legado mantém semântica025. Export usa o mesmo escopo, máximo1000 linhas, erro422 export_limit se ultrapassado; não pagina silenciosamente. CSV é serializado no cliente com neutralização de fórmulas e sem campos privados adicionais.

`prepare.firstDueOn?: YYYY-MM-DD` define primeiro vencimento dentro de starts_on/ends_on da contratação; ausência mantém início. Demais ciclos precisam caber na vigência e preço permanece canônico. Não modifica cronogramas existentes. DTO charge acrescenta `service_name`, `linked_student_id`, `contract_version` para contexto autorizado e navegação. Nenhuma referência privada do provedor é adicionada.
