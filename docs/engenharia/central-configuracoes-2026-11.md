# Central de Configurações — frontend, 06/11/2026

FormFisik independente fundada por Brandon Louis. Entrega de apresentação e navegação; sem presumir formalização societária. Perfil público persistente, avatar definitivo e preferências de notificações não foram implementados.

## Auditoria e reutilização

Consultados AGENTS, Design System, guias CSS da versão Next instalada e regras do shell. Auditados ProfessionalShell, Sidebar, Topbar, navigation, conta, assinatura, importação, sessão opaca e assinatura canônica. A página anterior era um painel simples de links. Utilizado o asset oficial public/images/nomelogo.png,2488×292, proporcional e nítido; não foi criada nova marca. Sua aparência difere do texto condensado da referência por preservar o arquivo oficial solicitado.

Reutilizados requireUser, subscriptionStatus(details=false), CrmDialog (modal nativo, foco e Escape), useUnsavedChanges, tokens e rotas existentes. Sem APIs, dependências, migrations ou modelos de dados novos. DTO mínimo de assinatura: state, paidAccess, nextBillingAt; sem identificadores de gateway ou segredos nas props.

## Interface e navegação

Configurações ocupa a largura do shell, breadcrumb Sistema/Configurações. Título e descrição da referência; Preferências334px à esquerda e conteúdo à direita com intervalo30px. Card superior de perfil; atalhos2×2; card inferior de privacidade. Claro/escuro, foco, hover, disabled, tablet/mobile e altura reduzida. Nome/e-mail vêm da sessão; sem foto usa iniciais reais. Badge Pro ativo somente quando state=active e paidAccess=true. Não inventar nome, rosto ou assinatura.

Sidebar: Importar dados sai apenas do atalho direto, não da aplicação. Indicadores permanece Sistema. Minha assinatura/Meus planos, Minha conta e Configurações ficam na parte inferior acima de identidade/logout, fora do scroll da navegação extensa. Marca oficial e logout continuam acessíveis. Conta, assinatura e importação mantêm rotas canônicas e funcionalidades anteriores.

Sete seções: Visão geral, Perfil público, Minha conta, Notificações, Minha assinatura, Importar dados, Privacidade e segurança. Meus dados fica dentro de Minha conta. Minha assinatura apresenta somente FormFisik Pro,R$139,90/mês, trial30 dias com cartão/cobrança ao final salvo cancelamento; gerenciamento continua na rota existente. Nenhum comando de cancelamento/upgrade/contratação ou exclusão foi adicionado.

## Avatar e dados locais

Seleção de JPEG/PNG/WebP estático até5MiB, assinatura/MIME verificados; rejeita animação identificável, mais de6000px por lado ou24MP. Limites reutilizam a política de fotografias, sem compartilhar armazenamento clínico. Canvas512×512 recorta1:1, apresenta círculo, permite zoom1–3 e reposicionamento horizontal/vertical por sliders acessíveis. Reencoda JPEG sem preservar EXIF. Aplicar recorte gera apenas objectURL local com aviso Prévia não salva. Nenhum upload, publicação ou salvamento. URLs anteriores são revogadas; bitmap liberado; nada pessoal em Web Storage.

Campos públicos iniciam vazios para não presumir publicação de dados privados. Rascunho permanece em memória ao trocar seções. Guard existente avisa antes de sair; cancelar limpa rascunho/prévia. Salvamento desativado. Notificações distinguem avisos internos, CRM e SMTP de conta de canais futuros; preferências não são salvas. Exclusão/encerramento/portabilidade/dispositivos são áreas futuras, sem sucesso simulado.

## Manifesto

Novos: src/modules/settings/area.tsx, avatar-crop.tsx, settings.module.css; tests/settings-e2e.ts; este relatório.
Alterados: src/app/(app)/configuracoes/page.tsx; src/components/layout/sidebar.tsx e topbar.tsx; src/modules/professional/shell.tsx,navigation.ts,workspace.module.css; tests/dashboard.test.ts; Design System, roadmap e CHANGELOG. Alterações anteriores de outros módulos preservadas.

## Evidências e limites

Regressão dashboard/navegação/sessão/assinatura no PostgreSQL descartável:9/9 passaram. Chrome e Axe nos temas claro/escuro em1672/1440/768/320px: passaram, incluindo recorte e ausência de POST. Prévia local, imagem inválida, rascunho entre seções, links canônicos, teclado, texto200% e altura reduzida passaram. Evidências em test-results/settings/browser-proof.json e screenshots adjacentes. ESLint e TypeScript passaram. Build real de produção webpack passou; scan de 217 arquivos públicos sem canários de HMAC/SMTP. Rotas locais /configuracoes,/conta,/assinatura/gerenciar e /importar responderam200 autenticadas; Configurações sem sessão retornou307 para login.

Sem backend de avatar, exclusão ou preferências; leitor de tela real e dispositivos físicos não homologados. Sem credenciais externas, deploy, commits ou migrations persistentes. GO local restrito à interface e integrações de navegação validadas; produção preserva NO-GO015 e demais gates anteriores.

## Evolução posterior no mesmo dia

O estado acima documenta a entrega histórica da interface. A evolução funcional substitui as limitações de persistência, foto, preferências, sessão, e-mail e protocolos: consultar [módulo vigente](../modulos/configuracoes.md) e [relatório funcional](configuracoes-funcionais-2026-11.md). Não interpretar as evidências antigas de ausência de POST como critérios do módulo atual.
