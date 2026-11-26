# AUTH-02 — proposta de contrato para coordenação

Estado: EM IMPLEMENTAÇÃO LOCAL, 25/11/2026. Gate AUTH01 informado como validado pelo responsável. Contrato tipado em `src/modules/auth/mobile-contract.ts`; validação integrada Mobile/API pendente. FormFisik é empresa independente; NO-GO015 preservado.

## Autoridade e transporte

Core é autoridade única users.id/credentials/sessões. Mobile API só transporta, valida contratos e autentica seu serviço; não cria usuários ou armazena senhas. Rotas `POST /api/core/v1/mobile-auth/{login,refresh,inspect,logout,session-choice}`; assertion de serviço via Authorization e scope exato `core:mobile-auth:<operação>`. Access/refresh de usuário no JSON privado (sem logs), para não conflitar com Authorization de serviço. HTTPS obrigatório fora de loopback, no-store, timeout e sem retry automático de login/mutação. Cookies e Origin Web intactos.

## Parâmetros propostos para implementação

- Access opaco aleatório256bits, validade5min, digestSHA256 persistido. Revogação é verificada no Core mesmo antes da expiração.
- Refresh opaco aleatório256bits, rotativo, digestSHA256; sem validade absoluta periódica da sessão lógica.
- Sessão lógica expira após365dias consecutivos sem atividade relevante canônica. Refresh, polling e inspect passivos não renovam esse prazo. No AUTH02 `inspect {interaction:true}` corresponde exclusivamente ao botão explícito Validar sessão na área mínima; `interaction:false` ou omitido para restauração/polling. API não pode converter AppState/polling em interação. Regra confirmada pelo responsável. Novos recursos futuros devem autorizar ações relevantes no Core.
- Identificador de sessão estável; dispositivo é metadado, nunca prova de identidade. Uma família refresh equivale a uma sessão.
- Cinco sessões lógicas globais Web+Mobile: conta bloqueada transacionalmente; contar apenas sessões válidas, descontando cookie Web anterior revogado na mesma operação. Sexta tentativa retorna desafio restrito de escolha, não access/refresh. Web também precisa suportar escolha explícita para não emitir sexta sessão; não alterar tempos de cookie existentes.

## Resposta perdida e rotação

Antes de enviar refresh, app persiste de forma atômica em secure storage `{operationId, retrySecret, oldRefresh}`; retrySecret aleatório256bits não é o jti do serviço. Cliente usa single-flight. Servidor bloqueia família e grava atomicamente consumo, sucessor e recibo de operação. Recibo associa digest do refresh anterior, digest da prova de retry e hash da entrada normalizada. Resultado com novos tokens fica cifrado AES256GCM sob chave de servidor identificada por kid, com AAD de sessão/operationId. TTL de recuperação proposto5min. Chave não vem de segredos de CSRF ou senha.

Mesmo refresh consumido + mesma operação + mesma prova + janela válida retorna exatamente o sucessor gravado, sem nova rotação e sem renovar atividade. Outra operação/prova sobre token consumido revoga a família como replay. Nunca conceder grace period genérico. Se o sucessor já foi consumido, não devolver credenciais antigas como se fossem atuais: retornar conflito de recuperação específico. App grava novo par e remove pendência atomicamente; nunca apaga credenciais por503/timeout. Retry após TTL exige reautenticação; distinguir isso de reutilização comprovada. Limpar ciphertext expirado; hashes de tokens consumidos mantidos pelo período necessário para detecção conforme política a fechar.

## Revogação e escolhas

Revogações existentes em reset/settings/admin/closure devem abranger famílias mobile na mesma transação, preferencialmente por invalidadores compartilhados e integridade de banco, sem writers paralelos. Logout revoga somente sessão autenticada. Logout offline só encerra localmente, sem afirmar revogação remota. Desafio de sexta sessão é curto, digest-only, ligado à autenticação e versão de credencial; expira em5min. Escolha valida posse do desafio, sessão escolhida pertencente à conta e capacidade global sob lock; consome uma vez e emite nova sessão atomicamente.

## Entradas/saídas candidatas

Login `{email,password,device:{installationId,label,platform},operationId}` → tokens + sessionId + expiresIn + identidade mínima com role/capacidades atuais (não conceder multipapéis). Em limite: HTTP409 `session_limit` + challenge opaco + lista mínima `{id,kind,label,lastRelevantAt}`.

`identity.capabilities` nesta fatia contém apenas `account:read`, `session:validate`, `session:logout`. Não representa assinatura, habilitação esportiva ou autorização para módulos privados. Role é o valor atual do Core, sem conceder novos papéis. Essas capacidades não substituem guards de domínio.

Refresh `{refreshToken,operationId,retrySecret}` → mesmo envelope de credenciais. Inspect `{accessToken,interaction?}` → `{sessionId,identity}`. Logout aceita união exclusiva `{accessToken}` ou `{refreshToken}` → `{revoked:true}`, sem afetar outras sessões. Access expirado conhecido pode revogar sua família; refresh deve ser atual/não consumido. Em refresh pendente com resposta perdida, app pode usar access antigo para logout, sem necessidade de rotação. Token desconhecido em logout resulta sucesso idempotente sem afirmar identidade. Choice `{challengeToken,revokeSessionId,operationId}` → envelope de sessão se desafio válido e limite satisfeito.

Login/choice não têm replay de sucesso implementado: não repetir automaticamente; resposta perdida é resultado incerto e próxima tentativa consciente pode exigir escolha. Nenhuma senha é persistida. operationId dessas operações é validado/reservado contratualmente, não promessa de idempotência. Refresh é a única mutação com recuperação exata de resultado nesta entrega.

Erros estáveis: invalid_credentials, session_invalid, access_expired, session_expired, session_revoked, session_limit, challenge_invalid, refresh_reuse, refresh_recovery_expired, refresh_conflict, rate_limited, dependency_unavailable, invalid_request. `access_expired` permite refresh; `session_expired` encerra família por inatividade. Não revelar existência de conta nem distinções excessivas antes de autenticação. Falhas service_* são falhas de integração, nunca credencial inválida do usuário.

## Limites de implantação

Migration042 aditiva usa sessões existentes como âncora de revogação e tabelas de famílias/tokens/recibos/desafios. Aplicada apenas ao banco sintético isolado previamente comprovado; sem produção. `CORE_MOBILE_RETRY_KEYS_JSON={activeKid,keys:{kid:hex64}}` é chave AES de servidor separada, nunca enviada aoapp/API; manter kids antigos até expirar recibos. Cleanup preserva famílias ativas e remove ciphertext expirado; execução operacional deve ser homologada antes de produção. FrontendWeb de sexta sessão é alteração funcional necessária usando componentes existentes. Android físico conforme responsável; iOS não homologado. Cadastro pessoal/recuperação mobile/social fora desta entrega.

## Compatibilidade, operação e recuperação local

Contas legadas com mais de cinco sessões válidas não são normalizadas por expulsão silenciosa. Cada escolha encerra somente o id selecionado; se ainda há cinco ou mais, retorna409/session_limit com novo desafio e até cinco candidatos. Cliente repete escolha consciente, nunca login/choice automaticamente. Isso evita uma sexta sessão completa mesmo na transição. Em Web, Origin/CSRF permanecem obrigatórios nesse fluxo.

Migration042 é aditiva; não altera hashes, users.id, tempo dos cookies ou contratos esportivos. Atualizar código e limpeza compatíveis antes de habilitar transporte Mobile; não executar cleanup antigo sobre âncoras Mobile. Recuperação local preferida: desabilitar o ingresso/cliente de serviço e manter estruturas aditivas; não executar DROP em banco com sessões sem plano próprio. Somente bancos descartáveis deste ensaio foram migrados, com ausência de tabelas confirmada antes. Restore/rollback produtivo continua fora do escopo e bloqueado pelo NO-GO015.

Finalidade/retenção e dados de dispositivo em `docs/privacidade/inventario-e-retencao.md`; controles em `docs/seguranca/controles-e-operacao.md`. Cadastro pessoal, telefone/social, e recuperação Mobile permanecem não implementados. Configuração de chaves nunca deve usar NEXT_PUBLIC nem ser persistida no app. Registros de evidência e limitações em DEVLOG.
