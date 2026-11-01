# Cadastro profissional

Estado: implementado; verificação com PostgreSQL real e SMTP local controlado. Login e sessões foram implementados posteriormente na [Entrega 002](autenticacao.md). Recuperação de senha, pagamento e trial permanecem planejados. O relatório de validação desta entrega está no final deste documento.

## Fluxo e regras

`/cadastro` recebe nome completo (3–120 caracteres), e-mail válido (até 254), senha (12–128) e confirmação igual. E-mail é normalizado para minúsculas. Espaços da senha são preservados. Após envio aceito, exibe confirmação genérica orientando verificar a caixa de entrada e spam. O usuário pode reenviar o formulário para obter novo link, sujeito aos limites.

Conta somente é efetivada após o link de verificação de 30 minutos ser confirmado explicitamente em `/verificar-email`. O link é de uso único. Verificar o e-mail não autentica o usuário nem inicia assinatura. Após confirmar, o usuário pode seguir para o login real da [autenticação](autenticacao.md); confirmação não inicia sessão automaticamente. CTAs do header e hero levam ao cadastro.

FormFisik Pro: regras comerciais em [modelo de negócio](../estrategia/modelo-de-negocio.md). Nenhum cartão é coletado aqui e nenhuma cobrança é criada.

## API

Todas as respostas têm Cache-Control no-store. Endpoints POST aceitam JSON de até 8192 bytes e Origin igual a APP_URL. Campos desconhecidos são descartados pela validação do cadastro.

| Endpoint | Entrada | Saída |
| --- | --- | --- |
| `/api/accounts/register` | fullName, email, password, confirmPassword; website vazio (honeypot) | 202 com mensagem genérica para novo e-mail ou duplicado; não retorna usuário, token ou sessão |
| `/api/accounts/verify` | token de 43 caracteres base64url | 200 após confirmação; 400 para inválido, expirado ou usado |
| `/api/health` | GET sem payload | 200 quando banco e histórico de migrations estão acessíveis; 503 caso contrário |

Erros: 400 dados inválidos (cadastro inclui errors por campo), 403 origem rejeitada, 429 limite atingido com Retry-After, 503 banco/SMTP/configuração indisponível. Conteúdo de erro de infraestrutura não é exposto.

## Modelo de dados

Fonte de verdade: `db/migrations/001_professional_registration.sql`.

- `users`: UUID, e-mail normalizado único, nome, role professional, datas de criação e verificação. Sem estado de assinatura.
- `credentials`: user_id único/FK e password_hash Argon2id; separado do perfil.
- `pending_registrations`: tentativa, digest de token único, e-mail, nome, hash de senha, criação e expiração. Não representa acesso autorizado.
- `abuse_limits`: chave HMAC, contador e expiração compartilhados entre réplicas.
- `schema_migrations`: histórico, checksum e data de aplicação.

Apagar tentativas e buckets expirados com `npm run db:cleanup`, via agendamento operacional. Nenhum dado de cartão é armazenado. O frontend não lê nem grava credenciais em Web Storage. Dados antigos do protótipo não são migrados; limpar dados locais antigos do navegador antes de testes com perfis anteriormente utilizados.

## Implementação

UI em `src/modules/registration`, rotas em `src/app/(auth)` e `src/app/api/accounts`; infraestrutura em `src/server`; migrations e executores em `db` e `scripts`. Decisões e justificativas em [ADR-001](../arquitetura/ADR-001-cadastro-profissional.md); regras visuais em [Design System](../design/DESIGN_SYSTEM.md).

## Testes reproduzíveis

Usar banco descartável com nome terminado em `_test`. Os testes fazem TRUNCATE exclusivamente no banco informado; nunca apontar para dados reais.

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

Integração: migrations idempotentes; banco real; SMTP local; Argon2id; token sem persistência em claro; confirmação, replay, expiração, duplicidade, concorrência, validação, limite, origem rejeitada, senha com espaços e rollback de SMTP. E2E: Chrome instalado (CHROME_PATH opcional), servidor Next e SMTP iniciados/encerrados pelo teste; navegação, foco em erro, cadastro mobile, confirmação e verificação no banco. Capturas em test-results (ignoradas pelo Git).

## Limites operacionais

Provedor SMTP público e domínio/remetente não foram provisionados. Produção requer DATABASE_URL, APP_URL HTTPS, segredo HMAC e SMTP autenticado/TLS. Aceite SMTP não garante entrega na caixa de entrada. Política jurídica completa de privacidade e termos deve ser revisada antes da abertura pública; formulário informa a finalidade básica dos dados e não alega aceite de termos inexistentes.

## Validação desta entrega

- `npm test`: 9 cenários de integração passaram com PostgreSQL 18 isolado e SMTP local; sem skip. Mensagem estática de indisponibilidade é esperada no cenário de rejeição SMTP.
- `npm run test:e2e`: passou no Google Chrome headless, com cadastro via formulário e confirmação recebida por SMTP local, verificada no PostgreSQL.
- `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`: passaram. Build Next.js 16.4.3 com Turbopack.
- Capturas desktop (1440 px) e mobile (375 px) revisadas visualmente; não há recorte vertical obrigatório ou overflow horizontal.
- Dependências atualizadas com correções compatíveis. Npm audit após correções: 3 avisos baixos na cadeia shadcn/deepmerge; não aplicado downgrade incompatível sugerido por audit --force. O módulo usa shadcn somente no CSS, sem import do CLI no backend. Isso é uma limitação conhecida, não uma declaração de ausência de risco.
- Não foi testada entrega em caixas postais públicas: provedor SMTP e domínio de produção ainda precisam ser configurados. Nenhum deploy executado.
