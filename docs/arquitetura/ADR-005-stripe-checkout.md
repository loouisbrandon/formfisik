# ADR-005 — Checkout e trial local Stripe

Decisão: aceita para a entrega 005, integração hospedada aguardando configuração externa.

FormFisik é independente e utiliza PostgreSQL próprio do projeto, autenticação por sessões opacas e SDK oficial Stripe exclusivamente no servidor. Adotamos Checkout hospedado em modo test, produto/preço previamente configurados, cartão obrigatório e trial de 30 dias. Não armazenamos dados completos de cartão. Não fazemos deploy ou chamadas live.

Intenções duráveis, índices únicos, advisory lock por usuário e chaves estáveis de idempotência previnem duplicação inclusive após timeout. Situação incerta bloqueia novas tentativas após o prazo seguro; exige reconciliação operacional. Marca de trial é permanente por usuário.

Webhook usa corpo bruto e assinatura/timestamp oficiais. Eventos são deduplicados transacionalmente; estado canônico é novamente consultado, evitando que ordem de chegada restaure trial cancelado. Retorno web não é prova de pagamento. Identidade e oferta são verificadas no servidor. Estado confirmado pode autorizar exclusivamente trial vigente por até cinco minutos antes de nova verificação; falhas negam acesso.

O adapter contém apenas operações necessárias; não introduzimos framework de múltiplos gateways. Catálogo comercial, domínio e UI ficam separados. Gerenciamento completo do ciclo/Portal continua na 006. A cobrança pós-trial não autoriza recursos nesta entrega.

Consequências: dependência de disponibilidade da Stripe para novas confirmações e reconciliação, e indisponibilidade explícita sem configuração. Testes controlados não substituem Checkout hospedado com cartões de teste; esta limitação é documentada e aceita pelo responsável que criará as chaves posteriormente. Não inferimos que constituição jurídica/societária da empresa esteja formalizada.
