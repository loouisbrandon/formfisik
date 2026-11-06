# Controles e operação segura — 015

Aplicação da FormFisik, empresa independente fundada por Brandon Louis. Preparação local; **não há autorização de produção, deploy, mudança de credenciais ou execução no banco existente**. Ver relatório 015 para resultados efetivos e veredito.

## Fronteiras de aplicação

Servidor: `server-only` protege módulos de dados/segredos; Zod estrito limita entradas e campos protegidos; SQL parametrizado e enums para identificadores dinâmicos; confirmação/sessão opaca/role e grant explícito/entitlement canônico/propriedade conforme operação. Same-Origin estrito e JSON nas mutações, sem CORS genérico. Tokens de e-mail só em fragmento removido pelo cliente; consumo POST temporário/uso único/digest. Senha Argon2id com 19MiB, duas iterações, paralelismo 1; bytes preservados. Nada de JWT ou credenciais em Web Storage.

Paginação ocorre no servidor: alunos/exercícios/treinos/avaliações e auditoria até 20 por página; fotos 10, candidatos 12; séries 500 por página; relatórios rejeitam mais de 500 avaliações e 12 fotos. Leitura JSON tem prazo total de 15 segundos, inclusive entrada lenta/incompleta. Limites de tamanho/estrutura, Pool 5 e timeouts não substituem proteção de borda contra lentidão e esgotamento distribuído.

Uploads são decodificados/reencodificados, com limites de entrada/dimensões/pixels; sem SVG/URL remota e sem EXIF. R2 deve continuar privado. Leituras revalidam após I/O. PDFs limitados a 120 páginas/8MiB, artefatos privados 15min/3 por profissional; fotos revogadas invalidam bytes/manifest. Monitorar cleanup e fila; leitura expirada não depende da execução do cleanup.

## Suspensão operacional

Revisar alvo/identidade, ambiente, motivo permitido e necessidade da medida fora da aplicação. Com autorização operacional específica, operador de banco executa:

```sh
npm run account:security -- disable UUID_DA_CONTA security_incident --identity-and-scope-verified
npm run account:security -- enable UUID_DA_CONTA administrative_review --identity-and-scope-verified
```

Motivos: `owner_request`, `security_incident`, `administrative_review`. Sem texto livre, senha ou e-mail no comando/log. Suspensão e revogação são transacionais. Eventos contêm ID do alvo/tipo/motivo/data, com acesso restrito. Identidade do operador e aprovação ficam no registro operacional verificado: a flag não as comprova. Não executar esses exemplos contra pessoas reais nesta auditoria. Reativação exige nova decisão e login; não ressuscita sessões. Suspender não elimina dados nem cancela cobrança; tratar isso por procedimentos próprios.

## Banco e menor privilégio

Criar futuramente papéis separados: owner sem login, migrador com DDL apenas no schema da aplicação, runtime com CONNECT/USAGE e SELECT/INSERT/UPDATE/DELETE estritamente nas tabelas utilizadas e USAGE/SELECT nas sequences necessárias. Runtime não deve ter SUPERUSER, CREATEDB, CREATEROLE, REPLICATION, BYPASSRLS, ownership, CREATE no schema/public ou acesso a bancos de outras aplicações. Restringir funções/grants ao necessário; trigger 015 exige DML nas tabelas de sessões/resets pelo chamador. Limpeza e provisionamento devem ter credencial/execução operacional separada com acesso revisado.

Não existe RLS; aplicação aplica owner em cada consulta privada e FKs compostas defendem relações. Isso não protege de um operador de banco indevido. Homologar grants com smoke de todos os módulos e tentativa explícita de DDL negada usando o papel runtime em staging autorizado. Não executar `GRANT ALL` como solução de erro. Nenhuma alteração de permissões foi feita no banco existente.

Exigir TLS com verificação de certificado ao banco/provedores, acesso de rede restrito e backups cifrados. Não usar `rejectUnauthorized:false` ou desligar verificação TLS. Credenciais somente no servidor/secret manager; `.env.local` ignorado no Git. Canary de teste não é credencial real. Rever exposição de logs de proxy, configuração de sourcemaps e artefatos públicos em cada release.

## Logs, investigação e limites

Aplicação emite códigos estáticos para sucesso/falha de autenticação, recuperação, revogação e dependências. Rejeições 400/401/403/429 emitem evento mínimo com status e UUID aleatório de correlação gerado no servidor, devolvido como X-Request-ID. Não se aceita ID de correlação do usuário nem se copia corpo, URL, cookie, token, aluno, peso, medida, foto, referência de autorização ou objeto Stripe. Eventos administrativos no banco guardam autoria/versão/operação, sem duplicar conteúdo corporal; segurança de conta usa motivo enumerado.

Acesso somente a responsáveis operacionais autorizados, MFA nas contas de infraestrutura quando disponível, consultas auditadas e exportações restritas. Proposta de retenção: 30 dias em operação e até 90 em acesso restrito para investigação justificada; aprovação/configuração pendentes. Incidentes têm registro próprio. Saneamento deve ocorrer antes de emitir log; não confiar apenas na máscara da ferramenta. Nunca habilitar HTTP/SMTP/SDK debug com dados reais. IP/headers/corpos de acesso do proxy precisam de revisão própria; o código local não controla a política do provedor.

Monitorar taxas de 401/403/429/503, falha SMTP/Stripe/R2, backlog e idade de cleanup, statement timeouts, recursos/latência e divergências comerciais. Definir alerta, responsável e escalonamento antes de operar. Logs atuais minimizam dados, mas não implementam SIEM, entrega imutável externa ou trilha completa de leitura de dados sensíveis; lacunas declaradas, sem remover observabilidade para esconder falhas.

## Checklist de produção (pendente)

- [ ] Responsável, domínio HTTPS, identidade jurídica e canal de privacidade aprovados.
- [ ] Contratos/bases/finalidades/retentiva/operadores/transferências revisados; atendimento integral de direitos validado.
- [ ] Stripe Checkout/Billing/Portal/webhooks homologados com cartões de teste; remoção de guardas local/test-only somente em mudança futura autorizada.
- [ ] R2 privado e permissões/PUT/GET/DELETE/revogação/retentiva homologados, sem acesso público.
- [ ] SMTP autenticado/TLS e entregabilidade verificados; sem log de mensagens/tokens.
- [ ] Runtime/migrador separados, transporte/grants de banco testados e backup protegido.
- [ ] Backup e restore ensaiados; RPO/RTO aprovados; eliminações reaplicadas antes de reabrir acesso.
- [ ] Cleanup de temporários/fotos e reconciliação comercial agendados/monitorados; nenhuma agenda foi provisionada aqui.
- [ ] Proxy limita corpo, duração de leitura/conexão, requisições e concorrência; cabeçalho IP confiável configurado somente pelo operador da borda.
- [ ] HSTS, CSP/nonces, cookies, CORS/cache, logs e canários revalidados no domínio real.
- [ ] Dependências/advisories revisados no release; nenhuma crítica/alta conhecida sem bloqueio explícito.
- [ ] Responsável por incidentes treinado, acessos/alertas e canal de comunicação testados em simulação sem dados reais.

Ausência de evidência operacional não é aprovação tácita. Seguir [plano de incidentes](../operacao/incidentes-de-seguranca.md) e [inventário de retenção](../privacidade/inventario-e-retencao.md).

## Complemento016 — ensaios locais e limites

A [estabilização016](../engenharia/entrega-016.md) acrescenta mecanismos de eliminação delimitada, ledger/replay e grants/diagnóstico. [Runbook operacional](../operacao/estabilizacao-016.md) e [ciclo dos dados](../privacidade/eliminacao-016.md) detalham autorizações, bloqueios e manutenção. Grants e backup/restore foram ensaiados somente em PostgreSQL descartável; os checkboxes produtivos acima continuam pendentes. O FF015-11 foi parcialmente tratado tecnicamente, sem GO para produção, homologação externa ou política jurídica aprovada.

## Controles017 — formulários públicos por capacidade

[Contratos](../engenharia/api-anamneses.md) e [arquitetura](../arquitetura/ADR-018-anamneses-versionadas.md): sessão/entitlement/owner em toda operação profissional; portador público só abre/envia solicitação individual e não vê cadastro/histórico. Token aleatório256bits, digestSHA256,7dias, revogação/uso único, lock e validade no relógioSQL ao consumo. Fragmento removido ePOST, sem token nos logs/URLsHTTP. Origin/JSON128KiB/15s, limitesHMAC porIP/capacidade e por profissional; no-store/no-referrer/noindex/CSP. Condições reavaliadas no servidor, snapshots imutáveis, schemasstrict, FKs compostas, nenhuma identidade unida por contato. Resolução pendente exige conferência independente; atestado não comprova execução externa. Suspensão/arquivo de vínculo bloqueiam capacidade. Sem dados reais ou liberação produtiva.

## CRM018

Todas as rotas e comandos revalidam sessão/conta/role/e-mail, entitlement canônico e propriedade no servidor. UUID de outro proprietário não concede acesso. Post same-origin e body strict limitado, rate120GET/60POST por minuto e10reconciliações/minuto. SQL parametrizado, DTO mínimo, sem respostas/medidas/fotos no quadro. Operações transacionais com versão otimista, lock por proprietário, prévia/digest e confirmação para transferências; auditoria sem conteúdo pessoal e sem UPDATE/DELETE no runtime. Testes cobrem concorrência, rollback de auditoria, IDOR, expiração/revogação de anamnese, rate e exclusão/restore. Canários sintéticos validados no build real, sem credenciais externas.

Migration018 e grants são preparados; aplicação em ambiente persistente não autorizada. Geração de tarefas é reconciliação explícita100 por lote, não scheduler. Retenção e monitoramento de volume de eventos/chaves precisam de homologação operacional antes de uso real. NO-GO015 permanece; conformidade não é certificada por testes locais. [Relatório018](../engenharia/entrega-018.md).

## Controles019 — acordos e execução

Reutiliza sessão/entitlement/Origin/HMAC/JSON/owner, lock profissional18018 e versões otimistas. GET120/POST40 por minuto, body98.304bytes/15s, schemasstrict, centavos inteiros/datas civis e transições explícitas. FKs compostas asseguram mesmo proprietário/aluno entre acordo, obrigação e execução. Evidências são revalidadas por owner/aluno/versão/período e estados, sem conteúdo clínico nos candidatos. Sem IDs financeiros fictícios, JWT ou bypass.

Planos/acordos têm revisões sem UPDATE; eventos são somente append no runtime. Execução não permite alterar unidades/evidência persistidas: somente invalidação lógica justificada. DELETE runtime é limitado à substituição de obrigações de rascunho sem execução; privacidade usa credencial operacional separada. Ensaio019 cobre papel restrito, backup/restauração/replay, concorrência, rollback, IDOR, canários e CSP do build real. Aplicação de migration/grants persistentes continua não autorizada; NO-GO015–018 permanece.

## Financeiro profissional020

[API](../engenharia/api-financeiro-profissional.md): owner/entitlement/session/Origin, FKs, total canônico, intenções duráveis, reserva de reembolso incerto e reconciliação por conta. Webhook Connect tem segredo e domínio próprios; assinatura bruta/timestamp/limites, deduplicação e leitura canônica transacional. Runtime financeiro externo bloqueado; fake somente DI nos testes. [Operação e gates](../operacao/financeiro-profissional.md). Sem levantar NO-GO vigente.

## Agenda021

Sessão/entitlement/Origin, DTO mínimo, owner lock, versões e idempotência; notas/local somente no detalhe privado. Runtime sem DELETE de ocorrências/eventos e sem edição da auditoria. Ensaio de restore016 inclui ocorrência021 seguida de replay de eliminação. [Privacidade](../privacidade/agenda.md) e [relatório](../engenharia/entrega-021.md). Não levanta NO-GO de produção.

## Mídia023

URLYouTube é validada e reconstruída, semHTML/iframe do usuário oufetch de URLarbitrária. Player oficial sob demanda, referrer de origem restrito aoiframe, CSP sem relaxamento de scriptseval. Upload direto autorizado/quotas e privacidadeStream obrigatória; webhook assinado e estado canônico. Vídeo privado nunca é publicado sem submissão/revisor distinto/capacidade. Runtime não altera direitos/metadados históricos nem grants. Revogar bloqueia novas emissões; tokens existentes têm janela residual5min. Reservas incertas não são repetidas automaticamente. [Runbook](../operacao/demonstracoes-stream.md).

## Check-ins022

Sessão opaca/entitlement/owner, Origin/schema/body/rate, convites256bits/digest/uso único/revogação e período limitado, locks/versões/idempotência. Catálogo017 segregado por finalidade, respostas/devolutivas imutáveis e DTO mínimo; público não recebe histórico/cadastro/prescrição completa. [API](../engenharia/api-checkins.md), [privacidade](../privacidade/checkins.md) e [evidências](../engenharia/entrega-022.md). NO-GO anterior preservado.

## Comunicação024

Sessão/entitlement/propriedade por aluno e referência, Origin/strict32KiB/15s, GET120/POST40/min, DTO mínimo e detalhes sob demanda. Texto simples e variáveis whitelist renderizadas no servidor, sem código/HTML; prévia/digest/locks/versões/idempotência e auditoria sem corpo. Registros/versões imutáveis, runtime sem DELETE ou alteração dos históricos. Avisos não contêm saúde e leitura é do profissional. Eliminação016 saneia retries e remove dados antes das fontes; restore reaplica ledger. Sem nova identidade pública, canal externo ou uso do SMTP de conta. [Segurança/limites024](../engenharia/entrega-024.md).
