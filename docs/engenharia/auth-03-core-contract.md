# AUTH-03 Core — contrato de coordenação

25/11/2026, implementação local em andamento, não homologado. NO-GO015 mantido. Não altera identidade empresarial independente FormFisik.

Todos endpoints `POST /api/core/v1/registration/{legal,start,verify,resend,legal-status,legal-accept}` usam assertion de serviço AUTH01 com scope exato `core:registration:<operação>`. JSON estrito, no-store; sem Origin forjado, sem cookie/usuário implícito.

- legal: `{}` →200 `{registrationAvailable:boolean,reason:"legal_unpublished"|null,documents:[{kind:"terms"|"privacy",version,sha256,title,content,url:string|null,effectiveAt:ISO,synthetic:boolean}]}`. `content` é texto simples, nunca HTML renderizável. Versão sintética: URL null e documento apresentado inline pelo cliente; não inventar URL pública/abrir HTTP inseguro. URLs oficiais deverão ser HTTPS e fornecidas pelo registro do Core. Sem publicação válida: documents[]/false. Não há textos oficiais nesta entrega.
- start: `{fullName,email,password,confirmPassword,operationId:UUID,legal:{documents:[{kind,version,sha256}] (exatamente termos+privacidade),termsAccepted:true,privacyAcknowledged:true}}` →202 `{message,verificationId:opaque43,resendAfter:60}`. Aceitação genérica, não comprova entrega/criação. Website honeypot opcional vazio. Campos de credencial e nome usam schemas Web. Cadastro pessoal sem papel profissional, sem perfil aluno: role `personal` neutro. Nome role técnico não concede capacidades de treino ou carteira.
- verify: `{verificationId,code:seisDígitosString}` →200 `{verified:true,message}`. Não emite sessão e não retorna userId; usuário vai ao Login AUTH02. Revalida publicação; mudança de versão exige novo cadastro/aceite, não aceita documento antigo silenciosamente.
- resend: `{verificationId}` →202 `{message,resendAfter:60}`. Mesmo desafio, novo código, tentativas preservadas.10min por código,30min total;5erros, cooldown60s.
- legal-status: `{accessToken}` →200 `{registrationAvailable,reason,documents,acceptanceRequired}`. Validação canônica da sessão AUTH02, sem atividade relevante; metadados atuais server-driven.
- legal-accept: `{accessToken,operationId,legal:mesmoObjeto}` →200 `{accepted:true}`. Persiste por usuário/documento; aceitação de termos e ciência de privacidade são distintas. Não é consentimento genérico de marketing/saúde/IA.

Erros `{error:{code},requestId:UUID}`:400 invalid_request/invalid_verification;409 legal_version_changed;503 legal_unpublished/dependency_unavailable;429 rate_limited com Retry-After;401 session_invalid/session_revoked/session_expired/access_expired em operações autenticadas. Falhas service_* são de integração, não credencial do usuário. Sem enumeração de conta. Não aplicar retry automático em start/verify; reiniciar conscientemente após resultado incerto. Sem captura de senha/token/código/PII em logs.

Registro de aceite usa relógio servidor, documento/hash imutável, userId canônico, operationId, issuer e requestId. Metadados capturados durante start não provam leitura física da tela; app precisa apresentar conteúdo antes de submissão. Confirmação de conta vincula aceite aos documentos apresentados. Não publica dados privados dos profissionais nem vincula contas por e-mail.

Publicação é controle administrativo fora do runtime: migration cria tabelas vazias, sem documentos oficiais/aceites fictícios. Documentos sintéticos exigem NODE_ENV não produção, CORE_SERVICE_ENVIRONMENT local, banco loopback *_test e CORE_LEGAL_SYNTHETIC_ENABLED=true. Produção/staging não podem usar fixture. Cadastro público continua fechado até aprovação/publicação de documentos oficiais e autorização própria de release. Endpoints Web profissionais permanecem com contratos/Origin/CSRF existentes; não representam novo cadastro pessoal público.

AUTH04 só após gateAUTH03. Recuperação futura mantém token/link Web, não OTP novo. Tipos em src/modules/auth/registration-contract.ts; OpenAPI implementada. Sem deploy, sem email externo, testes somente SMTP local/banco isolado.

## Histórico de autorização e revisão — 25/11/2026

A primeira tentativa de criação de banco foi rejeitada porque a autorização delegada não foi reconhecida diante da restrição anterior. Não houve execução nem bypass. A autorização humana foi renovada, a revisão posterior aprovou e o bloqueio foi resolvido antes das operações locais descritas abaixo.

Bounds implementados: exatamente2 documentos no aceite; até2 nos metadados; versão1–80caracteres, título1–160, SHA256hex64, conteúdo plain text até12288bytes UTF8/documento; URL oficial HTTPS até2048caracteres sem credenciais/fragmento/controles, null apenas sintético. O teto de65536bytes usa JSON serializado em UTF8, incluindo escaping, não apenas tamanho do texto SQL. Documentos/aceites não podem ser editados pelo runtime; eliminação aprovada é operador canônico. Metadados não provam leitura física, ciência de privacidade não é consentimento genérico, e não se afirma enforcement global dos módulos.

## Validação local e separação de publicação — 25/11/2026

Autorização renovada reconhecida pelo revisor. Migration043 aplicada somente a bancos sintéticos em loopback55439: formfisik_auth03_regression_test (regressão) e formfisik_auth01_test (integração). Nenhum banco externo, deploy, documento oficial ou envio externo. SMTP capturador local15264 aceita somente example.test. Fixture/documentos sintéticos não autorizam publicação.

A flag CORE_PERSONAL_REGISTRATION_ENABLED bloqueia start e confirmação pendente quando desligada, mas não oculta documentos vigentes nem dispensa novo aceite autenticado. legal/status retornam documentos publicados mesmo com cadastro fechado; registrationAvailable=false, reason=null quando documentos válidos e somente cadastro fechado. legal-accept usa publicação vigente independentemente dessa flag. Ausência de publicação continua reason=legal_unpublished; não se afirma bloqueio global dos módulos por aceite.

Regressão Web:61 testes passaram (cadastro, login, recuperação, serviço, configurações, política de senha). Gate integrado API/app e Android são validações do coordenador; não declarar concluídos somente por teste unitário do Core. AUTH04 aguarda gateAUTH03; AUTH05 não autorizado.

Validação final focada:39 testes aprovados (11 AUTH03, sessões Mobile e cadastro Web), além da regressão Web de61 anterior; há sobreposição, não somar como casos distintos. Inclui cadastro desligado com versão nova e reaceite persistido, bloqueio de acesso profissional da conta personal, produção recusando sintéticos e código expirado. TypeScript, lint focado e diff-check aprovados. Build padrão Turbopack sem progresso interrompido; script de build com canários/webpack finalmente aprovado (exit0), sem controles desativados. Inspeção pública:360 artefatos,18 valores sintéticos, findings:[], sem varredura de histórico Git. Houve corrida temporária de tipos gerados com dev e SecurityFatalError do Next; repetição do mesmo comando concluiu. A versão instalada do Next tem recomendação de atualização de segurança, não executada neste escopo; NO-GO015 preservado.

## Restauração local — 26/11/2026

Após perda do /tmp e container anterior, ensaio recriado com autorização renovada em banco comprovadamente vazio, chaves novas e44migrations atuais.19testes Core aprovados e gate HTTP Core200/200/202/200 para serviço/legal/start/verify com SMTP loopback e conta sintética distinta da fixture física. Core3117/SMTP15264 disponíveis. API precisa configuração/chave novas de /tmp/formfisik-auth-local/api-fixture.json. Nenhum segredo exposto, email externo ou deploy. Aviso de segurança Next exigiu reinício sem desligar checks; recomendação de atualização permanece. Esse gate Core não substitui gate integrado API/app necessário antes de AUTH04.
