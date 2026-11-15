# ADR-001 — Cadastro profissional e confirmação de endereço

Estado: aceito e implementado nesta entrega. Escopo: criação de conta; autenticação por sessão e cobrança permanecem planejadas.

## Contexto

A FormFisik é independente. O protótipo guardava senha e dados pessoais no navegador. Não existe necessidade de preservar esse mecanismo. Railway é o destino inicial, sem autorização de provisionamento/deploy nesta entrega.

## Decisão

Next.js App Router com Route Handlers Node.js; PostgreSQL via `pg`; migrations SQL transacionais com checksum e advisory lock; Zod compartilhado para validação; `argon2` para Argon2id; Nodemailer via SMTP. SQL parametrizado evita introduzir ORM para quatro tabelas pequenas. Bibliotecas consolidadas fornecem hashing, aleatoriedade e transporte; não há algoritmo criptográfico próprio.

Cadastro utiliza nome, e-mail, senha e confirmação de senha. Endereço, telefone, nascimento e registro profissional não são exigidos: não são necessários para comprovar controle do endereço. Isso não certifica habilitação profissional. Médico não recebe fluxo ou permissões específicas nesta entrega.

Cada solicitação válida cria uma tentativa pendente contendo apenas hash Argon2id e hash SHA-256 de token aleatório de 32 bytes. Confirmação atômica cria `users` e `credentials`, marca endereço verificado e invalida todas as tentativas pendentes daquele e-mail. Assim uma pessoa que pré-cadastre o e-mail de outra não fixa a senha usada pelo titular ao confirmar sua própria tentativa.

SMTP ocorre antes do commit da tentativa. Falha de transporte reverte a transação e retorna 503. Se SMTP aceitar e o commit falhar, o e-mail pode conter link inválido; a resposta é falha e o usuário pode reenviar. Não se promete entrega final do e-mail após aceite SMTP. Não há fila ou worker externo nesta arquitetura inicial.

Solicitações de endereço já confirmado recebem o mesmo status/mensagem pública e um e-mail informativo sem token; credenciais existentes nunca são modificadas pelo cadastro. Hashing também é executado nessa situação. Duração mínima de resposta reduz diferenças triviais de tempo, sem prometer indistinguibilidade perfeita de rede.

Token é enviado no fragmento da URL e removido do histórico ao abrir a tela. Apenas um POST após clique explícito consome o token; GET/scanners não confirmam conta. Não há sessão, cookie autenticado, JWT ou concessão de assinatura.

## Segurança e consequências

Argon2id: memória 19456 KiB, tempo 2, paralelismo 1; salt gerado pela biblioteca. Senhas entre 12 e 128 caracteres, sem trim; confirmação nunca persistida. Token de verificação expira em 30 minutos, armazenado apenas como digest. Tabelas e índices constam da migration.

Rate limiting persistente em PostgreSQL usa HMAC de endereço/e-mail: 3 solicitações/e-mail/15 min; 10 solicitações/origem de rede/15 min; 100 solicitações globais/minuto; confirmação 30/origem/15 min. Buckets fixos, sem dependência de memória por réplica. Limite não substitui WAF ou observabilidade de abuso em larga escala.

Por padrão o endereço de rede usa bucket conservador compartilhado. Configurar `TRUSTED_CLIENT_IP_HEADER` somente após verificar que o ingress sobrescreve o header com um IP único e não permite bypass. Nunca confiar automaticamente em X-Forwarded-For enviado pelo cliente. Limite por e-mail/global continua funcionando independentemente disso.

POST exige Origin exatamente igual a APP_URL e rejeita sec-fetch-site cross-site; aceita somente JSON, com leitura limitada a 8192 bytes. SQL é parametrizado; erros são genéricos; logs registram apenas código estático sem conteúdo de exceção. Imports de infraestrutura usam `server-only`.

Futura sessão opaca exigirá tabela própria com expiração/revogação, cookies HttpOnly/Secure/SameSite e autorização por recurso no servidor. Nenhum campo token de login foi introduzido. Role professional não implica assinatura ou permissão de módulos pagos.

## Alternativas

ORM: adiado para evitar abstração desnecessária; reconsiderar quando relações e módulos crescerem. Biblioteca completa de autenticação: reavaliar na entrega de login/sessões; não implementar seu fluxo completo nesta entrega. Token JWT: rejeitado por requisito. Persistência em navegador: descontinuada.

## Referências

- https://node-postgres.com/features/transactions
- https://github.com/ranisalt/node-argon2
- https://nodemailer.com/smtp
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
