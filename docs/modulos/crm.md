# CRM profissional — Entrega018

Estado: IMPLEMENTADO LOCALMENTE; verificação e limites no [relatório018](../engenharia/entrega-018.md). Produção BLOQUEADA pelo NO-GO015–017. FormFisik é empresa independente fundada por Brandon Louis; não se presume constituição jurídica formalizada.

## Finalidade e jornada

Organizar o ciclo operacional dos vínculos privados da carteira existente. `/crm` usa ProfessionalShell; o perfil administrativo oferece `/alunos/{id}/crm`. Sessão opaca, profissional confirmado e entitlement canônico são exigidos no servidor, inclusive em toda API. Não cria outra identidade, assinatura, treino, avaliação, agenda ou contrato.

Primeiro acesso inicializa seis etapas reais e associa os vínculos existentes à primeira, com data da inicialização. Novos alunos manuais008 e por convite017 são associados atomicamente quando o CRM já existe. Inicialização anterior ao primeiro cadastro também funciona. A configuração inicial futura não movimenta vínculos anteriores. Inativação de aluno preserva consulta/histórico, mas impede movimentação e edição/conclusão de tarefas; arquivamento operacional explícito continua possível.

Etapas iniciais: Novo aluno; Aguardando anamnese; Preparação de treino; Pronto para atendimento; Em acompanhamento; Atendimento concluído. Avaliação pendente e atenção são indicadores/tarefas, evitando colunas redundantes. Nomes, descrição, cor da paleta, ordem, atividade e regras são editáveis. Etapa inicial deve ser ativa e não pode ser arquivada. Até16 ativas e40 totais incluindo arquivadas; nomes únicos entre não arquivadas, ignorando caixa/espaços repetidos.

## Movimentação e condições

Arrastar ou usar “Mover etapa” abre o mesmo diálogo com prévia no servidor. Confirmação explícita, versão do atendimento e versão do quadro são obrigatórias. O backend reavalia fatos canônicos; alterações concorrentes do quadro/posição dão409, sem sobrescrever. Mesma chave e intenção repetem resultado; chave reutilizada com outra intenção dá409. Falha da auditoria desfaz toda a transação.

Condições: anamnese solicitada/respondida/revisada; treino prescrito/ativo/pendente; avaliação registrada/recente/pendente; tarefas obrigatórias concluídas/abertas/vencidas. Solicitada exige último convite não expirado/revogado; respondida inclui recebida/em revisão/revisada. Prescrito significa existência histórica de versão ativa, não rascunho. Treino pendente significa ausência de ficha ativa. Avaliações consideram registros ativos e data em São Paulo; recente é idade menor que a janela, padrão30dias. Pendência não é conclusão clínica.

Cada regra é informativa, recomendada, obrigatória de entrada ou de saída. Obrigatórias de saída pertencem à etapa atual; demais à destinatária. Operador todas/qualquer aplica separadamente em cada grupo; ausência de grupo não bloqueia. Informativa nunca bloqueia; recomendada pendente exige ciência; obrigatória pendente bloqueia. Não há bypass ou movimentação automática. São fatos do instante de validação, não garantia contínua após mudanças nos outros módulos.

Arquivar etapa ocupada requer prévia, destino ativo e confirmação com digest. Processa até100 vínculos por lote, inclusive alunos arquivados, sem ignorar condições. Mostra contagem, amostra10 e motivos agregados. Etapa fica inativa durante retirada e só arquiva vazia; histórico permanece. Se houver mudanças, preparar nova prévia. Não existe exclusão destrutiva de etapa.

## Tarefas e histórico

Aluno e responsável (profissional proprietário) obrigatórios. Título120, descrição operacional1500, prioridade baixa/normal/alta/urgente, prazo opcional em horário do dispositivo, indicador obrigatória. Não registrar dados clínicos em texto livre. Estados: pendente, em andamento, concluída ou cancelada; concluída/cancelada podem reabrir para pendente. Conclusão registra data; reabertura remove data corrente e preserva evento. Arquivo preserva consulta e histórico, excluindo pendência atual. Cancelar uma tarefa obrigatória NÃO equivale a concluí-la; somente conclusão ou arquivo explícito remove essa obrigação das condições.

Geração por regras é opcional e desativada inicialmente. Após habilitar origens em configuração, “Gerar tarefas configuradas” reconcilia até100 alunos por passagem/página: revisão por solicitação recebida/em revisão; elaboração por aluno sem treino ativo; avaliação por aluno e última data registrada. Origem única impede duplicação, inclusive após concluir/cancelar/arquivar. Nova anamnese ou nova data de avaliação cria nova origem; mudanças de estado não concluem/reabrem tarefas automaticamente. Não há scheduler. O usuário confirma necessidade e pode repetir a passagem explicitamente.

Eventos mínimos registram autor, instante, aluno/tarefa/etapas quando aplicável, origem e resultados das condições; não copiam nomes, respostas ou medidas para a tabela de eventos. Listagem junta somente nome atual autorizado. Histórico de eventos20/página com ordenação decrescente por sequência, não histórico jurídico imutável externo.

## Consultas e indicadores

Kanban10 cards por etapa, até400 na primeira resposta em “todas” (40etapas não arquivadas, incluindo inativas; até16 ativas para entrada), páginas substituídas sob demanda. No celular, etapa inicial em foco; seleção explícita de outra etapa/todas. Lista20 por página; tarefas/histórico20. Consultas filtram e paginam no PostgreSQL; não carregam milhares para esconder no cliente. Página vazia retorna total e items vazio, preservando filtros e navegação. Leituras obsoletas são canceladas.

Filtros combinam nome literal sem distinguir caixa, etapa, situação do aluno, estado da última anamnese, treino, avaliação recente/antiga/ausente, tarefas abertas/vencidas, período de entrada na carteira, dias na etapa. Ordenação nome, entrada recente ou maior permanência, sempre com desempate UUID. Texto acentuado não é transliterado. “Etapa em foco” organiza colunas; filtro “Etapa” restringe os resultados. Lista respeita filtros e não carrega cards ocultos de Kanban.

Indicadores: carteira ativa e novos no mês são globais do profissional; total filtrado, aguardando resposta/revisão, sem treino ativo, tarefas abertas/vencidas e quantidade/tempo médio atual por etapa respeitam filtros. Média representa permanência dos vínculos atualmente na etapa, não duração histórica/conversão. Arquivados só entram nas contagens filtradas quando solicitados. Cards exibem nome, status operacional, última data de avaliação e tarefas agregadas; sem contatos, respostas, medidas, fotos ou descrição de tarefa.

## Dados, acesso e retenção

Migration018: crm_stages, crm_settings, crm_memberships, crm_tasks, crm_operations e crm_events, FKs compostas de propriedade, índices por etapa/prazo/histórico e índice canônico da última anamnese. Nenhuma duplicação dos conteúdos017/010/012. [ADR019](../arquitetura/ADR-019-crm-operacional.md), [API](../engenharia/api-crm.md).

Finalidade é organização do atendimento pelo proprietário. Sem compartilhamento com outro profissional, aluno público, Onebase ou provedor de pagamentos. Reter enquanto o vínculo for necessário e conforme política a aprovar; não existe prazo jurídico definitivo ou expurgo agendado novo. Textos livres e datas operacionais são dados pessoais e podem revelar contexto de saúde. Minimização não os anonimiza.

Exclusão016 aprovada de aluno remove associação, tarefas e eventos correspondentes e invalida resultados/digests de operações individuais e cursores associados. Exclusão elegível do profissional remove todo o CRM, preservando bloqueios financeiros/terceiros existentes. Ledger e replay restauram exclusão depois de backup. Etapas/configurações são compartilhadas entre alunos do mesmo proprietário; não são removidas ao apagar um aluno. Não incluir PII nesses nomes/descrições. Backups e atendimento de direitos continuam dependentes de homologação operacional015/016.

Nenhum pagamento profissional, contrato comercial, WhatsApp automático, Connect ou mobile foi implementado. Próximo marco019 exige autorização própria.

## Ampliação019 — fatos comerciais

O escopo descrito acima corresponde à018. A019 passa a implementar [serviços/consultorias](servicos-e-consultorias.md) em módulo próprio e integra consulta/links, sem segundo Kanban. Seis condições novas opcionais: contract_exists, contract_active, contract_near, delivery_pending, delivery_overdue e service_completed. Mesmos operadores/efeitos de regras, sem modificar padrões ou regras existentes. Até24 regras por etapa permanece.

Existe contratação inclui rascunhos/terminais; ativa exige estado ativo e data atual na vigência; próximo do fim considera ativa/suspensa entre hoje e30dias. Entregas pendentes/atrasadas consideram acordos ativos/suspensos mesmo quando a vigência expirou, evitando ocultar trabalho. Atendimento concluído é existir acordo concluído, não toda a carteira. Cards recebem contagem/flags sem preço/acordo/resposta/medidas e link para subárea do aluno. Não movimenta etapa nem conclui tarefas automaticamente. [API019](../engenharia/api-consultorias.md), [relatório019](../engenharia/entrega-019.md). Financeiro020 continua não implementado.

## Fronteira financeira020

A inadimplência financeira não movimenta etapas, cancela019 nem suspende treinos automaticamente. Condições019 existentes continuam canônicas. O financeiro fica em /financeiro; novas regras de acesso/cobrança dependem de decisão de produto explícita.

## Projeções da agenda021

Cards recebem próximo atendimento e flag de presença pendente, calculados das ocorrências canônicas da carteira. Link abre agenda contextualizada. Sem notas, local privado, mudança automática de etapa, presença ou efeito financeiro.

## Projeções022

Cards agregam checkin_overdue e checkin_review e link para contexto do aluno. Sem respostas/notas/desconforto ou movimentação automática; condições de anamnese018/019 preservadas. Histórico022 não se transforma em tarefas/obrigações automaticamente.

## Integração024

Central profissional reutiliza tarefas e transições018 para pendências; não cria segunda fila nem altera etapas automaticamente. Card oferece acesso contextual, sem corpo de comunicação ou dados de saúde. [Comunicação](comunicacao.md).
