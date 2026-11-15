# Entrega 019 — serviços, planos comerciais e entregas profissionais

## 1. Status geral

IMPLEMENTADO E VERIFICADO LOCALMENTE, somente PostgreSQL descartável, dados sintéticos e provedores controlados. Não homologa Personal 1.0 ou produção. FormFisik é empresa independente fundada por Brandon Louis; não se presume constituição jurídica formalizada.

## 2. Resumo executivo

Profissional cadastra serviço, configura plano/preço/vigência/obrigações, vincula contratação ao aluno, ativa e acompanha execução, consulta versões, renova ou cancela administrativamente. Integra carteira 008, CRM 018 e evidências 010/012/017 sem duplicar identidade, conteúdo clínico ou assinatura SaaS. Nenhum pagamento processado.

## 3. Funcionalidades implementadas

Serviços criar/editar/duplicar/arquivar/reativar/buscar/filtrar/histórico; planos com preço seguro, duração, sessões, disponibilidade, intenção futura e até 30 tipos de obrigação; revisões imutáveis; acordos/snapshots, transições, vigência e renovação; execução por unidades, evidências, reabertura justificada; filtros/páginas, indicadores e histórico; integração no perfil e CRM. [Regras completas](../modulos/servicos-e-consultorias.md).

## 4. Arquivos alterados

Novos: db/migrations/019_professional_services.sql; src/server/consultancies/{core,catalog,contracts,deliveries,queries,handlers}.ts; src/modules/consultancies/{schema,types,api,shared,catalog-editors,contract-editor,delivery-detail,area,page}.ts[x]; páginas /consultorias e /alunos/[id]/consultorias, API /api/consultancies; testes consultancies.test.ts, consultancies-e2e.ts e fixture consultancies-browser-server.ts; módulo/API/privacidade/diretrizes financeiras/ADR 020/relatório.

Integrações: fatos/schema/card CRM, navegação/shell, link no perfil, worker 016 e grants. Testes de navegação, fixture/build de produção, restore/grants e segregação de evidências CRM; script E2E no package.json. Documentação: índice, inventário, roadmap, arquitetura, alunos/CRM, modelo comercial, segurança/privacidade/operação/Design System, README e CHANGELOG. Manifesto completo em test-results/019/source-audit.json, comparado ao snapshot anterior à 019, incluindo trabalho já não commitado. Sem atribuir todo o diff Git a esta entrega.

## 5. Componentes reutilizados

ProfessionalShell, NavigationMemory, StudentsPicker, proteção de saída, action/control, sessão opaca, profissional confirmado/habilitado, entitlement canônico, Origin/rate/HMAC/JSON, pg/migrador/transação e lock profissional 18018; mecanismo de condições 018 e worker/ledger 016. Nenhuma dependência nova, upgrade, autenticação paralela, Kanban ou editor clínico novo. [Decisão e justificativas](../arquitetura/ADR-020-servicos-e-consultorias.md).

## 6. Modelo de dados

Nove tabelas: professional_services, professional_service_plans, professional_plan_versions, professional_contracts, professional_contract_versions, professional_deliveries, professional_delivery_executions, professional_commercial_events e professional_commercial_operations. FKs compostas garantem owner e mesmo aluno/contrato/entrega; versões são imutáveis. Execução não copia respostas, medidas ou conteúdo de ficha. Eventos mínimos por proprietário, com motivo operacional necessário, sem dados em logs.

Contrato fixa plano/revisão, serviço, preço total acordado em centavos, BRL, início/fim, sessões, obrigações, predecessor e histórico. Catálogo posterior não altera snapshot. Obrigações usam quantidade por tipo, sem expandir milhares de linhas. Execução conserva unidades e referência; reabertura invalida logicamente, não apaga atividade.

## 7. Migrations

019 aditiva,001–018 preservadas. Somente contêiner local formfisik-019-test PostgreSQL 18, loopback 5549, bancos _test separados para suíte/navegador/produção e bancos efêmeros do ensaio operacional. Banco vazio/aplicação sequencial/repetição, upgrade desde 013, checksum/gap/falha controlada/rollback,110 FKs e 0 constraints não validadas registrados em operations/operations-proof.json.

A FK foi reforçada durante desenvolvimento 019 e o banco exclusivamente descartável recriado antes da suíte final, sem reescrever histórico aplicado ou migration anterior. Nenhuma migration em banco persistente. Runbook 016 e grants preparados para autorização futura, sem GRANT ALL.

## 8. Endpoints

GET/POST /api/consultancies, views paginadas e comandos discriminados strict. Páginas privadas /consultorias e /alunos/{id}/consultorias. Nenhum endpoint público, financeiro, de aceite jurídico ou expurgo. [Contrato completo](api-consultorias.md).

## 9. Contratos

Preço inteiro em centavos, datas civis e tipos/quantidades delimitados; arquivos/eventos/versionamento explícitos; operationKey+digest e versão otimista. Mesma intenção repete resultado, divergência 409. Reads minimizados, documentos históricos somente sob demanda. Sem provider IDs/transaction IDs falsos.

GET 120/POST 40 por minuto, body 98304 bytes/15 s;400/401/403/404/409/422/429/503 com mensagens estáticas. POST requer Origin válido. Futuro 020 recebe apenas contrato de intenção administrativa, não pagamento nem autorização de cobrança.

## 10. Fluxos Web

Navegação única Consultorias, áreas Serviços/Planos comerciais/Contratações/Entregas/Histórico. Perfil e CRM consultam o mesmo módulo. Formulário longo de plano é progressivo, tipos/quantidades/prazos/ordem e revisão; preço/vigência/obrigações são apresentados antes da confirmação. Novo acordo e renovação começam em rascunho.

Execução tem quantidade, atestado operacional ou evidência canônica e confirmação. Histórico mostra eventos e revisão/termos sob demanda. Loading/erro/retry/ausência/conflito são explícitos. Falha de rede preserva formulário/chave; navegação modificada confirma descarte. Lista/detalhe anteriores são removidos ao trocar acordo, impedindo abertura de dado antigo durante recarga. Shell preservado.

## 11. Estados e transições

Rascunho→ativa/cancelada; ativa↔suspensa; ativa/suspensa→concluída/cancelada. Programada e expirada são estados derivados das datas, sem jobs. Conclusão exige obrigatórias e não ocorre antes do início. Suspender/cancelar exige motivo; suspensão não estende vigência. Acordo ativo não tem preço/obrigações alteráveis; somente rascunho pode revisar termos explicitamente.

Renovação cria novo rascunho do mesmo serviço após término anterior, com predecessor único; preserva acordo anterior e previne duplicidade. A interface navega entre predecessor e sucessora, e o histórico anterior inclui o registro da renovação. Sucessora cancelada permanece vinculada; outro acordo independente exige criação explícita. Sobreposição de mesmo plano/aluno/período exige confirmação independente, não duplicação silenciosa.

Entrega pendente/em andamento→concluída por unidades ou cancelada; reabertura de concluída/cancelada exige motivo e invalida execuções anteriores. Obrigatória cancelada não equivale a cumprida. Só executar/reabrir na contratação ativa/vigente e aluno ativo. Aluno arquivado ainda pode ter cancelamento administrativo. [Semântica integral](../modulos/servicos-e-consultorias.md).

## 12. Integração com CRM

Seis condições opcionais adicionadas ao motor existente: existência/atividade/proximidade de acordo, entregas pendentes/atrasadas e atendimento concluído. Mantidos operadores/efeitos, regras configuradas e padrões anteriores; sem segundo Kanban ou movimento automático. Agregações canônicas/owner no SQL e flags mínimas no card, sem preço ou detalhes clínicos. Pendências de acordos administrativamente ativos/suspensos continuam visíveis após vencimento, sem inferir cobrança.

## 13. Integração com treinos

Vínculo explícito a ficha individual e versão publicada, do mesmo aluno/owner, data de publicação na vigência e ficha atualmente ativa. Rascunho, terceiro e versão antiga fora do período são recusados.1 unidade por evidência, sem repetição na mesma obrigação. Não copia conteúdo ou muda prescrição. Consulta do módulo e seleção de versão no seu histórico. Mudança posterior de fonte é sinalizada, sem reescrever execução.

## 14. Integração com avaliações

Avaliação ativa/revisão atual/data na vigência, owner/aluno revalidados. Candidatos mostram identificação/data/revisão, sem peso, medidas, fotografias ou notas. Correção posterior muda evidence_current para falso, mas mantém execução histórica. Sem novo editor, upload ou exportação corporal.

## 15. Integração com anamnese

Entrega do tipo revisão exige solicitação revisada/não revogada, versão canônica e evento de revisão na vigência. Aguardando/recebida/em revisão não satisfazem esse tipo de obrigação. Nenhuma resposta copiada nem formulário duplicado. CRM continua disponibilizando condições solicitada/respondida/revisada existentes para outros usos; status de obrigação não muda automaticamente por evento genérico.

## 16. Indicadores

Contratações totais/ativas/concluídas/próximas, alunos distintos com ativa, obrigações pendentes/atrasadas e 5 serviços mais contratados. Respeitam filtros; serviços agregados por ID e nome atual do catálogo. Não são receita, pagamentos, faturamento ou conciliação. Preço individual é explicitamente acordado/não recebido. Término próximo é até 30 dias, sem renovação automática.

## 17. Segurança

Sessão opaca/conta/role/confirmado/entitlement/owner por página e API; sameOrigin, strict, parametrização, DTO, limites e logs mínimos. Controle de transições, locks/versões, renovação única, dedupe de evidências e operação idempotente. Falha de auditoria reverte acordo/obrigações/versão/chave. Suspensão nega gestão; arquivo de aluno protege execução.

Grants ensaiados: sem alteração de versões/eventos/unidades ou evidências de execução no runtime, invalidação justificada somente nas colunas cabíveis e DELETE de obrigações somente pelo caminho de rascunho. Build real HTTPS+CSP e canários durante compilação e navegação: zero vazamentos/violaçõesCSP/erros de console nos cenários positivos. Testes não certificam ausência absoluta de vulnerabilidades ou infraestrutura real.

## 18. Privacidade

[Inventário 019](../privacidade/consultorias.md): finalidade administrativa, risco de texto/contexto sensível, proprietário, minimização e retenção a aprovar. Não declara validade jurídica da assinatura/aceite ou da prova manual. Sem envio aStripe/SMTP/Onebase.

Worker 016 apaga escopo aprovado de aluno, inclusive renovação/snapshots/execuções/eventos, e saneia tentativas antes de eliminar fontes clínicas. Catálogo permanece para outros vínculos. Conta elegível elimina catálogo restante, preservando bloqueios anteriores. Backup/restore/replay ensaiado; futuro 020 precisa triagem financeira antes de persistir fatos de pagamento. Nenhum prazo legal inventado ou coleta real.

## 19. Testes

Suíte completa: 286 aprovados, 0 falhas/ignorados/cancelados, incluindo 262 regressões anteriores e 24 casos 019. Rodada específica final: 24 aprovados, cobrindo também negação sem assinatura, consultas históricas, fonte corrigida e constraints finais. Logs full-tests.log/integration-final.log em test-results/019. ESLint/TypeScript aprovados e build Webpack de produção aprovado em production/after-build.log.

Cobertura: schemas/money/datas inclusive ano bissexto; serviços/duplicação/arquivo/reativação; plano/revisões; snapshots; criação simultânea/sobreposição/retry; estados/obrigatórias; unidades/reabertura/execuções; renovação repetida; arquivo com acordo ativo; autorização/Origin/IDOR/DTO; CRM/indicadores; aluno arquivado; eliminação; evidências 010/012/017; programação/expiração; cancelamento e alteração de plano concorrentes; rollback real; rate; paginação e 2500 contratos; FKs aluno/acordo/entrega e rascunho alterado.

Primeira suíte teve 285/286, por asserção de teste que buscava o número do peso como substring e colidiu com UUID aleatório. Corrigida para whitelist exata de chaves do candidato, mantendo canário de conteúdo clínico e teste de acesso. Nova suíte 286/286 aprovada; tentativa anterior preservada, sem ocultar falha. Ensaio operacional 19 migrations/restore/replay/grants aprovado. Regressões pertinentes no build real: identidade/sessão/troca de conta, alunos, catálogo, treinos, acompanhamento/fotos, PDF, SaaS,017 e 018; CRM anterior tem runner segregado adicional.

### Medição de volume e estatísticas

Com 2.500 contratações sintéticas e estatísticas atualizadas explicitamente no fixture, a página de 20 registros levou 40,04 ms; EXPLAIN ANALYZE da consulta: 33,66 ms, e do CRM: 147,69 ms. Antes do ANALYZE, após carga artificial em massa sem estatísticas, foram 3.450,74 ms na chamada e 4.321,01 ms no plano SQL, com estimativas inadequadas de cardinalidade. As duas medições permanecem em large-portfolio.json e large-portfolio-before-statistics.json. Não constituem p95 ou SLA. Validar autovacuum/autoanalyze e planos com distribuição real antes de produção; o runtime não recebeu permissão de ANALYZE.

## 20. Evidências Chrome

browser-proof.json, api-measurements.json e browser/: serviço, plano/preço/obrigações, contratação/ativação, execução/reabertura, avaliação explícita, renovação, cancelamento, concorrência 200/409, IDOR 404, revisões históricas de plano/acordo, reajuste sem retroatividade, indicadores e perfil. Falha após COMMIT e antes da resposta confirma que reenvio recupera mesmo serviço; retry de leitura também exercitado. 320/375/768/1440, Axe WCAG 2 A/AA/2.1/2.2, menu/Escape/foco, altura 500, texto 200% e ausência de scroll global. Capturas sintéticas revisadas visualmente.

production/after-production.json: árvore final real Next em HTTPS local, cookies Secure/HttpOnly, SDK Stripe oficial com transporte loopback controlado, novo serviço/contrato/execução, perfil SSR, CRM,017 e regressões existentes, CSP/canários. Não é somente harness de componentes. Regressoes adicionais em regressions/; não sobrescrevem evidências 018. Chrome/Axe não substitui leitor de tela/aparelho físico ou outros browsers.

## 21. Limitações

Sem pagamento/Connect, assinatura eletrônica, documento jurídico assinado, agenda, emissão fiscal, marketplace, aplicativo ou outra modalidade. Contratos são administrativos. Não há renovação automática, job de expiração ou conclusão automática de obrigação. Execução fora da vigência/suspensão/encerramento é recusada; conclusão de acordo é terminal. Sucessora única permanece mesmo cancelada.

Até 30 tipos/1000 unidades; listas/histórico 20, JSON 98.304 bytes, campos textuais têm limites próprios e conjunto em bytes continua limitado. Busca literal sem transliteração. Alterações simultâneas exigem revisão, sem merge automático. Rascunhos só em memória. Quantidade de sessões é informação comercial; o progresso usa obrigações configuradas, sem gerar entregas implícitas. Testes não comprovam leitor de tela físico, SLA/RPO/RTO, Stripe/R2/SMTP externos, jurídico ou operação Railway. Build de validação usa Webpack suportado, preservando configuração; limitação Turbopack já registrada 018 não foi resolvida por upgrade.

## 22. Pendências

Homologações/controles 015–018 permanecem: finalidades/bases/menores/retentiva/canais/responsáveis, grants/IAM/TLS/ingress, backups/ledger atuais/cifragem/replay, schedulers/alertas, Stripe/R2/SMTP/domínio e piloto representativo. Migration 019/grants persistentes não executados. Nenhuma credencial externa solicitada ou configurada.

## 23. Riscos residuais

Notas/justificativas/ofertas podem receber conteúdo pessoal indevido; UI orienta mas não classifica semanticamente. Histórico e chaves crescem sem política de expurgo aprovada. Fato canônico pode mudar após execução: referência preserva versão e informa estado atual, não prova externa. Declaração administrativa não equivale a recebimento, aceite do aluno ou validade jurídica. Backup pode conter cópias até ciclo/replay autorizado; arquivos baixados anteriores não são recolhidos.

## 24. Preparação para 020

[Diretrizes financeiras](../estrategia/diretrizes-financeiro-profissional.md): ID canônico de acordo, profissional/aluno, preço total em centavos BRL, período, estado administrativo, intenção/ciclo e predecessor, somente leitura. Sem tabela/ID falso de transação, webhook Connect, onboarding ou cobrança parcial. 020 precisa validar recebedor/modelo no Brasil/taxas/risco, bases/retentiva/triagem de eliminação e autorização própria. Billing SaaS não foi reutilizado indevidamente.

## 25. GO/NO-GO local

GO técnico local delimitado ao escopo 019 com dados sintéticos/banco descartável, evidências consolidadas em verification-summary.json. Nenhuma parte simulada na aplicação; fixtures/provedores controlados estão explicitamente restritos aos testes. Manifesto de fonte preserva 001–018/relatórios/lockfile e alterações preexistentes. Encerramento de servidores e contêiner/portas documentado em runtime-cleanup.json.

## 26. GO/NO-GO produção

NO-GO para produção e dados reais, preservando 015–018 e pendências acima. Nenhum deploy, commit, migration persistente, cobrança, recurso externo ou configuração de credenciais reais. 019 não homologa Personal 1.0 ou autoriza 020.
