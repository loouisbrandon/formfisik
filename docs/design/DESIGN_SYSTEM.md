# Design System — FormFisik

Estado: implementado para cadastro, autenticação, assinaturas, área profissional, gestão de alunos, exercícios e prescrições. Landing existente como referência. Homologação Stripe externa permanece pendente; exportação Compacta/Premium implementada na 011.

## Princípios e identidade

Clareza, disciplina, energia, legibilidade e acessibilidade. A FormFisik é uma empresa independente. Preservar preto, verde de performance, tipografia esportiva e superfícies discretas, sem sacrificar a compreensão dos estados.

## Cores e tokens

Fonte executável: `src/app/globals.css`. Não duplicar tokens arbitrariamente por componente.

| Uso | Valor atual |
| --- | --- |
| Marca / primary | `#96D100` |
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

Labels: E-mail; Nova senha; Confirme a nova senha. Inputs 48 px, autocomplete email/new-password, política textual de 12–128 caracteres. Erros vinculados com aria-describedby/aria-invalid. Botão de mostrar/ocultar senhas possui nome e aria-pressed; ação principal usa font-ui para preservar texto preto sobre verde. Loading com texto e ícone decorativo respeita movimento reduzido. Feedback anunciado e foco no primeiro erro ou confirmação; rolagem natural em telas baixas.

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
