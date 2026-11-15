# Fronteira comercial 019 e financeiro profissional 020

FormFisik independente fundada por Brandon Louis; sem presumir formalização jurídica.019 é gestão administrativa local, não pagamento.020 possui domínio local/controlado, conforme [módulo](../modulos/financeiro-profissional.md); ativação/transporte externo continuam bloqueados. Stripe Connect é preferência futura condicionada a validação de disponibilidade/adequação no Brasil, decisões de negócio/risco e autorização; nenhum recurso financeiro externo foi criado. IDs/operações sintéticos são restritos aos testes controlados e não selecionáveis no runtime.

Billing SaaS: profissional paga FormFisik Pro 13990 centavos/mês,30 dias/cartão. Billing profissional futuro: aluno paga profissional por serviço. Não reutilizar tabelas billing_* ou eventos do webhook SaaS para tratar recebíveis do profissional. Contratação administrativa não ativa SaaS; perda de SaaS não cancela acordo do aluno automaticamente.

Contrato interno preparado em billingIntent(owner,id) e leitura privada view=billing: profissional e aluno autorizados, ID canônico do acordo, preço total acordado em price_cents inteiros, currency=brl, start/finish inclusivos, state administrativo persistido, billing_intent unspecified/one_off/recurring, duration/unit da configuração e previous_id da renovação. administrativeOnly:true, paymentImplemented:false. Datas/estado devem ser revalidados pelo futuro consumidor; state persistido não é garantia de vigência ou liquidação. Valor não é saldo, fatura ou receita recebida. Quantidade de sessões não multiplica preço automaticamente.

O domínio020 local define recebedor/eligibilidade/autorização, moeda/precisão, avulso/recorrente/manual externo, ciclos, estados, webhooks/reconciliação/idempotência. Tarifas reais, responsabilidades finais e política de retenção dependem de homologação externa e aprovação. Não presumir que todo acordo de intenção recorrente possua débito automático ou aceite financeiro. Renovação 019 cria novo rascunho e não assinatura Stripe.

020 acrescenta bloqueio financial_retention ao worker016/replay para dependências financeiras; não apaga histórico financeiro por reutilizar expurgo019. Política de triagem e eliminação cabível permanece pendente. Nenhum prazo fiscal/jurídico, emissão fiscal, custódia, taxa ou responsabilidade legal foi presumido. Pré-requisitos operacionais 015–018 e NO-GO de produção permanecem.

## Atualização020

O consumidor financeiro agora revalida contratação/versão/preço/owner/aluno e guarda configuração própria sem duplicar acordo. Guarda financeira de retenção antecede expurgo016. A visão billingIntent019 permanece administrativa e compatível; paymentImplemented:false descreve o domínio019, não um pagamento confirmado. [ADR021](../arquitetura/ADR-021-financeiro-profissional-connect.md) documenta modelo recomendado, alternativas e decisões pendentes.

## Diretriz definitiva do fundador — 06/11/2026

FormFisik é plataforma de gestão profissional; processamento integrado é opcional. O profissional pode usar exclusivamente recebimentos externos, sem conectar Stripe e sem comissão FormFisik sobre esses recebimentos. Inadimplência do aluno não bloqueia automaticamente vínculo, treino, acompanhamento ou comunicação. Assinatura Pro é independente.

O painel reúne origens para gestão, preservando identificação e totais separados: pagamentos do processador e declarações externas registradas/conferidas. Conferência pelo profissional não comprova liquidação bancária. Reutilizar alunos, serviços, planos e contratações canônicos. Nenhum recurso essencial de controle externo depende do gateway. Esta decisão substitui a indefinição anterior de comissão para recebimentos externos; não define tarifas ou responsabilidades do processamento integrado, que permanece não homologado.
