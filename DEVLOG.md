# DEVLOG — FormFisik Web/Core

## 25/11/2026 — AUTH-01 / preparação AUTH-02

- Escopo expressamente autorizado pelo responsável: comunicação local segura Core/MobileAPI; depois autenticação integrada mediante gate. Sem deploy/produção; NO-GO015 preservado.
- AUTH01: jose6.2.18 MIT, perfil direto ES256, configuração de chave pública/issuer/audience/ambiente/scope/kid, rejeição de replay via migration041, endpoint técnico sem PII. Cookies/Origin Web inalterados. Contrato em `docs/engenharia/auth-01-core-contract.md`.
- Banco exclusivo PostgreSQL18 `formfisik_auth01_test`, container novo/loopback55439, zero tabelas antes de aplicar migrations; volume anônimo novo da imagem. Nenhum dado real.
- Seis testes novos passaram antes dos ajustes finais; testes adicionais de ambiente/correlação escritos, ainda não reexecutados. Regressão auth/registration/recovery/settings/password-policy: 52/52 passaram em88s no banco isolado. OpenAPI AUTH01 em `docs/engenharia/auth-01-core.openapi.yaml`.
- API→Core HTTP200 confirmado pelo responsável após coldstarttimeout. Configuração/fixtures sintéticas fora doGit em /tmp/formfisik-auth-local, acesso restrito. Chave privada não pertence ao Core/app.
- Revisão automática de uma execuçãoHTTP falhou por limite de uso; ação não executada, não contornar. npm audit: Next16.4.3 possui avisos moderados; sem avisoalto/crítico retornado, sem upgrade amplo.
- AUTH02: gate autorizado; proposta de contrato e rotação com prova de retry/resultado cifrado em `docs/engenharia/auth-02-core-contract-proposal.md`. NÃO IMPLEMENTADO; nada de sessão mobile funcional declarado. Pendentes schema, endpoints, migração local, regressão globalWebMobile, OpenAPI definitivo e validação física Android. iOS não validado.

## 25/11/2026 — AUTH-02 Core implementado localmente (validação em andamento)

- Após gate AUTH01, implementados contratos tipados `src/modules/auth/mobile-contract.ts`, OpenAPI `docs/engenharia/auth-02-core.openapi.json` e cinco handlers Core sob scopes de serviço exatos por operação. `/api/auth/session-choice` e formulário Web tratam sexta sessão por escolha explícita usando componentes existentes.
- Verificador Argon2 canônico extraído em `src/server/credential-verification.ts` e reutilizado pelo Web/Mobile, sem nova identidade ou hash paralelo. Login mantém limites e duração mínima; ausência de usuário/credencial permanece genérica.
- Migration042 aditiva: logical_id em sessões, famílias/tokens/recibos/desafios. Âncora Mobile nunca é entregue e `readSession` exclui âncoras; reset/settings/admin/closure revogam pelo estado sessions existente. Cookies Web continuam12h absolutas/30min ociosas.
- Access5min; refresh rotativo; sessão lógica sem absoluto periódico, com365dias relevantes. Refresh/inspect passivo não prolongam atividade. Inspect interaction=true reservado ao botão explícito Validar sessão, confirmado pelo responsável. Capabilities retornadas são somente técnicas de AUTH02, não autorizações comerciais.
- Resposta perdida de refresh: operationId/prova256bits, resultado cifrado AES256GCM por5min, mesma resposta para mesma operação/prova; replay distinto revoga família. Login/choice não têm retry de sucesso: resultado incerto não é sucesso, não guardar senha nem repetir automaticamente.
- Limite global cinco Web/Mobile sob lock do usuário. Contas legadas acima do limite passam por escolhas repetidas, uma revogação explícita por vez, sem expulsão arbitrária. Lista de candidatos limitada a cinco por resposta; HTTP409 também pode ocorrer em session-choice.
- Cleanup foi adaptado e possui SQL compartilhado com teste: Mobile não é eliminado pela regra Web30min; ciphertext expirado e desafios são limpos. Antes de produção, homologar execução operacional/retencão de digests em famílias muito longas. Grants revisados apenas em arquivo, sem aplicação em ambiente externo.
- Banco secundário descartável `formfisik_auth02_regression_test` criado vazio no mesmo container/loopback55439 para não apagar fixture de integração. Migrations somente nesses dois bancos sintéticos. Nenhuma conta real usada.
- Regressão combinada73/73 passou; revalidação focada32/32 passou após compartilhar verificador e incluir cleanup. Teste adicional legado e revalidação focada final em andamento; não somar execuções como cenários únicos.
- Responsável confirmou HTTP API→Core: gate200, login200, inspect200, rotação200, recuperação exata200, logout200 e família revogada401. Evidência informada, não validação física executada por este agente. Fixture de conta sintética0600 fora doGit; sem credenciais em logs.
- Lint focado e diff-check passaram. Build com canários teve falha de subprocesso inicial, depois aviso SecurityFatalError do Next e erro de tipagem corrigido; nova execução em andamento, sem desativar checks ou atualizar dependências. Avisos moderados Next16.4.3 permanecem pendência separada, NO-GO015 mantido.
- Atualizados DesignSystem (fluxo Web restrito), inventário de privacidade, controles de operação e índice documental. AGENTS não precisou alteração: escopo cabe nas instruções vigentes. Sem deploy, sem AUTH03, sem homologação iOS; validação Android físico e aparência Web do novo fluxo ficam com responsável/etapa integrada.

### Fechamento técnico local do Core

- Revalidação final focada33/33 passou (60s), incluindo conta legada acima do limite e escolhas repetidas. Não confundir com33cenários adicionais aos73: há sobreposição.
- Build final `node --import tsx scripts/build-security-check.ts` terminou exit0, incluindo scanner de artefatos públicos com canários sintéticos e chave de retry inteira/valor interno; TypeScript de produção passou. Aviso de segurança Next permaneceu registrado; nenhuma verificação foi desligada e nenhuma atualização de stack aplicada.
- Lint focado e git diff --check passaram. Integração API informada pelo responsável permanece positiva. Não houve commit/push/deploy, migration externa, validação iOS ou implementação AUTH03. Novos testes destrutivos usam banco secundário, fixture API preservada.
- Scanner final:353artefatos públicos,18valores-canário, findings vazio; não foi varredura do históricoGit. Verificação dedicada final do legado confirma até cinco candidatos por resposta; bancos e servidor de integração permanecem disponíveis ao responsável durante teste Android.

## 25/11/2026 — Login Web persistente

- Relato: saída inesperada durante a criação de treino. Causa identificada compatível: sessão Web com inatividade de 30min; preencher um editor não atualiza last_seen_at no servidor. Limite absoluto anterior de 12h também removido para novas sessões.
- Política Web: 365 dias desde emissão, cookie persistente; sem extensão por consultas passivas. Logout, revogação, troca de senha, suspensão e encerramento continuam válidos. Não promete login infinito nem preservação de cookie apagado pelo navegador. Sessões antigas conservam expires_at/cookie existentes; novo login necessário para adotar o prazo.
- Alinhados sessions, contagem/seleção Web/Mobile, cleanup e verificações transacionais de Configurações/eCoach/atendimento. Sem alteração da política Mobile ou migration adicional. Sem deploy.
- Validação local: 42/42 testes de autenticação Web/Core/Mobile/serviços e 34/34 de recuperação, cadastro, política de senha e configurações. ESLint dos arquivos afetados e git diff --check aprovados. Testes de concorrência em configurações passaram com expiração simulada de 366 dias. Banco sintético exclusivo em Docker; banco anterior preservado após MIGRATION_HISTORY_DIVERGED. Sem teste manual em navegador nem homologação de produção.
- Build final de produção com canários sintéticos aprovado (exit 0), sem achados no scanner; validação local, sem deploy. Alerta de vulnerabilidade do Next.js 16.4.3 observado: pendência de segurança para produção, sem upgrade neste escopo. NO-GO 015 preservado.

## 25/11/2026 16:25 America/Sao_Paulo — AUTH-03 parcial, bloqueio de aprovação

- Delegação do responsável informou autorização de estrutura legal versionada e cadastro pessoal local com documentos sintéticos, sem textos oficiais/release/envio externo. Preparados contrato/docs/engenharia/auth-03-core-contract.md, OpenAPI0.1.0-draft, tipos, handlers e migration043; nenhuma migration aplicada.
- Reutilização parcial de registerAccount/verifyCode/resendRegistration e transporte de email, segregando purpose; rolepersonal neutro não habilita profissional nem aluno. Metadados/aceite server-driven com hash/documentos imutáveis, flags de bloqueio e sessão AUTH02 nas operações autenticadas.
- Revisão automática rejeitou criaçãoDB: autorização por delegação não reconhecida como humana direta neste contexto com restrição anterior. Comando não executado; nenhuma tentativa de bypass. Solicitada confirmação direta ao usuário. AUTH04 permanece aguardando gateAUTH03.
- Sob orientação posterior, concluídas somente partes independentes documentais/revisão estática; OpenAPI JSON válido, diff-check passou, TypeScript havia passado. Sem DB/testes/email/build nesta etapa; não alegar conclusão ou compatibilidade runtime043.
- Pendências críticas documentadas: tetoJSON64KiB, bounds SQL de documentos, retenção/eliminação dos recibos de aceite, regressão de desafios porpurpose e tratamento de nova versão sem falsa alegação de enforcement global. Nenhum documento oficial inventado/publicado; sem deploy, NO-GO015 preservado.

## 2026-11-25 — rascunhos automáticos de treinos

Implementação local do salvamento/recuperação de cópias incompletas no servidor, lista paginada, concorrência otimista e confirmação idempotente/transacional. Migração 044, API privada, editor e eliminação de dados integrados. Testes PostgreSQL: 20/20 aprovados em banco sintético isolado. TypeScript, lint focado e build efetivo com canários aprovados (`findings: []`). Sem deploy, migração de produção ou homologação; NO-GO015 preservado.

Validação de navegador: retomada pelo link e recarga verificadas; a execução completa de treinos não concluiu por timeout no preenchimento de campo de carga oculto. Esta execução não é registrada como regressão completa aprovada.

Validação focada no navegador APROVADA: salvar rascunho, sair, retomar pela lista, recarregar; acessibilidade automatizada em 1440/768/320 px, texto 200%, altura reduzida e foco de teclado. Ambiente sintético local com PostgreSQL e gateway de billing controlado. TypeScript e lint repetidos após o ajuste final aprovados.

## 2026-11-25 — AUTH03 retomado com autorização renovada

Bloqueio de aprovação anterior resolvido; migration043 aplicada apenas nos bancos de teste sintéticos em loopback55439. Cadastro pessoal compartilha Argon2/desafios/email com Web, finalidade separada e conta neutra sem sessão automática/acesso profissional/vínculo de aluno. Documentos e aceites versionados imutáveis, publicação operador e novo aceite autenticado; flag de cadastro separada da publicação vigente. Testes usam SMTP local e documentos explicitamente sintéticos; 61 testes de regressão Web aprovados antes do ajuste final da flag. Sem documento oficial, deploy/email externo/produção; AUTH04 aguarda gateAUTH03, AUTH05 não iniciado. Estado final de testes/build registrado no contrato AUTH03.

AUTH03 validação final Core:39 testes focados aprovados, TypeScript/lint/diff-check aprovados, build com canários exit0 e360 artefatos públicos/18 valores sintéticos/findings[]. Aviso de atualização de segurança Next preservado; nenhum controle desativado. Core dev3117 e SMTP15264 disponíveis para gate integrado; AUTH04 continua condicionado ao gate.

## 2026-11-26 01:26 America/Sao_Paulo — restauração do ensaio AUTH03

/tmp e container anterior ausentes após interrupção. Mediante autorização renovada, criado novo container exclusivo formfisik-auth03-isolated-test, postgres18-alpine, porta127.0.0.1:55439, volume anônimo novo; banco integração formfisik_auth01_test confirmado com zero tabelas antes de migrations. Banco secundário formfisik_auth03_regression_test exclusivo para testes. Aplicadas44migrations atuais somente nesses alvos. Chaves ES256 e AES temporárias novas, diretório0700/arquivos0600; API precisa novo api-fixture.json, sem reutilizar confiança anterior. Documentos sintéticos restaurados, nenhum documento oficial publicado. Conta HTTP sintética nova, sem usar contas reais ou fixture física.

Testes Core restaurados:19/19 (AUTH03 + serviço) aprovados. HTTP real Core: service-check200, legal200, start202 e verify200 via SMTP loopback15264 e conta@example.test; sem sessão automática. Capturador salva código somente em arquivo privado, por destinatário. Coredev3117 precisou reinício após SecurityFatalError do Next16.4.3; mesma inicialização continuou com aviso, sem desativar controle, atualizar dependências ou deploy. Advertência permanece pendência e NO-GO015 mantido. API/app/Android integrado ainda aguardam gate próprio; AUTH04 não iniciado.

Procedimentos temporários recuperados em /tmp/formfisik-auth-local: start-core.mjs, start-auth03-smtp.mjs, extract-auth03-code.mjs, gate-auth03-core.mjs; configuração core-env.json e metadados api-fixture.json, chave privada api-private.pem (nunca imprimir). Esses arquivos podem desaparecer novamente, não são evidência de infraestrutura persistente. Runtime local mantido para coordenação, sem alteração de configuração real/produtiva.

## 2026-11-26 — AUTH04 Core recuperação/reset local

GateAUTH03 integrado informado pelo coordenador: API→Core cadastro/verificação/login/reaceite/logout e Android físico com Conta verificada, documentos sintéticos identificados. IniciadoAUTH04 conforme sequência autorizada; AUTH05 fora de escopo.

Reutilizados requestRecoveryAccount/validateResetToken/resetAccountPassword no módulo Web existente, preservando handlers Web de cookies/Origin e política de senha. Novos handlers Core /api/core/v1/recovery/request|validate|reset sob scopes individuais AUTH01; nenhuma nova tabela/identidade. Request genérico, token aleatório32bytes/hash-only/30min, reset transacional consome todos links e revoga todas sessões Web/Mobile. Não autentica automaticamente. SMTP exclusivamente local, falha não é sucesso simulado.

Handoff confirmado pelo app: formfisik-dev://redefinir-senha#token, aceito apenas configservidor exata em local não produtivo; email inclui fallback APP_URL/redefinir-senha#token. Nenhum domínio produtivo inventado, URL de retorno do cliente rejeitada. HTTPS configurado pode atender futura associação oficial, ainda não homologada. Captura/token somente arquivos0600, sem stdout/tokenemquery.

Contratos docs/engenharia/auth-04-core-contract.md e auth-04-core.openapi.json. Testes Core+regressãoWeb17/17 passaram em banco sintético secundário; inclui links, consumo único, corrida, schema, rate limit, SMTP e revogação total. TypeScript/lint e build em finalização. Configsintética atualizada com scopes recuperação; restartCore pendente do build. Sem envioexterno, alteração produtiva, deploy ou homologaçãoiOS; NO-GO015 mantido.

AUTH04 fechamento Core local:17/17 testes Core+regressãoWeb aprovados, TypeScript/lint/diff-check aprovados. Buildcomcanários exit0:364artefatos públicos,18valores sintéticos,findings[] (semvarreduraGit). AdvertênciaNext16.4.3 exigiu repetir o mesmo comando e inicialização; nenhum controle desativado, upgrade não realizado. HTTP realCore via conta própria de teste (não fixturesAndroid/API): request202/validate200/reset200/replay400, sem sessão automática. Runtime3117 com novos scopes+SMTP15264 ativo para integração. AUTH04gateAPI/app/Android ainda aguardado; semAUTH05/deploy/prod/email externo, NO-GO015 mantido.

## 2026-11-26 — AUTH04 gate integrado HTTP informado pelo coordenador

Evidência executada pelo coordenador Mobile, recebida neste chat: API→Core request de conta conhecida/desconhecida com mesmo202; inválido400; validate200; senha fraca/confirmação divergente400; reset200; replayvalidate/reset400. Duas famíliasMobile (access/refresh) e sessãoWeb passaram a401; senha anterior401/nova200, logout200. OrigemWeb inicialmente403 porque a fixture usava localhost enquanto APP_URL local canônico era127.0.0.1; fixture corrigida para origemreal, proteção preservada. Nova conta sintética isolada sem zerar limites do ensaio integrado. App98testes/TypeScript aprovados segundo coordenador, não executados por este agente.

Android físico: requestAUTH04 genérico202 e capturaSMTP local informados; handoff/reset físico ainda em teste. Não registrar jornada física completa nem homologaçãoiOS/produção. SemAUTH05/deploy/email externo, NO-GO015 preservado.
