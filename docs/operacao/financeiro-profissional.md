# Operação e homologação — Financeiro profissional 020

Somente preparação e ensaio local autorizados. Não executar estes procedimentos em banco persistente, provisionar Stripe/Railway, trocar credenciais ou realizar operações financeiras sem autorização específica. NO-GO 015–019 preservado.

## Estado dos ambientes

| Nível | Situação desta entrega |
| --- | --- |
| Preparado localmente | Schema, regras, comandos/DTOs, UI e contratos do provedor; webhook usa assinatura real do SDK |
| Validado com provedor controlado | PostgreSQL real descartável, gateway explicitamente injetado somente por testes, eventos sintéticos assinados e navegador |
| Stripe Test Mode externo | NÃO HOMOLOGADO; não executado; transporte/normalização reais dependem do modelo aprovado |
| Operação | NÃO HOMOLOGADA: contas/KYC, liquidação, suporte, relatórios/contabilidade, agendamento/alertas, retenção e restauração do ambiente alvo |
| Produção | BLOQUEADA; runtimeGateway recusa operações externas, sem variável de bypass |

## Reproduzir localmente

Usar um PostgreSQL 18 descartável nomeado formfisik-020-test, porta loopback 5550, credenciais exclusivamente sintéticas e bancos terminados em _test. Nunca reutilizar DATABASE_URL persistente; testes fazem TRUNCATE. Instâncias separadas por suíte/navegador/produção. Não copiar credenciais reais para evidências.

- TEST_DATABASE_URL do banco descartável: npm test.
- Mesmo banco, sequencialmente: node --conditions=react-server --import tsx --test --test-concurrency=1 tests/finance.test.ts.
- Banco separado: npm run test:finance:e2e (Chrome e ponte loopback 3120/3121).
- npm run lint; npm run typecheck.
- Build/segurança: tests/security-production-e2e.ts; executar com TEST_FINANCE_FLOW=1, TEST_CONSULTANCIES_FLOW=1 e evidências segregadas em test-results/020/production. Usa Webpack suportado e HTTPS loopback, sem homologar Turbopack ou Stripe externa.
- npm run test:operations com TEST_POSTGRES_CONTAINER=formfisik-020-test e OPERATIONS_EVIDENCE_DIR=test-results/020/operations cria/remove bancos temporários próprios, ensaia migrations/upgrade/falha/restore/replay e grants.

Runner de produção exercita cartão SaaS via SDK oficial com transporte loopback, não rede Stripe. O gateway financeiro controlado só existe em tests/helpers. A produção real testa pagamentos externos e indisponibilidade explícita, não injeta gateway fake financeiro por variável.

## Migração e recuperação futura

Migration 020 é aditiva; 001–019 e seus checksums permanecem. Inspecionar schema_migrations, backup recuperável, espaço/locks e grants antes de autorização futura. Migrador separado do runtime; aplicação não concede DELETE financeiro. Não executar rollback destrutivo: restore deve reter obrigações, recebimentos, operações e bloqueios de eliminação, preservando replay 016 para sujeitos elegíveis.

Ensaio sintético valida restauração de recebimento e bloqueio de eliminação financeira; o pedido de teste é removido explicitamente pelo operador do fixture somente para reaproveitar identidade no smoke de grants. Isso não constitui fluxo de desbloqueio real ou eliminação financeira implementada.

## Operações incertas e eventos

Tela Operações pendentes retoma comando privado original/chave; não inventa nova cobrança. Webhooks pendentes em Eventos e recuperação consultam fatos atuais, com deduplicação e atomicidade. Não corrigir estados diretamente por SQL em ambiente operacional nem reencaminhar payload sem assinatura. Não gerar outra chave para substituir checkout/reembolso incerto.

Incerteza externa superior a 23 horas exige operador e comparação com o provedor antes de qualquer ação. O transporte futuro precisa recuperar objetos por chave/metadata/conta e distinguir criação de observação; não remover essa trava sem evidência. O comando finance:reconcile exige proprietário e cobrança explícitos, mas recusa ativação externa atualmente antes de consultar o banco. Nenhum cron foi criado.

Alertar por códigos estáticos: indisponibilidade, divergência, repetição de falha, eventos/intenções antigos, capacidades restritas, reembolso/contestação e payout falho. Não logar URLs, assinaturas, body bruto, KYC, nota de pagamento, cartão ou credenciais. Dashboard não é substituto de contabilidade nem comprova dinheiro bancário.

## Homologação externa autorizada futura

1. Aprovar [ADR e responsabilidades](../arquitetura/ADR-021-financeiro-profissional-connect.md), custos e termos; confirmar Brasil/PF/PJ, modelo Connect, Merchant of Record, API v2/configuração, dashboard e suporte com a Stripe.
2. Implementar transporte/normalização oficial do FinanceGateway para o modelo aprovado. Validar relações de account/customer/Checkout/PaymentIntent/invoice/subscription/BalanceTransaction/refund/dispute/payout. Não reutilizar clientes, preços, eventos ou segredo SaaS. Resolver notificações thin/v2 se adotadas; snapshot v1 atual não prova suporte thin.
3. Somente após autorização, configurar segredos próprios e endpoint Connect Test Mode; conta/cartões estritamente de teste. A existência de variáveis não deve habilitar produção automaticamente. Não transmitir segredos por chat.
4. Onboarding novo/retomado/expirado, KYC/capacidades/restrições e payout; cartão aceito/recusado/3DS; único; recorrência finita com Test Clocks e término correto; prazo/consentimento/checkout e reenvio incerto.
5. Webhook real duplicado/fora de ordem/perdido, recuperação após erro SQL/rede e retorno sem autoridade; comparar BRL/total/taxas/líquido/ajustes com provedor.
6. Reembolso parcial/integral/falho, disputa aberta/ganha/perdida/reversão, retenção, saldo negativo, payout falho/retomado, não presumir disponibilidade/repasse a partir de payment paid.
7. Homologar staging autorizado, perfis/IAM/TLS, assinatura/rotação de segredos, rotinas/alertas, backup/restore/ledger, privacidade/jurídico/contábil e piloto representativo antes de GO. Nenhuma fase foi autorizada por este documento.
