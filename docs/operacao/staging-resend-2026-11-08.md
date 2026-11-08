# Staging Railway e Resend — 08/11/2026

Estado: PREPARADO/PARCIAL. Não homologado; produção não liberada. Operação própria da FormFisik, empresa independente fundada por Brandon Louis.

## Escopo e configuração aplicada

Projeto Railway `diligent-truth`, serviço `formfisik`, ambiente `staging`. Origem `https://sta.formfisik.com.br`; produção tem origem separada `https://formfisik.com.br`. Build Webpack, Node 24, inicialização em `0.0.0.0`, porta 3000 e healthcheck `/api/health` foram configurados. Chaves internas distintas por ambiente; valores não registrados neste documento.

Configuração inicial utilizou o SMTP existente (Nodemailer). A autenticação passou localmente, mas a conexão a partir do serviço Railway falhou com ETIMEDOUT/CONN. [Railway restringe SMTP a Pro ou superior](https://docs.railway.com/networking/outbound-networking). Para não depender desse transporte, staging passa a usar a API HTTPS do Resend, sem nova dependência:

| Variável | Valor |
| --- | --- |
| SMTP_HOST | smtp.resend.com |
| SMTP_PORT | 465 |
| SMTP_USER | resend |
| MAIL_FROM | FormFisik <no-reply@formfisik.com.br> |
| SMTP_PASSWORD | API key Resend inserida diretamente no secret manager pelo responsável |
| MAIL_TRANSPORT | resend |
| RESEND_API_KEY | mesma chave de envio autorizada, configurada no secret manager sem exposição |

As variáveis SMTP são preservadas, mas não utilizadas quando MAIL_TRANSPORT=resend. O padrão continua SMTP para desenvolvimento e suítes anteriores. Provider desconhecido/falta de chave falha de forma fechada. API fixa `https://api.resend.com/emails`, somente servidor, sem redirecionamento, no-store e timeout de 10s. Aceite exige HTTP de sucesso e ID; erros do provedor não são propagados e não há retry automático nem fallback SMTP que possa duplicar envios. Textos e regras de token/rollback não foram alterados. [Contrato Resend](https://resend.com/docs/api-reference/emails/send-email).

Fonte: [Resend SMTP](https://resend.com/changelog/smtp-service). TLS com verificação de certificado é preservado. Criar chave de envio restrita ao domínio verificado, exclusiva do staging. Desativar rastreamento de links de autenticação no provedor. A existência dos registros DNS não comprova o estado Verified no Resend nem entrega na caixa de entrada.

## Pendências verificadas

- API key confirmada no staging; teste real de conexão TLS/autenticação SMTP aprovado em 08/11/2026, sem envio de mensagem. O responsável confirmou o domínio Verified no Resend. Entrega na caixa de entrada ainda não homologada.
- DATABASE_URL do staging configurada com papel dedicado `formfisik_runtime`, rede privada e `sslmode=verify-full`. A CA própria do PostgreSQL é armazenada em DATABASE_CA_CERT e materializada com umask 077 em `/tmp/formfisik-postgres-ca.crt` na inicialização. Não há desativação de verificação TLS. Proxy público do banco permanece ausente.
- Chave SSH operacional autorizada cadastrada na conta Railway; chave privada com permissão 0600 em `~/.ssh/formfisik_railway_operations`, fora do repositório. A inspeção SQL inicial, em transação READ ONLY, confirmou zero tabelas no schema public e ausência de schema_migrations no PostgreSQL de staging, antes da inicialização autorizada abaixo.
- Após autorização específica, migrations 001–028 e grants foram aplicados em transação única no banco confirmado vazio, com lock e checksums SHA256 idênticos ao executor existente. Não havia dados de aplicação a preservar. Credencial administrativa não foi copiada para o web.
- Consulta pós-aplicação confirmou 28 migrations, runtime sem SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS, sem CREATE no schema e sem ownership de tabelas. Homologação de todos os módulos continua pendente.
- Primeiro deploy somente de staging autorizado: revisão `619b8bbc30a99f5487ccfabd6bfe57130d34c346`, deployment `03cc5bd3-553a-4d91-944b-901cce79428c`, SUCCESS. `/api/health` 200/status ok; `/login` e `/cadastro` 200, cache privado/no-store, HSTS/CSP presentes no HTML; `/api/auth/session` 401 sem cookie e `/dashboard` 307 para login. Rota `/criar-conta` não existe (404); cadastro correto em `/cadastro`. Produção não alterada nesta etapa. Atualização do transporte HTTPS em validação.

## Homologação pendente

1. Confirmar domínio Verified no Resend e chave SMTP configurada.
2. Validar autenticação SMTP/TLS sem enviar mensagem ou imprimir credenciais.
3. Preparar banco, permissões e migrations com alvo explícito; verificar `/api/health` após deploy autorizado do staging.
4. Cadastrar conta de teste do responsável, confirmar entrega e link com origem de staging, consumir token uma única vez e testar login/logout/recuperação. Não registrar mensagem, fragmento, cookie ou senha.
5. Registrar resultados reais de entrega e regressão. Ensaios SMTP locais anteriores não comprovam Resend/Railway.

Stripe continua limitado a testes localhost pelo código atual. Não desativar controle comercial para liberar módulos. Billing remoto requer entrega específica; produção e NO-GO015 permanecem pendentes.

## Validação da mudança de transporte

- Teste de contrato Resend com fetch simulado: aprovado, cobre links dos três fluxos, aceite obrigatório, recusa HTTP, resposta inválida, erro de rede, falta de chave e provider desconhecido. Não comprova entrega real.
- Regressão PostgreSQL descartável/SMTP controlado: 21 testes aprovados, zero falhas, incluindo concorrência, rollback, expiração e revogação de sessões. Container removido após o ensaio; staging não utilizado para esses testes.
- Lint e typecheck aprovados. Build Webpack efetivo com canários aprovado; scanner de 281 artefatos públicos/14 segredos sintéticos sem achados, incluindo RESEND_API_KEY. Aviso não bloqueante existente sobre metadataBase. Artefatos sintéticos não publicados.
- Nenhuma mensagem externa enviada automaticamente; entrega na caixa de entrada e consumo real do link dependem de cadastro do responsável em staging.

Atualização HTTPS publicada por upload de fonte local, sem commit automático, sobre HEAD `619b8bb`: deployment `27a712b6-b1d4-41a0-8579-5e3a1590ba6d`. SHA256 de `src/server/config.ts`: `a99617edb8199e4fbb2a3170d4d60db1e663158b2169719cceb56473e928b812`; de `src/server/mail.ts`: `f6b18390c70414ce329581294465e3f47f90958777f2b1c1d963ee0a1f5c8f84`. Configuração de produção e banco produtivo não alterados nesta operação. Alterações locais devem ser revisadas/commitadas pelo responsável antes de futuros deploys Git para preservar o transporte HTTPS.

Resultado final do deploy HTTPS: SUCCESS. Dentro do serviço ativo, MAIL_TRANSPORT=resend e presença da chave confirmados sem revelar valores. POST autenticado com objeto vazio à API Resend retornou 422 (rejeição esperada por ausência dos campos de envio), comprovando alcance HTTPS e passagem da autenticação sem enviar e-mail. A tentativa equivalente na instância antiga retornara 401 porque a chave nova ainda não estava no ambiente daquele processo; isso não representava rejeição da chave configurada no novo deploy.

Smoke pós-deploy: `/api/health` 200/status ok, `/cadastro` e `/login` 200, `/api/auth/session` 401 e `/dashboard` 307 para `/login?reason=session` sem autenticação. GO para teste manual de cadastro/entrega em staging com conta do responsável; entrega e consumo real do link ainda NÃO HOMOLOGADOS. Não representa GO para operação com dados pessoais reais ou produção.
