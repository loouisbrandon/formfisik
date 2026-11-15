# eCoach — implementação e contratos

## Estado por ambiente

IMPLEMENTADO localmente: chat demonstrativo completo, Finder, efeitos/rolagem, permissões, histórico persistente e contexto controlável. Etapa 2: adaptadores e ferramentas limitadas IMPLEMENTADOS localmente, com testes controlados; inferência externa NÃO HOMOLOGADA. Arquivos/áudio reais NÃO IMPLEMENTADOS. Não há homologação de IA ou produção. A publicação antiga de staging (`fdcecd2c-01f5-47d7-aa2a-f2b98f72228a`, sobre `87546cbea8de4d78b5914bba5429ea09b4331222`) contém somente a primeira prévia, sem estas atualizações.

Visão de produto: [eCoach — o cérebro da FormFisik](../produto/ecoach.md).

## Experiência reutilizada

`/ecoach` utiliza ProfessionalShell, tipografia/tokens, Button, ícones Lucide, LoadingSkeleton e confirmações existentes. Não cria rolagem global. Cabeçalho Nova conversa e compositor permanecem acessíveis; apenas a transcrição rola. Ao enviar ou voltar às últimas mensagens acompanha o fim; leitura manual suspende o acompanhamento. Redimensionamentos sem intenção de rolagem não o suspendem.

Finder mantém a busca existente e oferece modo eCoach, transferência da consulta, contexto visível/removível e expansão. Clique iniciado e concluído fora, Esc e Ctrl+K fecham o painel e devolvem o foco. Fechar/reabrir ou expandir conserva conversa e rascunho em memória. Histórico é compartilhado entre as superfícies. O painel “Suas conversas” fecha por clique/toque fora; interações internas e dialogs de confirmação preservam o fluxo. Trocar conversa ou iniciar outra avisa antes de descartar rascunho; não apaga conversas salvas.

Somente o personal tem balão. Respostas demonstrativas são texto no fundo, com fases e revelação progressiva; um único timer no provider evita duplicação entre superfícies. Movimento reduzido elimina animações. `aria-busy` e status textual limitam anúncios de fragmentos. Limpar/trocar conversa cancela a simulação; a resposta completa já salva pode ser reaberta. No modo de prévia não há execução de tarefas ou consulta de valores reais. Controles de áudio/PDF/imagem apenas informam indisponibilidade.

## Conversas e contexto — etapa 1

Histórico carregado sob demanda, 20 conversas por página, ordenadas por atualização decrescente e ID. DTO da lista só contém ID, título, versão e atualização; mensagens carregadas ao abrir. Máximo 200 conversas por profissional, 20 turnos (40 mensagens) por conversa, 2.000 caracteres por solicitação e 100 por título. Na prévia, resposta fixa gerada exclusivamente no servidor, nunca aceita do cliente. Na IA, resposta estruturada validada no servidor. Texto é renderizado sem HTML executável.

A primeira mensagem cria a conversa com título derivado da solicitação. É possível renomear, abrir e excluir definitivamente a conversa, com confirmação. Página vazia após exclusão recua uma página; nenhuma lista de milhares de registros é carregada. Nova conversa não exclui a anterior. Após reload, abrir uma conversa pelo histórico recupera suas mensagens; rascunhos não enviados não são persistidos. Leituras obsoletas são abortadas ou ignoradas. Falha ao salvar preserva o rascunho; conflito de versão orienta reabrir o histórico.

Contexto é um snapshot explicitamente visível e removível antes de enviar:

- Em todos os módulos: título derivado da rota compartilhada, sem captura de DOM.
- Financeiro: período e filtros de visão/situação efetivamente selecionados; cobrança selecionada, quando houver.
- Detalhe de aluno: referência do vínculo selecionado derivada da rota.
- Demais filtros/registros de outros módulos: ainda não publicados como contexto; a interface não os presume.

Não copia texto de busca, campos de formulário, dados clínicos, valores financeiros, URLs livres ou conteúdo da página. Registro referenciado é validado por proprietário no servidor. O snapshot acompanha cada turno, preservando a referência histórica; removê-lo usa `context:null`. Alterar a tela não modifica turnos anteriores. Não significa que o eCoach tenha consultado o aluno ou a cobrança.

## API e modelo de dados

`GET /api/ecoach/conversations?page=1`: `{items,total,page,pageSize:20}`. `GET ?id=UUID`: `{conversation:{id,title,version,updatedAt,turns:[{text,answer,context}]}}`. IDs são referências, não autorização.

`POST /api/ecoach/conversations`, corpo estrito até 8 KiB:

- `{action:'turn',id,version,operationId,text,context}`: cria ou acrescenta turno. Novo ID usa versão zero. `operationId` torna repetição concorrente idempotente; payload diferente com o mesmo ID de operação é rejeitado.
- `{action:'rename',id,version,title}`.
- `{action:'delete',id,version}`.

Sessão e autorização profissional canônicas são verificadas, mutações exigem mesma origem, rate limit (GET 120/min; POST 40/min), propriedade e sessão novamente dentro da transação. Conta é bloqueada transacionalmente para serializar mutações do mesmo proprietário. 401 sem sessão; 403 sem acesso/origem válida; 404 conversa/registro indisponível; 409 versão/limite/repetição incompatível; 400 payload inválido. Respostas privadas `no-store`. Nenhum texto, token ou contexto em logs.

Migrations locais: 036 cria `ecoach_conversations` e `ecoach_turns`, com FK composta de proprietário e cascade de mensagens. 037 cria marcadores de exclusão sem conteúdo, impedindo que repetição atrasada recrie conversa excluída. Marcadores contêm somente IDs/timestamp e acompanham retenção da conta. Grants runtime em `db/operations/runtime-grants.sql`. Staging não recebeu migrations desta etapa.

## Permissões preparadas

Antes da primeira mensagem, GET `/api/ecoach/permissions` retorna `{mode:null|read|create|manage,version}`. Sem escolha, dialog oferece somente leitura, criação e criação/edição; cancelar mantém rascunho. POST `{mode,version}` persiste em `professional_settings.preferences.ecoach`, usando sessão transacional e versão existentes. Configurações → eCoach permite revisar. Preferências são mescladas para preservar notificações e vice-versa. Nenhuma opção concede role admin.

Na prévia, permissões são preparação. Na integração configurada, controlam as ferramentas limitadas descritas abaixo. Cada futura ferramenta deverá revalidar a preferência atual no servidor, assinatura, propriedade, sessão e confirmação apropriada. Exclusões, pagamentos ou mensagens externas não são autorizados por essa preferência.

## Privacidade e retenção

Histórico serve à continuidade solicitada pelo titular, fica acessível somente ao profissional e permanece até exclusão da conversa ou encerramento elegível da conta. Na prévia não há envio a provedor de IA. Não há WebStorage ou dados de cartão. A integração externa exige as autorizações descritas abaixo. Conversas podem conter texto pessoal inserido pelo usuário: evitar dados sensíveis desnecessários; nenhum uso para treinamento foi implementado.

Worker de exclusão profissional remove histórico e marcadores. Exclusão aprovada de aluno remove conversas explicitamente vinculadas ao aluno por contexto; menções livres sem referência estruturada exigem revisão na instrução do pedido, pois não há classificador automático de pessoas no texto. Retenções obrigatórias e bloqueios existentes permanecem. Backups e restauração exigem o processo de privacidade vigente; não se promete eliminação física imediata de backups.

## Evidências e limites

Testes de servidor em banco descartável: histórico, idempotência concorrente, isolamento, origem, schema estrito, conflitos, contexto alheio, paginação, exclusão em cascade, prevenção de recriação e revogação. Regressão de permissões e worker de privacidade executada. Experiência visual e testes finais documentados abaixo ao concluir a validação.

Não comprovam homologação externa: inferência real, comunicação, áudio e anexos seguem sem homologação ou implementação. Preservado NO-GO vigente da 015.

### Evidências da etapa 1

16 testes aprovados em banco descartável, incluindo histórico/permissões e regressão de privacidade; exclusão de aluno explicitamente vinculado remove a conversa e conserva somente marcador opaco. Chrome com profissional sintético validou envio pelo Finder, contexto do Financeiro com período, mensagem seguinte sem contexto, reload, renomear, reabrir e excluir; conta de teste removida ao final. Sem overflow externo em 1440/768/320 px e altura 480 px. Typecheck e lint aprovados. Migrations aplicadas apenas em `formfisik_local_test`. Staging e produção inalterados.

Build final Webpack aprovado: 319 artefatos públicos inspecionados com 14 canários sintéticos, nenhum achado. Testes de navegador, 16 testes de integração/regressão, lint e typecheck aprovados. Sem commit, push ou deploy. Esta é a evidência histórica anterior à etapa 2.


## Etapa 2 — integração configurável e ferramentas limitadas

IMPLEMENTADO localmente, sem provedor escolhido, sem credenciais reais ou chamadas pagas nos testes. A aplicação permanece em prévia por padrão. NÃO HOMOLOGADO com provedores reais; nenhuma alteração em staging/produção. O NO-GO 015 permanece.

### Ativação local

Preencher diretamente em `.env.local` (ignorado pelo Git), nunca no chat:

```dotenv
ECOACH_AI_ENABLED=false
ECOACH_AI_PROVIDER=openai
ECOACH_AI_MODEL=MODELO_COMPATIVEL_ESCOLHIDO
ECOACH_OPENAI_API_KEY=
ECOACH_ANTHROPIC_API_KEY=
ECOACH_AI_DATA_APPROVED=false
ECOACH_AI_DAILY_LIMIT=20
ECOACH_AI_GLOBAL_DAILY_LIMIT=200
```

Escolher `openai` ou `anthropic`, modelo compatível com a API e preencher somente a respectiva chave. Não há modelo padrão, proxy arbitrário ou descoberta automática. Antes de mudar `ECOACH_AI_ENABLED` e `ECOACH_AI_DATA_APPROVED` para `true`, o responsável precisa validar finalidade, termos, retenção, transferência internacional e configuração da conta do fornecedor. Reiniciar o servidor. Depois, cada profissional precisa autorizar o compartilhamento em Configurações → eCoach ou no primeiro envio. Trocar provedor/modelo exige novo consentimento. Desativar a flag bloqueia novas inferências e aplicação de propostas. Não há fallback silencioso para demonstração se a IA estiver ativada e incompleta.

Adaptadores HTTP sem SDK/dependências adicionais, URLs fixas, sem redirecionamentos: [OpenAI Responses](https://developers.openai.com/api/reference/resources/responses/methods/create) com `store:false` e formato JSON; [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create), versão estável `2023-06-01`. Armazenamento e retenção do fornecedor dependem do contrato/conta; `store:false` não comprova retenção zero. Limite de 4.096 tokens de saída por chamada, 128 KiB de resposta, JSON estrito, timeout total de 45 segundos, três rodadas no máximo e quatro turnos anteriores de contexto. Nenhum endpoint aceita URL, chave, prompt de sistema ou resultado de ferramenta do navegador.

### Autorização e ferramentas

IA requer sessão profissional válida, acesso **Pro** ou cortesia equivalente, permissão atual e consentimento para o provedor/modelo. Revalidação em cada rodada, persistência e confirmação. Verificação de assinatura usa estado canônico local sem provocar reconciliação externa dentro da transação; não relaxa critérios de acesso. Read/create/manage nunca equivalem à role admin.

- Leitura: resumo financeiro por período (máximo 367 datas), cobranças paginadas, carteira mínima de alunos, biblioteca e rascunhos/planos próprios. Consultas reutilizam os repositórios existentes; até cinco páginas por consulta. Sem dados clínicos, contato, cartão ou captura de DOM. Financeiro distingue recebimentos, pendências e previsão; a IA pode interpretar incorretamente e precisa de revisão.
- Criação: proposta para **novo rascunho** de treino, até cinco divisões e vinte exercícios; exige IDs reais disponíveis.
- Edição: proposta para rascunho próprio na versão atual; exige `manage`, sem transferir aluno ou tipo. Não ativa nem envia treino.
- Ausentes: ações financeiras, pagamentos, exclusão operacional, comunicação, agenda/anamnese/check-in e uploads reais. Os cartões dessas capacidades permanecem visão futura.

`GET /api/ecoach/permissions` inclui `runtime:{enabled,ready,provider,model}` e `externalConsent`, sem chaves. POST aceita `externalConsent` opcional e versão. Revogar consentimento impede novas inferências/aplicações.

Turnos passam a incluir `mode`, `sources:[{label,href}]` e `proposalId`. Fonte indica os dados consultados; não é garantia de correção da conclusão. Uma proposta exige revisão do conteúdo integral e clique **Confirmar e salvar rascunho**. `GET /api/ecoach/proposals?id=UUID` retorna somente proposta própria e nomes acessíveis. `POST {id,action:apply|reject,confirmed:true}` exige mesma origem, sessão, acesso e rate limit (15 mutações/min). Aplicação revalida aluno, biblioteca, versão, permissão e validade, usa criação/edição canônica e grava o resultado na mesma transação. Repetir confirmação retorna o mesmo resultado; conflito/expiração exige nova proposta. Nenhuma escrita é executada pela resposta do modelo.

Limite diário padrão de vinte solicitações por usuário e duzentas globais, reserva serializada; falhas também contam. Isso limita volume, não substitui orçamento financeiro configurado no fornecedor. Chaves somente no servidor. Operações têm digest e idempotência; concorrência em andamento retorna conflito. Falhas conservam rascunho e não executam ações. Interromper cancela a requisição; se já persistida, recuperar pelo histórico antes de repetir. Não há streaming de rede nesta etapa: revelação de texto é efeito visual após a resposta completa.

### Persistência e privacidade

Migration 038 adiciona `ecoach_ai_requests` (reserva, resultado temporário, contagens de tokens, sem prompt bruto) e `ecoach_proposals`, além de metadados nos turnos. Solicitações/propostas expiram em 24 horas; `npm run db:cleanup` remove fisicamente os expirados e desfaz referência da proposta nos turnos. A rotina deve ser agendada pelo operador antes de ativar externamente; não há scheduler novo. Conversas permanecem até exclusão. Resultados temporários podem conter dados pessoais mínimos. Falhas limpam resultados; logs não contêm texto, dados consultados ou credenciais.

Exclusão de conversa remove propostas por cascade e solicitações relacionadas. Worker de privacidade remove registros da conta e conversas com referência estruturada ao aluno no contexto ou proposta; menções livres ainda exigem revisão. Backups e retenção externa seguem processos/contratos próprios. Sem promessa de eliminação universal automática.

### Homologação restante

Escolher provedor/modelo, validar contrato e retenção, configurar orçamento/limites no fornecedor, agendar limpeza, e executar homologação com dados sintéticos e chamadas reais autorizadas. Não declarar a IA pronta para produção a partir dos mocks. Não houve deploy ou commit nesta entrega.

### Evidências da etapa 2

2026-11-13, ambiente local: **45 testes aprovados**, zero falhas, em PostgreSQL descartável. Incluem adaptadores HTTP mockados, resposta incompleta/volume excessivo, consentimento/Pro, propriedade de contexto, cache/idempotência, criação/edição canônica somente após confirmação, revogação de permissão, proposta expirada/versão desatualizada, limite diário, cancelamento e fluxo completo de turno com fonte/proposta persistidas. Regressões de treinos, planos SaaS, histórico, permissões e privacidade aprovadas. Nenhuma chamada paga ou com credencial real.

Chrome: Finder, persistência/reload, renomear/excluir, contexto do Financeiro e remoção; revisão de proposta em 1440/768/320 px e altura 480 px, sem rolagem externa indevida; teclado/Esc/foco e texto a 200%. A aplicação da proposta no navegador foi bloqueada com IA desativada, sem criar treino; gravação efetiva foi comprovada nos testes de servidor controlados. Migration 038 aplicada exclusivamente em `formfisik_local_test`.

Lint e typecheck aprovados. Build Webpack aprovado com **320 artefatos públicos**, **16 canários sintéticos**, **zero achados** de exposição. Aviso preexistente de `metadataBase` durante geração estática não impediu o build. Sem commit, push ou deploy. Inferência externa, qualidade do modelo e retenção do fornecedor continuam sem homologação.

## Gestão interna — 14/11/2026

Escopo autorizado: OpenAI como provedor escolhido; gestão interna de treinos, modelos de anamnese e agenda com proposta, revisão e confirmação. IMPLEMENTADO localmente, inferência real NÃO HOMOLOGADA. Não cria um segundo motor de domínio, novas tabelas ou dependências. Reutiliza as propostas JSONB da 038 e os serviços canônicos. OpenAI é o padrão quando `ECOACH_AI_PROVIDER` está vazio; configurar explicitamente `openai` é recomendado. A flag continua desativada. Faltam localmente `ECOACH_AI_MODEL` e `ECOACH_OPENAI_API_KEY`; preencher no `.env.local`, nunca enviar no chat. Não foi escolhido um modelo automaticamente nem realizadas chamadas pagas.

### Contratos e execução

Novas consultas na mesma decisão estruturada: `intake_forms {page}`, `intake_form {id}`, `agenda {from,to,page,q}`, `agenda_settings {}`, `agenda_types {page,q}`, `appointment {id}`. Paginação de vinte itens e no máximo cinco páginas por consulta; agenda limitada ao intervalo canônico de até 367 datas. DTO de lista de agenda contém apenas identificação, versão, natureza, título permitido, nome do aluno, início/fim, situação e fuso. Detalhe solicitado inclui os campos necessários à remarcação, sem histórico de comparecimento/execuções. Não consulta respostas de anamneses, dados clínicos de avaliação, documentos ou conversas externas. Contexto da Agenda publica somente período, visão e situação; nenhuma captura de DOM ou notas privadas automática. Relógio do pedido inclui data atual no fuso cadastrado, fuso e instante UTC.

Novas propostas, com schema estrito reutilizado:

- `create_intake {definition}` e `edit_intake {id,revision,definition}`: `formSchema` canônico, até 12 seções/100 perguntas, tipos/alternativas/condições e IDs validados. Salva **rascunho** na finalidade `intake`; não publica, gera convite ou envia mensagem. Edição exige proprietário, finalidade, versão vigente e modelo não arquivado. `saveFormInTransaction` é o mesmo escritor usado pelo fluxo manual. Publicações anteriores não são alteradas.
- `create_appointment {fields}` e `edit_appointment {id,version,reason,fields}`: `appointmentFields` canônico, atendimentos, compromissos pessoais e bloqueios, até doze ocorrências por proposta, início futuro. Obtém aluno/tipo próprios, respeita disponibilidade, conflitos, fuso e mudanças de relógio. Duração de atendimento é normalizada pela definição real do tipo. Remarcação afeta somente **uma ocorrência**, normaliza recorrência para `once` e exige justificativa. Não cancela reservas nem registra comparecimento.

O servidor calcula `previewDigest` antes de persistir a proposta, substituindo qualquer valor sugerido pelo modelo. A confirmação usa a mesma prévia e o escritor `executeAgenda` do formulário manual. Mudança de disponibilidade, versão ou ocupação invalida a confirmação; o usuário solicita outra proposta. Escritor e estado `applied/result_id` são gravados na mesma transação, com locks, idempotência e eventos canônicos. Nenhum sucesso é registrado se o domínio falhar. Os wrappers originais continuam gerenciando transações para o uso manual; o eCoach passa a transação existente, sem duplicar regras.

O painel compartilhado de revisão mostra o domínio correto: treino; seções/perguntas, opções, obrigatoriedade, limites e condições de anamnese; natureza, aluno, data/horário/fuso, duração, local, recorrência e motivo do agendamento. Campos completos permanecem sob demanda. Resultado abre o treino, modelo de anamnese (`/anamneses?form=UUID`) ou ocorrência na agenda. O link não substitui autorização no endpoint privado. Falha de carregamento/aplicação mantém o painel e informa o erro.

### Permissões, privacidade e limites

`read` consulta; `create` também prepara/cria novos registros após confirmação; `manage` permite adicionalmente editar rascunhos/modelos e remarcar uma ocorrência. Sessão, acesso Pro/cortesia, propriedade, consentimento e permissão atual são revalidados na confirmação. Não concede role admin. Consentimento externo passa à versão `v2`: usuários do provedor/modelo anterior precisam autorizar novamente o escopo ampliado. Não autoriza treinamento do fornecedor nem comprova retenção zero.

Dados de agenda (inclusive notas/local apenas no detalhe solicitado) e modelos de formulário podem conter informações pessoais inseridas pelo profissional; enviar somente o necessário à finalidade solicitada e revisar antes de confirmar. Respostas clínicas de alunos não integram esta entrega. Retenção/limpeza de solicitações, propostas e conversas continuam as da 038; worker já reconhece o vínculo estruturado `action.fields.studentId` também em agendamentos. Menções livres exigem revisão manual no atendimento a direitos.

Motor limitado a **seis rodadas** por solicitação, mantendo timeout total de 45 segundos, quatro turnos anteriores, 60 mil caracteres de contexto e limites diários existentes. JSON mode com validação Zod estrita no servidor permanece o protocolo delimitado; não se confia na estrutura retornada pelo modelo. A [documentação oficial da OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) distingue JSON válido de aderência ao schema; rejeitamos respostas incompatíveis. Nenhuma execução é delegada diretamente ao modelo.

Fora do escopo: publicação/envio de anamnese, alteração de disponibilidade semanal, cancelamento ou presença, escrita financeira, gestão dos demais módulos, atendimento automático e canais externos. Esses recursos exigem ferramentas e homologação próprias; não estão implicitamente habilitados pela API.

### Evidências da gestão interna

14/11/2026, ambiente local: **101 testes aprovados**, zero falhas, em PostgreSQL descartável. Regressões completas selecionadas de agenda/movimentação, anamneses, treinos, planos SaaS, privacidade e eCoach. Casos novos verificam rascunho sem publicação/convite, edição com revision, proprietário alheio, confirmação idempotente/concorrente, duração canônica de sessão, bloqueio e conflito, remarcação, agenda alterada após prévia, reservas concorrentes, início no passado, aluno alheio, revogação de permissão e limite de seis rodadas. OpenAI simulada; nenhum consumo pago ou inferência real.

Chrome local: três revisões (treino, anamnese e agenda), quatro dimensões 1440/768/320 px e altura 480 px, teclado/foco/Esc, texto a 200% e link para o formulário existente com prévia recolhível. Dados sintéticos removidos ao final. O primeiro roteiro precisou abrir explicitamente a seção de prévia antes de verificar a pergunta; o roteiro corrigido passou. Lint, typecheck e build Webpack aprovados; auditoria de **318 artefatos públicos**, **16 canários sintéticos**, **zero achados**. O aviso preexistente de metadataBase não bloqueou o build.

Sem migration ou dependência nova; nenhuma alteração em staging/produção, commit ou deploy. Pendências de homologação real: modelo, chave local, aprovação do tratamento pelo responsável, consentimento v2 do profissional, orçamento no fornecedor e operação de limpeza da 038. Integração externa não foi declarada homologada; NO-GO015 preservado.

### Correção da primeira conexão real — 14/11/2026

Diagnóstico sanitizado com requisições sintéticas: HTTP400 no campo `input`, exigência da instrução JSON na entrada. Adaptador Responses corrigido para enviar o prompt de sistema como mensagem `developer` em `input` (sem duplicar o prompt em `instructions`), preservando `store:false`, validação e limites. Teste de contrato verifica esse requisito.

Após a correção, o serviço retornou HTTP429 com `error.type=insufficient_quota` e sem código correspondente. Integração real BLOQUEADA pela cota/faturamento da conta, não comprovada funcionalmente. Não trocar chave ou modelo para tentar contornar cota; responsável deve conferir Billing/Limits do projeto. Nenhum conteúdo de agenda real foi enviado. Mensagens do adaptador passam a distinguir autenticação, permissão, modelo, formato, cota e limite temporário. Corpo de erro limitado a 8KiB, nunca ecoado ou registrado; somente mensagens fixas saem do servidor. Testes incluem corpo com segredo sintético e cota informada em `type` sem `code`. Testes da prévia agora fixam a flag desativada, independentes da ativação real em `.env.local`.

Validação da correção: 47 testes de regressão/controlados aprovados em banco descartável; lint e typecheck aprovados. Build Webpack aprovado com 319 artefatos públicos, 16 canários e zero achados. Solicitação real sintética confirmou HTTP429/insufficient_quota após a correção; consulta de agenda/inferência completa não homologadas enquanto o responsável não regularizar faturamento/cota. Sem deploy ou alteração de credenciais.

## Compositor multimodal — 14/11/2026, local

IMPLEMENTADO localmente: o mesmo compositor no eCoach e no Finder usa a seta para enviar e o quadrado para interromper a requisição/animação. Interromper uma requisição não desfaz uma mensagem já persistida pelo servidor; propostas continuam sujeitas à confirmação. O histórico pode recuperar uma resposta que já tenha terminado no servidor.

Menu único de anexo com imagem (JPG/PNG/WebP, 2 MiB) e documento PDF (8 MiB, 20 páginas). Um arquivo por leitura. Seleção ou drop na área do chat exige permissão/consentimento e faz leitura temporária pela IA, retornando texto ao rascunho para revisão; não envia mensagem automaticamente. Não existe biblioteca de arquivos do chat nem persistência dos bytes. Conteúdo extenso é recusado ou resumido explicitamente pelo modelo, sem truncamento silencioso no cliente. Original não fica disponível no histórico: somente o texto que o profissional decidir enviar. Fotos são reencodificadas e perdem metadados; parser de imagem/PDF é compartilhado com Produtos, mantendo os limites próprios de cada domínio. Sem nova dependência ou migration.

Microfone via MediaRecorder: onda desenhada a partir do AnalyserNode, X descarta, pausa termina a captura e transcreve para revisão, seta transcreve e envia como mensagem. Limite de captura no cliente: 120 segundos; servidor limita áudio a 4 MiB e valida cabeçalho WebM/MP4. Captura encerra tracks/AudioContext/timers ao cancelar ou desmontar. Em fechar/expandir Finder, gravação em andamento é descartada; texto já transcrito permanece no estado compartilhado. Navegador exige HTTPS/localhost e autorização explícita de microfone. Permissions-Policy permite somente microphone=(self), mantendo câmera e demais sensores bloqueados.

`POST /api/ecoach/media`: bytes binários, Content-Type allowlist, sessão opaca, origem exata, profissional Pro/cortesia equivalente e consentimento atual revalidados antes/depois da chamada externa. Limites duráveis: 20 leituras por profissional e 200 globais/dia, contando tentativas; timeout externo 45 s, resposta até 32 KiB e texto até 1.800 caracteres, rascunho total até 2.000. Sem URLs arbitrárias, logs de arquivos, tokens ou transcrição. Erros sanitizados e private/no-store. Cancelar leitura aborta fetch; pode existir processamento já iniciado no provedor.

OpenAI Responses com `store:false` para leitura de imagem/PDF usando modelo configurado; áudio utiliza `/v1/audio/transcriptions`, português, JSON, `ECOACH_TRANSCRIPTION_MODEL` (padrão gpt-4o-mini-transcribe). Alterar modelo de transcrição renova fingerprint de consentimento; versão v3 inclui finalidade de áudio e arquivos. Conteúdo é enviado ao provedor externo e sujeito à política/retenção dele, sem promessa de retenção zero no provedor. Documentação oficial consultada: [transcrição](https://developers.openai.com/api/docs/guides/speech-to-text), [arquivos](https://developers.openai.com/api/docs/guides/file-inputs). O modelo de transcrição padrão consta em descontinuação para 26/02/2027; configurar substituto validado antes dessa data.

Validação: testes de backend com provedores controlados (nenhuma chamada paga); Chrome com microfone sintético para captura/onda/cancelar/pausar, rascunho sem envio automático, menu, botão stop, drop e Finder. Breakpoints 1440/768/320 e altura 480. Conta OpenAI permanece bloqueada por insufficient_quota; inferência/transcrição reais ainda não homologadas. Sem deploy e sem alteração em staging/produção; NO-GO015 preservado.

Resultados tardios de mídia são descartados se a conversa foi trocada/reiniciada durante a leitura; não podem inserir texto no novo rascunho. O navegador também aborta leituras ao desmontar o chat. Anexos não são entradas de ferramentas: a leitura só produz texto, sem executar instruções contidas em arquivos.

## Atendimento assistido — etapa 2, 14/11/2026

A Central de Comunicação agora implementa caixa persistente de alunos/leads, sugestão com o adaptador existente do eCoach, revisão/aprovação, regras autorizadas de rascunho automático, pausa/revogação e recuperação de falhas. Consentimento próprio de atendimento + autorização por conversa; não concede ferramentas internas ao contato externo. [Contrato e limites completos](atendimento-assistido.md). Transporte WhatsApp/Instagram/e-mail permanece NÃO IMPLEMENTADO, conforme ausência de canais preparados informada pelo responsável. Portanto a etapa 2 é funcional localmente para preparação/revisão; **não está concluída como atendimento externo ou envio autônomo**. Não declarar que a integração de IA sozinha habilita canais. Estudo aprofundado de guardrails/contexto será posterior, sem retirar os controles existentes.

## Restrição de escopo e consumo

A geração, leitura de mídia, cache e aplicação de propostas seguem a [política de escopo e abuso](../seguranca/ecoach-escopo-e-abuso.md). Migration 040 registra recusas locais como `policy`. Pedidos mistos e ataques conhecidos são filtrados antes da chamada; as ferramentas são limitadas à intenção e as saídas são validadas. Cota persistente de chamadas é compartilhada com atendimento e mídia. PDFs passam por extração local de texto selecionável; áudio/imagem têm custo inicial de leitura. Implementação local, sem habilitar alunos e sem homologação real da OpenAI.

## Histórico lateral na tela completa

“Conversas” abre e fecha um painel à esquerda que comprime o chat, mantendo cabeçalho e compositor acessíveis no shell compartilhado. A lista, paginação de 20 itens, renomeação, exclusão e contratos privados existentes são reutilizados. Selecionar conversa mantém o painel lateral aberto; clicar no chat não o fecha. O Finder mantém a apresentação compacta. Alteração visual local, sem migration, novo endpoint ou deploy.

O cabeçalho da tela completa oferece “Ajustes”, reutilizando o botão compartilhado e navegando para `/configuracoes?section=ecoach`, diretamente nas permissões existentes da IA.

Refinamento do painel: altura integral a partir da topbar, largura desktop de 18rem como a sidebar do app e tipografia ampliada. O cabeçalho eCoach/IA também participa da coluna deslocada. Mobile reduz a largura proporcionalmente, sem overlay ou novo scroll global.

## Inventário temporário de anexos

O compositor oferece “Ver anexos do chat”. Imagem/PDF aceito após autorização abre automaticamente o card flutuante à direita. A lista reutiliza o fluxo de leitura existente e informa nome (até 180 caracteres), tipo, bytes e estado reading/ready/failed. “Leitura concluída” confirma a extração, não envio da mensagem. Falha/cancelamento não produz falso sucesso. X fecha; interação fora não fecha. Não inclui áudio ditado, que continua sendo transcrição.

Metadados ficam apenas na memória do provider autenticado, compartilhados entre tela completa/Finder e separados por conversa; o rascunho é associado à conversa no primeiro envio bem-sucedido. Máximo de 20 arquivos por conversa nesta sessão e 200 inventários recentes, incluindo o rascunho; o próximo arquivo acima do limite é recusado com aviso. Nova conversa limpa anexos do rascunho anterior, exclusão limpa a lista correspondente; recarregar/desmontar o shell encerra a lista. Conversas reabertas após reload não recuperam arquivos, pois arquivos originais não são armazenados. O card deixa essa limitação visível.

Nenhum binário, URL privada, texto extraído ou metadado de anexo foi acrescentado ao armazenamento do navegador, payload de turnos ou banco. Sem novos endpoints/migrations/dependências. Ler arquivo continua exigindo autorização e controles de mídia no servidor; a lista não concede acesso a download nem representa repositório de documentos. Persistência privada de arquivos é capacidade futura, não implementada por este refinamento.

Validação local deste card: ESLint/TypeScript aprovados; navegador com leituras simuladas verificou abertura automática, reabertura pelo menu, fechamento e retorno de foco, metadados e falha, compartilhamento com Finder, limpeza em nova conversa, viewport 1440/768/320 (altura 480) e texto 200%. Nenhuma chamada real ao provedor, armazenamento de arquivo ou deploy foi realizado. Captura de verificação local: `/tmp/ecoach-attachments.png`.
