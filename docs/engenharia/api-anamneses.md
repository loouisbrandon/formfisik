# Contratos HTTP — Anamneses017

Todas as respostas: JSON privado/no-store/no-referrer/nosniff. Não registrar corpos, credenciais ou URLs com fragmentos. [Módulo](../modulos/anamneses.md).

## Profissional — `/api/intake`

GET ePOST: sessão opaca válida, profissional confirmado e assinatura/trial canônico; propriedade derivada da sessão. Sem autorização pelo frontend. POST exigeOrigin igualAPP_URL eapplication/json até 128 KiB/15s. Sem CORS genérico. Schemasstrict rejeitam extras.

GET: `view`, `id` quando requerido, `page`/`historyPage`1–100000; `studentId`UUID e `state` opcionais na lista de solicitações.

| view | Resultado mínimo |
| --- | --- |
| forms | items{id,title,revision,archived,created_at},total,page,pageSize20 e metadado do padrão; nunca respostas |
| form + id | Rascunho, revisão, arquivo, indicadorstandard e versões{id,number,created_at} até 100 |
| version + id | Definição publicada e número; owner validado, padrão global somente leitura |
| requests | items{id,student_link_id,state,created_at,expires_at,revoked_at,submitted_at,number,title},total,page,pageSize20; filtro de vínculo/estado |
| request + id | Versão/definição, estado/vínculo/datas, respostas quando existentes, identificação original quando pendente, eventos20/historyPage/historyTotal; consulta auditada |
| summary + id do vínculo | Contagens total/pendentes, última solicitação e última resposta/número, sem respostas/contatos |

POST `action`:

| action | Entrada adicional / efeito |
| --- | --- |
| save | definition validada; id/revision para edição, omitidos na criação. Retorna{id}. Revisão desatualizada409 |
| publish | id do modelo, revision. Retorna{id da versão,number}; snapshot imutável |
| archive | id do modelo. Impede novos convites; preserva versões e solicitações |
| invite | versionId publicada ou padrão, studentId opcional. Retorna{id,token} **somente nesta criação**, sem persistir token puro |
| revoke | id da solicitação ainda não respondida. Invalida acesso público |
| reviewing / reviewed | id respondido e vinculado; transição válida auditada |
| resolve | id pendente, confirmed:true e exatamente um de studentId próprio ou createSeparate:true. Exige verificação independente fora do sistema; não altera identidade existente |

Sem endpoint de edição de resposta, recuperação de token, publicação global, autoassociação de conta ou eliminação paralela. Duplicar modelo/pergunta/seção é nova definição em rascunho, com validação ao salvar.

Códigos:200 operação;400 schema/campos;401 sessão;403 origem/perfil/comercial;404 terceiro/desconhecido idênticos;409 conflito/transição;422 limite de versões;429 abuso;503 dependência. IDs e dados recebidos não aparecem em erro/log.

## Público — `POST /api/intake/public`

Sem sessão/conta,Origin estrito,JSON 128 KiB/15s, limites por IP/HMAC de token. `X-Robots-Tag:noindex,nofollow,noarchive`;noReferrer/noStore. Token só é enviado no corpoPOST e fica em memória do navegador. O caminho `/responder` não contém query ou dados cadastrais.

- `{operation:'open',token}` → `{professional,definition,number,registrationRequired}`. Sem aluno/contatos/respostas prévias/donoUUID/digest.
- `{operation:'submit',token,submission:{answers,acknowledged:true,registration?}}` → `{received:true}`. `registration` obrigatório somente para novo; proibido no existente. Nome/contatos/nascimento validados pelo schema 008. `answers` usaIDs conhecidos e valores do tipo previsto. Campos ocultos ignorados por regra derivada no servidor; outrosIDs rejeitados.

410 genérico para link malformado, desconhecido, expirado, utilizado, revogado ou conta/vínculo indisponível.400 para conteúdo inválido/Origin;429 limite;503 dependência real. Confirmação é igual para novo seguro ou pendente, sem revelar duplicidade/conta. Não háGET que consome token; scanner de link não envia respostas. Rede perdida após COMMIT pode produzir410 no retry; confirmar com o profissional, sem abrir histórico pelo token.

## Compatibilidade022

Catálogo compartilhado internamente recebe usage, default intake. Chamadas públicas/profissionais017 permanecem restritas à finalidade intake; check-ins usam `/api/checkins` e tabelas de solicitações/respostas próprias. Helpers de capacidade criptográfica compartilhados; contrato público017 preservado.

### Refinamento da consulta de solicitações

`view=requests` aceita `q` string até120 caracteres, busca literal case-insensitive por título da versão ou nome do aluno já vinculado. O JOIN de nome exige propriedade em student_links e student_records. DTO acrescenta `student_name` (null sem vínculo), sem contatos ou identificação pendente. Resposta acrescenta `summary{total,waiting,pending,reviewed}` da carteira/contexto studentId, independente dos filtros q/state. waiting exclui expirados/revogados; pending soma received/pending/reviewing. Mesma autorização/limites e paginação20; nenhuma migration.
