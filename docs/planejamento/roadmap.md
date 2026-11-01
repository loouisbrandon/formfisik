# Roadmap

Estados refletem funcionalidades entregues, não apenas decisões.

| Entrega | Estado | Resultado |
| --- | --- | --- |
| 001 — Cadastro | Implementado/verificado | PostgreSQL, Argon2id, confirmação de e-mail |
| 002 — Login/sessões | Implementado/verificado | Sessões opacas, expiração e logout |
| 003 — Recuperação | Implementado/verificado | Link temporário, troca e revogação de sessões |
| 004 — Oferta Pro | Implementado/verificado | Página, regras comerciais, navegação autenticada, contratação indisponível |
| 005 — Checkout/trial local | Implementado e testado com provedor controlado; validação hospedada pendente | Stripe SDK, PostgreSQL, webhooks assinados, idempotência e autorização inicial; aguardando chaves de teste |
| 006 — Ciclo de assinatura | Implementado/testado com provedor controlado; homologação externa pendente | Painel, Portal, cancelamento agendado, faturas, renovação, autorização central e reconciliação |

| 006.5 — Refinamento de assinaturas | Implementado/verificado | Hierarquia visual, acessibilidade e responsividade do módulo comercial |
| 007 — Dashboard profissional | Implementado/testado em ambiente controlado | Shell compartilhado, navegação, onboarding, estados vazios e autorização no servidor; acesso manual com Stripe depende de configuração |

Entregas 005/006 implementadas no ambiente local; não há autorização de produção ou deploy implícita. Requisitos de webhooks, validação de assinatura, idempotência e reconciliação precisam acompanhar a ativação financeira; não liberar trial/acesso antes de esses controles existirem.

A exportação premium de treinos, operação Railway e abertura pública terão escopos próprios; não declarar módulos entregues apenas porque aparecem na oferta. React Native é fase futura. Preço, plano e trial vêm do modelo de negócio; não criar novas ofertas neste roadmap.

## Módulo 03 — Área profissional

007: dashboard, shell autenticado, navegação, onboarding e estados vazios implementados. Validação de acesso com provedor controlado; homologação Stripe/manual com assinatura real depende de configuração. Ao concluir a 007, esses módulos estavam futuros e indisponíveis. Alunos passa a ser operacional na 008 e Exercícios na 009; Treinos passa a ser operacional na 010; a 012 ativa acompanhamento e configurações continuam futuras. [Relatório 007](../engenharia/entrega-007.md).

## Entrega 008 — Carteira de alunos

Gestão cadastral privada implementada: cadastro/lista/filtros/paginação, perfil/edição, arquivo/reativação, concorrência, metadados administrativos e PDFs. Dashboard passa a usar contagens reais e cadastro do primeiro aluno. Ao fim da 008, login/portal/identidade global de aluno, exercícios, treinos e avaliações ainda eram futuros. Exercícios foi implementado separadamente na 009. Homologação Stripe externa segue independente e pendente. Ver [módulo](../modulos/alunos.md) e [relatório 008](../engenharia/entrega-008.md).

## Entrega 009 — Biblioteca de exercícios

Catálogo auditado offline, importação idempotente PostgreSQL, biblioteca/filtros/busca, seleção múltipla reutilizável, particulares e solicitações com moderação restrita implementados. Evidências e estado de validação no [relatório 009](../engenharia/entrega-009.md). Provisionamento real de moderador, revisão técnica do catálogo e homologação Stripe externa permanecem pendentes operacionais. Na 009, Exercícios deixa de ser futuro; as referências anteriores descrevem o estado ao concluir cada entrega. A 010 deverá implementar fichas usando IDs/versões canônicos e revalidação no servidor; nenhuma prescrição foi antecipada.

## Entrega 010 — Prescrição e modelos

Planejamentos individuais, editor comum de modelos, divisões, séries individuais, técnicas estruturadas, referências a versões do catálogo, histórico e aplicação em lote por cópias independentes. Integração com alunos/dashboard e documentação em [Treinos](../modulos/treinos.md), [Modelos](../modulos/modelos-de-treinamento.md) e [relatório 010](../engenharia/entrega-010.md), que registra a validação efetivamente executada. A 011 será a exportação premium a partir da prescrição canônica/versionada, sem segundo modelo de dados. Homologação externa Stripe e revisão técnica do catálogo continuam pendências próprias; não há deploy implícito.

## Entrega 011 — Documentos profissionais

Exportação Compacta/Premium de fichas individuais versionadas, configuração real, prévia/download autenticados do mesmo PDF e apresentação profissional com logo persistente sanitizado. Reutiliza snapshots/PDFKit. [Módulo](../modulos/exportacao-treinos.md) e [relatório de validação](../engenharia/entrega-011.md). Esta seção atualiza as menções históricas à 011 futura. Sem WhatsApp API, envio, execução de treino ou deploy. Homologação Stripe e revisão profissional do catálogo seguem pendências operacionais separadas.

## Entrega 011.5 — Refinamento visual dos documentos

Apresentação Premium/Compacta refinada no gerador existente, com matriz comparável antes/depois, revisão de paginação/cinza e regressão do fluxo 011. Sem nova funcionalidade de negócio ou mudança de infraestrutura/segurança. [Relatório](../engenharia/entrega-011.5.md).

## Entrega 012 — Acompanhamento físico

Avaliações individuais persistidas, edição/versionamento, arquivo/reativação, auditoria, gráficos cronológicos e comparação com integração à carteira/dashboard. [Módulo](../modulos/acompanhamento.md) e [relatório](../engenharia/entrega-012.md). Sem fotos, IA, portal, teleconsulta ou PDF de acompanhamento. Próximas evoluções dependem de escopo: política operacional de retenção/eliminação, eventual virtualização de históricos muito grandes e futura exportação específica. Homologação Stripe e deploy continuam pendentes próprios, sem autorização implícita.

## Entrega 013 — Fotografias e calendário

Implementação local com registros independentes e autorização específica, armazenamento privado preparado para R2, fila de limpeza, calendário agregado mensal/anual, comparação lado a lado e acompanhamento organizado. [Relatório/evidências](../engenharia/entrega-013.md). A menção “sem fotos” na 012 permanece como escopo histórico dessa entrega. R2 real, scheduler de limpeza, retenção/backups e homologação externa permanecem pendências operacionais; sem deploy ou bypass comercial.

### Auditoria retrospectiva de organização

| Módulo | Diagnóstico e decisão | Próxima prioridade |
| --- | --- | --- |
| Carteira/cadastro 008 | Busca, filtros e páginas de 20 no servidor; formulário administrativo curto por seções. Reutilizado seletor; sem necessidade de wizard | Baixa: avaliar somente com novos campos reais |
| Biblioteca 009 | Filtros/páginas de 20, seleção persistente e particulares/moderação separados; sem carregamento massivo para ocultar | Baixa: medir uso antes de virtualização |
| Editor 010 | Divisões e técnicas progressivas existentes; fichas grandes ainda podem ter uma divisão extensa. Não alterar prescrições nesta entrega | Média: propor painel por divisão/ocorrência preservando rascunho e foco, com escopo e regressão próprios |
| Histórico 010 | Versões paginadas de 20 e consulta explícita; mantido | Baixa: filtros adicionais só com demanda |
| Exportação 011/011.5 | Configuração progressiva e PDF.js página a página, paginação do documento já validada; fotos não entram no gerador | Baixa: preservar sem redesenho |
| Acompanhamento 012/013 | Antes gráficos e comparação longa simultâneos. Aplicados painéis, indicador alternável, regiões recolhíveis e expansão explícita de ausências | Concluído neste escopo; futura virtualização apenas após medição |
| Fotografias/calendário 013 | Histórico 10, escolhas 12, auditoria 20, dia até 10 por tipo; indicadores agregados | Operacional alta: R2 e limpeza antes de uso real |

Regra permanente em AGENTS e Design System. Preservar filtros, seleções e dados ainda não salvos; diagnóstico não autoriza expansão automática de outros módulos.
