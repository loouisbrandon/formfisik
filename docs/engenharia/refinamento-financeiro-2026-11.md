# Financeiro — redesign e autonomia de recebimento (06/11/2026)

Estado: IMPLEMENTADO — GO LOCAL CONTROLADO para gestão externa e interface; processamento integrado real e produção NÃO HOMOLOGADOS. FormFisik é empresa independente fundada por Brandon Louis. Esta entrega não formaliza estrutura jurídica, não habilita processamento real e não altera o Billing SaaS.

## Auditoria e decisão

O domínio020 já contém finance_accounts, agreements, charges, external_receipts, operations, events, webhooks e payouts; valores inteiros BRL, lock por profissional compartilhado com019, intenções duráveis, mutações transacionais e snapshots do provedor. Configuração referencia contratação canônica019 e seu valor/versão. Financeiro não escreve estado de aluno, contratação, treino ou SaaS quando há falha ou vencimento. Pagamentos externos já funcionam sem gateway; accountRow local não é conta Stripe e mantém provider_account_id nulo.

Reutilizados: ProfessionalShell, memória privada de navegação, Feedback, Pagination, ServiceDrawer de Consultorias, guards de sessão/assinatura, catalog/contratação019, comandos020, API e webhook existentes. ServiceDrawer recebe closeLabel opcional para nome acessível contextual; comportamento original de serviços preservado. Planos direciona ao catálogo canônico019. Lembretes abrem a Comunicação do aluno para preparação/registro pelo fluxo024 existente; não há envio automático ou declaração de entrega.

A diretriz do fundador confirma processamento opcional, recebimentos externos sem comissão FormFisik, controle gerencial sem Stripe e ausência de bloqueio automático de aluno por inadimplência. Pro é independente. Não existe segunda fonte de verdade comercial ou financeira.

## Implementação

- Dashboard com recebido líquido de reembolsos observados + externo declarado, saldo pendente, vencido e líquido conhecido do processador. Taxas/líquido desconhecidos deixam o total explicitamente parcial. Sem comparação histórica inventada.
- Fluxo acumulado limitado a367 datas; previsto por vencimento de obrigações não canceladas, recebido por pagamento, descontando reembolsos atuais da mesma coorte. Valores detalhados acessíveis; não representa extrato histórico de estornos. Distribuição separa origem e mostra conferido como subconjunto do externo.
- Cobranças20/página no servidor: aluno, plano preservado, período/ciclo, valor, saldo, origem, situação e detalhe. Recebimentos20/página unificam projeções do processador e ledger externo, sem copiar dados, referências do processador ou notas privadas para listagens.
- Nova cobrança em painel lateral reutilizado: contratação do aluno, condições e confirmação. Valor respeita snapshot019; alteração exige revisar o acordo comercial. Primeiro vencimento opcional explícito dentro da vigência, validado no servidor; pagamentos legados sem campo usam início da contratação. Não muda preços, frequência ou datas existentes.
- Recorrência integrada finita e parcelas externas preservadas, com total dividido e limites020. A opção integrada fica indisponível sem gateway habilitado. Preparar nunca confirma recebimento.
- Registro parcial/integral, conferência, correção e invalidação mantêm comandos transacionais020 e histórico. Saldo explícito. Invalidação administrativa não executa devolução bancária.
- Histórico, repasses, eventos/recuperação e intenções pendentes preservados. Configurações apresenta controle externo e processamento integrado opcional.
- Exportação CSV de cobranças ou recebimentos a partir das abas respectivas e Visão geral: filtros do servidor, autorização, origem identificada, moeda/unidade explícitas, nenhum conteúdo privado de observações e neutralização de fórmulas. Limite1000, rejeita excesso sem truncamento silencioso.

## Arquitetura e dados

Novos `report.ts`, `presentation.tsx`, `finance.module.css` e `export.ts` têm responsabilidades específicas: projeção SQL limitada, apresentação responsiva, tokens visuais e serialização segura. `queries.ts` mantém overview020 consumido por Indicadores025; dashboard é nova leitura para não mudar esse contrato silenciosamente. Dashboard/export/receipts executam em snapshot repeatable-read read-only na API para consistência entre consultas. Integrações que fornecem executor usam a transação existente.

Nenhuma tabela, migration, dependência, conta externa ou scheduler novos. `prepare.firstDueOn` é opcional e aditivo; cronograma usa o serviço schedule existente e permanece dentro da vigência019. Recebimentos externos não passam pelo gateway. A página solicita dados da conta na entrada/atualização, sem repetir leitura por cada mudança de período. Leituras obsoletas são abortadas; lista permanece paginada. Gravações usam chave estável e bloqueio local de submissão simultânea, além de idempotência/lock do servidor.

## Provedor

runtimeGateway continua recusando ativação externa. Pesquisa oficial atualizada06/11/2026 em ADR021: contas/capacidades, Direct Charges e Pix dependem da configuração/país/homologação. Billing SaaS não habilita recebimentos profissionais. Nenhum pagamento real, conta conectada ou segredo foi criado. Taxas são fatos fornecidos pelo processador; nenhuma comissão nova foi configurada.

## Privacidade e limites

Listagens de recebimentos retornam identidade mínima, serviço, valor/data, origem/método, conferência e reembolso; nota/referência somente no detalhe autorizado. Exportação é download gerencial local, sem armazenamento de artefato no servidor; o profissional deve guardar conforme finalidade e controle de acesso. Retenção020 e bloqueio financial_retention016 permanecem; não há prazo legal inventado nem exclusão de fatos financeiros.

Comprovante não incluído: upload de mídia clínica não é repositório financeiro seguro reutilizável por simples mudança visual. Transporte real Connect, lembretes entregues e homologação operacional permanecem dependências explícitas. Planos são administrados em Consultorias, sem editor duplicado. Eventos e repasses só possuem informações realmente observadas, não caixa bancário inferido. Exportação não é extrato oficial ou demonstrativo contábil. Filtros de origem/aluno/plano aplicam-se à gestão de cobranças/recebimentos; histórico de auditoria usa período, eventos/intenções preservam seus escopos operacionais anteriores.

## Validação

- 30/30 testes PostgreSQL aprovados em banco descartável separado do banco local de uso: idempotência/concorrência, assinatura de eventos, retries, recebimentos parciais e integrais, correções/invalidações, reembolso parcial/integral, disputa, retenção, autorização, isolamento, cronograma e vencimento sem alterar vínculo/contratação. Novos testes cobrem operação externa sem gateway, filtros por origem/método/plano, exportação sem notas, fórmula CSV neutralizada, separação de reembolso e limite de primeiro vencimento.
- Chrome E2E aprovado com sessão e APIs reais locais + FinanceGateway controlado injetado exclusivamente no harness. Fluxos: conta controlada, único/recorrente, falha/recuperação, externo, perda de resposta após commit/retry, correção, invalidação, concorrência, IDOR, exportação, planos, repasse, histórico e paginação.
- Axe sem violações detectadas nos temas claro/escuro, larguras1440/768/375/320. Texto200%, altura reduzida, retorno de foco da sidebar e ausência de scroll externo verificados. Capturas inspecionadas de dashboard claro/escuro, recebimentos e painel lateral mobile. Axe não substitui homologação humana com leitor de tela.
- TypeScript, ESLint dos módulos/testes alterados e build Next webpack real aprovados (82 páginas). Canários sintéticos HMAC/SMTP/Stripe não encontrados em arquivos públicos; relatório da inspeção em test-results/local/finance-redesign/build-security.json.

Evidências: test-results/finance-redesign/browser-proof.json, api-measurements.json e browser/; manifesto com hashes em test-results/local/finance-redesign/manifest.json. Fixtures e capturas são sintéticos; nenhuma carteira de uso recebeu dados de demonstração. Não houve nova execução de backup/restore nesta entrega, nem homologação de Stripe externo, bancos, payout real ou transporte de lembretes.

GO local controlado para esta gestão financeira e refinamento. NO-GO para ativar processamento real ou declarar produção homologada; NO-GO015 permanece. Não foram realizados deploy, commit automático, migration persistente, conexão de conta real ou cobrança externa.

## Manifesto funcional

Frontend: src/modules/finance/area.tsx, api.ts, schema.ts, novos presentation.tsx, finance.module.css, export.ts; shell.tsx apenas inclui /financeiro na largura compartilhada. ServiceDrawer ganha rótulo de fechamento opcional para reutilização, sem alterar comportamento de Consultorias. Backend: finance/queries.ts, report.ts, service.ts, handlers.ts. Testes: finance.test.ts e finance-e2e.ts. Documentos: este relatório, módulo/API/privacidade financeiros, diretrizes/modelo de negócio, ADR021, Design System, roadmap e CHANGELOG.
