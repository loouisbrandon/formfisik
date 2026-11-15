# Central de serviços e consultorias — 05/11/2026

Estado: IMPLEMENTADO e validado em ambiente local controlado; produção NO-GO. FormFisik é empresa independente fundada por Brandon Louis. Este relatório não presume formalização jurídica nem autoriza operação financeira ou deploy.

## Auditoria e preservação

O checkout já continha numerosas alterações e módulos não rastreados das entregas anteriores. Foram preservados, sem reset, commit ou migração persistente. A base019 foi inspecionada antes das alterações: `catalog.ts`/`catalog-editors.tsx`, `contracts.ts`/`contract-editor.tsx`, `deliveries.ts`/`delivery-detail.tsx`, `queries.ts`, `handlers.ts`, schemas, tipos, histórico e testes. Consultadas as referências oficiais de arquitetura, Personal1.0, inventário, roadmap, negócio/privacidade, Design System e documentação019. Guia CSS da versão instalada do Next.js lido antes da implementação.

A auditoria confirmou:

| Recurso / integração | Reuso e limite preservado |
| --- | --- |
| Serviços/planos | CRUD, duplicação, arquivo/reativação, preço em centavos, duração/sessões/condições, obrigações e revisões imutáveis existentes |
| Contratações | Seleção de aluno/plano, conferência, snapshot, rascunho, ativação explícita, suspensão, conclusão/cancelamento e sucessora única |
| Alunos | Vínculo privado e carteira próprios; subárea por aluno usa o mesmo componente e filtro no servidor |
| Treinos | Evidência exige ficha individual ativa e versão elegível da vigência; editor canônico e histórico preservados |
| Acompanhamento | Evidência exige avaliação ativa do aluno e versão pertinente; sem copiar medidas clínicas |
| Anamnese | Evidência exige solicitação revisada, não revogada, do mesmo aluno/finalidade; sem copiar respostas |
| Agenda | Invariantes021 e execução019 explícita existentes; link para agenda do aluno, sem segundo calendário |
| Check-ins | Finalidade022 permanece independente; link operacional não registra execução ou evidência intake |
| CRM | Flags/contagens canônicas existentes; sem valores ou conteúdo sensível novo no card, sem movimento automático |
| Financeiro | Estrutura020 existente continua responsável por obrigação/cobrança/pagamento; a central apenas aponta para o módulo |
| Segurança/privacidade | Guards, SQL por proprietário, FKs compostas, sessões opacas, idempotência, controle otimista, eventos e eliminação016 preservados |

## Resultado e arquitetura

Cinco áreas: Visão geral, Serviços e planos, Contratações, Entregas e Histórico. Cabeçalho, indicadores, tabela/apoio, cores, densidade e hierarquia seguem a referência dentro dos temas atuais. Não foram inseridas pessoas, fotos ou quantidades fictícias na aplicação.

`CommercialOverview` é uma composição nova necessária para reunir consultas existentes; não contém mutação ou regra de autorização. `ContractTable` é compartilhada entre visão geral e listagem de contratações, com apresentação mobile em blocos e nomes acessíveis. `ServiceDrawer` limita edição rápida de serviço, reutiliza ServiceEditor e o padrão dialog nativo já adotado no produto; permanece local para não acoplar Consultorias ao domínio de mídia, suas classes CSS e identificadores. Planos/contratações continuam nos editores canônicos: não foi criado um segundo fluxo de gravação.

Apenas a consulta de indicadores foi ampliada, sem novas entidades, dependências, migrations ou endpoints. Regras e contratos de mutação permanecem iguais. `has_successor` é projeção de leitura com proprietário explícito. Busca de contratação acrescenta nome do serviço acordado; curingas continuam escapados. A consulta agregada retorna até sete grupos de entrega e cinco serviços; tabelas/históricos continuam20/página no SQL. Cancelamento de leituras obsoletas e debounce200ms preservados.

As definições exatas dos indicadores estão no módulo e na explicação expansível da interface. Resumo usa a carteira/aluno inteiro; filtros da tabela só filtram a tabela. “Renovações pendentes” identifica próximas/expiradas sem sucessora, como decisão administrativa. Não mede aceite, venda ou cobrança. Progresso mede obrigações concluídas/total por tipo, não número de unidades ou criação automática de registros técnicos.

## Manifesto de alterações desta execução

- `src/modules/consultancies/area.tsx`: composição, cinco áreas, reuso dos editores/detalhes, navegação, painel e tabela.
- `src/modules/consultancies/overview.tsx`: indicadores, busca/situação/paginação, tabela compartilhada, próximas ações, serviços populares e progresso.
- `src/modules/consultancies/service-drawer.tsx`: dialog lateral, foco, Escape, bloqueio durante gravação; confirmação de descarte delegada à área.
- `src/modules/consultancies/consultancies.module.css`: tokens dos temas, composição, hierarquia, formulários, tabelas/blocos mobile e foco.
- `src/modules/consultancies/delivery-detail.tsx`: acesso ao módulo de origem e perfil, preservando evidências/execuções existentes.
- `src/server/consultancies/queries.ts`: projeção de sucessora, novos agregados e busca por serviço do snapshot.
- `src/modules/professional/shell.tsx`: largura ampla compartilhada em `/consultorias`.
- `tests/consultancies.test.ts`: cenário de novos indicadores, sucessora, progresso explícito, busca e isolamento.
- `tests/consultancies-e2e.ts`: seletores da nova navegação, overview vazio/preenchido, painel lateral, temas e links de origem, preservando cenários completos anteriores.
- Documentação: módulo, API, Design System, roadmap, CHANGELOG e este relatório.

Hashes finais dos arquivos de implementação/teste desta execução: `test-results/019/redesign-manifest.json`. O manifesto não representa todas as alterações anteriores presentes no checkout.

## Evidências executadas

- PostgreSQL descartável separado `formfisik_dashboard_test`: **25/25 testes aprovados**. Cobre CRUD, snapshots, idempotência, disputa de versões/operações, arquivo, transições, renovação, execução/reabertura, evidências, IDOR, isolamento, origin, rate limiting, eliminação e paginação/volume2500. Novo caso reconcilia `drafts`, `renewals`, `delivery_summary`, sucessora e busca por serviço.
- Chrome E2E: **PASS** com PostgreSQL real descartável e gateway explicitamente controlado. Criação/edição funcional, catálogo, plano com obrigações, contratação, ativação, execuções, evidência de avaliação, reabertura, versões históricas, renovação, conclusão/cancelamento, acesso cruzado negado e concorrência. Falha de rede após gravação verifica repetição idempotente sem perda dos campos. Nenhuma chamada a provedor financeiro real.
- Axe em overview vazio/preenchido e painel de serviço claro/escuro; demais etapas no escuro. Larguras320/375/768/1440/1920, navegação por teclado, foco de feedback/restauração e texto200%/altura500. Sem violações detectadas, overflow horizontal externo ou erros de página. Não equivale a avaliação humana com leitor de tela.
- ESLint `npx eslint src tests`: **PASS**.
- TypeScript `npm run typecheck`: **PASS**.
- Build real `npm run build -- --webpack`: **PASS**,82 páginas geradas, rotas privadas dinâmicas. Repetido com três canários sintéticos nas configurações privadas de HMAC, SMTP e Stripe; nenhum encontrado nos arquivos públicos/static e HTML/body gerados. Evidência: `test-results/019/redesign-build-security.json`. Esse ensaio não equivale a uma nova auditoria integral015.

Artefatos: `test-results/019/browser-proof.json`, `api-measurements.json`, `browser/` e manifesto. Capturas dos temas usam dados sintéticos apenas no harness, nunca na carteira normal.

Conferência adicional em localhost: servidor3000 responde e protege a rota com redirecionamento ao login quando não autenticado. A tentativa de usar a senha histórica do usuário sintético retornou401; leitura/Argon2 confirmou que ela já não corresponde à credencial atual. **Não foi redefinida a senha nem alterada a conta.** Por isso o script extra `test-results/local/consultancies-redesign/visual.cjs` não aprovou essa conferência autenticada; não confundir com o E2E completo aprovado no ambiente descartável. O usuário pode continuar utilizando sua sessão/credencial atual no projeto.

## Limitações e veredito

**GO local controlado para a evolução de Consultorias**, com evidências acima. **NO-GO para produção/dados reais**, preservando os bloqueios institucionais015 e a homologação externa pendente. Não foi realizado deploy, commit, instalação, criação de serviço externo ou operação financeira nova.

Não há novo arquivo de contratação ou estado de entrega “revisada”; preservadas as transições suportadas. Próximas ações abrem a área correspondente e seus filtros; não há filtro dedicado “sem sucessora” na listagem. Planos trimestrais/semestrais/anuais/pacotes usam a duração/sessões configuráveis existentes, sem semear ofertas artificiais. Renovação continua novo rascunho explícito. Sem atualização automática de obrigações por check-in/treino/avaliação ou cobrança automática.

Não houve nova persistência ou mudança de retenção, e não foi realizado novo ensaio de backup/restore nesta execução. O teste de eliminação019 foi reexecutado; isso não substitui homologação operacional do restore016. Riscos residuais: validação humana de UX/tecnologias assistivas, regras operacionais/jurídicas e integrações externas/produção, além da credencial local histórica indisponível para o script adicional.

## Complemento — acabamento das abas internas

Escopo autorizado no pedido seguinte: refinar Serviços e planos, Contratações, Entregas e Histórico, preservando a Visão geral. Não houve alterações no backend, API, banco, regras comerciais ou permissões nesta etapa.

Implementação:

- `area.tsx`: escopo visual específico para áreas internas/editores, cabeçalhos contextuais com ação principal, superfícies de resultados e contagens; callbacks de catálogo, transições e seleção preservados.
- Novo `collection-views.tsx`: cards de serviço/plano, estado/versão/atendimento, preço/duração reais quando disponíveis e menu contextual para duplicar/histórico/arquivo. Escape fecha o menu e devolve foco. Tabela de entregas exibe progresso pelas unidades registradas, prazo, estado e acesso ao detalhe; vira blocos no mobile. Componente justificado pela apresentação distinta do catálogo e de obrigações, sem duplicar o domínio019 ou `ContractTable`.
- `shared.tsx`: histórico paginado em linha do tempo, região com nome acessível, eventos/versões/data e justificativas; mesma consulta e dados anteriores.
- `delivery-detail.tsx`: escopo para hierarquia visual do detalhe e formulário de execução.
- `consultancies.module.css`: estilos específicos de abas internas; editores de plano/contratação usam campos em duas colunas e uma no mobile, configurações progressivas e salvamento destacado. Nenhuma nova rolagem global.
- `tests/consultancies-e2e.ts`: validação nos dois temas em todas as etapas; seletor de histórico passa a usar a região acessível em vez de depender do pai imediato do heading; menu contextual/Escape/foco verificados.
- Design System, documentação do módulo, CHANGELOG e este complemento atualizados.

A primeira execução E2E encontrou um seletor dependente da estrutura antiga do histórico; os eventos estavam presentes, mas o teste procurava dentro do novo cabeçalho. Corrigido usando a região acessível. Não foi enfraquecida a verificação do evento de renovação.

A Visão geral mantém `overview.tsx` idêntico ao início desta etapa; novas regras CSS das abas usam `.workspace`, ausente na Visão geral em repouso. Baseline e manifesto em `test-results/local/consultancies-tabs/`. As novas superfícies não fazem chamadas adicionais apenas para decorar a interface, não carregam coleções completas e não apresentam totais da página como indicadores globais.

Regressão PostgreSQL descartável: **25/25 aprovados**, incluindo autorização, isolamento, concorrência, snapshots, renovação, execução e eliminação. TypeScript/ESLint/build e resultados finais Chrome/Axe estão registrados junto ao manifesto e às evidências019. Capturas usam exclusivamente os dados sintéticos do harness; a carteira local permanece preservada. Validação local não altera o NO-GO produtivo nem resolve a credencial histórica mencionada anteriormente.

Resultado final do complemento: **GO local controlado**, mantendo NO-GO de produção vigente. Chrome E2E final **PASS**, com todas as etapas auditadas em claro/escuro e320/375/768/1440/1920px, incluindo catálogo de planos, menu contextual aberto, listagem de entregas, editores, detalhes e histórico. Asserções de ausência de overflow horizontal e vertical no documento externo, teclado/Escape/foco, texto200% e altura reduzida passaram. Axe não detectou violações e não houve erros de página. `test-results/019/browser-proof.json` registra `internalTabsRefined`, `catalogContextMenuKeyboard`, `deliveriesList` e `allAuditedStatesBothThemes`.

ESLint `npx eslint src tests`, TypeScript e build webpack finais **PASS**. Build com três canários privados sintéticos: nenhum encontrado nos211 arquivos públicos/HTML/body examinados (`test-results/local/consultancies-tabs/build-security.json`). Manifesto confirma `overviewUnchanged:true`, sem alteração de backend ou migrations. Não houve deploy, commit ou alteração da credencial local. Permanecem as limitações operacionais e de homologação descritas anteriormente; este acabamento visual não as resolve.
