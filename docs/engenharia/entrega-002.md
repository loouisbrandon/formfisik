# Entrega 002 — Login e gerenciamento de sessões

Estado: implementação concluída; resultados finais da validação registrados abaixo. Nenhum deploy ou serviço externo criado. Aplicação/SMTP de teste e PostgreSQL descartável foram encerrados após a validação.

## Funcionalidade

Login por e-mail e senha de usuários reais, reaproveitando PostgreSQL, usuários, credenciais Argon2id e confirmação de endereço da Entrega 001. Sessão persistida e validada no servidor em toda rota protegida. Cookie com identificador aleatório opaco; nenhum JWT ou credencial no Web Storage.

Após autenticar, `/conta` mostra a identidade confirmada e a indisponibilidade comercial. Não ativa assinatura, trial ou pagamento. O dashboard demonstrativo antigo deixa de ser público e redireciona para essa área após exigir autenticação. Login, confirmação de e-mail, cadastro e navegação pública estão integrados.

Logout revoga a sessão no PostgreSQL antes de apagar o cookie. Expiração por 30 minutos de inatividade e 12 horas absolutas. Navegação protegida atualiza atividade sem estender o teto absoluto; checks passivos não prolongam a sessão. Tentativa de usar sessão revogada, expirada ou de usuário sem confirmação é negada. Reautenticação emite novo token e revoga o anterior apresentado.

## Segurança e regras de acesso

- Hash de senha existente verificado pelo Argon2; senha nunca é normalizada com trim.
- Conta ausente, senha errada, cadastro pendente e conta não confirmada têm a mesma resposta pública de falha.
- Cookie HttpOnly e SameSite=Lax; produção exige HTTPS e usa prefixo __Host-, Secure, Path=/ e nenhum Domain. Só digest de token entra no banco.
- Login e logout exigem Origin canônico, JSON limitado e rejeitam cross-site. Não existe mutação por GET de autenticação ou domínio nem CORS permissivo.
- Formulários declaram POST nativo, para impedir senha em query string antes da hidratação. A API exige JSON.
- Rate limiting persistente por e-mail, origem de rede confiável e global. Logs de segurança estáticos sem dados pessoais, credenciais, identificadores ou exceções cruas.
- Perfil e confirmação são verificados no servidor. `/api/account` só fornece dados do próprio profissional; parâmetros de identificação não selecionam outro usuário. `/api/access` nega módulos pagos mesmo com sessão válida.
- Sem open redirect por returnTo externo. Sem cache público de identidade.

Fonte de verdade técnica: [ADR-002](../arquitetura/ADR-002-sessoes-opacas.md). Contratos e fluxo comercial futuro: [módulo de autenticação](../modulos/autenticacao.md).

## Arquivos desta entrega

| Área | Arquivos |
| --- | --- |
| Persistência | `db/migrations/002_opaque_sessions.sql`, `scripts/cleanup.ts` |
| Segurança e sessão | `src/server/auth.ts`, `src/server/sessions.ts`, `src/server/current-user.ts`, `src/server/access.ts` |
| Reuso de infraestrutura | `src/server/http.ts`, `src/server/config.ts`, `src/server/mail.ts`, `src/server/registration.ts` |
| APIs | `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/session/route.ts`, `src/app/api/account/route.ts`, `src/app/api/access/route.ts`, `src/services/api/endpoints.ts` |
| UI | `src/modules/auth/login-form.tsx`, `src/modules/auth/logout-button.tsx`, `src/modules/auth/session-status.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(app)/conta/page.tsx`, `src/app/(app)/dashboard/page.tsx` |
| Integração e identidade visual | `src/components/layout/header.tsx`, `src/app/(auth)/cadastro/page.tsx`, `src/modules/registration/verify-email.tsx`, `src/modules/registration/registration-form.tsx`, `src/app/globals.css` |
| Configuração | `.env.example`, `package.json`, `package-lock.json` |
| Testes | `tests/auth.test.ts`, `tests/e2e.ts` |
| Documentação | `README.md`, `docs/modulos/autenticacao.md`, `docs/modulos/cadastro-profissional.md`, `docs/arquitetura/ADR-002-sessoes-opacas.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/operacao/ambientes.md`, este relatório |

Arquivos e alterações da Entrega 001 e das diretrizes institucionais já presentes no diretório foram preservados. Não existe CHANGELOG no repositório; o histórico permanece nos registros das entregas e nas ADRs.

## Plano de testes executado

Banco isolado PostgreSQL 18 local; SMTP controlado local para a regressão de cadastro; Chrome headless. Nenhum e-mail externo enviado. Suítes de integração são sequenciais para não concorrer em TRUNCATE do mesmo banco descartável.

Comandos:

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build
git diff --check
```

Cobertura do login: credenciais corretas/incorretas; usuário inexistente; cadastro pendente e conta não confirmada; criação de sessão/digest/cookie; rotação; inatividade e teto absoluto; refresh apenas da atividade; logout e replay; corrida com atualização de atividade; CSRF; JSON inválido e payload excessivo; rate limiting; cookies falsos; usuário removido; autorização por perfil/recurso; negação comercial; cookie de produção e logs sem segredos; falha explícita de configuração.

E2E: usuário criado e confirmado pela UI/SMTP reais; login, visibilidade de senha, teclado, reload persistindo identidade, dashboard protegido, redirecionamento externo ignorado, logout com falha de rede controlada e retry real, revogação no banco e replay rejeitado, rotas sem sessão e com sessão expirada. Inspeção de HttpOnly e ausência de dados secretos em document.cookie/Web Storage/JSON. Verificação axe e revisão visual desktop/mobile. A falha de rede é uma injeção de erro de teste identificada; não é um fluxo de produto simulado.

## Resultados finais

- `npm test`: 24 testes passaram (15 de autenticação e 9 de cadastro), sem falhas ou skips, em PostgreSQL 18 local. Eventos estáticos de rejeição/indisponibilidade são esperados nos cenários negativos.
- `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`: passaram. Build Next.js 16.4.3 com rotas login/conta/dashboard dinâmicas.
- E2E de cadastro, SMTP, login, cookies, refresh, logout/replay, expiração, negação paga e verificações axe passou. A execução final também passou com navegação de senha por Tab/Espaço/Enter e links do cabeçalho dentro da largura de 320 px.
- Verificação axe com tags WCAG 2 A/AA, 2.1 AA e 2.2 AA: nenhuma violação reportada nas telas de login desktop/mobile e conta avaliadas, após corrigir contraste do botão. Não é certificação global.
- Capturas de login e conta desktop/mobile revisadas visualmente; mantidos tokens e identidade FormFisik. Resultados de teste ficam em test-results, ignorado pelo Git.
- Npm audit final: 3 avisos baixos em shadcn/@shadcn/registry/deepmerge; nenhum moderado, alto ou crítico reportado. Não aplicado downgrade incompatível via audit --force. Limitação conhecida da cadeia de ferramenta/CSS, sem import do CLI no backend.

## Limitações e pendências operacionais

Não implementados: recuperação de senha, painel de dispositivos, revogação global, MFA, cobrança, trial e módulos pagos. O pedido exclui essas funcionalidades. Médicos não recebem permissões presumidas.

Produção requer PostgreSQL, APP_URL HTTPS canônico, segredo HMAC estável e configuração validada do ingress. SMTP continua necessário ao cadastro. Não foi provisionado domínio/TLS público nem realizado deploy. Atributos de cookie de produção são testados localmente; staging real no Railway deverá validar domínio/proxy/HTTPS antes de abrir acesso público.

Enquanto TRUSTED_CLIENT_IP_HEADER não for validado, o bucket compartilhado por origem de rede é conservador e pode limitar vários usuários. Limites por e-mail e globais persistem. Agendamento de cleanup, backup, alertas, retenção final e proteção volumétrica dependem da operação futura; expiração/revogação são efetivas sem depender do cleanup.

A verificação automatizada de acessibilidade e teclado não certifica toda a aplicação nem substitui teste com leitor de tela real. Somente as telas descritas foram avaliadas. A documentação comercial futura define o contrato e a negação atual; não inventa estados de assinatura.
