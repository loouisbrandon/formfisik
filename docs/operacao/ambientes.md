# Ambientes e operação inicial

Estado: configuração preparada; nenhum serviço externo criado ou deploy executado.

## Desenvolvimento

Node.js 22 ou 24 e PostgreSQL 16+; instalação reproduzível com npm ci. Copiar `.env.example` para `.env.local` e preencher as configurações. Banco deve estar disponível para login e sessões. SMTP é necessário somente para cadastro/confirmação. Gerar ABUSE_HMAC_SECRET com `openssl rand -hex 32`. Segredos não usam prefixo NEXT_PUBLIC e não entram no Git. Executar `npm run db:migrate` antes de `npm run dev`.

SMTP local controlado pode ser um Mailpit já disponível ou os servidores locais iniciados pelas suítes de teste. A suíte não envia mensagens para destinatários externos e não imprime tokens. Para uso manual, configurar SMTP_HOST/PORT do seu ambiente de desenvolvimento. Não existe fallback de sucesso quando SMTP está ausente.

## Railway

Configuração preparada para o serviço web: builder Railpack, build `npm run build`, pre-deploy `npm run db:migrate`, start `npm run start -- --hostname 0.0.0.0` e healthcheck `/api/health`. Aplicação escuta PORT definido pelo Railway. Provisionamento e deploy dependem de autorização futura; nenhuma configuração foi aplicada a uma conta Railway.

A documentação oficial consultada nesta entrega marca `railway.toml`/`railway.json` como legados e orienta usar Infrastructure as Code para serviços novos. Por isso não foi introduzido um arquivo de deploy legado. Ao autorizar a infraestrutura, materializar e validar a definição IaC com o CLI correspondente, mantendo os segredos no Railway. Referência: https://docs.railway.com/infrastructure-as-code/reference.

Modelo de configuração para a futura definição (não aplicado):

```ts
const web = service("formfisik-web", {
  build: "npm run build",
  preDeploy: "npm run db:migrate",
  start: "npm run start -- --hostname 0.0.0.0",
  healthcheck: "/api/health",
});
```

O executor `tsx` e `@next/env` são dependências de produção para que migrations permaneçam disponíveis após a remoção de ferramentas de desenvolvimento. Não é necessário conectar ao banco durante o build; configurar variáveis no runtime/pre-deploy.

Configurar DATABASE_URL da instância própria da FormFisik, APP_URL como origem pública HTTPS sem barra final, ABUSE_HMAC_SECRET estável e privado, SMTP_HOST/PORT/USER/PASSWORD e MAIL_FROM de domínio autorizado. Em produção SMTP exige autenticação e TLS, sem desativar verificação de certificado. PostgreSQL usa requisitos de TLS da URL fornecida; não adicionar rejectUnauthorized=false. Para conexão pública usar certificados e sslmode apropriados ao provedor.

Validar migrations no staging antes de produção e fazer backup antes de mudanças destrutivas. Migrations aplicadas não devem ser editadas; adicionar nova migration. Executor mantém lock para concorrência e rejeita checksum alterado. Runtime usa pool de até 5 conexões por processo; dimensionar com o limite do banco e o número de réplicas.

Agendar `npm run db:cleanup` para remoção de tentativas e buckets expirados (por exemplo, a cada hora). Produção também precisa monitorar respostas 503/429, conexões, entrega SMTP e latência Argon2id, sem registrar payloads, URLs com tokens, senhas ou headers de autenticação.

TRUSTED_CLIENT_IP_HEADER só deve ser configurado após validação do comportamento do proxy Railway. O padrão seguro é bucket compartilhado, com impacto de disponibilidade documentado. Não assumir infraestrutura, domínio ou credenciais da Onebase.

## Checklist antes de abertura pública

- PostgreSQL e migrations verificados em staging.
- SMTP autenticado, domínio e entrega testados; SPF/DKIM/DMARC definidos com o provedor.
- APP_URL HTTPS e segredos configurados sem exposição.
- Header de IP e limites validados no ingress; proteção volumétrica definida.
- Agendamento de limpeza, logs sem dados pessoais, alertas, backup e restauração.
- Política de privacidade e regras de retenção revisadas.
- Login e sessões estão implementados; autorização comercial permanece negada até a entrega do módulo pago.

## Sessões — Implementação 002

Aplicar `npm run db:migrate` antes de iniciar a versão com login. A migration 002 adiciona a tabela de sessões e permite identificar contas importadas sem confirmação. Banco do cadastro é reutilizado; não há segundo banco ou segredo JWT.

APP_URL deve ser a origem canônica exata, sem barra final. Origin em login/logout deve corresponder; não adicionar wildcard CORS nem aceitar headers de host arbitrários como autoridade. NODE_ENV=production exige origem HTTPS; cookie __Host-formfisik-session é Secure/HttpOnly/SameSite=Lax, sem Domain. HTTP local usa formfisik-session. Nunca desativar Secure em produção para contornar configuração incorreta de domínio/proxy.

ABUSE_HMAC_SECRET protege chaves dos limites; usar valor estável e privado em todas as réplicas. Limites persistem no banco, e o bucket de IP compartilhado permanece conservador até validar TRUSTED_CLIENT_IP_HEADER no ingress. Alertar sobre auth_dependency_unavailable e taxas de auth_login_rejected/429 sem capturar payloads ou headers. Hash de senha, cookie e token devem ser removidos da coleta de logs de proxy/APM.

`npm run db:cleanup` também remove sessões expiradas, revogadas ou inativas. Agendamento ainda precisa ser configurado na infraestrutura autorizada. TTL é aplicado em toda consulta mesmo sem cleanup; a limpeza não é requisito para revogação. Nenhum cache/CDN deve armazenar respostas autenticadas. No Railway, compartilhar PostgreSQL entre réplicas; não usar memória local como fonte de sessão.

Não foi provisionado domínio/HTTPS público ou deploy nesta entrega. Teste local de cookies de produção valida os atributos gerados; teste em staging com TLS real e proxy deverá preceder abertura pública.

## Recuperação e SMTP — Implementação 003

Aplicar migration 003 antes de ativar a versão. Reutiliza o mesmo provedor SMTP, remetente e APP_URL da confirmação de conta. APP_URL deve ser origem canônica HTTPS em produção; o link é montado no servidor com fragmento e nunca a partir de Host/Referer enviado pelo usuário. Não reescrever links de recuperação para adicionar analytics ou transportar o fragmento para query string. Validar comportamento do rastreamento de cliques do provedor, preferindo desativá-lo para esses e-mails.

Pedido somente retorna 202 após aceite SMTP e commit da tentativa (ou orientação sem token para endereço não elegível). Recusa/falta de configuração retorna 503 e rollback. Após a alteração, notificação informativa é tentada separadamente: falha gera password_change_notification_unavailable, sem desfazer senha/revogação já confirmadas. Nenhuma fila ou retry automático de notificação foi provisionado.

Monitorar códigos estáticos password_recovery_unavailable, password_change_notification_unavailable, 429 e latência; nunca coletar corpo de request de credenciais/reset, fragmentos de URL, e-mails ou tokens em APM/analytics/logs. Página `/redefinir-senha` possui no-referrer, noindex e restrições de enquadramento/formulário. Fontes e recursos visuais são locais; não adicionar scripts externos nesse fluxo sem revisão de segurança.

Cleanup agora remove password_resets expirados. Expiração e uso único não dependem da limpeza. PostgreSQL/SMTP de produção, domínio, TLS, entregabilidade e agenda de cleanup continuam a exigir configuração operacional autorizada; nenhum deploy é realizado por esta entrega.

## Stripe — entregas 005/006

[Configuração e validação local](stripe-local.md): chave de teste, produto/preço, segredo de webhook e configuração de Portal em `.env.example`, somente modo test e origem localhost. Não habilitar cobrança no Railway nesta entrega; guardas locais/test-only permanecem. Credenciais ainda não disponíveis; nenhuma chamada externa Stripe ou deploy foi executado.

## Gestão de alunos e PDFs (008)

Aplicar migrations 006/007 pelo comando existente, sem modificar o histórico anterior. Runtime Node com PDFKit e assets/fonts/DejaVuSans.ttf/licença incluídos no repositório; next.config externaliza PDFKit e inclui fontes no tracing de /api/students. Manter assets no diretório da aplicação em instalação local/Railway. Geração em memória, sem Python, Chromium, fila ou serviço externo em produção. Poppler é ferramenta de testes/revisão, não dependência do servidor de relatórios. Configuração/homologação Stripe continua necessária para acesso manual autorizado; não há flag de acesso pago. Nenhum deploy realizado nesta entrega.

## Exportação de fichas — 011

Aplicar migration aditiva 011 pelo migrator existente. PostgreSQL armazena apresentação/logo sanitizado e PDFs privados temporários; não usar disco efêmero Railway para arquivos de clientes. `db:cleanup` também elimina workout_documents expirados. Agendar a rotina existente e abranger esses dados privados em backup/retencão/eliminação. Fontes regular/negrito/licença incluídas no tracing de /api/workouts; PDFKit permanece no Node. Sharp valida PNG/JPEG no servidor; PDF.js e worker são empacotados localmente para visualizar bytes autorizados, sem CDN. Poppler/Pillow servem somente à revisão de testes. Monitorar geração síncrona, memória, latência e limites sem capturar conteúdo de documentos. Nenhum serviço, bucket, credencial ou deploy foi criado pela 011.

## Fotografias privadas — 013

R2 é preparado exclusivamente no servidor. Variáveis vazias em `.env.example`, sem serviços criados ou homologação externa. [Configuração, limpeza e recuperação](fotografias-r2.md). Migration 013 aplicada apenas no PostgreSQL descartável durante testes; banco existente permanece sem autorização de migração implícita.

## Revalidação 015

CSP por nonce exige HTML dinâmico; Zod usa interpretador jitless. Definir APP_URL HTTPS ao gerar e executar build de produção para conferir HSTS e Origin; validar headers no domínio final. Migration 015 de suspensão foi testada somente em banco descartável. Não aplicar no banco existente por inferência desta documentação. Ver checklist de segurança e retenção.

## Estabilização 016

Health agora exige todas as migrations/checksums desta versão, inclusive016. Banco existente não foi consultado nem recebeu migration; não iniciar versão nova contra schema parcial como se fosse pronto. Procedimentos de validação, grants, backups/restore, diagnóstico, filas e eliminação no [runbook016](estabilizacao-016.md). Testes destrutivos continuam restritos a PostgreSQL descartável com dados sintéticos; configuração presente não homologa Stripe/R2/SMTP. Agendas e alertas de nuvem continuam não provisionados.
