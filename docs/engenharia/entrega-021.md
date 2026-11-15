# Marco021 — Agenda profissional completa

Ambiente: desenvolvimento local isolado, PostgreSQL18 descartável, dados sintéticos, Chrome real. FormFisik independente, fundada por Brandon Louis; não se presume constituição jurídica formalizada. Registro de validação em02/11/2026. Sem deploy, commit, operação financeira real ou sincronização externa. Status final e evidências abaixo distinguem código local de homologação operacional.

## 1. Funcionalidades concluídas

Disponibilidade semanal múltipla, fuso, exceções, férias/bloqueios e compromissos pessoais; tipos de sessão com buffers e arquivamento; agendamento avulso/recorrente, prévia e confirmação atômica; remarcação/cancelamento de uma ou futuras; presença/ausência retroativa e correções; histórico paginado; indicadores operacionais e navegação contextual. As fases021-A/B/C constituem uma entrega. [Manual funcional](../modulos/agenda-profissional.md).

## 2. Reutilização efetiva e arquivos

ProfessionalShell, NavigationMemory, proteção de alterações, Feedback/Pagination, action/control, StudentsPicker008, sessão opaca/entitlement, Origin/rate/JSON/headers, PostgreSQL/migrador, lock18018, aluno008, projeçõesCRM018, contrato/execuções019, eliminação/restore016. Calendário013 continua específico de avaliações/fotos; não era equivalente a reservas. Tabelas/componentes próprios da agenda têm justificativa na [ADR022](../arquitetura/ADR-022-agenda-canonica.md). Nenhuma dependência nova ou upgrade.

Novos: `src/modules/agenda/{time,schema,api,page,area,configuration,editor,detail}`, `src/server/agenda/{core,planning,repository,queries,handlers}`, rotas `/agenda`, `/alunos/[id]/agenda`, `/api/agenda`, migration021, testes e helpers agenda. Integrações: navegação/shell, StudentArea, CRM facts/card/schema, deliveries019, erasure016, runtime-grants e runners operacional/produção. Documentos: módulo, API/modelo, ADR, privacidade, calendários, índice/inventário/roadmap/arquitetura/DS e referências dos módulos afetados. Manifesto exato `test-results/021/source-audit.json` compara hashes com baseline anterior; worktree anterior preservado, nenhuma remoção, migrations001–020 e lockfile intactos. O diff Git completo contém entregas anteriores e não deve ser atribuído à021.

## 3. Alterações no banco

Migration021 adiciona oito tabelas: settings, exceptions, session_types, series, occurrences, fulfillments, events e operations, com prefixo agenda_. Instantes timestamptz, referência civil/IANA, snapshot do tipo, versões e idempotência. FKs compostas de proprietário e aluno/contrato/obrigação; uma execução ativa por ocorrência. Sem tabela de credenciais externas, extensão ou duplicação financeira. Grants runtime sem apagar ocorrências/eventos ou reescrever auditoria. [Modelo](api-agenda.md). Ensaios de migration vazia/repetida, atualização013→021, rollback/checksum e restauração descartável.

## 4. Endpoints e autorizações

GET/POST `/api/agenda` exigem sessão opaca e autorização profissional SaaS; POST verifica Origin, schemas estritos e JSON32KiB. GET120/POST40 por minuto. Writes com chave idempotente, versões e confirmação onde pertinente; preview não concede autorização. Toda query e associação privada verifica owner no servidor; recursos alheios não são revelados. DTO mínimo para listas/calendário/CRM; notas/local somente no detalhe. [Contrato](api-agenda.md).

## 5. Alunos e CRM

Aluno tem link para sua agenda; seleção reutiliza carteira paginada. CRM recebe próximo horário e flag de presença pendente, com link contextualizado, sem notas/local ou automação de etapa. Conta/aluno de outro profissional é rejeitado. Preserva inativação, histórico e regras anteriores.

## 6. Integração019 e compatibilidade020

Contrato é opcional e canônico, mesmo aluno/owner. Obrigação opcional é sessão elegível. Realização+cumprimento exige ação explícita e versão atual, compartilhando invariantes019 numa transação: falha após execução reverte presença, unidade e resultado idempotente. Vigência considera data efetiva em São Paulo; endpoint019 anterior preserva guard de data atual. Correção exige motivo e confirmação para invalidar somente sua execução; outras unidades/histórico permanecem. Reabertura019 não apaga agenda nem permite execução ativa duplicada. Campo sessions não vira crédito; agendamento, presença, execução e pagamento são fatos separados. Financeiro020 e seu transporte Connect externo bloqueado permanecem preservados.

## 7. Recorrência e conflitos

Semanal/quinzenal/mensal, término explícito, até100 ocorrências e12 meses. Dia31 pula meses sem esse dia, com aviso na prévia. Alteração uma/futuras preserva passadas/finalizadas. Lock profissional serializa writes; conflito é refeito na mesma transação. Digest inclui configuração/tipo/contrato e versões das ocorrências substituídas; mudança exige nova prévia. Retry pós-commit retorna resultado sem duplicar. Séries falham integralmente. Ocupação inclui buffers, intervalos adjacentes usam fim exclusivo. Sem override.

## 8. Fusos e datas

Resolver Intl/ICU com round-trip, candidatos de offset e escolha explícita em hora ambígua; rejeitar hora inexistente. Sem parser local dependente do host ou offset fixo. UTC persistido, fuso/data/hora/fold preservados; duração em tempo decorrido. Testes incluem DST NY, meia-noite DST São Paulo, data pulada Apia, Kathmandu, bissexto, mês31 e intervalos adjacentes. Faixas locais fora de ordem são normalizadas na avaliação; interseções durante hora repetida são unidas para não contar disponibilidade duas vezes. Períodos malformados ou acima do limite são rejeitados no schema.

## 9. Interface e acessibilidade

Shell compartilhado, sidebar integral e scroll principal independente. Semana padrão desktop, dia mobile e mês resumido; seleção de dia abre lista SQL20. Formulários completos progressivos, aviso de alterações, prévia20 por página limitada100, loading/erro/retry/sucesso e confirmações sem sucesso simulado. Campos nativos rotulados, foco visível, estado textual além da cor. Chrome/Axe em320/375/768/1440, texto200%, altura500 e teclado. Troca de largura preserva formulário de presença após correção detectada no teste. Reserva de compromisso pessoal foi concluída por tabulação/teclado. Releituras de detalhe motivadas somente por viewport foram removidas:20→8; cenário completo91→79 requisições, bytes da API agenda57797→43891 (`request-comparison.json`), sem enfraquecer autorização. [DS](../design/DESIGN_SYSTEM.md). Não implementado drag-and-drop; todas as ações possuem controles explícitos.

## 10. Google/iCloud/Outlook: preparado e não implementado

[Contrato futuro](../operacao/calendarios-externos.md) documenta provider/account/calendar/event, vínculo interno, versão/ETag, cursor, estados, conflitos, idempotência, retry/reconciliação e desconexão/revogação. Separa publicação interna de importação de ocupação. Exclusão externa nunca apaga atendimento interno. Pesquisa em fontes oficiais Google, Apple e Microsoft distingue capacidades confirmadas de viabilidade Apple ainda a verificar. Nenhum OAuth/credencial/worker/webhook/chamada API/sync/importação/UI funcional fictícia/tabela especulativa implementado.

## 11. Segurança e privacidade

Autorização/isolamento, DTO mínimo, Origin, payload/rate, lock/versões/idempotência e auditoria transacional. Testes IDOR, concorrência, abuso e falha controlada. Notas e endereço não são logados; nenhum JWT ou storage de credencial no cliente. [Avaliação](../privacidade/agenda.md) integra inventário e worker016: remove vínculos/ocorrências/eventos/séries antes de019/aluno, invalida idempotência e preserva outros sujeitos. Preflight financeiro020 permanece antes de qualquer remoção. Sem prazo jurídico inventado ou declaração genérica de conformidade. Restore reaplica ledger assinado antes de uso.

## 12. Testes e resultados

31 testes específicos passaram em `integration-final.log`: tempo/recorrência, disponibilidade/exceções/tipos, snapshot/arquivamento, conflito concorrente, retry/versão, remarcação, presença/correção, execução019/rollback/reabertura, autorização/abuso/IDOR, eliminação, métricas e paginação2500. Chrome dedicado passou (`browser-proof.json`), inclusive resposta perdida após commit, correção explícita, erro de rede e preservação de alterações. Operacional passou (`operations/operations-proof.json`):21 migrations,143 FKs, zero constraints não validadas, backup633ms/restore2000ms neste ensaio, replay e runtime restrito. Medidas não são SLA. Plano SQL com2500 registros e resposta paginada20 em `query-plan.json`.

Regressão inicial completa:339/339. Após cinco casos adicionais e correções finais, regressão integral final: **344/344**, em dois lotes sequenciais (195+149), zero falhas/cancelados/skips. Todos os22 arquivos `tests/*.test.ts` constam em `regression-batches.json`. Build real de produção e Chrome integrado passaram com todos os flags017–021: CSP sem violações, zero vazamento de canários e zero erros de console. Cookie Secure/HttpOnly/SameSite=Lax, storage sem credenciais e troca de usuário/abas validados. ESLint e TypeScript finais passaram. Todos os critérios locais desta entrega foram validados. Nenhuma falha final pendente.

Uma execução monolítica final foi encerrada com código143, sem falhas de teste reportadas; regressão final refeita em dois lotes sequenciais. Falhas intermediárias: fixture usava instantes diferentes para bordas iguais; seletor de checkbox não estava contextualizado; mudança de viewport desmontava presença; página Next exportava props de componente interno incompatíveis. Corrigidas, sem ocultar falhas finais. Testes de DST/período adicionais fecharam limites identificados na revisão.

## 13. Evidências reproduzíveis

Resumo verificável: `test-results/021/verification-summary.json`. Diretório `test-results/021/`: baseline-source/baseline-git-status, source-audit, integration-final/regression-1/regression-2/lint/typecheck logs (full-tests.log preserva a execução interrompida143), query-plan, browser-proof, api-measurements, capturas browser/, operations-proof e production/. Dados exclusivamente sintéticos; bancos separados para integração, Chrome e produção. `TEST_DATABASE_URL` deve apontar para banco descartável com sufixo `_test`. Executar `npm test`, `npm run test:agenda:e2e`; runner `test:security:e2e -- --build` com flags TEST_INTAKE_FLOW/TEST_CRM_FLOW/TEST_CONSULTANCIES_FLOW/TEST_FINANCE_FLOW/TEST_AGENDA_FLOW=1, SECURITY_EVIDENCE_DIR definido. Runtime operacional exige Docker/container descartável e parâmetros descritos no runner. Não usar configuração de produção para reproduzir.

## 14. Limitações

Sem aplicativo aluno/autoagendamento/sync externo/drag-and-drop/outras modalidades. Disponibilidade atual não reconstrói capacidade histórica; ocupação não é receita. Limites operacionais documentados no módulo; efetivo dentro da reserva, remarcação passada proibida, revisão019 exigida para correção contratual encerrada. Performance de2500 registros é evidência local, não teste de carga de produção. Acessibilidade validada com Axe e teclado no Chrome; leitor de tela real, aparelhos físicos e outros navegadores não foram homologados. SMTP/Stripe/R2 externos e requisitos operacionais/jurídicos anteriores não são homologados por esta entrega.

## 15. Pendências futuras

Homologação Personal1.0 em ambiente autorizado, resolução documentada do NO-GO015 e dependências operacionais/privacidade anteriores. Calendários exigem escopos/consentimento/interoperabilidade Apple, credenciais seguras, sync, conflitos e ensaios próprios. Connect020 continua bloqueado; nenhuma ativação é pendência executável implicitamente. Nenhuma nova modalidade autorizada.

## 16. Veredito

**GO local controlado para o Marco021**, implementado, integrado, testado e documentado. **NO-GO para produção/dados reais**, preservando bloqueios015–020. Código e testes locais não equivalem a homologação produtiva nem autorização de deploy. Container descartável encerrado/removido; portas3130/3131/3443/3112/5551/15260 fechadas (`cleanup.json`). Nenhum servidor de teste ficou rodando. Sem commit, deploy, serviço externo ou alteração de banco persistente.
