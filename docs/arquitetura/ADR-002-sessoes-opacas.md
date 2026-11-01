# ADR-002 — Login e sessões opacas persistentes

Estado: implementado; resultados de validação em [Entrega 002](../engenharia/entrega-002.md). Substitui somente a previsão de sessões futuras da ADR-001, preservando cadastro e credenciais.

## Decisão e limites

Reutilizar Next.js, `pg`, PostgreSQL e Argon2id existentes. Adicionar `cookie` para interpretação/serialização HTTP e APIs criptográficas nativas do Node.js para aleatoriedade e SHA-256. Não criar cifragem, assinatura, JWT ou algoritmo próprio. A camada de sessão é pequena e explícita: identificador aleatório de 32 bytes, digest no banco, consulta por digest e expiração/revogação verificadas no servidor.

Bibliotecas completas de autenticação foram consideradas, mas exigiriam adapters e reconciliação dos fluxos de usuário/credenciais já entregues. Não introduzir um segundo cadastro ou um esquema paralelo de identidade. A decisão mantém a responsabilidade explícita de testar ciclo de vida, cookies, CSRF e autorização nesta camada. Reavaliar biblioteca completa se MFA, federação ou novos provedores tornarem essa superfície mais complexa.

## Modelo e política

Migration `002_opaque_sessions.sql` acrescenta `sessions`: token_hash (PK), user_id (FK com cascade), created_at, last_seen_at, expires_at e revoked_at, com índices de usuário, expiração e atividade. O token original nunca entra no banco. A migration permite email_verified_at nulo para estados importados não confirmados; o cadastro normal continua criando `users` somente depois da confirmação. Não há migração de usuários ou senhas duplicadas.

- Inatividade: 30 minutos.
- Duração absoluta: 12 horas desde emissão, sem extensão.
- Navegação protegida no servidor atualiza last_seen_at somente enquanto a sessão ainda está válida. Consultas passivas de status/API não estendem inatividade.
- Logout grava revoked_at antes de instruir o navegador a apagar o cookie. Falha de banco retorna erro e não alega logout concluído.
- Novo login sempre emite identificador novo e revoga a sessão anterior apresentada, em transação. Outros dispositivos permanecem válidos até seu próprio logout/expiração; revogação global e painel de dispositivos não fazem parte desta entrega.
- Consulta valida sessão, expiração, inatividade e confirmação do usuário. Dados do usuário são lidos do banco a cada requisição, sem cache compartilhado entre pessoas.
- DELETE do usuário invalida sessões por FK. Perda da confirmação do endereço também impede acesso.

A validação com atualização de atividade usa predicados no mesmo UPDATE; não há escrita posterior que possa apagar revoked_at ou reviver sessão revogada em concorrência. Requisições já autorizadas antes do logout podem terminar; requisições posteriores precisam validar novamente.

## Cookies, CSRF e dados

Cookie de produção `__Host-formfisik-session`: HttpOnly, Secure, SameSite=Lax, Path=/, sem Domain, expiração na data absoluta. Desenvolvimento HTTP usa `formfisik-session`, HttpOnly e SameSite=Lax. A limpeza usa os mesmos atributos e Max-Age=0. Produção exige APP_URL HTTPS e não possui opção para desativar Secure.

Formulários de credenciais declaram method=post e action explícitos, impedindo envio nativo por GET antes da hidratação; o contrato de API requer JavaScript/JSON e rejeita submissão nativa sem colocar senha na URL. Login e logout exigem Origin exatamente igual a APP_URL, rejeitam Sec-Fetch-Site cross-site e aceitam somente application/json com até 8192 bytes. JSON não é um tipo simples para requisição cross-origin, e não existe CORS permissivo. SameSite é defesa adicional, não substitui essas verificações. GET de inspeção não autentica, não revoga e não prolonga sessão. Não há mutações de domínio por GET. Atualização de last_seen_at em renderização privada é atividade técnica de sessão.

O identificador só sai em Set-Cookie; respostas JSON não o contêm. Credenciais e identificadores não usam localStorage/sessionStorage. Não confiar em returnTo/next externos: destino atual fixo `/conta`. Respostas de API usam private, no-store e Vary Cookie; páginas privadas são dinâmicas por cookies assíncronos, sem cache público de identidade.

## Proteção de senha e abuso

Verificação pelo `argon2.verify`, preservando espaços. Conta ausente verifica hash dummy com os mesmos parâmetros Argon2id; contas existentes e não confirmadas também verificam senha. Todas as falhas de identidade usam o mesmo 401 e texto, com duração mínima de 750 ms; isso reduz discrepâncias triviais sem prometer tempo de rede indistinguível.

Limites persistidos HMAC reutilizam `abuse_limits`: 5 tentativas/e-mail/15 minutos, 20/origem de rede/15 minutos e 100 globais/minuto. Contam sucesso e falha para impedir bypass de fluxo, e não são removidos por autenticação. Normalização evita bypass por maiúsculas. Headers de IP arbitrários não são confiáveis; preserva-se a configuração explícita de ingress da ADR-001. Limites podem afetar disponibilidade e não substituem proteção volumétrica na infraestrutura.

Logs são somente códigos estáticos: auth_login_succeeded, auth_login_rejected, auth_logout_completed, auth_dependency_unavailable. Não contêm e-mail, senha, token, cookie, hash, corpo de requisição nem exceção de banco. Não há vinculação por IP/user-agent, que não são fatores confiáveis de identidade.

## Autorização

Autenticar não autoriza módulo pago. `/api/account` aceita somente profissional confirmado, consulta sua própria identidade e ignora parâmetros de usuário fornecidos pelo cliente. `/api/access` é uma fronteira explícita que nega acesso pago a todos até existir integração comercial real. `/dashboard` não renderiza as métricas simuladas antigas: exige sessão e redireciona para `/conta`.

O helper `requireUser` protege páginas, mas não substitui a validação em cada Route Handler. Nenhuma regra depende exclusivamente de menu, proxy ou estado React. Perfis médicos continuam sem regras presumidas.

## Referências

- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://github.com/jshttp/cookie
- Guias locais da versão Next instalada: authentication, cookies e redirect.
