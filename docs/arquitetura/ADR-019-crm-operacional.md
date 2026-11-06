# ADR-019 — CRM operacional e ciclo de atendimento (Entrega 018)

Estado: implementado e verificado localmente; evidências no relatório018, sem autorização de produção. FormFisik é empresa independente fundada por Brandon Louis.

O CRM referencia `student_links`, sem duplicar cadastro ou copiar respostas/medidas/prescrição. Etapa operacional não substitui estado dos módulos. Fonte canônica consultada por agregações SQL; cards recebem somente nome, identificadores, datas e indicadores administrativos.

Fluxo padrão: Novo aluno, Aguardando anamnese, Preparação de treino, Pronto para atendimento, Em acompanhamento e Atendimento concluído. Avaliação pendente e atenção necessária são indicadores/tarefas, evitando duas colunas redundantes com pendências que podem coexistir em qualquer etapa. Padrão tem condições informativas, sem bloqueio ou configuração obrigatória.

Uma configuração por profissional, etapas e associação ao vínculo são necessários para representar posição, ordenação e condições. Tarefas e auditoria próprias representam fatos ainda inexistentes. Não persistir cópias independentes dos estados de anamnese/treinos/avaliações.

Inicialização é idempotente, transacional, serializada com criação de alunos. Associação existente recebe data real de inicialização, sem inventar movimentações passadas. Writer canônico008 também associa novos vínculos quando o CRM já foi inicializado; convite017 reutiliza esse writer.

Movimentação tem prévia e confirmação, independente de drag-and-drop ou menu. Servidor revalida regra e posição sob lock do CRM/versão otimista; condições avaliam um snapshot SQL canônico no instante da validação, não garantem permanência eterna do estado. Configuração concorrente invalida a intenção. Mudanças posteriores nos módulos reaparecem como pendências; não reescrevem etapas silenciosamente. Informativa não bloqueia; recomendada exige ciência se não satisfeita; obrigatórias de entrada/saída bloqueiam. Todas/qualquer se aplica dentro de cada grupo sem executar expressões.

Sem movimentação automática: sugestões determinísticas exigem confirmação. Geração de tarefas por regras habilitadas ocorre por ação explícita, em lotes delimitados e idempotentes por origem, sem scheduler externo. Não concluir/reabrir/cancelar tarefas silenciosamente quando outro módulo muda.

Kanban: até 16 etapas ativas, 10 cards iniciais por coluna e paginação por etapa; mobile seleciona uma etapa. Lista: 20 por página, mesmos fatos/filtros/contagens. Configuração tem até 40 etapas incluindo arquivadas. Colunas inativas permanecem consultáveis; “todas” tem teto400cards, com10 por coluna não arquivada, e não somente as16ativas para entrada. Transferência de etapa ocupada tem prévia, digest e confirmação de lotes de até 100; etapa fica inativa durante retirada e só é arquivada quando vazia, respeitando condições de cada aluno. Nenhum tratamento silencioso.

Reutilizar sessão opaca, entitlement, Origin, JSON limitado, HMAC/rate, shell, memória de filtros, proteção de alterações não salvas, estilos/controles e páginas canônicas. Drag nativo HTML, com menu acessível equivalente; nenhuma nova dependência.

Eliminação016 remove tarefas, associação e eventos do vínculo aprovado; chaves idempotentes são saneadas/invalidadas. Conta elegível sem carteira remove configuração e histórico restante. Ledger/restore reaplica o mesmo procedimento. Retenção legal/operacional e homologação de infraestrutura continuam pendentes; NO-GO015–017 permanece. Serviços, contratos e financeiro019/020 são pontos de extensão, não implementações desta entrega.
