# ADR-026 — Indicadores sobre fatos canônicos

Decisão do Marco025: reutilizar carteira008, CRM018, acordos019, financeiro020, agenda021 e ocorrências022, sem warehouse, eventos duplicados ou materialização especulativa. Projeções SQL para novos agrupamentos são necessárias porque nenhum contrato existente entrega comparação empresarial consistente entre módulos. Reutilizar cálculos comprovados de finanças e disponibilidade com executor transacional opcional e snapshot read-only repeatable-read. Sem dependências novas.

Não há classificação de conversão comercial nas etapas: devolver null com explicação, sem presumir venda ganha. Reconstrução de carteira considera somente vínculos existentes; não denominar retenção ou carteira ativa histórica. Posições atuais são separadas dos fatos por período. Não exportar PDFs individuais como relatório executivo; contrato empresarial de exportação permanece futuro. Não criar diagnóstico/adesão, pagamento/repasse ou efeito automático.

FormFisik independente; produção permanece NO-GO. Decisão não autoriza infraestrutura, dados reais ou deploy.
