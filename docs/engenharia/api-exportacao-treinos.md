# API de exportação e apresentação — 011

Todas as rotas Node exigem sessão opaca confirmada, papel profissional e autorização comercial canônica atual. Proprietário vem exclusivamente da sessão. JSON strict/Zod, SQL parametrizado, respostas privadas/no-store/no-referrer/Vary Cookie, erros sem documento/segredo em logs. POST/PUT exigem Origin igual a APP_URL e bloqueiam Sec-Fetch-Site cross-site. Não aceitam identidade, aluno, prescrições, URLs ou imagens arbitrárias nas opções.

| Método/rota | Entrada | Saída |
| --- | --- | --- |
| GET `/api/professional/presentation` | Sem corpo | 200 `{presentation:{professionalName,brand,registration,contact,revision,hasLogo}}`; nunca devolve bytes da imagem |
| PUT `/api/professional/presentation` | Campos acima sem hasLogo, revision inteiro >=0, logo opcional | 200 apresentação persistida; logo ausente preserva, null exclui, base64 PNG/JPEG substitui após validar/sanitizar |
| POST `/api/workouts/:id/documents` | `{version,layout,divisionIds,loads,notes,guidance,annotations,professional,brand}` | 201 `{id,filename,expiresInSeconds:900}` |
| GET `/api/workout-documents/:id` | Sem parâmetros | PDF inline autenticado da prévia |
| GET `/api/workout-documents/:id?download=1` | download literal 1 | Os mesmos bytes, attachment |

`version` inteiro positivo obrigatório; `layout` compact/premium; `divisionIds` null para todas ou array de UUIDs únicos da revisão (1–30; vazio inválido). Demais campos booleanos obrigatórios, sem coerção implícita. Todas as divisões mantêm a ordem canônica, independentemente da ordem dos IDs enviados. Exige ficha individual, vínculo do aluno e revisão do mesmo proprietário. Modelo retorna 400, terceiro/desconhecido a mesma resposta 404.

Apresentação: textos opcionais normalizados, máximos 160/160/100/200 e controles proibidos. Base64 canônico <=349528 caracteres, JSON <=360000 bytes. Limite binário 262144; validação de imagem documentada no módulo. revision 0 cria; atualizações exigem revisão corrente. Não há mass assignment para user_id, role, email, estado financeiro ou credenciais.

Erros: 400 inválido/CSRF403, 401 sessão ausente/expirada/não confirmada, 403 sem acesso/perfil/origem, 404 recurso/versão/documento indisponível, 409 conflito de apresentação/referência histórica incompleta, 422 documento excede limite, 429 tentativas, 503 dependência indisponível. Erro de download mantém UI e permite nova prévia, sem baixar JSON como PDF.

PDF: `application/pdf`, Content-Disposition inline/attachment com nome ASCII seguro, sem IDs/e-mails; `X-Content-Type-Options:nosniff`, `X-Robots-Tag:noindex,nofollow`, `Cross-Origin-Resource-Policy:same-origin`, CSP frame-ancestors self/base-uri none/form-action none. Não há URL portadora pública: UUID não autoriza acesso. Cada leitura revalida sessão, assinatura e proprietário/vínculo; expiração é filtrada no banco. Sem cache público ou conteúdo de documentos em logs.

Reutiliza GET `/api/workouts/:id?version=n` e `/history?page=n` da 010 para seleção/consulta. Não adiciona uma API de prescrição duplicada.

## Infraestrutura compartilhada — 014

Fontes/fábrica PDFKit, resposta privada e persistência limitada de artefatos são compartilhadas com [relatórios físicos](api-relatorios-fisicos.md). `kind=workout` mantém vínculos/versões existentes; `kind=physical_report` usa vínculo de aluno/manifest. Nenhum contrato de exportação de treinos foi substituído. PDF.js preserva rótulos originais por padrão e aceita rótulos próprios de relatório.

## Privacidade 015

Filename de download agora usa `formfisik-treino-AAAA-MM-DD-vN.pdf`, sem nome do aluno. Conteúdo continua explicitamente selecionado, privado e reautorizado; prévia/download usam os mesmos bytes. Erros de geração encerram o stream PDF.
