# Agenda profissional — Marco 021

Estado: IMPLEMENTADO E VERIFICADO LOCALMENTE, GO controlado conforme relatório021. Não homologado em produção. A FormFisik é empresa independente, fundada por Brandon Louis; não se presume formalização jurídica.

## Uso e navegação

`/agenda` utiliza ProfessionalShell. No aluno, `/alunos/[id]/agenda` mantém o contexto da carteira. Configure disponibilidade antes do primeiro atendimento: inicialmente nenhuma faixa é concedida. Compromissos pessoais podem ser registrados fora do expediente, mas continuam respeitando reservas e bloqueios existentes. Desktop inicia na semana; mobile inicia no dia. Semana e mês mostram resumos diários e permitem selecionar a lista detalhada de uma data. Listas e históricos usam páginas de 20, ordenação estável e contagem; páginas vazias não inventam registros. Filtros/data/visão são preservados na memória privada da navegação. Formulários avisam antes de descartar alterações e não dependem de arrastar.

Disponibilidade possui fuso IANA, sete dias e até oito faixas por dia. Intervalos são locais e não sobrepostos, com fim exclusivo; divida uma faixa que atravessa meia-noite nos dois dias. Exceção substitui a disponibilidade da data; nenhuma faixa significa indisponibilidade. Férias são bloqueios com início/fim, até 366 dias. Compromisso pessoal não tem aluno. Alterar configuração nunca cancela reservas existentes.

Tipos reutilizáveis possuem nome, descrição operacional, duração de 5–720 minutos, modalidade, local opcional e intervalos antes/depois de até 240 minutos. Arquivamento impede novas reservas; snapshots preservam a duração e os intervalos antigos. Não inserir informações clínicas ou endereços privados na descrição reutilizável.

## Agendamento e recorrência

Selecione aluno ativo da própria carteira e tipo ativo. Contrato019 é opcional; obrigação, quando selecionada, deve pertencer ao mesmo contrato/aluno/profissional e ser uma sessão pendente ou em andamento. A prévia mostra datas, conflitos e meses pulados. Confirmação exige revisão explícita e refaz todas as validações na transação. Não há sobreposição forçada.

Recorrência semanal, quinzenal ou mensal, terminando por quantidade ou data: até 100 ocorrências e horizonte de 12 meses. Os limites são cumulativos. Mensal no dia 31 pula meses sem esse dia; não desloca a data. A UI pagina a prévia limitada em grupos de 20. Gravação é integral ou nenhuma ocorrência é criada.

Remarcação de uma ocorrência preserva as demais; esta e futuras substitui apenas futuras agendadas, com justificativa, prévia nova e histórico. Passadas e finalizadas não são remarcadas. Cancelamento de uma/futuras preserva linhas e histórico. Cancelamento a até 24 horas do início, ou depois, é classificado como tardio, sem multa automática.

Instantes são inequívocos, com referência de fuso/data/hora local. Horário inexistente é recusado; horário ambíguo exige primeira ou segunda ocorrência. Duração e intervalos representam tempo decorrido. Datas civis suportadas: 2000–2100. Ver [ADR022](../arquitetura/ADR-022-agenda-canonica.md).

## Comparecimento e execução contratual

Estados persistidos: agendado, realizado, ausente e cancelado. Em andamento e presença pendente são projeções; o relógio não registra presença. Registro efetivo deve estar dentro do atendimento reservado e não no futuro; autoria e instante do registro são separados. Correção de estado final exige motivo.

Realização não cumpre automaticamente obrigação019. Uma confirmação adicional permite registrar realização e uma unidade contratual na mesma transação, com versão atual e vigência na data efetiva. Campo comercial `sessions` não vira saldo. Repetir a mesma tentativa não duplica execução. Correção para ausência/agendado exige confirmação explícita para invalidar somente a execução vinculada, preservando outras unidades e recalculando a obrigação. Contratos concluídos/cancelados exigem revisão019. Não há efeito financeiro020.

## Indicadores e limites

Contagens canônicas de sessões, realizadas, ausências, cancelamentos e pendências; horas reservadas e ocupação. Ocupação usa disponibilidade atual, inclui preparação e compromissos pessoais e desconta bloqueios do denominador. Não representa receita nem capacidade histórica contratada. Consultas gerais abrangem até 367 datas; calendário até 43. Agregações ocorrem no servidor; não são enviados milhares de documentos para ocultação no browser.

Notas/local e título pessoal são restritos ao detalhe autorizado. CRM recebe somente próximo atendimento e flag pendente. [API/modelo](../engenharia/api-agenda.md), [privacidade](../privacidade/agenda.md), [calendários futuros](../operacao/calendarios-externos.md).

## Agenda visual — novembro/2026

A visão semanal agora apresenta grade temporal, mini calendário lateral e cartões reais. Dia usa a mesma grade; mês mantém resumos diários e abre o dia escolhido. Hoje, período anterior/próximo e data explícita preservam a navegação em memória. O dia atual é destacado no fuso configurado; a linha do relógio atualiza a cada minuto e não registra presença.

Clique num horário de meia em meia hora abre o editor existente com data/hora preenchidas. Setas para cima/baixo percorrem horários de cada coluna; Enter abre. Confirmar continua exigindo prévia, revisão e validação no servidor. Não há drag-and-drop nem gravação por clique na grade. Cartões abrem o detalhe sob demanda. Ocorrências atravessando meia-noite são recortadas por dia civil; sobreposições visuais (inclusive cancelados) usam colunas distintas.

A grade consulta a lista existente por período, 20 compromissos por página, com total e navegação explícitos. Acima de 20, avisa que a grade está incompleta e orienta consultar demais páginas. A lista textual progressiva compartilha a página/filtro. Filtro de situação ativo permanece explícito acima da grade e pode ser removido. Filtros laterais são apenas visuais na página carregada; não modificam conflitos ou disponibilidade. Disponibilidade verde representa configuração, não garantia de vaga livre. O servidor continua verificando todas as reservas.

Horários 07h–20h por padrão; registros e faixas anteriores/posteriores expandem a escala, com rolagem inicial às 07h. Dia é o padrão mobile; semana pode rolar horizontalmente dentro da grade. Shell, cabeçalho e navegação permanecem independentes. Temas claro/noturno usam tokens do workspace.

## Agendamento em modal — refinamento de 05/11/2026

O botão Novo agendamento, as datas da grade diária/semanal/mensal e os slots de horário abrem `AppointmentDialog` sobre a agenda, sem navegação de rota. Slots preservam data e início escolhidos; o mini calendário e os controles de período continuam servindo à navegação. Remarcações reutilizam o mesmo modal. Após uma nova reserva confirmada, o modal fecha e a agenda mostra a data salva; remarcação retorna ao detalhe autorizado.

Atendimento exige aluno e tipo reais selecionados pelos seletores paginados. Bloqueio mantém término/data final e natureza distinta. Disponibilidade abre a exceção por data existente em modal e informa que suas faixas substituem a regra semanal; não cria um atendimento. Notas, vínculo contratual, recorrência, fuso, ambiguidade de horário e compromisso pessoal continuam acessíveis em Mais opções. APIs, autorização, persistência, digest da prévia, idempotência e regras de conflito não foram alterados.

Referência visual fornecida pelo fundador em `Novo agendamento sobre calendário semanal.png`. Nenhum nome, fotografia ou compromisso dessa imagem foi inserido nos dados da carteira.


### Correção de disponibilidade — 05/11/2026

Disponibilidade semanal/exceção limita **atendimentos**, incluindo preparação/deslocamento. Compromissos pessoais e bloqueios não dependem de faixas de atendimento; continuam sujeitos a sobreposição, isolamento de proprietário, validação temporal, prévia, confirmação e concorrência. Não há disponibilidade ilimitada criada automaticamente.

Na primeira agenda sem faixas, o modal orienta a configurar a disponibilidade por data. Uma prévia impedida mostra os motivos e a ação de correção, em vez de apresentar um checkbox desabilitado sem saída. O checkbox de confirmação aparece somente quando a prévia é permitida. Não há botão para forçar conflito. Se for necessário sair para configurar a data com rascunho alterado, o aviso de descarte existente continua obrigatório.


Refinamento de 05/11/2026: o nome cadastrado de bloqueio/indisponibilidade aparece nos cartões e na lista da agenda do profissional proprietário. O DTO de lista inclui esse título; local e notas permanecem no detalhe autorizado. Isso não compartilha o nome com alunos, CRM ou calendários externos. Títulos de compromissos pessoais continuam apresentados por categoria na lista.

## Detalhes em modal e movimentação — 05/11/2026

Cartões e itens da lista abrem detalhes em modal; edição/remarcação, comparecimento, cancelamento e histórico continuam no contexto da agenda. Não há leitura de detalhe para todos os cartões: o detalhe autorizado é solicitado ao abrir ou iniciar a movimentação.

Cartões agendados e ainda não iniciados podem ser arrastados na grade diária/semanal. O ghost acompanha o cursor, o destino é marcado em incrementos de 15 minutos, e manter o ponteiro nas setas troca o período. Rolagem da grade permite alcançar horários fora da área visível. Para datas distantes, uso por teclado ou alternativa ao arraste, os detalhes oferecem “Mover para outra data e horário”. Eventos já iniciados/finalizados continuam protegidos pelas regras canônicas, sem bypass de remarcação.

Soltar solicita detalhe e compara a versão exibida com a versão atual. A justificativa é obrigatória em toda remarcação pela regra existente, inclusive pessoal e bloqueio. Depois dela, a prévia do servidor verifica disponibilidade para atendimento, intervalos, ocupação e contrato. Só então há confirmação explícita; arraste não atualiza o banco por si. Cancelar ou conflito mantém o registro original. Retry após resposta perdida conserva a chave idempotente; versões divergentes exigem atualizar a agenda.

Movimento atua somente nesta ocorrência, sem deslocar implicitamente a série. Duração decorrida de bloqueios é preservada, incluindo múltiplos dias; atendimentos seguem a duração canônica do tipo na prévia. Destino é interpretado no fuso da grade e convertido ao fuso original da ocorrência; horários inexistentes/ambíguos exigem revisão. Intervalos de bloqueio que não possam representar a duração com a escolha de horário disponível são recusados, sem ajuste silencioso. Campo duration de bloco usa valor compatível com o schema, pois sua duração real é determinada pelo início/fim; isso também corrige edição de bloqueios superiores a 12 horas.

Não houve nova migration, endpoint, dependência, sincronização externa, pagamento ou cumprimento contratual automático.
