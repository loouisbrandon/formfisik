# Feedback e confirmações FormFisik — novembro2026

Estado: IMPLEMENTADO, com validação local parcial; build final e regressão CRM pendentes. FormFisik é empresa independente fundada por Brandon Louis. Mudança de experiência compartilhada, sem novos dados persistentes, APIs, dependências, credenciais, migrations ou processamento financeiro.

## Diagnóstico e objetivo

Os módulos usavam confirm/prompt do navegador, estados de erro com mensagens brutas de exceção/resposta e um aviso profissional fixo no conteúdo. A entrega substitui esses comportamentos mantendo regras, permissões, versões, confirmações explícitas e idempotência das APIs. Não reconstrói nenhum módulo de negócio.

## Componentes e integração

src/modules/feedback contém serviço transitório, catálogo revisável de mensagens estáticas, sanitização, hooks e provider global. src/app/layout.tsx instala o provider também para autenticação e links públicos. Toasts flutuam no canto inferior direito, em claro/escuro, com ícone, borda discreta, progresso, botão de fechar e animação reduzida conforme preferência.

Duração padrão:5000ms. Pausa durante hover/foco e retoma o tempo restante; não remove um controle sob o foco do teclado. Até3 toasts simultâneos, sem empilhar erros idênticos. Não mudam o scroll do shell nem criam persistência/Web Storage. Em dialogs abertos são renderizados no dialog ativo para permanecer visíveis e operáveis acima do backdrop.

confirmAction(message,accepted?) retorna Promise<boolean>; requestInput(message,initial?) retorna Promise<string|null>. A interface usa HTML dialog estilizado, com título/descrição, foco inicial seguro em Voltar, trap nativo de foco, Escape, restauração de foco e botões próprios. Não são usados window.confirm/alert/prompt. Justificativas exigem5–500 caracteres, preservando validação/autorização adicional no servidor. Apenas uma decisão pode estar ativa: novas solicitações concorrentes são recusadas, impedindo que duplo clique execute duas ações após uma confirmação.

Callback opcional de aceitação executa sincronamente no clique de confirmar, para a abertura já existente de página financeira hospedada conservar a ativação de usuário. Não antecipa cobranças, transações ou autorização. Sem provider ativo a decisão falha de forma fechada (false/null), sem fallback nativo.

Foram migradas70 chamadas em Agenda, avaliações, Check-ins, Comunicação, Consultorias, CRM, Financeiro, Importações, Anamneses, Vídeos, Fotografias, Configurações e Treinos, além do guard compartilhado. Funções que aguardam decisão agora são assíncronas. Métodos internos chamados confirm (sem relação com a API do navegador) foram preservados.

## Mensagens e segurança

68 estados de erro e12 estados de mensagem passaram a usar hooks compartilhados.156 acessos a mensagens de exceção em catches foram encaminhados para sanitização, inclusive leituras que guardam falha em objeto. Erros de campo também são filtrados. Mensagens estáticas conhecidas mantêm orientações acionáveis; texto inesperado, inglês técnico, SQL, caminhos, stack traces, nomes de segredos e detalhes de infraestrutura tornam-se uma mensagem clara do módulo. Não se confia em qualquer texto recebido como message.

O catálogo contém apenas texto estático de validações/avisos revisáveis: não inclui valores de CPF, aluno, endereço, token, cookie, segredo ou mensagem arbitrária do servidor. Incluir uma nova mensagem exige revisar sua finalidade e linguagem; não liberar prefixos amplos ou respostas completas dinamicamente. Erro de conexão/cancelamento preserva dados locais e abortos obsoletos não criam toast.

Validações junto aos campos permanecem, pois algumas exigem correção após os5s. Toasts não são a única informação de erro. Validação HTML é capturada para usar aviso e foco próprios, sem bolha de erro nativa; validações do backend e constraints não mudam. Os avisos de sucesso do antigo ProfessionalNotice passam ao serviço, sem banner permanente. Boundaries exibem recuperação amigável e usam o callback reset da versão instalada do Next.

Nenhuma exceção crua é enviada a toasts/logs novos. Nada de corpo de formulário, e-mail ou mensagem técnica em logs de UX. Regras de negócio e eventos financeiros permanecem nos módulos canônicos.

## Alterações não salvas

useUnsavedChanges compartilha o aviso entre formulários. Em links internos, impede a navegação antes de abrir a confirmação; cancelar conserva página/campos, aceitar usa o router. Guardas locais de abas/painéis continuam respeitando a decisão. Histórico do navegador usa a Navigation API quando disponível: impede a travessia e a repete somente após aceitar.

Não há beforeunload, conforme a solicitação de não usar diálogo do navegador. Fechar/recarregar a aba não aceita confirmação HTML assíncrona personalizada; portanto pode descartar rascunhos em memória. Não foi introduzido armazenamento automático de dados pessoais para contornar essa restrição. Navegadores sem Navigation API conservam o guard de links internos; proteção específica da seta Voltar depende da capacidade do navegador. Não declarar suporte universal sem testes.

## Manutenção e arquivos

Novos: feedback/{service,messages,message-catalog,hooks,provider,screen-error}, stylesheet; testes feedback unitário/browser, fixture e adapter exclusivamente de teste.
Integrações: layout raiz, módulos com estados de erro/decisões, guard compartilhado, notice profissional, cliente genérico e boundaries. ESLint proíbe chamadas nativas novas; teste estático cobre registros de beforeunload. Specs antigas de navegador que esperavam diálogos nativos usam adapter para clicar no componente real, sem alterar a aplicação ou inserir backdoor em produção.

## Validação

Resultados reais em 06/11/2026:

- TypeScript e ESLint: aprovados. Após o teste visual, a inicialização do host do portal foi movida para microtask cancelável para satisfazer a regra de efeitos; essa última correção passou em TypeScript/lint, mas não teve nova execução de navegador.
- Unitários: 4 testes aprovados, cobrindo sanitização de texto técnico/sensível, catálogo, decisões concorrentes, cancelamento, justificativa, desmontagem, deduplicação, limite de avisos, duração padrão, aborto e auditoria estática contra APIs nativas.
- Chrome controlado: aprovado. Evidência em test-results/feedback/browser-proof.json e screenshots toast/confirm em claro/escuro, 1440/768/320px. Verificados cinco segundos, pausa, foco, Escape, decisões duplicadas, justificativa, dialog aninhado, validação de formulário, links e histórico. Zero diálogos nativos e zero erros de página. Axe aprovado nas superfícies exercitadas. A fixture usa erros sintéticos e não comprova integração de todos os módulos.
- Configurações: regressão funcional Chrome aprovada, com APIs reais e banco descartável de testes. Não utilizou dados de produção.
- CRM: regressão não executada. A revisão automática recusou iniciar o processo porque ficou indisponível por limite de uso; não foi uma determinação de insegurança. Não houve tentativa de contornar a revisão.
- Build de produção e varredura de canários desta entrega: não executados; pendentes da disponibilidade de revisão. Resultados de builds anteriores não são evidência desta alteração.

Aceite: GO para avaliação visual local dos fluxos exercitados; NO-GO para declarar a entrega integralmente homologada enquanto build e regressão pendentes não forem concluídos. Nenhuma garantia de cobertura ponta a ponta de todos os módulos é inferida das substituições estáticas.

Sem deploy, commit automático ou homologação operacional. NO-GO015 de produção não é alterado por esta melhoria visual.

## Confirmação de Logout

O `LogoutButton` compartilhado pela sidebar e pelo painel de perfil exige confirmação própria antes do POST existente. Rótulo Logout; cancelar não envia requisição, mantém sessão e devolve foco ao botão. Estado pendente impede repetição. Nenhuma mudança no endpoint, revogação ou exclusão de conta. Playwright validou os dois locais: cancelamento com zero requisições e confirmação com uma requisição interceptada/respondida localmente (503 simulado), sem executar logout real. Lint, typecheck e diff-check aprovados.
