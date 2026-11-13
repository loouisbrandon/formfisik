# Design System — FormFisik

Estado: implementado para cadastro, autenticação, assinaturas, área profissional, gestão de alunos, exercícios e prescrições. Landing performance/lifestyle implementada localmente. Homologação Stripe externa permanece pendente; exportação Compacta/Premium implementada na 011.

## Princípios e identidade

E-mail de confirmação: template server-only em `src/server/verification-email.ts`, fundo #0A0A0A, superfícies escuras e CTA #A9E600/preto, logo e arte existente `cta-neon-green.png`. Layout de tabelas com largura fluida até 640px, estilos inline, texto alternativo nas imagens e versão texto simples. Ação e informações críticas permanecem em HTML selecionável quando imagens são bloqueadas; não usar imagem única para todo o e-mail, scripts, fontes remotas ou controles falsos de copiar. Preservar link com fragmento, validade de 30 minutos e ausência de ativação comercial. Compatibilidade visual final depende do cliente de e-mail; homologar Gmail/Outlook antes de declarar equivalência visual.

Clareza, disciplina, energia, legibilidade e acessibilidade. A FormFisik é uma empresa independente. Preservar preto, verde da marca nas ações, tipografia esportiva e superfícies discretas, sem sacrificar a compreensão dos estados.

## Cores e tokens

Fonte executável: `src/app/globals.css`. Não duplicar tokens arbitrariamente por componente.

| Uso | Valor atual |
| --- | --- |
| Ações / primary | `#96D100` global; `#A9E600` no shell profissional, texto preto |
| Marca oficial | Branco e verde-lima dos assets originais |
| Fundo escuro | `#0A0A0A` |
| Texto claro | `#F4F4F4` |
| Roxo institucional | `#1B1035` |
| Texto secundário escuro | `#A8B0BC` |
| Superfície secundária | `#141821` |
| Borda dos painéis de autenticação | `#232A36` |
| Borda de input na autenticação | `#788395` |

`.auth-surface` define a apresentação escura de cadastro, confirmação, login e conta independentemente do tema da landing. `.premium-surface` define gradiente e sombra. Mensagens de erro usam `text-red-300`; nunca depender apenas de cor para comunicar erro.

## Tipografia

Bebas Neue: títulos com `text-heading`. Rajdhani: ações e interface com `text-ui`. Montserrat: corpo. Fontes fornecidas por `next/font/google` no layout. Texto longo usa entrelinha confortável; formulários mantêm fonte de entrada de 16 px. Títulos devem usar elementos h1/h2, não apenas aparência de título.

## Espaçamento, grid e breakpoints

Base de 4 px com intervalos recorrentes de 8, 12, 16, 24, 32 e 40 px. Cadastro usa `max-w-5xl`, duas colunas em `lg` e uma coluna abaixo disso. Padding externo de 16 px no mobile e 24 px a partir de `sm`. Cards usam padding de 24/32 px. Breakpoints padrão Tailwind: sm 640, md 768, lg 1024, xl 1280, 2xl 1536 px. Usar altura mínima de viewport, permitindo rolagem; proibir recorte vertical do formulário.

## Componentes e exemplos

- `Button`: primitivo Base UI; ação principal do cadastro com altura de 48 px, verde/preto e texto explícito. `disabled` durante envio, indicador de loading e texto “Enviando cadastro…”. Hover de ação principal `primary/90`; foco visível pelo anel do componente.
- `Input`: primitivo Base UI; cadastro com altura de 48 px, label persistente, autocomplete e descrição associados por ID. Password permite gerenciadores de senha e colagem.
- `RegistrationForm`: validação compartilhada com o backend, erros por campo, foco no primeiro campo inválido, remoção do erro do campo ao editar, feedback global e substituição do formulário por confirmação de envio.
- `VerifyEmail`: confirmação explícita por botão; scanners de e-mail não devem consumir um token por simples GET.
- Navegação: usar links para mudança de rota e botões para ações. CTAs da landing apontam para `/cadastro`.

Exemplo de campo: `label htmlFor="email"`, `Input id="email" autoComplete="email" aria-describedby="email-hint email-error"` e erro em `email-error`. Estado inválido usa `aria-invalid`.

## Feedback e estados

Formulário: pronto → validando → enviando → confirmação genérica ou erro recuperável. Durante envio, entradas e submissão ficam desativadas. Sucesso de envio não significa e-mail entregue nem conta confirmada. Erros de infraestrutura não aparecem como sucesso. Confirmação do endereço informa que nenhuma assinatura ou trial foi ativado.

## Ícones, bordas e sombras

Lucide; ícones decorativos com `aria-hidden`. Loading respeita `prefers-reduced-motion`. Formulários usam cantos rounded-lg/rounded-xl, painéis rounded-2xl e superfícies premium já existentes. Não adicionar brilhos, sombras ou novos raios sem decisão registrada.

## Responsividade e acessibilidade

Labels visíveis, ordem natural de tabulação, foco visível, feedback `role=alert`/`role=status`, conteúdo sem overflow horizontal a 375 px e botão acessível por rolagem. Etapas inativas não permanecem focáveis. Confirmação não depende de animação. Meta: WCAG 2.2 AA; a implementação não equivale a uma certificação de conformidade global. Validar leitor de tela, teclado, contraste e zoom em alterações futuras.

## Padrões proibidos ou descontinuados

Cadastro e identidade por localStorage/sessionStorage; senha em texto puro; placeholder como único rótulo; link de recuperação sem implementação; simulação de login; overflow-hidden em formulário de altura fixa; introdução de estilos fora dos tokens sem atualizar esta fonte de verdade.

## Histórico

- Implementação 001: cadastro próprio em `/cadastro`; superfície escura consistente; quatro campos essenciais, sem coleta antecipada de endereço ou dados de saúde; confirmação acessível por ação explícita; login simulado retirado.

## Login e área autenticada — Implementação 002

Login reutiliza o grid e superfícies do cadastro. Nome da ação explícito, labels E-mail/Senha, fonte de entrada de 16 px e autocomplete. Alternância de senha é botão de ícone com nome Mostrar/Ocultar senha, aria-pressed e altura de 40 px dentro do campo de 48 px; não altera ou envia o formulário. Colagem e gerenciadores de senha permanecem permitidos. O erro de credenciais é genérico e inclui orientação para confirmar o e-mail.

Loading: “Entrando…” com ícone decorativo; entradas e submit ficam desativados durante o pedido. Erro global recebe foco e role alert. Campos inválidos possuem descrição/aria-invalid. Botões de ação e links têm foco visível; formulário aceita Enter e Tab. Recuperação usa link funcional para `/esqueci-senha` desde a Entrega 003.

Conta provisória usa a mesma superfície escura, título semântico, identidade com quebra para nome/e-mail longos e ação Sair da conta. Logout informa falha e permite repetir; não exibe sucesso antecipado. Sessão inválida leva ao login com mensagem neutra. Verificação temporariamente indisponível é status textual, sem afirmar logout ou acesso pago. Não mostrar métricas inventadas, cards de assinatura ativa ou ações comerciais ainda inexistentes.

Histórico: Implementação 002 substitui aviso de login indisponível por autenticação real; adiciona visibilidade de senha, feedback de sessão/logout, acesso provisório e links funcionais entre cadastro, confirmação e login.

Ações principais em componentes `Button` usam `font-ui` (token Tailwind de família) em vez do alias `text-ui`, que pode ser interpretado como cor pelo tailwind-merge e remover `text-primary-foreground`. Texto sobre verde permanece preto #0A0A0A. Borda dos inputs de autenticação elevada para #788395 para distinguir controles do fundo escuro, sem mudar a cor dos painéis. Decisão introduzida após verificação de contraste da Entrega 002.

Cabeçalho público: navegação extensa em xl; menu compacto abaixo de xl; alternância de tema a partir de sm. Links Entrar e Criar conta permanecem visíveis em telas estreitas. Logo mobile tem 112 px para acomodar controles sem transbordamento.

## Recuperação — Implementação 003

`RecoveryShell` é a composição reutilizável para solicitação e redefinição: logo, h1, painel premium, uma coluna max-w-lg, padding de 24/32 px e link de volta ao login com alvo mínimo de 44 px. Reutiliza tokens existentes; não introduz paleta ou fontes.

Estados de solicitação: pronto, validando, enviando, confirmação genérica ou erro recuperável. Estados de redefinição: verificando link, pronto, indisponibilidade temporária com retry, link inválido com nova solicitação, alterando e sucesso com link para login. Erro de infraestrutura não é apresentado como token inválido. Sucesso de pedido não afirma que endereço exista ou que a caixa postal recebeu o e-mail.

Labels: E-mail; Nova senha; Confirme a nova senha. Inputs 48 px, autocomplete email/new-password, política textual de 8–128 caracteres, com maiúscula, minúscula e caractere especial. Erros vinculados com aria-describedby/aria-invalid. Botão de mostrar/ocultar senhas possui nome e aria-pressed; ação principal usa font-ui para preservar texto preto sobre verde. Loading com texto e ícone decorativo respeita movimento reduzido. Feedback anunciado e foco no primeiro erro ou confirmação; rolagem natural em telas baixas.

Padrões proibidos: token em query, Web Storage, analytics ou campos ocultos; sucesso fictício de envio; autenticação automática após reset; confundir pedido de recuperação com alteração concluída; link de recuperação sem funcionalidade.

Histórico: Entrega 003 conclui solicitação e redefinição, reaproveita superfície escura, adiciona confirmação de troca e tratamento explícito de link inválido/expirado/usado. Nenhuma alteração em identidade institucional ou produto comercial.

## FormFisik Pro — Implementação 004

Página `/assinatura` reutiliza auth-surface, premium-surface, tokens preto/verde, tipografia e espaçamento existentes. Container max-w-5xl; uma coluna até lg, duas a partir de lg; panel com padding 24/32 px. Header com Minha conta e logout permite quebra em telas estreitas. Uma única oferta, sem comparativo de planos ou selo de benefício inventado.

Hierarquia: h1 da apresentação, h2 FormFisik Pro, preço mensal destacado e 30 dias gratuitos em texto. Condições de cartão, cobrança automática e cancelamento aparecem antes da ação; não escondê-las em tooltip ou rodapé. Ícones Lucide decorativos. Benefícios descrevem somente o escopo definido de gestão de treinos e público profissional/alunos, identificando claramente os módulos ainda indisponíveis.

Ação “Iniciar teste de 30 dias” é um Button desativado desde a primeira renderização, associado à explicação visível por aria-describedby. Nenhum click é necessário para descobrir indisponibilidade. Loading anuncia “Verificando disponibilidade…” e animação respeita movimento reduzido. Falha de rede/servidor usa alert textual e botão de retry; retry apenas verifica disponibilidade, nunca simula checkout. Estado indisponível usa status e explica que não há cartão, trial ou cobrança iniciados. Erro ao carregar página tem fallback e tentativa novamente.

Proibido mostrar assinatura/trial ativo sem dados reais, colher cartão nesta fase, links de checkout fictícios, spinner de pagamento ou sucesso financeiro. Cada futuro componente comercial deve atualizar esta fonte de verdade.

## Checkout e retorno — Implementação 005

A ação do Pro evolui para disponibilidade real: inicia desativada enquanto verifica; habilita apenas com configuração de teste e elegibilidade do servidor. Ausência de configuração ou trial já utilizado mantém motivo textual visível. Ao iniciar, botão desativado e mensagem de abertura; erro em alert permite nova tentativa sem anunciar contratação. Checkout coleta cartão exclusivamente na superfície hospedada da Stripe, em teste.

Retorno `/assinatura/retorno` reutiliza superfície escura, painel, tipografia e verde existentes, uma coluna e links com alvos de 44 px. Consulta usa aria-busy e status textual; erro usa alert; botão Atualizar confirmação fica desativado durante requisição. Mostrar trial confirmado/datas somente após resposta verificada do servidor; estado pendente, encerrado, bloqueado ou sem configuração nunca utiliza linguagem de sucesso. Links Voltar ao plano e Minha conta preservam navegação. Não há novo token visual ou coleta de cartão própria. Loading/erro não depende só de cor. Parâmetros de URL não alteram estado visual de confirmação.

O texto de indisponibilidade da 004 permanece histórico: com configuração local válida o botão agora inicia o Checkout de teste. Sem configuração mantém indisponibilidade explícita. Testes controlados de UI são documentados como tal e não comprovam cartões aceitos/recusados na Stripe.

## Gestão de assinatura — Implementação 006

Painel `/assinatura/gerenciar` reutiliza auth-surface/premium-surface, preto/verde, fontes e alvos de 44/48 px. Container max-w-5xl, cards com padding 24/32 px e definição de informações em uma coluna no mobile/duas em sm. Preço e plano têm hierarquia própria; estado financeiro usa texto legível, sem depender só de cor. Direito de acesso e sua data são apresentados separadamente do rótulo financeiro. Valores não confirmados usam “A confirmar na Stripe”, nunca zero inventado.

Estado vazio orienta oferta; checkout pendente não aparenta pagamento; ausência de configuração explica indisponibilidade e oculta ações sem capacidade efetiva. Atualizar possui aria-busy/status, erro global em alert e retry. Em falha de ação ou refresh, remover detalhes favoráveis antigos até nova confirmação. Histórico local em lista responsiva de faturas, sem tabela extensa ou dados de cartão.

Cancelamento usa dialog nativo com título/descrição associados, data e consequências antes da confirmação. Foco inicial em “Manter assinatura”, Escape fecha sem POST, confirmação explícita “Confirmar cancelamento”. Após ação, fecha e anuncia confirmação somente com resposta canônica; ações indisponíveis não aparecem. Não usar aparência destrutiva para induzir decisão, preselecionar confirmação ou alegar reembolso automático.

Portal usa navegação completa para URL Stripe validada; retorno volta ao painel e exige refresh canônico, sem mensagem de sucesso por query string. Todas as ações financeiras usam API autenticada; testes visuais com fixtures são identificados exclusivamente como testes e não alteram autorização real. Evidências da 006 ficam no relatório, sem substituir validação hospedada Stripe.

## Refinamento do módulo de assinaturas — Implementação 006.5

Esta seção atualiza os padrões de apresentação da 006; regras financeiras e de autorização permanecem na fonte de verdade do módulo. FormFisik é empresa independente; não há mudança de identidade ou nova biblioteca visual.

### Hierarquia e composição

`/assinatura/gerenciar`: header de conta compacto, link para pular navegação, identificação discreta do ambiente de testes, h1 “Minha assinatura” e descrição breve. Container max-w-6xl. Grid em uma coluna até lg; em lg, coluna principal para Meu plano/Meu período e lateral para Gerenciamento; Histórico ocupa a largura total. A ordem DOM mantém plano → período → ações → histórico para teclado e telas estreitas. Cards usam min-w-0 e colunas minmax(0,…) para permitir reflow.

Reutiliza auth-surface, premium-surface, Button/Base UI, Link, Lucide e tokens existentes. Cores/fontes/sombras globais não mudaram. Borda superior do plano usa primary com opacidade, sem nova cor de marca. Cards rounded-2xl com padding 20/28 px, escala existente de 4 px. Rajdhani em labels/valores/ações; Bebas Neue em títulos; Montserrat em corpo. Texto auxiliar mínimo de 12 px, corpo de 14 px com entrelinha confortável; preço e datas usam números tabulares. Texto preto sobre botão verde usa font-ui, sem o alias text-ui que conflita com tailwind-merge.

### Componentes reutilizáveis do módulo

| Componente / fonte | Contrato de apresentação |
| --- | --- |
| BillingCard (`billing-components.tsx`) | title/id semânticos, children e className; painel consistente com h2 e aria-labelledby |
| SubscriptionBadge | recebe SubscriptionView; rótulo do estado acompanhado de ícone/texto. Verde só com paidAccess confirmado para active/trialing; erros em vermelho existente; neutro para pendência/cancelamento. Não autoriza acesso. |
| AccessStatus | comunica separadamente acesso liberado/limite, inativo ou não confirmado, exclusivamente a partir da resposta do servidor |
| InvoiceHistory | lista responsiva de faturas reais recebidas; data, mensalidade, situação, valor devido/pago. Estado vazio “Nenhuma fatura disponível”. Valores ausentes não viram zero. |
| SubscriptionPeriod (`subscription-period.tsx`) | datas e dias restantes do teste; próxima cobrança/valor disponível/renovação no período pago; não recalcula entitlement |
| presentation.ts | formatação pt-BR e microcopy por estado; dias restantes arredondam fração para cima e param em zero. Usa horário do recebimento para exibir, nunca para autorizar. |

Não são componentes genéricos de dashboard profissional. Permanecem no módulo de assinatura para evitar abstração e reuso fora do contexto financeiro.

### Apresentação dos estados

- Sem assinatura: explicação curta e link real para conhecer a oferta. Sem grade de datas vazias.
- Checkout pendente: orientar continuar contratação pela oferta, sem aparentar acesso ativo.
- Teste ativo: término, dias restantes, aviso de cobrança automática e acesso apresentado separadamente.
- Ativa: próxima data, estimativa disponível e situação da renovação. Não há valor previsto fictício; ausência é “Valor ainda não disponível”.
- Cancelamento agendado: data final, ausência de renovação e acesso somente se permitido pela resposta do servidor. Ação de cancelar deixa de aparecer conforme capabilities.
- Pendente/recusada: mensagem curta com próximo passo; Regularizar recebe prioridade quando disponibilizado. Autenticação adicional não é confundida com cartão definitivamente recusado.
- Cancelada/expirada/pausada: deixar claro que acesso não está ativo e manter somente ações fornecidas pelo servidor. Teste expirado e período pago encerrado têm textos distintos.
- Indisponível: motivo compreensível e retry; sem instruções de credenciais, webhooks, SQL ou outros detalhes operacionais. Sem ações financeiras aparentando funcionar. Meu período é omitido quando não há estado consultável.

Gerenciamento prioriza Regularizar ou Gerenciar pagamento; Atualizar cartão/Consultar faturas são secundárias; Cancelar renovação fica separado. Todas chamam os mesmos contratos backend da 006. Somente capabilities retornadas autorizam exibir ações. Navegação para conhecer oferta não inicia contratação. Histórico local não promete ser o histórico completo do provedor.

### Interação, linguagem e acessibilidade

Ações e links com alvos de pelo menos 44/48 px, foco visível e texto com quebra em telas estreitas. Status de carregamento fora da região aria-busy, skeletons decorativos com movimento reduzido. Erro em alert com foco; confirmação recebe foco após ação para evitar perda quando botão desaparece. Atualização/erro elimina apresentação positiva anterior até nova resposta.

Diálogo nativo conserva Escape, foco inicial em Manter assinatura, data/hora e consequências antes de Confirmar cancelamento. Não renova/cancela por abertura de diálogo. Limita altura à viewport e permite rolagem interna em telas baixas/zoom. Confirmação continua usando a data esperada já exigida pela API, sem mudar política.

Microcopy deve explicar situação e próximo passo. Detalhes de snapshot, servidor, reconciliação canônica, SQL, credenciais e webhook ficam na documentação técnica; a indisponibilidade não é escondida. Identificação do ambiente de teste e orientação de usar cartão de teste permanecem por serem necessárias à decisão do usuário. Oferta e retorno foram alinhados à mesma linguagem, sem ocultar preço, cartão, cobrança automática ou cancelamento.

Meta WCAG 2.2 AA: revisão de títulos, contraste, árvore de acessibilidade, teclado, diálogo, reflow e aumento de texto. Resultados/limitações e evidências da execução ficam no relatório 006.5, não equivalem a certificação ou teste com leitor de tela real.

## Área profissional — entrega 007

Shell compartilhado em conta/assinaturas/dashboard. Sidebar 15rem fixa na coluna desktop ≥1024px, conteúdo minmax(0,1fr), header com título, nome real e logout. Mobile/tablet usa dialog nativo de navegação com fundo escuro, Escape, foco contido e devolvido ao acionador. Menu único: item atual verde com texto preto, demais neutros com foco/hover; futuro em lista informativa sem links. Skip link leva ao único main focável. Header quebra linhas quando necessário; sem pesquisa/notificações fictícias.

Dashboard adota linguagem diária: saudação Bebas 36/60px, label Rajdhani verde, corpo Montserrat 14/16px e entrelinha 28px. Separadores estruturam saudação, onboarding e atividades; somente onboarding tem superfície discreta, sem sequência de cards decorativos. Grid auto-fit com mínimo de 24rem limitado a 100%, permitindo uma coluna ao ampliar texto; padding 16/32px, raios 12/16px, alvos 44/48px, tokens institucionais preservados. Nome com quebra, ícones decorativos aria-hidden, sem animações novas.

OperationalIndicatorCard só aparece com dados reais fornecidos; ausência não mostra zero. Atividades vazias explicam a fonte ainda indisponível. Loading anunciado, erro recuperável e verificação indisponível retiram conteúdo favorável. Elementos futuros têm texto explícito de indisponibilidade. Nenhum botão inerte ou link para página inexistente. Evidências desktop, notebook, tablet, 320px, reflow equivalente a zoom e aumento de texto ficam no relatório 007.

Adaptação do painel de assinaturas ao shell (007): grid/skeleton passam a auto-fit com mínimo de 26rem limitado a 100%, histórico com col-span-full. Considera a largura útil após sidebar e o texto ampliado, em lugar do breakpoint baseado somente na janela. Skeletons limitam barras à largura disponível. Esta atualização substitui a ativação de duas colunas em lg descrita na 006.5 e não altera regras financeiras.

## Gestão de alunos — entrega 008

Alunos é navegação ativa, inclusive novo/perfil/edição. Dashboard mostra contagens reais por proprietário e onboarding contextual com links de cadastro/lista. Tipografia, preto/verde, Button/Input, shell e monitor existentes preservados.

Carteira: cabeçalho simples, ações claras, filtros em grid auto-fit mínimo 12rem (limitado a 100%), lista sem tabela horizontal, nome/link com quebra e situação textual. Total/página anunciados, paginação anterior/próxima com alvo 44px. Estados vazio, carregando, erro/recarregar e exportação reais. Exportar filtros usa somente filtros aplicados; não implica exportar a página atual.

Cadastro/edição: painel de largura máxima 3xl, padding 20/28px, inputs 48px e 16px de fonte, labels persistentes, opcionais explícitos, erros por campo/aria-invalid/describedby, foco no primeiro erro, status/alert, bloqueio de reenvio. Textarea 1.000 caracteres com restrição de finalidade administrativa visível. Possível duplicata tem confirmação explícita de outro aluno, sem bloquear homônimos definitivamente. Sem campos de saúde/CPF/endereço.

Perfil: definição de dados com minmax mínimo 18rem, palavra longa com quebra, texto ausente explícito, observações com quebras preservadas e histórico administrativo mínimo (tipo/data/versão, últimas 20). Arquivar exige dialog nativo com título/descrição, foco inicial em Manter ativo, Escape e texto distinguindo arquivo de exclusão. Reativar não remove histórico. Feedback vem somente da resposta real.

PDFs possuem especificação de impressão própria: A4 branco, margens laterais 48pt, conteúdo entre cabeçalho 104pt e margem inferior 66pt; faixa verde #96D100 com palavra FormFisik preta. DejaVu Sans local incorporada e licenciada para cobertura de acentos portugueses, corpo 10/11pt, título 20pt, rodapé 8pt numerado e cabeçalho repetido. Quebra automática sem altura fixa de recorte, entradas da carteira mantidas juntas, sem screenshot, assinatura digital ou selo jurídico. Carteira omite contatos/nascimento/notas. Texto continua selecionável. Revisão inclui renderização, acentos, ausentes, notas extensas e múltiplas páginas.

Confirmações de cadastro/edição usam ProfessionalNotice no shell, mantendo a mensagem anunciada após navegar ao perfil. Mensagens genéricas sem dados pessoais, role=status e botão Fechar confirmação com alvo de 44px; não dependem de localStorage, query string ou timer de desaparecimento. O módulo também preserva feedback local para downloads/transições e alvos mínimos de 44/48px em ações.

## Biblioteca de exercícios — 009

Página `/exercicios` mantém shell escuro, verde `primary`, título Bebas Neue e texto Montserrat. Navegação Exercícios ativa, sem habilitar Treinos. Cards identificam Oficial/Particular e Arquivado por texto; nome é ação de detalhes, metadados secundários e instruções em lista sem mídia externa. Flags e origem não insinuam homologação técnica.

Filtros usam labels explícitos, controles nativos e grid auto-fit com `min(100%,13rem)`; ações têm altura mínima de 48 px e outline visível. Formulário agrupa músculos em fieldsets/legends com checkboxes de 20 px e alvos de 44 px; conteúdo opcional explicitado e validação compartilhada. Erro do formulário é alert focável e recebe foco; confirmação reutiliza aviso profissional persistente. Estados: carregando, vazio com ações permanentes de criar/solicitar, erro com retry e conflito que pede recarregamento.

Seletor nativo dialog modal: foco inicial em Fechar, Escape/cancelamento, contenção e restauração de foco; corpo com scroll e largura adaptada. Contador anunciado, chips textuais removíveis, checkboxes por resultado e confirmação após validação no servidor. Nenhuma seleção desaparece ao trocar filtro/página. Até 50 itens; estados busy/erro claros. Cards e nomes longos quebram linha; não introduzir tabelas com rolagem horizontal.

Solicitações mostram estado em texto, justificativa e reenvio de rejeitadas. Moderação usa justificativa obrigatória, candidatos oficiais e formulário revisado antes de publicação. Autoaprovação fica explicitamente indisponível. Contraste, reflow, 320/768/1440 e fonte 200% são verificados no runner 009; detalhes/resultados finais no relatório da entrega.

## Prescrição e modelos — 010

Treinos passa a ser navegação ativa. Acompanhamento/Configurações permanecem indisponíveis. Preservados fundo escuro, verde institucional, fontes, shell e foco. Não introduzir ícones de execução ou PDF sem funcionalidade.

Lista em cards com nome, estado textual, tipo, versão, aluno e contagens reais. Filtros em grid auto-fit limitado a 100%; inputs de 16 px e alvos mínimos 48 px. Vazio informa o próximo passo. Perfis de alunos reutilizam a lista em seção h2, sem duplicar h1 ou tabelas horizontais. Dashboard mantém indicadores reais, incluindo fichas ativas/modelos não arquivados.

Editor central: escolha individual/modelo, metadados recolhíveis, uma divisão selecionada por vez e ocorrências expansíveis. Barra de salvamento destaca alterações não salvas, loading e publicação de nova versão ativa. Parâmetros são editados inline em fieldsets de séries/etapas, com labels persistentes e grid que vira uma coluna em telas estreitas/zoom. Não preencher valores técnicos como recomendação. Erro geral focável/alert; confirmação reutiliza ProfessionalNotice.

O seletor múltiplo da 009 é reutilizado sem uma segunda biblioteca. Modal fica fora do form para impedir submissões implícitas por seus botões. Reordenação usa botões com nome explícito e estados disabled nos extremos; não exige drag-and-drop. Movimentos/remoções com dependências e saída com alterações usam confirmação nativa do navegador, sem exclusão silenciosa. Divisões, ocorrências, séries e grupos mantêm identidades estáveis.

Técnicas avançadas ficam em área progressiva: campos de fases e grupos estruturados, com quantidade/nomes visíveis, sem complicar uma ficha convencional. Drop-set/rest-pause distinguem série e etapa. Grupos exibem sequência de membros e orientação do profissional; nenhuma execução automática é prometida.

Aplicação de modelo tem seleção paginada de alunos e uma prévia obrigatória com nomes, versão, divisões/exercícios e criação em rascunho. Confirmação só aparece após resultado real, com links por aluno. Histórico tem versão/estado/data, banner de consulta histórica e ações de mutação somente na versão corrente. Rascunho e arquivado são rótulos explícitos, sem depender de cor.

Indicadores do dashboard na 010 usam grid auto-fit com mínimo de 14rem limitado a 100%, em lugar de colunas fixas por breakpoint. Isso considera sidebar e texto a 200%; cards admitem quebra de palavras sem overflow.

Ações textuais compartilhadas de Exercícios/Treinos usam hover de borda verde, preservando a combinação entre fundo e texto. Não herdar fundo muted em botão verde com texto preto: a transição deve manter contraste. O teste 010 inclui hover explícito em Salvar antes do axe.

## Exportação de fichas — 011

Ação Exportar PDF apenas em fichas individuais, incluindo histórico e seção de treinos do aluno. Página própria preserva editor/salvamento explícito. Configuração por fieldsets, radios Compacta/Premium com descrição útil, seleção de divisões e checkboxes com labels persistentes/alvos de 48px. Marca sem cadastro fica desabilitada e explica o motivo. Versão com estado/data e contexto histórico visível; rascunho nunca aparenta prescrição pronta.

Personalização progressiva em details, com nome/marca/registro/contato opcionais e upload validado; separação explícita da identidade autenticada. Inputs 16px, limites, erros/estado e conflitos. Sem ícone ou controle de upload fictício. Reutiliza action/control da biblioteca e shell profissional; sem alterar a paleta web.

Prévia usa PDF.js local do PDF real, com canvas ajustado à largura, anterior/próxima, texto auxiliar, loading/erro/retry e alternativa em nova aba; download recupera o mesmo arquivo autenticado. Sucesso foca h2 da prévia; erro geral recebe foco e role alert. Loading bloqueia configuração e duplicação de submissão; alteração das opções remove prévia antiga. Expiração/erro exige nova geração, sem sucesso simulado. Grid auto-fit limitado a 100%, quebra de textos e reflow a 320px/texto 200%.

PDFs: DejaVu Sans regular e negrito licenciadas em assets/fonts, sem rede; branco, #161A18, #536059, #96D100 e superfícies #F1F4EF. Verde é acento, nunca informação única. Compacta: tabelas 9pt, títulos 14/11pt e cabeçalho contido. Premium: aluno 27pt, plano 17pt, divisões 18pt, exercício/prescrição 13pt, parâmetros 10pt em blocos de séries. A4, margens 42pt, rodapé 8pt, status textual repetido, sem capa decorativa. Tabelas repetem cabeçalhos, blocos pequenos são reservados e notas extensas podem continuar. “Produzido com FormFisik” obrigatório. [Especificação e limites](../modulos/exportacao-treinos.md).

## Refinamento de PDFs — 011.5

A especificação 011.5 substitui apenas os valores/apresentação dos PDFs de treinos descritos acima. Web e PDF.js preservados. A4 branco, DejaVu Sans incorporada já licenciada; nenhuma nova fonte ou biblioteca.

Premium: cabeçalho editorial, aluno 30pt, planejamento 16pt, objetivo em superfície clara, identidade e metadados em hierarquia secundária. Logo/marca em composição horizontal sem distorção. Divisão em faixa #161A18 com título branco 18pt, número 20pt em bloco claro e barra #96D100 de 3pt; comunicação por número/título/contraste, inclusive cinza. Exercício com marcador preto 24pt e nome 12pt; metadados 8pt, passo no grupo identificado. Séries em linhas compartilhando cabeçalho, prescrição 13pt negrito e carga/descanso 10pt centralizados; sem card alto por série. Anotações 8,5pt com espaço em branco selecionado.

Compacta: aluno 19pt, plano 11pt, divisões 13pt com acento de 3pt, exercícios 10,5pt e tabela 9,5pt. Prescrição em negrito, cabeçalhos 8pt, notas 9pt, margens 42pt e linhas .4/.6pt. Sem preenchimento preto extenso.

Reservar blocos pequenos, permitir que os extensos continuem; repetir contexto correto e cabeçalho de parâmetros em quebras. Rodapé de 8pt, estado rascunho/histórico textual em toda página. Não preencher espaço com conteúdo fictício ou capa decorativa. Comparar entradas idênticas, renderizar e revisar início/meio/fim e casos em cinza. [Padrões completos](PADROES_PDF_TREINOS.md) e [evidências](../engenharia/entrega-011.5.md).

## Acompanhamento físico — entrega 012

Página individual com h1 do aluno, resumo editorial da última avaliação, histórico em linhas e gráficos separados por grandeza. Fundo/tokens/fontes existentes, divisórias discretas e verde nos pontos/destaques. Reutiliza ProfessionalShell, Sidebar/Topbar, StudentsPicker, notice e action/control. Acompanhamento é item ativo com ícone Activity; somente Configurações permanece futuro. Sem cards financeiros, novas sombras ou paleta paralela.

Formulário em fieldsets Dados, Tronco, Braços/antebraços, Coxas/panturrilhas e Observações. Campos com unidades visíveis, labels estáveis separados de mensagens, inputs 16px/alvo 48px, inputMode decimal e vírgula/ponto. Erro por campo associado por aria-describedby/aria-invalid; foco no primeiro inválido. Grupos usam auto-fit/minmax(min(100%,14rem),1fr). Sem valores prévios automáticos. Foco no feedback de falha, loading textual e bloqueio de duplo envio. Cancelar edição modificada confirma descarte. Arquivamento usa dialog nativo com foco inicial na opção de manter, Escape e confirmação explícita.

Gráficos SVG de pontos verdes: X por distância real entre datas, Y pela grandeza/unidade selecionada, escala informada e datas extremas. Sem interpolação, suavização, semáforo de resultado ou mistura kg/cm. Título/descrição do SVG, valores acessíveis na tabela HTML via summary nativo e títulos dos pontos. Ausência é textual; uma medição tem aviso de dados insuficientes. Períodos 30/90 dias, 6/12 meses ou completo. Acima de 500 pontos, aviso de histórico incompleto e carregamento adicional explícito. Não transmitir dados a serviços gráficos externos.

Comparação em linhas por medida e definições responsivas (valor referência, comparação, diferença e percentual). Números tabulares, sinais neutros, ausência “Não informado/Não calculável”, intervalo e unidades explícitos. Não atribuir bom/ruim a variações. Seletores manuais distinguem mesma data por UUID e versão. Histórico completo paginado; detalhes apresentam autoria e metadados administrativos sem expor cópias anteriores de saúde.

Revisão visual, teclado, reflow e Axe em 1440/768/320px documentados no relatório 012 com resultados efetivamente executados. Sem alegar certificação global ou teste manual de leitor de tela.

## Organização permanente de telas extensas — 013

Nenhuma funcionalidade deve produzir páginas excessivamente extensas quando seções, etapas, abas, painéis progressivos ou paginação resolverem sem prejudicar a experiência. Não fragmentar formulários curtos. Documentar tamanho de página e contagens; preservar filtros, ordenação, seleção e rascunhos ao navegar. Não buscar milhares de registros para esconder no cliente. Mudanças profundas em telas anteriores exigem diagnóstico/prioridade no roadmap, sem redesenho indiscriminado.

Acompanhamento usa três painéis: Avaliações, Evolução e Fotografias. Botões nativos com `aria-pressed`, grupo nomeado e painel hidden preservam estado; não são tabs ARIA incompletas. Resumo mais recente permanece compacto. Comparação de medidas progressiva em details; mostrar linhas que tenham ao menos um valor e oferecer expansão explícita das ausentes. Detalhes usam a mesma regra. Formulário de medidas tem regiões recolhíveis mantendo inputs; erro abre a região antes de focar o campo inválido. Rascunhos ficam somente na memória; alerta compartilhado antes de saída/descarte, inclusive quando um formulário está oculto.

Evolução alterna um indicador de cada vez (peso/medida) e visualização Gráficos/Calendário por select discreto no topo direito, chevron decorativo e label acessível. Aluno/período permanecem selecionados. Gráficos carregam somente quando ativos, 500 pontos por página com expansão explícita. Filtros não se perdem ao trocar de painel.

## Fotografias e calendário — 013

Mantidos tokens escuros, verde-lima #96D100, tipografia Montserrat/Bebas/Rajdhani, action/control e shell existentes. Verde marca presença; textos A/F/A+F e legenda distinguem avaliação, fotografia e ambos sem depender de cor. Calendário brasileiro com domingo primeiro, datas civis, navegação mensal/anual; 12 meses com contagens agregadas. Setas/Home/End entre dias, botões com data/contagem completa, `aria-pressed` e foco no título após seleção. Célula compacta admite largura menor que 44px a 320px, conservando mais de 24px e altura 56px; não há rolagem horizontal.

Histórico de fotos: 10 registros/página, datas/posição/estado, contagens e páginas vazias explícitas; autoria em detalhe e histórico de 20 operações. Escolhas da comparação: 12 metadados/página, seleção explícita se houver múltiplas imagens da posição/data. Dia do calendário: 10 de cada tipo por página. Contagens nunca exigem baixar bytes.

Formulário separa autorização e registro do envio real; source e observações têm labels independentes estáveis. Explicar finalidade, referência verificável, adulto/responsável e confirmação obrigatória. Upload real múltiplo sequencial, posição por arquivo, descrição para Outra, limites visíveis, feedback parcial sem confirmar imagens não recebidas. Indisponibilidade R2 desabilita novo registro e explica a causa; não é demonstração de upload. Erros focáveis, estados de loading e botões bloqueados durante envio.

Comparação em duas colunas inclusive a 320px, `min-w-0`, `object-contain`, data/posição identificadas, sem esticar imagens ou filtros corporais. Ampliação individual por dialog nativo, foco inicial em fechar, Escape e retorno ao acionador. Sem slider ornamental. Mensagem de falha de imagem usa padding reduzido nas colunas estreitas para manter palavras e ação legíveis a 320px. Imagem privada com retry, entregue somente pela API autenticada, sem otimizador público. Remoção por dialog com confirmação explícita/motivo real, opção inicial de manter e distinção entre bloqueio de acesso e exclusão física pendente.

Revisões e capturas da 013 devem informar resultados efetivos; Axe não equivale a certificação nem teste manual com leitor de tela. Nenhuma foto de pessoa real é necessária nas evidências: usar figuras sintéticas identificadas.

## Entrega 014 — shell e relatórios físicos

Desktop: `ProfessionalShell` ocupa `100dvh`, Grid com coluna de 15rem e conteúdo `minmax(0,1fr)`. A coluna direita é Flex, com cabeçalho `shrink-0` fora da área de scroll. O cabeçalho permanece estável pelo contêiner; não há sticky/fixed duplicado nas páginas. `main#app-content` tem `min-height:0`, `overflow-y:auto` e overscroll contido. O documento não rola em paralelo. A sidebar tem altura integral: marca e logout não encolhem, navegação intermediária rola quando necessário.

Abaixo de 1024px, o menu usa dialog modal nativo, com Escape, foco contido e retorno ao botão Abrir navegação. Qualquer dialog aberto bloqueia a rolagem do main sem apagar sua posição. VisualViewport ajusta altura em telas pequenas e mantém o campo focado visível quando o teclado altera a área útil. Validar também em dispositivos físicos: a automação desktop não reproduz todos os teclados virtuais.

Filtros, páginas, indicadores e seleções vivem na memória limitada do shell (40 entradas), sem localStorage/sessionStorage. Voltar de detalhe à lista ou usar histórico restaura o scroll pertinente, aguardando o conteúdo por até três segundos. Outra área abre no topo. Alteração explícita de filtro/página reposiciona a lista no topo; não altera o scroll externo durante seleção em dialog. Não armazenar bytes, credenciais ou snapshots documentais nessa memória. O aviso de alterações não salvas é reutilizado; painéis mantidos conservam rascunhos. Abas, modais, listas paginadas e formulários progressivos continuam obrigatórios.

Exportação física: formulário organizado em Período/apresentação, Conteúdo, Fotografias/autorização e Apresentação profissional. Checkbox independente por conteúdo; observações/fotos começam desmarcadas. Objetivo indisponível é informado, sem inferência. Seleção de medidas atende tabelas, gráficos e comparação. Datas e versões da comparação são explícitas. Loading bloqueia submissão dupla; erro recebe foco; sucesso foca prévia real. Opção alterada invalida prévia. Sem R2, fotos ficam indisponíveis e relatórios de medidas continuam funcionando.

PDFs A4 reutilizam DejaVu e apresentação sanitizada da 011. Compacto usa branco, linhas finas, textos escuros e pontos pretos, adequados à escala de cinza. Premium usa títulos maiores, seções escuras com detalhe verde institucional `#96d100` e pontos verdes; conteúdo e precisão idênticos. Sem gradientes/sombras. Margens laterais 42pt, cabeçalho recorrente, rodapé com contador, tabelas com cabeçalho repetido. Gráficos vetoriais usam datas civis e pontos reais sem interpolação. Fotos mantêm proporção, com fit, data/posição e legendas; no máximo duas por linha. Os modelos são apresentações do mesmo documento, sem plano comercial adicional.

Fotografias selecionadas podem ser revisadas e removidas em seção recolhível, inclusive quando estão fora do filtro/página atual; o contador e a autorização referem-se ao conjunto exato selecionado.

Contenção de conteúdo absoluto: shell, main e contêiner do visualizador PDF estabelecem referência de posicionamento (`relative`). Texto `sr-only` absoluto deve permanecer no contêiner local; não pode ampliar a área rolável do documento externo. Capturas do shell usam viewport, sem expandir artificialmente a página para incluir o scroll interno. Testar tentativa explícita de rolar a janela também depois de renderizar o PDF.

## Segurança e carregamento progressivo — 015

Preservar identidade visual, labels e navegação. Listagens usam resumos; instruções completas, propostas e avaliações são obtidas ao abrir o detalhe/edição, com loading/erro recuperável e nova autorização. Comparação de medidas recolhida não consulta antecipadamente. Verificação passiva não recalcula indicadores nem apresenta dados financeiros. Erro de verificação continua removendo conteúdo favorável; frontend nunca concede acesso. CSS inline de posicionamento permanece compatível com CSP restrita a scripts com nonce; não introduzir scripts externos para contornar a política.

Ao detectar logout ou mudança de conta em outra aba, o shell descarta conteúdo e memória privada e apresenta somente “Verificando sua conta…” em região de status até a navegação validada pelo servidor. Não manter nome, alunos ou fotografias da conta anterior durante essa transição.

## Cadastro inteligente e anamneses — 017

Preservar tokens, cores, Montserrat/Bebas/Rajdhani, ProfessionalShell e rolagem independente. Anamneses é navegação ativa; alunos mantém cadastro manual e passa a ter acesso a convites/resumo/histórico. Listas de20 por página, resumos sem respostas; detalhe e versões sob demanda. Links individuais somente na memória da criação, com copiar e orientação de compartilhamento manual. Nunca apresentar convite como conta criada ou verificação de identidade.

Construtor usa uma seção selecionada e perguntas em details; títulos/descrições/alternativas com labels estáveis, controles nativos, alvos48px e16px de fonte. Botões Subir/Descer/Duplicar/Excluir identificam posição; limites/desabilitação nas extremidades. Condições usam seleção anterior e opção explícita; estrutura inválida impede salvar/publicar. Prévia e versão publicada identificadas; rascunho/arquivo/número são textos, sem depender de cor. Saída modificada exige confirmação.

Público mobile-first max-w-2xl, padding16px, rolagem natural sem recorte. Apresentação/cadastro → seções individuais → revisão → envio → confirmação. Progress nativo com nome acessível e etapa textual. Anterior/Continuar/Enviar por botões, sem campos inativos focáveis. Informação de finalidade/profissional/privacidade e risco de perder progresso precedem dados. Rascunho só em memória, semWebStorage. Cabeçalhos recebem foco nas transições; erro éalert focável, sucesso éstatus e foco no título. Campos múltiplos usam checkboxes/grupo, opções únicas/SimNão usamselect nativo; datas/números têm limites e labels.

Resumo de respostas usa dl e seções recolhíveis, texto quebra semHTML executável, alternativas legíveis e ausências explícitas. Histórico paginado20, comparação manual por abertura dos registros; respostas originais não são editáveis. Resolução pendente exige instrução de verificação independente e confirmação, sem prometer que checkbox comprova identidade.

Validação017:320/375/768/1440, Axe, navegação de teclado, foco, texto200%, altura reduzida, erros de rede e links indisponíveis. Resultados efetivos e limites no [relatório017](../engenharia/entrega-017.md); não equivale a certificaçãoWCAG ou teste humano de leitor de tela.

017: durante gravação/envio, fieldset desabilita todos os controles; loading textual e prevenção de duplo envio permanecem ativos. Revisão abre a primeira seção e mantém demais seções recolhíveis com conteúdo/ausências acessíveis sob demanda.

## CRM018 — quadro e operação progressiva

Reutiliza cores, fontes, `action/control` de formulários, feedback e ProfessionalShell existentes. Não há biblioteca de drag, fonte ou dependência nova. Rota `/crm` e subárea do aluno compartilham o mesmo componente. Áreas Atendimentos/Tarefas/Etapas e regras/Histórico usam botões com `aria-pressed`; filtros, indicadores, condições, ordenação e ações secundárias são progressivos.

Colunas têm título, contagem, estado textual e borda sem significado exclusivo da cor. Paleta restrita lime/blue/violet/amber/rose/slate. Card exibe status, datas e pendências administrativas; sem respostas clínicas/medidas/fotos. Título e descrição livres quebram palavras sem aumentar documento externo. Cards têm nome acessível, ações nomeadas por aluno e links canônicos sob demanda. Arraste HTML transporta somente ID do vínculo e abre a mesma confirmação do menu por teclado.

Kanban é região horizontal focável contida no main; não produz scroll global. Coluna19rem, cardspaginados10; celular inicia etapa única com seletor de foco, sem espremer seis colunas. Lista20 é alternativa explícita. Páginas vazias preservam filtros/total e oferecem retorno. Mudança de modo não baixa cards ocultos. Leituras substituídas são abortadas.

Dialog nativo de movimentação: foco inicial “Manter etapa”, Escape, retorno ao acionador, título e nome do aluno, prévia de cada condição com texto atendida/não satisfeita, ciência explícita das recomendações e confirmação desabilitada se impedida. Revalidar após erro/conflito; sem movimentação por simples drop. A configuração oferece entradas separadas para regras e contexto, alertando ao descartar alterações. Versão carregada permanece vinculada ao editor sujo.

Editor de tarefas reutiliza seletor paginado de aluno e só carrega descrição no detalhe; informa finalidade operacional/responsável. Prazo opcional informa horário do dispositivo; status e prioridade textuais, conclusão/reabertura/arquivo explícitos. Histórico20/página tem resultados de condições em detalhe recolhível. Sem promessas de automação de atendimento.

Validação e evidências018: larguras1440/768/375/320, altura500, teclado, texto200%, Axe WCAG2A/AA/2.1/2.2 e build real com CSP. Resultados efetivos e limitações no [relatório018](../engenharia/entrega-018.md); não equivalem a homologação por leitor de tela/aparelho físico.

## Serviços e consultorias019

Navegação única Consultorias; catálogo/planos/contratações/entregas/histórico em botões aria-pressed, dentro do ProfessionalShell. Perfil e CRM oferecem links para a mesma subárea do aluno. Mantidos tokens, tipografia, action/control, labels16px/alvos48px, grid auto-fit limitado à largura e quebra de textos. Não criar novo Kanban ou aparência de pagamento.

Listas e seletores20 no servidor; detalhe e revisão histórica somente por ação explícita. Editor de plano organiza condições/disponibilidade em details e cada obrigação em seção recolhível, com quantidade, prazo, ordem e obrigatoriedade. Obrigações não se expandem em milhares de campos por unidade. Preço usa entrada decimal textual em BRL e conversão inteira; vigência inclusiva e valor total são informados antes de confirmar.

Criação/renovação requer checkbox de revisão administrativa e sempre começa em rascunho. Estados persistidos/derivados são textuais; não indicar pagamento ou assinatura jurídica. Ações de ativar/suspender/concluir/cancelar/reabrir usam confirmação nativa e justificativa quando cabível. Reabertura explica invalidação lógica e preservação do histórico. Evidência escolhida tem data/versão,1unidade e consulta mínima; fontes alteradas são sinalizadas sem apagar execução histórica.

Durante envio fieldset desabilitado, botão/loading textual e trava de duplicação. A navegação entre áreas do módulo fica desabilitada durante gravação; confirmação de execução/reabertura é anunciada e recebe foco estável. Falha preserva campos e chave da tentativa; edição de conteúdo muda intenção. Voltar/sair modificado exige confirmação. Detalhe/lista anterior é descartado ao trocar de contratação, evitando abrir acordo antigo durante recarga. Atualizar área aberta, feedback alert/status focável, retry e páginas vazias explícitos. Rascunhos permanecem só em memória.

Validação019:320/375/768/1440, altura500, texto200%, teclado/menu, Axe e navegação real em build HTTPS/CSP. Capturas/resultados no [relatório019](../engenharia/entrega-019.md). Não equivale a certificação WCAG ou homologação manual com leitor de tela/aparelho físico.

## Financeiro profissional020

Área /financeiro utiliza ProfessionalShell, tipografia/paleta/action/control e feedback focável existentes. Navegação local por Resumo, Cobranças, Preparar, Conta, Repasses, Histórico, Eventos e Operações pendentes; nunca documento global com scroll próprio. Indicadores em grade responsiva com texto explícito de origem: manual, conferido pelo profissional, confirmado pelo provedor, líquido conhecido e repasse observado. Desconhecido aparece como tal, sem zero fictício.

Formulários por contexto e detalhes progressivos, preços canônicos somente leitura, confirmação de valor/periodicidade, rótulos explícitos em seletores, texto sem alegação jurídica, campos limitados e orientação para não registrar dados bancários/sensíveis. Mesma intenção/chave é preservada em falha; loading desabilita ações e navegação local; feedback de sucesso/erro recebe foco; aviso de saída protege alterações/gravação. Listas e correções 20/página no servidor; filtros/seleção em memória privada. Zoom 200%, teclado/Escape e 320/375/768/1440 px fazem parte da validação.

Em Financeiro020, navegação local em telas abaixo de 768 px usa seletor nativo rotulado, com os mesmos estados/seções dos botões desktop. Isso mantém o conteúdo financeiro acessível sem uma sequência extensa de botões antes do formulário; seleção e confirmação de descarte são preservadas.

## Agenda profissional021

Reutiliza cores/tipografia/action/control/Feedback/Pagination e ProfessionalShell. Cabeçalho fora do scroll, conteúdo em #app-content, sem overflow global adicional. Semana padrão desktop; dia no mobile; mês resumido com seleção diária. Disponibilidade indicada por texto de faixas, bloqueios e compromissos por natureza/estado textual além da cor. Listas e histórico SQL20, prévia limitada100 paginada20. Formulários progressivos com detalhes: semana, recorrência, dados privados e comparecimento; campos rotulados, confirmação explícita, foco visível, estados anunciados e proteção de alterações. Sem arrastar obrigatório. Botões com min-height e quebra de texto; grades reduzem colunas em telas estreitas. Revisão em320/375/768/1440, altura reduzida e texto200%; evidências no relatório021. Calendários externos sem controle que sugira integração ativa.

## Demonstrações023 — biblioteca e player

PreservarProfessionalShell, tokens, tipografia e rolagem independente. Vídeos tem cards com fonte/escopo/estado textuais,20/página, título e duração confirmada. Sem miniaturas externas/player/preload em listas. Exercício/editor carrega associações só ao expandir; seleção explícita e botões principal/remover sem depender dearraste. Biblioteca e formulário progressivos, limites/direitos e estados deupload claros.

Prévia emdialog nativo com título, botãofechar focado,Escape e retorno ao acionador; player destruído ao fechar. Reprodução só apósCarregar vídeo, aviso de conexão externa, controles oficiais/legendas e fallback textual/abrirYouTube. Sem autoplay. Frame mantém área mínima200px/altura e proporção responsiva; player não amplia scrollglobal. Inputs16px/labels, alvos48px,loading/status/alert focável, formulário preservado emfalha. Sem números ou acervo fictícios; Streamausente é indisponibilidade real.

## Check-ins e feedbacks022

Reutilizar tokens/preto-verde, Bebas/Montserrat/Rajdhani, ProfessionalShell, alvos48px e controles16px. Navegação Solicitações/Modelos/Periodicidade/Indicadores/Histórico, seletor nativo no mobile. Perfil mostra resumo mínimo e caminho para conteúdo privado. Cards CRM só contagens, sem relatos, escalas ou desconfortos.

Construtor/renderizador017 compartilhados; rápido/completo/personalizado usam o mesmo motor. Atribuição organizada em contexto do aluno/modelo, período, prescrição opcional e prévia limitada; até24 ciclos, prévia paginada20. Formulários públicos por etapas com finalidade/privacidade antes da coleta, campos opcionais claros, revisão, ciência, estados loading/erro/sucesso e proteção de saída. Não mostrar histórico pelo link. Feedback de treino sempre rotulado como declarado; esforço/dificuldade com âncoras, não classificação clínica.

Revisão e devolutiva separadas de resposta; correções abrem novo preenchimento e preservam original. Texto de compartilhamento manual não sugere entrega técnica. Históricos/listas SQL20; séries100 por página, uma pergunta/versão por vez, tabela equivalente e pontos sem interpolar lacunas. Ausências e denominador zero aparecem explicitamente. Botões sem arraste obrigatório; foco/alert/status, largura320/375/768/1440, altura500 e texto200% são critérios de teste, com resultados efetivos no relatório022.

No022, ações de gravação bloqueiam a navegação interna até concluir; a confirmação só aparece após atualizar o detalhe. Rascunhos de devolutiva exigem confirmação antes de outra ação. Séries oferecem anterior/próximos100 e alternativas com rótulos da versão do formulário, nunca UUIDs como resposta visual.

## Central de comunicação024

Mesmo ProfessionalShell/#app-content, tokens preto/verde, tipografia e action/control/Feedback/Pagination; nenhuma rolagem global própria. Contatos/Modelos/Notificações/Pendências/Indicadores, seletor nativo no mobile e navegação contextual do aluno. Contatos em cards mínimos, histórico SQL20, detalhes e painel contextual sob demanda. Quebrar nomes/textos longos; legends sr-only têm fieldset relativo.

Modelos curtos com título/texto/variáveis permitidas, arquivo e versão; registro com tipo/canal/instante, seleção progressiva de modelo/contexto e prévia server-side antes da confirmação. Campos preservados em falha e perda de rascunho confirmada; gravação bloqueia navegação interna. Modelos/contextos fechados não carregam listas; seleção obsoleta é cancelada. Erro/sucesso focáveis, labels persistentes, estados vazios/indisponíveis e retry explícito.

Preparado, contato declarado e leitura profissional são estados textuais distintos; sem balões de chat ou checks que sugiram entrega/leitura do aluno. Copiar texto não envia. Sem botão de envio real ou canal ficticiamente ativo. Indicadores têm período e critério de30dias visíveis. Verificar teclado/foco/1440/768/375/320, texto200% e altura reduzida, com evidências no relatório024; Axe não equivale a certificação humana.

## Inteligência de negócio025

`/indicadores` reutiliza ProfessionalShell, action/control/Feedback, tokens e fontes. Visão executiva oferece resumo de três métricas por área e abertura explícita de cada domínio por seletor nativo rotulado. Não adicionar dezenas de gráficos simultâneos. Grade auto-fit com mínimo17rem limitado100%, descrição/escopo/período visíveis; definição em details por indicador. Zero denominador é Não calculável, posição atual não aparenta comparação histórica. Centavos separados por origem, nunca faturamento genérico.

De/Até com labels, 16px e ação48px; carregamento e retry textuais, erro focável e resultados antigos ocultos em falha. Gráfico simples de carteira com título/nome acessível e equivalente diário em seção progressiva, incluindo evolução financeira por fonte; sem cor de julgamento. Links contextuais e tabela sem rolagem externa. Filtros/área em memória privada, leituras canceláveis. Validar1440/768/375/320, altura500, teclado, texto200%, Axe e CSP do build real; resultados no relatório025.

## Importação026

`/importar` mantém ProfessionalShell/#app-content, paleta/tipografia, action/control, Feedback/Pagination e memória privada. Tipo/arquivo → mapeamento CSV ou JSON estruturado → prévia transformada → confirmação → progresso por lote → resultado/histórico. Sem drag obrigatório ou cadastro fictício por upload. Limites e finalidade administrativa visíveis antes do envio. Cabeçalhos opcionais sem destino são descartados, não escondidos depois de persistir.

Mapeamento em grid auto-fit mínimo16rem limitado100%, labels explícitos, amostra local progressiva até3 registros. Prévia20 por página no servidor, dados transformados em details e candidaturas mínimas autorizadas. Texto Válido/Inválido/Duplicado potencial/Possível conflito/Importado/Ignorado/Rejeitado/Referência eliminada acompanha qualquer cor. Duplicidades começam ignoradas; criar distinto é opção explícita por registro, com checkbox de revisão antes da importação.

Progresso por contagens reais, interromper após lote, retomar e cancelar com consequências claras. Finalização informa quantidades de importados/ignorados/rejeitados, sem afirmar que todo arquivo foi importado. Falhas preservam estado retomável, erro focável e retry; cancelamento preserva criados. Gravação bloqueia navegação interna; saída/arquivo/decisões pendentes usam aviso compartilhado. Históricos20, ordem estável, páginas vazias e leituras abortáveis. Relatório mínimo baixável não inclui nomes/contatos. Verificar1440/768/375/320, altura500, texto200%, teclado/Escape e Axe/build real; resultados no relatório026.

## Login — direção visual laranja (referência aprovada pelo fundador)

`/login` adota composição editorial em duas colunas, slogan esportivo à esquerda e card de autenticação à direita. Exceção visual restrita ao login: `--login-accent: #ff6b19`, texto `#f4f4f5`, secundário `#b9bbc1`, fundo `#080b0e`. Tokens locais em `src/modules/auth/login-visual.module.css`; demais módulos preservam a paleta vigente. Marca existente recebe tratamento cromático CSS, sem substituir o arquivo original. Fontes Montserrat/Rajdhani existentes; título itálico, letras maiúsculas e card com borda de luz e gradiente discreto.

A camada `.backdrop` está preparada para futura imagem fornecida pelo fundador; nesta etapa há apenas composição abstrata CSS, sem fotografia gerada ou reprodução da montanha/estátua. Elementos decorativos não recebem foco nem nomes acessíveis. Não publicar estatísticas de usuários, satisfação ou conteúdo sem evidência. Recursos citados correspondem aos módulos existentes.

Login reutiliza Input/Button, validação e endpoint existentes, labels persistentes, ícones decorativos, mostrar/ocultar senha, erros associados e foco, loading e sessão opaca. Não implementar “manter conectado” visual sem contrato de sessão: mostrar Sessão protegida. Google/Apple aparecem desabilitados e com indisponibilidade explícita, sem OAuth simulado. Abaixo de800px, coluna única e apresentação compacta, com card integral e rolagem vertical natural; nunca recortar formulário em altura reduzida. Foco laranja visível, controles de entrada16px e alvos de44–52px. Não modificar ProfessionalShell.

Validação local em04/11/2026: TypeScript e ESLint dos arquivos alterados aprovados; Chrome real em1440/768/320px sem overflow horizontal e Axe WCAG2A/AA/2.1AA sem violações detectadas. Texto ampliado200% em viewport1440×500 sem overflow horizontal. Validação vazia foca e-mail, mostrar senha funciona e login real redireciona ao dashboard. Capturas locais em `test-results/local/login-{1440,768,320}.png` (artefatos ignorados pelo Git). Não foi executado novo build de produção nesta alteração visual; o ambiente segue em desenvolvimento Webpack. OAuth, persistência estendida de sessão e imagem de fundo não fazem parte desta alteração.

### Fundo fotográfico e legibilidade — refinamento04/11/2026

Imagem fornecida pelo fundador aplicada sem modificação em `public/images/login-mountains.png`, pela camada decorativa local, sem requisições de imagens externas. Desktop usa cover central; mobile preserva o ponto focal em40% com cobertura escura progressiva. A camada de contraste sobre a fotografia protege a leitura do slogan, sem aplicar opacidade ao conteúdo. Os círculos/faixas CSS anteriores foram retirados da apresentação para não duplicar a composição da imagem.

Conjunto principal centralizado horizontal e verticalmente por flex/grid, com padding vertical simétrico no desktop. Alturas pequenas permitem rolagem natural e não cortam o card; rodapé decorativo separado quando há altura suficiente. Mobile permanece em coluna única. Login e guardas de sessão/assinatura não alterados.

Montserrat500 para corpo/inputs,600 para labels/links menores e700 para títulos/ações; Rajdhani restrita aos detalhes editoriais. Redução de textos em8–10px na interface, incremento de peso e contraste, mantendo entradas16px. Título Montserrat700 itálico preserva o caráter esportivo com traços mais robustos. Orientação consultada: W3C, Understanding1.4.3 (https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), sobre perda de contraste percebido com fontes muito finas e antialiasing. Os pesos são decisão visual local, não uma exigência normativa de um peso específico.

Evidências deste refinamento: `test-results/local/login-background-verification.json` e capturas `login-background-{largura}-{altura}.png`. Chrome/Axe em1440×900,1920×1080,768×900,320×740 e1440×500: imagem carregada, sem overflow horizontal, zero violações Axe nas tags WCAG2A/AA/2.1AA. Nas duas resoluções desktop com altura suficiente, centro do grid coincide com o centro da viewport nos dois eixos (desvio medido0px); mobile/altura reduzida usam rolagem segura. Texto200% sem overflow horizontal em1440px. TypeScript e ESLint dos módulos de login aprovados. Não executado novo build de produção; ambiente local continua Webpack.

### Enquadramento do fundo em telas baixas

No desktop, `.backdrop` é fixa e mede100svh: o cover considera a viewport, não a altura rolável do formulário. Isso evita zoom involuntário quando o conteúdo excede a janela. A imagem1672×941 aparece em escala1:1 na viewport correspondente;1920×1080 requer ampliação de~14,8%;1440×900 exige recorte horizontal pela diferença de proporção. Cover já é a menor escala que preenche a área sem faixas. Exportar mais pixels melhora a nitidez, não amplia o campo de visão; reduzir o tamanho aparente do busto mantendo preenchimento exige uma arte com mais cenário, sem simples upscale. Mobile mantém enquadramento próprio.

## Autenticação visual compartilhada e medidor de senha

Login, cadastro, confirmação de e-mail, solicitação de recuperação e redefinição reutilizam `AuthVisualShell`: mesma fotografia, identidade laranja, marca, tipografia, centralização e card. `RecoveryShell` compõe o shell comum; formulários/validações/endpoints são preservados. Cadastro explica confirmação obrigatória, privacidade e separação entre conta e assinatura, com condições comerciais em details. Não adiciona OAuth ou trial fictício. Layout extenso permite rolagem, sem cortar campos, ações ou estados.

Cadastro e redefinição incluem `PasswordStrength`: quatro segmentos laranja inclinados, trilha escura, preenchimento luminoso e rótulos Inicial/Em evolução/Forte/Muito forte. Estado vazio não recebe nível; conforme o texto cresce, o nível é recalculado localmente. Comprimento é o critério principal; sequências iniciais previsíveis e repetição reduzem a estimativa. O indicador não impõe mistura de caracteres nem altera o contrato de8–128 caracteres, com maiúscula, minúscula e caractere especial do servidor; não estima entropia criptográfica nem consulta bases externas. Senha não é enviada para serviços de avaliação nem persistida pelo medidor.

Sem animação pulsante/partículas; transições respeitam prefers-reduced-motion. Semântica `role=meter`, nome acessível, mínimo0/máximo4/valor atual e descrição textual; cores não são o único sinal. Não usar aria-live a cada tecla para evitar anúncios contínuos. Indicador aparece somente ao definir uma senha, nunca no login. Componentes: `password-strength.tsx`, `password-strength-score.ts`, `password-strength.module.css`. Testes unitários cobrem progressão, padrões previsíveis, repetição e frases sem exigência de complexidade.

Verificação local desta alteração: TypeScript e ESLint dos arquivos alterados aprovados;3/3 testes unitários do score aprovados. Chrome/Axe nas cinco rotas em1440/768/320px: sem overflow horizontal ou violações detectadas. Medidor0–4 verificado no DOM em todas essas larguras, com Axe sem violações. Jornada real com conta sintética separada: cadastro202, confirmação, solicitação SMTP local, formulário de redefinição com medidor, alteração e login com nova senha200. Estados de confirmação/sucesso também avaliados com Axe. No teste de jornada em Next dev, recargas HMR que descartam tokens em memória foram suspensas no transporte da automação; endpoints, autenticação e validações permaneceram reais. Evidências/scripts locais ignorados em `test-results/local/auth-{visual,flow,meter}-check*` e capturas `auth-*.png`. Nenhuma senha da conta principal foi alterada. Não executado novo build de produção; não houve deploy ou serviços externos.

## Dashboard e sidebar — modo noturno da referência de gestão

A área profissional usa canvas `#0e1115`, card `#151a20`, texto `#f0f2f5`, secundário `#a9b1bd`, borda `#2a313a` e ação verde `#a9e600`. Paleta clara reservada em `--workspace-light-*`: canvas `#f5f6f7`, card `#ffffff`, texto `#151719`, borda `#e2e4e7`, ação `#a9e600`. Light mode ainda não ativado; laranja permanece na autenticação pública.

Sidebar15rem com grupos Gestão/Operação/Sistema, ícones por domínio, seleção verde e perfil real por iniciais. Navegação rola independentemente; marca e logout permanecem acessíveis. Todos os módulos anteriores foram preservados; Configurações continua em breve. Mobile mantém dialog nativo, Escape e retorno de foco. Topbar contém breadcrumb e links reais para carteira, comunicação e conta; sem busca global, atalhos ou notificações fictícias.

Visão geral com quatro KPIs, gráfico/agenda e atenção/atividades em duas colunas; redução progressiva para uma coluna. Montserrat500–700, cards escuros e bordas discretas. Gráfico SVG local com tabela equivalente e escala inteira. ProfessionalShell/#app-content preservados, sem overflow global. Dados reais: alunos ativos, treinos ativos, ausência de avaliação recente, recebimentos confirmados pelo provedor. Gráfico de novos cadastros (não histórico inferido de ativos), agenda do dia limitada a3itens, atenção limitada a3alunos sem avaliação em30dias, atividades com3últimos cadastros. Sem adesão clínica, crescimento percentual ou receita inventados.

### Escala e legibilidade em monitores grandes — 05/11/2026

Dashboard utiliza largura disponível até2200px, sem impor o limite1600px das demais páginas. A partir de1800px: sidebar18rem, navegação17px/600, título40px/700, títulos de cards24px/700, indicadores44px/700 e descrições15–18px/500. Nas larguras menores, navegação15px/600 e títulos de cards21px/700; manutenção das quebras responsivas. SVG do gráfico volta à proporção natural da largura, eliminando a compressão causada pela altura fixa180px. Rolagem continua exclusiva de #app-content e da navegação lateral. Paleta noturna e tokens futuros claros preservados.

Validação local: TypeScript e ESLint do shell aprovados. Chrome/Axe verificados em2560/1920/1672/1440/768/320px e altura reduzida500px; capturas e resultados em test-results/local/dashboard-dark-verification.json. Não executado novo build de produção nesta alteração CSS.

### Indicadores e densidade do shell — 05/11/2026

Navegação compactada para38px por item (40px em monitores grandes), grupos com menor espaçamento e perfil fixo. Preservar overflow automático na navegação somente quando necessário; não ocultar módulos em janelas baixas. Dashboard reduz espaços e limita gráfico a290px no desktop; viewport2560×1280 validada sem rolagem principal.

Indicadores adota o mesmo canvas noturno, cards com bordas discretas, títulos Montserrat700, abas arredondadas com seleção verde e filtros de período reais. Visão geral: quatro KPIs canônicos, evolução da carteira, distribuição cadastral, etapas CRM e pendências. Detalhes de cálculo e tabelas ficam em seções progressivas. Não criar sparklines, percentuais de crescimento, funil clínico ou exportação fictícios para reproduzir a imagem. Demais abas mantêm todas as métricas do módulo. Paleta clara continua reservada.

### Carteira de alunos — 05/11/2026

`/alunos` adota cabeçalho Montserrat700, ações de convite/cadastro/exportação, três resumos e painel único com busca, situação, ordenação, alternância lista/cards e paginação. Mesma paleta noturna das telas Dashboard e Indicadores; referência clara não ativa light mode. Avatar por iniciais, status textual acompanhado de ponto, alvos44px e foco verde visível. Lista transforma-se em linhas empilhadas em larguras reduzidas; sem rolagem global. Cards representam somente a página carregada, sem leitura adicional. Dados de contato continuam restritos ao perfil; datas exibidas são cadastro/atualização cadastral, nunca atividade do aluno presumida. Busca permanece por nome. Não adicionar seleção em massa ou filtros sem ação real.

### Treinos — composição administrativa noturna, 05/11/2026

Listagem com três resumos reais, abas Todos/Fichas de alunos/Meus modelos, filtros existentes, lista ou cards e paginação de20 no servidor. Linhas exibem treino/aluno, divisões, exercícios, atualização, estado e acesso ao editor/PDF. Sem divisão ABC ou objetivo inventado no DTO resumido. Estado arquivado abre consulta. Modelos explicam cópia independente e histórico.

Criação oferece escolha explícita entre ficha individual e modelo reutilizável. Editor em duas colunas: dados e divisão selecionada à esquerda; resumo real de aluno/tipo/divisões/exercícios/séries e conferência à direita. Barra de salvamento com prévia local em dialog nativo; fechar/Escape devolvem o foco. Prévia identifica alterações não salvas e não ativa prescrição. Dados gerais permanecem abertos; exercícios, séries, demonstrações e técnicas usam controles existentes em áreas progressivas. Preservar validação, confirmação de descarte e aviso de nova versão ativa. Em larguras reduzidas, coluna única e barra sem posição fixa. Paleta #151a20/#10151b, verde #a9e600 e Montserrat600–700, mantendo ProfessionalShell e rolagem interna.

### Perfil do aluno — 05/11/2026

Perfil noturno com identidade, iniciais, situação e contatos reais no cabeçalho; ações de editar, PDF e arquivar/reativar. Navegação por Visão geral/Treinos/Histórico/Documentos mantém painéis locais; Avaliações/Anamnese/Check-ins/Agenda direcionam aos módulos existentes. Visão geral em duas colunas, treinos compactos, resumo de anamnese, histórico cadastral, check-ins, dados pessoais, observações administrativas e atalhos profissionais. Nenhuma idade, KPI ou atividade inferida para reproduzir a imagem. Abaixo1350px, coluna única. Identificador integral quebra linha; datas e campos ausentes explícitos. Resumos não expõem respostas clínicas. Foco verde, alvos acessíveis e rolagem em #app-content preservados.

### Biblioteca e topbar funcional — 05/11/2026

Exercícios adota tipografia Montserrat700, filtros existentes, abas por origem e cards/lista. Cards usam composição gráfica por grupo muscular enquanto não há fotografia canônica autorizada no DTO; não associar imagens genéricas a instruções de execução. Mantidos detalhes, formulário particular, solicitações e moderação.

Topbar: busca em dialog, painel lateral de notificações reais e menu da conta com Configurações/Minha conta/Logout. Dialogs nativos oferecem Escape, foco contido e retorno ao acionador. Sol/lua alternam temas do shell; sidebar permanece escura. Modo claro usa canvas#f5f6f7, cards#fff, texto#151719, secundário#4f5965, verde para ações e texto de destaque#3f5e12. Tokens de superfícies, bordas, texto positivo e avisos adaptam Dashboard/Alunos/Perfil/Treinos/Indicadores/Biblioteca. Autenticação pública mantém identidade escura laranja. Preferência de tema local não contém identidade ou dados privados.


### Acompanhamento — carteira e evolução individual (novembro/2026)

`assessments/assessment.module.css` utiliza os tokens do workspace para fundos, bordas, contraste e verde-lima nos temas claro/noturno. Cabeçalho com título Montserrat 700, texto 500, ações de 42px; cartões de indicadores em três colunas; carteira/atenção em proporção 2,2:1. Abaixo de 1250px os painéis empilham; abaixo de 768px as linhas tornam-se cartões com rótulos de data; em 320px todas as ações permanecem acessíveis.

Detalhe: identidade e atalhos, navegação por botões com `aria-pressed`, resumo com gráficos à esquerda e última avaliação/agenda/histórico à direita. Controles compactos, seleção verde com texto escuro e gráficos de pontos preservando a semântica existente. Nenhum retrato ou dado ilustrativo inventado. Estado vazio e medidas ausentes explícitos. O dialog de seleção reutiliza StudentsPicker, Escape e devolução de foco. Somente #app-content rola; layout usa a largura compartilhada de até 2200px.

### Agenda profissional — grade temporal (novembro/2026)

`agenda/agenda.module.css` e `AgendaWorkbench`: título Montserrat 700, ações verde-lima, mini calendário lateral de 240–260px, toolbar de período/Hoje/visões e grade de sete dias (dia no mobile). Cabeçalho de dia sticky dentro da grade; 72px por hora, slots de 30min, eventos com altura proporcional. Grade rola internamente sem ampliar documento externo, altura adaptada à viewport. Navegação por setas nos horários evita centenas de paradas de Tab.

Disponibilidade usa fundo verde translúcido; reservas azuis; bloqueios cinza; presença pendente âmbar. Textos e rótulos identificam estado além da cor; cancelados usam texto riscado e rótulo explícito. Temas claro/noturno possuem contraste próprio nos cartões. Linha atual em vermelho, sem alterar estado. Títulos pessoais/local/notas só no detalhe privado; iniciais/dados da referência não são inventados. Configuração, edição, recorrência, comparecimento e histórico reutilizam componentes existentes.

## Modal de agendamento sobre o calendário — 05/11/2026

`AppointmentDialog` usa dialog nativo, backdrop discreto, largura máxima de 724 px e altura limitada à viewport, com rolagem própria. Cabeçalho e rodapé permanecem acessíveis. O calendário continua montado, mas fica inerte sob o modal; nenhuma estrutura de scroll global é acrescentada. Superfícies, texto, bordas e verde de seleção usam os tokens do workspace nos temas claro/noturno.

Composição baseada na referência aprovada: ícone/data no cabeçalho, ações Atendimento/Bloqueio/Disponibilidade, seletores compactos de aluno e tipo lado a lado, data/início/término, Presencial/Online, local opcional e “Mais opções” para recorrência, notas, contrato e ajustes de fuso. Externo/domiciliar e compromisso pessoal permanecem disponíveis nas opções avançadas. No mobile os campos passam a uma coluna. Buscas de aluno/tipo são paginadas e carregadas ao expandir o seletor.

Escape, X e Cancelar respeitam alterações não salvas e impedem saída durante envio; o foco retorna ao acionador. Término do atendimento é calculado pela duração do tipo e pelo fuso, não permite editar uma duração incompatível silenciosamente. “Salvar agendamento” solicita a prévia canônica; confirmação explícita e conflitos permanecem no próprio modal. Sem disponibilidade confirmada não há selo verde de horário livre.


Conflitos na agenda: prévia bloqueada apresenta motivo, orientação e ação de ajuste quando aplicável. Não mostrar checkbox de confirmação desabilitado como única saída; renderizar a confirmação somente com prévia permitida. Usar painel neutro com texto explícito e tokens do tema, preservando contraste nos estados de erro. Agenda sem faixas semanais orienta configurar disponibilidade, sem simular horários de atendimento.

## Interações da agenda: detalhes e arraste — 05/11/2026

Clique no cartão abre detalhes no mesmo `AppointmentDialog`, com seções progressivas para dados privados, edição, presença, cancelamento e histórico. O calendário permanece montado e inerte sob o modal, sem trocar a página. Fechar retorna foco ao acionador; após mudança confirmada, foco e mensagem retornam ao contexto da agenda atualizada.

Arraste usa Pointer Events, limiar de 8 px para distinguir clique, cursor grab/grabbing, cartão flutuante junto ao cursor e marcador tracejado no horário de destino com encaixe de 15 min. A prévia visual indica posição candidata, nunca disponibilidade garantida. Fonte fica atenuada; ponteiro/ghost não interceptam alvos. Rolagem e hover sobre setas de período permitem alcançar outros horários/semanas. Escape, cancelamento e soltura fora da grade não gravam nada. A alternativa “Mover para outra data e horário” usa data/hora explícitas e o mesmo fluxo, acessível pelo teclado.

Controles da agenda e seus modais oferecem hover de fundo/borda/sombra; foco visível mantém anel verde. Botões desabilitados não recebem aparência de hover ativo. Ícones e cartões reutilizam a paleta; movimento de transições respeita prefers-reduced-motion. Ghost e feedback usam posição fixa e limite de largura, sem ampliar scroll externo. Claro/noturno, 1440/768/375/320 px e modal com conteúdo extenso fazem parte da verificação.

### Anamneses — central e construtor (novembro/2026)

Central com tipografia Montserrat 700, indicadores reais, busca e filtro, solicitações em tabela paginada e coluna lateral de convite. Tokens do workspace preservam claro/noturno. `intake/intake.module.css` concentra o padrão; cartões, botões de 40px e estados selecionados verde-lima. Indicadores usam “Convites criados”, nunca alegam envio externo.

Construtor compartilhado: três painéis delimitados, com seções numeradas à esquerda, cartões de perguntas visíveis no centro e configurações à direita. Cada cartão apresenta título, tipo, controle de obrigatoriedade, edição/duplicação/exclusão e amostra visual do campo. O lápis expande a configuração completa; a prévia interativa mantém condições. Em telas intermediárias as configurações passam abaixo; no mobile os painéis empilham. Cabeçalho apresenta título real, estado de rascunho, prévia, salvar e publicação explícita quando fornecida pelo módulo. Nenhuma opção visual permite alterar submissão imutável.

Central: cabeçalho com ações, quatro indicadores com ícones, abas, tabela com aluno/formulário/data/situação/ação e filtros dentro do cartão. A coluna direita contém convite e orientação em três passos. Tabela tem rolagem horizontal local em telas estreitas, sem ampliar o documento externo. Os exemplos da imagem não substituem dados registrados. Controles de arquivo e recuperação de links não são decorativos: só aparecem quando suportados pelo domínio.

#### Reordenação de perguntas pela alça

No construtor compartilhado, a alça lateral é um botão com alvo de 36×44px, cursor de pegar, hover e foco visível. Arraste com mouse ou toque somente pela alça; o conteúdo continua disponível para seleção, edição e rolagem. Após deslocamento mínimo de 6px, cartão flutuante acompanha o ponteiro, origem fica translúcida e linha verde indica inserção antes/depois do destino. Sem autoplay/animações prolongadas; respeitar movimento reduzido. Escape, cancelamento do ponteiro, perda de foco ou soltura fora da lista não alteram a ordem. Próximo das bordas, rolagem permanece em `#app-content`. Setas para cima/baixo na alça reordenam com foco preservado; mensagem discreta para leitor de tela informa a posição. Perguntas condicionais permanecem após suas dependências. Não alterar seções ou versões publicadas por meio desse gesto.


### Biblioteca de vídeos — novembro/2026

Cabeçalho compacto com ações YouTube/upload, três indicadores com ícones, abas sublinhadas em lima, filtros superiores e grade4/3/2/1 colunas. Cards16:9 apresentam origem, duração quando conhecida, exercício, situação traduzida e detalhes. Sem thumbnail autorizado, usar placeholder explícito “Prévia sob demanda”, sem inventar pessoas ou duração. Alternância em lista preserva filtros e página.

Painel lateral modal nativo, largura máxima510px, rolagem interna, fundo conforme tema, foco contido e devolvido ao acionador. Escape/fechar respeita alterações não salvas; ação de fechar fica desabilitada durante operação, com interrupção explícita da transferência. Formulário de upload tem zona de seleção/arraste, destino, título, direitos e privacidade. Declarações começam desmarcadas; progresso não significa processamento concluído. O shell e a sidebar permanecem compartilhados; nenhum scroll global extra.

## Serviços e consultorias — novembro/2026

Central comercial utiliza o `ProfessionalShell`, a largura ampla compartilhada e tokens claro/escuro. Cabeçalho de gestão comercial, quatro indicadores antes das cinco abas, composição principal/apoio aproximadamente 2:1, cards com borda discreta/raio 12–13px, tabelas compactas e verde-lima nos destaques. Tipografia Montserrat: título32px/750, seções19px/750, dados12–14px; sem depender da fonte condensada de headings antigos. Indicadores têm semântica textual e ícone; cor não é o único sinal de estado.

Em até1150px os painéis de apoio passam abaixo da coluna principal e indicadores usam duas colunas. Em até640px a tabela vira blocos por contratação, ações com toque42px e filtros empilhados. Não acrescentar rolagem no documento externo. `progress` nativo com nome acessível representa obrigações concluídas, acompanhado de fração explícita. Abas com botões e aria-pressed; teclado nativo e foco visível. Serviços rápidos abrem dialog lateral com título associado, Escape/descarte e restauração de foco. Formulários complexos permanecem em seções progressivas.

Estados vazios usam explicação e acesso ao catálogo; falhas são anunciadas e permitem atualização. Nenhuma imagem de avatar fictícia ou dado ilustrativo é inserido na carteira.

### Consultorias — refinamento das abas internas

Serviços/planos, contratações, entregas, histórico e respectivos editores utilizam o escopo `.workspace` local de Consultorias. A Visão geral mantém sua composição e estilos aprovados, sem alterações no componente `overview.tsx`.

- Catálogo: seletor segmentado Serviços/Planos comerciais, cabeçalho contextual, filtros compactos e cards com ícone, estado, versão, atendimento ou preço/duração. Ação principal “Gerenciar”; duplicação, histórico e arquivo em menu contextual nativo, acessível por teclado e fechável por Escape. Não usar preço zero como substituto de informação ausente.
- Contratações: tabela em superfície delimitada, cabeçalho e contagem, filtros, paginação e ação principal em verde-lima. Detalhe usa dados do acordo em blocos, termos e ações progressivas.
- Entregas: tabela com aluno/acordo, tipo, prazo, progresso nativo, estado/obrigatoriedade e acesso ao detalhe. Em até760px vira uma lista de blocos, mantendo todas as informações. Atraso tem texto explícito além da cor.
- Histórico: linha do tempo com ícone por família de operação, evento, versão, data/hora e justificativa, quando existente. Sem novos dados pessoais ou consultas extras.
- Formulários: campos em duas colunas no desktop e uma no mobile; configurações/entregas em seções progressivas, salvamento destacado, mensagens e avisos de descarte preservados. Alterações de apresentação não mudam validações ou confirmações administrativas.

Cards usam os tokens atuais, bordas discretas e raio8–12px; títulos17–25px, corpo12–14px, metadados10–12px. Não adicionar scroll global, indicadores artificiais ou consultar agregados apenas para decorar as abas. Paginação continua no servidor,20 registros por página.

## Check-ins — central operacional de novembro/2026

Cabeçalho “Check-ins e feedbacks”, descrição operacional, ação secundária Criar modelo e ação verde-lima Atribuir check-in. Quatro indicadores reais compactos, navegação semanal/Hoje e filtros progressivos. Desktop usa lista/resposta em aproximadamente65/35; até1200px empilha e até760px mostra contexto de resposta com retorno à lista. Mantém ProfessionalShell/#app-content, sem scroll global.

Cards usam tokens existentes, borda discreta e raio12px; títulos20–31px, corpo12–14px e metadados10–12px. Badges sempre têm rótulo. Seleção usa fundo suave verde-lima; placeholders e estados vazios orientam a próxima ação. Avatares são iniciais autorizadas, sem fotografias ilustrativas.

Resposta reutiliza o renderer versionado e o detalhe canônico em modo compacto. Prazos/convites são disclosures acessíveis. Rótulos e foco estáveis, confirmação antes de descartar rascunho e botão bloqueado durante gravação. Texto “Registrar devolutiva” diferencia persistência de envio; “Preparar lembrete” abre o Composer de Comunicação no mesmo painel, com retorno, prévia e confirmação; permanece fluxo manual, sem disparo. Não usar verde/ícone para sugerir mensagem entregue sem evidência. Taxa sem denominador mostra “—” com explicação, nunca0% fictício.

### Check-ins: abas operacionais (novembro/2026)

Solicitações usam linhas compactas com identidade, formulário, período/prazo, badge textual e ação; abaixo de1100px refluem, abaixo de600px viram lista vertical. Modelos usam cartões com metadados reais do rascunho; periodicidade usa cartões de séries com fatos e ação de pausa. Indicadores distinguem destaques, volume e relatos; histórico usa linha do tempo paginada. Bordas e superfícies usam tokens de tema existentes. Botões possuem hover de superfície/borda lima, foco visível independente do hover, active e disabled sem interação; ação principal mantém contraste escuro sobre lima. Respeitar prefers-reduced-motion. Sem números, gráficos ou informações ilustrativas nas carteiras reais.

### Financeiro — novembro/2026

Cabeçalho Financeiro com exportação e Nova cobrança; abas Visão geral, Cobranças, Recebimentos, Planos, Repasses, Histórico e Configurações. Sidebar/shared shell, superfícies/bordas por tema, verde-lima nas ações. Desktop: quatro indicadores e dois painéis por linha; até1350px painéis empilhados; até900px linhas financeiras refluem; até600px navegação select e cards compactos. Origem integrada/lima e externa/azul sempre acompanhadas por texto. Valores desconhecidos/parciais explícitos. Nova cobrança reutiliza ServiceDrawer com rótulo de fechamento contextual, foco/modal nativos e proteção de rascunho. Hover, foco, disabled, active e movimento reduzido seguem padrão comum.

### Financeiro — colunas independentes (06/11/2026)

Na visão geral, gráfico e cobranças recentes formam a coluna principal; recebimentos por origem e ações prioritárias formam a coluna lateral, com intervalo de 20 px. No desktop, a coluna lateral distribui a altura disponível entre seus dois cards e alinha sua base à de cobranças recentes, mantendo 20 px entre os cards, sem vincular ações à linha inferior do gráfico. Até 1350 px, as colunas se empilham sem alterar a rolagem do shell profissional.

## CRM & Operação — novembro/2026

Central usa ProfessionalShell sem rolagem global adicional. Cabeçalho compacto, quatro indicadores, navegação Kanban/Lista/Minhas tarefas/Histórico, filtros progressivos e região de rotina lateral a partir de1200px. Cards com iniciais, próxima ação, prazo e tarefas agregadas; detalhes em drawer de até540px. Quadro horizontal controlado em desktop/tablet, seleção de etapa e cards em coluna no mobile. Lista tabular possui região própria de rolagem horizontal.

Cores e superfícies seguem workspace-card/background/foreground/primary/border do shell, inclusive tema escuro; paleta das etapas permanece decorativa e o estado tem texto. Verde principal com texto primary-foreground; foco visível, alvos44px, animação discreta e respeito a reduced-motion. Modal de tarefa até620px, campos avançados recolhíveis, foco contido por dialog nativo, Escape com proteção de alterações e retorno ao acionador. Drawer e modal posicionam conteúdo relativo ao próprio elemento sem ampliar o documento externo. Não se adicionam fotos fictícias ou métricas de demonstração. Evidências e limites: [relatório CRM](../engenharia/redesign-crm-2026-11.md).

### CRM — largura e abas operacionais (06/11/2026)

Rota `/crm` utiliza o contêiner amplo do ProfessionalShell, com os mesmos recuos dos módulos recentes. Título 31 px, texto operacional 13–14 px, pesos 600–750 em controles e títulos; em telas a partir de 1800 px, tabela com 14 px e nomes com 15 px. Lista em painel com cabeçalho, avatar de iniciais e etapa textual; tarefas em cards de largura mínima de 320 px quando disponível; histórico em linha do tempo paginada. Filtros e rotina lateral usam superfícies e bordas dos temas existentes. Hover lima suave, foco visível, disabled e movimento reduzido. Em celular, lista reflui por aluno, sem exigir rolagem horizontal.

### Comunicação — composição da referência (06/11/2026)

Cabeçalho com título31px, descrição13px, Criar modelo e Registrar contato. Quatro métricas compactas com ícones48px e valor25px; sem dados ilustrativos. Seis abas principais com seleção lima arredondada e sublinhado; áreas auxiliares em menu contextual Mais áreas, ou seletor no mobile. Colunas desktop na proporção1.47:1, tabela de acompanhamento à esquerda e prioridades/modelos à direita, intervalo18px. Busca ocupa a linha, filtros adicionais progressivos, três chips principais. Cards brancos no claro/grafite no escuro, bordas discretas, tabelas e ações compactas. Contexto de aluno não cria faixa extra na visão geral. Até1350px áreas empilhadas; até639px tabela reflui por aluno e métricas em duas colunas. Hover, foco, disabled e reduced-motion obrigatórios. Chat: três colunas com aviso de desenvolvimento, composição/anexos/envio desativados; nenhum estado de mensagem fictício.

### Configurações — referência premium (06/11/2026)

Cabeçalho36px, descrição16px; Preferências334px à esquerda e conteúdo à direita, intervalo30px. Perfil superior com acento lima, avatar circular180–195px, nome28px e ações de edição/foto. Grade2×2 com ícones neutros e botões de borda lima; privacidade em card horizontal inferior. Textos/posições seguem referência, dados reais e iniciais sem foto. Tokens claro/escuro existentes. Tablet/mobile empilham áreas. Recorte1:1 circular com zoom/reposicionamento acessíveis, explicitamente não salvo e sem upload. Sidebar usa wordmark oficial nomelogo.png proporcional; conta/assinatura/configurações no rodapé, Indicadores em Sistema, importação pela central.

### Tutoriais — central de conhecimento (06/11/2026)

Composição da referência: título em caixa alta38px, subtítulo16px, busca42px, banner lima Comece por aqui com ícone de livro, ação à direita. Três colunas desktop nas proporções0.95/2.15/0.66: categorias, artigo e índice lateral. Categorias com ícones e contagens reais, máximo8 por página; seleção com superfície/acento lima. Artigo com passos numerados circulares, dica e CTA; informações adicionais em seção progressiva. Três cards de destaque inferiores. Até1350px índice reorganizado, até900px áreas empilhadas, até639px tipografia e controles ajustados. Claro/escuro e ícones existentes. Foco do índice vai ao passo no scroll do shell; reduced-motion respeitado. Não usar contagens ou artigos fictícios para imitar a imagem.

## Configurações funcionais — novembro2026

A central mantém o layout e tokens já definidos. Formulários privados e apresentação pública são seções distintas; nome/CREF e focos não usam selo de verificação. Focos são checkboxes agrupados com legend, seleção/foco visíveis nos dois temas. Ações sensíveis exigem senha atual e feedback; publicação tem escopo explícito e confirmação, padrão privado. Upload usa recorte existente e gravação com validação real no servidor; solicitações exibem protocolo/estado. O shell recebe apenas a versão da foto, nunca dados privados de cadastro. Componentes novos não criam scroll global. Regras e limites em [Configurações](../modulos/configuracoes.md).

Minha conta usa `details/summary` nativos em grupos exclusivos (dados pessoais, e-mail, senha e sessões), com foco/teclado e rascunhos preservados. Evita empilhar quatro formulários completos em uma página extensa.

### Tutoriais — orientações progressivas por etapa

Artigos mantêm numeração e índice de etapas. Cada etapa pode oferecer disclosure nativo “Ver orientações e cuidados”, com resumo curto sempre visível e detalhes em lista recolhida. Cabeçalho informa a quantidade real de etapas. Summary tem foco visível, hover com tokens do workspace e acionamento por teclado; claro/noturno e texto200% preservados. Detalhes expandem no fluxo de `#app-content`, sem scroll global ou modal. A busca inclui o conteúdo recolhido; não precisa abrir todas as orientações para localizar um assunto. Não apresentar leitura como treinamento concluído, progresso certificado ou recurso habilitado.

## Toasts e confirmações — novembro2026

Feedback global: toast compacto flutuante inferior direito, card/borda do tema, ícone sem depender só da cor, sucesso em verde-lima e erro com cor semântica. Duração5000ms; pausa em hover/foco, fechamento manual, no máximo3 avisos e duplicidade suprimida. Mantém o erro relevante junto ao campo. Progressão/animação respeitam movimento reduzido.

Confirmar, descartar ou justificar usa dialog FormFisik, nunca confirm/alert/prompt do navegador. Ícone, título claro, consequência em linguagem simples, Voltar inicialmente focado, ação explícita, Escape e foco restaurado. Decisões assíncronas não podem executar mutações antes da aceitação. Justificativas em textarea5–500 caracteres, com validação de domínio adicional. Sem scroll global ou margens de compensação. [Contrato e limitações](../engenharia/feedback-e-confirmacoes-2026-11.md).

## Evolução performance & lifestyle — 2026-11-06 (registro histórico)

Decisão de magenta compartilhado e recoloração da marca **revogada** pelo refinamento abaixo. O texto desta seção registra a composição anterior; não orienta novas alterações.

A landing e os acentos compartilhados passam a combinar preto, magenta `#FF397E` e verde-lima da marca. Esta decisão substitui o verde como `primary` de ações; verde continua na logo oficial, gráficos e estados positivos. Texto sobre o magenta usa preto `#0A0A0A`; textos de destaque no canvas claro usam magenta escuro `#B5164A`. Preservar os arquivos oficiais `public/images/nomelogo.png` e `logocompleta.png`, proporção e geometria. Na revisão de fidelidade pedida pelo usuário, a landing usa a máscara alpha da marca para uma variante branca/magenta; o shell mantém a marca original. Não criar nova geometria de logo.

A landing (`src/modules/marketing/landing.module.css`) é editorial escura, independente do tema da área profissional. Exo 2 peso900 itálica em títulos de campanha, Arial/Helvetica no texto compacto da landing; fontes operacionais existentes preservadas. Tipografia expressiva fica no marketing; telas operacionais mantêm hierarquia legível, formulários e densidade existentes. O `ProfessionalShell` mantém a estrutura de viewport e rolagem independente, com novos acentos nos tokens e seleção lateral.

Padrões atuais: hero com fotografia corrigida, faixas com largura total da viewport e espaçamento vertical fluido, dispositivos conceituais identificados, fotos editoriais dos produtos futuros, painel Pro claro/escuro, manifesto original e footer fotográfico. A imagem original funciona como atlas visual delimitado por CSS; textos comerciais, botões e estrutura são HTML. Magenta de campanha `#FF0077` em grandes títulos, `#FF3895` em texto pequeno escuro e `#DF0068` nas ações com texto branco para contraste. Navegação mobile expansível, Escape devolve foco ao botão, link de salto e foco visível. Sem animação contínua, respeitando movimento reduzido. Wear e Studio não devem aparentar compra/reserva disponível.


### Landing — largura total e respiro vertical (composição anterior)

A landing ocupa100% da viewport, sem limite externo de1600px. Fundos e faixas alcançam ambas as bordas; os recuos internos preservam leitura. Em desktop, hero usa altura mínima fluida de520–1000px, demais seções recebem padding vertical via clamp, e cards/painel Pro têm mais espaço entre elementos. Entre701–1000px o painel profissional distribui o conteúdo em duas colunas. Mobile recebe espaçamento vertical de32–40px, sem ampliar tipografia ou bloquear a rolagem. Arte recortada mantém proporção e alinhamento central para não revelar outras regiões do atlas.

Validação inclui1920 e2560px além de1440/1024/768/375/320px; todas as seções devem alcançar as bordas da viewport sem scroll horizontal, incluindo texto200% a320px. Nenhuma dessas regras modifica o ProfessionalShell.

### Landing — composição contínua da referência

A revisão de fidelidade mantém largura total, mas substitui o respiro vertical amplo anterior por faixas editoriais contínuas. No desktop: hero próxima de37,8vw, plataforma26,55vw, cards Wear19vw e Studio14,8vw. Imagens encostam nos limites das faixas; espaçamento interno protege textos/ações. Tablet mantém painel profissional em duas colunas e mobile mantém reflow sem depender das proporções desktop. Alteração isolada ao CSS de marketing, sem impacto no shell profissional.

### Website público — navegação e conteúdo sem fotografia

A revisão do website substitui a composição por recortes da imagem. Identidade preta com verde-lima nas ações e detalhes discretos em roxo/rosa, com tipografia de campanha Exo2 apenas na hero, Wear, Studio e assinatura da marca. Títulos de leitura usam Arial bold; textos têm largura confortável, hierarquia e espaçamentos em unidades estáveis. Fundos ocupam a viewport; conteúdo usa limite1280px/1600px em monitores grandes. Seções claras destacam prévia do produto, coleção e FAQ, sem alterar o tema da área profissional.

Novos padrões locais: diretório editorial com âncoras abaixo da hero; prévia com abas acessíveis e capturas fornecidas pelo usuário; capas de categorias com fotografia quando disponível; details/summary para coleção, estágio do Studio e FAQ; plano com condições legíveis e CTA específico. Ações têm hover/foco, redução de movimento e destinos reais. As fotografias futuras entram nas áreas editoriais sem carregar texto comercial dentro da imagem. Não desenhar ações fictícias de compra/reserva ou links sem destino.


### Marca oficial, hero e isolamento de temas — revisão vigente 06/11/2026

Header e footer exibem o arquivo original `nomelogo.png` branco/verde, sem máscara, filtros ou recoloração. A landing usa tokens próprios `--marketing-*`, sem redefinir `--primary`/`--ring` globais. Verde forte `#B6ED00` nas ações públicas, rosa `#FF68AB` em pequenos destaques e roxo em detalhes/área Studio. Textos principais permanecem neutros; evitar grandes superfícies rosa.

O sistema autenticado mantém `primary`/`ring` verde `#A9E600`, seleção lateral verde e texto de destaque `#3F5E12` no tema claro. Tokens globais/autenticação retornam a `#96D100`. Nenhuma mudança na estrutura de viewport, navegação ou scroll. Estilos públicos não podem recolorir o shell, inclusive após navegação cliente entre rotas.

Hero usa fotografia enviada pelo usuário (`hero-bodybuilder-magenta.png`) como fundo responsivo com Next Image, texto HTML à esquerda, atleta à direita e proteção de contraste. Alunos/Treinos/Agenda usam as três capturas enviadas, com aba ativa por clique/teclado e ampliação em dialog próprio (fechar/Escape/foco restaurado). Card Oversized usa `wear-oversized-atlas.png` com contain para mostrar as duas camisetas; título/descrição ficam fora da fotografia. Não redesenhar nem recortar textos contidos nas capturas; conteúdo explicativo permanece em HTML acessível. Compressão também usa a fotografia enviada, com enquadramento integral. Acessórios também usa a imagem fornecida, com mochila, garrafa e equipamentos de treino.


### Hero — enquadramento e bordas suaves (07/11/2026)

Atleta ampliado pela altura da composição, mídia em proporção1672/941 e máscara suave nas quatro bordas, sem blur no tecido/estampa. Foto preservada integralmente no desktop, foco à direita/topo no mobile. Frases auxiliares da hero removidas por solicitação do usuário. Barra de rolagem externa fica invisível apenas quando a landing está montada (`html:has(.landing)`); rolagem por mouse/toque/teclado e estilos do ProfessionalShell continuam independentes.


### Plataforma — composição MacBook em largura total (07/11/2026)

Seção pública sem contêiner externo limitado: fundo preto/magenta ocupa a viewport inteira, recuos internos fluidos, título Exo2 itálico branco/rosa e contexto com ícone à direita. Navegação vertical por benefícios à esquerda: Gestão de alunos, Treinos inteligentes e Agenda e atendimentos. Seleção atualiza descrição e captura projetada no monitor. CTA rosa com texto branco e hover escuro, ação Ver a plataforma com ícone circular; ambas seguem destinos reais. Rosa é local à campanha, sem alterar tokens operacionais.

Foto fornecida em `platform-laptop-scene.png`, proporção1919/820, posicionada na base. Capturas originais verdes projetadas em quatro pontos do monitor com matrix3d; um ResizeObserver local escala a cena sem deformar a foto. Nada de filtros que recoloram a área profissional. Até1000px conteúdo empilha, seleção em três colunas e cena recortada lateralmente para destacar o computador. Até320px e texto200% sem overflow externo. Dialog próprio amplia a captura sem perspectiva, com Escape, fechar e foco restaurado. Teclado nas abas aceita setas verticais/horizontais, Home e End. Referência não autoriza disponibilizar loja/Studio ou recursos além do inventário.


Refinamento de densidade da seção Plataforma (07/11/2026): altura mínima desktop de700px/39.3vw, recuos verticais menores e benefícios com intervalos12–14px. Mantidos títulos, CTAs, projeção do monitor e layout mobile; redução aproximada de10% na altura da composição.


Plataforma — refinamento posterior de07/11/2026: altura mínima650px/36.4vw, espaçamentos reduzidos, cenário proporcional com82% da largura desktop e centralização horizontal. Máscara de transparência nas quatro bordas aplicada ao conjunto foto/captura, preservando estampa/interface nítidas. Mobile usa menos ampliação e ponto focal no computador; rolagem e ação Ampliar preservadas. Substitui as dimensões da revisão de densidade anterior.


Plataforma — ajuste lateral (07/11/2026): esfumado direito começa em76% e fica totalmente transparente antes do limite da imagem, ocultando a borda do arquivo. Botão flutuante Ampliar tela removido; a ação Ver a plataforma ao lado do CTA continua acessível para visualizar a captura.


### Wear — cards da referência (07/11/2026)

Seção branca com conteúdo amplo, cabeçalho em duas colunas e headline esportiva preta/verde. Verde textual `#6E9800` mantém contraste de título grande sobre branco; lime `#B6ED00` em ações. Aviso Primeira coleção — em preparação em borda preta com ícone e contexto à direita. Fotografias fornecidas preservadas em três cards brancos de borda1.5px/cantos30px, mídia proporcional sem recortar produtos, faixa de identificação com ícone/título/descrição/seta e ação larga. Oversized recebe CTA verde; demais ações em borda preta, todas com hover e foco visível. Detalhes continuam via details/summary, sem simular venda disponível. Até900px cabeçalho empilha; até700px cards em coluna. Sem recolorir as fotos ou os tokens da área interna.


Plataforma — alinhamento vertical (07/11/2026): altura mínima desktop ajustada para max(630px,34.8vw). O bloco de benefícios, descrição e CTAs fica centralizado no espaço abaixo do cabeçalho por flex; até1000px mantém fluxo empilhado. Imagem e máscaras preservadas. Validado em navegador local nas larguras2559/1440/768/320px, sem overflow horizontal; desktop com centro do bloco coincidente com o centro da área disponível.


### Plano profissional — campanha magenta (07/11/2026)

Seção de preço escura com benefícios em grade à esquerda e card Pro à direita. Headline esportiva branca/magenta, ícones em blocos discretos, borda iluminada e CTA rosa com hover. Logo oficial preservada. Fundo fornecido em `pro-pricing-background.png`, centralizado no tamanho original (1919×819), sem ampliação, com máscaras nas quatro bordas. Até900px as colunas empilham; até480px benefícios ficam em coluna. Valores e prazo continuam provenientes do catálogo de assinatura existente; cadastro e consulta da assinatura usam as rotas atuais.


Preço — refinamento de densidade (07/11/2026): tipografia de apresentação e benefícios reduzida sutilmente; card limitado a600px, com recuos internos e intervalos menores, preço até68px e CTA de56px. Em telas empilhadas o card permanece centralizado. Condições comerciais e conteúdo preservados.


### Studio e essência — composição clara (07/11/2026)

Studio em fundo branco, cabeçalho com linha e aviso de desenvolvimento, apresentação à esquerda e benefícios em três colunas à direita, separados por borda vertical. CTA verde aponta para o disclosure da etapa do projeto. Essência em faixa cinza suave arredondada, título esportivo preto/verde e texto em coluna adjacente. Verde textual #729B00 para contraste; botões lime #B6ED00. Até900px blocos empilham; até600px benefícios ficam em lista. Texto público descreve presença digital/física e impacto na vida das pessoas, mantendo a diretriz empresarial nos documentos institucionais. Não há reservas ou unidades disponíveis.


### CTA final — campanha verde (07/11/2026)

Imagem fornecida cta-neon-green.png ao fundo, centralizada, proporcional e limitada à largura original2172px no desktop, com máscaras nas quatro bordas. Conteúdo à esquerda: kicker, headline esportiva branca/lime, três benefícios, CTA largo com cantos chanfrados e condições reais do teste. Foco remove o recorte do botão para manter outline visível. Em celular imagem vira fundo atenuado e os benefícios empilham. Tokens restritos à landing; cadastro mantém rota existente.


### Rodapé — dark com luz nos cantos (07/11/2026)

Fundo sólido #101112 com grain procedural SVG feTurbulence de opacidade .045, sem fotografia. Gradientes radiais rosa à esquerda e verde à direita partem dos cantos, com blur e recorte local. Logo escrita oficial centralizada entre duas linhas em gradiente, acima dos créditos. Navegação organizada por divisórias, avisos Em breve preservados e links reais. Camadas decorativas não recebem foco nem eventos; layout empilha no celular sem ampliar o documento.


Cadastro (07/11/2026): senha e confirmação possuem botões independentes de mostrar/ocultar, com Eye/EyeOff, área40px, nomes acessíveis, aria-pressed e foco visível. Não enviam o formulário nem alteram o valor digitado.


Confirmação de senha no cadastro (07/11/2026): com ambos os valores preenchidos e iguais, os dois campos recebem borda lime #A9E600, inclusive no foco, e mensagem “As senhas coincidem”. Confirmação diferente informa “As senhas ainda não coincidem”; campos vazios não indicam sucesso. Feedback anunciado com aria-live e descrito pelos campos. Igualdade não substitui validação da política no servidor.


### Comparação de planos na landing (07/11/2026)

Três cards escuros com bordas discretas e destaque magenta no Pro, seletor Mensal/Anual com aria-pressed e totais anunciados. Standard49,90/30 alunos, Premium89,90/50 alunos, Pro139,90/ilimitados. Anual20% menor, exibindo equivalente mensal e cobrança anual única explicitamente. Pro mensal preserva CTA de cadastro; demais combinações sinalizam contratação em breve. IA no Pro e parceria de comissionamento nos três são futuras, identificadas sem prometer disponibilidade. Até760px cards empilham. Componente PricingPreview é necessário para o seletor interativo sem tornar toda a landing client; não altera catálogo de billing, permissões ou checkout.


Assinaturas multiplanos (07/11/2026): landing encaminha plano/periodicidade para a página autenticada; selectores com labels, valor total do período e quantidade de alunos ativos explícitos. Anual usa /ano com cobrança única; não exibir equivalente mensal como parcela. Gerenciamento usa plano/preço canônicos e condições do período. IA/comissionamento permanecem identificados como futuros. Sem seleção de IDs Stripe ou valor no cliente.


### Central de assinatura — redesign07/11/2026

Planos, retorno e gerenciamento usam SubscriptionHeader e subscriptions.module.css dentro do ProfessionalShell, sem max-width estreito ou scroll global próprio. Tipografia Montserrat compatível com módulos operacionais, cards bg-card, bordas discretas e lime #A9E600 nas ações selecionadas; cores semânticas acompanham claro/escuro. PlanCards reutiliza catálogo canônico e alterna mensal/anual, com total anual explícito, capacidade ativa e recursos futuros. Estado Seu plano vem do snapshot autenticado. Comparação não habilita upgrade/downgrade.

Confirmação em duas colunas exibe estado real, resumo contratado/datas e próximo passo; acesso ao dashboard só destacado quando paidAccess é confirmado. Gerenciamento preserva Portal/cancelamento e histórico; comparação progressiva reduz extensão. Fatura zero rotulada Sem valor a pagar/Fatura sem cobrança, sem inventar mensalidade Pro. Mobile empilha cards e resumo, botões confortáveis/foco explícito.


Topbar e plano contratado (07/11/2026): busca centralizada por grid com colunas laterais equilibradas, campo44px com borda/hover/foco e ícone; removidas divisórias verticais entre controles. Badge junto ao tema exibe nome contratado obtido de consulta mínima server-side por usuário, sem IDs externos ou chamada Stripe adicional; não concede acesso. Mobile mantém busca compacta e tema acessível. Cards de planos destacam o contrato existente quando presente; seleção de comparação não desloca esse destaque. Sem contrato, seleção continua interativa.


### Busca global — paleta de comandos (07/11/2026)

Referências: https://manual.raycast.com/search-bar e https://support.apple.com/en-gb/guide/mac-help/mh26783/26/mac/26. Dialog opaco bg-card, borda discreta, sombra e backdrop escuro com blur; abertura Ctrl+K/Meta+K ou botão, Escape restaura foco. Input combobox com resultados listbox/option, setas e Enter, seleção lime. Resultados locais de navegação aparecem imediatamente; busca privada automática começa com3 caracteres após250ms, AbortController descarta consultas obsoletas. Sem histórico pessoal em armazenamento.


Busca temporal: termos de calendário exibem lista cronológica com data/hora/situação, contagem e paginação20 registros. Dia numérico pode consultar com1–2 caracteres; demais registros mantêm mínimo3. Meses sem ano interpretados no ano atual da Agenda.

### Carregamento dos módulos

Os módulos reutilizam `LoadingSkeleton` (`src/components/ui/loading-skeleton.tsx`) nos carregamentos iniciais, listas, detalhes e leituras auxiliares. As variantes `page`, `list` e `inline` usam superfícies e bordas semânticas, sem cores da landing page. A boundary compartilhada do grupo autenticado mantém o shell durante a navegação. O texto de carregamento fica disponível somente para leitores de tela (`role=status`); os blocos decorativos ficam ocultos da árvore acessível. A animação respeita movimento reduzido. Erros, estados vazios e operações de salvamento mantêm seus tratamentos próprios.

### Exercícios — editores e solicitações

A navegação do módulo usa ícones e estado ativo em verde discreto, com ação de seleção separada. Criação particular e proposta oficial compartilham editor em três seções: identificação, músculos e orientações; nomes alternativos ficam em disclosure opcional. Grupos musculares são checkboxes apresentados como chips, com foco e seleção explícitos. Em desktop, um painel auxiliar explica o fluxo; em telas menores, as instruções essenciais permanecem no formulário. Solicitações usam cards, badges textuais de estado, datas e paginação existente. Preservar tokens dark/light e confirmação própria antes de descartar edição.

A sidebar pode apresentar um ponto de atividade no link pendente via `useLinkStatus`, sem deslocar o conteúdo. As boundaries de cada módulo reutilizam o skeleton comum e permitem prefetch parcial do Next, preservando o shell interativo.

### Dropdowns de seleção compartilhados

`src/components/ui/select.css`, importado pelo CSS global, padroniza os seletores simples existentes sem substituir controles, valores, eventos, labels ou contratos dos formulários. Usa personalização nativa progressiva (`appearance: base-select` / `::picker(select)`): menu opaco com tokens `popover`, bordas de 12 px, sombra, opções espaçadas, seleção com verde discreto/checkmark e foco visível. A altura da lista é limitada à viewport, com rolagem interna; o menu usa a top layer nativa, inclusive em dialogs. Não acrescenta JavaScript, dependências ou consultas. Múltiplos/listboxes (`multiple` ou `size`) preservam seu comportamento próprio. Navegadores sem suporte mantêm o picker do sistema, com hover/foco e cores de fallback. Movimento reduzido e cores forçadas são considerados.

Referência técnica: [seletores personalizáveis na MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select). A paridade visual do menu depende do suporte do navegador; não pressupor aparência idêntica em navegadores sem `base-select`.

### Detalhes do exercício

`ExerciseDetails` compartilha cabeçalho com nome em Montserrat, badge textual de escopo/estado e versão; ícone abstrato de movimento sem representar mídia inexistente. Categoria, equipamento e nível usam cards semânticos. A execução aparece em etapas numeradas, com grupos musculares e aliases em painel auxiliar; até 900 px a composição vira uma coluna. Origem/licença/revisão ficam em disclosure, mantendo visíveis os avisos de revisão técnica e os dados sinalizados. Demonstrações e ações particulares são slots opcionais para reutilização em seletores/moderação. Não acrescentar mídias, instruções ou classificações presumidas. Retorno à biblioteca preserva a memória de filtros existente.

### Áreas secundárias da Agenda

Disponibilidade, tipos, indicadores e histórico compartilham cabeçalho com ícone, título em Montserrat e descrição contextual. Disponibilidade mostra as faixas efetivamente cadastradas por dia e separa exceções e bloqueios. Tipos usam cards com modalidade, duração, intervalos e estado textual, com descrição longa em disclosure. Indicadores separam contagens, ocupação e horas, preservando o estado não calculável e os limites conceituais. Histórico usa timeline paginada sem ocultar justificativas. Configurações mantêm seções/dias recolhíveis e proteção de alterações. A ação Atualizar agenda fica separada na navegação, com feedback de carregamento e movimento reduzido. Tudo usa tokens semânticos dark/light; grades viram uma coluna no mobile, sem alterar a rolagem do shell.

### Painéis da topbar

Perfil e notificações usam dialogs opacos, ancorados no canto superior direito, com altura limitada à viewport, cabeçalho fixo e backdrop discreto. Perfil reúne avatar, nome, plano e links com descrição; logout mantém o fluxo existente. Notificações compartilham introdução compacta, explicação expandível, cards de não lidos e estado vazio sem simular avisos. Um gesto iniciado e terminado no backdrop fecha esses dois painéis; clique interno ou arraste iniciado dentro não fecha. Escape, botão de fechar e restauração do foco permanecem disponíveis. Busca mantém seu tratamento separado. `aria-haspopup`/`aria-expanded` identificam os acionadores. Cores seguem os temas do shell, sem estilos da landing page.

Paginação de notificações: controles compactos de 32 px com chevrons, nomes acessíveis e contador discreto. Omitir quando o total é zero ou cabe em uma página. Preservar retorno em página posterior que ficou vazia após atualização, desde que ainda existam avisos no filtro; não alterar a paginação compartilhada dos outros módulos.

No painel de perfil, Sair da conta usa vermelho suave no estado normal e hover vermelho alaranjado, com contraste adaptado aos temas claro/escuro, foco visível e respeito a movimento reduzido. Tratamento restrito ao botão deste painel; ação de logout preservada.

Logout da sidebar e do painel de perfil compartilham o mesmo tratamento vermelho suave/hover vermelho alaranjado, com variantes claro/escuro e foco. Minha conta na sidebar abre a subárea de Configurações e mantém o atalho ativo conforme o parâmetro de entrada; Configurações continua levando à visão geral.

Sidebar: espaço adicional de 40 px após a marca separa o início dos módulos. Logo e ações de conta permanecem fixas; a navegação conserva sua rolagem independente em alturas reduzidas.

O rodapé da sidebar mantém 32 px de respiro inferior, elevando o conjunto de assinatura, conta, configurações e perfil sem alterar o espaçamento após a logo.

Dashboard: as linhas de Evolução/Agenda e Atenção/Atividades compartilham a proporção 1,3:1 e gap de 18 px, mantendo as bordas verticais alinhadas no desktop e a quebra responsiva existente.

A ação de saída da sessão usa o rótulo Logout na sidebar e no perfil. Antes de enviar a requisição, apresenta a confirmação própria do app; cancelar preserva a sessão, e confirmar mantém o fluxo existente de revogação e retorno ao login. Botão fica desabilitado enquanto aguarda a decisão ou a requisição, evitando cliques repetidos. Não significa encerramento/exclusão de conta.

## Estilos utilitários terceiros — remediação de segurança 08/11/2026

O CSS anteriormente importado de `shadcn/tailwind.css` foi preservado integralmente em `src/styles/vendor/shadcn-tailwind.css`, sem decisão visual nova. `globals.css` importa essa cópia; origem, versão, hash e licença MIT constam em `licenses/README.md` e `licenses/shadcn-MIT.txt`. O CLI foi removido por trazer dependências vulneráveis desnecessárias ao aplicativo. Atualizações da cópia exigem revisão de segurança e comparação visual; não reinstalar automaticamente o gerador para alterar estilos.

Refinamento do e-mail de confirmação: logo também no rodapé; assinatura “Sua evolução começa aqui” abaixo da logo superior; título “Confirme seu e-mail” em uma linha, com tamanho compatível com viewport de 320px.

Shell de contratação: profissionais sem entitlement confirmado recebem variante em tela cheia do ProfessionalShell, sem sidebar, topbar, busca ou notificações. Preserva #app-content como scroll independente, altura controlada, marca e logout com confirmação. A variante é decidida no layout servidor pelo acesso canônico; não inferir acesso a partir do plano exibido, query string ou estado do navegador. Contas com acesso confirmado mantêm navegação profissional normal.

Exclusão de conta: seção de risco em Privacidade e segurança com ação vermelha, senha atual, frase EXCLUIR MINHA CONTA e diálogo compartilhado de confirmação. Após agendamento exibe data e retenções, sem continuar mostrando formulário destrutivo. Loading/falha de consulta não habilita exclusão. Não comunicar eliminação física imediata quando somente o acesso foi encerrado.

Confirmação de cadastro por código (030): no e-mail, código de seis dígitos em texto selecionável, fundo verde e texto preto substitui CTA/link; validade10min. Na tela, input único com label, inputMode numeric/autocomplete one-time-code e colagem integral, botão Confirmar código, reenvio com contador60s e retorno ao cadastro/login. Reenvio e erros comunicados por regiões status/alert. Links antigos seguem apenas para compatibilidade; textos e prazo anteriores do e-mail de cadastro são substituídos por este padrão.

Cortesia de staging (031): selo “Cortesia vitalícia” na topbar e painel explícito “FormFisik Pro · acesso gratuito”. Não apresentar preço mensal, fatura, data de trial ou ação Stripe fictícios. O plano de capacidade é Pro; gratuidade vem de concessão server-side separada e revogável, restrita ao staging.

## Dashboard administrativo inicial

Variante administrativa do `ProfessionalShell`, com os mesmos tokens, logo, tema, altura e scroll independentes. Sidebar exibe apenas Dashboard, identificação do administrador e Logout; topbar exibe contexto Administração, tema e identificação, sem pesquisa/notificações profissionais. Cards de indicadores em grade 1/2/4 colunas, ícones Lucide, bordas e superfícies existentes. Skeleton acompanha a grade; erro recuperável não mostra detalhes de infraestrutura. Não reutilizar termos de assinatura para indicar privilégios administrativos.

Dashboard admin: cinco indicadores, grade responsiva 1/2/3/5 colunas; card de análises de contas futuras usa `—` e “Em breve”, nunca zero fictício. Gráfico verde de seis meses usa `RegistrationChart`, compartilhado com dashboard profissional, SVG com descrição e tabela de valores recolhível. Mantém os tokens e estilos de `dashboard-view.module.css`.

Abaixo dos indicadores admin: gráfico e card “Exercícios para análise” em duas colunas no desktop (proporção 1,6:1), empilhados em telas menores. Card com contagem real, contexto e estado vazio; sem botão sem destino funcional. Análise de exercícios e futura análise de contas são indicadores distintos.

Prévia de exercícios no dashboard: até cinco linhas com nome e link compacto “Detalhes”; link de rodapé para lista paginada. Página administrativa de solicitações mantém shell compartilhado, painéis existentes, estado vazio e seleção na URL. Cabeçalho contextual “Exercícios para análise”; detalhes textuais em painel e paginação discreta somente quando necessária.

Módulo Usuários admin: reutiliza `portfolio.module.css` da carteira de alunos. Três indicadores globais, painel com busca por nome, filtros de perfil/situação/ordenação e alternância lista/cards; nenhuma ação fictícia de cadastrar ou exportar. Avatar por iniciais, identificação de papel e badge de bloqueio. Perfil usa painéis, ícones e tokens existentes e expõe contato sob demanda. URL preserva paginação, filtros e visualização no retorno; skeletons específicos, estados vazios e erro recuperável. Sidebar adiciona Usuários com seleção em todas as subrotas.

Assinaturas admin: reutiliza carteira de alunos/Usuários com três indicadores globais, filtro por titular/plano/periodicidade/situação e lista paginada. Diferencia status registrado e aviso de cancelamento agendado. Detalhes em painéis de plano/vigência, titular, sincronização e faturas paginadas, sem botões de operação financeira nesta fase. Skeletons específicos e seleção na sidebar para subrotas.

Financeiro integrado: mesma página administrativa de assinaturas, menu Financeiro, quatro cards monetários, gráfico com fatos verdes e estimativas magenta tracejadas, tabela acessível e seletor limitado a 3/6/12 meses. Gráfico distingue meses sem fatos/previsão por “—”. Próximas cobranças e movimentações ficam em painéis recolhíveis com paginação independente; estado de abertura mantido na memória privada existente do shell. Lista de assinaturas e seus indicadores continuam abaixo, sem novas telas. Estados vazios e critérios financeiros permanecem explícitos.

O SVG financeiro define largura integral e altura automática explicitamente, para preservar o gráfico dentro do layout de carteira, cujas regras genéricas de SVG destinam-se aos ícones. Verificar a dimensão renderizada, além de overflow e presença de dados.

Privacidade e segurança admin: quatro cards globais, navegação em abas na mesma página, painel de filtros e listagem com os estilos de carteira, 20 por página. Detalhe inline com situação, datas e impedimento legível; CTA de perfil somente quando a conta ainda existe. Diferencia acesso encerrado, limpeza concluída e retenção sem badges que prometam conformidade. Estados vazios, skeleton e erro contextual; sidebar e topbar compartilhadas. Nenhuma ação destrutiva ou botão sem implementação.

Perfil Usuários admin: seção Controle de acesso com seletor obrigatório de motivo, botão destrutivo de bloqueio e botão de reativação, confirmação global, busy e status acessível. Própria conta e conta em encerramento têm explicação em lugar da ação indevida. Histórico de dez eventos recentes em painel existente, com motivo, data e responsável; sem formulário de texto livre ou ações de auditoria fictícias.

Tratamento de privacidade: ação inline no detalhe com justificativa, referência operacional e confirmação compartilhada; estado pendente inicia análise, estado em análise permite concluir/indeferir, finais somente leitura. Atestado de atendimento obrigatório na conclusão; histórico até dez transições no painel. Proteção de conteúdo não salvo. Moderação admin reutiliza o editor e browser existentes, catálogo recolhido inicialmente, justificativa/confirmacão e proteção de revisão não salva; resultado preservado no filtro Todos após decisão.

### Administração: largura compartilhada e cortesias (08/11/2026)

Todas as rotas `/admin` usam a mesma `overviewContainer` das telas profissionais amplas: width100%, max2200px, margem automática e padding do shell. Cabeçalho permanece fora do scroll, sem scroll global ou compensações nas páginas. Cards e painéis ocupam a área disponível; formulários e gráficos podem manter limites locais de legibilidade.

Cortesias integram painel recolhível do Financeiro, lista paginada10, formulário contextual em duas colunas no desktop e empilhado no celular. Identidade pré-selecionada via Usuários, vigência explícita, motivo obrigatório e confirmação compartilhada antes de gravar/revogar. Audit sob demanda, feedback por status e proteção de alterações não salvas. Cores/tokens/botões existentes, sem dependências ou tela financeira adicionais.

### Filtros de taxonomia pesquisáveis — 09/11/2026

`SearchableSelect` reutiliza Combobox da dependência Base UI existente: trigger com valor selecionado, busca dentro do popup opaco, lista de altura limitada, check de seleção, estado sem resultados e navegação por teclado/Escape. Categoria, grupo muscular e equipamento no ExerciseBrowser compartilham o padrão, inclusive no seletor de Treinos. Digitar filtra apenas a taxonomia local; a consulta paginada de exercícios muda somente ao selecionar. “Todos” limpa o filtro. Sem nova dependência, mudança de autorização ou carregamento integral de exercícios.
