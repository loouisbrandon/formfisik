# Entrega 016 — Estabilização técnica, integrações e prontidão operacional

**CONCLUÍDA LOCALMENTE no escopo autorizado; produção NO-GO.** Execução autorizada exclusivamente local com dados sintéticos. FormFisik é empresa independente fundada por Brandon Louis; não se presume formalização jurídica. Sem deploy, commit, cobranças reais, alteração de credenciais, banco persistente ou serviço externo. A conclusão local não autoriza produção.

## 1. Status geral

Implementação, testes e documentação concluídos no escopo local permitido. **NO-GO para produção e coleta de dados reais**, preservando o veredito original015. Nenhuma integração externa recebe homologação por testes controlados.

## 2. Resumo executivo

A016 trata a parcela técnica local do FF015-11: eliminação delimitada por titular/proprietário, bloqueios explícitos de retenção/terceiros, tombstones duráveis, replay autenticado após restore e segregação de permissões. Acrescenta readiness completo de schema, validação de sequência/histórico de migrations, diagnóstico operacional e deadline do corpo bruto de webhook. Não refaz telas, identidade ou infraestrutura existente.

## 3. Pendências herdadas014/015 e origem

014 deixou schema014 não aplicado ao banco existente, cleanup não agendado, R2 não homologado e testes físicos/outros navegadores pendentes.015 encerrou auditoria local com210 testes e build/navegador aprovados, mantendo FF015-10 (ferramentas) e FF015-11 (alta, operação/eliminação/restore/IAM/agendas/alertas/contratos/canais) abertos para produção. A consolidação documental paralela ainda chamava015 de provisória; o estado atual foi reconciliado com seu manifesto final, sem reescrever resultados históricos.

[Rastreabilidade](016/rastreabilidade.md) separa técnica local, credenciais, infraestrutura, operação, fundador/jurídico e fora do escopo. Leitura inicial incluiu AGENTS, índice canônico, institucional/estratégia/Personal1.0, inventário/arquitetura/roadmap015–030, relatórios014/015 integrais, auditoria documental, manifestos/testes anteriores e estado Git. Linha de base inclui trabalho não commitado anterior e arquivos não rastreados; comparação final usa esse snapshot, não apenas HEAD.

## 4. Correções e controles implementados

- Migrador lê manifesto ordenado sem gaps, exige histórico aplicado como prefixo exato/checksum antes de executar novo SQL e conserva transação/lock. Fecha pool também em falha de conexão. Falha SQL reverte somente a migration em curso; não modifica checksum aplicado.
- Health não aceita schema parcial: histórico/checksum completo obrigatório, status público mínimo/no-store. Manifesto SQL é cacheado por processo e incluído no tracing de `/api/health`.
- Migration016 adiciona jobs/tombstones de eliminação e `workout_operation_keys.invalidated_at`, sem alterar SQL001–015 ou apagar dados anteriores.
- Eliminação operacional exige conta suspensa, escopo/proprietário exatos, protocolo UUID de aprovação e confirmações explícitas de manutenção/retenção/identidade no CLI. Não existe endpoint público/flag de bypass.
- Por vínculo de aluno: revoga imagens/PDFs, remove objetos com confirmação/retry e exclusão relacional transacional em ordem de FK; não usa coincidência de e-mail. Histórico de outros vínculos não é reescrito para contornar dependência.
- Pedido de conta profissional não autoriza excluir alunos. Carteira restante, financeiro, contribuições/moderação compartilhada ou histórico relacionado bloqueiam. Conta efetivamente elegível pode remover credenciais, apresentação, modelos/particulares e identidade sem atingir outro titular.
- Lease com UUID e fencing, lotes de20 objetos e fila de até5 jobs por execução. Janela técnica de um dia e DELETE repetido após quiescência; tombstones sobrevivem aos pais e continuam removendo PUT atrasado. Falha externa conserva estado, sem sucesso fictício.
- Ledger HMAC versionado e com domínio separado, acesso operacional/arquivo0600 fora do repo. Replay valida estrutura/assinatura/conflito/lease, suspende contas restauradas e refaz eliminação antes da reabertura. Não cifra nem comprova atualidade; governança externa permanece necessária.
- Template de grants reduz runtime, sem DDL/ledger/UPDATE de segurança/DELETE de usuários; CLI de diagnóstico informa status/contagens e idade de backlog sem segredos.
- Webhook bruto reutiliza leitor limitado:256KiB e prazo total15s, mantendo bytes exatos para SDK oficial. Regressão antes falhou e depois passou.
- Artefatos de novos testes PDF e navegador de produção têm diretórios segregados; sem mudança visual de produto/Design System.

## 5. Bloqueios locais resolvidos e extensão da evidência

Ensaio real em PostgreSQL18 descartável comprova banco vazio, upgrade013→016 com dados/documento anteriores, repetição/checksum/gap/falha/rollback, backup/restore em novo banco e replay que apaga dado restaurado mantendo outra carteira. Grants testados com papel restrito e smoke de sessões, alunos, exercícios, treinos, avaliações, Billing, foto privada e PDF. Essas provas resolvem **ausência de mecanismo/ensaio local**, não instalação/segregação no Railway ou garantia jurídica universal.

## 6. Bloqueios ainda existentes

FF015-11 permanece parcialmente aberto: eliminação de casos financeiros/compartilhados, portabilidade ampla, política de retenção e descarte de ledger/tombstones/backups, atualidade/cifragem/armazenamento independente do ledger, papéis/finalidades/canais/contratos, IAM real, TLS/ingress, backup/restore representativos, schedulers/alertas e homologações externas. Conta com carteira deve ter tratamento próprio de cada titular; suspensão afeta temporariamente disponibilidade do profissional e não cancela cobrança.

FF015-10: ferramentas ainda têm advisories moderados/baixos; não houve downgrade incompatível/`audit fix --force`. Zero alerta runtime não equivale a ausência absoluta de falhas. Nenhuma alta/crítica conhecida foi reclassificada para liberar GO.

## 7. Arquivos e módulos

[Índice final de arquivos/hash](../../test-results/016/source-audit.json) compara a linha de base, incluindo trabalho anterior não commitado. Núcleo016: `scripts/migration-files.ts`, migrador, health/readiness/operations, `db/migrations/016_privacy_operations.sql`, `db/operations/runtime-grants.sql`, `src/server/privacy/{erasure,ledger}.ts`, CLIs `privacy-erasure`/`operational-status`, suspensão015 e chaves de operação010. Webhook/http compartilham leitura limitada. Testes novos: `privacy-operations`, `operational-hardening`, `operations-e2e`; runners existentes reutilizados com evidências segregadas. Documentos canônicos atualizados sem apagar trabalho anterior.

## 8. Reutilização e arquitetura

[ADR-017](../arquitetura/ADR-017-eliminacao-e-recuperacao.md) pertence à016, preserva a ADR-016 estratégica e não implementa o Marco017. Reutiliza pg/SQL/transações existentes, Argon2id/sessões/suspensão, workers/adapterR2, triggers014, schemas/serviços versionados e SDK Stripe. Não cria segundo storage, cadastro, billing, portal, fila externa, autenticação ou modelo genérico multiesporte. Nenhuma dependência nova/versão alterada por conveniência.

## 9. Migrations auditadas

001 identidade/credenciais/pending/limites;002 sessões;003 reset;004–005 Billing;006–007 carteira/eventos;008 catálogo/moderação;009–010 prescrição/versões/cópias;011 apresentação/documentos;012 avaliações/eventos;013 fotografias/autorização/cleanup;014 relatórios/referências/triggers;015 suspensão/revogação;016 jobs/tombstones/idempotência pós-eliminação.

001–015 preservadas byte a byte na linha de base016. SQL016 é aditivo e não escolhe prazo legal, não remove dados reais ou cria scheduler. Nenhuma migration foi aplicada ao banco existente. História vazia/divergente/gap é recusada pelo migrador/health; upgrade sintético preserva antigo PDF011 após014. Constraints/índices/FKs e contagem de70 FKs no esquema resultante foram inspecionados/ensaiados; não há constraint não validada no resultado local. Duplicidade histórica de índice unique de proprietário/aluno não foi removida por refatoração especulativa. Futuro rollout exige backup, staging, autorização e smoke; [runbook](../operacao/estabilizacao-016.md).

## 10. Estado Stripe SaaS

[Auditoria por fluxo](016/integracoes.md). Oferta13990BRL/mês,30dias/cartão, trial único, cliente/metadata, Checkout/retorno, faturas/períodos, cancelamento, Portal, assinatura criptográfica, dedupe/reordenação/concorrência/indisponibilidade e reconciliação revalidados com provedor controlado. Navegador de produção usa SDK oficial com transporte loopback exclusivamente de teste, sem bypass no produto.

Não havia chave/preço de teste configurados; **Checkout/Portal/cartões/Test Clocks/webhook hospedado reais NÃO EXECUTADOS**, não homologados. Nenhum recurso financeiro externo, chave live ou Connect. Billing dos alunos continua somente Marco020.

## 11. Estado R2

Adapter privado existente preservado; testes controlados cobrem normalização, limites, EXIF, owner/aluno, substituição, remoção/retry, órfãos/PUT incerto, revogação durante I/O, consentimento de fotos em PDF e indisponibilidade. Frontend recebe proxy autenticado, não credenciais/URL pública R2; não há URL assinada de storage a expirar nesse contrato.

R2 real não configurado: **bucket/IAM/acesso público negado/PUT-GET-DELETE/restore/versionamento reais NÃO EXECUTADOS**. Ensaio de restore usa store privado controlado para objetos, banco real para referências. Configuração presente/formato não é homologação.

## 12. Estado da eliminação e retenção

[Ciclo por categoria](../privacidade/eliminacao-016.md). Implementado mecanismo delimitado; exclusão lógica ≠ definitiva ≠ anonimização. Ledger/IDs/chaves ainda são dados pseudonimizados. `completed` não declara descarte de todos os backups/cópias baixadas ou atendimento integral dos direitos. Exceções financeiras/compartilhadas e carteira pendente ficam bloqueadas; sem prazo legal inventado. Portabilidade ampla continua pendente; minutas não são publicadas. Nenhuma eliminação real executada.

## 13. Controles operacionais

[Runbook016](../operacao/estabilizacao-016.md): configuração/segredos, migração/falhas, grants, CLI paginada/confirmada, filas, backup/restore/replay, logs mínimos/diagnóstico e continuidade/alertas. Health/diagnóstico não chamam provedores. Template de grants não comprova IAM real; flags não são autorização jurídica. Backup local não inclui automaticamente R2/segredos/roles/ledger posterior. Última versão de ledger e chave precisam de controle independente antes de reabrir restore. Nenhuma rotina externa agendada. Ao final, contêiner descartável removido e portas de teste conferidas; aplicação de teste não ficou rodando.

## 14. Testes executados

Suíte final: **225 aprovados/0 falhas/0 ignorados/0 cancelados**,227.277 ms. Inclui210 anteriores,14 regressões de privacidade/eliminação/concorrência e uma de leitura lenta do webhook. Ensaio operacional com bancos novos/pg_dump/pg_restore/CLI/grants aprovado. Nove runners Chrome aprovados (auth na repetição isolada preservada). ESLint, TypeScript, build Webpack e navegador HTTPS real aprovados;225 testes executados no estado final. Todos usam dados sintéticos/bancos descartáveis. Stripe/R2 são controlados nos testes; SMTP é loopback. Testes externos sem credenciais explicitamente não executados.

| Verificação final | Resultado e evidência016 |
| --- | --- |
| Suíte SQL/unitária/integração/segurança | **225/225**,0 falhas/ignorados — [log](../../test-results/016/logs/suite-final.log) |
| Operação/migrations/upgrade/falha/restore/grants/CLI | PASS — [prova](../../test-results/016/operations-proof.json), [log](../../test-results/016/logs/operations.log) |
| Nove runners Chrome | PASS — [manifesto com tentativa inicial e repetição](../../test-results/016/browser-regressions.json) |
| ESLint / TypeScript | PASS — [lint](../../test-results/016/logs/lint.log), [TypeScript](../../test-results/016/logs/typecheck.log); verificação de tipos repetida após build para não concorrer com geração de `.next/types` |
| Build Webpack + navegador real produção | PASS — [log](../../test-results/016/logs/production-browser.log), [build](../../test-results/016/production/after-build.log), [evidência](../../test-results/016/production/after-production.json) |
| Segredos/CSP/console/conta entre abas | Zero canários vazados, violações CSP ou erros de console; troca entre abas confirmada no build efetivo |
| PDF Poppler / inspeção |11 PDFs,40 páginas A4,0 problemas de margens/numeração detectados — [inspeção](../../test-results/016/artifacts/014/pdf-inspection.json), [contato](../../test-results/016/artifacts/014/contact.png); revisão visual de contato e páginas representativas |
| Tracing readiness |16 arquivos SQL existentes no tracing health e0 helpers de teste — [prova](../../test-results/016/production-tracing.json) |
| Dependências |21 efeitos dev (19moderados/2baixos),0altas/críticas; runtime0 — [completo](../../test-results/016/dependency-audit-full.json), [runtime](../../test-results/016/dependency-audit-runtime.json) |
| Preservação / versões / revisão estática |001–015 inalteradas,0 versões de pacotes alteradas; licenças e scripts declarados inventariados — [prova](../../test-results/016/source-and-dependencies.json) |
| Whitespace/links/documentação | Validação final registrada em `verification-summary.json` |

## 15. Regressões e ocorrências

Primeiras execuções dos testes PDF ainda regeneraram fixtures de saída nos caminhos legados; esse comportamento foi identificado e corrigido para as execuções seguintes, que usam `test-results/016/artifacts`. Relatórios/manifests históricos não foram atualizados para atribuir novos resultados às entregas antigas; fixtures regeneradas não devem ser confundidas com os hashes históricos.

Primeira passagem auth registrou `Router action dispatched before initialization` do Next durante a execução de desenvolvimento; log foi preservado. Reexecução isolada com código estável e verificação estrita de console passou; não se afirma diagnóstico de causa raiz comprovado nem se ignora erro. Demais oito regressões passaram. Não foi removida asserção de console, CSP, canário ou segurança para obter sucesso.

Sem redesenho visual; preservados shell, componentes, paginação e padrões responsivos/acessíveis. Axe/teclado/foco/modais/texto200% em1440/768/320px nos runners aplicáveis, sem relaxar validações anteriores. Chrome/Axe não equivalem a certificação, leitores de tela manuais ou teclado virtual físico. Não atribuir homologação de outros navegadores/dispositivos.

### Consultas e respostas avaliadas

O ensaio de produção016 registrou27 chamadas de API no navegador e67 ao transporte controlado Stripe. A passagem final015 registrou24/67: as três chamadas adicionais são checagens passivas de sessão em dashboard, treino e troca de usuário provocadas por foco/pageshow/timing, preservadas como comportamento necessário de segurança. Não foram acrescentadas consultas iniciais duplicadas de indicadores/Portal; não se afirma ganho universal de desempenho nem remove checagens para melhorar números. [JSON016](../../test-results/016/production/after-production.json) guarda caminhos/bytes/chaves sem conteúdo privado.

DTOs continuam mínimos: sessão78B, lista de exercício245B, avaliação770B e fotos308B no mesmo conjunto sintético. Comparações recolhidas não consultam; detalhes continuam sob demanda; paginação e cancelamento015 preservados. Health faz consulta de prontidão explícita e lê SQL do processo, sem consultar provedores. Não houve refatoração ampla ou nova dependência para desempenho.

## 16. Evidências técnicas

`test-results/016`: baseline-source/status Git, matriz rastreável, operations-proof, logs antes/depois do webhook, regressões de navegador, suite final, lint/typecheck, audits de dependências e `production/` com build, JSONs/capturas/canários. Índice/manifesto final fornecem hashes/saídas. Não copiar credenciais, tokens, ledger completo ou dados reais para relatório. Dados geométricos/sintéticos dos testes não são fallback de runtime.

## 17. Riscos residuais

Operação de eliminação exige manutenção/suspensão; não promete disponibilidade contínua, expurgo de conteúdo livre sobre terceiros, prazo legal automático ou exclusão universal do financeiro. Ledger antigo válido não é detectado somente pelo HMAC; rotação/perda de segredo e checkpoint desconhecido bloqueiam restore. Tombstones requerem processamento e política de descarte. Grande volume exige várias passagens/exportação limitada explícita, sem truncar silenciosamente. PDFs síncronos mantêm limites existentes; nova otimização de worker só com evidência de carga. Testes locais não definem SLA/RPO/RTO nem comprovam operação real de nuvem.

## 18. Decisões necessárias do fundador

Aprovar com responsável competente: identidade jurídica/canal/papéis/finalidades, retenções financeiras/compartilhadas/ledger/backups, tratamento de direitos e cópias, operadores/transferências/contratos, responsáveis operacionais/IAM/alertas, metas/RPO/RTO e janela de manutenção, credenciais/ambiente para homologação externa e aceite antes de dados reais. Esses pontos não foram substituídos por decisões técnicas inventadas.

## 19. Recomendações para017

Pode desenvolver anamnese apenas no ambiente local/isolado autorizado, reutilizando identidade/vínculo/autorização, schemas versionados, finalidade/retentiva e controles de eliminação. Delimitar direitos de acesso e histórico antes de coletar informação adicional. Não antecipar acesso mobile/portal, modalidade nova ou Connect. Homologação externa deve ser autorizada/configurada separadamente; produção continua bloqueada.

## 20. Veredito por ambiente

| Ambiente/operação | Veredito | Fundamentação |
| --- | --- | --- |
| Desenvolvimento local | **GO local delimitado** | Código e225 testes/integrações controladas aprovados; banco persistente continua sem autorização de migration |
| Testes isolados sintéticos | **GO isolado sintético** | PostgreSQL descartável, provedores controlados e evidências específicas aprovadas |
| Homologação externa | NÃO VALIDADA / sem GO | Stripe/R2/SMTP reais sem credenciais/configuração; nenhuma execução externa |
| Produção/dados reais | **NO-GO** | FF015-11 parcial, decisões jurídicas/operação real/integrações/backup/IAM/agendas/alertas não comprovados |

Conclusão técnica local confirmada pelas evidências abaixo. Não há certificação OWASP/LGPD, autorização automática para produção ou implementação dos Marcos017–030.
