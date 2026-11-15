# ADR-004 — Oferta Pro e fronteira de pagamentos

Estado: aceito; apresentação implementada; integração Stripe planejada.

FormFisik é independente. Há uma única oferta mensal, fonte de verdade comercial em docs/estrategia/modelo-de-negocio.md. Stripe é o gateway escolhido e Railway a hospedagem inicial. Esta decisão não significa conta financeira, produto, preço, Checkout, Billing, Portal ou webhook provisionados.

Separar catálogo puro (centavos BRL, periodicidade, trial e cartão), apresentação web e backend de disponibilidade. Não adicionar dependência Stripe ao produto nesta entrega. Contratos de domínio planejados ficam em subscriptions/contracts.ts; o futuro adapter Stripe traduzirá eventos e objetos para estados internos, sem contaminar módulos de treino com payloads de provedor. Não criar abstração multi-gateway ou banco de assinatura antes da integração.

Profissional confirmado é encaminhado a /assinatura após login. Outros perfis usam /conta sem contratação. Identidade vem de sessão validada; módulos pagos seguem bloqueados no servidor. commercial unavailable é ausência de integração, não assinatura ativa nem declaração de consulta ao gateway. Não há dados reais que justifiquem tratar trial/assinatura como ativos.

Ação de teste permanece desativada com explicação e disponibilidade consultada no backend. Nenhuma flag de cliente habilita checkout; nenhum endpoint faz operação financeira. Página informa condições comerciais e que ferramentas/checkout ainda não estão disponíveis.

Não criar migrations nesta fase: só há catálogo e navegação, sem fatos financeiros a persistir. Planejar Checkout/Billing, Portal e webhook com assinatura verificada, idempotência e autorização no servidor em entregas futuras, após autorização. Retorno de checkout não pode conceder acesso por si só.

Referências oficiais consultadas como base para responsabilidades futuras:
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/customer-management
- https://docs.stripe.com/billing/subscriptions/webhooks
