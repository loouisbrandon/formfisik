# Autenticação, sessões e autorização

Estado: implementado. Login utiliza usuários/credenciais reais da [criação de conta](cadastro-profissional.md). Sessões em PostgreSQL; nenhum JWT. Recuperação de senha implementada na [Entrega 003](recuperacao-senha.md). Checkout/trial e gestão local de assinatura preparados nas entregas 005/006, sem simulação em runtime e com configuração hospedada pendente.

## Fluxos

- Cadastro e confirmação → link funcional para `/login`.
- Landing → Entrar → `/login`.
- Usuário sem sessão → `/conta` ou `/dashboard` → `/login?reason=session`.
- Login válido com endereço confirmado → novo cookie HttpOnly → `/dashboard` para profissional; `/conta` para perfil não suportado.
- Login com senha incorreta, conta inexistente, tentativa pendente ou e-mail sem confirmação → mesmo erro público. Interface orienta conferir credenciais e confirmação, sem revelar existência da conta.
- Profissional autenticado em `/login` → `/dashboard`; parâmetros externos de redirecionamento não são aceitos.
- `/dashboard` exige sessão e autorização comercial no servidor; sem assinatura vai à oferta e sem entitlement existente vai ao gerenciamento. Veja [área profissional](dashboard-profissional.md).
- Atualizar a página recupera identidade do banco por cookie. Dados da conta não vêm do navegador.
- Sair → POST same-origin → revogação no banco → cookie apagado → `/login`.
- Cookie ausente, inválido, revogado, expirado ou usuário não confirmado → acesso negado e solicitação de novo login. API também limpa cookie inválido.

A conta provisória exibe nome, e-mail, confirmação e navegação para oferta/consulta comercial. Não permite criar aluno, treino, trial ou cobrança. Estado React representa somente interação, não autorização.

## UI

Formulário com labels, autocomplete username/current-password, validação compartilhada, foco no primeiro erro, erros globais anunciados, loading e bloqueio de duplo envio. Visibilidade de senha com botão nomeado, aria-pressed e foco por teclado. Link de cadastro funciona. Recuperação tem link funcional para `/esqueci-senha`, conforme o módulo de recuperação.

`SessionStatus` consulta o servidor a cada 60 segundos enquanto visível e ao recuperar foco/visibilidade. 401 leva ao login; 503/falha de rede mostra aviso, não alega sessão encerrada. Consultas não renovam a inatividade. Login/logout notificam outras abas por BroadcastChannel sem identidade/credencial/persistência; elas descartam DOM e recarregam. Contexto pseudônimo da conta exibida é comparado no próximo check para detectar mudanças não notificadas; toda requisição protegida ao backend é validada imediatamente, independentemente dessa atualização visual. Logout/login usam navegação completa para descartar o cache React da navegação anterior. Dados privados dos módulos pagos são obtidos somente com autorização do servidor; memória do shell é descartada na mudança de conta.

## Contratos de API

Todos os endpoints usam Cache-Control private,no-store e Vary Cookie. JSON não inclui senha, hash, token ou cookie. Não enviar identificador de sessão no payload ou query string.

| Rota | Método / entrada | Resultado |
| --- | --- | --- |
| `/api/auth/login` | POST JSON {email,password}, Origin igual a APP_URL | 200 {destination:'/dashboard'} para profissional + Set-Cookie novo; 400 validação; 401 credenciais/conta não confirmada; 403 origem; 429 abuso; 503 dependência indisponível |
| `/api/auth/logout` | POST JSON {}, cookie, Origin igual a APP_URL | 200 {destination:'/login'} somente após revogação; idempotente sem sessão; 400/403/503 em falha |
| `/api/auth/session` | GET, cookie | 200 {authenticated:true,context}; 401 se inválida com limpeza do cookie; 503 falha de infraestrutura |
| `/api/account` | GET, cookie | 200 {user,access} do profissional da sessão; 401 sem sessão; 403 perfil não profissional; 503 indisponível |
| `/api/access` | GET, cookie | 401 sem sessão; 200 trial ou período pago elegível e verificado ou 403 acesso comercial negado; não retorna conteúdo de treinos |

`user` contém somente id, fullName, email e role. `access` contém account ('confirmed_professional' ou 'unsupported_role'), commercial (estado normalizado do módulo de assinaturas), paidAccess validado no servidor e destination:'/dashboard' para profissional (outros perfis: '/conta'). Cookie é exclusivamente o transporte de sessão; não existe Bearer/JWT alternativo.

## Contrato de assinatura — atualização 005

Fonte de verdade comercial: [modelo de negócio](../estrategia/modelo-de-negocio.md). `src/server/access.ts` consulta PostgreSQL e verificação canônica da Stripe para trial ou período pago regular. Falta de configuração ou estado não elegível não autoriza. Trial vigente ou período pago regular com verificação recente pode autorizar `/api/access`. Em caso de dados com mais de cinco minutos, consulta ao provedor é obrigatória; falhas bloqueiam. UI/URL não concedem acesso. Ciclo pós-trial implementado na 006; recursos futuros também deverão validar propriedade/vínculo. [Contrato completo](assinaturas.md).

## Modelo, política e operação

Fonte de verdade: `db/migrations/002_opaque_sessions.sql` e [ADR-002](../arquitetura/ADR-002-sessoes-opacas.md). Sessão de 30 minutos de inatividade e 12 horas absolutas. Somente hash do token é persistido. Revogação é registrada antes de limpar o cookie. Cleanup remove sessões expiradas/revogadas/inativas; nenhuma tarefa externa foi provisionada.

Banco e configuração da aplicação são necessários ao login; SMTP não é dependência do login. Configurações estão em [ambientes](../operacao/ambientes.md). Se banco/configuração falha, API retorna 503 e páginas privadas falham fechadas; nenhum dado autenticado é liberado. Em produção não é permitido usar APP_URL HTTP.

## Testes e limites

Executar sequencialmente `TEST_DATABASE_URL=.../formfisik_test npm test` e `TEST_DATABASE_URL=.../formfisik_test npm run test:e2e`; suites apagam o banco isolado de teste. Chrome instalado ou CHROME_PATH. Não executar suites concorrentes contra o mesmo banco. E2E testa cadastro real e SMTP antes do login, não uma conta simulada de frontend.

Testes e evidências da execução são consolidados em [Entrega 002](../engenharia/entrega-002.md). Política de retenção final, MFA, painel de logout de todos dispositivos, WAF e produção com domínio/HTTPS real não são alegados como entregues.

## Integração da recuperação — Entrega 003

A redefinição bem-sucedida revoga todas as sessões do usuário e exige novo login; a emissão de sessão confere se o hash verificado ainda é atual para impedir corrida com redefinição. Contratos, modelo de tokens e regras da recuperação estão na [fonte de verdade do módulo](recuperacao-senha.md). Painel de dispositivos continua fora do escopo, embora o reset invalide todas as sessões automaticamente.

## Apresentação do plano — Entrega 004

Na entrega 004, profissionais confirmados eram encaminhados a `/assinatura` para conhecer o Pro; o destino atual, desde a 007, é `/dashboard` com autorização comercial própria. `/conta` continua disponível por link, sem loop de redirecionamento. Na entrega 005, estado comercial é persistido e validado pelo servidor, com indisponibilidade quando a Stripe não está configurada. A alteração de destination não modifica autenticação, cookie ou entitlement. Fonte de verdade do fluxo: [assinaturas](assinaturas.md).

Login e seus redirecionamentos não consultam a Stripe: a emissão de sessão não depende de disponibilidade do gateway. Consulta de entitlement indisponível retorna commercial unavailable e paidAccess false, preservando acesso à conta; endpoint de refresh comercial informa falha.

## Atualização 007

O destino profissional atual é `/dashboard`, protegido por verificação de assinatura no servidor. Esta regra substitui o encaminhamento provisório à oferta descrito na entrega 004. Login não depende da Stripe para criar sessão; a página decide acesso ou regularização. Conta e assinaturas usam o shell profissional. [Contrato e validação](dashboard-profissional.md).

## Segurança e minimização — 015

`context` é HMAC com domínio de uso separado sobre o usuário da sessão, exclusivamente para correlacionar a conta exibida entre SSR e checagem passiva. Não é ID de sessão, senha, chave HMAC ou credencial: nenhum endpoint o aceita para autenticar/autorizar. Não persiste em Web Storage e muda entre usuários. A resposta passiva não retorna perfil ou finanças e não aciona Stripe. O layout já valida a montagem; checagens posteriores/foco continuam sem renovar inatividade. Mudança de contexto limpa o shell antes de navegar para `/conta`.

Migration 015 e CLI restrita adicionam suspensão; login/recuperação/emissão/leitura de sessão recusam conta desativada. Trigger revoga sessões e links; reativação não os restaura. Motivos enumerados/auditoria mínima. Operação não equivale a apagar dados ou cancelar assinatura. Confirmar por relógio real depois de lock; JSON tem deadline total 15s. Contratos de autenticação agora rejeitam campos extras. [Operação e limites](../seguranca/controles-e-operacao.md).

## Interação operacional016

Reativação pelo controle de segurança recusa contas com eliminação pendente. Replay autenticado após restore suspende novamente contas do escopo antes de reabrir acesso e revoga sessões do snapshot. Não cria sessão, não muda credencial e não cancela assinatura. Fila/ledger são de operador, sem endpoint público; [limites e procedimentos](../operacao/estabilizacao-016.md).
