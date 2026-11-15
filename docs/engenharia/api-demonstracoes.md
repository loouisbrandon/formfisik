# API e modelo de demonstrações 023

GET/POST `/api/media`, sessão opaca/profissional confirmado/habilitado/entitlement/propriedade; POST Origin eJSONstrict32768 bytes/15 s; GET120/POST20 por minuto. Respostas privadas/no-store. Propriedade nunca vem do cliente. 400validação/401sessão/403capacidade/404invisível/409concorrência/422quota/429abuso/503provedor. Referências opacas não são autorização.

## Leituras

`view=library`(padrão): q/título160,scope all/official/mine,source all/youtube/stream,state active/archived/revoked/all,exerciseId opcional,page1..100000. Ordena título/ID;20 por página,total,pageSize; vazia não troca filtros silenciosamente. SemUID externo ou direitos em massa.

`view=associations&exerciseId`: conjuntos private/official com version e videos[{videoId,revision}], ordem principal primeiro; itens mínimos para identificação. Só exercício autorizado. `detail&id&revision?`: metadados da revisão; referência de direitos somente proprietário. `history&id?&page`:20 eventos próprios decrescentes/ID,total. `quota`: quantidade/segundos reservados/limites. `capability`: publisher/uploadsConfigured, sem conceder permissão. `review&page`:20 submissões por criação/ID, descrição e referência de direitos, somente publicador.

`playback&id&revision?`: autorização fresca, estado atual e revisão pronta. YouTube retorna URLembed construída/URLoficial, título e fonte; Stream retorna URL temporária/expiração/título/fonte após rede e rechecagem. Não é URL permanente nem segredo do servidor. Não armazenar emWebStorage/log. Até5 min de validade; player descarta URL expirada e exige nova autorização. Troca/logout revoga emissão, não bytes já entregues.

## Comandos

Todos têm action,operationKeyUUID,confirmed:true. Mesma chave/intenção recupera resultado; intenção diferente409. Retorno id/version. Não guardar URLdeupload em resultado durável.

| action | Contrato |
| --- | --- |
| youtube | urlHTTPS; title160/description2000; rightsReference5..500; rightsConfirmed/peopleAuthorized=true; id/version opcionais para nova revisão |
| upload | mesmos metadados; bytes1..200000000,mime video/mp4 ouvideo/quicktime,seconds1..300; id/version opcionais; retorna capacidade temporária somente na reserva confirmada |
| metadata | id/version e metadados/direitos completos; cria revisão sem trocar fonte |
| state | id/version,state active/archived/revoked,reason5..500; revogação terminal |
| associate | exerciseId,scope private/official,version0para criação, videos[0..10]sem duplicação; ordem é explícita; seleção oficial exige capacidade e vídeos oficiais |
| submit | id/version próprios, para avaliação editorial voluntária |
| review_reject | id/version submetidos por outro autor; reason10..500; devolve ao autor com justificativa auditada, sem publicar |
| publish | id/version submetidos por outro autor; reason10..500;technicalReviewed/rightsReviewed=true; capacidade independente |
| reconcile | idpróprio; consulta provedor e atualiza processamento sem confiar emstatuscliente |

POST `/api/media/webhook`: corpo bruto64 KiB, assinaturaHMACSHA256 do Stream comtimestamp±300 s, fingerprint durável do corpo assinado em media_operations, lease de60 s com retry e leitura canônica por recurso/revisão. UIDdesconhecido é recebido/ignorado; evento revogado não revive conteúdo. SemOrigin/cookie; assinatura do provedor substitui autenticação humana, não associação do cliente.

## Persistência

Migration022_exercise_media.sql, aditiva após 021. exercise_videos=identidade/owner/escopo/estado/revisão/submissão; exercise_video_versions=fonte/direitos/metadados/reserva/UID/processamento; exercise_video_sets/conjuntos versionados/itens=associações privadas/oficiais; workout_video_references=FK à prescrição e mídia/revisão/posição; media_operations=idempotência; media_events=auditoria; media_cleanup=UID/tombstone; media_publishers=capacidade explicitamente provisionada por operação autorizada futura.

Metadados e associação são append-only no runtime; apenas estado de processamento/UID de reserva/expiração/duração são atualizados na revisão. FKs impedem apagar mídia referenciada sem fluxo adequado. DTO de prescrição usa demosopcional para compatibilidade com snapshots anteriores; ausência não ganha vídeo automaticamente. Cópias/modelos preservam conteúdo referenciado. Conta não pode selecionar mídia privada alheia porforjarJSON.


## Ajustes da biblioteca — 05/11/2026

`GET view=library`: `q` busca literalmente título ou nome de exercício associado acessível; `muscle` recebe taxonomia canônica; `sort=name_asc|newest|oldest`, padrão name_asc. Mantém20 resultados/página, total e página vazia. DTO acrescenta `exercises:[{id,name}]` (máximo10, somente associações atuais autorizadas) e `summary:{official,youtube,own}` com contagens reais independentes dos filtros, sem respostas, direitos, UID remoto ou URL de reprodução. IDs de exercícios estrangeiros não autorizam leitura.

`POST action=upload`: exige `exerciseId` autorizado; `seconds` inteiro1–120. Validação antecede qualquer reserva externa. Evento de upload conserva destino e versão da declaração; associação de vídeo pronto continua ação explícita versionada. Limite de bytes200000000 preservado. Schema não comprova conteúdo/MIME real do arquivo: inspeção independente do original não implementada. YouTube e revisões históricas preservam contratos anteriores.
