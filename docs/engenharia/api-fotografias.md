# Fotografias e calendário — contratos e modelo 013

Todos os endpoints exigem sessão opaca válida, profissional confirmado, autorização comercial canônica e propriedade do vínculo. Mutações exigem Origin da aplicação. Não usam JWT. Respostas privadas usam `private, no-store`, `no-referrer`; falhas não incluem segredos, bytes, notas ou chaves. UUIDs estrangeiros retornam 404. Entradas são estritas (Zod) e SQL parametrizado.

## Modelo PostgreSQL

Migration aditiva `013_progress_photographs.sql`, após 012; não foi aplicada ao banco existente nesta entrega.

| Tabela | Responsabilidade |
| --- | --- |
| `photo_authorizations` | Origem/referência, data civil da obtenção, adulto/responsável, referência do responsável, atestante e revogação |
| `photo_records` | Profissional, vínculo de aluno, autorização, data civil independente, notas, estado, versão, autor e chave/digest de criação |
| `progress_photo_images` | Posição/descrição, chave opaca, chave/digest de upload, estado, dimensões/bytes normalizados, tentativas e prazo de limpeza |
| `photo_record_events` | Versão única por registro, tipo de operação, autor e instante; sem cópias antigas de fotos/notas/consentimento |
| `photo_removal_operations` | Idempotência e motivo de solicitações de remoção |

FKs compostas impedem atravessar profissional/vínculo/registro. `DATE` usa `to_char` na leitura, sem transformar em instante; timestamps administrativos em Brasília. Registros: `active → archived → active` ou `active/archived → deleting → deleted`. Imagens: `pending → ready → deleting → deleted`; pending abandonado também entra na limpeza. Eventos incrementam a versão sob lock. Nos tipos image_deleted/record_deleted, a execução é do worker, sob responsabilidade do proprietário registrado; o ator não significa clique manual de exclusão física. Não há colunas bytea para fotografias. No DTO de registro deleted, date/notes/source/obtainedOn/guardian ficam vazios, subject é null e a autorização permanece revogada.

## Endpoints

| Método / rota | Contrato |
| --- | --- |
| GET `/api/photos/availability` | `{configured,message}`; configuração ausente não simula saúde do R2 |
| GET `/api/photo-records` | `studentId`, `page`, `state=active/archived/all`, `from`, `to`, `position`; `{items,total,page,pages,pageSize:10}` |
| POST `/api/photo-records` | `{studentId,creationKey,date,notes,authorization}`; 201 `{record}`; sem R2 503 |
| GET `/api/photo-records/:id` | `{record}` com imagens confirmadas, autorização e primeira página do histórico |
| PUT `/api/photo-records/:id` | `{version,date,notes}`; 200 `{record}` |
| POST `/api/photo-records/:id/state` | `{version,state:active/archived}`; 200 `{record}` |
| POST `/api/photo-records/:id/images` | `{version,uploadKey,position,description,data,replaceId?}`; 201 `{record}` apenas após confirmação real; `data` base64 de um arquivo |
| GET `/api/photo-images/:id` | JPEG saneado; autenticação e propriedade antes e depois da leitura; nunca URL pública |
| POST `/api/photo-records/:id/remove` | `{version,operationKey,reason,imageId?}`; reason `student_request/authorization_revoked/correction`; 202 `{record}`, não confirmação de apagamento físico |
| GET `/api/photo-records/:id/history?page=1` | `{items,page,pages,total}`, 20 eventos/página |
| GET `/api/photos/choices` | `studentId,date,position,page`; 12 metadados/página; somente imagens confirmadas em registros ativos |
| GET `/api/progress/calendar` | `studentId,year,month?,period`; ano: até 12 contagens; mês: até 31; `{year,month?,items:[{date,assessments,photos}]}` |
| GET `/api/progress/calendar` com `date,page` | Mesmo aluno/período; `{date,photos,assessments}`, até 10 registros de cada tipo por página; detalhes não baixam bytes |

`authorization={source,obtainedOn,subject:adult/guardian,guardian,attested:true}` é obrigatória e específica. Source 5–500, guardian 5–200 quando aplicável; notas 1.000; descrição 120 e ao menos 3 para `other`. Posições `front/back/right/left/other`. Data válida de 1900 até hoje em São Paulo. Sem pagamentos/trial implícitos.

Limites: 12 imagens confirmadas/pendentes por registro, substituição permite uma reserva transitória adicional; 5 MiB de entrada, JPEG/PNG/WebP estáticos reais, até 24 MP e 6.000 px/lado, saída JPEG até 2.000 px/lado e 3 MiB. Corpo de upload até 7 MiB; demais corpos 8 KiB. Remoção de EXIF/ICC e orientação normalizada. SVG/GIF/animação/conteúdo malformado rejeitados independentemente de nome/extensão/MIME.

Rate limit compartilhado no PostgreSQL por usuário/operação: upload 15/min, leitura de bytes 240/min, demais mutações 40/min e metadados 120/min. Aplicar também limite de corpo/concorrência no ingresso quando publicado. 400 entrada/arquivo inválido, 401 sessão ausente, 403 identidade/comercial/origem, 404 propriedade, 409 versão/idempotência/estado/autorização de menor, 422 quantidade excedida, 429 abuso, 503 armazenamento/infra indisponível.

Chaves de criação/upload/remoção são UUIDs. Repetição com mesmo payload reutiliza resultado; chave com conteúdo diferente conflita. Versão não é reutilizada para sobrescrever alterações concorrentes. Upload pendente/falho não retorna sucesso em replay; recarregar antes de tentar um novo envio. Substituição só oculta a antiga após confirmar a nova. Nenhuma API recebe chave de objeto ou escolhe bucket/endpoint.
