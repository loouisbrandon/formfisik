# Inventário funcional canônico

Data de referência: 01/11/2026. Auditoria estática do checkout, cruzando código, migrations, módulos, ADRs e relatórios 001–015. Não foram reexecutados testes de produto nem consultados ambientes externos. Os resultados dos relatórios são evidência histórica declarada, não aprovação renovada nesta tarefa. Nenhum módulo recebe HOMOLOGADO por esta consolidação.

## Estados

- **IMPLEMENTADO:** fluxo presente em código e persistência aplicável; não significa disponível em produção.
- **PARCIAL:** parte do resultado existe, com lacunas explícitas.
- **PREPARADO:** integração/estrutura existe, mas configuração ou validação externa necessária está pendente.
- **NÃO IMPLEMENTADO:** não foi localizada implementação funcional correspondente no escopo inspecionado.
- **EM AUDITORIA:** revisão em andamento, sem fechamento comprovado.
- **BLOQUEADO:** condição impede liberação/uso declarado.
- **HOMOLOGADO:** exige aceite registrado no ambiente alvo, escopo, responsável e evidências; não atribuído aqui.

Estado funcional, estado de integração e prontidão operacional são eixos distintos. Todas as implementações abaixo são locais. Produção e coleta de dados reais: **BLOQUEADO / NO-GO**, conforme 015.

## Módulos existentes

Caminhos de evidência abaixo são relativos à raiz; a [arquitetura](../arquitetura/visao-atual-e-evolucao.md) explica as fronteiras comuns. Cada linha identifica finalidade/valor, dependências, limitações e reutilização.

| Módulo / entregas / estado real | Finalidade e valor | Evidências no código e documentação | Dependências, limitações e pendências | Reutilização |
| --- | --- | --- | --- | --- |
| Identidade e acesso — 001–003 — IMPLEMENTADO; alterações015 implementadas/verificadas localmente | Cadastro confirmado, login, logout, recuperação e revogação segura | `src/server/{registration,auth,sessions,password-recovery}.ts`; migrations 001–003; [cadastro](../modulos/cadastro-profissional.md), [autenticação](../modulos/autenticacao.md), [recuperação](../modulos/recuperacao-senha.md) | PostgreSQL/SMTP; entrega pública de e-mail e infraestrutura pendentes; role único, sem portal de aluno, MFA ou identidade multipapel. Suspensão local 015 não equivale a eliminação | Conta e sessão como núcleo, sem duplicar credenciais por modalidade |
| Billing SaaS — 004–006/006.5 — IMPLEMENTADO local; integração externa PREPARADO | Oferta Pro, trial, gestão, Portal, faturas e cancelamento | `src/modules/subscriptions/plan.ts`, `src/server/subscriptions/`, `src/app/api/stripe/webhook/route.ts`; migrations 004–005; [assinaturas](../modulos/assinaturas.md) | Stripe test-only/local, chaves/Checkout/Portal/webhook e homologação real pendentes; sem nova contratação após encerramento nesta UI; sem Connect | Infraestrutura de integração como referência; fatos financeiros SaaS separados do profissional |
| Área profissional — 007 — IMPLEMENTADO | Acesso central à operação, onboarding e indicadores persistidos | `src/server/professional-dashboard.ts`, `src/modules/professional/{shell,navigation-memory}.tsx`; [dashboard](../modulos/dashboard-profissional.md), [014](../engenharia/entrega-014.md) | Identidade e entitlement; indicadores não são inteligência comercial completa; testes físicos/outros navegadores pendentes | Shell, navegação e estados, respeitando viewport e scroll independente |
| Carteira de alunos — 008 — IMPLEMENTADO | Cadastro, filtros, páginas SQL, edição, arquivo/reativação, histórico e PDFs administrativos | `src/server/students/{handlers,repository,pdf}.ts`; migrations 006–007; [alunos](../modulos/alunos.md) | Sessão/assinatura/propriedade; cadastro privado por profissional não cria conta global; importação026 em módulo próprio; CRM018 separado implementado localmente; eliminação016 delimitada | Vínculo privado e seletor, sem união automática por e-mail |
| Biblioteca de exercícios — 009 — IMPLEMENTADO | Catálogo, busca, filtros, particulares, solicitações e moderação | `src/server/exercises/{handlers,repository}.ts`; migration 008; [exercícios](../modulos/exercicios.md), [catálogo](../catalogo/exercicios.md) | Importação local, revisão técnica profissional e provisionamento autorizado de moderador; sem vídeos/mídia importada | Seleção e versões canônicas; conteúdo específico de musculação |
| Prescrição e modelos — 010 — IMPLEMENTADO | Fichas, divisões, séries, técnicas, versões e cópias de modelos para alunos | `src/server/workouts/{handlers,repository}.ts`, `src/modules/workouts/`; migrations 009–010; [treinos](../modulos/treinos.md), [modelos](../modulos/modelos-de-treinamento.md) | Carteira/catálogo/entitlement; sem execução pelo aluno ou registro de séries realizadas. Editor grande merece avaliação específica, sem redesenho nesta tarefa | Editor compartilhado, histórico e cópias independentes; regra de musculação permanece especializada |
| Documentos de treino — 011/011.5 — IMPLEMENTADO | PDFs Compacto/Premium, prévia/download privados e apresentação com logo | `src/server/workout-documents/`, `src/server/documents/`, `src/modules/workout-documents/`; migration 011; [exportação](../modulos/exportacao-treinos.md) | Prescrição versionada e autorização; artefatos temporários, sem envio automático; cleanup operacional a agendar | Composição, artefatos, apresentação e viewer usados pela 014 |
| Avaliações e evolução — 012 — IMPLEMENTADO | Peso, medidas, avaliações parciais/versionadas, gráficos e comparação | `src/server/assessments/{handlers,repository}.ts`, `src/modules/assessments/series.ts`, `chart.tsx` e `comparison.tsx`; migration 012; [acompanhamento](../modulos/acompanhamento.md) | Carteira e autorização; sem diagnóstico ou IA; períodos/volume limitados; retenção/expurgo integral pendentes | Datas, precisão, séries e comparação reutilizadas nos relatórios; finalidade de saúde exige revisão própria |
| Fotos privadas e calendário — 013 — IMPLEMENTADO local; R2 PREPARADO | Histórico visual, autorização específica, calendário, comparação e remoção | `src/server/progress-photos/{handlers,repository,image,storage}.ts`, `src/modules/progress-photos/`; migration 013; [fluxo](../modulos/acompanhamento.md), [API](../engenharia/api-fotografias.md), [R2](../operacao/fotografias-r2.md) | R2 privado e limpeza/restore/retenção a homologar; sem configuração upload indisponível; store controlado é só teste; PDF com foto pertence à 014 | Arquivos privados e revogação como referência, sem tornar imagem pública ou presumir autorização de exportação |
| Relatórios físicos — 014 — IMPLEMENTADO local | PDF Compacto/Premium com evolução, gráficos, comparação e fotos opcionais autorizadas | `src/server/physical-reports/{handlers,repository,pdf}.ts`, `src/modules/physical-reports/`, rota de exportação; migration 014; [relatórios](../modulos/relatorios-fisicos.md) | Avaliações/documentos; R2 só para fotos; autorização adicional; 500 avaliações/12 fotos/120 páginas/8 MiB; aplicação de migration no ambiente alvo e cleanup pendentes | Usa composição/artefatos/precisão/autorizações existentes; não cria segundo cadastro |
| Segurança e privacidade transversal — 015 — IMPLEMENTADO/verificado localmente; PARCIAL operacional | Suspensão, CSP, minimização e controles para reduzir exposição | `src/server/account-security.ts`, `src/proxy.ts`, guards/DTOs, migration 015 e `tests/security*.ts`; [relatório final](../engenharia/entrega-015.md), [controles](../seguranca/controles-e-operacao.md) | Fechamento local015 comprovado por210 testes e navegador de produção. FF015-11 continua bloqueando produção;016 acrescenta mecanismos delimitados de eliminação/restore/grants locais, sem homologação externa ou conclusão jurídica | Requisitos permanentes de todos os módulos, sem certificação automática LGPD/OWASP |

## Funcionalidades futuras e partes que não devem ser confundidas

| Resultado pretendido | Estado nesta auditoria | Marco |
| --- | --- | --- |
| Homologação externa e operação integrada do núcleo | PREPARADO/PARCIAL; BLOQUEADO para produção | 015–016 |
| Anamnese com questionários versionados e respostas | IMPLEMENTADO E VERIFICADO LOCALMENTE na 017; convites web sem conta, construtor e revisão. Sem homologação produtiva | 017 |
| CRM/Kanban e tarefas | IMPLEMENTADO LOCALMENTE: etapas/regras/movimentos, tarefas, histórico e fatos canônicos. Não homologado em produção | 018 |
| Consultorias, serviços e acordos administrativos | IMPLEMENTADO LOCALMENTE na019: catálogo/planos, vigência, execução, renovação e cancelamento. Sem assinatura jurídica ou pagamento | 019 |
| Financeiro profissional/Connect e recebimentos externos | IMPLEMENTADO LOCALMENTE/controlado; transporte Stripe externo NÃO IMPLEMENTADO/BLOQUEADO; Billing SaaS separado | 020 |
| Agenda, disponibilidade e atendimentos | IMPLEMENTADO E VERIFICADO LOCALMENTE021, GO controlado; calendário de evolução013 permanece separado | [021](../engenharia/entrega-021.md) |
| Check-ins, feedbacks e adesão | IMPLEMENTADO — GO local controlado: motor017, ciclos, convites, revisão e indicadores declarados; sem execução comprovada | [022](../engenharia/entrega-022.md) |
| Biblioteca de demonstrações | IMPLEMENTADO LOCALMENTE; YouTube e associação versionada, Stream validado com provedor controlado; externo/produção não homologados | 023 |
| Comunicação profissional | Central profissional IMPLEMENTADA / GO local controlado; modelos, contatos declarados, contexto, avisos internos e pendênciasCRM. Bidirecional/canais externos NÃO IMPLEMENTADOS | [024](../engenharia/entrega-024.md) |
| Inteligência comercial | IMPLEMENTADO / GO local controlado: área agregada com comparação, financeiro/agenda/check-ins; conversão e retenção não inferidas, produção NO-GO | [025](../engenharia/entrega-025.md) |
| Importação profissional | IMPLEMENTADO / GO local controlado: alunos/exercícios CSV e modelos JSON nativo, prévia/confirmar/lotes/histórico; sem merge, ativação ou adapters externos | [026](../engenharia/entrega-026.md) |
| Equipes/organizações | NÃO IMPLEMENTADO; moderador de catálogo não é equipe | 027 |
| Produtos digitais | NÃO IMPLEMENTADO; modelos privados não são comercialização | 028 |
| FormFisik Connect, acesso do aluno e execução | NÃO IMPLEMENTADO; role student previsto não é fluxo de ativação/mobile | 029 |
| Personal 1.0 completa e homologada | NÃO IMPLEMENTADO como resultado integrado | 030 |

O [roadmap](../planejamento/roadmap.md) define dependências e o [aceite Personal 1.0](personal-1.0.md) define o resultado. Inspeção documental não substitui testes integrados, homologação técnica/profissional ou aprovação operacional.

## Complemento de estabilização016

[Relatório016](../engenharia/entrega-016.md): schema-readiness completo, migrador com histórico-prefixo/checksum, template de grants runtime, diagnóstico de contagens, eliminação operacional delimitada e ledger autenticado para restore. Não é funcionalidade de aluno/Connect/anamnese. Estado e resultados novos constam no relatório016; testes históricos acima não foram reclassificados como homologação externa.

## Entrega017 — validação local

[Anamneses](../modulos/anamneses.md) acrescenta convites, formulários personalizados/versionados, modelo padrão e revisão. Cadastro manual permanece; público não cria conta global. [Relatório017](../engenharia/entrega-017.md) registra o estado efetivo, testes e limitações; semGO automático da Personal1.0.

## Entrega018 — CRM operacional

[CRM](../modulos/crm.md), [API](../engenharia/api-crm.md), [relatório018](../engenharia/entrega-018.md): Kanban por vínculo privado, etapas personalizáveis, condições todas/qualquer com quatro efeitos, movimentos com prévia/versão/idempotência, tarefas e geração explícita por regras100/lote, filtros/contagens/paginação SQL e histórico. Migration018; reutiliza008/017/010/012/016. Sem contratos019, financeiro020, automação de mensagens ou Connect. IMPLEMENTADO LOCALMENTE, produção BLOQUEADA; evidências não equivalem a homologação.

## Entrega019 — serviços e consultorias

[Regras](../modulos/servicos-e-consultorias.md), [API](../engenharia/api-consultorias.md), [relatório019](../engenharia/entrega-019.md): oferta e plano versionado separados do acordo individual, obrigações/execuções e referências canônicas autorizadas010/012/017. Integra CRM018 sem alterar regras configuradas. FKs, snapshots, concorrência/idempotência, paginação/indicadores e expurgo/replay016. Estado IMPLEMENTADO LOCALMENTE, produção BLOQUEADA;020 apenas contrato de leitura preparado, nenhum financeiro/Connect/assinatura eletrônica/mobile. Não conclui Personal1.0.

## Financeiro profissional020 — estado atual

IMPLEMENTADO localmente: configurações vinculadas019, obrigações/ciclos/valores, recebimentos externos/correções, dashboard, histórico, intenções e retenção. VALIDADO COM PROVEDOR CONTROLADO: contas/onboarding/checkout/recorrência, reembolso/disputa, eventos assinados e conciliação/repasse. PREPARADO: contratos independentes de Connect; NÃO IMPLEMENTADO/HOMOLOGADO: transporte Accounts v2/Stripe em rede e ativação externa. Operação e produção BLOQUEADAS. [Evidências e limites](../engenharia/entrega-020.md). Não substituir estes estados por alegação genérica de integração Stripe pronta.

## Marco021 — Agenda profissional

IMPLEMENTADO E VERIFICADO LOCALMENTE, GO controlado: disponibilidade/exceções, tipos, sessões e bloqueios, recorrência limitada, presença auditada, indicadores, aluno/CRM e cumprimento019 explícito. Migration021 e `/api/agenda`; [módulo](../modulos/agenda-profissional.md) e [evidências](../engenharia/entrega-021.md). Calendários externos somente PREPARADOS documentalmente. Produção NÃO HOMOLOGADA; NO-GO015 e bloqueio Connect020 preservados.

## Demonstrações023 — atualização do inventário

Biblioteca de vídeos por escopo, linksYouTube validados, upload privado, associação ao exercício canônico, múltiplas demonstrações/ordem/principal, preferências privadas sobre oficiais, revisão/publicação e referências imutáveis em treinos. Evidências: src/server/media/, src/modules/media/, migration022 e integração no workouts/repository. Dependências009/010/015/016; contratos029 documentados sem implementar identidade aluno. StreamREST e reprodução assinada preparados; testes controlados não homologam rede/contaCloudflare. Limitações/estado final em [relatório023](../engenharia/entrega-023.md).

## Check-ins022

IMPLEMENTADO — GO local controlado (02/11/2026). [Módulo](../modulos/checkins.md), [API](../engenharia/api-checkins.md), [relatório](../engenharia/entrega-022.md). Sem confundir anamnese, prescrição, comparecimento, obrigação e pagamento. Canais externos/Connect permanecem futuros; não declara Personal1.0 homologada ou produção liberada.

## Comunicação024

Central IMPLEMENTADA, GO local controlado em02/11/2026. [Módulo](../modulos/comunicacao.md), [contratos](../engenharia/api-comunicacao.md), [relatório](../engenharia/entrega-024.md). Texto preparado não é enviado; contato manual não comprova entrega; leitura de aviso é do profissional. Canais externos e conversa autenticada do aluno permanecem futuros/condicionados029. Produção e Personal1.0 não homologadas.

## CRM & Operação — novembro/2026

IMPLEMENTADO — GO local controlado: central com indicadores canônicos, cards compactos, drawer por aluno, lista tabular, agenda diária e prioridades; modal e quadro próprio de tarefas, tarefas gerais/Aguardando/vínculo de compromisso em migration026. Responsável proprietário e regras018 preservados. Sem reatribuição para equipe, canais externos ou migration persistente. [Relatório, fórmulas e evidências](../engenharia/redesign-crm-2026-11.md). Não equivale a produção ou homologação Personal1.0.

## Configurações027 — novembro2026

IMPLEMENTADO em código e testes controlados: perfil profissional/focos/CREF declarado, dados privados, CPF cifrado, foto, preferências de avisos, senha/sessões, e-mail confirmado e atendimento de privacidade por protocolo. IMPLEMENTADO em ambiente controlado: publicação voluntária com projeção pública mínima, modalidade de visibilidade aprovada pelo fundador. Migrations026/027 aplicadas no banco local com aprovação explícita; smoke de Configurações/health200. Assinatura/importações reutilizadas. NÃO HOMOLOGADO: conformidade jurídica integral, validação de conselho, SMTP externo, retenção operacional, chave/backup e produção. Ver [Configurações](../modulos/configuracoes.md).

## Landing performance/lifestyle — revisão visual local

IMPLEMENTADO localmente: landing responsiva baseada na referência fornecida, hero com anatomia corrigida, seções de plataforma/Wear/Pro/Studio/manifesto, navegação real e condições canônicas de assinatura. Wear, Studio, aplicativo e comunidade permanecem conceitos/futuros conforme indicação da página; a arte não constitui funcionalidade entregue. Evidências: `docs/engenharia/redesign-landing-2026-11.md`; assets e prompts: `docs/design/landing-assets-2026-11.md`. Sem publicação ou homologação de produção.

## Papel de administrador — 08/11/2026

Role `admin`: IMPLEMENTADA no schema desde001 e confirmada localmente; definição como administrador geral/dono documentada em [Administração](../modulos/administracao.md). Conta administrativa, atribuição controlada, painel e permissões globais: NÃO IMPLEMENTADOS nesta etapa. Não equivale a superusuário operacional nem remove isolamento/autorização existentes.
