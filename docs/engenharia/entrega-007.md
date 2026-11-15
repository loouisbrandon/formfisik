# Entrega 007 — Dashboard profissional e estrutura web

## Resultado funcional

Dashboard profissional com nome obtido da sessão real, onboarding contextual, navegação para conta/assinatura, atividades vazias explícitas e componentes preparados para indicadores futuros. Sem números, eventos, notificações ou módulos fictícios. FormFisik permanece empresa independente fundada por Brandon Louis.

Shell autenticado reutilizado em dashboard, conta, oferta, gerenciamento e retorno da assinatura. Sidebar desktop, menu móvel modal, header com página atual/identidade, skip link e logout real. Menu único distingue destinos existentes de módulos em desenvolvimento. Sidebar/Topbar anteriores substituídos porque continham links quebrados e busca sem funcionalidade.

Login retorna `/dashboard` para profissionais e continua independente da Stripe para autenticar. A página e a API validam acesso comercial no servidor. Sem assinatura, oferta; assinatura sem acesso, gerenciamento; verificação indisponível de assinatura conhecida, retry sem dados favoráveis. Layout não substitui autorização na página/serviço/API. Conta e regularização não exigem assinatura paga.

## Componentes e arquivos desta entrega

| Grupo | Arquivos |
| --- | --- |
| Shell e páginas | `src/app/(app)/layout.tsx`, `dashboard/{page,loading,error}.tsx`, `conta/page.tsx`, `assinatura/{page,loading,error}.tsx`, `assinatura/gerenciar/page.tsx`, `assinatura/retorno/page.tsx` |
| Layout | `src/components/layout/sidebar.tsx`, `topbar.tsx` |
| Área profissional | `src/modules/professional/{navigation,dashboard}.ts`, `{shell,dashboard-content,access-monitor}.tsx` |
| Servidor/API | `src/server/professional-dashboard.ts`, `src/app/api/professional/dashboard/route.ts`, `src/server/access.ts` |
| Reflow no shell | `src/modules/subscriptions/subscription-dashboard.tsx`: grade e skeleton adaptados à largura útil/ampliação de texto; sem alterações financeiras |
| Integração login | `src/modules/auth/login-form.tsx`, `src/app/(auth)/login/page.tsx` |
| Testes/scripts | `tests/dashboard.test.ts`, `tests/dashboard-e2e.ts`, `tests/auth.test.ts`, `tests/e2e.ts`, `package.json` |
| Documentação | `docs/modulos/dashboard-profissional.md`, `autenticacao.md`, `assinaturas.md`, `docs/arquitetura/ADR-007-area-profissional.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/planejamento/roadmap.md`, `README.md`, `CHANGELOG.md`, este relatório |

Reutilizados Button/Base UI, Link, Lucide, LogoutButton, SessionStatus, sessões opacas, PostgreSQL, serviço de assinatura e gateway já existentes. Sem novas bibliotecas, tabelas ou migrations. Arquivos de entregas anteriores já estavam modificados/não rastreados ao início; foram preservados. A relação acima identifica o escopo 007, não atribui todo o diff acumulado a esta entrega.

## Segurança e contrato

`GET /api/professional/dashboard` recebe exclusivamente cookie opaco. Retorna 200 com nome e arrays de indicadores/atividades vazios após autorização; 401 sessão inválida; 403 destino interno de regularização; 503 indisponibilidade; 429 limite persistente de 30 consultas/minuto por usuário. Cache private/no-store, Vary Cookie e no-referrer. Parâmetros de identidade/entitlement ignorados. Sem IDs de provedor, senhas, tokens ou e-mail na resposta autorizada do dashboard.

Refresh canônico reutiliza subscriptionStatus. Nenhum acesso por query string/storage/variável de ambiente. Monitor passivo revalida ao abrir, a cada minuto e ao retomar a página; não renova sessão ociosa. Falha esconde conteúdo favorável. Cada futura operação protegida deverá também verificar assinatura e propriedade no servidor. Nenhuma alteração das regras financeiras, senhas, cookies ou implementação Stripe.

## Validação

| Verificação | Resultado |
| --- | --- |
| `npm test` com PostgreSQL 18 isolado | 89 testes passaram, 0 falhas; integra cadastro, login, recuperação, financeiro, apresentação e 9 novos casos de dashboard |
| `npm run test:dashboard:e2e` | Passou; identidade do teste de integração, primeiro acesso, ausência de métricas, links reais, sidebar/header, modal/Escape/foco, logout, indisponibilidade e recuperação |
| Axe WCAG 2/2.1/2.2 A/AA no dashboard | Sem violações detectadas em 1440/1280/768/320 e no menu móvel/tablet |
| Revisão responsiva | Sem overflow de página em quatro larguras, reflow 640px e texto 200%; ações do onboarding sem sobreposição |
| `npm run test:e2e` | Passou; fluxo real PostgreSQL/SMTP, cadastro/verificação, login/destino, shell, navegação, negação do dashboard por parâmetros forjados, sessões/logout/replay/expiração, recuperação e regressão dos estados financeiros |
| `npm run lint` | Passou |
| `npm run typecheck` | Passou |
| `npm run build -- --webpack` | Passou; rotas privadas dinâmicas, build de produção sem novas dependências |
| `git diff --check` | Passou |

Integração cobre sessão ausente/forjada/expirada/revogada/e-mail não confirmado; profissional sem assinatura; perfil não suportado; trial/pagamento confirmados; indisponibilidade do provedor; cancelamento/expiração; configuração ausente; parâmetros forjados; isolamento de usuários; ausência de credenciais/IDs no contrato; polling sem renovar inatividade; rate limiting persistente. Banco descartável terminado em `_test`, sem operações nos dados existentes.

O teste visual autorizado também verifica o painel financeiro no shell com texto a 200%. A regressão encontrada pelo E2E completo foi corrigida no grid/skeleton desse painel: mínimo de 26rem limitado a 100%, col-span-full no histórico, sem regras financeiras alteradas. Ver logs em `test-results/007/` e evidências abaixo.

## Evidências e revisão visual

Screenshots produzidos pelo browser com componentes reais em harness exclusivamente de teste:

- [Desktop 1440](../../test-results/dashboard/first-access-1440.png).
- [Notebook 1280](../../test-results/dashboard/first-access-1280.png).
- [Tablet 768](../../test-results/dashboard/first-access-768.png).
- [Tela estreita 320](../../test-results/dashboard/first-access-320.png).
- [Menu 320](../../test-results/dashboard/navigation-320.png).
- [Texto a 200%](../../test-results/dashboard/text-zoom-200.png).
- [Reflow equivalente a zoom 200%](../../test-results/dashboard/zoom-reflow-200.png).
- [Assinatura no shell, texto 200%](../../test-results/dashboard/subscription-shell-text-zoom-200.png).
- [Verificação indisponível](../../test-results/dashboard/access-unavailable.png).

Revisão visual direta de desktop, tela estreita, navegação e texto ampliado. A inspeção identificou sobreposição no onboarding a 200% de texto; corrigida com grid auto-fit em rem e ações flexíveis que quebram linha. Teste acrescentado para ausência de overflow interno e sobreposição. Identidade escura/verde e fontes institucionais preservadas, sem efeitos ou cards decorativos excessivos.

## Limitações e próximos módulos

Stripe continua sem credenciais configuradas e sem homologação externa. O acesso manual ao dashboard principal com assinatura real de teste depende dessa configuração; não foi simulado sucesso financeiro. Autorização é testada com PostgreSQL real e provedor controlado injetado explicitamente; a interface autorizada é testada em aplicativo Next temporário em `/tmp`, importando os componentes reais e fixture de dados produzida pelo teste de integração. Esse harness não é uma rota da aplicação e é removido ao terminar.

Axe e teclado não equivalem a certificação WCAG nem teste com leitor de tela humano. Zoom foi avaliado por reflow equivalente e ampliação de fonte, sem alegar teste nativo do controle de zoom de cada navegador. Evidências e logs são artefatos locais ignorados pelo Git.

Alunos, exercícios, treinos, acompanhamento e configurações permanecem indisponíveis. Não há indicadores nem eventos operacionais até existirem fontes reais vinculadas ao profissional. Próximos módulos devem preencher os contratos com dados reais e aplicar autorização/propriedade nas consultas. Sem deploy, recursos financeiros externos ou aplicativo mobile.

Encerramento: build final, ESLint, TypeScript e diff check aprovados após a correção de reflow; os dois E2E concluíram com sucesso. Servidores temporários encerrados, diretórios do harness removidos e PostgreSQL descartável parado/removido. Nenhum servidor da aplicação foi deixado rodando por esta entrega. Logs finais copiados para `test-results/007/`.
