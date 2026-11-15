# ADR 021 — Financeiro profissional e modelo Connect (Entrega 020)

Estado: arquitetura local implementada; fronteira de provedor validada somente por injeção controlada. Ativação externa BLOQUEADA. Decisão comercial/jurídica final pendente. Referência da pesquisa oficial: 02/11/2026.

FormFisik é empresa independente fundada por Brandon Louis. Independência operacional não comprova constituição jurídica formalizada. O profissional presta o serviço ao aluno; FormFisik fornece software. Billing SaaS continua isolado.

## Alternativas avaliadas

| Modelo | Fluxo e impacto | Adequação à FormFisik |
| --- | --- | --- |
| Direct Charges | Cobrança na conta conectada; consultas precisam do contexto dessa conta | Recomendação técnica condicionada: relação direta profissional/aluno e um recebedor por contratação |
| Destination Charges | Cobrança na plataforma e destinação ao conectado; saldo da plataforma suporta custos/reembolsos/disputas desse fluxo | Não recomendado como padrão sem decisão expressa sobre riscos e responsabilidades adicionais |
| Separate Charges and Transfers | Cobrança e distribuição separadas; útil para múltiplos recebedores e alocação posterior | Complexidade sem requisito atual; não implementar divisão, custódia ou transferências próprias |

A comparação oficial descreve a movimentação e responsabilidades técnicas dos [tipos de cobrança](https://docs.stripe.com/connect/charges). Essa topologia não substitui a análise contratual do comerciante responsável. O [merchant of record](https://docs.stripe.com/connect/merchant-of-record) deve corresponder à relação real, identificação no checkout, termos, comprovantes, suporte e descritor; precisa ser validado antes da ativação.

## Contas, risco e Brasil

Para uma plataforma nova, avaliar Accounts v2, configuração merchant, dashboard completo e onboarding hospedado. [Accounts v2](https://docs.stripe.com/connect/accounts-v2) é a recomendação atual; tipos legados Standard/Express/Custom não foram adotados automaticamente. A disponibilidade da configuração, responsabilidades por tarifas/perdas, capacidades, API estável e operação de uma plataforma brasileira devem ser confirmadas com a Stripe no perfil efetivo. Um exemplo da documentação não comprova elegibilidade brasileira.

No modelo direto, valores e ajustes afetam a conta conectada; a atribuição final de perdas exige configuração/termos aplicáveis. Não foi prometida ausência de responsabilidade da FormFisik. [Gestão de risco](https://docs.stripe.com/connect/risk-management) distingue perdas por configuração. A proposta de coletor de tarifas/perdas Stripe e acesso completo é uma preferência a homologar, não uma configuração criada ou garantia de isenção.

Aptidão para receber pagamentos é distinta da aptidão para receber repasses. Requisitos/capacidades são consultados, sem receber documentos KYC, CPF, dados bancários ou cartão na aplicação. [Capacidades](https://docs.stripe.com/connect/account-capabilities) dependem de verificação; sandboxes podem não impor todos os requisitos. Nenhum onboarding foi executado contra a Stripe externa.

## Métodos e periodicidade

Preparação inicial do fluxo hospedado: cartão em BRL, sem comissão e sem trial de aluno. Pix direto registrado manualmente é pagamento externo. [Pix na Stripe](https://docs.stripe.com/payments/pix) possui disponibilidade/requisitos específicos, inclusive documentação atual de recorrência; não foi ativado nem tratado como universalmente indisponível. Boleto, Pix Automático e parcelamento de cartão exigem homologação separada; nenhum desses meios é oferecido como integrado.

A duração do serviço não determina a frequência financeira. A configuração explícita divide o preço total preservado em 1..120 obrigações, vencendo no início e depois em intervalos de 1/3/6/12 meses, dentro da vigência. Recorrência finita exige valores iguais em centavos; parcela externa distribui eventual resto de centavos. Não é financiamento ou parcelamento de cartão. Não se aumenta o total contratado nem se renova o acordo 019 automaticamente. Outra contratação administrativa pode ter sua própria configuração financeira.

## Custos e decisões pendentes

Não fixar tarifa genérica nem comissão FormFisik. Conferir [preços Connect Brasil](https://stripe.com/br/connect/pricing), processamento, Billing, meios locais, disputas, câmbio, restituição de tarifas e condições negociadas antes do aceite. A aplicação armazena somente custos efetivamente observados; desconhecido não significa gratuito. Sem previsão de receita de comissão.

O fundador precisa aprovar: identificação e obrigações do comerciante; suporte/disputas/reembolsos e saldos negativos; recebedores elegíveis PF/PJ e menores; custos/contratação Stripe; termos do aluno e autorização da recorrência finita; cobrança de eventual comissão em entrega futura; inadimplência e acesso aos treinos; retenção e responsabilidades jurídicas/contábeis. Nenhuma dessas decisões foi inventada.

## Implementação e fronteira bloqueada

`src/server/finance/provider.ts` define contratos normalizados independentes da configuração de conta. `runtimeGateway()` recusa operações externas; não existe variável para selecionar fake ou habilitar live. A implementação de transporte/normalização Accounts v2/Checkout/Billing/Balance Transactions reais permanece uma etapa de homologação externa autorizada, após as decisões acima. Não se apresenta o provedor controlado como adaptador Stripe pronto para rede.

A assinatura criptográfica do webhook usa o SDK Stripe existente, com segredo Connect separado e corpo bruto limitado. O receptor trabalha com eventos snapshot v1 `event.account`; notificações thin/v2 exigirão resolução/autenticação conforme o transporte escolhido e não são silenciosamente aceitas como equivalentes. Interfaces e testes preservam essa distinção.

Entidades próprias: conta conectada, configuração financeira por contratação canônica, obrigação por ciclo, recebimento externo imutável/corrigível por novo registro, intenção durável, evento mínimo, webhook e repasse observado. Não há segunda contratação/serviço/plano, customer ou assinatura SaaS compartilhados.

O lock profissional 18018 serializa com 019/CRM; transações SQL curtas persistem intenção antes de I/O, e confirmação/fatos/auditoria são atômicos. Rede ocorre fora de transação SQL. Incerteza guarda a chave original; após 23 h exige operador, sem gerar cobrança substituta. Reembolsos pendentes reservam intenção e bloqueiam concorrentes. Cancelamento financeiro não modifica 019; falha financeira não suspende treinos.

Reprocessamento usa estado canônico atual do provedor e não ordem do evento; dados monetários/conta/moeda/associação são revalidados. Não há saldo disponível bancário presumido nem distribuição automática de repasse por cobrança. Valores líquidos divergentes ficam sinalizados para revisão, inclusive ajustes que exigem explicação contábil.

## Consequências e veredito

GO local depende de testes e evidências da entrega; não constitui aprovação externa. Sem credenciais, alteração de ambiente, conta externa, transferência, cobrança, reembolso real, deploy ou commit. NO-GO 015–019 permanece. Política de retenção financeira ainda requer decisão: worker 016 bloqueia eliminação em vez de apagar evidências ou inventar prazo fiscal.

## Revalidação de escopo e fontes — 06/11/2026

Diretriz definitiva: processamento opcional, financeiro externo independente e sem comissão FormFisik sobre recebimentos externos. Não altera responsabilidades legais ou ativa Connect. [Direct Charges](https://docs.stripe.com/connect/direct-charges) continua sendo topologia candidata, sujeita à configuração de conta, país, capacidades, responsabilidade por perdas e homologação. A documentação de [contas conectadas](https://docs.stripe.com/connect/accounts) distingue configurações legadas e orienta novas plataformas para Accounts v2; nenhum tipo Standard/Express/Custom foi presumido como aprovado nesta execução.

A documentação atual de [Pix](https://docs.stripe.com/payments/pix) descreve suporte Connect e elegibilidade condicionada; em contas brasileiras, informa Pix avulso com liquidação BRL e indisponibilidade de Pix Automático. Isso não comprova capacidade ativa da conta FormFisik. Reembolsos possuem estados próprios e solicitação não prova crédito bancário. Não habilitar métodos, taxas ou recorrência com base apenas na existência da página de documentação. Runtime permanece bloqueado; DI controlada é exclusivamente teste.
