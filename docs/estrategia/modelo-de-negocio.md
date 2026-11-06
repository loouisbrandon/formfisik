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

## Domínios financeiros e evolução comercial

| Domínio | Pagador / recebedor | Estado e responsabilidade |
| --- | --- | --- |
| Billing SaaS | Profissional / FormFisik | Assinatura Pro descrita acima; implementação local de teste. Tabelas `billing_*` e `src/server/subscriptions/` pertencem a este domínio |
| Billing profissional | Aluno / profissional prestador | NÃO IMPLEMENTADO. Futuro marco 020; receita de serviço do profissional não é receita SaaS da FormFisik |

**Stripe Connect é a solução preferencial para o financeiro profissional**, condicionada à validação da disponibilidade e adequação dos modelos no Brasil antes da implementação. Esta consolidação registra a preferência do fundador; não verificou elegibilidade, contratação, tarifas ou disponibilidade atual do provedor e não configurou Connect. O webhook SaaS atual recusa eventos Connect: sua existência não atende ao marco 020.

Planejar contas conectadas e onboarding financeiro, identificação do recebedor, pagamentos avulsos e recorrentes, planos mensais/trimestrais/semestrais/anuais, taxas de processamento e política de taxas da plataforma, liquidação e repasses, reembolsos, contestações, inadimplência, conciliação, histórico financeiro, webhooks assinados, idempotência e auditoria. Registrar também recebimentos externos, com origem, comprovabilidade e regras de conciliação ainda a definir; um registro manual não comprova liquidação no provedor.

Separar fatos, identificadores, permissões, contratos e reconciliação dos dois domínios. Cobrança do aluno não concede assinatura SaaS ao profissional; inadimplência SaaS não deve ser interpretada como cancelamento automático de serviço ou dívida do aluno sem política específica aprovada. Não reutilizar tabelas SaaS para recebíveis profissionais sem decisão arquitetural própria.

Taxas da plataforma, responsabilidades por disputas/repasses, contratos e condições comerciais profissionais exigem decisão do fundador e validação competente. Não presumir que valores processados sejam receita própria ou custódia pela FormFisik.

Para o praticante, a visão futura inclui essencial gratuito e possível premium, marketplace, benefícios e recursos avançados. Não há novo plano implementado nem alteração do Pro de R$ 139,90/mês. Veja [estratégia](ecossistema-e-especialidades.md), [produto](../produto/personal-1.0.md) e [marcos 019–020](../planejamento/roadmap.md).

## Execução019 — comercial administrativo

Serviços, planos comerciais e contratações profissional-aluno passam a ser IMPLEMENTADOS LOCALMENTE na019, com preço total em centavosBRL, vigência, obrigações e renovação administrativa. Não são novos planos SaaS e não alteram Pro139,90/30dias/cartão. Valores acordados não são receita recebida; nenhuma cobrança, assinaturaStripe, emissão fiscal ou Connect foi implementada.020 continua futuro. [Módulo](../modulos/servicos-e-consultorias.md) e [diretrizes financeiras](diretrizes-financeiro-profissional.md) definem a fronteira e contratos preparados, sem presumir homologação jurídica ou financeira.

## Financeiro profissional020 — implementação local

Gestão local dos recebimentos do aluno pelo serviço do profissional, separada da assinatura SaaS. Preço vem do acordo019; frequência financeira é explícita e recorrência é finita, sem trial de aluno. Comissão FormFisik não definida/não cobrada. [Modelo e pendências Connect](../arquitetura/ADR-021-financeiro-profissional-connect.md). Não se presume responsabilidade jurídica, modalidade Connect disponível ou produção habilitada.

## Diretriz definitiva de gestão financeira — 06/11/2026

O financeiro profissional020 está implementado localmente com recebimentos externos e domínio integrado controlado, conforme documentação do módulo. A FormFisik é plataforma de gestão, sem intermediação obrigatória. Recebimentos externos são permitidos sem comissão FormFisik; o profissional pode utilizar todo o controle externo sem conta Stripe. Processamento integrado é opcional e ainda não homologado. Inadimplência do aluno não provoca bloqueio automático. Pro permanece independente da relação profissional/aluno. Esta diretriz atualiza as descrições históricas de020 futuro e de comissão externa indefinida acima.
