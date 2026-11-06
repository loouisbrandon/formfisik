# API e modelo de dados da agenda

## Fronteira pública privada

`GET /api/agenda` e `POST /api/agenda`, runtime Node. Exigem sessão opaca válida, e-mail confirmado e autorização SaaS no servidor. POST exige Origin da aplicação. Limites por profissional: GET120 e POST40 por minuto; JSON até 32KiB, leitura limitada a15 segundos. Schemas estritos recusam campos desconhecidos. Respostas privadas no-store, sem tokens/SQL/segredos. UUID não concede autorização.

GET `view`: settings, types, exception, exceptions, calendar, list, detail, history, indicators, contracts, deliveries. Parâmetros opcionais validados: date, id, studentId, contractId, from, to, page, status, q, archive. Um término to exige from ou date explícito; o período combinado é limitado. Toda consulta filtra owner. Listas de tipos, exceções, ocorrências, histórico e candidatos contratuais usam páginas de20 com total; calendário retorna agregados limitados, não notas. Lista omite local/observações e substitui título pessoal por categoria. Detalhe é sob demanda e contém campos privados autorizados, snapshot e referências de execução. Nenhuma credencial externa é retornada.

POST `action`: availability_save, exception_save, type_save, preview, appointment_save, cancel, attendance. Exceto preview, exige operationKey UUID; versões são obrigatórias nas alterações pertinentes. Confirmar reserva exige previewDigest SHA256 atual, campos revisados, scope one/future e confirmed. Operações idempotentes repetidas com mesmo corpo retornam o resultado anterior; reutilizar chave com outro corpo é conflito. Não gerar chave nova apenas para retry de rede.

Configuração: timezone e weekly com sete dias únicos/windows. Exceção: data/windows/reason e remove. Tipo: nome/descrição/duração/modalidade/local/buffers/archived. Reserva: kind, studentId/typeId quando sessão, title, date/time/timezone/fold, duration, endDate/endTime para bloqueio, mode/location/notes, contractId/deliveryId opcionais e recurrence. Presença: id/version/state/effectiveAt/reason, fulfill, releaseFulfillment e deliveryVersion quando aplicável. Consultar schemas canônicos em `src/modules/agenda/schema.ts`; não duplicar validação crítica num segundo contrato TypeScript.

Status: 200 sucesso/preview; 400 schema/origem inválida quando aplicável (origem403); 401 sessão; 403 autorização; 404 recurso indisponível ou de outro proprietário; 409 versão/idempotência/conflito; 422 regras temporais; 429 abuso; 503 indisponibilidade. A mensagem estática não revela existência de recurso de terceiros. Preview é consultivo; conflito é revalidado no writer sob lock profissional18018. Não há autorização por digest.

## Persistência — migration021

| Tabela | Finalidade |
| --- | --- |
| agenda_settings | Fuso, semana JSON, versão por profissional |
| agenda_exceptions | Substituição de disponibilidade por data e versão |
| agenda_session_types | Modelo operacional versionado, arquivamento |
| agenda_series | Regra limitada e relação com série anterior |
| agenda_occurrences | Instantes/ocupação, snapshot, estado, aluno e vínculos019 |
| agenda_fulfillments | Referência auditável a execução019, liberação explícita, uma ativa por ocorrência |
| agenda_events | Evento mínimo, autoria, versão, motivo e instantes |
| agenda_operations | Chave/digest/resultado idempotente e invalidação de sujeito eliminado |

FKs compostas reforçam owner/aluno/contrato/obrigação; índices limitam buscas por período, aluno e série. Intervalos positivos, estados e natureza são verificados. SQL parametrizado; lock e auditoria estão na mesma transação. Sem extensão ou dependência nova; sem entidade financeira paralela. Duração histórica não é recalculada após edição do tipo.

Permissões runtime: sem DELETE de ocorrências/eventos; eventos não podem ser reescritos pelo papel operacional. Liberação de cumprimento restringe UPDATE à coluna released_at. Worker privilegiado016 elimina na ordem de dependência, após preflight financeiro020. [ADR022](../arquitetura/ADR-022-agenda-canonica.md) e [privacidade](../privacidade/agenda.md) detalham retenção, restore e invariantes.


Refinamento de 05/11/2026: `outside_availability` aplica-se somente a `kind=session`. `personal` e `block` continuam sujeitos a `occupied` e às demais validações pertinentes. Prévia e writer compartilham `buildPlan`, de modo que a correção não cria bypass entre consulta e gravação. Nenhum campo de override ou dispensa de conflitos foi acrescentado ao contrato.


Refinamento de 05/11/2026: o nome cadastrado de bloqueio/indisponibilidade aparece nos cartões e na lista da agenda do profissional proprietário. O DTO de lista inclui esse título; local e notas permanecem no detalhe autorizado. Isso não compartilha o nome com alunos, CRM ou calendários externos. Títulos de compromissos pessoais continuam apresentados por categoria na lista.

Movimentação por arraste reutiliza `view=detail`, `action=preview` e `action=appointment_save`; não há endpoint de arraste nem permissão de override. O cliente compara a versão da listagem com a do detalhe, envia `id/version`, `scope=one`, campos canônicos, justificativa (mínimo 5 caracteres) e digest da prévia. Só a confirmação explícita grava. O writer continua validando proprietário, acesso, versão, digest, ocupação, disponibilidade e contrato sob lock, com idempotência para repetição após resposta perdida. Soltar o cartão ou cancelar os modais não envia comando de gravação.
