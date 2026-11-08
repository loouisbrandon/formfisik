# Central de Comunicação — redesign e evolução de 06/11/2026

Estado: IMPLEMENTADO para gestão existente e extensões locais; PREPARADO visual para chat. GO LOCAL CONTROLADO para escopo validado. NO-GO para chat funcional, envios externos, agendamento, automações de mensagem e produção. FormFisik é independente fundada por Brandon Louis; sem presumir formalização societária.

## Auditoria e abordagem

Lidos AGENTS, guias Next instalados de CSS/Route Handlers, índice oficial, documentação024 de módulo/API/ADR025/operação/privacidade, modelos/registros/consultas/handlers e testes existentes. Preservadas alterações anteriores de CRM026, tarefas em Aguardando, Financeiro e shell. Sem migrations novas ou persistentes; nenhuma dependência, credencial, deploy ou commit.

Reutilizados ProfessionalShell, carteira008, memória de navegação privada, proteção de rascunho, Feedback/Pagination, Composer/TemplateEditor, modelos/versionamento024, recibos de aviso024, contextos Agenda021/Check-ins022/Anamnese017/Consultorias019/Treinos010, tarefas/locks/idempotência/auditoriaCRM e autorização de sessão/assinatura existentes. SMTP é exclusivo de conta; não habilitado como remetente profissional. Interface de chat não possui backend. Sem duplicação de tarefa, aluno, compromisso, check-in, modelo ou registro.

Novos componentes workspace.tsx e CSS local concentram apresentação operacional, projeções mínimas e prévia do chat; não criam regras financeiras, clínicas ou mensageria. Novas leituras journal/prepared reutilizam tabelas existentes e o paginador SQL, evitando buscar corpos privados em listas ou duplicar entidades.

## Funcionalidades

- Tela ampla no shell, cabeçalho e quatro indicadores, temas claro/escuro, ações lima e navegação com seletor mobile.
- Visão geral com acompanhamento tabular, busca, filtros de situação, contato recente e pendências; avatar de iniciais, canal/data do último contato, estado textual e acesso ao histórico. Coluna lateral com até cinco tarefas CRM da página canônica e modelos reutilizáveis. Ação de concluir chama o serviço CRM existente, com idempotência.
- Contatos: registro externo declarado por canal/data/texto privado/proprietário, prévia e confirmação; histórico e correções imutáveis existentes preservados. Observações e resumo usam o campo privado existente; não foi criado segundo armazenamento de notas. Próxima ação é tarefa criada na aba Pendências para o aluno selecionado, sem inferência automática pelo texto.
- Comunicados: lista SQL de textos individuais preparados, busca de destinatário e acesso ao histórico. Preparação e prévia usam Composer e modelos. Não é disparo, rascunho editável ou envio em massa: texto salvo é imutável e ajustado por correção versionada. Controle indisponível explica envio/agendamento sem canal; sem contagens fictícias de agendamentos.
- Modelos: criar/editar versões, arquivar/reativar, duplicar a partir do corpo autorizado, usar em comunicado; exemplos não são registros. Variáveis novas aluno.primeiroNome, compromisso.data e compromisso.hora. Variáveis de compromisso exigem contexto Agenda pertencente ao mesmo profissional/aluno, versão exata e fuso da ocorrência. Prévia invalida se o contexto mudou.
- Histórico geral: auditoria mínima da comunicação em período de até367 datas (padrão90), SQL20/página, ordem created_at DESC/id. Sem corpos de contato no DTO; detalhe cronológico por aluno continua sob demanda. Histórico do CRM/Agenda/Check-ins permanece canônico na origem, acessível por links, sem cópia de eventos.
- Avisos internos e pendências preservam leitura profissional e serviços existentes, sem chamar canal externo. Automações mostram oportunidades indisponíveis e linkam regras reais do CRM, sem permitir ativação falsa.
- Caixa de entrada: três colunas no desktop, contexto de aluno via fontes autorizadas e links de ficha/CRM/check-ins/anamnese/agenda; reorganização no tablet/mobile. Aviso Chat em desenvolvimento, sem conversas/mensagens fictícias, sem unread falso; pesquisa, anexos, composição e envio desativados e rotulados.

## Fórmulas e limites

Contatos no mês: pontas de cadeias external_declared por occurred_at, início/fim de mês em São Paulo. Pendências de contato: tarefasCRM com aluno, não arquivadas, pending/in_progress/waiting; inclui todas essas tarefas operacionais, não classificação automática de necessidade de contato. Sem contato recente: vínculos ativos sem declaração externa nos últimos30 dias, incluindo nunca. Servidor calcula stale e filtro pending. Preparados não contam como contato. Agendados: indisponível, pois não existe canal; não mostrar zero como comprovação de serviço operacional. Nenhuma taxa de entrega/leitura/resposta.

Paginação SQL20, offsets e totais preservados em páginas vazias; contatos por último contato DESC/nome/id, preparados por data DESC/id. Consulta prepared respeita aluno/busca; journal respeita aluno/período. Fonte e corpo carregados somente sob demanda, ownership revalidado. Nenhum armazenamento pessoal em localStorage; tema é a única preferência persistida ali.

## Segurança e testes

- Integração PostgreSQL descartável formfisik_dashboard_test: **32/32 passaram**, incluindo schemas, IDOR, CSRF, duplicações, concorrência, versão de modelo, correções imutáveis, rollback de auditoria, contextos, rate limit, eliminação e novos filtros/DTO/journal/variáveis Agenda.
- Chrome com backend real024 e provedor controlado: criar/duplicar modelo, registro externo, prévia, confirmação e preparado; envio/composição de chat desativados, sem POST do chat.
- Axe WCAG2A/AA/2.1AA nas oito áreas principais em1440/768/320, ambos os temas com tokens reais do shell; sem violações ou overflow externo/horizontal. Texto200% no chat320px passou. Evidências em test-results/communication-redesign/browser-proof.json e PNGs adjacentes.
- ESLint e TypeScript: passaram. Build produção webpack: passou. Scan de217 arquivos públicos do build: zero ocorrência dos canários sintéticos de HMAC/SMTP. Primeira tentativa de build no sandbox falhou no subprocesso TypeScript; execução autorizada fora dessa restrição passou.
- Testes são sintéticos e isolados; nenhum envio externo ou cadastro sintético no banco de uso manual. Nenhuma migration persistente. Backup/restore não reexecutado neste refinamento, retenção/ledger016 existentes preservados; esta entrega não homologa operação produtiva.

## Limites e dependências

Envios profissionais, seleção em massa, agendamento/cancelamento de envio, preferências de destinatário e automações externas estão BLOQUEADOS por falta de canal homologado/remetente/credenciais/autorização de operação. Não se cria outbox falsa nem falha de entrega fictícia. Não solicitado dado secreto ao fundador: política atual proíbe configuração externa nesta entrega. Tentativas/resultados de provedor não existem; avisos internos são fatos/recibos, não tentativas de envio. SMTP de autenticação permanece separado. Acesso do aluno, chat real, anexos, push e mobile são futuros. Contexto do chat oferece referências e acesso às fontes; não copia conteúdo da última devolutiva ou respostas sensíveis. Futuro em [chat-futuro](../arquitetura/chat-futuro.md).

GO local refere-se à gestão e preview acima; **não declarar escopo externo funcional nem produção homologada**. NO-GO015 permanece. A ativação de canal requer nova entrega aprovada com preferências, limites, outbox, reconciliação, retenção e testes de envio controlado.

## Manifesto desta alteração

- src/modules/communication/{area.tsx,panels.tsx,schema.ts,workspace.tsx,communication.module.css}
- src/server/communication/{queries.ts,repository.ts}
- src/modules/professional/shell.tsx (adição da rota /comunicacao ao contêiner amplo; demais alterações anteriores preservadas)
- tests/communication.test.ts; tests/communication-redesign-e2e.ts; tests/helpers/communication-redesign-server.ts; tests/helpers/communication-browser-flow.ts (seletor do menu auxiliar; suíte ampla de segurança não reexecutada nesta entrega)
- docs/arquitetura/chat-futuro.md; este relatório; docs/modulos/comunicacao.md; docs/engenharia/api-comunicacao.md; docs/design/DESIGN_SYSTEM.md; docs/privacidade/comunicacao.md; docs/planejamento/roadmap.md; CHANGELOG.md.

Refinamento após revisão visual do fundador: mantidas seis abas da referência, abas auxiliares em Mais áreas, métricas baixas, remoção da faixa de seleção da visão geral, busca/chips compactos, prioridades e modelos à direita. Contexto individual abre diretamente o histórico de contatos.
