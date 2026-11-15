# Entrega 006.5 — Refinamento visual e experiência de assinaturas

## Resultado

Revisão de UX/UI do módulo, com foco em `/assinatura/gerenciar`: composição em Meu plano, Meu período, Gerenciamento e Histórico de faturas; linguagem simples, ações hierarquizadas, estados financeiros claros e apresentação responsiva. Oferta e retorno também receberam revisão de microcopy.

FormFisik é empresa independente. Esta entrega é de apresentação; não houve mudança de preço, trial, autorização, sessão, cancelamento financeiro, integração Stripe, webhooks, idempotência ou persistência. Nenhuma migration, dependência ou biblioteca visual foi adicionada. Não houve deploy, recursos externos ou desenvolvimento mobile/dashboard profissional.

## Antes e depois

| Antes | Depois |
| --- | --- |
| Card extenso com todas as datas, mesmo indisponíveis | Meu plano apresenta nome/preço/estado/acesso; Meu período aparece somente quando há dados consultáveis |
| Texto de configuração, servidor e reconciliação na experiência final | Mensagem compreensível sobre situação e próximo passo; detalhes operacionais continuam nos documentos técnicos |
| Ações com peso visual parecido | Regularizar/Gerenciar pagamento priorizados; cartão/faturas secundários e cancelamento separado |
| Trial só com data, sem resumo do tempo restante | Data e dias restantes; cobrança automática e política de cancelamento explícitas |
| Histórico como blocos extensos | Lista com data, status, valor devido/pago e estado vazio dedicado |
| Datas e confirmações espalhadas | Situação financeira e acesso separados, confirmação com data/hora e foco acessível |
| Falha de página dizia que nenhuma cobrança havia sido realizada | Fallback orienta retry/conta sem afirmar resultado financeiro que não pôde consultar |

Comparação visual no mesmo estado real de indisponibilidade (sem chaves):

- Antes desktop: `test-results/refinement-before/desktop.png`.
- Antes estreito: `test-results/refinement-before/narrow.png`.
- Depois desktop: `test-results/subscription-management-1440.png`.
- Depois estreito: `test-results/subscription-management-320.png`.

Os “antes” foram preservados antes dos ajustes, a partir da execução da 006. Capturas financeiras positivas da matriz abaixo usam **fixtures exclusivamente de teste**; não comprovam assinatura ou pagamento real.

## Componentes e arquivos

| Tipo | Arquivos |
| --- | --- |
| Painel/controller visual | `src/modules/subscriptions/subscription-dashboard.tsx` |
| Novos componentes do módulo | `billing-components.tsx`: BillingCard, SubscriptionBadge, AccessStatus, InvoiceHistory e estilo de link; `subscription-period.tsx`: SubscriptionPeriod |
| Formatação/microcopy | `src/modules/subscriptions/presentation.ts`; `status.ts` (somente rótulos, tipos/estados contratuais preservados) |
| Páginas | `src/app/(app)/assinatura/gerenciar/page.tsx`, `assinatura/page.tsx`, `assinatura/retorno/page.tsx`, `assinatura/error.tsx` |
| Oferta/retorno | `src/modules/subscriptions/checkout-status.tsx`, `subscription-result.tsx` |
| Testes | `tests/e2e.ts`, `tests/helpers/subscription-views.ts`, `tests/subscription-presentation.test.ts` |
| Documentação | `docs/design/DESIGN_SYSTEM.md`, `docs/modulos/assinaturas.md`, `CHANGELOG.md`, este relatório |

Reutilizados: Button/Base UI, Link/Next.js, Lucide, auth-surface/premium-surface, cores/fontes/radii/escala existentes. Nenhuma alteração global em CSS ou identidade. Componentes novos são específicos da assinatura; não criam abstrações de dashboard profissional. Contratos e props têm fonte no [Design System — seção 006.5](../design/DESIGN_SYSTEM.md).

## Decisões de apresentação

Grid em uma coluna para telas estreitas/tablet; em desktop, plano/período na coluna principal, ações na lateral e histórico em largura total. Ordem DOM favorece leitura e teclado. min-w-0/minmax evitam recorte; botões admitem quebra de texto. Cabeçalho compacto, link para pular navegação e foco visível.

Badge verde somente quando estado ativo/teste possui paidAccess verdadeiro. Acesso é comunicado separadamente, sem recalcular direito no cliente. Teste encerrado usa tom neutro; pagamento em atraso e confirmação adicional são compreensíveis. Meu período preserva início, término e período contratado quando presentes; cancelada prioriza a data efetiva de encerramento na apresentação.

Dias restantes são informação visual: diferença entre término recebido e horário da consulta, arredondada para cima e limitada a zero. Não autoriza, prolonga trial ou modifica datas. Formatação pt-BR no horário do dispositivo. Estimativa ausente não vira R$ 0,00; zero real recebido continua zero. Nenhum benefício, fatura ou assinatura foi inventado.

As ações continuam usando capabilities da resposta da API e os mesmos payloads: `{action}`, `{confirm:true,expectedEnd}` e Checkout `{}`. Nenhum novo endpoint, flag de desenvolvimento ou fallback financeiro. Erro remove apresentação positiva anterior e orienta atualização; foco vai ao alert. Confirmação vai ao feedback para não perder foco quando Cancelar desaparece.

Diálogo nativo: foco inicial em Manter assinatura, Escape sem POST, descrição das consequências, data/hora, confirmação explícita, limite de altura e rolagem interna. Abertura não executa cancelamento. Preço R$ 139,90, trial 30 dias, cobrança automática, acesso condicional e ausência de reembolso automático permanecem explícitos.

## Validação e reprodução

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build -- --webpack
git diff --check
```

Banco PostgreSQL 18 descartável `_test`, SMTP local e Chrome. Suites fazem TRUNCATE somente nesse banco isolado. Sem Stripe externa. UI fixtures são interceptadas pelo Playwright e vivem apenas em tests/helpers; não são importadas pela aplicação. Mesmo exibindo fixture de acesso liberado, `/api/access` real continua negando sem assinatura confirmada no servidor.

A suíte automatizada inclui as 77 regressões anteriores e três testes de apresentação: dias restantes nas fronteiras/expiração, distinção entre valor ausente e zero real, formatação BRL e mensagens de teste/período expirado/confirmação adicional. Backend financeiro, auth e migrations foram comparados por SHA-256 com registro anterior à edição: idênticos.

E2E avalia estados sem assinatura, teste ativo, ativa, cancelamento agendado, pagamento pendente/recusado, cancelada, teste expirado e indisponível. Casos adicionais de pausada, erro de Portal/refresh, retry, confirmação/Enter/Escape e foco continuam cobertos. Regressões reais locais de cadastro→SMTP→login→recuperação/sessões/oferta/retorno preservadas.

## Evidências visuais e acessibilidade

Matriz de nove estados em 320, 768 e 1440 px, com Axe tags WCAG 2 A/AA, 2.1 AA e 2.2 AA, verificação de overflow no documento e de conteúdo cortado nos cards. Notebook 1280 px com estado ativo; reflow 640 px equivalente à área CSS de desktop 1280 a 200%; aumento de texto raiz a 200% em 1280 px. Diálogo em 320×640 com rolagem/foco. Essas verificações não são certificação global de conformidade nem teste com leitor de tela real.

Arquivos locais ignorados pelo Git:

- `test-results/refinement/active-1440.png`: plano ativo (fixture de UI).
- `test-results/refinement/trialing-320.png`: teste gratuito em tela estreita (fixture de UI).
- `test-results/refinement/payment_failed-768.png`: pagamento recusado em tablet (fixture de UI).
- `test-results/refinement/cancel_scheduled-1440.png`, `none-1440.png`, `expired-320.png`, `unavailable-1440.png` e demais arquivos `<estado>-<largura>.png`.
- `test-results/refinement/active-notebook-1280.png`, `zoom-reflow-200.png`, `text-zoom-200.png`, `dialog-320.png`.
- `test-results/refinement/active-accessibility.yml`: árvore ARIA do conteúdo, com títulos, controles e nomes acessíveis.

Capturas desktop/estreitas/tablet foram inspecionadas; cores e tipografia preservadas, foco/ações legíveis. Ajustes após a revisão incluem tom neutro para teste encerrado e preservação da data de início. O contador de dias é apenas visual e não anuncia validade financeira além da resposta do servidor.

## Documentação e limitações

Design System atualizado com componentes, hierarquia, estados, interação e motivos das decisões visuais; módulo aponta para essa fonte única de apresentação. Histórico registra a entrega, sem duplicar regras de cobrança.

Homologação de Checkout/Portal, cartões e operações reais da Stripe de teste continua pendente das credenciais, como já documentado na 006. Não foi simulada como sucesso em runtime. Guardas locais/test-only permanecem intactos e produção não foi habilitada. Não houve teste com leitor de tela real; usaram-se Axe, árvore ARIA, teclado, foco e revisão visual. O histórico continua limitado às faturas recebidas pela API; lista completa no Portal quando disponível.

Resultados finais e encerramento do ambiente são registrados abaixo após a execução completa.

## Resultados finais

- `npm test`: **80 passaram**, zero falhas/skips/cancelados; 77 regressões anteriores mais três testes de apresentação. PostgreSQL real isolado, provedor Stripe controlado apenas nos testes.
- `npm run test:e2e`: **passou**, incluindo matriz de nove estados em três larguras, notebook, texto/reflow 200%, erro/retry, foco após cancelamento, skip link, diálogo e regressões de autenticação/oferta/retorno.
- Axe: **zero violações reportadas** nos estados/larguras/diálogo avaliados. Não equivale a certificação ou teste com leitor de tela real.
- Revisão visual: desktop, tablet, estreita, cancelamento e texto a 200% inspecionados. No mesmo estado real sem configuração em 320 px, a captura completa passou de 2742 para 2019 px ao remover datas vazias e explicações operacionais; informações comerciais necessárias foram preservadas.
- `npm run lint`, `npm run typecheck`: **passaram**, sem avisos.
- `npm run build -- --webpack`: **passou** como build de produção; nenhuma rota financeira ou migration adicionada. Turbopack não é alegado como validado nesta execução.
- `git diff --check` e verificação equivalente nos novos arquivos não rastreados: **passaram**.
- Comparação SHA-256: **backend de assinaturas, access/auth e migrations idênticos** ao início da entrega. Evidência local em `test-results/refinement/financial-preservation.txt`.
- Docker PostgreSQL descartável encerrado/removido; Next/SMTP temporários encerrados pelo runner e porta 3108 sem servidor acessível. O projeto não foi deixado rodando.

Nenhum segredo, recurso financeiro externo, cobrança real, deploy ou bypass de autorização foi criado. Homologação Stripe externa continua pendente das credenciais e do roteiro já documentado na operação.
