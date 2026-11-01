# API de treinos — contrato 010

Prefixo `/api/workouts`. Cada rota exige sessão opaca confirmada, perfil profissional e autorização comercial no servidor. Todas as consultas usam proprietário derivado da sessão. Mutações exigem Origin da aplicação e ausência de cross-site; schemas strict rejeitam identidade, privilégios, estados arbitrários e campos desconhecidos.

| Método / rota | Entrada e saída |
| --- | --- |
| GET `/` | `q` até 160, `kind=all/individual/template`, `state=all/draft/active/archived`, `studentId` opcional, `sort=updated/name_asc/name_desc`, `page=1..10000`; `{items,total,pages,page}`, 20 por página |
| POST `/` | Documento completo + `creationKey` UUID; 201 `{plan}` em draft |
| GET `/:id` | `version` positiva opcional; 200 `{plan}`, atual ou histórica |
| PUT `/:id` | Documento completo + `version`; 200 `{plan}` com nova versão |
| GET `/:id/history` | `page` opcional; `{items,page}`, 20 eventos/versões com estado/operação/data |
| POST `/:id/status` | `{version,state:draft/active/archived}`; `{plan}` |
| POST `/:id/duplicate` | `{version,creationKey,name}`; 201 `{plan}` independente em draft |
| POST `/:id/apply` | `{version,creationKey,studentIds:UUID[1..50]}` sem IDs repetidos; modelo ativo; 201 `{plans:[{id,studentId,studentName,version,state,sourceTemplateId,sourceTemplateVersion}]}` |

Documento (`WorkoutFields`): `kind`, `studentId` UUID/null, `name`, `objective`, `notes`, `startDate/endDate` ISO ou string vazia, `divisions`. Modelos não têm aluno/datas. Cada divisão contém `id,name,description,notes,exercises,groups`. Cada ocorrência contém `id,exerciseId,exerciseVersion,technique,sets,notes`. Série/etapa: `id,repetition,load,unit,restSeconds,executionSeconds,phase,notes`. Repetição é discriminada por `mode=reps/range/failure/duration`. Grupo: `id,technique,members,roundRestSeconds,notes`. Limites e semântica em [Treinos](../modulos/treinos.md); fonte executável em `src/modules/workouts/schema.ts`.

`plan` inclui UUID, versão/estado, `fields` canônico, identificação mínima histórica, `sourceTemplateId/sourceTemplateVersion`, `copiedFromId/copiedFromVersion`, datas e `exerciseDefinitions` indexado por `exerciseId:exerciseVersion`, com nome/categoria/instruções da revisão referenciada. Não aceita esses metadados como autoridade em writes. A lista é resumida, sem documento completo, observações ou contatos de alunos.

Códigos: 400 entrada/estado incompleto, 401 sessão, 403 perfil/comercial/origem, 404 inexistente ou não autorizado (indistinguíveis), 409 versão/tentativa/referência indisponível/aluno arquivado/modelo não pronto/ficha ativa existente, 429 abuso, 503 dependência. Erros nunca expõem SQL, segredos ou registros particulares alheios.

Headers: private/no-store, Vary Cookie, no-referrer. Body até 512 KiB exclusivamente nestes handlers; o helper compartilhado mantém 8 KiB por padrão nas rotas anteriores. Leituras 120/min, mutações 30/min, aplicação em lote 5/min por operação/profissional; limite persistente antes de consultar o provedor comercial. Ordenação por whitelist, filtros parametrizados e paginação SQL limitada.

Uma operação já concluída pode retornar resultado idempotente mesmo que a origem tenha outra versão no momento da repetição: não cria novas entidades. Falha parcial nunca retorna sucesso; transação é integralmente revertida. Novo fluxo/tentativa permite reaplicação intencional, com nova confirmação.
