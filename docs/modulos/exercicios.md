# Biblioteca de exercícios

A FormFisik é uma empresa independente, fundada por Brandon Louis. Este módulo não pressupõe constituição jurídica formalizada, infraestrutura ou propriedade intelectual compartilhadas com outra empresa.

## Comportamento e acesso

`/exercicios` reúne catálogo oficial publicado e exercícios particulares do profissional autenticado. Exige sessão opaca válida, e-mail confirmado, perfil profissional e autorização comercial canônica no servidor. Mantém as regras de assinatura das entregas 005/006; ausência de credenciais Stripe não libera acesso. `/exercicios/moderacao` exige capacidade administrativa persistente específica e sessão confirmada, independentemente de assinatura.

A biblioteca busca nomes e aliases sem distinção de caixa/acentos (NFKD, remoção de marcas, espaços normalizados). Filtra categoria, músculos principais/secundários e equipamento; ordena por nome crescente/decrescente ou criação, com desempate por UUID e páginas SQL de 20. `%`, `_` e barras são literais. Os estados oficiais e particulares ficam identificados por texto. Sem resultados, as ações permanentes permitem criar particular ou solicitar inclusão. Não há imagens, vídeos, execução ou prescrição.

Particulares: criar, consultar, editar, arquivar, reativar. Propriedade vem exclusivamente da sessão. Campos: nome 2–160, categoria, 1–5 músculos principais, até 17 secundários, equipamento/nível opcionais, até 20 instruções de 2000 caracteres e até 10 aliases. Corpo HTTP total limitado a 8 KiB; limites individuais não autorizam exceder esse total. Não há exclusão destrutiva nem persistência de dados em localStorage/sessionStorage.

## Solicitação e moderação

O envio registra um snapshot da proposta, autorização explícita de compartilhamento e, opcionalmente, referência a um particular próprio. A consulta de possíveis correspondências ocorre antes do envio; similaridade textual não implica equivalência técnica e não bloqueia o pedido. Se a consulta estiver indisponível, a interface informa e permite envio para revisão humana. Rejeitados podem gerar nova proposta vinculada à anterior; o histórico anterior permanece.

Estados: `pending`, `approved`, `linked_existing`, `rejected`. Somente o solicitante acompanha seu pedido; moderadores autorizados veem a fila, proposta e identificação do solicitante. Aprovação cria um novo exercício oficial, com instruções obrigatórias revisadas, origem na contribuição e responsável. Não transforma nem altera o particular original. Contribuição não recebe licença CC0 automaticamente: a declaração autoriza análise/publicação na plataforma; política jurídica mais ampla de contribuição deve ser definida antes da abertura comercial.

Vínculo aponta para oficial publicado existente. Rejeição exige motivo. Toda decisão exige justificativa de 10–1000 caracteres, versão corrente, permissão ativa e autor diferente do solicitante. Nomes oficiais iguais após normalização exigem confirmação explícita de variação técnica distinta e justificativa. Publicações concorrentes são serializadas; não há fusão automática. O histórico registra ator, versão, data e operação.

## Modelo PostgreSQL

Migration aditiva `008_exercise_library.sql`:

| Tabela | Finalidade |
| --- | --- |
| exercise_datasets | Origem fixada, licença, revisão, checksum e auditoria |
| exercise_entries | Entidade canônica UUID, escopo/proprietário, campos, aliases, estado, versão, origem, flags, `variation_of` opcional |
| exercise_versions | Snapshot por `(exercise_id,version)`, preservado pelo fluxo de aplicação |
| exercise_events | Operação/ator/versão; referência ao snapshot |
| exercise_creation_keys | Idempotência durável de criação particular por proprietário/chave/digest |
| exercise_requests | Proposta, origem particular opcional, reenvio, decisão e responsável |
| exercise_request_events | Submissão e decisão, ator e versão |
| exercise_moderators | Capacidade ativa/revogada, motivo, concessão controlada |
| exercise_moderator_events | Registro operacional de concessão/revogação |

Edição e estado usam bloqueio de linha e versão otimista. Chaves de criação UUID e digest protegem repetições concorrentes; mesma chave com outro conteúdo retorna conflito. FK composta assegura que origem particular pertença ao solicitante e destino de decisão seja oficial. CHECK proíbe decisão pelo próprio solicitante. Importação usa lock próprio e identidade `(source_dataset,source_id)`. IDs e revisões são estáveis; referência futura em treinos deverá usar FK à entidade e, quando necessário, ao snapshot. Não existe tabela de treino nesta entrega.

## Contratos HTTP

Prefixo `/api/exercises`. Todos os retornos são JSON privados/no-store, Vary Cookie, no-referrer. Sucesso em consulta/mutação: 200; criação/envio: 201. Erros: 400 validação, 401 sessão, 403 autorização/origem, 404 recurso invisível/inexistente, 409 versão/chave/seleção indisponível ou possível duplicata, 429 abuso, 503 dependência. Nunca expor erro SQL, segredos ou dados particulares alheios.

| Método / sufixo | Contrato |
| --- | --- |
| GET `/` | `q,scope=all/official/mine,state=active/archived/all,category,muscle,equipment,sort=name_asc/name_desc/newest,page`; retorno `{items,total,page,pages,pageSize}` |
| POST `/` | campos + `creationKey`; retorno `{exercise}` |
| GET `/:id` | `{exercise}` com metadados e versão |
| PATCH `/:id` | campos completos + `version`; `{exercise}` |
| POST `/:id/status` | `{state:active/archived,version}`; `{exercise}` |
| POST `/selection` | `{ids:UUID[1..50]}`; remove repetições, preserva ordem, retorna `{items}` atuais; falha integral se algum estiver invisível/arquivado |
| GET `/requests` | `state=all/pending/approved/linked_existing/rejected,page`; próprias `{items,total,page,pages}` |
| POST `/requests` | campos + `creationKey,publicationPermission:true`, opcionais `privateExerciseId,resubmissionOf`; `{request}` |
| GET `/requests/:id` | própria `{request}` |
| GET `/capability` | `{moderator:boolean}` após acesso profissional; não concede permissão |
| GET `/moderation` | fila, mesmos filtros de estado/página, capacidade administrativa obrigatória |
| GET `/moderation/:id` | detalhe administrativo |
| GET `/moderation/catalog` | busca somente oficiais publicados; capacidade obrigatória, sem dependência de assinatura |
| POST `/moderation/:id` | `{action,version,reason}` + `fields,confirmDistinct` em approve, `exerciseId` em link; rejeição action reject |

Schemas estritos rejeitam proprietário, escopo, permissões ou campos desconhecidos enviados pelo cliente. UUID nunca substitui autorização. CSRF exige Origin da aplicação e ausência de cross-site em todas as mutações, incluindo confirmação de seleção. Rate limits duráveis por operação/identidade/minuto: submissão/revisão 20, outras mutações 40, leituras 120. SQL parametrizado e whitelist de ordenação; sem fragmentos SQL derivados de entrada. Import/provisionamento não são endpoints.

## Componentes e seleção reutilizável

`ExerciseBrowser({onOpen,selected?,onToggle?,officialOnly?,moderation?})`: consulta paginada, filtros e estados; `moderation` seleciona endpoint administrativo, sem conceder privilégio. `ExerciseDetails` renderiza campos textuais sem HTML injetado. `ExerciseForm` reutiliza schemas e consultas de correspondências. Reutilizados shell, navegação, aviso profissional, monitor de acesso e componentes/tokens existentes.

`ExerciseSelector({open,onClose,onConfirm,initial?})`: dialog nativo, `initial:Exercise[]`, callback `onConfirm(exercises:Exercise[])`. Mantém Map por ID durante páginas/filtros, sem duplicação; limite 50, remoção individual e contador. A confirmação consulta `/selection`, retorna IDs, versões e metadados correntes somente após autorização integral. Cancelar/fechar não confirma. Escape, foco inicial e restauração são do dialog nativo; seleção não é armazenada em browser storage. Biblioteca apresenta o resultado confirmado e permite removê-lo; não persiste uma ficha fictícia. O consumidor deve revalidar no servidor ao salvar uma futura prescrição: resultado do seletor não é concessão permanente de acesso.

## Operação e limites

Ver [catálogo/importação](../catalogo/exercicios.md), [provisionamento](../operacao/moderacao-exercicios.md), [ADR-009](../arquitetura/ADR-009-exercicios.md) e [entrega 009](../engenharia/entrega-009.md). Busca usa índices básicos/filtros SQL e timeout; corpus atual não exige extensão ou serviço especializado. A política de evolução de traduções exige revisão explícita e nova versão; reimportação não sobrescreve definições. Não existe edição global genérica nesta entrega. Homologação técnica profissional e definição jurídica da política de contribuições permanecem pré-requisitos da abertura comercial.

## Integração 010

O editor de [treinos](treinos.md) reutiliza ExerciseSelector e grava referências por ID/revisão em `workout_exercise_references`, com FK para `exercise_versions`. A confirmação do seletor continua sendo uma consulta, não permissão permanente: o servidor da prescrição revalida proprietário, disponibilidade e revisão. O catálogo não é convertido em texto livre nem atualizado silenciosamente nas fichas.

## Minimização 015

Listagem retorna id, name, scope, state, version, category, primaryMuscles e equipment. Detalhe/seleção confirmada continuam autorizados e completos. Solicitações em lista retornam id, state, version, decisionReason, createdAt, own e proposal.name; requesterName somente na moderação. Abrir/reenviar consulta detalhe. Candidato oficial administrativo pode ser obtido por `GET /api/exercises/moderation/catalog?id=UUID`, sob o mesmo grant; não retorna particulares.

## Demonstrações —023

O cadastro de exercício permanece canônico. Detalhe e editor de treinos oferecem [demonstrações](demonstracoes.md):YouTube, upload e oficiais, com preferências privadas, múltiplos vídeos e ordem. As afirmações anteriores “sem vídeos” registram o escopo original009. LicençasJSON não concedem licença de mídia.

## Importação026

CSV026 cria somente exercícios particulares pelo writer009, com enums/versões/eventos; não publica no catálogo oficial nem concede moderação. [Política/formatos](importacao.md), [API](../engenharia/api-importacao.md) e [relatório](../engenharia/entrega-026.md). Estado GO local controlado; produção NO-GO. As limitações anteriores descrevem o escopo histórico da entrega original.

## Biblioteca visual e integração com topbar — 05/11/2026

Cards/lista, abas de origem e filtros SQL reutilizados. Nenhuma fotografia acrescentada: DTO resumido não tem imagem canônica. Busca global oferece até5 resultados de cada primeira página de alunos, treinos e exercícios; consulta apenas ao submeter, mínimo2/máximo120caracteres, cancela consulta anterior/fechamento. Não é pesquisa integral de conteúdo: alunos por nome, treinos por título e exercícios por nome/alias. APIs existentes mantêm autorização e isolamento. Resultados de exercício encaminham à biblioteca filtrada via q, sem expor instruções no resultado. Nenhum endpoint ou banco novo.

Sininho reutiliza Notifications da central024, com leitura explícita e paginação existente, sem notificações fictícias ou polling. Menu da conta reutiliza LogoutButton e revogação de sessão existente. Configurações reúne aparência/conta/assinatura/recuperação. Preferência formfisik:theme em localStorage armazena somente dark/light; nunca credenciais ou dados pessoais. Inicialização padrão noturna e restauração após hidratação podem gerar breve troca de tema no carregamento. Light mode converte tokens das telas recentemente refinadas; módulos anteriores continuam com estilos próprios e necessitam revisão visual individual.

Validação local:43/43 testes de exercícios e comunicação aprovados em banco auxiliar isolado. TypeScript e ESLint dos arquivos TS alterados aprovados. Chrome/Axe biblioteca em1920/1440/768/320 nos dois temas sem overflow horizontal ou violações WCAG2A/AA/2.1AA detectadas; busca real, menu, notificações, Escape e persistência de tema verificados. Dashboard/Alunos/Treinos também auditados em modo claro. Evidências em test-results/local/topbar-verification.json e exercises-{tema}-{largura}.png. Sem novo build de produção ou deploy nesta alteração.
