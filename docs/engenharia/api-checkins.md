# API e modelo — Check-ins022

Runtime Node, sessão opaca e entitlement proprietário para GET/POST `/api/checkins`. Owner exclusivamente da sessão. UUID não autoriza. POST Origin estrito, JSON até128KiB/15s e schema strict. GET120/POST40 por minuto/profissional. Headers private/no-store/no-referrer/nosniff. Erros estáticos, sem SQL/segredos/relatos. Público não é login.

## Leituras

GET view: forms, form, version, assignments, occurrences, detail, submissions, history, indicators, series, workouts e summary. IDs UUID; page positiva; status all/waiting/overdue/received/reviewing/reviewed/canceled; studentId contextualizado; from/to sempre juntos e no máximo366dias de diferença. Período default90datas em São Paulo para consultas limitadas. Listas SQL20/total/page, ordenação estável; séries100/page/mayHaveMore sem truncamento silencioso. Página vazia conserva metadados.

- forms/form/version reutilizam catálogo017 com usage=checkin; nunca retornar padrão clínico na área de check-ins. Rascunho e versões completas somente no detalhe.
- assignments retorna configuração operacional e estado/version, sem respostas.
- occurrences retorna nome atual autorizado, título, período, prazo, estado/version e referência mínima de prescrição; sem respostas/notas/devolutivas/token.
- detail carrega ocorrência/versão definida, última submissão e página20 de devolutivas, sem token/digest; submissões anteriores por view=submissions.
- history contém autoria, operação e metadados mínimos; motivos operacionais não devem conter cópia de relato clínico.
- indicators agrega contagens e métricas declaradas; não carrega carteira inteira no browser.
- series exige studentId/questionId/formVersionId e restringe comparação à versão publicada; pontos e valores ausentes.
- workouts exige aluno próprio; pagina revisões históricas ativas com nomes/versões/IDs de divisões, não documento completo ou demos023.
- summary exige aluno próprio; total/atrasados/revisão pendente/últimas datas, sem conteúdo das respostas.

## Comandos

| action | Entrada e efeito |
| --- | --- |
| form_save | definition do motor017, id/revision para atualização; creationKey UUID obrigatório na criação, preservado em retry; criar ou atualizar rascunho checkin |
| form_publish | id/revision; snapshot do catálogo compartilhado; repetição da publicação do mesmo rascunho atual reutiliza a última versão |
| form_archive | id; impedir novos usos preservando histórico |
| assign_preview | fields com aluno, versão, início, frequência, count, timezone, responseDays, lateDays, contexto de prescrição opcional; retorna slots/digest |
| assign | mesmos fields, digest, operationKey e confirmed:true; grava toda série |
| assignment_state | id/version, paused/closed, operationKey/confirmed; cancela só futuras não abertas |
| invite | ocorrência id/version, correction, reason; gera capacidade uma vez, revoga pendentes anteriores |
| revoke | ocorrência id/version/operationKey; revoga convites pendentes |
| cancel | id/version/reason/confirmed/operationKey; cancela somente waiting |
| review_start | id/version/operationKey; ação explícita de revisão |
| review | id/version/submissionId atual/text/sharedManually/confirmed/operationKey; append-only |

Escritas operacionais usam lock18018 e idempotência por intenção; versões desatualizadas/digest alterado409. Convite não persiste segredo no resultado: reemissão explícita se a resposta se perder. Criação de modelo022 reutiliza o mesmo UUID de intenção após falha de rede e recusa colisão com outro proprietário ou conteúdo. Publicação022 do mesmo rascunho atual não duplica versão; voltar a um conteúdo antigo após publicação diferente gera outra versão. Atualizações usam revisão otimista e exigem recarregar em conflito. Catálogo preserva contrato017/revisões; não é tratado como ocorrência de check-in. Resposta pública e transições não executam019 ou020.

## Público

`POST /api/checkins/public`: Origin, JSON128KiB, sem cookies/conta. Limite60/15min/endereço confiável e30/15min/capacidade; HMAC no contador. `/responder/check-in#TOKEN` remove fragmento antes da requisição e usa no-referrer/no-store/noindex/CSP.

`{operation:'open',token}` → profissional, definição/número, período/fuso, contexto mínimo de versão prescrita/meta e indicação de correção. Nunca cadastro, respostas anteriores ou IDs de contas/alunos. `{operation:'submit',token,attemptKey,submission:{answers,acknowledged:true,feedback}}` → `{received:true}`. Registration é proibido; respostas condicionais filtradas no servidor. Feedback sem prescrição é recusado; count exige meta.

Uso único sob lock e relógioSQL; reenvio exato com mesma attemptKey/digest retorna somente confirmação sem conteúdo enquanto elegível. Tentativa divergente, token desconhecido/consumido na abertura/expirado/revogado, conta suspensa, vínculo arquivado ou ocorrência cancelada:410 genérico.400 conteúdo inválido,403 origem,429 abuso,503 dependência verdadeira. Nenhuma simulação de sucesso.

## SQL e integridade

Migration023_student_checkins.sql (Marco022, após migration022 do Marco023): usage em intake_forms, imutável/default intake, preservando versões017. Tabelas checkin_assignments, checkin_occurrences, checkin_invitations, checkin_submissions, checkin_reviews, checkin_events e checkin_operations. FKs compostas de owner/aluno/versão prescrita/formulário; posição única na atribuição, digest único, revisão única por ocorrência e uma submissão por convite. Submissões/devolutivas possuem trigger imutável; runtime só SELECT/INSERT nesses históricos e eventos. Sem DELETE runtime; operador016 elimina na ordem de dependência.

[ADR024](../arquitetura/ADR-024-checkins-e-finalidades.md) explica entidades, concorrência, tempo e reutilização. FuturoConnect deve chamar os mesmos serviços com identidade legítima e origem distinta; não aceitar payload informando owner/source confiáveis. Notificações e wearable não têm endpoint ativo nesta entrega.

## Contratos futuros sem integração ativa

Connect029 deverá resolver pessoa/conta/vínculo autorizado antes de ler/enviar, chamar validação e consumo/revisão do domínio022 e registrar origem autenticada própria. A origem não virá de campo confiado ao cliente; o link atual continuará capacidade mínima, não migração automática de identidade.

Notificações024 poderão consumir IDs opacos de ocorrência/evento, owner e tipo received/corrected/reviewed/invited, sem answers/feedback/text. Canal, preferência, finalidade, janela, deduplicação, tentativas e evidência de entrega precisam de domínio e autorização próprios; created/received não significam delivered/read. No022 não há envio, fila externa ou polling que simule notificação. Wearables futuramente exigem origem/unidade/consentimento/autorização e avaliação de comparabilidade, sem converter observação externa em declaração verificada.

## Refinamento da central — novembro/2026

Query aceita `q` (nome do aluno) e `model` (título do modelo), opcionais, texto normalizado120, sem interpretação de curingas. `occurrences` e `history` aplicam ambos no SQL proprietário; listas continuam20/página. Histórico permite período de eventos; sem from/to, preserva a consulta histórica anterior sem corte temporal, sempre paginada. A interface informa seu período explicitamente. A central usa período do fim do ciclo, exibido explicitamente.

DTOs aditivos:

- occurrences: `number`, `opens_at`, `received_at` (última resposta, null quando ausente); sem answers/devolutivas/tokens.
- detail: `can_invite` computado com estado waiting e janela atual no servidor; respostas de revisão incluem `submission_revision` obtido por join composto. O comando revalida a janela, independente do botão.
- assignments: nome autorizado do aluno e título do modelo, sem respostas.
- indicators: `waiting` e `reviewed_in_period`, com ocorrências distintas; fórmula/escopo detalhados no módulo e relatório.

Nenhum comando de envio, provider, preferência, horário arbitrário, API pública de leitura da devolutiva ou nova persistência foi criado. `review` mantém append-only e submissão exata. Novo painel é consumidor das mesmas APIs, com leitura privada sob demanda, cancelamento de chamadas obsoletas e debounce200ms nos filtros da lista.
