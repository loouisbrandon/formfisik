# API e persistência — Comunicação 024

Node/Next, sessão opaca profissional confirmada e entitlement SaaS existente. Owner exclusivamente da sessão, nunca do payload. GET/POST `/api/communication`; sem endpoint público, JWT, token de aluno ou método de envio. Respostas private/no-store/Vary Cookie/no-referrer/nosniff; erros estáticos. Origin estrito em POST, JSON até 32 KiB/15s, schemas strict; GET120/POST40 por minuto/profissional com HMAC. Detalhes somente sob demanda, sem corpo em logs/eventos.

## Consultas

`view`: contacts, history, record, templates, template, contexts, notifications, indicators, tasks. `page`1..100000; `q` até120; UUIDs validados; filtros desconhecidos recusados. Listas SQL20/total/page/pageSize, ordenação estável e página vazia sem perder total. from/to devem vir juntos, diferença máxima366dias; datas 2000–2100; default90datas em São Paulo.

| Consulta | DTO e limites |
| --- | --- |
| contacts | Nome/situação, total e última data de contato declarado e pendências CRM; sem contatos cadastrais/textos/saúde. state active/archived/all, recent all/recent/stale; último contato DESC NULLS LAST/nome/id |
| history | Exige studentId próprio; id/kind/channel/instante/criação/correção/current, sem corpo. kind all/prepared/external_declared e canal. Instante DESC/criação DESC/id |
| record | Exige id próprio; corpo, referência mínima, proveniência de modelo e contexto reautorizado. deliveryState not_sent/declared_only; externalSentAt/deliveredAt/recipientReadAt sempre null neste marco |
| templates/template | Lista id/title/version/archived, nome/id; corpo somente no detalhe proprietário. state active/archived/all |
| contexts | Aluno obrigatório, contextKind whitelist e páginas de20. IDs/versão/rótulo mínimo; nada de documento/medidas. Avaliação exige assessmentAuthorized=yes antes da consulta |
| notifications | Projeção atual, chave determinística/owner-aluno/contexto/tipo/data/leitura profissional; unread all/yes. Data DESC/chave; sem conteúdo de saúde ou corpo da mensagem |
| tasks | Projeção mínima das tarefas CRM pending/in_progress não arquivadas; prazo/id. Escritas delegadas aos serviços canônicos |
| indicators | Agregações SQL, sem carteira/histórico completo no browser. Período, contatos declarados, preparados, pendências atuais, avisos atuais não lidos, ausência de contato há30dias |

Contextos têm owner/aluno/ID/versão revalidados; UUID sozinho não autoriza. Fonte indisponível no detalhe não vira cópia. Referências de agenda/avaliação indicam versão no instante do registro e podem abrir fonte atual; não alegam snapshot de dados sensíveis. Check-in refere revisão da resposta ou solicitação sem primeira resposta.

## Comandos

| action | Contrato |
| --- | --- |
| template_save | operationKey, id/version se edição, fields{title,body}; criação/edição e snapshot na mesma transação |
| template_archive | operationKey,id/version,archived; arquivar/reativar com snapshot e versão otimista |
| preview | fields do registro; renderização e digest, sem persistir registro |
| record_save | operationKey, mesmos fields,digest,confirmed:true; revalida prévia, insere registro imutável e auditoria |
| notification_read | operationKey,sourceKey; revalida aviso da carteira atual, recibo profissional único, não entrega externa |
| task_save | operationKey,studentId,fields do taskFields018; delega saveTask e initializeCrm |
| task_status | operationKey,id/version,status; delega taskStatus018, sem regra paralela |

Fields de registro: studentId, kind(prepared/external_declared), channel(email/whatsapp/phone/in_person/other), occurredAt ISO ou null para preparado, body, templateId/templateVersion nulos ou par válido, context nulo ou {kind,id,version,assessmentAuthorized,assessmentPurpose}, correctsId nulo ou ponta da mesma natureza/aluno. Avaliação exige atestado explícito e finalidade mínima5/max300, não equivale a base legal homologada. Corpo da versão de modelo deve coincidir com o selecionado; alteração manual remove referência. Preparação usa hora do servidor; contato declarado aceita tolerância de um minuto para relógio, não cria envio agendado.

Variáveis literais permitidas: aluno.nome, profissional.nome, contexto.tipo, hoje. Substituição de uma passagem, sem eval/HTML/expressões ou recursão; conteúdo renderizado também validado, até4000. Credenciais/links individuais reconhecíveis são recusados, sem alegar detecção universal de segredo em texto livre. Não aceitar status de envio/entrega/leitura ou identidade do remetente pelo cliente.

Transações reutilizam ownerLock18018/studentLock/SQL; digests e chaves por intenção. Resultado idempotente só IDs/versão/read, sem conteúdo. Repetição exata confirma mesmo resultado; chave usada para outra intenção ou eliminada409. Prévia desatualizada, correção concorrente e versão divergente409. 400schema/conteúdo,401sessão,403autorização/origem,404registro/contexto,429limite,503dependência. Nenhum sucesso simulado.

## Modelo SQL

Migration024_professional_communication.sql; preserva001–023. communication_templates (rascunho utilizável/versão/arquivo), communication_template_versions (snapshot imutável), communication_records (natureza fixa/canal/texto/instante/autor/template/contexto/correção), communication_reads (chave de aviso/leitura do proprietário), communication_events (IDs/tipo/autor/data sem conteúdo), communication_operations (digest/resultado mínimo/invalidada).

FKs compostas de owner/aluno/modelo; uma correção por ponta, mesma carteira/aluno; runtime sem UPDATE/DELETE de registros/versões/eventos/recibos. Triggers impedem UPDATE de registros/versões; operador016 pode eliminar legitimamente. Recibos únicos por owner/source_key. Avisos não geram cópia de eventos de saúde nem outbox. Templates e versões do profissional só são eliminados no encerramento elegível; pedidos de aluno removem seus registros/referências/recibos/eventos e saneiam retries antes das fontes.

## Contratos futuros — PREPARADOS, não ativos

Entrega externa precisará de intenção autorizada com recordId/owner/identidade legítima do destinatário/canal/preferência e versão da política, idempotência e referência do provedor. Eventos assinados e deduplicados por provedor/eventId deverão distinguir accepted/sent/delivered/read/failed, com instante/origem e reconciliação. Não promover um contato declarado a esse estado. SMTP de identidade não é adapter profissional.

Conversa Connect deverá resolver conversationId e participantes autorizados a partir das identidades autenticadas; remetente vem da sessão, destinatário de vínculo legítimo, nunca coincidência de e-mail. Comando futuro: conversationId/clientKey/texto e attachmentRefs autorizados; histórico paginado, autoria/ordem, revogação de vínculo e bloqueios em cada acesso. Anexos exigirão limites/MIME/antimalware/revogação/retenção próprios. Push depende de autorização/canal/preferências e payload mínimo, sem texto sensível na tela bloqueada. Nenhum desses contratos tem endpoint, tabela de conversa, envio ou credencial ativa no024.
