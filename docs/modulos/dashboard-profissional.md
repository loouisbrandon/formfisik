# Dashboard e área profissional — entrega 007

A FormFisik é empresa independente fundada por Brandon Louis. A área profissional web constitui o Módulo 03. Base criada na 007, ampliada na 008 com gestão cadastral de alunos e na 009 com a biblioteca de exercícios. A 010 acrescenta prescrições e modelos; a 012 ativa acompanhamento físico.

## Fluxo funcional

Login de profissional confirmado retorna `/dashboard`, sem depender da Stripe para criar a sessão. A página verifica novamente a sessão no servidor e consulta a autorização comercial canônica existente. Conta sem assinatura vai para `/assinatura`; contratação pendente ou assinatura sem acesso vai para `/assinatura/gerenciar`. Perfil não profissional segue para `/conta`. Sem configuração comercial e sem assinatura conhecida, segue para oferta indisponível. Falha de verificação de assinatura conhecida exibe indisponibilidade com retry; nunca concede acesso.

Dashboard autorizado apresenta nome real, onboarding com e-mail confirmado, revisão da conta, consulta de assinatura, atividades vazias e informação explícita de módulos em desenvolvimento. Não há indicadores com valores de exemplo, notificações ou histórico inventado. Saudação neutra evita inferir fuso/horário do usuário.

## Estrutura e navegação

`src/app/(app)/layout.tsx` reutiliza ProfessionalShell em dashboard, conta, oferta, retorno e gerenciamento. Sidebar/Topbar antigos de protótipo foram substituídos: links inexistentes e busca sem funcionalidade foram removidos. Layout só exige identidade; a autorização paga permanece na página/serviço, pois conta e regularização precisam continuar acessíveis sem assinatura. Layouts podem ser preservados pelo Next em navegações; não são a única barreira de segurança.

Configuração única `modules/professional/navigation.ts`: Dashboard, Alunos, Exercícios, Treinos, Acompanhamento, Minha assinatura e Minha conta. Somente Configurações permanece indisponível, sem href ou ações. Perfil não profissional vê apenas conta. Cabeçalho mostra título atual, nome real/link de conta e LogoutButton existente. Nenhuma credencial é lida de storage.

Sidebar desktop a partir de 1024 px, largura 15rem, rolagem própria; não recolhível nesta etapa com apenas três destinos ativos. Em telas menores, dialog nativo com foco contido, Escape, botão Fechar, retorno de foco ao acionador e navegação que fecha o menu. Identidade principal leva ao início. Logout fica na sidebar desktop e no cabeçalho/menu em telas estreitas. Uma fonte de menu para ambas as apresentações.

## Componentes e dados

- ProfessionalShell: nome, perfil profissional e conteúdo; um landmark main e skip link.
- Sidebar/Topbar: navegação, item ativo aria-current, ações reais.
- DashboardContent: contrato ProfessionalDashboard, onboarding e atividades.
- OperationalIndicatorCard: label, value e description; só é instanciado com indicador real fornecido pelo servidor. Na 008 retorna contagens reais de alunos ativos e arquivados.
- DashboardAccessMonitor: revalidação passiva imediata, a cada 60 segundos e ao retomar foco/visibilidade. Não renova inatividade. 401 solicita login; 403 redireciona a destino interno permitido; erro remove conteúdo favorável e apresenta retry.
- AccessUnavailable: mensagem recuperável e acesso à oferta; loading e error boundary do segmento oferecem estados explícitos.

ProfessionalDashboard contém `fullName: string`, `studentTotal: number`, `indicators: {label,value,description}[]` e `activities: {id,description}[]`. Activities permanece vazio para um futuro feed consolidado; os históricos próprios de treinos e avaliações já estão disponíveis. Indicators consulta vínculos reais da carteira, incluindo zero real. O dashboard não cria tabelas artificiais para métricas; reutiliza o modelo operacional de alunos da 008. Ao implementar módulos futuros, preencher consultas somente com registros reais vinculados ao profissional autenticado; novas operações deverão autorizar sessão, assinatura e propriedade no servidor.

## API e autorização

`GET /api/professional/dashboard`, cookie opaco existente. Sem parâmetros aceitos para identidade, assinatura ou acesso. Não há JWT, flags de desenvolvimento nem bypass financeiro.

| HTTP | Resposta |
| --- | --- |
| 200 | `{status:'allowed',data:ProfessionalDashboard}` |
| 401 | mensagem para entrar novamente; sessão ausente, inválida, expirada, revogada ou e-mail não confirmado |
| 403 | `{status:'denied',destination:'/conta'\|'/assinatura'\|'/assinatura/gerenciar'}` |
| 503 | `{status:'unavailable'}` ou mensagem genérica em falha de dependência |
| 429 | mensagem e Retry-After; limite persistente de 30 consultas/minuto por usuário |

Respostas private/no-store, Vary Cookie, no-referrer. Somente nome e coleções operacionais são retornados com acesso; sem e-mail, IDs Stripe, credenciais ou token. Reutiliza subscriptionStatus com refresh canônico, incluindo expiração, estado financeiro e revogação de entitlement existentes. Polling não é autorização suficiente para operações futuras: cada endpoint protegido deve verificar sua própria permissão. Não muda senhas, cookies, políticas de cobrança ou Stripe.

## Validação e limites

Integração usa PostgreSQL isolado terminado em `_test`, sessões reais, fluxo financeiro existente e ControlledGateway explícito. Browser da aplicação principal cobre login/navegação/logout e bloqueio sem assinatura. Browser autorizado usa aplicação temporária gerada em `/tmp`, componentes reais e fixture de identidade produzida pelo teste de integração. Interceptações UI estão restritas ao runner Playwright; essa aplicação não é empacotada na produção. Executar `npm test` antes de `npm run test:dashboard:e2e` para produzir `test-results/dashboard-data.json`.

Credenciais Stripe continuam ausentes. Acesso manual ao dashboard principal com assinatura de teste real e homologação hospedada permanecem pendentes da configuração Stripe; nenhum sucesso externo é alegado. Resultados e evidências no [relatório 007](../engenharia/entrega-007.md).

O painel de assinatura recebeu adaptação estritamente visual da grade/skeleton para a largura útil do shell e ampliação de texto, sem alterar contratos ou regras financeiras.

## Atualização 008 — alunos disponíveis

Esta seção substitui as referências anteriores à indisponibilidade do módulo Alunos e à ausência de indicadores. Menu Alunos está ativo em `/alunos` e subrotas. Dashboard consulta student_links por professional_id da sessão e retorna duas contagens reais: ativos/arquivados, inclusive zero real. ProfessionalDashboard acrescenta studentTotal (soma) e preenche indicators; activities permanece vazio para futuros treinos/acompanhamento. Onboarding orienta cadastrar o primeiro aluno quando total=0 e oferece cadastro/lista reais.

A autorização foi extraída em professionalAccess para reuso nos endpoints de alunos, sem alterar regras financeiras. [Modelo e contratos de alunos](alunos.md), [relatório 008](../engenharia/entrega-008.md).

A biblioteca de [Exercícios](exercicios.md) passa a integrar o shell na 009. O dashboard não acrescenta contagens pesadas ou fictícias do catálogo; mantém os indicadores reais da carteira de alunos.

Na 010, o dashboard acrescenta contagens SQL reais por proprietário de fichas individuais ativas e modelos em rascunho/ativos. Não há atividade de execução fictícia. [Módulo de treinos](treinos.md).

## Ampliação 012

Acompanhamento ativo na navegação e três indicadores reais: alunos ativos com avaliação ativa, avaliações ativas em alunos ativos nos últimos 30 dias civis (Brasília, hoje e 29 anteriores), alunos ativos sem avaliação nessa janela incluindo nunca avaliados. Histórico consolidado de atividades permanece vazio, sem fabricar eventos. Regras em [Acompanhamento](acompanhamento.md).
