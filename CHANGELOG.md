# Histórico de alterações

## Entrega019 — serviços e consultorias locais

Catálogo, planos/preços em centavos e versões imutáveis, acordos individuais/snapshots, vigência, renovação/cancelamento administrativo e obrigações/execuções com evidência explícita010/012/017. Integração CRM018, paginação/indicadores, eliminação/replay e grants016. [Relatório019](docs/engenharia/entrega-019.md). Sem financeiro020/Connect/assinatura eletrônica/deploy; NO-GO produtivo preservado.

## Entrega018 — CRM profissional local

Kanban e lista paginados, etapas/regras personalizáveis, movimentação com prévia e concorrência, tarefas operacionais e geração explícita por origem, histórico e indicadores canônicos008/017/010/012. Migration018, isolamento, eliminação/restore016 e Design System/documentação atualizados. [Relatório018](docs/engenharia/entrega-018.md). Sem contratos019/financeiro020/deploy; NO-GO produtivo preservado.

## Entrega016 — Estabilização local

Migrations/readiness, eliminação operacional delimitada, ledger autenticado para restauração, grants mínimos e diagnóstico, com testes sintéticos. [Relatório016](docs/engenharia/entrega-016.md) distingue validações locais de Stripe/R2/SMTP externos pendentes. **NO-GO para produção e dados reais permanece.**

## Entrega 015 — Segurança e privacidade

Auditoria e correções de autenticação, suspensão de contas, CSP, isolamento, minimização de respostas e consistência entre abas. Inventário de tratamento, procedimentos operacionais e evidências estão no [relatório 015](docs/engenharia/entrega-015.md). **NO-GO para produção e dados reais** enquanto as pendências essenciais de eliminação, operação e homologação permanecerem abertas.

## Entrega 012 — Acompanhamento físico

- Avaliações corporais privadas e parciais, peso/14 medidas, datas civis, decimais exatos, concorrência e auditoria administrativa.
- Arquivo/reativação, histórico paginado, gráficos de pontos com tabela acessível, períodos e comparações sem classificação clínica.
- Navegação, ficha do aluno e indicadores reais integrados; migration aditiva 012, APIs e documentação de privacidade.
- Resultados verificáveis, capturas e limitações no [relatório 012](docs/engenharia/entrega-012.md). Sem fotos, PDF de acompanhamento, deploy ou alteração de cobrança.

## Entrega 010 — Prescrição profissional e modelos

- Editor central de fichas/modelos, divisões, seletor 009, séries/etapas, parâmetros e técnicas estruturadas.
- Referências e versões canônicas, histórico, concorrência, rascunho/ativação/arquivo, duplicação e cópias independentes.
- Aplicação atômica de modelo a vários alunos, idempotência durável e resposta resumida por aluno.
- Treinos na navegação, fichas reais no perfil do aluno e contagens reais no dashboard.
- Migration aditiva, documentação e testes com PostgreSQL/Chrome; resultados verificáveis em [Entrega 010](docs/engenharia/entrega-010.md).
- Sem exportação final de PDF, execução, mobile, alteração financeira ou deploy.

## Entrega 009 — Biblioteca de exercícios

- Catálogo PT-BR fixado/licenciado, auditoria reproduzível e importação offline idempotente.
- Exercícios oficiais e particulares, busca/filtros/paginação, detalhes, versões, arquivo/reativação e seletor múltiplo com confirmação no servidor.
- Solicitações com acompanhamento/reenvio e decisões protegidas por capacidade administrativa persistente; sem concessão automática.
- APIs, migration aditiva, documentação e testes de integração/Chrome; resultados em [Entrega 009](docs/engenharia/entrega-009.md).
- Homologação técnica do catálogo, provisionamento real de moderador e homologação externa Stripe permanecem pendentes.

## Entrega 004 — Plano Pro e apresentação da contratação

- Página `/assinatura` com preço, trial, cartão, cobrança e cancelamento, protegida por sessão e perfil profissional confirmado.
- Navegação após login e dashboard leva ao plano; conta provisória permanece acessível.
- Checkout explicitamente indisponível, botão desativado, feedback de carregamento/erro e retry sem operação financeira.
- Stripe escolhida; contratos de domínio planejados, sem SDK, Checkout, Portal, webhook, dados de cartão ou assinatura fictícia.
- Documentação comercial, arquitetura, Design System e roadmap atualizados. Evidências em [Entrega 004](docs/engenharia/entrega-004.md).


## Entrega 003 — Recuperação de senha

- Solicitação de recuperação e redefinição via SMTP e PostgreSQL, com tokens opacos de uso único e 30 minutos de validade.
- Hash Argon2id, revogação de todas as sessões e links anteriores após redefinição, sem login automático.
- Login protege concorrência com troca de senha; credencial obsoleta não gera sessão.
- Telas acessíveis/responsivas, link funcional no login, headers de privacidade e documentação de segurança/API/SMTP.
- Testes de integração e E2E, incluindo regressões de cadastro/login. Resultados verificáveis em [Entrega 003](docs/engenharia/entrega-003.md).

## Entregas anteriores

- [Entrega 002 — Login e sessões opacas](docs/engenharia/entrega-002.md).
- [Entrega 001 — Cadastro profissional e confirmação de e-mail](docs/engenharia/entrega-001.md).

## Entrega 005 — Stripe Checkout/trial local

- SDK Stripe no servidor, Checkout de teste com cartão obrigatório, Pro BRL 13990/mês e trial de 30 dias.
- Migration 004, vínculo de cliente, intenção durável, idempotência, concorrência e marca permanente de trial por usuário.
- Webhook assinado no corpo bruto, deduplicação transacional e consulta canônica contra eventos fora de ordem.
- Retorno autenticado e autorização inicial no servidor; falta de configuração bloqueia contratação.
- Testes com PostgreSQL e provedor controlado; configuração hospedada/cartões pendentes, por ausência de chaves. Sem deploy ou recursos externos.

## Entrega 006 — Gestão do ciclo de assinaturas

- Painel protegido, faturas resumidas, datas/estimativa de cobrança, estado financeiro e direito de acesso separados.
- Portal Stripe completo com configuração validada, cartão, faturamento e pagamentos da própria conta.
- Cancelamento confirmado ao fim de trial/período, intenção durável/idempotente e proteção contra período alterado/timeout.
- Migration 005 para ciclo, faturas, cancelamentos e sincronização; webhooks ampliados e reconciliação canônica/operacional.
- Autorização para trial e período pago regular, sem carência em inadimplência e sem bypass de desenvolvimento.
- Testes controlados PostgreSQL/Stripe e UI; homologação financeira externa e produção pendentes das credenciais/configuração.

## Entrega 006.5 — Refinamento UX/UI de assinaturas

- Painel em Meu plano, Meu período, Gerenciamento e Histórico, com hierarquia de plano/preço/estado/acesso e datas relevantes.
- Dias restantes do teste, renovação e estados vazios claros, sem valores financeiros inventados.
- Ações hierarquizadas e microcopy simples no painel/oferta/retorno; detalhes técnicos permanecem na documentação.
- Componentes de apresentação reutilizáveis, skeletons, foco após erro/confirmação, diálogo responsivo e navegação por teclado.
- Regressões financeiras preservadas, matriz visual de estados, acessibilidade, reflow/zoom e testes de formatação.
- Backend, migrations, regras comerciais/Stripe/autorização não alterados; homologação externa continua pendente.

## Entrega 007 — Área profissional

- Dashboard autorizado no servidor, nome real, onboarding, indicadores omitidos sem fonte e atividades vazias.
- Shell reutilizável em conta/assinaturas, sidebar/header, menu móvel acessível e navegação única. Removidos links/pesquisa de protótipo.
- Login profissional retorna dashboard, que direciona à oferta/gerenciamento quando sem acesso. Sessões e regras financeiras preservadas.
- API privada limitada, monitor passivo de acesso, estados de loading/erro/indisponibilidade.
- Testes PostgreSQL/provedor controlado e harness visual sem rota de bypass; documentação de módulo, ADR e Design System.
- Grade/skeleton da assinatura adaptados à largura útil do shell e ao texto a 200%, mantendo os fluxos financeiros.

## Entrega 008 — Gestão de alunos

- Carteira privada PostgreSQL: cadastro, pesquisa/filtros/ordenação/paginação, perfil e edição.
- Arquivamento/reativação, versão concorrente e histórico administrativo mínimo sem snapshots pessoais.
- Idempotência e confirmação de possíveis duplicatas com suporte a homônimos; nenhum login de aluno ou vínculo por e-mail.
- API autenticada/autorizada por sessão e assinatura, propriedade em cada consulta, validações, CSRF, limites e respostas privadas.
- PDFs estruturados individuais e de carteira filtrada, A4 com fonte local, limite de 500 e revisão renderizada.
- Menu Alunos funcional e dashboard com contagens reais/onboarding de primeiro aluno.
- Documentação de módulo, privacidade/retenção, ADR e Design System; testes reais PostgreSQL e browser controlado.

## Exportação profissional — Implementação 011

Fichas individuais com PDF Compacto/Premium, prévia real e download privado, versões históricas e apresentação profissional persistente com logomarca sanitizada no PostgreSQL. Não altera a prescrição, autenticação ou regras comerciais. [Módulo](docs/modulos/exportacao-treinos.md) e [relatório](docs/engenharia/entrega-011.md).

## Refinamento visual 011.5

PDF Premium com composição editorial, divisões marcantes e séries mais densas; Compacto com alinhamentos e tabelas refinados. Mesmo conteúdo, snapshots, opções, segurança e prévia/download da 011. Sem nova migration ou dependência. [Relatório e comparação](docs/engenharia/entrega-011.5.md).

## Entrega 013 — Fotografias e calendário

- Registros fotográficos privados independentes de avaliações, autorização específica e tratamento de menores, upload validado/saneado, substituição, arquivo, remoção e auditoria.
- Adaptador privado Cloudflare R2, ausência de configuração explícita e fila durável de limpeza; sem homologação externa ou fallback em produção.
- Calendário mensal/anual agregado integrado a gráficos, comparação fotográfica e ampliação acessível.
- Organização permanente em AGENTS/Design System; painéis de acompanhamento, regiões de formulário e expansão explícita de medidas ausentes.
- Migration aditiva 013, testes e documentação de APIs, dados, privacidade, operação e auditoria retrospectiva. Resultados verificáveis no relatório 013.

## Entrega 014 — relatórios físicos e shell profissional

- Exportação Compacto/Premium de evolução física com seleção de período/conteúdo, cálculos012, gráficos vetoriais e apresentação011.
- Fotos opcionais013 com autorização própria de exportação, consistência de versões e remoção transacional dos PDFs após revogação/substituição.
- PDF.js e download autenticado sobre mesmo artefato privado15min; limites/cleanup compartilhados com treinos.
- Sidebar integral/cabeçalho estáveis, main independente, navegação móvel modal e memória limitada de filtros/scroll sem Web Storage.
- Migration014 aditiva criada/testada apenas em banco descartável; sem deploy/serviços externos/credenciais alteradas.

## Entrega017 — Cadastro inteligente e anamneses

Construtor/versionamento, modelo padrão, convites individuais web sem conta, submissão transacional com carteira existente, pendências de identidade, revisão/histórico e integração com eliminação016. [Relatório017](docs/engenharia/entrega-017.md) registra verificação e limitações. Produção permaneceNO-GO.

## Entrega020 — financeiro profissional

Domínio financeiro separado do SaaS, configuração explícita por contratação019, ciclos/centavos, recebimentos externos auditáveis, intenções retomáveis, conta/checkout/recorrência/reembolsos/disputas por provedor controlado, webhook assinado, conciliação/payouts e dashboard paginado. Retenção bloqueia expurgo financeiro. Arquitetura Connect condicionada, sem ativação externa/produção.

## Marco021 — Agenda profissional

Disponibilidade, exceções/férias, tipos, reservas e recorrência com confirmação atômica; presença/correções, indicadores, aluno/CRM e execução019 explícita. PostgreSQL021, autorização/versões/idempotência, eliminação/restore016 e contratos documentais de calendários futuros. Sem dependência nova, sincronização externa, alteração financeira020 ou deploy. Resultados e limites em docs/engenharia/entrega-021.md.

## Marco023 — demonstrações de exercícios

Biblioteca de mídia por escopo e versão,YouTube oficial, uploadsStream/controlados comquota, revisão editorial, associação ordenada/principal e referências históricas na prescrição. Revogação,cleanup e replay autenticado. Sem ativação externa/deploy/commit; resultados/limites em docs/engenharia/entrega-023.md.

## Marco022 — Check-ins e feedbacks

Reutilização do motor017 com finalidade distinta, modelos rápido/completo/personalizado, ciclos periódicos e convites seguros. Respostas imutáveis/correções, revisão/devolutivas, feedback vinculado à prescrição histórica, perfil/CRM mínimos e indicadores declarados. Migration023 após mídia022, privacidade/restore016, testes e documentação. Sem dependência nova, deploy, conta de aluno ou canais externos. Resultados no relatório022.

Validação022:404 testes na regressão integral e42 na repetição017/022; ESLint/TypeScript/build/Chrome/Axe e backup/restore aprovados. GO local controlado, NO-GO produção preservado. [Manifesto](docs/engenharia/manifesto-022.md).

## Marco024 — Central de Comunicação Profissional

Registros operacionais imutáveis/correções, modelos versionados e prévia validada, referências canônicas mínimas, avisos internos projetados e leitura profissional, pendências CRM e indicadores honestos. Sem envio externo ou conversa autenticada do aluno. Eliminação/restore016 e grants integrados. [Relatório](docs/engenharia/entrega-024.md).

Validação024:433/433 na regressão integral,55/55 na repetição dirigida; ESLint/TypeScript/build/Chrome/Axe e backup/restore aprovados. GO local controlado; produção NO-GO. Artefato query-plan022 regenerado por teste histórico fixo, ocorrência e isolamento corretivo documentados no relatório.

## Marco025 — 02/11/2026

Inteligência de negócio privada com métricas canônicas, comparação de períodos, definições/numeradores, agrupamentos, gráfico/tabelas acessíveis e navegação contextual. Sem persistência analítica, conversão/receita presumida ou integração externa. Regressões, build real, Chrome/Axe, concorrência e restore controlados; [relatório](docs/engenharia/entrega-025.md). GO local controlado, produção NO-GO.

## Marco026 — 03/11/2026

Importação profissional completa: alunos/exercícios CSV, modelos JSON nativo em rascunho, mapeamento/prévia/duplicidades, confirmação, lotes retomáveis, cancelamento, histórico/relatório privado e retenção/eliminação/restore. Reutiliza writers existentes, sem merge ou integração externa. [Relatório independente](docs/engenharia/entrega-026.md). GO local controlado, produção NO-GO.

## 2026-11-05 — Central de serviços e consultorias

- Visão geral comercial com indicadores reais, contratações paginadas, próximas ações e resumo explícito de obrigações.
- Serviços/planos agrupados, edição rápida em painel lateral e integração visual claro/escuro preservando os fluxos019.
- Busca por serviço acordado; indicadores de renovação sem sucessora e progresso administrativo por tipo.
- Navegação das entregas para os módulos canônicos, sem execução ou pagamento presumido.
- Relatório: `docs/engenharia/refinamento-consultorias-2026-11.md`.

### Consultorias — acabamento das abas internas

- Catálogo de serviços/planos em cards comerciais, versões e ações contextuais.
- Contratações e entregas com superfícies, filtros/tabelas compactos e detalhes organizados.
- Histórico em linha do tempo e formulários com hierarquia visual consistente.
- Visão geral preservada; sem mudanças no backend ou nas regras comerciais.

## 2026-11-06 — Central operacional de Check-ins

- Visão geral com indicadores reais, navegação semanal, filtros e resposta selecionada no mesmo painel.
- Revisão/devolutiva, correções e modelos reutilizam o domínio022 e motor017, com rascunho protegido e histórico preservado.
- Preparação de lembrete reutiliza o Composer024 na própria central; sem disparo ou confirmação de entrega.
- Periodicidade identifica aluno/modelo; histórico permite período, aluno e modelo; DTOs permanecem privados/mínimos.
- Limites explícitos: atribuição individual, ciclos civis e ausência de portal de devolutivas/horário de envio/lembretes automáticos.

- Check-ins: acabamento das abas Solicitações, Modelos, Periodicidade, Indicadores e Histórico no padrão visual compartilhado; listas responsivas, cartões de séries/modelos, indicadores agrupados, timeline e estados de interação dos botões, sem alteração das regras de domínio.

- 06/11/2026 — Financeiro: painel por origem, recebimentos externos independentes de Stripe, nova cobrança em drawer com primeiro vencimento dentro da vigência, exportação gerencial protegida, responsividade/temas e documentação da diretriz definitiva.30 testes de integração e Chrome/Axe aprovados; processamento real não ativado.
