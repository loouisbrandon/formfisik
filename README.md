# FormFisik

## Entrega016 — Estabilização local

Migrations/readiness, eliminação operacional delimitada, ledger autenticado para restauração, grants mínimos e diagnóstico, com testes sintéticos. [Relatório016](docs/engenharia/entrega-016.md) distingue validações locais de Stripe/R2/SMTP externos pendentes. **NO-GO para produção e dados reais permanece.**

Ecossistema independente de esporte, saúde, performance e bem-estar. A primeira especialidade é a **FormFisik Personal 1.0**, ainda em consolidação. Consulte a [documentação oficial](docs/README.md), o [inventário auditado](docs/produto/inventario-funcional.md), a [arquitetura atual](docs/arquitetura/visao-atual-e-evolucao.md) e os [marcos 015–030](docs/planejamento/roadmap.md). Implementação local não equivale a produção homologada.

## Entrega 015 — Segurança e privacidade

Auditoria e correções de autenticação, suspensão de contas, CSP, isolamento, minimização de respostas e consistência entre abas. Inventário de tratamento, procedimentos operacionais e evidências estão no [relatório 015](docs/engenharia/entrega-015.md). **NO-GO para produção e dados reais** enquanto as pendências essenciais de eliminação, operação e homologação permanecerem abertas.

Empresa independente fundada por Brandon Louis, com atuação inicial digital por meio de uma plataforma fitness.

A documentação institucional e técnica deve seguir a [diretriz institucional](docs/institucional/diretriz-institucional.md), que registra a independência empresarial como decisão estratégica sem presumir formalização jurídica ou societária.

O desenvolvimento segue a [política de entregas completas](docs/engenharia/politica-de-desenvolvimento.md). As regras comerciais do plano FormFisik Pro estão no [modelo de negócio](docs/estrategia/modelo-de-negocio.md), com Checkout local de teste preparado; validação hospedada aguarda configuração.

## Cadastro profissional

Cadastro real com PostgreSQL, senha Argon2id e verificação por e-mail. Conta não concede sessão, assinatura ou trial. Login e sessões opacas estão implementados. O dashboard exige acesso comercial confirmado; os módulos disponíveis são descritos abaixo.

- [Módulo e API](docs/modulos/cadastro-profissional.md)
- [Decisão arquitetural](docs/arquitetura/ADR-001-cadastro-profissional.md)
- [Design System](docs/design/DESIGN_SYSTEM.md)
- [Configuração local e Railway](docs/operacao/ambientes.md)

Configurar `.env.local` a partir de `.env.example`, executar `npm ci`, `npm run db:migrate` e `npm run dev`. Não há sucesso simulado quando banco ou SMTP não estão configurados.

Relatório da implementação e inventário de arquivos: [Entrega 001](docs/engenharia/entrega-001.md).

## Login e sessões

Acesse `/login` com a conta de e-mail confirmado. Sessão validada no PostgreSQL, cookie HttpOnly, expiração por inatividade e absoluta, logout com revogação. `/dashboard` é o destino após login de profissionais e exige assinatura autorizada no servidor; sem assinatura encaminha à oferta. `/conta` e assinaturas permanecem acessíveis para consulta e regularização.

- [Autenticação, API e autorização](docs/modulos/autenticacao.md)
- [ADR de sessões](docs/arquitetura/ADR-002-sessoes-opacas.md)
- [Relatório da Entrega 002](docs/engenharia/entrega-002.md)

## Recuperação de senha

Em `/login`, use “Esqueci minha senha”. O link recebido expira em 30 minutos e só pode ser usado uma vez. A troca usa Argon2id, revoga todas as sessões anteriores e exige login com a nova senha.

- [Fluxo, API e segurança](docs/modulos/recuperacao-senha.md)
- [ADR de recuperação](docs/arquitetura/ADR-003-recuperacao-senha.md)
- [Relatório da Entrega 003](docs/engenharia/entrega-003.md)

## FormFisik Pro

Página autenticada `/assinatura`: plano único de R$ 139,90 mensais, 30 dias gratuitos com cartão obrigatório e cobrança automática salvo cancelamento anterior. Checkout Stripe local de teste implementado, com persistência, idempotência e confirmação por webhook/consulta ao provedor. Sem chaves configuradas, contratação permanece indisponível. Nenhum trial ou assinatura fictícios. Validação com cartões no Checkout hospedado aguarda configuração pelo responsável.

- [Requisitos e contratos do módulo](docs/modulos/assinaturas.md)
- [ADR comercial](docs/arquitetura/ADR-004-plano-pro.md)
- [Roadmap](docs/planejamento/roadmap.md)
- [Relatório da Entrega 004](docs/engenharia/entrega-004.md)

- [Configuração Stripe local](docs/operacao/stripe-local.md)
- [ADR Checkout](docs/arquitetura/ADR-005-stripe-checkout.md)
- [Relatório da Entrega 005](docs/engenharia/entrega-005.md)

## Gerenciamento da assinatura

`/assinatura/gerenciar` reúne plano, datas, pagamentos, acesso, cancelamento ao final do trial/período e Portal Stripe. Renovação e regularização são confirmadas por dados canônicos no servidor. Sem chaves/Portal configurados, ações ficam explicitamente indisponíveis. Homologação externa aguarda credenciais; não há bypass comercial, cobrança real ou deploy.

- [Módulo e contratos atuais](docs/modulos/assinaturas.md)
- [ADR do ciclo de assinatura](docs/arquitetura/ADR-006-ciclo-assinaturas.md)
- [Relatório da Entrega 006](docs/engenharia/entrega-006.md)

Aplicar migration 005 antes de usar esta versão. Operador local pode executar `npm run billing:reconcile` após configurar Stripe de teste; não há cron provisionado.

## Área profissional

Dashboard com identidade real, onboarding, shell compartilhado, menu responsivo e atividades vazias explícitas. As contagens atuais refletem módulos persistidos de alunos, treinos e acompanhamento; a 007 não os antecipou. [Documentação](docs/modulos/dashboard-profissional.md), [ADR-007](docs/arquitetura/ADR-007-area-profissional.md) e [relatório](docs/engenharia/entrega-007.md). Após `npm test` no banco isolado, `npm run test:dashboard:e2e` valida componentes reais em harness temporário, sem bypass na aplicação.

## Gestão de alunos

`/alunos` permite gerenciar a carteira privada do profissional com acesso comercial confirmado. Cadastro, busca/filtros/ordenação/paginação SQL, perfil/edição, arquivamento/reativação e PDFs reais. Não cria autenticação ou compartilhamento por e-mail. Aplicar migrations novas com `npm run db:migrate` antes de iniciar; o dashboard consulta contagens reais da carteira.

- [Módulo, modelo e API](docs/modulos/alunos.md)
- [Privacidade e retenção](docs/privacidade/alunos.md)
- [ADR-008](docs/arquitetura/ADR-008-alunos.md)
- [Relatório e evidências](docs/engenharia/entrega-008.md)

`npm run test:students:e2e` exige TEST_DATABASE_URL isolada terminada em `_test` e Chromium local. Usa PostgreSQL/sessões/handlers reais com provedor controlado e UI temporária, sem conceder acesso na aplicação principal. PDFs runtime usam PDFKit + fontes locais em assets/fonts, sem Python/Chromium em produção. Poppler é utilizado apenas na inspeção/testes dos documentos.

## Biblioteca de exercícios

`/exercicios`: catálogo oficial e particulares, filtros/paginação SQL, detalhes, CRUD sem exclusão, solicitações e seleção múltipla validada no servidor. Depois de configurar PostgreSQL, executar `npm run db:migrate` e `npm run exercises:import`. A fonte é vendorizada: nenhuma chamada GitHub é necessária em runtime, nenhuma mídia é importada. São 873 registros auditados, 868 publicados estruturalmente e 5 excluídos; revisão técnica profissional segue necessária.

- [Módulo e contratos](docs/modulos/exercicios.md)
- [Catálogo, licenças e importação](docs/catalogo/exercicios.md)
- [Provisionamento controlado de moderação](docs/operacao/moderacao-exercicios.md)
- [Relatório 009](docs/engenharia/entrega-009.md)

`npm run test:exercises:e2e` usa PostgreSQL isolado e Chrome em harness exclusivo de testes, com sessões e APIs reais e gateway financeiro controlado. Não há bypass de acesso no aplicativo. A Stripe continua sem homologação externa; nenhuma conta real recebe privilégio automaticamente.

## Prescrições e modelos de treinamento

`/treinos` oferece fichas individuais e modelos privados com editor comum, divisões/exercícios ordenados, séries individuais, cargas, repetições por formato, tempo, descanso e técnicas estruturadas. Modelos ativos podem ser aplicados a 1–50 alunos próprios ativos, em transação atômica e com cópias independentes em rascunho. Versões históricas preservam identidade e referências canônicas do catálogo. O perfil do aluno mostra suas fichas reais; dashboard usa contagens persistidas.

Aplicar a migration nova com `npm run db:migrate`; catálogo local continua usando `npm run exercises:import`. Nenhum bypass de assinatura ou seed de ficha/modelo existe no runtime. `npm run test:workouts:e2e` utiliza somente PostgreSQL isolado e harness temporário com sessões/APIs reais e gateway controlado.

- [Treinos, estados e dados](docs/modulos/treinos.md)
- [Modelos e aplicação atômica](docs/modulos/modelos-de-treinamento.md)
- [Contratos de API](docs/engenharia/api-treinos.md)
- [ADR-010](docs/arquitetura/ADR-010-prescricoes-versionadas.md)
- [Relatório 010 e capturas](docs/engenharia/entrega-010.md)

PDF premium pertence à 011; conta de aluno, execução, desempenho, mobile e integrações externas permanecem fora do módulo.

## Exportação profissional — Implementação 011

Fichas individuais com PDF Compacto/Premium, prévia real e download privado, versões históricas e apresentação profissional persistente com logomarca sanitizada no PostgreSQL. Não altera a prescrição, autenticação ou regras comerciais. [Módulo](docs/modulos/exportacao-treinos.md) e [relatório](docs/engenharia/entrega-011.md).

## Refinamento visual 011.5

PDF Premium com composição editorial, divisões marcantes e séries mais densas; Compacto com alinhamentos e tabelas refinados. Mesmo conteúdo, snapshots, opções, segurança e prévia/download da 011. Sem nova migration ou dependência. [Relatório e comparação](docs/engenharia/entrega-011.5.md).

## Acompanhamento físico — entrega 012

`/acompanhamento`: selecione aluno da carteira ou entre pela ficha. Avaliações reais e parciais com decimais exatos, edição concorrente, arquivo/reativação, auditoria, gráficos por data e comparação. Migration aditiva `012_physical_assessments.sql`, aplicada nesta execução somente ao PostgreSQL descartável. Para incorporar em um ambiente existente, revisar e autorizar primeiro a migration; não foi executada automaticamente nesse banco.

- [Operação e regras](docs/modulos/acompanhamento.md)
- [API e modelo de dados](docs/engenharia/api-acompanhamento.md)
- [Arquitetura e reutilização](docs/arquitetura/ADR-012-acompanhamento.md)
- [Privacidade e retenção](docs/privacidade/acompanhamento.md)
- [Relatório e evidências](docs/engenharia/entrega-012.md)

Verificação: `TEST_DATABASE_URL=postgres://…/formfisik_test npm test` e `npm run test:assessments:e2e` com a mesma variável apontando **somente para um banco descartável**. Testes limpam dados desse banco. A homologação usa sessões e PostgreSQL reais e gateway financeiro controlado no processo de teste; não libera acesso sem Stripe na aplicação real.

## Entrega 013 — Fotografias privadas e calendário

Acompanhamento agora organiza Avaliações/Evolução/Fotografias, com calendário mensal/anual e comparação de imagens datadas independentes. R2 preparado, sem configuração externa: uploads permanecem indisponíveis até credenciais privadas válidas e operação confirmada. Nunca há fallback público/disco ou sucesso simulado.

[Relatório](docs/engenharia/entrega-013.md) · [Contratos/modelo](docs/engenharia/api-fotografias.md) · [R2 e limpeza](docs/operacao/fotografias-r2.md) · [Privacidade](docs/privacidade/fotografias.md).

Testes: `TEST_DATABASE_URL` deve apontar exclusivamente para PostgreSQL descartável com nome terminado em `_test`; `npm test` e `npm run test:photos:e2e` usam armazenamento controlado somente nos testes. Não reutilizar banco de desenvolvimento nos testes (TRUNCATE). Limpeza operacional preparada em `npm run photos:cleanup`; conferir ambiente/autorização antes de executá-la. Não houve migração do banco existente, criação de bucket, deploy ou commit.

## Entrega 014 — evolução em PDF e shell

Relatórios profissionais Compacto/Premium em `/acompanhamento/[studentId]/exportar`, acessíveis pelo acompanhamento e ficha do aluno. Peso, medidas, gráficos vetoriais, comparações e fotos opcionais com autorização específica. Prévia PDF.js/download usam os mesmos bytes privados temporários. Funciona sem R2 quando fotos não são selecionadas. Shell compartilhado com sidebar/cabeçalho estáveis, main independente e memória limitada de navegação.

[Documentação funcional](docs/modulos/relatorios-fisicos.md) · [API](docs/engenharia/api-relatorios-fisicos.md) · [Operação/migration aditiva](docs/operacao/relatorios-fisicos.md) · [Relatório 014](docs/engenharia/entrega-014.md). Não houve deploy nem migration no banco existente.

Entrega017: [anamneses e cadastro por convite](docs/modulos/anamneses.md), [relatório local](docs/engenharia/entrega-017.md). Sem deploy, migração no banco persistente ou liberação de dados reais.

Entrega018: [CRM profissional](docs/modulos/crm.md), [API](docs/engenharia/api-crm.md) e [relatório](docs/engenharia/entrega-018.md). Kanban, condições, tarefas e histórico com fatos canônicos. Testes `npm test` e `npm run test:crm:e2e`, exclusivamente com `TEST_DATABASE_URL` descartável terminado em `_test` (TRUNCATE). Stripe controlada apenas no harness; aplicação real continua exigindo configuração válida. Migration018 preparada, nenhuma migration persistente, deploy ou commit.

Entrega019: [Serviços e consultorias](docs/modulos/servicos-e-consultorias.md), [API](docs/engenharia/api-consultorias.md) e [relatório](docs/engenharia/entrega-019.md). Catálogo/planos versionados, acordos administrativos, obrigações e execução com evidência, renovação/cancelamento e CRM. Migration019 preparada somente em banco descartável; sem cobrança, Connect, assinatura eletrônica, deploy ou GO produtivo. Testes: npm test e npm run test:consultancies:e2e, exclusivamente com TEST_DATABASE_URL descartável terminado em _test (TRUNCATE).

### Entrega020 — financeiro profissional local

Gestão financeira por contratação019, obrigações, pagamentos externos/correções, dashboard e fronteira Connect controlada. [Módulo](docs/modulos/financeiro-profissional.md), [relatório](docs/engenharia/entrega-020.md) e [homologação](docs/operacao/financeiro-profissional.md). Não há ativação externa, cobrança real ou GO produtivo.

### Agenda profissional021

Disponibilidade, sessões recorrentes, presença e execução contratual explícita: [documentação](docs/modulos/agenda-profissional.md), [API/modelo](docs/engenharia/api-agenda.md), [relatório](docs/engenharia/entrega-021.md). Migration021; testes `npm test`, `npm run test:agenda:e2e` exigem PostgreSQL descartável em TEST_DATABASE_URL terminado em `_test`. Calendários externos somente documentados; nenhum deploy ou Connect externo ativado.

## Biblioteca de demonstrações —023

Fontes oficialFormFisik, upload privado eYouTube por URL, associadas ao catálogo e versões de treino. [Módulo](docs/modulos/demonstracoes.md), [relatório técnico](docs/engenharia/entrega-023.md) e [operação](docs/operacao/demonstracoes-stream.md). Streamexterno não homologado; sem acervo de terceiros copiado ou serviços pagos ativados.

### Check-ins e feedbacks022

[Módulo](docs/modulos/checkins.md), [API/modelo](docs/engenharia/api-checkins.md), [relatório](docs/engenharia/entrega-022.md). Motor017, convites individuais sem conta, respostas/correções imutáveis, feedback versionado de prescrição e revisão. Migration023 segue mídia022; sem notificações externas ou efeitos clínicos/financeiros automáticos. Validação somente em bancos descartáveis `_test`.

### Central de comunicação024

[Manual](docs/modulos/comunicacao.md), [API](docs/engenharia/api-comunicacao.md), [relatório](docs/engenharia/entrega-024.md). Carteira/histórico/modelos, textos preparados e contatos declarados, contexto mínimo, avisos internos e tarefasCRM reutilizadas. Sem envio real, autenticação de aluno ou canal externo; produção NO-GO. Migration024 testada somente em bancos descartáveis.
