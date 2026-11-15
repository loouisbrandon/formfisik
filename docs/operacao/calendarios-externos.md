# Calendários externos — contrato futuro, sem integração ativa

Marco021 prepara decisões e contratos documentais. Não há OAuth, autorização Apple, credenciais, tabelas externas, workers, webhooks, importação, publicação, botão funcional ou chamada às APIs. Atendimentos internos são canônicos. Qualquer implementação futura requer entrega e homologação próprias.

## Capacidades verificadas e limites

Google Calendar documenta eventos com id, etag, iCalUID, recurringEventId/originalStartTime, data/hora e fuso; término exclusivo. Sincronização incremental usa nextSyncToken; expiração410 exige ressincronização completa. FreeBusy fornece intervalos ocupados mediante autorização pertinente. Fontes oficiais: [eventos](https://developers.google.com/workspace/calendar/api/v3/reference/events), [sincronização](https://developers.google.com/workspace/calendar/api/guides/sync), [FreeBusy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query). Capacidade do provedor não equivale a integração FormFisik implementada.

Apple descreve autorização da Conta Apple em aplicativos de terceiros compatíveis e, em outros casos, senhas específicas de aplicativo; revogação interrompe o acesso. [Orientação oficial Apple](https://support.apple.com/en-il/121539). Interoperabilidade técnica, elegibilidade/autorização e suporte CalDAV para o produto precisam de prova específica antes da escolha. Não presumir API REST pública equivalente à Google nem confundir Sign in with Apple com acesso a calendários. Não coletar senha principal. Implementação e armazenamento de qualquer credencial permanecem não autorizados.

Microsoft Graph documenta evento/changeKey e rastreamento delta para calendário. [Evento](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0), [delta](https://learn.microsoft.com/en-gb/graph/api/event-delta?view=graph-rest-1.0). Escopos, consentimento, limites e estratégia de notificações deverão ser validados na entrega específica; nada disso está ativo.

## Contrato interno proposto

| Campo conceitual | Regra futura |
| --- | --- |
| provider | google, icloud, microsoft ou adaptador validado; não inferir pelo e-mail |
| connectionId / ownerId | Identidade opaca da conexão e proprietário autorizado |
| externalAccountId / calendarId | Identidade do provedor, calendário explicitamente selecionado |
| occurrenceId / externalEventId | Relação entre ocorrência canônica e projeção externa; unicidade por conexão/calendário/ocorrência |
| internalVersion / externalVersion | Versão interna e ETag/changeKey equivalente para escrita condicional |
| cursor | Token de sync/delta opaco, protegido e limitado à conexão/consulta |
| state | pending, synced, retrying, conflict, revoked ou disconnected; nunca significa comparecimento |
| operationKey / lastAttempt | Idempotência estável por operação/versão, tentativas e diagnóstico sem payload privado |

Contrato documental, sem criar tipos exportados ou tabelas sem consumidor. Não publicar notas, informações clínicas ou endereço privado por padrão. Metadados mínimos devem ter política explícita de finalidade/acesso/retenção e credenciais somente no servidor cifradas/geridas com revogação.

## Dois fluxos separados

1. Publicar atendimento interno: usuário escolhe calendário, revisa dados mínimos e autoriza projeção. Criação/alteração usa versão e idempotência; mudança externa concorrente abre conflito explícito, sem last-write-wins silencioso. Exclusão externa não elimina ocorrência interna; permite republicar ou desfazer somente o vínculo.
2. Importar ocupações: armazenar ocupação externa mínima e origem para bloquear disponibilidade, separada de atendimento/aluno/019. Título/local/convidados não são necessários para FreeBusy. Não gerar presença, obrigação, pagamento ou sessão canônica a partir desse intervalo.

Desconexão revoga autorização, interrompe tarefas, invalida cursor e aplica retenção de metadados; nunca apaga automaticamente atendimentos internos. Revogação detectada deve falhar fechado. Falha transitória usa retry limitado com backoff/jitter e chave estável; falha permanente requer ação explícita. Reconciliar projeções por identificação e versão, sem duplicar eventos após timeout. Cursores expirados exigem leitura completa controlada; ausência no provedor não é autorização para apagar fatos internos. Falhas e conflitos ficam visíveis sem segredos nem dados pessoais em logs. Não iniciar sincronização bidirecional por consequência desta preparação.
