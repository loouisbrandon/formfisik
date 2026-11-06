# ADR-025 — Central profissional, registros e avisos internos

Marco 024 autorizado pelo fundador. FormFisik é independente, fundada por Brandon Louis, sem presumir constituição jurídica formalizada. Produção e dados reais permanecem NO-GO. Decisão implementada e validada em02/11/2026, GO local controlado; resultados no [relatório](../engenharia/entrega-024.md).

## Auditoria anterior à escrita

AGENTS, índice, roadmap, inventário, Personal 1.0, arquitetura, estratégia, Design System, segurança/privacidade e módulos 008/017/018/019/021/022 foram consultados. O guia de Route Handlers da versão Next instalada foi lido. A árvore já contém as entregas anteriores não commitadas: não usar reset, checkout ou atribuir o diff inteiro ao 024. Snapshot de 589 arquivos observado duas vezes sem mudança concorrente; outro chat do projeto não estava ativo. Evidências em test-results/024/baseline-source.json e baseline-git-status.txt. Relatórios anteriores são históricos, preservados.

## Reutilização e exceções

- Sessões opacas, entitlement, Origin, HMAC/rate limit, body limitado, headers privados, SQL parametrizado, transações, ownerLock/studentLock e digest existentes.
- Carteira canônica e StudentsPicker, shell, memória de filtros, proteção de alterações, Feedback/Pagination e componentes de formulários existentes.
- Pendências são tarefas do CRM: mesmos serviços de criação/transição e tabela; nenhuma segunda fila de tarefas.
- Contextos consultam fontes autorizadas de treino, check-in, agenda, contratação e avaliação, com owner/aluno/versão. Não copiar documento, respostas, métricas, contato ou notas da origem para mensagens.
- SMTP existente é exclusivamente transacional de conta. Não o chamar para comunicação profissional. Não há identidade autenticada de aluno apropriada; capacidades 017/022 nunca autorizam mensageria geral.

Não foi localizada central de notificações reutilizável. Eventos de domínio permanecem nas fontes. Avisos internos serão uma projeção SQL paginada de fatos canônicos, com chaves determinísticas e recibos privados de leitura do profissional. Isso evita outbox/scheduler, processamento duplicado e sincronização concorrente de cópias. Avisos resolvidos deixam a projeção, mantendo o histórico na origem. Sem envio externo ou alegação de entrega/leitura do aluno. Janelas de agenda/vencimento serão explícitas.

Novas tabelas são necessárias para modelos e suas versões, registros operacionais imutáveis/correções, recibos internos, auditoria mínima e idempotência própria. O resultado idempotente não guarda corpo da mensagem. Não colocar registros de comunicação em respostas 017/022 ou eventos do CRM: finalidades e retenção são distintas.

## Contrato e apresentação

Textos simples, sem HTML ativo, avaliação de código ou templates arbitrários. Variáveis permitidas: aluno.nome, profissional.nome, contexto.tipo e hoje. Prévia renderizada no servidor com digest; gravação revalida fonte/versão e exige confirmação. Modelos não devem conter dados individuais. Registro preparado e contato externo declarado são estados distintos e imutáveis; correções preservam original e não convertem preparado em envio. Canal e instante são declarações, responsável vem da sessão.

Listas/históricos SQL de 20, detalhes sob demanda; busca/filtros preservados e requisições obsoletas canceladas. Indicadores separam contatos declarados, preparados, pendências CRM, avisos não lidos e alunos sem contato declarado há 30 dias (incluindo nunca). Nenhuma taxa de entrega/resposta inventada.

## Segurança, ciclo de vida e futuro

Autorização no servidor em cada operação e contexto; texto livre minimizado, sem conteúdo em logs/eventos. Eliminação016 remove comunicação do titular antes das fontes e invalida retries; restore reaplica ledger antes de tráfego. Modelos privados sem dados individuais permanecem para a carteira, e conta elegível elimina seu catálogo. Sem prazo jurídico presumido.

Futuros canais exigem credenciais, preferências/finalidade, políticas e homologação. Connect deverá resolver identidade/vínculo legítimos e participantes autorizados antes de conversar; anexos, push, estados de entrega/leitura e outbox pertencem à integração futura, não são funcionalidades concluídas neste marco.
