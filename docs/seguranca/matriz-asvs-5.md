# Matriz de controles alinhada ao ASVS 5.0

Recorte de avaliação da FormFisik, empresa independente, sem certificação ou alegação de cobertura integral de um nível ASVS. IDs conferidos na [versão oficial 5.0.0](https://asvs.owasp.org/downloads/); controles não listados não são implicitamente aprovados. Evidências e execução final constam da entrega 015. Infraestrutura real não foi acessada.

| Referência 5.0 | Controle no projeto / evidência | Status |
| --- | --- | --- |
| V1.2.4 | SQL parametrizado e whitelist para ordenação/grandezas; suites de módulos/injeção | Implementado e verificado |
| V1.2.6–V1.2.8 | Não há LDAP, XPath ou processador LaTeX | Não aplicável, com justificativa |
| V1.3.6 | Sem URL arbitrária de upload; endpoint R2 derivado/validado; URLs Stripe restritas | Implementado e verificado |
| V2.2.1–V2.2.3 | Schemas estritos e regras contextuais no servidor; mass assignment/limites | Implementado e verificado |
| V2.3.3–V2.3.4 | Transações, versões, FKs e locks; replay/concorrência em PostgreSQL | Implementado e verificado |
| V2.4.1 | Limites persistidos/body/pixels/volume; proteção distribuída e leitura lenta na borda pendentes | Parcial |
| V3.3.1–V3.3.4 | Cookie __Host/Secure/HttpOnly/Lax em HTTPS local; sessão não exposta a JS | Implementado e verificado |
| V3.4.1 | HSTS condicionado a produção HTTPS; subdomínios/domínio real ainda não homologados | Parcial |
| V3.4.2 | Sem CORS público de dados privados; Origin estrito em mutações | Implementado e verificado |
| V3.4.3 | CSP por nonce, sem inline scripts/eval de produção; Zod jitless e navegador no relatório | Implementado e verificado |
| V3.4.4–V3.4.5 | nosniff e no-referrer globais/privados; evidência navegador no relatório | Implementado e verificado |
| V4.2.1 | Consistência HTTP entre borda Railway/servidor não testada em ambiente real | Implementado, mas não verificado |
| V4.3 / V4.4 | Não há GraphQL ou WebSocket de aplicação; HMR de desenvolvimento não é produto | Não aplicável, com justificativa |
| V5.1 | Tipos/tamanhos/pixels/entrega privada documentados, normalização Sharp | Implementado e verificado |
| V7.2.1–V7.2.4 | Tokens opacos CSPRNG/digest, validação servidor e rotação no login | Implementado e verificado |
| V7.3.1–V7.3.2 | Inatividade 30min/absoluto 12h, polling não renova | Implementado e verificado |
| V7.4.1–V7.4.4 | Logout/reset/suspensão revogam; ação de sair acessível no shell | Implementado e verificado |
| V7.5.2 | Não há painel para titular listar/revogar sessões individualmente | Não implementado |
| V8.2.1–V8.2.3 / V8.3.1 | Perfil/grant, entitlement/propriedade/DTO, testes cruzados e strict schemas | Implementado e verificado |
| V8.4.1 | Isolamento profissional via SQL e FKs compostas; dois profissionais sintéticos | Implementado e verificado |
| V8.4.2 | Capacidade moderadora explícita; MFA/postura/contexto de infraestrutura pendentes | Parcial |
| V9 | Não há tokens autocontidos/JWT | Não aplicável, com justificativa |
| V11.4.1–V11.4.3 / V11.5.1 | SHA-256/HMAC/Argon2id e randomBytes(32); suites de credenciais/tokens | Implementado e verificado |
| V12.1 | Configuração TLS/ciphers de provedores e domínio produtivo depende de homologação | Parcial |
| V14.1.1–V14.1.2 | Inventário/finalidade/acesso/retenção propostos, revisão jurídica/operacional pendente | Parcial |
| V14.2.1–V14.2.3 | Tokens fora de query/log; no-store; sem trackers de dados corporais; canários | Implementado e verificado |
| V14.2.6 | DTOs mínimos e detalhes explícitos; inventário de requisições | Implementado e verificado |
| V14.2.7 | Expurgo de tokens/PDF/fotos preparado; eliminação integral e backups pendentes | Parcial |
| V14.2.8 | Reencode remove metadata; testes com imagens sintéticas | Implementado e verificado |
| V14.3.1 | Memória privada destruída na saída/troca; armazenamento somente tema; navegador e troca entre abas | Implementado e verificado |
| V16.2.5 / V16.4.1 | Códigos estáticos/eventos mínimos sem payload/PII sensível; teste de logs | Implementado e verificado |
| V16.3.1–V16.3.4 | Eventos de autenticação/rejeição/falha; correlação mínima e alertas operacionais pendentes | Parcial |
| V16.4.2–V16.4.3 | Acesso/imutabilidade/transporte externo de logs não provisionados | Não implementado |
| V16.5.1–V16.5.3 | Erros públicos genéricos, falha fechada de dependências; suites de indisponibilidade | Implementado e verificado |
| V17 | Sem WebRTC/TURN | Não aplicável, com justificativa |

“Implementado e verificado” refere-se ao código/testes locais citados, não à configuração produtiva. Build final de produção aprovado no navegador com canários e teste entre abas. Não converter pendência de infraestrutura ou jurídica em “não aplicável”.

## Complemento016 — evidências novas, sem certificação

A [016](../engenharia/entrega-016.md) verifica localmente eliminação delimitada/ledger/replay e grants em PostgreSQL descartável. V14.2.7 continua **Parcial**, pois financeiro/compartilhados/portabilidade/retentiva/backups reais não estão resolvidos integralmente. Infraestrutura/logs externos continuam com os estados anteriores; ensaio local não os transforma em homologados. Resultados015 permanecem históricos; novas provas016 são vinculadas ao ambiente específico.
