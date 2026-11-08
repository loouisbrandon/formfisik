# Recuperação e redefinição de senha

Estado: implementado. Verificações desta entrega em [Entrega 003](../engenharia/entrega-003.md). Autenticação web sem JWT; não altera assinatura, trial, permissões ou confirmação de e-mail.

## Uso

1. Em `/login`, abrir “Esqueci minha senha”, que leva a `/esqueci-senha`.
2. Informar e-mail válido. Mensagem genérica orienta conferir caixa de entrada/spam, sem informar se a conta existe.
3. Usuário confirmado recebe link com token temporário de 30 minutos. Solicitar não muda senha nem revoga sessões.
4. Abrir `/redefinir-senha#token`: a tela limpa o fragmento, valida no servidor sem consumir, então permite nova senha e confirmação.
5. Salvar nova senha (8–128 caracteres, com maiúscula, minúscula e caractere especial). Sucesso revoga todas as sessões, invalida todos os links pendentes e apresenta confirmação.
6. Seguir “Entrar com a nova senha” para `/login?reason=reset`. Login é obrigatório e não é realizado automaticamente.

Link ausente, expirado ou usado mostra mensagem única e link funcional para novo pedido. Conexão/backend indisponível permite repetir a validação sem declarar link inválido. Depois de atualizar a página, reabrir o link original do e-mail: o token não é preservado no navegador. Se resposta da troca se perder após commit, verificar o login com a nova senha; reaplicar token consumido será recusado.

## API

POST same-origin, JSON até 8192 bytes. Cache-Control private,no-store, Vary Cookie, Referrer-Policy no-referrer. Nenhum token em resposta pública ou sessão automática.

| Rota | Entrada | Respostas |
| --- | --- | --- |
| `/api/auth/forgot-password` | `{email}` | 202 com mensagem genérica igual; 400 e-mail/payload; 403 origem; 429 limite; 503 dependência indisponível |
| `/api/auth/reset-password/validate` | `{token}` | 200 `{valid:true}` sem identidade; 400 link inválido/expirado/usado; 403/429/503 |
| `/api/auth/reset-password` | `{token,password,confirmPassword}` | 200 `{message,destination:'/login'}` e limpeza do cookie; 400 link ou validação de senha; 403/429/503 |

Link inválido, expirado e usado são indistinguíveis publicamente. Erro de senha inclui errors por campo sem ecoar valor. Confirmação de token no frontend é conveniência; backend valida novamente dentro da transação.

## Modelo de dados e segurança

Migration `003_password_recovery.sql`: tabela `password_resets` com token_hash PK char(64), user_id UUID FK ON DELETE CASCADE, created_at e expires_at (30 minutos), índices user_id e expires_at. Credenciais permanecem na tabela existente; nenhum token em claro ou duplicação de usuário. Cleanup remove expirados com `npm run db:cleanup`.

Transação de reset altera hash, revoga sessões e remove links conjuntamente. A emissão de sessão revalida hash sob lock para impedir login tardio com senha antiga. Testes cobrem concorrência entre links e emissão com credencial obsoleta. Decisões detalhadas: [ADR-003](../arquitetura/ADR-003-recuperacao-senha.md).

Limites e tratamento de falha SMTP são fontes de verdade na ADR. O aviso posterior de alteração é tentado após commit; falha desse aviso não desfaz a senha. Pedido de recuperação com falha SMTP retorna 503 sem sucesso simulado. Resposta igual para e-mail desconhecido, conhecido ou sem confirmação.

## Interface e acessibilidade

RecoveryShell reutiliza identidade, tipografia, cores, cards e inputs existentes. Formulários POST, labels persistentes, autocomplete, erros associados, foco no primeiro erro, status/alert e loading. Redefinição permite mostrar/ocultar senhas com botão nomeado e aria-pressed. Não usa recursos de analytics ou externos. Layout de uma coluna com largura máxima lg, rolagem natural e controles de 48 px.

## Configuração e testes

Reutiliza DATABASE_URL, APP_URL HTTPS em produção, SMTP_HOST/PORT/USER/PASSWORD, MAIL_FROM e segredo de limites. Não introduz segredo JWT ou serviço externo. [Ambientes e SMTP](../operacao/ambientes.md).

Executar suites sequencialmente contra banco descartável terminado em `_test`: `npm test` e `npm run test:e2e` com TEST_DATABASE_URL. Integração utiliza PostgreSQL real e SMTP local; E2E obtém o token da mensagem capturada no servidor SMTP controlado, nunca de uma resposta falsa do produto. Resultados finais, limites e arquivos constam na Entrega 003.


Atualização de07/11/2026: cadastro, redefinição e troca nas configurações reutilizam passwordSchema. Exigidos8–128 caracteres, letra maiúscula, minúscula e caractere especial (espaço não conta). Número não é obrigatório. Login preserva compatibilidade com senhas existentes; bytes e espaços não são normalizados. Teste dedicado cobre limites, categorias, confirmações e compatibilidade do login.
