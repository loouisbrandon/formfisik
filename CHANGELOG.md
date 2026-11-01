# Histórico de alterações

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
