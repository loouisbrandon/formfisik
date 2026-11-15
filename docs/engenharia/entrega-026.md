# Marco026 — Importação e migração profissional

Estado: IMPLEMENTADO — GO local controlado em03/11/2026. Produção permanece NO-GO015–025; Personal1.0 não homologada. FormFisik é empresa independente fundada por Brandon Louis; não se presume formalização jurídica.

## Escopo e funcionamento

Área `/importar`, integrada ao ProfessionalShell/autenticação/SaaS, com seleção de arquivo, validação de formato/limites, mapeamento CSV, amostra local, prévia transformada no servidor, erros/avisos por registro, coincidências autorizadas, escolhas explícitas, confirmação, lotes, pausa/retomada/cancelamento, histórico paginado e relatório CSV mínimo privado.

Fontes entregues: alunos CSV; exercícios particulares CSV; modelos JSON nativo `formfisik.templates.v1`. Não há importação financeira ou sensível, formato de concorrente presumido, scraping, credenciais externas ou identidade global do aluno. Alunos e exercícios vão para os módulos reais, e modelos para rascunhos versionados com referências canônicas; nunca ativação/prescrição automática. Bibliotecas privadas não são publicadas no catálogo oficial.

[Política e formatos completos](../modulos/importacao.md) · [API](api-importacao.md) · [ADR027](../arquitetura/ADR-027-importacao-transacional.md) · [operação/privacidade](../operacao/importacao.md) · [manifesto](manifesto-026.md).

## Checkpoint e auditoria de reutilização

026 começou somente após `test-results/025/checkpoint.json`: GO local controlado025, build/evidências finalizados, contêiner removido e portas fechadas. Baseline626 arquivos em `test-results/026/baseline-source.json`, incluindo as entregas anteriores e relatório/manifesto025. Outro chat do projeto estava notLoaded, sem concorrente ativo identificado. Trabalho anterior não commitado preservado; não houve reset, merge, commit ou worktree novo.

| Contrato existente | Uso e justificativa |
| --- | --- |
| Cadastro008 + CRM018 | `studentFields` e `createStudentInTransaction`, incluindo criação/histórico/vínculo privado e inscrição CRM condicional. Nenhuma criação paralela ou associação por contato |
| Exercícios009 | `exerciseFields`, taxonomia e `insertExercise` com owner/actor, snapshots e eventos. Nenhuma publicação/grant de moderador |
| Modelos010 + demonstrações023 | Writer transacional extraído do createPlan existente, mesmo idempotency/validação de exercício e vídeo/snapshot/referências. Wrapper anterior preservado e regressão executada |
| Sessões/acesso/HTTP | Mesmos guards de identidade/entitlement/owner, Origin, JSON limitado, limites HMAC e headers privados |
| Componentes | ProfessionalShell, memória privada, Feedback, Pagination, action/control e useUnsavedChanges. Sem biblioteca visual ou dependência nova |
| Persistência de importação | Necessária para prévia imutável, entrada temporária, retomada e relatório confiável. Não substitui os cadastros canônicos |
| Parser CSV | Não existia contrato reutilizável no repositório. Parser pequeno compartilhado cliente/servidor, com limites explícitos e testes de aspas/CRLF/BOM/multilinha/malformados, sem execução de fórmulas |
| Relatório operacional | PDF011/014 tem finalidade individual e não deve receber migração empresarial. CSV mínimo de números/estados/códigos, sem dados cadastrais, com anti-injection e auditoria |

CSV plano não representa divisões/técnicas/séries com integridade; por isso modelos usam o documento nativo strict, com IDs/versões existentes e autorizados, sem resolver nomes automaticamente ou ampliar o modelo. Modelos incompletos representáveis são rascunhos, sujeitos à validação de ativação010 posterior. Adaptadores Prime Coaching/Trainerize/Everfit continuam NÃO IMPLEMENTADOS, condicionados a amostras reais/autorização.

## Regras, segurança e persistência

Até1MiB por arquivo; CSV até500 registros/20 colunas/célula4.000, cabeçalho obrigatório e único; JSON até20 modelos, com limites canônicos010. Coluna não mapeada/valor inválido/arquivo original/filename não persistem. Apenas campos válidos normalizados são temporários, até24h; descarte por registro processado/cancelamento/expiração. Relatório não inclui nomes/contatos/observações/IDs individuais. Todos os textos são escapados e não há execução de fórmulas, HTML/código ou fetch de URL arbitrária.

Coincidência por nome/contato é indício, nunca identidade. Default ignora duplicados/conflitos. Criar distinto exige escolha por linha e revisão geral. Não atualizar, unir ou sobrescrever cadastros existentes. UUID não concede acesso, e candidatos privados de outros profissionais são excluídos. Exercícios sempre private/active do proprietário, modelos sempre template/draft v1 sem aluno/datas.

Migration025 cria professional_imports,professional_import_rows,professional_import_events, FKs compostas, índices por owner/job/prazo/contatos e trigger de imutabilidade da entrada/terminalidade. Nenhuma migration001–024 foi alterada. Runtime não pode DELETE ou alterar auditoria/owner/tipo/chaves; privacidade/DDL são operacionais separados.

Lotes de até25, locks813008→18018 e9009/10010 conforme destino. Savepoints por registro: erro conhecido de validação rejeita aquela linha; falha técnica/auditoria reverte o lote inteiro. Chaves/HMAC/estado durável impedem duplicação por retry/concorrência. Lotes anteriores persistem e retomada seleciona apenas pendentes. Confirmação igual é idempotente; intenção diferente não reutiliza key. Cancelamento não desfaz os já criados. Frontend usa contagens mínimas do POST para progresso, sem recarregar lista em cada lote.

Sessão opaca/role/e-mail/habilitação/entitlement exigidos em SSR/API; strict schemas, Origin, body3MiB/15s, rate120/min, prévia5/min, lote60/min, relatório10/min e até3 jobs abertos. SQL parametrizado, DTO mínimo por proprietário, respostas no-store/no-referrer/nosniff e logs estáticos sem corpo/dados/segredos. Nenhum JWT, privilégio, serviço externo ou acesso pago é concedido pela importação.

Eliminação016 remove referências do aluno e invalida retries; todos os payloads pendentes daquele proprietário são descartados/cancelados, pois não se presume identidade em arquivo ainda não vinculado. Outros cadastros canônicos permanecem. Conta elegível remove026 antes de users; retenção financeira020 preservada. Backup/restore exige replay do ledger. Cleanup físico limitado20 jobs usa SKIP LOCKED, invocável no acesso autorizado ou CLI preparado, sem scheduler externo criado.

## Testes e evidências

Ambiente sintético: Node24.22.0, Next16.4.3/webpack, Chrome156.0.8078.47 e PostgreSQL18 descartável. Evidências em `test-results/026/`; nenhum banco persistente ou credencial real utilizado.

| Verificação | Resultado verificável |
| --- | --- |
| Regressão completa |469/469,0 falhas/skip/cancel; `regression.log`, incluindo fontes anteriores e500 registros efetivamente importados |
| Integração final do importador |23/23,0 falhas/skip/cancel; `integration-final.log`. Inclui CLI real de cleanup, parsing, duplicidades/identidade, owner, retries, concorrência, cancelamento, rollback, pausa/lotes, modelos, privacidade e limites |
| Referências finais |3/3 em `references-final.log`, incluindo versões inexistentes/demonstração não autorizada; caso equivalente confirmado no bundle final por HTTP |
| Falha técnica parcial |Teste preserva25 registros do lote anterior, reverte o lote seguinte por falha de auditoria e retoma até26 sem duplicação |
| ESLint/TypeScript |Logs próprios, sem erros nas verificações finais; build real também executa TypeScript |
| Build real |`production-references/after-build.log`: build final. `build-verification.json` confirma fontes runtime idênticas; somente helper Playwright teve correção de serialização posterior, sem alterar aplicação |
| Chrome/Axe focado |`production-focused/imports-proof.json`:49 capturas,0 violações Axe,1440/768/375/320, altura500, texto200%, teclado/menu, três formatos, perfil real, relatório privado, cancelamento, pausa/retomada após reload e503/retry |
| Chrome integrado |`production-final/after-production.json`: todos os fluxos habilitados anteriores e importador passaram, sem canários/CSP/erros inesperados. `production-release/imports-proof.json`:49 capturas finais após textos. `production-references-final/imports-references-proof.json`: API compilada rejeita demonstração inválida por linha e importa vizinho válido em rascunho |
| Backup/restore |`operations/operations-proof.json`:25 migrations,199FK,0 inválidas; upgrade/rollback/checksum/restore e replay de eliminação sobre aluno criado pelo importador + preview pendente, outro proprietário preservado. importsRestoredThenErased=true |
| Privilégio mínimo |Mesmo ensaio: importsRestrictedRuntime=true; cria/processa/relata por repositórios reais e nega DELETE/auditUPDATE/alteração de tipo e DDL |
| Volume/consulta |500 registros, prévia20/página, cerca de5KB; `final-artifacts/026/query-plan.json`. Sem carregamento de milhares para ocultar no cliente, sem benchmark/SLA de produção inventado |
| Requisições focadas |46 requisições em todo o cenário multiformato/perfil/retomada/falha controlada,41 à API de importação e leituras contextuais individuais. Maior resposta observada4.968bytes; `production-focused/imports-api-measurements.json`. Não equivale a carga representativa |

Falha intermediária real: função de frontend chamada process sombreava o global utilizado por macro injetada no bundle otimizado do Next; renomeada para processBatches, sem alterar regras/transações. Fixture de telefone que coincidia com aluno existente foi corrigida; o importador havia ignorado corretamente essa coincidência. Um seletor do teste de rascunho foi alinhado ao aviso real do módulo010. Logs/capturas intermediários preservados; não são omitidos nem tratados como testes aprovados.

## Limitações e veredito

CSV é estrito e limitado aos campos administrativos/taxonomia aprovados; mensagens de inválido identificam o registro sem persistir seu valor. Corrigir arquivo/mapeamento exige nova prévia, cancelando a anterior quando necessário. Não há atualização ou merge, desfazer cadastros criados, processamento em background ou adapter externo. Modelos nativos exigem referências existentes, sem associação automática por nome. A biblioteca009 usa painel e não rota individual de exercício; o resultado abre a biblioteca existente, enquanto alunos/modelos têm links específicos.

Scheduler de cleanup, retentiva jurídica/operacional, homologações externas, RPO/RTO/SLA/p95, aparelhos físicos e leitor de tela humano continuam pendentes próprios015–030. Axe não certifica WCAG global. No-go produtivo não foi levantado.

Sem deploy, commit automático, recursos financeiros, credenciais reais, serviços externos ou migrations em bancos persistentes. Relatório025 permanece independente e seu GO anterior não é substituído pelo resultado026.

Na revisão final, o erro de validação MediaError do módulo023 passou a ser classificado por registro (somente status<500), tanto na prévia quanto no processamento; falhas técnicas continuam revertendo o lote. Não há regra de mídia duplicada. A verificação compilada adicional exigiu corrigir apenas a serialização de uma função de teste Playwright (__name), com log intermediário preservado em `production-references-harness-failure.log`.

**Veredito independente026: GO local controlado.** Regressão469/469, integração final23/23, referências3/3, build/Chrome/Axe/segurança/privacidade e restore controlados aprovados. Evidências, manifesto, hashes/packaging e cleanup em `test-results/026/verification-summary.json`. Fonte final de aplicação corresponde ao build final, com o único delta posterior restrito ao helper de teste e validado por TypeScript/ESLint/execução real. Sem falha conhecida pendente no escopo local; produção e dados reais continuam NO-GO.
