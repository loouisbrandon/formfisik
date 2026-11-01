# API e modelo de acompanhamento

## Contratos

Todos os endpoints usam sessão opaca existente, e-mail confirmado, perfil profissional e autorização comercial canônica atualizada no servidor. Proprietário vem exclusivamente da sessão. Sem parâmetros para identidade, acesso ou assinatura. Guards são independentes da renderização da página e do monitor de sessão. `Cache-Control: private, no-store`, `Vary: Cookie` e `Referrer-Policy: no-referrer` são reutilizados.

| Rota | Método e entrada | Resultado |
| --- | --- | --- |
| `/api/assessments` | GET `studentId`, `view=list` padrão, `state=active/archived/all`, `page` | items, total, page, pages, latest, first, previous. Página 20. Referências são sempre ativas. |
| mesma | GET `studentId`, `view=series`, `metric`, `period=30/90/6m/12m/all`, `page` | items `{id,date,value}`, total, page, pages, metric, period, asOf. Página 500, ordem cronológica crescente. |
| mesma | GET `studentId`, `view=compare`, `mode=first/previous/manual`, `from`, `to` | `{comparison:null}` se dados automáticos insuficientes; ou from/to completos, days e values com before/after/absolute/percent por grandeza. |
| mesma | POST todos os campos, `studentId`, `creationKey` UUID | 201 `{assessment}`; replay retorna o mesmo registro, sem duplicar. |
| `/api/assessments/[id]` | GET | 200 `{assessment}` somente do proprietário. |
| mesma | PUT campos + `version` | 200 `{assessment}` com versão incrementada. Vínculo, autoria e proprietário não são editáveis. |
| `/api/assessments/[id]/status` | POST `{version,state:active/archived}` | 200 `{assessment}`; situação já vigente com versão atual não produz nova versão/evento. |
| `/api/assessments/[id]/history` | GET `page` | items `{version,kind,occurredAt,actorId,actorName}`, total, page, pages; 20 eventos por página. |

Campos obrigatórios do contrato (valores opcionais usam null): `date`, `weight`, `neck`, `shoulders`, `chest`, `waist`, `abdomen`, `hips`, `rightArm`, `leftArm`, `rightForearm`, `leftForearm`, `rightThigh`, `leftThigh`, `rightCalf`, `leftCalf`, `notes`. Medições são strings decimais exatas ou null; notes string. IDs UUID. Schemas estritos rejeitam campos extras. Ver limites em [documentação funcional](../modulos/acompanhamento.md).

`Assessment`: campos + `id`, `studentId` (vínculo), `state`, `version`, `authorId`, `authorName`, `createdAt`, `updatedAt`. Não contém contatos, notas administrativas, credenciais ou dados financeiros.

Respostas: 400 validação/body/filtros; 401 sessão ausente, revogada, expirada ou e-mail não confirmado; 403 origem indevida/perfil/comercial; 404 recurso ou vínculo indisponível/estrangeiro, sem confirmar sua existência; 409 versão, idempotência divergente, avaliação/aluno arquivado impedindo edição; 429 abuso; 503 indisponibilidade. Erros de validação incluem `errors` por campo, nunca valores recebidos. `professionalAccess` retorna destino interno permitido em negativa comercial. Exceções inesperadas geram somente o evento fixo `assessment_operation_unavailable` nos logs.

Mutações exigem Origin do APP_URL e não aceitam Sec-Fetch-Site cross-site. Corpo lido pelo limitador streaming existente: 16.000 bytes para criar/editar (suporta 3.000 caracteres Unicode) e 8.192 para situação. Limitação durável/HMAC por profissional/operação: 40 mutações/minuto e 120 leituras/minuto. IDs, enums e paginação são validados antes do repositório; SQL parametrizado. A única interpolação de coluna em séries vem do enum fechado de métricas validado pelo handler, nunca texto arbitrário. Não há DELETE nem compartilhamento público.

## PostgreSQL — migration 012

`012_physical_assessments.sql` é aditiva. Reutiliza UNIQUE(professional_id,id) de student_links criado pela 009; não modifica migrations anteriores.

- `physical_assessments`: UUID, professional_id, student_link_id, author_id, assessment_date DATE, 15 colunas NUMERIC(5,2) nullable, notes varchar(3000), state active/archived, version positiva, created_at/updated_at timestamptz, creation_key UUID e creation_digest SHA-256.
- FK composta `(professional_id,student_link_id)` → student_links protege propriedade no banco. `author_id=professional_id`; FK users para identidade de autoria. Chave única de criação por proprietário. UNIQUE(professional_id,id) suporta a auditoria. CHECKs numéricos também no banco; data civil válida é intrínseca ao tipo DATE e possui mínimo 1900. Restrição de data futura é contextual no schema/servidor, não CHECK dependente do relógio.
- Índice `(professional_id,student_link_id,state,assessment_date,created_at,id)` suporta filtragem e cronologia. Sem unicidade de data.
- `physical_assessment_events`: avaliação/proprietário com FK composta, versão (PK junto ao ID), actor_id igual ao profissional, kind created/edited/archived/reactivated, occurred_at. Não armazena observações ou valores anteriores.

Criar usa transação e advisory lock por proprietário para idempotência (digest do vínculo e payload normalizado). Alterar bloqueia linha e compara versão. Leitura FOR SHARE do vínculo ativo durante escrita impede corrida com seu arquivamento. Dados e evento são atômicos; erro faz rollback. Arquivamento preserva o registro. Não são snapshots de saúde: auditoria administrativa prova operação/autoria/versão, sem prometer reconstrução de valores anteriores.

Usa Pool, migrator e helper transaction já existentes. Sem ORM, nova biblioteca de persistência, serviço externo ou cron. Migration foi aplicada somente ao PostgreSQL descartável de testes. Ambiente existente e Railway precisam de autorização operacional para aplicação futura, nunca ao simples iniciar o frontend.

## Evolução 013

A 013 preserva os contratos e números das avaliações e extrai a definição comum de períodos para o calendário. Fotografias são entidades separadas com autorização própria, nunca anexos exclusivamente de uma avaliação. [Modelo e contratos fotográficos/calendário](api-fotografias.md).
