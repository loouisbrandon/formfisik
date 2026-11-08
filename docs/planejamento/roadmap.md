# Roadmap — FormFisik Personal 1.0

Referência: 01/11/2026. Estratégia: **desenvolvimento e consolidação por especialidade**. Concluir e homologar Personal 1.0 antes de implementar outra modalidade, salvo autorização estratégica expressa. Este planejamento não autoriza implementação, ativação externa, migration ou deploy.

[Inventário real](../produto/inventario-funcional.md) · [Definição e aceite](../produto/personal-1.0.md) · [Arquitetura](../arquitetura/visao-atual-e-evolucao.md) · [Modelo comercial](../estrategia/modelo-de-negocio.md)

## Marcos vigentes e dependências

A numeração organiza o planejamento, não representa migrations ou autorização de execução. Dependências abaixo são pré-condições funcionais; atividades de pesquisa podem antecedê-las. Futuras entregas devem aplicar a política de até três entregas principais por funcionalidade quando o tamanho justificar, sem confundir isso com o número total de marcos.

| Marco / estado | Escopo consolidado | Dependências e critério de saída |
| --- | --- | --- |
| 015 — Segurança e LGPD — CONCLUÍDO LOCALMENTE; produção BLOQUEADO | Autenticação/sessões, autorização/isolamento, APIs/requisições, segredos/frontend, dependências, arquivos, dados sensíveis, logs, retenção, direitos e proteção de dados | Base001–014; fechamento015 com210 testes e navegador real registrado. NO-GO original preservado; bloqueadores tratados separadamente na016 |
| 016 — Estabilização e integrações — CONCLUÍDO LOCALMENTE; externa NÃO HOMOLOGADA/produção BLOQUEADA | Inventariar estado aplicado das migrations, Stripe já preparado, R2 privado, SMTP/configurações, testes integrados e homologação do núcleo | 015 e autorização de ambiente/operação. Evidenciar migrations revisadas, fluxos externos, cleanup, restore, grants e indisponibilidade; sem ativação automática |
| 017 — Anamnese digital — CONCLUÍDO LOCALMENTE; produção BLOQUEADA | Formulários personalizáveis, modelos, questionários versionados, envio, respostas, histórico, revisão e autorizações específicas | Identidade/carteira e base segura 015–016; 017 autoriza formulário web público por capacidade individual sem conta; ativação/mobile029 e homologação final permanecem separados |
| 018 — CRM e Kanban — IMPLEMENTADO LOCALMENTE | Etapas personalizáveis, ciclo de atendimento, tarefas, pendências, prazos, filtros, histórico, condições de movimentação e indicadores | Carteira 008 + 015–016; transições validadas no servidor e histórico auditável |
| 019 — Consultorias e serviços — IMPLEMENTADO LOCALMENTE | Serviços, pacotes, planos comerciais, contratos, períodos, entregas previstas/concluídas, renovações e cancelamentos | Carteira e ciclo 018; contrato e serviço identificáveis para financeiro/agenda, sem confundir assinatura SaaS |
| 020 — Financeiro profissional — IMPLEMENTADO LOCALMENTE / EXTERNA BLOQUEADA | Stripe Connect preferencial, avulso/recorrente, externo, inadimplência, renovações, liquidação/repasse/conciliação, estornos/disputas e dashboard | 019 + validação Connect Brasil/modelo financeiro + decisão de taxas e responsabilidades. Webhooks, idempotência e auditoria próprios; SaaS separado |
| 021 — Agenda — IMPLEMENTADO LOCALMENTE | Disponibilidade, agendamentos, atendimentos, reagendamento, cancelamento, compromissos e histórico | Identidade/carteira e serviços 019; conflitos/limites e vínculo autorizados |
| 022 — Feedback e acompanhamento — IMPLEMENTADO / GO local controlado | Check-ins, feedbacks, histórico, convites individuais, adesão declarada e pendências por prazo | Motor017 reutilizado; canais externos024 e identidade029 permanecem futuros |
| 023 — Biblioteca de demonstrações — IMPLEMENTADO LOCALMENTE; Stream externo PREPARADO | Vídeos demonstrativos/próprios, arquivos privados, vínculo aos exercícios, permissões, armazenamento, direitos de uso, processamento e limites | Catálogo 009 e arquivos privados homologados 016; avaliar tecnologia/licenças sem presumir que storage de fotos resolva vídeos |
| 024 — Comunicação — IMPLEMENTADO / GO local controlado | Central profissional, modelos, histórico, contatos declarados, contextos, avisos internos e pendências CRM | Canais externos/preferências/identidade bidirecional029 permanecem futuros, sem envio real |
| 025 — Inteligência comercial — IMPLEMENTADO / GO local controlado | Carteira, contratos, financeiro, agenda e check-ins por período; retenção/conversão não inferidas | Contagens existentes 007–010; ampliar com fatos 018–022 e financeiro 020, indicadores reconciliáveis e consultas limitadas por período |
| 026 — Importação — IMPLEMENTADO / GO local controlado | Alunos/exercícios CSV e modelos JSON nativo, prévia/mapeamento, duplicidades, lotes, histórico e segurança | Carteira 008 + regras 015–016; evitar vínculos automáticos e vazamento entre profissionais |
| 027 — Equipes — NÃO IMPLEMENTADO | Membros, perfis, permissões, carteiras, responsabilidades e auditoria | Evolução de identidade/organização com plano próprio; não bloquear lançamento individual se dispensável |
| 028 — Produtos digitais — NÃO IMPLEMENTADO | Comercialização possível de modelos, planilhas, cursos e conteúdo próprio | Validação comercial prévia, direitos de conteúdo, serviços/pagamentos 019–020; expansão dispensável ao núcleo individual |
| 029 — FormFisik Connect — NÃO IMPLEMENTADO | App do aluno: ativação, login, home, treinos/execução, séries/cargas, histórico, evolução, questionários, feedbacks, comunicação e notificações | Identidade/vínculo legítimo + contratos 010/012/017/022/024 e base 015–016. Preferência React Native/Expo sujeita a confirmação; reutilizar backend sem duplicar regras críticas |
| 030 — Homologação Personal 1.0 — NÃO IMPLEMENTADO | Integração, segurança, privacidade, acessibilidade, desempenho, fluxos reais, web/mobile, piloto, correções e documentação | Matriz de 16 capacidades e gates de [aceite](../produto/personal-1.0.md); GO/NO-GO documentado, sem aprovação automática por testes unitários |

017–024 podem definir contratos para o aluno antes do mobile; isso não autoriza criar antecipadamente portal ou canal externo. O 029 integra respostas, execução e comunicação ponta a ponta. O 030 exige o resultado completo; 027/028 podem ficar fora do lançamento individual mediante registro de escopo. A estabilização e os controles de segurança continuam recorrentes após 016.

## Histórico preservado das entregas 001–015

As seções abaixo registram a evolução local e decisões anteriores. Expressões como “a próxima entrega” ou “sem fotos” devem ser lidas na data/escopo de cada entrega; para estado atual prevalecem a tabela acima e o inventário. Nenhum resultado local significa produção homologada. As menções antigas à exportação futura foram superadas pelas 011/014, sem apagar o histórico.


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

## Entrega 014 — relatórios e shell

Implementados localmente relatórios físicos Compacto/Premium e shell com sidebar integral/main independente. Operação futura: revisar/aplicar migration014 somente com autorização, agendar limpeza e configurar R2 pelo proprietário; nenhuma dessas ações executada nesta entrega. Prioridade futura: validar teclado virtual em aparelhos físicos e navegadores além do Chrome; avaliar worker para PDFs muito grandes se uso real justificar. Manter limites/paginação antes de ampliar volume. Não refazer módulos funcionais: ajustes desta entrega limitados a shell, estado/navegação e integração dos relatórios. Nenhum novo preço/plano/mobile/portal.

## Diagnóstico de segurança — 015

Prioridade antes de dados reais: atendimento integral de eliminação/portabilidade com dependências históricas; política aprovada de retenção; responsáveis/canal jurídico; grants runtime/migrador, backup/restore, agendas de cleanup e monitoramento; homologação Stripe/R2/SMTP e domínio HTTPS. Não há GO por testes locais aprovados. Refinamentos seguros nesta auditoria: projeções mínimas, detalhes sob demanda, cancelamento de leituras obsoletas e monitor sem contagens redundantes. Mudanças profundas de telas permanecem sujeitas a diagnóstico e proposta próprios.

## Execução016 — estabilização local

Autorizada somente execução local: migrations001–016 em PostgreSQL descartável, fila de eliminação por escopo aprovado, bloqueios de retenção/terceiros, replay autenticado após restore, grants mínimos e diagnóstico. Sem aplicação no banco existente, integrações externas, deploy ou marcos017–030. [Relatório016](../engenharia/entrega-016.md) e [rastreabilidade](../engenharia/016/rastreabilidade.md) registram resultados e pendências; NO-GO de produção015 permanece.

## Execução017 — cadastro inteligente e anamneses

[Relatório017](../engenharia/entrega-017.md): escopo web local explícito autoriza canal público por convite, construtor, versões, respostas e revisão, preservando restrições015/016. Não implementa portal/login do aluno, CRM018, Connect ou mobile029. Reutilizar eventos mínimos e contratos quando esses marcos forem autorizados. Antes de produção: homologação jurídica/operacional, canal de direitos/retentiva e integrações; NO-GO preservado.

## Execução018 — CRM profissional

[Relatório018](../engenharia/entrega-018.md): implementação web local de quadro/tarefas/histórico, integração canônica e persistência018. Estado IMPLEMENTADO LOCALMENTE, sem migração persistente/deploy/commit. Não conclui Personal1.0 nem levanta NO-GO015–017. Marco019 deverá especificar serviços/consultorias/contratos antes de implementação;020 financeiro profissional separado do SaaS, sem presumir Stripe Connect disponível. Próxima prioridade operacional alta: política de retenção de eventos/chaves, observabilidade e homologação já bloqueadas; UX média: aparelhos físicos/leitores de tela e maior volume medido antes de virtualização. Nenhum redesenho profundo de008/010/012 foi autorizado ou realizado.

## Execução019 — serviços e consultorias administrativas

[Relatório019](../engenharia/entrega-019.md): catálogo, planos versionados, contratações/snapshots, vigência/transições/renovação, entregas/execuções com evidência explícita, CRM, indicadores não financeiros e controles de eliminação/restore. Nenhuma integração020, pagamento, assinatura jurídica, modalidade ou deploy. Personal1.0 e produção não são homologadas. Próxima prioridade020: validar Connect Brasil, modelo/recebedor/taxas e responsabilidade, finalidade/retentiva financeira, webhooks/reconciliação e autorização antes de implementar. Prioridade operacional alta015 permanece; UX média: testar leitores de tela/aparelhos físicos e ampliar carga antes de alterar paginação ou extrair serviços.

## Execução020 — financeiro profissional local/controlado

[Relatório020](../engenharia/entrega-020.md): obrigações explícitas por contratação019, pagamentos externos/correções, gateway normalizado controlado, webhooks assinados, conciliação e dashboard. Direct Charges/Accounts v2 recomendados sob condição; transporte externo não implementado/ativado até decisões Brasil/risco/custos e autorização. Prioridade alta: homologação financeira externa, retenção e controles015, sem antecipar021. Não suspender treinos ou cancelar019 por falha financeira.

## Marco021 — Agenda profissional (implementação local)

021-A disponibilidade/reservas; 021-B recorrência/presença/indicadores; 021-C integração e validação integral pertencem a uma entrega. [Relatório021](../engenharia/entrega-021.md) registra resultado verificável e limitações. Próximas integrações Google/iCloud/Outlook continuam NÃO IMPLEMENTADAS, com [contrato futuro](../operacao/calendarios-externos.md); não autorizam execução. Não iniciar outras modalidades antes da homologação Personal1.0.

## Execução023 — biblioteca de demonstrações

Marco023 reúne023-A/B/C em execução funcional única: associaçõesYouTube, uploadsStream/controlados, publicação oficial e versões na prescrição. Reutiliza009/010/011/015/016, preserva019–021. Migration022 segue sequência real. Consultar [relatório023](../engenharia/entrega-023.md) para resultados finais; existência de código não atestaStream externo. Próximas prioridades: homologação de provedor/custos/direitos, rotina de reconciliação de reservas incertas e dispositivos/leitores de tela reais. Não anteciparConnect029.

## Marco022 — Check-ins e feedbacks

IMPLEMENTADO — GO local controlado em02/11/2026.022-A/B/C como uma entrega: motor017/ciclos/convites, feedback/revisão, integração/estabilização. [Relatório](../engenharia/entrega-022.md), [módulo](../modulos/checkins.md). Futuros lembretes/canais externos reservados ao024, identidade/app ao029; sem antecipar modalidades. NumeraçãoSQL023 segue022 do Marco023. NO-GO produtivo preservado.

## Marco024 — Central profissional

Implementação funcional única verificada em02/11/2026, GO local controlado. [Relatório](../engenharia/entrega-024.md), [módulo](../modulos/comunicacao.md), [ADR-025](../arquitetura/ADR-025-central-comunicacao.md). Reutiliza008/018/019/021/022/016 e sessões; não antecipa identidade029, anexos ou canais externos. SMTP de conta não é comunicação profissional; retenção/infraestrutura/provedores e produção continuam gates próprios.

## Marco025 — indicadores canônicos

GO local controlado em02/11/2026: comparação de períodos, carteira, CRM/consultorias, financeiro separado por origem, agenda, check-ins, gráfico/tabelas acessíveis e consultas agregadas privadas. [Relatório025](../engenharia/entrega-025.md) e [semântica](../modulos/inteligencia-de-negocio.md). Sem retenção histórica ou conversão inventada; exportação empresarial futura exige contrato próprio. Prioridades operacionais: carga representativa/p95, leitores de tela/aparelhos físicos e gates015/030; nenhum GO produtivo. Importação026 permanece separada e condicionada ao checkpoint025.

## Marco026 — migração administrativa

GO local controlado em03/11/2026, após checkpoint estável025. [Relatório026](../engenharia/entrega-026.md): alunos/exercícios CSV e modelos JSON nativo, prévia/mapeamento/duplicidades, confirmação, lotes25/retry/pausa/cancelamento, histórico20, retenção/eliminação e restore. Sem merge, ativação de modelos ou adapter de concorrente. Prioridades operacionais: scheduler/monitoramento de limpeza e política de histórico, carga representativa e gates015/030; nenhuma implantação ou homologação produtiva. Amostras reais/autorização antes de adapters específicos.

### Refinamento autorizado da agenda — 05/11/2026

Arraste de ocorrência na grade diária/semanal, ghost junto ao cursor, marcador de destino, navegação entre períodos, hover dos controles e detalhes/edição em modal. Reutiliza regras e APIs da 021, com justificativa e confirmação antes de gravar, sem migration ou serviço novo. Estado/evidências locais: [relatório de refinamento](../engenharia/refinamento-agenda-2026-11.md), `test-results/local/agenda-move/verification.json`. Não altera o estado de homologação produtiva ou de integrações externas.

### Biblioteca de vídeos — refinamento de novembro/2026

IMPLEMENTADO local: redesign em grade/lista, painéis, indicadores/filtros reais, novo teto120s e exercício obrigatório na reserva. Reutiliza023 sem outra entidade/serviço. PREPARADO/BLOQUEADO: upload real e thumbnails privadas dependem de Stream homologado; inspeção independente do MIME/contêiner original exige etapa técnica antes de GO integral. Acesso do aluno permanece escopo Connect, sem autorização baseada apenas em UUID. Ver [relatório e limites](../engenharia/refinamento-videos-2026-11.md). Não substitui NO-GO015 nem autoriza serviço/deploy.

### Refinamento Consultorias — 05/11/2026

Central de serviços/consultorias com visão geral, indicadores reais, navegação em cinco áreas, tabela responsiva e painel rápido de serviços. Reutiliza integralmente o domínio019 e as fronteiras020/021/022. Sem nova integração financeira ou migration. Ver [relatório/evidências](../engenharia/refinamento-consultorias-2026-11.md). Melhorias futuras exigem escopo próprio: estados específicos de revisão por tipo de obrigação, filtro dedicado de pendências de renovação e reuso estrutural de drawers entre domínios; não presumir esses recursos como implementados. NO-GO de produção015 preservado.

Complemento visual de Consultorias: quatro abas internas e editores refinados, Visão geral preservada. GO local controlado com regressão019/Chrome/Axe nos dois temas; sem mudanças de domínio, API ou persistência. Evidências no relatório de refinamento de novembro/2026; produção mantém NO-GO vigente.

### Central de Check-ins — novembro/2026

Redesign operacional com seleção/resposta na mesma página, filtros SQL, métricas reais e reuso integral do domínio022/renderer017. Registro de devolutiva e preparação manual de lembrete são distintos de entrega ao aluno. Futuro sujeito a escopo próprio: lote multi-aluno, preferências/transporte/tentativas de notificação, horário configurável e acesso autorizado às devolutivas no Connect. Não há autorização implícita de provider, migration persistente ou envio. [Relatório](../engenharia/refinamento-checkins-2026-11.md).

### Refinamento financeiro — 06/11/2026 (GO local controlado)

Auditoria encontrou domínio020 já capaz de cobranças externas, parciais, correções e invalidações sem Connect. Prioridade desta execução: apresentação premium, dashboard por origem, recebimentos paginados, exportação filtrada e primeiro vencimento explícito dentro da vigência. Reutilizar operações/ledger020 e planos019; não criar nova contabilidade ou fonte comercial. Gateway real continua bloqueado. Diretriz definitiva: processamento opcional, externo sem comissão FormFisik, ausência de bloqueio automático do aluno por inadimplência. Sem migration/deploy.

Validação do refinamento financeiro:30 testes PostgreSQL, Chrome/Axe nos dois temas, TypeScript, ESLint e build real aprovados. [Relatório e limitações](../engenharia/refinamento-financeiro-2026-11.md). Produção/integração real permanecem não homologadas.

### CRM & Operação — redesign autorizado de novembro/2026

GO local controlado. Diagnóstico:018 já concentra regras, tarefas e integrações; cards extensos e ausência de rotina/contexto justificam refinamento prioritário. Implementação validada localmente reutiliza018/021, acrescenta tarefa geral/Aguardando/vínculo explícito via026, sem equipe, scheduler ou nova fonte clínica/financeira. [Relatório](../engenharia/redesign-crm-2026-11.md). Aplicação persistente da migration e deploy não autorizados; NO-GO015 preservado. Validação:102 testes integrados, Chrome/Axe nos dois temas, texto200%, build HTTPS e canários aprovados. Prioridade operacional: revisão/autorização da026 e gates015; equipes e dispositivos físicos continuam fora da homologação local.

### Comunicação — refinamento de novembro/2026

IMPLEMENTADO local controlado: central visual, contatos, preparados, modelos duplicáveis, histórico mínimo e integração CRM preservada; [relatório](../engenharia/redesign-comunicacao-2026-11.md). Chat PREPARADO somente UI/documentação. Envio profissional, agendamento, automações externas e preferências de destinatário BLOQUEADOS por canal não homologado; não reutilizar SMTP de conta. Próxima entrega depende de autorização e validação de identidade/canal/retention/outbox. Sem backend de chat ou mobile.

### Central de Configurações — novembro/2026

Frontend e navegação implementados localmente: relatório em docs/engenharia/central-configuracoes-2026-11.md. Perfil e avatar são prévias locais, sem publicação/upload definitivo; preferências, encerramento/exclusão e dispositivos aguardam entregas específicas. Conta/assinatura/importação canônicas preservadas. Sem nova regra financeira ou migration.

### Central de Tutoriais — novembro/2026

Central escrita com16 artigos/16 categorias, busca local e links diretos implementada. Sem vídeos, CMS ou serviços externos. Favoritos, utilidade, métricas de acesso e busca global são possibilidades futuras sem autorização de implementação. Manutenção editorial acompanha cada módulo. Ver docs/engenharia/central-tutoriais-2026-11.md.

## Configurações funcionais027 — novembro2026

Implementar a persistência e segurança da central existente, sem reconstruir billing/importações. Cadastro privado, perfil/CREF declarado/focos, foto, preferências reais, senha/sessões, e-mail confirmado, projeção pública voluntária e protocolos de privacidade. [Escopo, pesquisa e operação](../modulos/configuracoes.md). Migrations026/027 aplicadas no banco local com autorização explícita; validação controlada não homologa produção. Revisão jurídica, política de retenção, rotação/backup de chave, verificação de CREF e operação humana de direitos continuam pendentes. Não ampliar para modalidades além de Personal1.0.

## Feedback e confirmações compartilhadas — novembro2026

Diagnóstico: confirmações nativas e mensagens técnicas inconsistentes entre módulos. Escopo autorizado: toast global de5s, linguagem amigável, dialogs próprios e preservação das confirmações de negócio. Reutilizar shell/tokens e validações existentes, sem refazer fluxos de domínio. Guard de saída interna é personalizado; recarregar/fechar aba não tem modal customizável e não utiliza beforeunload. [Arquitetura/evidências](../engenharia/feedback-e-confirmacoes-2026-11.md). Não altera homologação/NO-GO015.

### Identidade performance/lifestyle e landing — 2026-11-06

IMPLEMENTADO local: landing completa com hero sem foto, logo oficial preservada, acentos magenta compartilhados, navegação real, plano Pro canônico e Wear/Studio explicitamente futuros. Diagnóstico: landing anterior com destinos incompletos; solução restrita à apresentação e identidade, sem refazer fluxos funcionais. Evidências e limites: `docs/engenharia/redesign-landing-2026-11.md`. Revisão posterior IMPLEMENTADA localmente: composição fiel à referência, hero corrigida via image_gen, produtos/Studio/manifesto da referência e footer recriado sem UI embutida. Registro de assets e prompts em `docs/design/landing-assets-2026-11.md`. Isso não autoriza loja, reservas ou novas modalidades.

### Website público — evolução de navegação e conteúdo

Diagnóstico autorizado: composição dependente de recortes da referência, textos pequenos e poucas interações de exploração. Prioridade desta entrega: refinar o website público existente, com navegação clara, prévia HTML navegável do sistema, categorias Wear, apresentação Studio, oferta Pro e dúvidas frequentes. Fotos serão fornecidas depois; não gerar novos assets. Reutilizar rotas de acesso/cadastro/assinatura e catálogo comercial. Sem checkout Wear, reservas Studio, coleta de leads ou nova modalidade. Relatório em `docs/engenharia/website-publico-2026-11.md`.


Refinamento autorizado durante a entrega: logos oficiais sem recoloração; verde operacional restaurado após diagnóstico de magenta nos tokens globais/sidebar; cores de campanha isoladas. Imagens específicas de hero, Alunos/Treinos/Agenda e Oversized recebidas e integradas. Não gerar fotografias adicionais. Continuidade local, sem deploy ou mudança de regras comerciais.


07/11/2026 — evolução SaaS autorizada: três planos/seis preços em sandbox, backend e limites ativos implementados/testados. Homologação hospedada bloqueada por segredo de webhook/Portal; upgrade/downgrade, IA e comissionamento permanecem futuros. [Evidências](../engenharia/assinaturas-multiplanos-2026-11.md).

### Refinamento local — navegação e Exercícios (novembro/2026)

IMPLEMENTADO: boundaries por módulo, navegação pendente e remoção da reconciliação Stripe redundante na navegação com snapshot canônico recente, preservando a validade de cinco minutos já existente. Refinamento delimitado de criação particular, contribuição oficial e acompanhamento de solicitações, sem refazer o catálogo ou mudar contratos. Evidências e limitações em [navegação e Exercícios](../engenharia/navegacao-e-exercicios-2026-11.md). Benchmark de produção e homologação Personal 1.0 continuam pendentes; prioridade de desempenho antes do lançamento, sem alterar o NO-GO015.
