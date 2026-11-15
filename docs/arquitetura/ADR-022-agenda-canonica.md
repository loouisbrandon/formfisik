# ADR 022 — Agenda profissional canônica (Marco 021)

Estado: implementado e verificado localmente, GO controlado conforme relatório021. FormFisik independente fundada por Brandon Louis; não se presume constituição jurídica formalizada. Não levantar NO-GO015–020 nem habilitar Connect externo.

## Auditoria e reutilização

Não existia agenda de atendimento. O calendário013 agrega avaliações/fotos e tem datas civis/semântica diferentes; não será convertido em sistema de reservas. Reutilizar ProfessionalShell, NavigationMemory, Feedback/Pagination, StudentsPicker da carteira008, proteção de alterações, action/control, sessão opaca, entitlement, Origin/rate/JSON, PostgreSQL/migrador, lock18018/CRM e auditoria/execuções019. Nenhuma dependência, framework de agenda ou abstração multiesporte nova. Busca de equivalentes em src/modules/progress-photos/calendar.tsx, workouts/students-picker.tsx, shared/use-unsaved-changes.ts, consultancies e finance.

Entidades próprias justificadas: configuração semanal/fuso, exceções por data, tipos reutilizáveis, série limitada, ocorrência materializada, vínculo de execução contratual, eventos mínimos e idempotência. Bloqueio e compromisso pessoal são naturezas da ocorrência, evitando outra estrutura de ocupação. Não armazenar credenciais ou criar tabelas de sincronização externa sem consumidor real.

## Três fases internas, uma entrega

021-A: configuração/disponibilidade/exceções/tipos e reservas. 021-B: recorrência/comparecimento/indicadores. 021-C: alunos/CRM/019/eliminação, regressões, Chrome e homologação local. Não há aceite parcial apenas por finalizar uma fase.

## Disponibilidade e conflitos

Semana com sete dias e até oito faixas não sobrepostas por dia. Faixas são minutos locais, fim exclusivo; noite deve ser dividida nos dias. Exceção substitui integralmente a semana na data; lista vazia torna o dia indisponível. Férias/bloqueios usam início/fim explícitos e duração máxima366 dias, sem recorrência. Compromisso pessoal não possui aluno ou vínculo contratual. Atendimentos e compromissos pessoais devem caber na disponibilidade, incluindo intervalos; bloqueios não precisam caber, mas não podem sobrepor ocupações existentes. Não existe override de conflito.

Cada tipo fixa duração5..720min e preparação/depois0..240min; ocorrência preserva snapshot/instantes. Editar/arquivar tipo não muda reservas. Alterar semana/fuso/exceção preserva reservas e não as cancela. Indicadores distinguem configuração atual e fatos reservados.

Lock profissional18018 serializa agenda/019/CRM e conflitos são consultados novamente na mesma transação de confirmação. Prévia assina digest de campos/slots/versões/configuração/exclusões; não é autorização. Mudança de configuração, tipo, contrato ou ocorrência futura relevante exige nova prévia. Auditoria e idempotência pertencem à transação; falha reverte toda a série. Locks e queries parametrizadas são os controles do writer; não foi acrescentada extensão PostgreSQL especulativa.

## Tempo e recorrência

Instantes UTC timestamptz com fuso IANA, data/hora local e escolha de ambiguidade. Resolver por Intl/ICU, comparando offsets candidatos e round-trip; não usar Date de string local dependente do host nem offset fixo. Domínio civil2000–2100 e resolução em minuto; segundos não são campos de edição. Horário inexistente é recusado; repetido exige primeira/segunda ocorrência. Duração/intervalos são tempo decorrido. Início do dia em DST pode ser01:00; data inteiramente pulada pode ter duração zero. Bordas inexistentes de faixas de disponibilidade não concedem disponibilidade silenciosa.

Recorrência uma vez/semanal/quinzenal/mensal no mesmo dia, término por quantidade ou data, no máximo100 ocorrências e12 meses. Dia31 pula meses sem o dia, com aviso na prévia; não ajusta para outro dia. Limites combinados podem impedir100 ocorrências semanais em12 meses. Confirmar toda a série atomicamente. Prévia retorna no máximo100 slots; UI pagina20 dessa resposta limitada. Registros normais/históricos têm paginação SQL20; calendário retorna agregados por dia com até43 datas.

Alteração de uma ocorrência mantém as demais. Esta e futuras cria série derivada e cancela substituídas preservando histórico, sem apagar linhas anteriores. Passadas/finalizadas não são remarcadas; presença pode ser registrada retroativamente ou corrigida. Quantidade/regra futura é explícita na nova prévia, não reprodução indefinida. Cancelamento futuro considera somente agendadas a partir do alvo e do instante atual.

## Presença e obrigação019

Persistido scheduled/completed/absent/canceled; projected pending/in_progress depende do relógio sem confirmar presença. Efetivo e instante de registro/autoria separados. Instante efetivo deve estar dentro do intervalo reservado, não futuro; se o atendimento ocorreu noutro horário, o registro operacional deve corresponder à reserva correta. Correção de estado final exige motivo5..1000. Cancelamento tardio até24h do início ou depois é classificação operacional, sem multa ou cobrança.

Agenda refere contrato/obrigação canônicos do mesmo aluno/owner. Contrato é opcional. Planejar exige contrato ativo e ocorrência na vigência civil019 em São Paulo; obrigação opcional deve ser do tipo session e pendente/em andamento. Nenhum campo sessions vira crédito. Registrar presença não cumpre entrega nem recebe pagamento.

Operação explícita de realização+cumprimento insere uma unidade usando invariantes manuais compartilhadas em consultancies/deliveries.ts, guardas da data efetiva e transação da agenda. Contrato persistido ativo com vigência encerrada pode aceitar realização retroativa dentro do período; cancelado/suspenso/concluído não recebe nova execução. Não adicionar bypass de data ao endpoint019 existente. Alteração compatível mantém seu guard de data atual.

Vínculo de execução único ativo por ocorrência. Correção para ausência/agendado pode invalidar explicitamente só a execução dessa ocorrência, com motivo/versão e contrato ainda ativo/suspenso, recalculando unidades sem apagar histórico nem alterar outros atendimentos. Contrato concluído/cancelado exige revisão, sem reabrir silenciosamente019. Reabertura autorizada na019 invalida referência de execução sem apagar a agenda; ela aparece como desatualizada e uma nova ação explícita pode registrar nova unidade. Pagamentos020 permanecem independentes e bloqueio Connect externo não muda.

## Privacidade, escala e evolução

Notas/local/título pessoal somente no detalhe proprietário; CRM recebe próximo horário e flag pendente, sem copiar notas. Calendário diário/semanal/mensal usa agregados e lista SQL20 da data selecionada. Métricas agregam no SQL interseções com disponibilidade, sem carregar milhares de documentos no browser; não expressam receita. Contagens de sessão não incluem bloqueio pessoal; ocupação inclui intervalos e compromissos pessoais, descontando bloqueios do denominador.

Worker016 remove agenda/execuções vinculadas antes de019 e aluno, invalida respostas idempotentes do sujeito e preserva configuração/outros vínculos. Financeiro020 pode bloquear eliminação antes disso; nenhuma retenção legal foi inventada. Restore/replay e papel runtime precisam de ensaio descartável. Novas integrações externas somente documentadas em contratos, sem botão falso, OAuth, worker ou credencial. Sem mobile/autoagendamento/escopo022.
