# ADR 013 — Fotografias privadas e calendário agregado

Estado: implementado localmente; serviço R2 externo ainda não homologado.

A FormFisik é empresa independente fundada por Brandon Louis. Fotografias datadas pertencem ao vínculo privado entre profissional e aluno. Não pertencem a uma avaliação física: datas com somente fotografias são válidas.

## Auditoria e reutilização

- 008: `student_links`, propriedade, estado cadastral e data de nascimento; `StudentsPicker`, busca e páginas de 20. Nenhuma segunda identidade de aluno.
- 012: data civil validada, formatação brasileira, períodos, SQL parametrizado, avaliações/detalhes, pontos SVG e cálculos exatos. A extração de `periodSchema/periodIntervals` evita calendários com intervalos divergentes.
- 007/comercial: shell, sessão opaca, confirmação de e-mail e `professionalAccess`, incluindo reconciliação canônica; sem autorização por estado do cliente.
- 009/010: `action/control`, transação e padrões de versão/conflito; não muda prescrição.
- 011: auditado upload de logo com Sharp. É pequeno, persistido como bytea e não serve a fotografias corporais. Reutiliza-se Sharp instalado para decodificar/reencodar; não se reutiliza a persistência de logo.
- Não havia cliente S3 nem repositório privado de fotos. Adicionado somente `@aws-sdk/client-s3`; interface de três operações, sem framework de arquivos, URLs públicas ou solução paralela de autenticação.

## Decisões

1. PostgreSQL guarda identidade, autorização, metadados, versões, operações idempotentes e fila durável. Bytes ficam somente no armazenamento privado. Migration aditiva `013_progress_photographs.sql`.
2. `PrivatePhotoStore` expõe `put/get/remove`. Produção resolve R2; testes injetam implementação controlada explicitamente no servidor de testes. Não existe flag HTTP/env que transforme produção em armazenamento simulado.
3. Endpoint S3 derivado de conta validada; região `auto`. SDK e compatibilidade seguem [exemplo oficial R2](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/) e [API S3 do R2](https://developers.cloudflare.com/r2/api/s3/api/). Configuração não comprova conectividade nem permissões.
4. Leitura pelo proxy autenticado da aplicação, revalidando estado após I/O. `NextImage unoptimized` evita cache do otimizador. Não se devolve chave do objeto ou URL do bucket.
5. Reserva de upload antes do PUT, confirmação somente depois de PUT bem-sucedido e nova validação transacional de versão/estado. Falhas, abortos e substituições geram itens de limpeza. Uma resposta perdida não produz objeto sem referência no banco.
6. Exclusão lógica bloqueia leitura imediatamente; remoção física é assíncrona, com confirmação e saneamento de metadados após DELETE. Tombstones conservam somente referências operacionais opacas para repetir DELETE, inclusive após PUT atrasado. Ver operação e política de retenção.
7. Calendário usa UNION/COUNT em intervalo mensal/anual e apenas fotos confirmadas de registros ativos. Não baixa imagens. Detalhes do dia e escolhas de comparação são paginados.
8. Painéis progressivos mantidos montados preservam rascunhos, filtros e seleções; consultas de evolução só acontecem no painel ativo. Formulários de medidas usam grupos recolhíveis. Nenhuma virtualização complexa foi introduzida.

## Consequências e limites

Requisições de imagem consomem tráfego/CPU da aplicação, deliberadamente em troca da revogação e autorização central. Upload JSON/base64 é limitado a uma imagem por requisição e processado sequencialmente; futuro upload multipart só se evidência operacional justificar. A verificação documental da autorização é responsabilidade do profissional: registrar referência e atestar não valida juridicamente um documento. Ausência de data de nascimento exige declaração explícita, nunca consentimento presumido. Sem conta/bucket/chaves, criação e upload permanecem indisponíveis; avaliações e calendário de dados existentes continuam operacionais.
