# ADR024 — Check-ins e feedbacks com finalidade distinta

Marco de produto022; decisão implementada e validada em ambiente local controlado (02/11/2026), conforme [relatório](../engenharia/entrega-022.md). A sequência de migrations não é a numeração dos marcos: migration023_student_checkins.sql sucede022_exercise_media.sql entregue pelo Marco023. FormFisik independente fundada por Brandon Louis, sem presunção de formalização jurídica. Sem deploy, serviços externos ou dados reais.

## Auditoria e preservação

AGENTS, documentação institucional/índice/inventário/roadmap/Personal1.0/arquitetura/Design System, formulários017, carteira008, CRM018, contratos019, agenda021, prescrições e avaliações/fotos foram inspecionados antes da implementação; planejamento e pesquisa oficial anteriores no mesmo chat são a referência funcional. Fechamento023 confirmado por relatório/verification-summary (378 testes históricos), Chat2 ocioso e observação de561 arquivos sem mudança concorrente. Baseline de hashes e status em test-results/022 antes da primeira mudança. Isso não atribui à022 todo o worktree não commitado de001–023 nem renova automaticamente sua homologação.

## Reutilização e exceções justificadas

Reutilizar formSchema, condições/validateAnswers/applicableAnswers, FormBuilder, QuestionField, AnswerReview e PublicIntake parametrizado para check-in. Nenhum segundo motor de expressões, renderizador ou biblioteca. FormBuilder recebe callback opcional de alteração para proteger navegação local; comportamento017 preservado. PublicIntake muda endpoint/finalidade e inclui bloco de feedback tipado somente no contexto de prescrição; cadastro017 permanece específico e não é aceito pelo022.

Catálogo intake_forms/intake_versions permanece único: coluna usage imutável intake/checkin, default intake para registros anteriores e filtros explícitos nos serviços compartilhados. Convites017 recusam versões checkin; requests/submissions017 não recebem check-ins, preservando fatos CRM e evidência019. Catálogo publicado e respostas mantêm snapshots. Criar uso novo por cópia explícita; não converter finalidade de um modelo com histórico.

Token/digest/validação de capacidade extraídos para src/server/forms/capability.ts e reutilizados pelo017/022. O lifecycle de convites022 precisa persistência própria: período, renovação de link, base da correção e confirmação idempotente não pertencem ao onboarding017. Conta e carteira não são duplicadas. Página pública mantém fragmento removido, POST, memória apenas, ausência de login e proibição de histórico.

Sete entidades próprias: atribuição periódica, ocorrência limitada, convite, submissão imutável, devolutiva imutável, evento mínimo e resultado idempotente. Justificativa: uma ocorrência pode ter vários convites e correções, mas só uma submissão por convite; trocar link não troca o ciclo nem o denominador. Não criar tabelas de notificações, wearable, organização, outras modalidades ou motor geral especulativo.

Reutilizados ProfessionalShell/NavigationMemory/Feedback/Pagination/StudentsPicker/useUnsavedChanges, sessões opacas, entitlement, Origin/rate/body/headers, PostgreSQL/transações, owner lock18018, snapshots010 e worker/ledger016. seriesGeometry012 admite opção explícita de valores negativos para escala customizada, mantendo default dos gráficos físicos. Sem dependência nova.

## Ciclos e estado

Atribuição inicia ativa; pausar/encerrar cancela somente ocorrências futuras ainda não abertas. Preserva abertas/respondidas; nova atribuição é explícita. Sem retomada ou alteração silenciosa de série nesta entrega. Até24 períodos e12 meses, término por quantidade. Semanal7dias, quinzenal14dias, mensal civil com início dia1; avulso usa um período de7dias. Fuso IANA por atribuição, instantes inequívocos de abertura/prazo/encerramento via primitivas021, data civil do período. Prazos1..14dias e janela tardia0..14dias após o prazo. Prévia obrigatória e atômica; sem worker ou dependência de visita para materializar fatos: série limitada materializada na criação.

Ocorrência waiting/received/reviewing/reviewed/canceled. Vencida é projeção do relógio, não presença ou resposta automática. Convite inicial somente após abertura e antes de encerramento; prazo de até7dias limitado pela janela. Reemissão revoga anteriores pendentes e incrementa versão. Token só nesta resposta; falha exige reemissão explícita, sem armazenar token bruto no resultado idempotente. Convite de correção exige resposta anterior e motivo, autoriza novo preenchimento em branco por até7dias inclusive após encerramento original; não dá acesso ao conteúdo anterior.

Correção fixa base_revision. Owner lock e bloqueio de ocorrência/convite, versão e consumo com relógioSQL impedem reutilização e duas correções concorrentes. Original e revisões anteriores permanecem imutáveis; nova correção retorna ao recebimento/revisão pendente. Revisão/devolutiva refere submissão exata e é append-only; nova devolutiva não modifica anterior. Compartilhamento manual é declaração, não evidência de entrega/leitura. Sem histórico ou devolutiva pública pelo token consumido.

## Prescrição e indicadores

Feedback opcional refere ficha individual, aluno, versão ativa histórica e divisão existente naquela revisão. Não basta planoUUID ou revisão corrente. Mudança posterior da prescrição preserva a referência histórica; não retorna ficha inteira, notas ou vídeos pela capacidade pública. Declaração de realizado/parcial/não realizado/não informado é relato; esforço0..10 e dificuldade1..5 são escalas descritivas com âncoras, sem instrumento clínico validado presumido. Meta acordada por período é explícita/opcional, independente de divisões, sessions019 ou agenda021.

Sem escrever treino, agenda, execução019 ou financeiro020. CRM só agrega atrasados e aguardando revisão; perfil mostra resumo mínimo e acesso contextual. Gráficos/comparação se restringem à mesma versão publicada e pergunta, sem juntar significados apenas por título/UUID. Respostas ausentes não viram zero; múltiplas revisões contam uma vez, usando a atual. Pontualidade preserva instante da primeira submissão. Taxas excluem canceladas e consideram prazos encerrados; canceladas são apresentadas separadamente. Adesão é declarada e calculável somente com meta e quantidade informadas.

## Segurança e evolução

Capacidade256bits/SHA256, uso único, revogável, sem cadastro/conta/histórico. Retry da mesma tentativa e mesmo digest devolve apenas received:true enquanto ainda elegível; abrir token consumido nunca retorna conteúdo. Sessão/entitlement proprietário em APIs profissionais. Limites/payload/Origin e consulta autorizada não dependem do frontend. Eventos não copiam respostas, mas preservam motivos operacionais de correção/cancelamento; logs apenas códigos estáticos. Sem credenciais em storage ou analytics.

Worker016 elimina022 antes das prescrições/versões de formulário/aluno, invalida idempotência e preserva outros titulares; restore reaplica ledger antes de tráfego. Políticas de finalidade, retenção, base, menores e canal dependem da governança vigente; não inventar prazo jurídico ou declarar LGPD homologada. Futuro Connect usa os mesmos serviços de domínio com identidade legítima;024 poderá entregar lembretes/devolutivas com preferências e comprovantes próprios. Nenhum canal externo ou wearable ativo.
