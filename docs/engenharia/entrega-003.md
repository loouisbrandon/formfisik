# Entrega 003 — Recuperação de senha completa

Estado: implementado e validado de ponta a ponta com PostgreSQL e SMTP locais controlados. Nenhum deploy, serviço externo, pagamento, trial ou funcionalidade mobile foi realizado.

## Resultado funcional

Solicitação em `/esqueci-senha` → validação e rate limiting no servidor → token aleatório com digest no PostgreSQL → mensagem via SMTP → `/redefinir-senha#token` → validação não destrutiva → nova senha Argon2id → revogação de todas as sessões e invalidação dos links → confirmação com navegação para login → autenticação com nova senha.

Nenhum fluxo simulado: testes usam PostgreSQL 18 local descartável e SMTP controlado que recebe mensagens realmente transmitidas pelo Nodemailer. Ambiente público/produção não foi provisionado.

## Regras implementadas

- Token opaco de 32 bytes aleatórios, expiração de 30 minutos, apenas SHA-256 persistido e uso único validado no servidor.
- Solicitações não alteram senha/sessões; reset confirmado altera senha, consome todos os links pendentes e revoga todas as sessões na mesma transação.
- Login revalida hash sob lock compartilhado para impedir criação tardia de sessão com senha antiga validada antes da troca.
- Apenas usuários com e-mail confirmado e credencial existente recebem token; recuperação não substitui confirmação de cadastro.
- Resposta pública igual para e-mail existente, inexistente e não confirmado; caminho SMTP comum, rate limiting e mensagens neutras.
- Falha SMTP ao pedir link reverte tentativa e retorna erro real. Notificação após mudança é independente: eventual falha não desfaz alteração já concluída.
- Sem JWT, autenticação automática ou credenciais/tokens em Web Storage.
- Token em fragmento removido do histórico e mantido em memória, fora de URLs HTTP/analytics/logs. Headers/meta no-referrer, noindex e restrições CSP na página.
- Nova senha 12–128 caracteres, confirmação igual, espaços preservados; senha antiga deixa de autenticar.
- Labels, validação, feedback/loading, foco, navegação por teclado e apresentação alinhada ao Design System.

## Arquivos e módulos desta entrega

| Área | Arquivos |
| --- | --- |
| Persistência | `db/migrations/003_password_recovery.sql`, `scripts/cleanup.ts` |
| Backend e e-mail | `src/server/password-recovery.ts`, `src/server/mail.ts` |
| Concorrência com login | `src/server/auth.ts`, `src/server/sessions.ts` |
| API | `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/reset-password/validate/route.ts`, `src/services/api/endpoints.ts` |
| UI | `src/app/(auth)/esqueci-senha/page.tsx`, `src/app/(auth)/redefinir-senha/page.tsx`, `src/modules/auth/recovery-shell.tsx`, `src/modules/auth/forgot-password-form.tsx`, `src/modules/auth/reset-password-form.tsx`, `src/modules/auth/recovery-schema.ts` |
| Integração e configuração | `src/modules/auth/login-form.tsx`, `src/app/(auth)/login/page.tsx`, `next.config.ts`, `.env.example` |
| Testes | `tests/recovery.test.ts`, `tests/e2e.ts` |
| Documentação | `docs/modulos/recuperacao-senha.md`, `docs/modulos/autenticacao.md`, `docs/arquitetura/ADR-003-recuperacao-senha.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/operacao/ambientes.md`, `README.md`, este registro e `CHANGELOG.md` |

Alterações já presentes das entregas anteriores foram preservadas. Nenhuma migration aplicada anteriormente foi editada.

## Testes executados e evidências

- `npm test`: **36 testes passaram**, sem falhas ou skips (12 de recuperação, 15 de autenticação, 9 de cadastro), PostgreSQL 18 e SMTP local.
- Recuperação: endereço conhecido/desconhecido/não confirmado, resposta igual, geração/digest/TTL, validação sem consumo, senha Argon2id, expiração, token inválido, uso único, concorrência entre links, revogação de todas as sessões, senha antiga recusada/nova aceita, login com hash obsoleto rejeitado, validações/CSRF/payload, limites de pedido/reset, rollback SMTP, falha de notificação pós-commit e logs sem segredos.
- `npm run lint` e `npm run typecheck`: passaram.
- `npm run build`: passou, Next.js 16.4.3 com Turbopack e novas rotas de API dinâmicas.
- `git diff --check`: passou.
- `npm run test:e2e`: passou no Chrome headless. Usuário criado/confirmado no fluxo real, solicitação recebida por SMTP, reset pela UI, senha antiga recusada/nova aceita, revogação no banco, token usado/expirado recusado, token ausente das URLs HTTP/Web Storage e política no-referrer/CSP verificadas.
- Axe (tags WCAG 2 A/AA, 2.1 AA e 2.2 AA) não reportou violações nas telas/estados avaliados de solicitação e redefinição, além das regressões de login/conta. Navegação por teclado e submissão por Enter testadas.
- Capturas desktop 1440 px e mobile 375 px das duas novas telas revisadas visualmente; sem recorte obrigatório ou overflow horizontal no formulário de redefinição. Capturas em test-results, ignoradas pelo Git.
- Serviços temporários de aplicação, SMTP e PostgreSQL encerrados ao finalizar os testes. Nenhum envio para serviço SMTP público ou deploy.

Comandos reproduzíveis: TEST_DATABASE_URL deve apontar para banco isolado cujo nome termine em `_test`. Suites fazem TRUNCATE e devem ser executadas sequencialmente.

```bash
TEST_DATABASE_URL=postgresql://.../formfisik_test npm test
TEST_DATABASE_URL=postgresql://.../formfisik_test npm run test:e2e
npm run lint
npm run typecheck
npm run build
git diff --check
```

## Limitações conhecidas

Entrega pública de e-mail, domínio, TLS e configuração Railway permanecem dependentes de ambiente autorizado; SMTP aceitar mensagem não garante caixa de entrada. Não existe fila/retry automático do aviso de alteração. Após reload da tela de reset, reabrir link original do e-mail, pois token não é persistido no navegador.

Rate limiting de IP permanece conservador/compartilhado enquanto o ingress não possuir header confiável validado. Limites por e-mail e globais persistem no banco. Proteção volumétrica, alertas, retenção e agenda de cleanup continuam sendo responsabilidades operacionais antes de abertura pública.

Não se alega conformidade integral de acessibilidade ou teste com leitor de tela real; axe, teclado e revisão visual cobrem as telas avaliadas. Recuperação não concede confirmação, assinatura, trial ou permissão paga. Nenhum recurso comercial implementado.

Decisões e contratos estão nas fontes de verdade: [ADR-003](../arquitetura/ADR-003-recuperacao-senha.md), [módulo de recuperação](../modulos/recuperacao-senha.md) e [Design System](../design/DESIGN_SYSTEM.md).
