# Superfícies de ataque — Entrega 015

Inventário do código local da FormFisik, empresa independente fundada por Brandon Louis. Este inventário não é declaração de homologação externa. A revisão inicial precedeu as alterações de runtime.

## Fronteiras

Públicas: landing `/`, `/cadastro`, `/verificar-email`, `/login`, `/esqueci-senha`, `/redefinir-senha`. Links de e-mail usam fragmento, removido pelo cliente; consumo exclusivamente POST. Não existem Server Actions próprias nem middleware anterior; Route Handlers Node concentram operações. Proxy implementado nesta auditoria aplica CSP/headers e não substitui autorização.

Privadas: `/conta`, `/assinatura`, `/assinatura/retorno`, `/assinatura/gerenciar`, `/dashboard`, `/alunos` e detalhes/novo/editar, `/exercicios`, `/exercicios/moderacao`, `/treinos` e novo/detalhes/editar/aplicar/exportar, `/acompanhamento` e aluno/exportar. Layout exige sessão; módulos pagos verificam entitlement canônico. Moderação usa concessão administrativa explícita independente de assinatura, sem privilégio derivado de role ou e-mail presumido.

Cookie: `__Host-formfisik-session` Secure/HttpOnly/SameSite=Lax/Path=/ em produção, sem Domain; nome sem prefixo em desenvolvimento; token aleatório de 32 bytes, apenas SHA-256 no banco. Expiração absoluta 12h e inatividade 30min; checagem passiva não renova prazo. Web Storage somente preferência de tema; filtros/seleções limitados à memória React.

Entradas binárias: logo PNG/JPEG até 256KiB/4MP, fotos JPEG/PNG/WebP até 5MiB/24MP; decodificação Sharp e reencodificação sem EXIF. Imagens privadas R2 por proxy autenticado; nenhum link público permanente. PDFs administrativos em memória, treinos/evolução em artefatos PostgreSQL privados por 15min/até três por proprietário; leitura reautoriza e invalidação fotográfica transacional.

Conexões: PostgreSQL (pool 5, timeout de statement 15s), SMTP autenticado/TLS em produção, Stripe SDK oficial (guardas local/test-only), R2 HTTPS privado. Fontes web empacotadas no build e fontes PDF locais; sem analytics de fotografias ou dados corporais. Build pode consultar fontes Google; runtime não requer CDN gráfica/PDF.

Dados: identidade/credenciais, registros privados de alunos, prescrições e versões, avaliações/medidas/notas, fotografias e referências de autorização, apresentação pública declarada, estado comercial/faturas resumidas, eventos mínimos/limites HMAC e artefatos PDF temporários. Ver inventário de privacidade para finalidades/retenção propostas.

## Endpoints

Os filtros de propriedade e validações específicas estão nos serviços indicados. UUID não concede acesso. Consulta comercial não exige assinatura; é necessária para contratar/regularizar. `/api/auth/session` apenas autentica; `/api/account` limita perfil profissional; `/api/access` verifica direito comercial. Moderação exige grant ativo. APIs de dados profissionais exigem profissional, assinatura confirmada e propriedade.

| Rota | Métodos | Implementação | Fronteira |
| --- | --- | --- | --- |
| `/api/access` | GET | `@/server/auth` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/account` | GET | `@/server/auth` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/accounts/register` | POST | `@/server/registration` | Público; Origin + validação + limitação |
| `/api/accounts/verify` | POST | `@/server/registration` | Público; Origin + validação + limitação |
| `/api/assessments/{id}/history` | GET | `@/server/assessments/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/assessments/{id}` | GET, PUT | `@/server/assessments/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/assessments/{id}/status` | POST | `@/server/assessments/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/assessments` | GET, POST | `@/server/assessments/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/auth/forgot-password` | POST | `@/server/password-recovery` | Público; Origin + validação + limitação |
| `/api/auth/login` | POST | `@/server/auth` | Público; Origin + validação + limitação |
| `/api/auth/logout` | POST | `@/server/auth` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/auth/reset-password` | POST | `@/server/password-recovery` | Público; Origin + validação + limitação |
| `/api/auth/reset-password/validate` | POST | `@/server/password-recovery` | Público; Origin + validação + limitação |
| `/api/auth/session` | GET | `@/server/auth` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/{id}` | GET, PATCH | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/{id}/status` | POST | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/capability` | GET | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/moderation/{id}` | GET, POST | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/moderation/catalog` | GET | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/moderation` | GET | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/requests/{id}` | GET | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/requests` | GET, POST | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises` | GET, POST | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/exercises/selection` | POST | `@/server/exercises/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/health` | GET | `@/server/db` | Público; resposta mínima, consulta constante; limitação no proxy operacional pendente |
| `/api/photo-images/{id}` | GET | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records/{id}/history` | GET | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records/{id}/images` | POST | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records/{id}/remove` | POST | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records/{id}` | GET, PUT | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records/{id}/state` | POST | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photo-records` | GET, POST | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photos/availability` | GET | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/photos/choices` | GET | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/physical-reports/{id}` | GET, DELETE | `@/server/physical-reports/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/professional/dashboard` | GET | `@/server/professional-dashboard` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/professional/presentation` | GET, PUT | `@/server/workout-documents/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/progress/calendar` | GET | `@/server/progress-photos/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/stripe/webhook` | POST | `@/server/subscriptions/handlers` | Público; assinatura Stripe/corpo bruto/limite/idempotência/estado canônico |
| `/api/students/{id}/pdf` | GET | `@/server/students/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students/{id}/physical-reports/photos` | GET | `@/server/physical-reports/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students/{id}/physical-reports` | GET, POST | `@/server/physical-reports/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students/{id}` | GET, PUT | `@/server/students/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students/{id}/status` | POST | `@/server/students/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students/export` | GET | `@/server/students/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/students` | GET, POST | `@/server/students/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/subscriptions/availability` | GET | `@/server/subscriptions/availability` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/subscriptions/cancel` | POST | `@/server/subscriptions/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/subscriptions/checkout` | POST | `@/server/subscriptions/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/subscriptions/portal` | POST | `@/server/subscriptions/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/subscriptions/status` | GET | `@/server/subscriptions/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workout-documents/{id}` | GET | `@/server/workout-documents/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}/apply` | POST | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}/documents` | POST | `@/server/workout-documents/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}/duplicate` | POST | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}/history` | GET | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}` | GET, PUT | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts/{id}/status` | POST | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |
| `/api/workouts` | GET, POST | `@/server/workouts/handlers` | Sessão opaca confirmada; papel/capacidade + direito comercial quando aplicável + propriedade no serviço |

## Persistência e operações privilegiadas

Migrations 001–014: users, credentials, pending_registrations, sessions, password_resets, abuse_limits; billing_accounts/checkouts/subscriptions/events/invoices/cancellations; student_records/links e eventos; exercise_datasets/entries/versions/requests/moderators/eventos; workout_plans/versions/referências/operações; professional_presentations/workout_documents; physical_assessments/eventos; photo_authorizations/records/images/removal_operations/eventos; document_photo_authorizations/references. FKs compostas preservam proprietário e vínculo. Não existe RLS: autorização SQL por proprietário é obrigatória.

Migration 015 acrescenta `users.disabled_at`, `account_security_events` e revogação transacional ao suspender, sem eliminar dados.

CLI: suspensão/reativação de conta com motivo enumerado e confirmação operacional de identidade/escopo, migrador com checksum/lock, cleanup de temporários, reconciliação comercial, importação offline de catálogo, concessão/revogação de moderação e limpeza R2. São operações de operador fora do frontend; nenhuma foi executada no banco existente. Não há cron provisionado; backups/restore/IAM/proteção de borda dependem de operação autorizada.

## Superfícies017

`/anamneses` e `/alunos/:id/anamneses` usam guard profissional/shell. `/api/intake` GET/POST exige sessão, confirmação, entitlement e owner; ações eDTOs em [contratos017](../engenharia/api-anamneses.md). `/responder` público sem conta,semcache/indexação/Referrer; `/api/intake/public` POST abre/envia somente com capacidade temporária,Origin/limites e esquema estrito. Token somente emfragmento removido/corpoPOST; nenhumGET consome link. Não expor cadastro existente, respostas prévias ou token puro persistido.

## Extensão021 — Agenda

Páginas privadas `/agenda` e `/alunos/[id]/agenda`; GET/POST `/api/agenda`, implementado em `src/server/agenda/handlers.ts`. Sessão opaca confirmada, entitlement e propriedade revalidados no servidor; Origin nas escritas, schemas estritos, limite32KiB, GET120/POST40 por minuto. Versões/digest/idempotência e lock transacional não substituem autorização. DTO mínimo e dados privados sob demanda; sem chamadas ou credenciais de calendários externos. [Contrato completo](../engenharia/api-agenda.md).

## Extensão022

Privadas `/checkins`, `/alunos/[id]/checkins` e GET/POST `/api/checkins`, guardas de sessão/entitlement/owner. Pública `/responder/check-in` com capacidade em fragmento removido e POST `/api/checkins/public`; não é portal nem identidade. Sem chamadas externas, anexos, JWT ou credenciais novas. [Contrato](../engenharia/api-checkins.md).

## Comunicação024

GET/POST /api/communication e páginas /comunicacao, /alunos/[id]/comunicacao exigem sessão/entitlement/propriedade. Não há endpoint público ou envio. Contextos são canônicos/autorizados; avaliação exige necessidade/autorização específica. Listas20 sem corpos/saúde, detalhe privado mínimo; avisos projetados sem conteúdo sensível e leitura exclusiva do profissional. [Contratos](../engenharia/api-comunicacao.md).
