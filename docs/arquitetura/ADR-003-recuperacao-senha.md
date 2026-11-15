# ADR-003 — Recuperação de senha por token opaco

Estado: implementado. Reutiliza PostgreSQL, credenciais, Argon2id, SMTP e sessões das ADRs 001/002. Sem JWT, segundo cadastro ou novos serviços externos.

## Token e integridade

`crypto.randomBytes(32)` gera token base64url de 43 caracteres. Somente digest SHA-256 é persistido em `password_resets`, com FK user_id, criação e expiração em 30 minutos. A validação inicial é POST e não consome token. Somente o POST com nova senha pode alterar credenciais. Não confiar em verificação prévia do frontend: o token é revalidado após adquirir lock no banco, inclusive a expiração por clock_timestamp.

Redefinição obtém FOR UPDATE no usuário, consome o token ainda válido, altera o hash Argon2id, revoga todas as sessões e apaga todos os links de recuperação do usuário, na mesma transação. Em rollback, nenhuma dessas alterações persiste. Duas tentativas simultâneas, pelo mesmo link ou por links diferentes, permitem exatamente uma alteração. Pedido novo de recuperação não cancela links válidos anteriores: isso evita que um terceiro invalide continuamente os links do titular; a redefinição concluída invalida todos eles.

Cadastro pendente ou conta não confirmada não recebe token de recuperação nem ganha confirmação por este fluxo. A senha mantém a política do cadastro: 12–128 caracteres, confirmação igual, espaços preservados. Argon2id usa os parâmetros já adotados (19456 KiB, tempo 2, paralelismo 1), salt gerado pela biblioteca. Não há autenticação automática.

## Concorrência com login

Uma validação Argon2 iniciada antes da redefinição poderia terminar depois dela e emitir uma sessão baseada na senha antiga. A emissão de sessão agora exige que o hash validado pelo login continue sendo o mesmo no banco, sob lock compartilhado no usuário. O reset usa lock exclusivo nessa mesma linha. Se login emitir antes, o reset revoga essa sessão; se reset concluir primeiro, emissão com hash antigo falha com a mensagem genérica de credenciais. Não alterar a migration anterior nem duplicar credenciais.

## Transporte e privacidade

Link construído exclusivamente a partir de APP_URL canônico, nunca Host ou URL fornecida pelo cliente. Token vai no fragmento `/redefinir-senha#...`; o navegador não envia esse fragmento em requisições HTTP. Ao montar a tela, remove-o do histórico e guarda-o apenas em memória. Nunca usar localStorage/sessionStorage, analytics, logs ou campos de query para tokens. Um reload após remover o fragmento exige reabrir o link original do e-mail; isso é deliberado.

Página sem analytics/terceiros; fontes de next/font são servidas localmente. Política HTTP e meta Referrer-Policy no-referrer; noindex/nofollow; CSP restringe form-action/base-uri a self, proíbe objetos e enquadramento. Não se alega CSP integral contra XSS: os controles são específicos e compatíveis com o Next existente. Respostas API são private,no-store e não expõem token, digest, identidade ou hash. GET não verifica/consome token; scanners de link não alteram senha.

## Enumeração, abuso e falhas

Toda solicitação de e-mail sintaticamente válido segue o mesmo transporte SMTP: endereço elegível recebe link; não elegível recebe orientação neutra sem token. Isso evita que falha de SMTP apareça somente para contas reais. Resposta 202 e mensagem idênticas; mínimo de 750 ms reduz diferenças triviais de tempo, sem prometer indistinguibilidade de latência do provedor. Resposta 503 não é convertida em sucesso: falha de transporte reverte a criação do token. Igualdade de respostas vale também para falha SMTP conhecida/desconhecida. Enviar orientação a endereço não cadastrado é uma escolha consciente, sujeita aos mesmos limites para reduzir spam.

Limites persistidos via HMAC/abuse_limits: pedido 3/e-mail/15 min, 10/origem de rede/15 min, 100 globais/min; validação 30/origem/15 min; redefinição 15/origem/15 min, 100 globais/min. Configuração de IP confiável permanece a da ADR-001; não confiar em X-Forwarded-For arbitrário. JSON de até 8192 bytes, Origin canônico e rejeição cross-site reaproveitam o módulo HTTP.

Após commit envia notificação de senha alterada, sem senha nem token. Se a notificação falhar, registra evento estático e não reverte a alteração já concluída. O usuário não deve repetir uma troca já concluída por falha de um aviso posterior. SMTP aceitar mensagem não garante entrega na caixa postal. Não há fila ou retry automático: essa limitação está documentada para operação.

Logs somente códigos estáticos password_recovery_requested, password_recovery_unavailable, password_reset_completed e password_change_notification_unavailable. A alteração não registra identificador, e-mail ou corpo. Proxy/APM também deve redigir payloads de credenciais. Reset limpa cookie local após revogação, e todas as outras sessões falham na próxima consulta ao servidor.

## Referência

https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
