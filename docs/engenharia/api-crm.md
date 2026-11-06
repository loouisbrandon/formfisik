# Contratos CRM018

Node.js, `/api/crm`, JSON privado `no-store`. Sessão opaca HttpOnly existente; role profissional, e-mail confirmado, conta habilitada e assinatura SaaS autorizada no servidor em toda chamada. Owner vem exclusivamente da sessão. GET120/min e POST60/min por limites existentes; synchronize adicional10/min. Same-origin obrigatório em POST, tamanho máximo32768bytes e leitura limitada15s; schemas strict rejeitam campos desconhecidos. Não usaJWT.

## Leitura GET

`view=board` retorna `{settings,stages,items,portfolio,new_this_month,total,awaiting_response,awaiting_review,workout_pending,open_tasks,overdue_tasks,counts,focus,page,pageSize}`. Configuração e agregações usam transação somente leitura REPEATABLE READ. `mode=kanban` retorna10 por etapa; `mode=list`20 globais. `focus=all|initial|UUID` controla colunas do Kanban. `view=cards&stageId=UUID&page=N` retorna `{items,total,page,pageSize:10}`; list/student retornam resumo paginado20.

Filtros: q até120, stageId/studentId UUID, status active(default)/archived/all; intake all/none/waiting/received/reviewing/reviewed/expired/revoked; workout all/none/draft/active/archived; assessment all/none/recent/old; pending/overdue all/yes/no; from/to YYYY-MM-DD (entrada na carteira, São Paulo), minDays0..36500, sort name/entered/oldest, page1..100000. Sem substring SQL arbitrária; curingas de nome são literais.

`view=tasks` pagina20, filtros studentId, taskStatus all/pending/in_progress/completed/canceled, priority all/low/normal/high/urgent, includeArchived no(default)/yes, q nome ou título, overdue all/yes/no. Não retorna descrição. `view=task&id=UUID` retorna detalhe autorizado com descrição. `view=history` pagina20, filtro studentId e/ou id(tarefa), eventos decrescentes por sequência. `view=settings` consulta configuração. IDs de terceiros não retornam seus dados; detalhes/mutações dão404, listas filtradas vazias.

Card: id do vínculo, full_name/status, stage_id/version/entered_at/days_in_stage, intake/intake_id/intake_submitted_at, workout/workout_updated_at/prescribed, assessment_date/assessment_recent, pending/overdue/required_open/next_due_at. Não contém conteúdo clínico nem contatos. DTO explícito, sem `SELECT *` na projeção pública.

## Comandos POST

Objeto discriminado por `action`. Toda mutação persistida requer operationKey UUID. Repetição mesma intenção retorna resultado anterior sem duplicar evento; intenção divergente ou operação invalidada por exclusão dá409. Não há idempotência falsa baseada em frontend. Revisões positivas inteiras.

| action | Demais campos | Resultado |
| --- | --- | --- |
| stage_save | boardVersion, id? UUID, fields{name,description,color,active,operator,rules} | {id} |
| stage_order | boardVersion, ids UUID[] exatos de todas as etapas não arquivadas | {saved:true} |
| settings | boardVersion, initialStageId, recentDays1..365, autoReview/autoWorkout/autoAssessment boolean | {saved:true} |
| move_preview | studentId,to; sem operationKey | {studentId,version,boardVersion,from,to,allowed,recommendationRequired,results} |
| move | boardVersion,studentId,version,to,acknowledgedRecommendations boolean,confirmed:true | {studentId,version} |
| archive_preview | stageId,to?; sem operationKey | total,batchSize,remaining,allowed,recommendationRequired,digest,boardVersion,sample10,evaluations10,blockers agregados |
| stage_archive | boardVersion,stageId,to?,digest,acknowledgedRecommendations,confirmed:true | {archived,moved,remaining} |
| task_save | studentId,id?/version?,fields{title,description,priority,dueAt ISO offset ou null,required} | {id} |
| task_status | id,version,status | {id} |
| task_archive | id,version | {id} |
| synchronize | boardVersion,after? UUID | {created,scanned,next UUID ou null} |

Paleta lime/blue/violet/amber/rose/slate; operator all/any; até24 regras sem repetição key+mode. Regras/chaves e semântica: [módulo](../modulos/crm.md). `days` opcional1..365 sobrescreve janela de avaliação daquela condição. Arquivo ocupado ocorre em lotes100 e valida digest e condições atuais; nunca cascata silenciosamente os cards.

## Erros, concorrência e privacidade

400 entrada inválida/Origin,401 sessão ausente,403 acesso/conta/assinatura,404 recurso não próprio,409 versões/estado/chave/prévia obsoletos,422 condição/recomendação/limite,429 abuso,503 indisponibilidade. Mensagens públicas estáticas em português; sem exceçõesSQL/dados pessoais. Resposta de autorização pode indicar destino interno existente. Frontend mantém campos e exige revisão/revalidação após conflito, sem tentar forçar a gravação.

Advisory lock por proprietário18018 e versões serializam a configuração, movimentos e tarefas; criação008 adquire813008 antes18018; inicialização mantém mesma ordem. Eventos e chave de repetição pertencem à mesma transação da alteração. Domínios canônicos são lidos do PostgreSQL, sem reimplementar suas transições. Validação descreve o instante observado: uma anamnese ou treino pode mudar posteriormente. Não há garantias de sincronização externa.

Runtime não pode apagar tarefas/eventos ou alterar eventos; migrador/worker de privacidade são separados. Política de finalidade/retenção/exclusão: [módulo](../modulos/crm.md). Sem endpoint público, exportação pública ou token CRM.

## Contratos adicionais019

Card recebe contract_count inteiro e flags contract_active,contract_near,delivery_pending,delivery_overdue,service_completed. Condições aceitam esses seis conceitos por chaves contract_exists/contract_active/contract_near/delivery_pending/delivery_overdue/service_completed; nenhuma regra anterior é reescrita. Sem preço, conteúdo comercial completo ou dados clínicos no DTO. Consulta canônica agregada em SQL com proprietário, reutilizando serviços019; não executa requisição HTTP por card. Semântica no [módulo019](../modulos/servicos-e-consultorias.md).

## Campos mínimos022

Card acrescenta checkin_overdue/checkin_review (contagens) e UI aponta para agenda de check-ins do vínculo. Não inclui valores de escalas, notas ou respostas. Regras de movimentação e condições de anamnese não são alteradas.
