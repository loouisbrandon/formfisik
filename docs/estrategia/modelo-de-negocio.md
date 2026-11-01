# Modelo de negócio — FormFisik Pro

Estado: regras comerciais definidas; oferta web implementada na 004 e Checkout/trial local de teste preparado na 005. Validação hospedada aguarda credenciais. Ciclo de gestão implementado localmente na 006 com testes controlados; homologação externa e produção ainda pendentes.

## Oferta

| Item | Regra |
| --- | --- |
| Plano | Plano único: FormFisik Pro |
| Preço | R$ 139,90 mensais |
| Período experimental | 30 dias |
| Início do teste | Cartão obrigatório |
| Fim do teste | Cobrança automática, salvo cancelamento anterior |
| Acesso | Completo durante o trial e enquanto a assinatura estiver ativa |

## Requisitos técnicos

O controle de assinatura e autorização deve ser realizado no servidor. A integração de pagamentos deve utilizar provedor confiável, sem armazenamento próprio de dados completos de cartão.

## Definições pendentes

Provedor escolhido: **Stripe**. Checkout e confirmação inicial por webhooks implementados para testes locais; Billing/Customer Portal integrados no código na 006, com homologação externa pendente. Nenhum produto/preço ou conta financeira foi provisionado por esta execução. Hospedagem inicial: Railway.

Política implementada: sem carência de acesso em pendência/recusa/inadimplência; regularização na Stripe restaura somente após confirmação de assinatura ativa e período pago. Cancelamento do trial preserva acesso até trial_end e impede renovação; no período pago, encerra renovação no fim do período. Sem reembolso automático ou perdão de faturas anteriores. Não há recontratação ou desfazer cancelamento nesta UI.

A oferta pertence à FormFisik, empresa independente, conforme a [diretriz institucional](../institucional/diretriz-institucional.md).

## Apresentação e contratação

Página autenticada `/assinatura` apresenta o plano único e as condições acima. Catálogo executável: `src/modules/subscriptions/plan.ts` (preço em centavos, moeda e periodicidade). Sem configuração Stripe de teste, Checkout fica indisponível. Com configuração local válida, inicia sessão hospedada; cartão é coletado exclusivamente pela Stripe. Trial só é autorizado após dados canônicos confirmados no servidor. Há migrations de estado comercial, sem registros fictícios em runtime.

Condições comunicadas: cancele antes do fim dos 30 dias para evitar a primeira cobrança; cancelamento é solicitado e confirmado no painel de assinatura segundo a política acima. Solicitar não implica confirmação; resultado incerto exige reconciliação.

## Atualização da entrega 005

Integração de Checkout e trial inicial preparada exclusivamente para ambiente local Stripe de teste. Há persistência e confirmação no servidor; uso hospedado aguarda configuração e validação com cartões de teste. Nenhum recurso financeiro externo foi criado. [Módulo e limites](../modulos/assinaturas.md). Gestão implementada na 006 e descrita no módulo; não há liberação comercial/produção.
