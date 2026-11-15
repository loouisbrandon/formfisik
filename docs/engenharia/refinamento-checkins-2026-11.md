# Central de Check-ins e Feedbacks — refinamento de novembro/2026

FormFisik é empresa independente fundada por Brandon Louis. Implementação local controlada, sem deploy, commit, credenciais externas ou migration persistente. Este documento não altera o NO-GO produtivo vigente nem presume formalização jurídica.

## Auditoria anterior à implementação

Lidos AGENTS.md e referências de Check-ins022, API, ADR024, privacidade, Comunicação024, ciclo operacional e Design System; preservadas as entregas anteriores do checkout. Inspecionados área, detalhe, formulário público, editor de atribuição, periodicidade, schemas, consultas, repositório transacional, handlers, testes e integrações.

| Capacidade encontrada | Reutilização / limite |
| --- | --- |
| Modelos e perguntas | Motor017, FormBuilder, AnswerReview e renderer público: seções, obrigatoriedade, texto, escolhas, escalas/números, sim/não, condicionais e publicação imutável |
| Atribuição | Preview/digest/confirmação, aluno próprio, revisão publicada, prescrição/versionamento opcionais, série materializada atomicamente e chave de intenção |
| Recorrência | Única, semanal7d, quinzenal14d e mensal civil; até24 ciclos/12 meses. Abre à meia-noite no fuso definido, após fim do período; pausa cancela somente futuras não abertas |
| Convites | Capacidade individual de uso único, digest no banco, geração explícita/revogação, janela/expiração e correção versionada |
| Respostas/devolutivas | Submissões/revisões imutáveis, devolutiva append-only vinculada à submissão exata, controle otimista, eventos e declaração manual de compartilhamento |
| Alunos/CRM | Perfil/histórico individuais; CRM recebe somente contagens, sem conteúdo de respostas |
| Treinos | Versão exata da prescrição é contexto do relato, sem mudar treino ou atestar execução |
| Acompanhamento | Série de pergunta por mesma versão publicada; consulta de evolução física no módulo próprio |
| Comunicação | Prepara textos/registra contato manual e avisos internos do profissional. Não existe transporte externo ou identidade/preferência ativa do aluno para entregar lembretes |
| Indicadores | Taxa com denominador elegível e primeiro envio, ausência explícita, séries paginadas sem misturar escalas/versões |

Não foi necessário criar entidade, serviço paralelo de envio, scheduler, tabela de resposta ou migration. A ausência de transporte externo e de leitura de devolutiva pelo aluno é limite real do produto atual, não indisponibilidade de uma chave a ser contornada.

## Entrega implementada

`/checkins` abre Visão geral operacional. Cabeçalho, quatro indicadores, navegação por semana/Hoje, filtros e composição lista/resposta seguem a referência com tokens claro/escuro e sidebar compartilhada. Não há dados ilustrativos na carteira normal; avatares são iniciais dos nomes autorizados.

A lista SQL20 carrega somente metadados. Selecionar uma ocorrência carrega seu detalhe sob demanda no painel direito, com cancelamento de leitura obsoleta. No celular, a resposta ocupa a área contextual e o botão de retorno volta à lista. Rascunho de devolutiva é protegido contra descarte, troca de aluno, filtros e navegação. Não há polling global nem resposta privada persistida em Web Storage.

São reutilizados CheckinDetail, formulário de revisão, invitação/correção, AnswerReview e histórico de devolutivas. Não há perguntas fixas ou interpretação clínica no painel. Conteúdo responde à definição da versão efetivamente respondida. Prazos/contexto e convites têm disclosures; dados e ações não são eliminados para caber na tela.

O botão é **Registrar devolutiva**, porque não existe entrega automática. Exige validação e confirmação, bloqueia submissão simultânea, mantém chave de intenção para retry e informa o resultado real. Complementações criam novos registros, sem editar os anteriores. Devolutivas mostram data, responsável proprietário e a revisão da resposta a que pertencem. Nova correção exige revisão da nova submissão.

“Preparar lembrete” reutiliza o Composer024 dentro do painel, somente quando a solicitação permite convite inicial. Prévia/digest/confirmação e gravação idempotente usam a API024 existente e criam registro imutável preparado, vinculado à solicitação antes da primeira resposta. Não registra envio, entrega ou leitura. O profissional pode preparar o texto, registrar contato manual e compartilhar o link pelo canal autorizado; a área completa de Comunicação permanece acessível. Não foi reaproveitado SMTP de autenticação para enviar dados de saúde ou abrir um canal profissional não homologado.

Modelos mantêm criar rápido/completo/personalizado, editar, publicar, prévia e arquivo; duplicar reaproveita a criação de novo rascunho com outra intenção, sem alterar o original. Periodicidade identifica aluno/modelo além da frequência/estado e deixa explícitas abertura civil e ausência de envio automático. Histórico oferece período, aluno e modelo; indicadores detalhados e séries anteriores permanecem acessíveis em área própria/perfil do aluno.

## Métricas e filtros

- Aguardando resposta: solicitações em estado waiting, inclusive as atrasadas, com fim do ciclo no período selecionado.
- Pendentes de revisão: received/reviewing, mesmo escopo.
- Revisados no período: ocorrências distintas com ao menos uma devolutiva registrada dentro do período e cujo ciclo termina dentro do período. Duas complementações da mesma solicitação não contam duas revisões.
- Taxa de resposta: respondidas elegíveis / solicitações não canceladas com prazo encerrado ×100. Convites e correções não multiplicam o denominador; denominador zero retorna null e a UI mostra “—”, com explicação.

Indicadores usam o período civil selecionado (America/Sao_Paulo), carteira/profissional e aluno contextual quando houver. Busca de aluno/modelo e situação afetam a lista; a distinção está descrita na interface. Semana padrão segunda a domingo; Hoje restaura a semana atual. O período usa fim do ciclo, não um envio presumido. Histórico usa data do evento, informada explicitamente nos controles. Filtros textuais são literais, case-insensitive, limitados120 e parametrizados.

## Componentes e arquitetura

O `Composer` de Comunicação foi reutilizado sem alterar suas regras, campos ou contratos. Não há segunda tabela de lembretes ou confirmação de envio. Seu formulário substitui temporariamente o detalhe no mesmo painel, com proteção de rascunho e retorno explícito.

Novo `CheckinOverview` justificado por compor as consultas existentes em uma superfície que mantém lista/seleção/filtros e ações no mesmo local. Não reimplementa revisão, renderizador ou autorização. `checkins.module.css` isola o visual. `CheckinDetail` recebeu modo compacto e controle de chamada simultânea; modos anteriores seguem disponíveis.

Consultas privadas foram ampliadas aditivamente com nomes/modelos da periodicidade, `number`/`received_at` no resumo, `can_invite` calculado no servidor e `submission_revision` nas devolutivas. Nenhuma resposta, token ou texto de devolutiva é adicionado à listagem. Busca e histórico respeitam joins compostos de proprietário e vínculo. Mutação, finalidade, retenção, eliminação016 e snapshots publicados permanecem canônicos.

## Limitações explícitas

- Atribuição permanece individual por operação, usando o fluxo existente; não foi introduzido lote multi-aluno ou sucesso parcial silencioso.
- Não existe preferência, disparo, tentativas de entrega ou evidência de recebimento de lembrete externo. O botão prepara a continuidade manual; não simula fila entregue.
- Horário arbitrário de envio e retomada automática de série pausada não são suportados. Abertura continua civil à meia-noite; nova série exige nova atribuição e confirmação. Alterar isso exige evolução específica de agendamento e domínio de comunicação.
- Aluno responde por capacidade individual sem conta. Esse link não concede leitura de devolutivas/histórico. Acesso autenticado/Connect e autorização/preferências do destinatário são dependências futuras; compartilhamento manual continua explícito.
- Não há diagnóstico, classificação de dor, prescrição, treino comprovado, obrigação contratual ou pagamento automático. Comparação não une escalas de versões diferentes.

Esses limites impedem declarar lembretes automáticos, horário configurável e portal do aluno como implementados. O escopo local verificado da central não equivale ao atendimento integral dessas extensões do prompt ou à homologação produtiva.

## Manifesto desta execução

Implementação: `src/modules/checkins/area.tsx`, `api.ts`, `detail.tsx`, `schema.ts`, novos `overview.tsx`, `tab-views.tsx` e `checkins.module.css`; `src/server/checkins/queries.ts`; `src/modules/professional/shell.tsx` apenas para a largura compartilhada de `/checkins`.

Testes: `tests/checkins.test.ts`, novos `tests/checkins-e2e.ts` e `tests/helpers/checkins-browser-server.ts`. O fixture importa exclusivamente serviços existentes, roda em PostgreSQL descartável e usa Billing controlado; não é importado pela aplicação. Não há provider externo de mensagens ou sucesso financeiro real nesse harness.

Documentação: módulo, API, privacidade, Design System, roadmap, CHANGELOG e este relatório. Nenhuma mudança no schema SQL, migration, dependência, contrato de mutação ou autorização.

## Validação e evidências

- **27/27 testes de integração PostgreSQL aprovados** em `formfisik_dashboard_test`, separado do banco local de uso. Regressão de propósito017/022, uso único/expiração/revogação, idempotência, concorrência, snapshots imutáveis, vínculo da prescrição, ausência de escrita019/020/021, owner isolation, eliminação016, paginação/volume2501 e taxa com primeiro envio. Novo cenário cobre filtros literais de aluno/modelo, revisão distinta sem duplicar complementação, identificação da revisão da resposta e `can_invite` canônico.
- **Chrome E2E aprovado** em harness com APIs/serviços reais e banco descartável. Seleção, proteção contra descarte, revisão/devolutiva append-only, preparação real de texto via Composer024/prévia/confirmação, convite, resposta pública sem conta/cookie, atualização explícita, modelos/duplicação, atribuição, pausa, histórico e indicadores. Recuperação de leitura após falha de rede verificada. O browser usa servidor Next de teste; build de produção é validado separadamente, sem alegar homologação de transporte externo.
- **Axe/visual**: telas profissionais em claro/escuro,1920/1440/768/375/320px; lista, detalhe, revisão, preparação de lembrete, compartilhamento, editor, atribuição, solicitações, periodicidade, histórico e indicadores. Sem violações detectadas ou overflow do documento externo. Texto200%, altura reduzida e fluxo público sem armazenamento de resposta também verificados. Axe não substitui avaliação humana com leitor de tela.
- **ESLint, TypeScript e build webpack real aprovados**, com82 páginas. Canários sintéticos de HMAC/SMTP/Stripe são usados no build; resultado da inspeção dos arquivos públicos em `test-results/local/checkins-redesign/build-security.json`.

Evidências: `test-results/checkins-redesign/browser-proof.json`, `api-measurements.json`, `browser/`, além de baseline/manifesto/hash em `test-results/local/checkins-redesign/`. Arquivos de medição guardam operação/status/tamanho/chaves, sem texto das respostas, cookies ou capacidades. Capturas e dados são sintéticos e locais; não foram inseridos na carteira normal.

**GO local controlado para a central operacional e os fluxos reais existentes ampliados. NO-GO para declarar as extensões integrais de envio automático/horário/portal do aluno, e NO-GO de produção preservado.** As limitações acima são funcionais reais, não simulações. Nenhum deploy, serviço externo, credential setup, migração persistente ou commit foi realizado. Não houve novo ensaio de backup/restore nesta execução; retenção/eliminação continuam016/022/024 e o teste de eliminação022 foi reexecutado.

A inspeção final incluiu correção de mínimos intrínsecos de fieldsets/controles e empilhamento das ações no mobile para suportar texto a200%. O retorno do painel de resposta agenda a restauração do foco após a lista voltar a ficar visível. A lista permanece acessível ao lado de respostas longas no desktop por posicionamento sticky local, sem criar outra rolagem global.

## Acabamento das abas operacionais

Solicitações passam a usar linhas compactas com avatar de iniciais, formulário/versão, período, prazo, estado textual e ação contextual; em larguras menores as linhas se reorganizam sem tabela horizontal. Modelos usam catálogo de cartões com revisão do rascunho, disponibilidade/arquivo, data de criação e acesso ao editor já existente. A revisão do rascunho não é apresentada como versão publicada.

Periodicidade mostra cartões de séries com aluno, modelo, frequência, quantidade de períodos, início, prazo, tolerância, fuso e pausa explícita. Indicadores separam quatro destaques operacionais de volume e relatos declarados, com denominadores, ausência de amostra e fórmulas acessíveis por disclosure. Histórico usa linha do tempo paginada com tipo de evento e data/hora; não expõe o conteúdo privado ou identificadores internos como decoração.

`src/modules/checkins/tab-views.tsx` contém somente composição de apresentação dos DTOs existentes; não cria fonte de verdade, cálculo de domínio, serviço ou consulta paralela. CSS compartilhado oferece hover, active, focus-visible, disabled e respeito a movimento reduzido. A Visão geral e o editor017 foram preservados. A suíte Chrome inclui o catálogo e todas as cinco abas em ambos os temas e nas cinco larguras documentadas.
