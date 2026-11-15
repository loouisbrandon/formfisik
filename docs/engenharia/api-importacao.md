# API de importação — Marco026

Todas as operações exigem sessão opaca de profissional confirmado/habilitado, entitlement SaaS e isolamento do proprietário no servidor. UUID não é autorização. POST exige Origin correto, JSON até3MiB/15s; arquivo interno até1MiB. Schemas strict recusam owner, scope, estado, ativação e campos não autorizados. Rate120 GET/POST/min por proprietário,5 prévias/min,60 lotes/min e10 relatórios/min, com HMAC durável. Até3 jobs abertos. Respostas private,no-store/no-referrer/nosniff; sem logs de arquivo, nome, contato, cookie ou corpo.

`GET /api/imports?view=history&page=1`: id,kind,state,version,total,expires_at,created_at;20 por página, ordem estável e total. Não inclui inputs/digests.

`GET ?view=job&id=UUID&page=1`: resumo+counts e rows{items,total,page,pageSize20}. Linha: line,state,decision,error_code,fields,result_id,file_matches,candidates[{id,name}],moreCandidates. fields somente na prévia válida temporalmente, normalizados e sem dados ignorados/inválidos; após execução não retorna dados pessoais da entrada. Candidatos privados limitados ao proprietário e catálogo oficial acessível, até3 com aviso de outros. HMAC, chaves de linha e aprovação são somente servidor.

`GET ?view=report&id=UUID`: CSV privado Registro/Situacao/Codigo, até500 linhas, quoting/anti-formula/BOM, filename fixo, sem dados cadastrais. Registra report_downloaded; erro não retorna arquivo fictício.

`POST` comandos:

- preview: creationKey UUID,kind students/exercises/templates,text,delimiter comma/semicolon,mapping{campoCanônico:índice0..19}. Mapeamento whitelist sem colunas repetidas. CSV até500 linhas/20 colunas; JSON native até20 modelos. Cria somente prévia. Mesma intenção/key repete job; outra409.
- confirm: id,version,choices[{line,decision:create|skip|distinct}],confirmed:true. Até500 escolhas únicas; omissão conserva padrão. create só para valid, distinct só duplicate/conflict, inválidos não podem ser criados. Aprovação igual é repetível, alteração posterior409.
- process: id. Exige aprovação, processa até25 pendentes, retorna id,state,version,counts mínimos para progresso, sem recarregar lista a cada lote. Retry/concorrência podem avançar o próximo lote já autorizado, nunca duplicar registros. Estado terminal retorna sem efeitos.
- cancel: id,confirmed:true. Cancela pendentes e limpa inputs, preservando importados. Estado já terminal é preservado.

Estados de job: preview,processing,completed,canceled,expired. Linhas: valid,invalid,duplicate,conflict,imported,ignored,rejected,erased.400 inválido/formato;401 sessão;403 entitlement/origem;404 job não autorizado;409 prévia/versão/decisão/limite/expiração;429 abuso;503 dependência. Não retorna SQL, conteúdo inválido ou dados de outro proprietário.

Modelo/migrations, retenção e política de falha em [módulo](../modulos/importacao.md), [ADR027](../arquitetura/ADR-027-importacao-transacional.md) e [operação](../operacao/importacao.md). Nenhum adapter de terceiros ou serviço externo ativado.
