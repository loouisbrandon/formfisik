# AUTH-01 — contrato Core de serviço

Estado: contrato local de implementação, 25/11/2026. Sem deploy; NO-GO 015 preservado. FormFisik é empresa independente. Não autentica usuários.

## Contrato acordável para integração

- `GET /api/core/v1/service-check`, sem query/body. Core URL local configurada no cliente; não derivar de entrada externa.
- `Authorization: Bearer <service assertion>`; JWT direto assinado ES256. Não é fluxo OAuth nem endpoint `private_key_jwt`.
- Header protegido: `alg: ES256`, `typ: JWT`, `kid` não vazio (até 80 caracteres).
- Claims obrigatórias: `iss` e `sub` iguais ao issuer autorizado (local: `formfisik-mobile-api`), `aud` string exata `urn:formfisik:core:local`, `environment: local`, `scope: core:service-check`, `iat`, `exp`, `jti` UUID. Lifetime máximo 60s; tolerância de relógio 5s. Sem PII.
- Cada requisição usa novo jti. Não repetir asserção; Core consome atomicamente `(environment, issuer, jti)` no PostgreSQL. Timeout/indisponibilidade: não retornar sucesso.
- Sucesso `200`: `{ "ok": true, "contractVersion": "1" }`.
- Erros JSON: `{ "error": { "code": "service_unauthorized|service_forbidden|service_replay|service_unavailable|invalid_request|service_rate_limited" }, "requestId": "UUID" }`; HTTP respectivamente 401/403/401/503/400/429 (Retry-After 60s). Não expor motivo criptográfico, claims, chave ou token.
- `X-Request-Id` de resposta é UUID gerado pelo Core; cliente pode enviar `X-Correlation-Id` UUID. Core pode correlacionar somente formato válido; nunca registrar Authorization/body.
- Cache-Control private/no-store; não há cookie nem identidade delegada.

## Configuração Core (somente servidor)

`CORE_SERVICE_ENVIRONMENT=local` (valores local/staging/production), `CORE_SERVICE_AUDIENCE=urn:formfisik:core:local`, `CORE_SERVICE_CLIENTS_JSON` array de `{issuer, environment, scopes: ["core:service-check"], keys: [{kid, publicJwk, revoked: false}]}`. JWK pública EC P-256, sem material privado. Ausência/erro de configuração fecha acesso com 503. Ambiente e audiência devem coincidir; produção exige environment production. Chave privada somente na Mobile API, fora do Git e logs. Nenhum segredo vai no app.

Rotação: publicar nova chave pública com kid novo, trocar assinante API, revogar/remover kid antigo após no mínimo a janela máxima de asserção (incluindo tolerância). Revogação explícita bloqueia imediatamente novas verificações após atualização de configuração; sem cache de confiança persistente. Um serviço autenticado não possui acesso a outros endpoints nem recebe capacidade de usuário.

## Dependência local

Migration aditiva 041 com recibos antireplay, somente em PostgreSQL local isolado comprovado. Retenção: remover recibos expirados; índice de expiração e limpeza limitada durante consumo. Sem produção, sem novos recursos externos. Cookies/Origin/CSRF e proxy de produção fechada permanecem intactos.

AUTH-02 não deve começar antes da validação integrada deste contrato. Android físico substitui emulador conforme confirmação do responsável; este projeto não homologa Android/iOS.

## Evidência local e limitações

Gate HTTP API → Core informado pelo responsável em 25/11/2026: primeira requisição expirou durante compilação fria; segunda retornou HTTP 200. Core em loopback 3117, API em 3017, banco sintético `formfisik_auth01_test` em loopback 55439. Container novo `formfisik-auth01-isolated-test`, PostgreSQL18, zero tabelas antes das migrations; volume anônimo novo criado pela imagem (não volume de aplicação existente). Migrations aplicadas somente nesse alvo.

Seis testes Core passaram antes dos ajustes finais; depois oito testes AUTH01 passaram, incluindo correlação/ambiente. Regressão combinada73/73 e revalidação focada33/33 (sobreposta) passaram no AUTH02; build com canários terminou exit0. A revisão automática de aprovação falhou por limite de uso em uma tentativa HTTP local; isso não foi rejeição por insegurança, nem autoriza contornar revisão. Execuções posteriores aprovadas foram realizadas normalmente. Não há homologação externa/produção. jose6.2.18 MIT adicionado isoladamente para JWS/JWT padrão; npm audit encontrou uma dependência Next16.4.3 com avisos moderados, nenhum alto/crítico no relatório consultado. Aviso de build registrado, sem desligar verificação/upgrade amplo; NO-GO015 preservado. Asserções deste escopo não acessam recursos de usuário. AUTH02 acrescenta scopes exatos `core:mobile-auth:<operação>`, cada um limitado ao contrato e credencial de usuário canônica.
