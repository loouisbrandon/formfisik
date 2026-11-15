# ADR-016 — Especialidades, identidade e domínios financeiros

Data: 01/11/2026. Estado: diretriz aceita para planejamento, conforme solicitação do fundador; **sem implementação**. A numeração da ADR não significa execução do marco 016.

## Contexto

O produto local já possui módulos de personal/musculação, sessões opacas, carteira privada, Billing SaaS e documentos. A empresa pretende um ecossistema multiesporte. Generalizar prematuramente aumentaria custo e risco; tratar a carteira atual como identidade global criaria vínculos indevidos.

## Decisão

1. Manter a independência empresarial definida na [diretriz institucional](../institucional/diretriz-institucional.md), sem presumir formalização jurídica ou recursos da Onebase.
2. Consolidar Personal 1.0 antes de implementar outra modalidade, salvo autorização estratégica expressa. Requisitos futuros não concedem autorização de execução.
3. Reutilizar capacidades comprovadas e especializar regras de modalidade quando houver escopo real; não criar infraestrutura multiesporte antecipada.
4. Separar conceitualmente pessoa, conta, perfil profissional, organização, modalidade, serviço, vínculo e permissões. Uma pessoa com múltiplos papéis não deverá precisar de contas distintas por esse motivo. Modelo atual continua intacto.
5. Separar Billing SaaS de Billing profissional; Stripe Connect é preferência condicionada à validação no Brasil, não integração disponível.
6. Aplicativo FormFisik Connect reutilizará contratos e regras do backend. React Native/Expo é preferência futura a confirmar; web permanece prioridade.
7. Homologação da Personal 1.0 exige evidências de fluxos reais, segurança, privacidade e operação, além de testes automatizados.

## Consequências e alternativas

Preservam-se ADRs 001–015, SQL simples, sessões opacas e propriedade atual. Adia-se tanto um framework genérico multiesporte quanto contas independentes por modalidade. Evoluções de identidade, organizações, serviços, pagamentos e mobile precisarão de ADRs específicas, plano de migração e regressões. Não se presumem tabelas novas existentes, Connect habilitado ou liberação de produção.

Referências: [arquitetura atual](visao-atual-e-evolucao.md), [estratégia](../estrategia/ecossistema-e-especialidades.md), [modelo comercial](../estrategia/modelo-de-negocio.md), [aceite](../produto/personal-1.0.md) e [roadmap](../planejamento/roadmap.md).
