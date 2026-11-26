# AUTH-04 — recuperação Core (contrato para integração)

26/11/2026. EM IMPLEMENTAÇÃO LOCAL. GateAUTH03 integrado informado pelo responsável: API/Core e Android físico aprovados; não é homologação iOS/produção. NO-GO015 preservado. Sem OAuth/social/AUTH05.

`POST /api/core/v1/recovery/{request,validate,reset}`, scopes exatos `core:recovery:request`, `core:recovery:validate`, `core:recovery:reset` na assertion AUTH01. JSON privado, no-store, <=8192bytes, sem Origin forjado/cookie. Usar o mesmo identity/credentials/password_resets e writers Web. Nunca expor token na resposta de request nem em logs.

- request `{email}` (schemaWeb email válido<=254 lowercase) →202 `{message}` genérica Web. Não comprova conta ou entrega. Falha SMTP →503 dependency_unavailable sem sucesso simulado. Reenvio = nova solicitação explícita, sujeita limites; links anteriores vivem até30min ou reset bem-sucedido.
- validate `{token:opaque43}` →200 `{valid:true}`; inválido/expirado/usado →400 `invalid_reset_token`, sem identidade. Não consome token.
- reset `{token,password,confirmPassword}` →200 `{reset:true,message}`. Mesma política canônica8–128/maiúscula/minúscula/especial e confirmações iguais. Revoga TODAS sessões Web/Mobile e elimina TODOS links em transação. Não emite sessão; app volta aoLogin. Falha no aviso posterior não desfaz reset confirmado.

Erros `{error:{code},requestId}`:400 invalid_request/invalid_reset_token;429 rate_limited +RetryAfter;503 dependency_unavailable. Falhas service_* continuam de integração. Credenciais/erros internos nunca em logs. Limites compartilhados com Web por email/global, além do serviço/operação; tempo mínimo750ms na solicitação.

Links: fallback obrigatório preservado `{APP_URL}/redefinir-senha#{token}`. Link aplicativo opcional configurado exclusivamente pelo operador em `CORE_MOBILE_RESET_LINK_BASE` com caminho de recuperação acordado, sem query/fragmento/credenciais prévias; token no fragmento. Não usar URL fornecida pelo cliente. Scheme exato depende confirmação do projeto Mobile; ausência de configuração envia somente fallback Web e não finge deep link disponível. Domínios reais não serão inventados. Scheme custom não prova posse exclusiva do app; token é credencial temporária, não executar reset só por abrir link. Sem analytics/token no path ou query.

SMTP de ensaio exclusivamente loopback15264 e destinatários@example.test. Capturas privadas0600 permitem extração local, sem HTTPpúblico. Documentar parâmetros de deep link somente após confirmar scheme atual com responsável; conexão Web/app não altera política de assinatura/perfil. Sem migration prevista para AUTH04, salvo necessidade comprovada.

## Implementação local / coordenação

Scheme confirmado pelo responsável Mobile: development=formfisik-dev, release semscheme. Configuração local CORE_MOBILE_APP_SCHEME=formfisik-dev e CORE_MOBILE_RESET_LINK_BASE=formfisik-dev://redefinir-senha; combinação exata só é aceita no Core local com NODE_ENV não produção. Não enviar token em query, histórico, logs ou persistência comum; app valida noCore antes da tela efetiva de reset. Produção/associações oficiais não homologadas.

17testes Core+Web aprovados no banco sintético secundário, SMTP loopback15265 e contas@example.test. Sem nova migration. Runtimeintegração3117 usa SMTP15264; atualizarambiente scopes requerrestart. Helper local extract-auth04-token.mjs recebe fixture email e grava JSON{token}0600 filtrado por destinatário, sem token stdout. Contrato não incluiOTP ou sessão automática. Build/tipos finais em andamento, gateAPI/app/Android ainda pendente.

Fechamento localCore:17/17testes e lint/TypeScript/diffcheck aprovados; buildcomcanários exit0,364artefatos/18valores/findings[]. Advertência de atualizaçãoNext16.4.3 permanece pendência, sem desligar checks. GateHTTPCore real request202/validate200/reset200/replay400 em conta sintética exclusiva; não altera fixturesfísicas/API. RuntimeCore3117/SMTP15264 disponíveis. App/API integração e Android físico ainda pendentes neste registro; sem iOS/produção/deploy/AUTH05.

## Gate integrado HTTP — evidência informada pelo coordenador, 26/11/2026

API→Core+Web: request conhecido/desconhecido mesmo202, inválido400; token válido200; senha fraca/confirmação divergente400; reset200; replayvalidate/reset400. Duas sessõesMobile (access+refresh) e sessãoWeb revogadas401; senhaantiga401/nova200 e logout200. OrigemWeb403 inicial revelou fixture localhost incompatível com APP_URL127.0.0.1; corrigida a fixture, sem relaxarOrigin. Conta sintética separada, sem zerar limites. Evidência atribuída ao coordenador, não reexecutada neste registro. Android físico request202/captura confirmados; handoff e reset físico aguardam conclusão. App98testes/TS informados como aprovados. Nenhuma homologaçãoiOS/produção ou autorizaçãoAUTH05.
