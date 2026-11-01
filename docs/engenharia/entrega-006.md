# Entrega 006 — Gestão completa de assinaturas

## Resumo executivo

Gestão do ciclo de vida implementada no ambiente local: painel, Stripe Customer Portal, cancelamento confirmado ao fim do trial/período, faturas, renovação, regularização, webhooks, reconciliação e autorização centralizada. **Homologação financeira externa permanece pendente** das chaves/configuração Stripe, conforme escopo autorizado. Testes usam PostgreSQL real isolado e provedor controlado exclusivamente em código de teste. Não há bypass comercial em runtime.

FormFisik permanece empresa independente. Não houve deploy, criação de recursos Stripe externos, uso de chave live, cobrança real, mobile ou implementação de gestão de treinos. Arquivos de ambiente existentes e trabalho anterior no diretório foram preservados; nenhuma atualização forçada de dependências ou commit foi executado.

## Funcionalidade e regras

- `/assinatura/gerenciar`: plano Pro R$ 139,90/mês, estado financeiro/acesso separados, início/trial/período, próxima cobrança/estimativa quando disponível, situação de cancelamento e últimas faturas sincronizadas. Conta/oferta/painel disponíveis sem assinatura paga.
- Portal completo autenticado da própria conta: cartão, faturamento, histórico/comprovantes e pagamento de fatura aberta. Configuração validada no servidor; mudança de plano/quantidade e cancelamento pelo Portal desabilitados. Conferir no Portal o método efetivo da assinatura, incluindo preferência específica por cartão.
- Cancelamento exige confirmação e data exibida compatível com período canônico. Trial mantém acesso até trial_end; paga mantém até fim do período regular. Agenda `cancel_at` com alvo durável e sem prorations. Sem reembolso automático/perdão de faturas anteriores. Novo trial ou nova assinatura pós-encerramento não é oferecido.
- Sem carência em pendência/recusa/inadimplência. Ativa exige fatura corrente paga, saldo zero e linha contratada cobrindo período. Trial/assinatura precisam ser vigentes e confirmados. Cancelamento agendado não antecipa remoção de acesso elegível; encerramento/pausa/expiração negam acesso.
- Snapshot comum vale no máximo cinco minutos; acesso sensível força reconciliação. Falha conhecida marca erro e nega acesso imediatamente. Retry passivo aguarda até 60 segundos; refresh/ações explícitas possuem rate limiting. Login e sessões permanecem independentes da disponibilidade Stripe.
- Webhooks usam assinatura/timestamp/corpo bruto existentes; tipos ampliados e estado canônico atual, inclusive fatura/PaymentIntent, impedem regressão por evento atrasado. Locks serializam; snapshot/faturas/evento/confirmação são transacionais. Rede ocorre fora da transação SQL.
- Cancelamento com timeout recupera pela mesma intenção/alvo/chave após consulta canônica; resultado já aplicado não é repetido. Intenção vencida ou incerteza superior a 23h exige operação manual antes de nova mutação. Script local de reconciliação recupera fatos perdidos, sem segundo motor de cobrança.

Mapeamento de estados, API, schema, política e recuperação detalhados na [fonte de verdade do módulo](../modulos/assinaturas.md). Decisões na [ADR-006](../arquitetura/ADR-006-ciclo-assinaturas.md).

## Arquivos envolvidos

| Área | Arquivos |
| --- | --- |
| Migration | `db/migrations/005_subscription_lifecycle.sql` |
| Reuso/refatoração servidor | `src/server/subscriptions/stripe.ts`, `service.ts`, `status.ts`, `handlers.ts` |
| Novos serviços internos | `src/server/subscriptions/store.ts`, `lifecycle.ts`, `management.ts` |
| Contratos/UI | `src/modules/subscriptions/status.ts`, `contracts.ts`, `subscription-dashboard.tsx`, `subscription-result.tsx` |
| Página e navegação | `src/app/(app)/assinatura/gerenciar/page.tsx`, `assinatura/page.tsx`, `conta/page.tsx` |
| Endpoints | `src/app/api/subscriptions/cancel/route.ts`, `portal/route.ts`, `src/services/api/endpoints.ts` |
| Autorização | `src/server/access.ts`, `src/server/auth.ts` (apenas entitlement/refresh e mensagem de acesso, sem alterar credenciais/sessões) |
| Operação | `scripts/reconcile-billing.ts`, `package.json` (novo script), `.env.example` (Portal) |
| Testes | `tests/subscription-lifecycle.test.ts`, `tests/helpers/controlled-billing.ts`, `tests/stripe.test.ts`, `tests/e2e.ts` |
| Documentação | módulo assinaturas/autenticação, cadastro-profissional (somente linha em branco final), ADR-006, modelo de negócio, Stripe local, ambientes/Railway, Design System, roadmap, README, CHANGELOG, este relatório |

Migration 005 adiciona períodos/cancelamento/pausa/fatura/cobertura ao modelo existente; tabelas billing_invoices e billing_cancellations; sync_state e tentativa em billing_accounts. Invalida snapshots antigos para exigir consulta canônica. Não altera usuários/credenciais nem remove dados existentes. Runner aplica por checksum e lock; migrations anteriores não foram editadas.

## Testes e evidências

Comandos reproduzíveis (banco descartável `_test`, nunca compartilhado; suites fazem TRUNCATE):

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build -- --webpack
git diff --check
```

Validação em PostgreSQL 18/Chrome, com SMTP local nas regressões de autenticação. Fixtures Stripe ficam em tests/helpers e são injetadas somente por testes de serviço/handler. Nenhuma variável seleciona fake na aplicação.

Cobertura automatizada do ciclo:

| Requisito | Evidência em tests/subscription-lifecycle.test.ts |
| --- | --- |
| Sem assinatura/checkout pendente/URL manipulada | negação e identidade da sessão |
| Trial vigente/expirado e paid ativo/expirado | limites e cobertura de período/fatura |
| Pendente/recusado/autenticação adicional/regularização | fatura e PaymentIntent canônicos, sem carência |
| Renovação e fatura antiga | nova cobertura; evento antigo não restaura acesso |
| Cancelamento trial/pago/encerramento | limite correto, sem próxima renovação, trial único preservado |
| Repetição/concorrência | uma mutação externa por intenção |
| Timeout antes/depois da operação | chave/alvo mantidos e recuperação sem duplicação |
| Confirmação desatualizada/23h incertas | conflito antes de mutação indevida |
| Não autenticado/origem/corpo/terceiro | endpoints e vínculo do usuário |
| Portal/configuração/URL | próprio cliente, configuração/retorno fixos, HTTPS permitido |
| Indisponibilidade/reconciliação/eventos perdidos | negação após falha e recuperação canônica |
| Webhook bruto/assinatura/duplicata/fora de ordem/Connect/live | SDK real e fixtures de provedor sem rede externa |
| Falha SQL | trigger de teste força rollback; evento reentregue recupera |
| Preview opcional | falha não inventa valor nem altera acesso regular |

E2E executa fluxo real local de cadastro→SMTP→login→recuperação, regressões de sessões e oferta/retorno. Novo painel é exercitado sem chaves (indisponibilidade real). Fixtures HTTP **somente de UI** cobrem trial, ativa, pendente, recusada, cancelada, expirada, pausada e cancelamento agendado. Diálogo por teclado/Enter/Escape/confirmar, erro do Portal/refresh e retry. Mesmo com fixture visual favorável, `/api/access` real continua negando, comprovando ausência de bypass.

Axe com tags WCAG 2 A/AA, 2.1 AA, 2.2 AA e revisão de overflow nos tamanhos avaliados. Capturas ignoradas pelo Git:

- `test-results/subscription-management-320.png` — painel estreito sem configuração.
- `test-results/subscription-management-1440.png` — painel desktop sem configuração.
- `test-results/subscription-cancel-dialog.png` — diálogo com fixture explícita de trial para UI.

Capturas mobile e diálogo inspecionadas visualmente; preservam paleta/tipografia, labels e foco em Manter assinatura. Não equivalem a certificação de acessibilidade, leitor de tela real ou interface hospedada da Stripe. Histórico de execuções/resultados finais registrado ao final deste relatório.

## Homologação Stripe pendente

Configurar localmente STRIPE_SECRET_KEY sk_test_, STRIPE_PRODUCT_ID, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET e **STRIPE_PORTAL_CONFIGURATION_ID** bpc_… ativo. Nenhum segredo deve ser enviado no chat. [Procedimento, eventos CLI, configuração Portal e roteiro completo](../operacao/stripe-local.md).

Ainda não executados contra Stripe real de teste: Checkout/Portal hospedados, cartão aceito/recusado/expirado/3DS, aplicação efetiva do novo cartão à assinatura, cancelamento ao fim do trial sem primeira cobrança, primeira cobrança/renovação por Test Clocks, pagamento de fatura e reativação do acesso por regularização. Contratos SDK oficiais foram consultados e compilados, mas testes controlados não comprovam compatibilidade/efeito financeiro em rede.

## Produção e riscos conhecidos

Guardas test-only/origem local mantidos; não foi habilitada cobrança no Railway. Produção depende de nova autorização operacional, homologação externa, domínio/TLS, secrets, webhooks, Portal, backup/migrations, observabilidade/retenção e agenda de recuperação conforme necessidade. Não executar deploy apenas por existir código integrado.

Política sem carência pode interromper acesso em falha temporária ou verificação incerta; é decisão explícita de segurança. Estimativas de próxima cobrança podem ficar ausentes se preview falhar. Histórico local é parcial (eventos/sync observados); Portal é fonte do histórico completo. Uma única assinatura por usuário e trial único permanecem; recontratação após encerramento e desfazer cancelamento não são oferecidos. Pausa é reconhecida para negar acesso, sem nova ação de pausa/retomada.

Conflitos/resultado incerto antigo exigem reconciliação operacional, sem apagar marca de trial ou trocar chave/alvo. Não criamos cron/alertas externos. Alertas de dependências reportados na 005 continuam como pendência de revisão antes de produção; não houve atualização indiscriminada nem nova auditoria de dependências alegada nesta entrega.

## Resultado final verificável

- `npm test`: **77 passaram**, zero falhas, skips ou cancelados; 25 testes novos do ciclo, 14 do Checkout e 38 regressões de autenticação/cadastro/recuperação. Duração da execução final: aproximadamente 73 segundos. Inclui o caso de fatura lida antes do lock não sobrescrever a consulta canônica mais recente.
- `npm run test:e2e`: **passou** em Chrome com PostgreSQL/SMTP locais; inclui erro do Portal, confirmação/Escape, estados financeiros controlados, navegação, proteção de rota e regressões anteriores.
- Axe: **zero violações reportadas** no painel em 320/1440 px e no diálogo avaliados; revisão visual desktop/estreita e foco realizadas. Evidências listadas acima. Não é certificação global.
- `npm run lint`, `npm run typecheck`: **passaram**, sem avisos.
- `npm run build -- --webpack`: **passou**; novas rotas de gestão/cancelamento/Portal incluídas como dinâmicas. Webpack foi usado conforme alternativa de build já validada na 005; Turbopack não é alegado como validado nesta execução.
- `git diff --check`: **passou**; verificação adicional `git diff --no-index --check` nos novos arquivos de código/documentação também passou, após remover uma linha em branco final em documento anterior.
- `STRIPE_SECRET_KEY= npm run billing:reconcile`: **recusou configuração ausente**, exit 1 com código estático, antes de conexão ao banco/Stripe. Reconciliação real em rede permanece pendente; comportamento de serviço foi testado com provedor controlado.
- PostgreSQL Docker temporário encerrado/removido após os testes; Next/SMTP encerrados pelo runner, porta de teste 3108 sem servidor acessível. O projeto não foi deixado rodando.

Nenhuma homologação financeira externa é declarada. Configuração Stripe e roteiro futuro continuam pendentes conforme seção própria.
