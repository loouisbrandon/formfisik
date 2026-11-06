# Agenda visual — 05/11/2026

Estado: IMPLEMENTADO LOCALMENTE. FormFisik independente, fundada por Brandon Louis. Sem deploy, commit, dependência nova, migration ou serviço externo.

## Entrega e manifesto

- `src/modules/agenda/workbench.tsx`: grade semanal/diária, mês resumido, mini calendário, filtros visuais, slots, linha atual, cartões e paginação.
- `src/modules/agenda/calendar-layout.ts`: recorte civil por fuso e distribuição de eventos sobrepostos.
- `src/modules/agenda/agenda.module.css`: claro/noturno, escala e responsividade.
- `src/modules/agenda/area.tsx`: integração, lista por período, seções e aviso de filtro ativo.
- `src/modules/agenda/editor.tsx`: aceita horário inicial escolhido; preserva prévia, confirmação, conflitos e recorrência.
- `src/modules/professional/shell.tsx`: largura compartilhada na agenda.
- `tests/agenda-calendar-layout.test.ts`: meia-noite, fuso e sobreposição.
- `tests/agenda-e2e.ts`: seletores e navegação adaptados à nova composição.
- Documentação: módulo, Design System e este relatório.

O repositório contém trabalho anterior ainda não versionado; não se atribui todo o estado git desta pasta a esta alteração.

## Reutilização e regras

Nenhum endpoint novo. `view=calendar` fornece agregados/faixas; `view=list` passa a consultar o período exibido, limitado a 20 itens por página. DTO privado existente, sem notas/local/títulos pessoais; detalhe autorizado sob demanda. Configuração, tipos, exceções, bloqueios/férias, recorrência, preview, idempotência, concorrência, remarcação, cancelamento, presença e histórico preservados. Não há sincronização externa, pagamento, cumprimento automático ou alteração por arraste. Filtros de apresentação não afetam a validação canônica.

## Verificação

- 31/31 testes de integração da agenda aprovados em PostgreSQL auxiliar `formfisik_dashboard_test`, incluindo regras temporais, autorização e conflitos. Banco da carteira local preservado.
- Testes de layout: recorte de bloqueio multidiário, término exclusivo à meia-noite, fuso configurado, lanes para sobreposições e reutilização para eventos adjacentes.
- Chrome E2E aprovado: disponibilidade, exceção, tipos, reserva recorrente, retry idempotente após perda de resposta, remarcação, presença/execução contratual explícita, correção e cancelamento, histórico, mês, navegação/teclado, falha de rede e texto a 200%. Axe em 1440/768/375/320px. Evidências `test-results/021/browser` e `/tmp/formfisik-agenda-e2e.log`.
- Chrome nas rotas reais: temas claro/escuro em 1920×1080,1440×900,768×900,320×740,1440×500, sem violações Axe detectadas ou overflow externo; alternância dia/semana/mês e preenchimento do horário por clique. `test-results/local/agenda-verification.json` e `agenda-*.png`.
- ESLint de `src` e `tests`, TypeScript e build webpack de produção aprovados. Lint global continua afetado por scripts CommonJS temporários anteriores em test-results, conforme relatório de acompanhamento; regras não foram relaxadas.

## Limites

Grade paginada em 20: não é uma visualização integral de centenas de reservas. Há aviso e acesso às páginas/lista; todos os conflitos são verificados no servidor. Disponibilidade verde é a faixa configurada, não uma promessa de horário livre. Não foi implementado arraste, sincronização Google/Outlook, nova notificação ou automação. Horários ambíguos mantêm validação existente e identificação dos instantes no detalhe. Dados sintéticos ficam nos testes; não foram criados compromissos fictícios na carteira local. Produção e integrações externas continuam sujeitas à homologação própria.

Operação local: o provedor de assinatura controlado na porta 3112 precisou ser reiniciado durante a conferência final. A indisponibilidade manteve o bloqueio canônico (503), sem bypass. Não houve criação de assinatura real. Os três casos unitários de layout também foram executados fora da restrição de subprocessos e passaram individualmente.

## Complemento — modal de novo agendamento

A referência visual posterior aprovada pelo fundador substitui o editor de página por um dialog contextual. Arquivos: `appointment-dialog.tsx`, `editor.tsx`, `area.tsx`, `agenda.module.css`, `workbench.tsx` e `configuration.tsx` (data inicial da exceção); o E2E foi ajustado e ampliado para o modal. Não há migration, dependência, endpoint ou alteração de autorização.

Estado e resultados desta revisão são registrados em `test-results/local/agenda-modal/verification.json`, com capturas em `browser/`. Evidências anteriores deste documento permanecem históricas. A validação usa PostgreSQL descartável separado; não cria agendamentos fictícios na carteira local. Esta revisão não muda o estado de homologação externa ou produção da agenda.

Validação do complemento: 34/34 casos de regras/layout aprovados em banco descartável exclusivo; Chrome E2E aprovado em 1440/768/375/320 px com Axe, modal nativo, foco/Escape, data/slot, cancelamento preservando o período original, reserva recorrente, retry idempotente após resposta perdida, remarcação, comparecimento, correção, execução contratual explícita, cancelamento futuro, histórico, falha de rede e teclado. TypeScript, ESLint e build webpack aprovados; canários sintéticos ausentes dos arquivos públicos. O runner de segurança de produção teve os seletores da agenda adaptados, mas não foi reexecutado nesta revisão. Chrome usa componentes reais em harness com APIs e PostgreSQL sintéticos; não configura serviços externos nem homologa dados reais.


## Correção posterior — compromisso pessoal sem expediente

A regra anterior em `planning.ts` exigia disponibilidade para toda natureza exceto bloqueio. Isso impedia registrar compromissos pessoais em uma agenda recém-criada, com todas as faixas vazias, inclusive em dias sem reservas. A fixture anterior concedia faixas em todos os dias e não reproduzia esse estado inicial. O predicado agora exige disponibilidade apenas para atendimento; ocupação e bloqueios continuam canônicos para todas as naturezas.

O modal orienta a configuração e explica a impossibilidade de confirmar conflitos; a confirmação só é renderizada quando a prévia permite. Acrescentados casos de integração para agenda vazia, múltiplas datas, reserva pessoal efetiva, duplicação, sessão recusada, bloqueio explícito e recorrência atômica. O E2E tem modo `TEST_EMPTY_AVAILABILITY_FLOW=1` com PostgreSQL sintético, cobrindo o estado inicial e a configuração explícita de uma exceção antes de salvar atendimento. Evidências e resultado final: `test-results/local/agenda-availability-fix/verification.json`.

Nenhum horário real foi configurado automaticamente e nenhum dado da carteira local foi alterado. A distinção entre pessoal e atendimento é uma correção funcional posterior ao refinamento visual; os resultados anteriores permanecem históricos.

## Complemento — arraste, hover e detalhes em modal

Solicitado pelo fundador: detalhes/edição em modal e movimentação por arraste com justificativa antes da confirmação, incluindo ghost junto ao mouse, marcador de destino e hover dos controles. Reutilizados `AppointmentDialog`, detalhes/editor e APIs de preview/save. Implementação em `move-dialog.tsx`, `use-calendar-drag.ts` e `appointment-fields.ts`, com integração em area/workbench/detail e CSS da agenda. Nenhuma alteração de política de autorização ou de permissão para forçar conflito.

A justificativa já era exigida pelo writer em todas as remarcações. O novo fluxo aplica essa regra em etapa anterior à confirmação; verifica a versão do cartão e não muda o registro até o aceite. Recorrência individual, duração decorrida, conversão de fuso, cancelamento sem escrita e retry idempotente são requisitos de validação. Foi corrigido o preenchimento de duration de blocos multidiários, campo sem efeito na duração real mas sujeito ao limite numérico do schema. Evidências e limitações desta revisão: `test-results/local/agenda-move/verification.json`. Resultados anteriores deste documento permanecem históricos.

Verificação de arraste: testes automatizados de mouse comprovam ghost e marcador visíveis, cancelamento sem escrita, justificativa antes da confirmação, preservação do original até confirmar, retry após resposta perdida sem duplicação, mudança de semana por hover nas setas, alternativa acionada pelo teclado e conflito impedindo gravação. Detalhes e editor são dialogs nativos; Axe e layouts em 1440/768/375/320 px. A suíte de domínio inclui duração de bloqueio de 26 horas, auditoria/versão/propriedade, transições DST e horários repetidos/inexistentes. Ensaios usam somente PostgreSQL descartável e dados sintéticos. Dispositivos físicos/gestos de toque e leitores de tela reais não são homologados por estes ensaios. Limites temporais e de situação da 021 permanecem; o arraste não libera edição de compromissos já iniciados ou finalizados.

Resultado final desta revisão: **41/41 testes de agenda, layout e movimentação aprovados**, sem falhas ou ignorados; Chrome do novo fluxo e regressão completa anterior aprovados, incluindo presença, execução contratual explícita, reversão, cancelamento futuro e histórico dentro dos modais. TypeScript, ESLint dos arquivos afetados e build webpack aprovados. Canários sintéticos ausentes dos artefatos públicos. A comparação de hashes/horários vincula o build às fontes finais. Evidências: `regression.log`, `browser/move-proof.json`, `full-browser/browser-proof.json`, `build.log`, `canaries-and-build.json`, `manifest.json` e `verification.json` em `test-results/local/agenda-move/`. O banco descartável foi encerrado; não houve alteração na carteira local, migrations persistentes, commits, deploy ou nova dependência.

Tentativas intermediárias identificaram um preenchimento inválido de duration para bloqueios superiores a 12h, corrigido no conversor compartilhado; rolagem de borda excessivamente imediata, substituída por permanência de 180 ms; e uma asserção antiga que supunha lista recolhida após sair do detalhe, ajustada para preservar e reconhecer o estado real da lista. Nenhuma dessas tentativas foi apresentada como aprovação final. Chrome usa harness com componentes reais e APIs/banco sintéticos; o build real foi compilado e inspecionado, sem reexecutar o runner amplo de segurança de produção nesta revisão.
