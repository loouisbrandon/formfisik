# CRM & Operação — evolução de novembro de 2026

Estado: IMPLEMENTADO — GO local controlado, com limites descritos abaixo. FormFisik é empresa independente fundada por Brandon Louis. Esta entrega não constitui homologação Personal 1.0 nem revoga o NO-GO015.

## Auditoria e abordagem

Inspecionados AGENTS, documentação oficial, Design System, domínio018, integrações019/021/022/024/025, privacidade016 e testes existentes. O CRM já possuía entidades, isolamento, etapas configuráveis, prévia de movimentação, versionamento, idempotência, auditoria transacional, tarefas, filtros SQL e paginação. A lacuna principal era a apresentação extensa dos cards e a fragmentação da rotina profissional.

Três partes da mesma entrega: central operacional e contexto; tarefas e vínculos; validação/documentação. Reutilizados ProfessionalShell, navegação em memória, proteção de alterações, StudentsPicker, crmApi, MoveDialog, CrmSettings, CrmHistory, serviços e projeções canônicas. Não foram criados novos cadastros, agenda, motor de prescrição ou mecanismo financeiro. A sexta etapa existente, Atendimento concluído, continua disponível: a imagem não justifica removê-la.

Novos componentes justificados: CSS local para composição responsiva; CrmDialog para modal/drawer com foco e Escape; TaskEditor para criação/edição progressiva; StudentPanel para consulta contextual; OverviewMetrics/OperationSidebar e projeção overview para a rotina. Cards passam a usar iniciais, sem introduzir fotos pessoais, storage ou imagens fictícias. Alterações preexistentes no Financeiro e no Design System foram preservadas.

## Modelo, regras e contratos

Migration026 estende crm_tasks: aluno opcional, estado waiting e appointment_id opcional com FK composta do proprietário para agenda_occurrences. Não aplicada ao banco persistente. Nenhuma nova dependência.

Responsável continua sendo o profissional proprietário; não existe equipe nem permissão de delegação autorizada. Não se cria seletor com pessoas fictícias ou acesso entre carteiras. Tarefa geral não pode ser obrigatória para regras de aluno. Vínculo com compromisso exige mesmo proprietário e mesmo aluno (ou ambos sem aluno). O vínculo do aluno em edição é preservado. Exclusão canônica de ocorrência limpa apenas a referência atual; eventos mantêm autoria/data e não são reescritos. Eliminação016 de aluno/conta conserva seu escopo e remove tarefas/eventos correspondentes.

Estado waiting participa de pendências, atrasos, regras e integrações de Comunicação/Indicadores. Estados abertos podem alternar entre si, concluir ou cancelar; concluída/cancelada reabre para pending. Concluir tarefa não confirma presença nem entrega, prescrição, pagamento ou avaliação. Histórico de criação/edição registra referência ao compromisso sem notas privadas. Alterações usam versões e operações idempotentes. O editor mantém chave em retry da mesma intenção.

GET overview retorna métricas, data/fuso, agenda de hoje paginada20 e até6 tarefas prioritárias. Agenda usa queryAgenda e DTO reduzido: id, título operacional, nome autorizado, início, estado e vínculo. Não inclui notas, localização privada, respostas ou medidas. Link /agenda?appointment=UUID abre o carregador de detalhes canônico, que autoriza no servidor. Criar compromisso direciona à Agenda do aluno, reutilizando seu editor/validações.

GET tasks:20 por página/coluna, estado/urgência/nome/aluno, vencimento from/to em São Paulo, ordenação por prazo ou prioridade, desempates estáveis. Colunas separadas pending/in_progress/waiting/completed; canceladas continuam consultáveis em lista. Não são carregadas milhares de tarefas para agrupar no browser. Board mantém10 por etapa; lista/histórico20. Filtro de prioridade do quadro exige tarefa aberta da prioridade escolhida. Pesquisa rápida tem debounce200ms e cancelamento de leitura obsoleta. Seleções/filtros/paginação usam memória de navegação existente. Páginas vazias preservam total e retorno à anterior.

## Fórmulas e limites

- Alunos em andamento: vínculos ativos da carteira (não inferência clínica por nome de etapa).
- Tarefas hoje: não arquivadas, abertas, vencimento na data atual no fuso da Agenda.
- Atrasadas: não arquivadas, abertas e vencimento anterior ao instante da consulta.
- Compromissos da semana: início de segunda a domingo no fuso da Agenda, sem bloqueios ou cancelados; inclui realizados.
- Concluídas: estado atual completed, não arquivadas.
- Sem próxima ação: aluno ativo sem tarefa aberta nem compromisso futuro agendado; não afirma ausência de pendências clínicas.
- Média por etapa: permanência dos vínculos atualmente filtrados; não média histórica de conversão.
- Prioritárias: atrasadas, hoje, alta/urgente, demais; prazo e UUID estabilizam a ordem, até6 registros. Agenda lateral20/página, horário no fuso configurado.

Indicadores superiores são da carteira (ou aluno na rota contextual), independentes dos filtros do quadro; indicadores expandidos do quadro preservam seu escopo anterior. Sem prazo/hora não se inventa precisão: data sem horário vence às23:59 do dispositivo, informação explícita no editor. Tarefas sem prazo continuam abertas.

## Segurança, privacidade e operação

Sessão opaca, entitlement SaaS, Origin/CSRF, DTO mínimo, rate limiting, schemas strict e isolamento permanecem no backend. UUID não concede acesso. Nova projeção é somente leitura em snapshot consistente. Textos livres são operacionais; não inserir dados clínicos. Finalidade: organizar rotina própria. Retenção/eliminação seguem018/016; nenhuma autorização jurídica ou prazo novo é presumido. Automações continuam opt-in, explícitas, limitadas por lote e idempotentes por origem; sugestões não disparam ações externas.

Não houve deploy, commit ou migration persistente. A aplicação desta versão sobre banco sem026 não está liberada. O bloqueio temporário da revisão automática para iniciar PostgreSQL descartável foi resolvido após a retomada; testes continuam exclusivos desse ambiente.

## Validação

TypeScript e ESLint do escopo passaram. A regressão final passou102/102 testes PostgreSQL (25 de CRM, mais Agenda, Comunicação e Indicadores), incluindo vínculo com Agenda, ausência de efeito em presença e eliminação016 do vínculo. Navegador e build HTTPS passaram conforme evidências abaixo. O lint global encontrou40 erros em scripts locais de evidências preexistentes (test-results/local), não corrigidos indiscriminadamente.

Limitações de homologação: navegadores/dispositivos físicos e leitor de tela humano não são comprovados por Chrome/Axe; providers externos e produção permanecem fora do escopo. Reatribuição para equipes não é disponível porque não há autorização compartilhada implementada. Não há envio automático, automação de contato inicial ou integração externa nova.

### Evidências verificadas em06/11/2026

- PostgreSQL18 descartável:102/102 testes de CRM/Agenda/Comunicação/Indicadores;25 cenários CRM. Migration026 executada somente nesses bancos efêmeros. Cobertura inclui concorrência, rollback de auditoria, isolamento, filtros, paginação, aguardando, tarefa geral, vínculo canônico, ausência de efeito em presença e eliminação016.
- Chrome real com sessão opaca e backend PostgreSQL:PASS. Dois temas,1440/768/375/320px, teclado, arraste aluno/tarefa, paginação, editor, regras obrigatórias, conclusão/reabertura, lista, histórico, drawer e retry de rede. Texto200% e altura500px com drawer aberto não ampliam scroll externo. Axe sem violações nas telas verificadas. Evidências:`test-results/local/crm-redesign/browser-proof.json` e `browser/*.png`.
- Build HTTPS real com provedor Stripe exclusivamente loopback:PASS; sessão Secure/HttpOnly, troca de usuário, logout, autorização, CRM, PDF e rotas privadas;zero vazamentos de canários,zero violações CSP ezero erros de console. Evidências:`production/after-production.json`, `production/after-build.log`.
- ESLint dos arquivos alterados:PASS; TypeScript:PASS. Lint global executado:40 erros em scripts de evidências locais preexistentes, não no escopo da entrega. Não se declara lint global aprovado.
- Medição do fluxo sintético final:18 respostas board200 (máximo11259bytes) e18 overview200 (máximo429bytes). São consultas agregadas, sem HTTP por card. O resumo diário acrescenta uma leitura independente ao carregamento do quadro; detalhes só ao abrir painel. Leituras obsoletas canceladas. A evidência histórica018 registrou15 respostas board200, máximo11432bytes; os fluxos e dados diferem, portanto não se infere redução percentual de tráfego. Estes números não são benchmark de produção nem prova de latência sob carga real.

Falhas encontradas e corrigidas: semântica HTML dos indicadores detectada pelo Axe; superfície dos cards escuros ajustada ao token workspace-card; estado Aguardando propagado às contagens canônicas; erro da consulta de resumo separado do erro do quadro para não ser apagado por outra leitura. Infraestrutura de teste:polling local por limite de watchers e porta configurável da fixture Stripe por conflito3112; nenhum serviço preexistente foi encerrado.

Build final repetido após os últimos ajustes:PASS, TypeScript incluído,220 artefatos públicos inspecionados com10 canários de configuração e canário de conexão;zero vazamentos (`canaries-final.json`). Container descartável encerrado e removido. GO local restrito ao ambiente sintético validado; NO-GO para aplicação desta versão ao banco persistente sem autorização/revisão da migration026 e para produção enquanto gates015 permanecerem. Não houve commit/deploy.
