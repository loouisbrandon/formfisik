# API de serviços e consultorias 019

Node.js, GET/POST /api/consultancies. Sessão opaca confirmada, conta profissional habilitada, entitlement canônico e propriedade em toda chamada, sem JWT. Origin/JSON em POST, body máximo 98304 bytes/deadline 15 s; schemasstrict rejeitam campos desconhecidos. GET 120/min, POST 40/min/profissional. Respostas private/no-store/no-referrer, DTOs mínimos e mensagens estáticas; sem conteúdoSQL/cookies/credenciais em logs.

## Leituras

Querystrict: view services/service/plans/plan/contracts/contract/deliveries/delivery/history/evidence/indicators/billing; page 1..100000; id/studentId/serviceId/contractId UUID; revision inteiro positivo até 1000000; q 120; archive active(default)/archived/all; category all ou enum de serviço; status all ou estado administrativo/entrega; near/overdue all/yes/no; from/to datas de início; evidenceType workout/assessment/intake. Períodos invertidos são 400.

| view | Resultado e escopo |
| --- | --- |
| services/plans | items,total,page,pageSize:20. Catálogo resumido; plano traz preço/disponibilidade/serviço/revisão, sem condições/obrigações completas |
| service/plan +id | id,fields,version,archived,versions,selectedRevision. Plano inclui service_name atual do serviço relacionado. Definição somente no detalhe; revisões de plano paginadas 20; revision carrega somente a revisão escolhida |
| contracts | Página 20 com nome atual do aluno, nome do plano/serviço acordado, datas/status/versão/preço/quantidades/flags e IDs; sem observações ou agreement |
| contract +id | Acordo, observações e lineage previous_id/next_id autorizados, lista 20 de metadados das versões. revision solicita explicitamente version/document histórico em selectedRevision; nenhum documento de outra carteira |
| deliveries | Página 20 com obrigação, quantidade executada vigente, data/status/versão e contexto mínimo de aluno/acordo |
| delivery +id | Definição e 20 execuções, inclusive invalidadas; evidencia mínima/versão/data e evidence_current boolean/null, sem dados clínicos |
| evidence +id(entrega) |20 candidatos da vigência/aluno da obrigação, tipo selecionado. id,name,date,version; sem medidas, respostas ou conteúdo de prescrição |
| history |20 eventos decrescentes, filtro studentId e/ou id de serviço/plano/contrato/entrega; autor é o proprietário por constraint |
| indicators | Contagens filtradas e 5 serviços mais contratados, sem soma de receitas |
| billing +id | Contrato interno somente leitura para 020, administrativeOnly=true/paymentImplemented=false; [fronteira](../estrategia/diretrizes-financeiro-profissional.md) |

Propriedade deriva exclusivamente da sessão. Detalhe de terceiro/desconhecido 404; listas filtradas não retornam dados alheios. Datas retornamYYYY-MM-DD; moedaBRL, centavos inteiros. Ordenação/contagens/páginas vazias: [módulo](../modulos/servicos-e-consultorias.md).

## Mutações

Toda gravação tem operationKey UUID. Mesma chave+intenção repete resultado; intenção divergente ou chave invalidada após eliminação 409. Edição/transição exige version positiva atual. confirmed:true representa confirmação administrativa, não assinatura jurídica.

| action | Campos adicionais |
| --- | --- |
| service_save | id?/version?, fields{name,description,category,channel,commercialNotes}, duplicateFrom? |
| plan_save | id?/version?, fields{serviceId,name,description,priceCents,duration,unit,sessions,conditions,available,billingIntent,deliveries}, duplicateFrom? |
| catalog_archive | entity service/plan,id,version,archived boolean,confirmed:true |
| contract_save | id?/version?, fields{studentId,planId,planVersion,start,agreedPriceCents,sessions,administrativeNotes}, previousId?/previousVersion? para renovação, allowOverlap boolean,confirmed:true |
| contract_state | id,version,state draft/active/suspended/completed/canceled,reason até 1000,confirmed:true; transições inválidas são 409 |
| delivery_change | id,version,operation start/cancel/reopen/execute,reason até 1000,units?1..1000,evidence?{type,id,version},confirmed:true |

Resultados de criação/transição id/version; operações de aluno podem retornar studentId mínimo para vínculo da chave de repetição/eliminação. Serviços/planos não fazem vínculo público com aluno. O payload de execução tem action=delivery_change e operation separado.

Categorias online/onsite/session/assessment/workout/custom; channel online/onsite/hybrid. Plano até 30 obrigações com ID estável único, nome/descrição/tipo/quantity/required e deadline mode relative/days 0..3660 ou absolute/date; ordem é a posição do array. Tipos workout/assessment/intake/session/followup/feedback/custom. billingIntent unspecified/one_off/recurring apenas pretendido. Limites/preço/duração/semântica: módulo.

## Transações e erros

Lock profissional 18018 compartilhado com CRM, lock de vínculo e versões otimistas. Snapshot, obrigações, auditoria e chave na mesma transação. Evidências são validadas no servidor e fontes bloqueadas para leitura durante execução. Versão de plano escolhida deve ser atual, não misturar revisão/preço/obrigações em concorrência. Renovação única por predecessor e snapshot do acordo anterior preservado. Sem cache de autorização ou sucesso simulado.

400 entrada/Origin/tipos/datas,401 sessão,403 conta/assinatura,404 recurso não próprio,409 versão/chave/estado/duplicidade,422 quantidade/condição/prazo/evidência,429 abuso,503 dependência. Código interno estático acompanha conflitos conhecidos. Frontend preserva campos, solicita revisão/recarregamento e não força gravação.

Runtime não altera versões ou eventos, nem unidades/evidência de execuções persistidas. Pode apenas invalidar execução com motivo ao reabrir e substituir obrigações de rascunho sem execução; worker de privacidade separado apaga os escopos aprovados. Nenhum endpoint financeiro, público ou de eliminação.

Histórico de um acordo também inclui o evento de criação de sua renovação sucessora, sempre filtrado pelo proprietário. O detalhe de plano mantém visível o serviço relacionado; snapshots antigos continuam independentes desse nome atual.

## Compatibilidade021

Agenda compartilha invariantes de execução manual019 numa transação única: realização+uma unidade explícita, versão, mesmo aluno/contrato e vigência na data efetiva. Endpoint019 mantém seu guard de data atual. Correção explicitamente autorizada invalida somente a execução vinculada e recalcula estado; não altera pagamentos020. Ver [API agenda](api-agenda.md).

## Fronteira022

Submissão/revisão de check-in não é evidência intake nem execução de obrigação. Tabelas separadas e filtro de finalidade no catálogo impedem contaminar fatos017. Nenhuma escrita automática em019/020.

## Extensão aditiva — central comercial novembro/2026

`indicators` mantém os filtros existentes e acrescenta:

- `renewals: number`: próximas/expiradas sem sucessora do mesmo proprietário;
- `drafts: number`: contratações em rascunho;
- `delivery_summary: {type,total,completed}[]`: contagem de obrigações por tipo em acordos fora de rascunho/concluídos/cancelados, ordenada por tipo; até sete grupos, sem conteúdo de evidências.

A projeção de contratação inclui `has_successor:boolean`, derivada apenas dos acordos do proprietário. Busca de `contracts`/`indicators` passa a incluir `service_name` do snapshot acordado. Nenhuma mutação, autorização, tabela, migration, estado persistido ou contrato financeiro foi alterado.

A visão geral solicita indicadores sem filtros da tabela e contratos com seus próprios filtros, deixando explícitos os dois escopos. Leituras são canceladas quando obsoletas e busca usa debounce de 200 ms. Respostas mantêm no-store e DTOs mínimos já existentes.
