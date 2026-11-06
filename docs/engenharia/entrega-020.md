# Entrega 020 — Financeiro profissional, cobrança e conciliação

## 1. Status geral

IMPLEMENTADO E VERIFICADO LOCALMENTE NO ESCOPO CONTROLADO. Domínio implementado com PostgreSQL descartável, dados sintéticos e gateway controlado explicitamente injetado em testes. Stripe externo, operação e produção NÃO HOMOLOGADOS. FormFisik independente fundada por Brandon Louis; não se presume formalização jurídica.

## 2. Resumo executivo

Profissional prepara obrigações financeiras a partir de contratação019, escolhe periodicidade explícita, registra e corrige pagamentos externos, consulta recebimentos, pendências, ajustes e repasses. Contas, onboarding, checkout, recorrência finita, reembolsos, disputas e recuperação são exercitados por provedor controlado; a aplicação não seleciona esse provedor por ambiente. Ativação e transporte Stripe externo continuam bloqueados até decisão de modelo/configuração/responsabilidade e homologação autorizada. Essa fronteira é uma limitação explícita, não integração de rede declarada pronta.

## 3. Arquivos alterados

Novos: migration020; src/server/finance/{core,provider,service,queries,handlers}.ts; src/modules/finance/{schema,api,area}.ts[x]; página /financeiro; API /api/finance e /api/stripe/connect/webhook; script reconcile-finance; tests/finance.test.ts, finance-e2e.ts e helpers controlled-finance/finance-browser-server; módulo/API/privacidade/runbook/ADR021/relatório.

Integrações limitadas: navegação/shell, guarda de retenção016, grants runtime e scripts package.json; regressão de navegação, runner de produção e operacional. Documentação: índice/inventário/roadmap/arquitetura/modelo/diretrizes financeiras/alunos/CRM/segurança/privacidade/Stripe/Design System/README/CHANGELOG. Manifesto exato em test-results/020/source-audit.json compara baseline anterior à020, incluindo trabalho preexistente não commitado. Sem reset, worktree, commit ou atribuição do diff inteiro à020.

## 4. Componentes reutilizados

ProfessionalShell, memória privada de navegação, aviso de alterações, action/control, Feedback e Pagination; readSession/entitlement/professionalAccess, Origin/rate/body/headers; PostgreSQL/pg/migrador; SDK Stripe para assinatura; owner lock18018 compartilhado com019/CRM; carteira008 e contratação/versionamento019; worker016. Nenhuma dependência nova ou upgrade. Não duplicar usuário, serviço, plano, contrato ou editor clínico.

## 5. Arquitetura Stripe Connect

Direct Charges é recomendação técnica condicionada ao profissional como prestador/comerciante, conta merchant/dashboard completo e onboarding hospedado. Accounts v2 avaliado conforme documentação atual, sem adoção automática de tipo legado. Transporte real ainda não implementado/ativado enquanto configuração Brasil, custos, responsabilidade por perdas, termos e homologação não estiverem disponíveis. RuntimeGateway recusa operações externas com503. Billing SaaS permanece isolado e sem alteração de preço/trial.

## 6. ADR

[ADR021](../arquitetura/ADR-021-financeiro-profissional-connect.md) registra Direct/Destination/Separate Charges and Transfers, MoR, capacidades/KYC, risco, tarifas, métodos, API/contas, limitações Brasil, recomendação e decisões do fundador. Pesquisa em fontes oficiais Stripe, sem criar recursos ou instalar plugin/CLI. Não pressupõe elegibilidade brasileira a partir de exemplo estrangeiro, nem confunde modelo técnico com responsabilidade jurídica definitiva.

## 7. Integração com019

Finance_agreements referencia contratação canônica e mesmo aluno/owner, preserva versão/preço/BRL/vigência. Preparação e checkout revalidam elegibilidade; frontend não informa novo preço/recebedor. Uma configuração por contratação impede dívida duplicada; renovação administrativa019 cria outro acordo sem cobrança implícita. Cancelamento/falha financeira preserva019, CRM, treinos e demais dados. API billingIntent019 continua compatível/administrativa; relatórios e migrations001–019 preservados.

## 8. Modelo de dados

Oito tabelas próprias: finance_accounts, finance_agreements, finance_charges, finance_external_receipts, finance_operations, finance_events, finance_webhooks e finance_payouts. FKs compostas de proprietário/contrato/aluno; identificação exclusiva de recebedor e intenção; constraints de valores/estados; índice de obrigação por ciclo. Eventos mínimos e intenções privadas, sem raw webhook, PAN/CVV, KYC ou banco.

Obrigações têm valor/data/ciclo imutáveis; recebimentos externos têm conteúdo imutável, invalidação justificada e substituição vinculada. Configuração não substitui contrato019. Totais SQL bigint via strings; valores individuais inteiros em centavos, BRL e limites explícitos. Queries e contratos em [API](api-financeiro-profissional.md).

## 9. Migrations

020 aditiva, somente contêiner descartável formfisik-020-test PostgreSQL18/loopback5550; bancos separados para suíte, browser, produção e bancos próprios do runner operacional. Migrations001–019 não alteradas. Aplicação vazia/sequencial/repetida, upgrade desde013, constraints/índices, falha/rollback/checksum/gap, pg_dump/restore e retenção financeira ensaiados. Estado final em operations/operations-proof.json:20 migrations,123 FKs,0 constraints não validadas.

020 foi consolidada durante desenvolvimento e somente os bancos descartáveis foram recriados antes da rodada final. Uma rodada iniciada com checksum anterior foi invalidada e preservada em diagnostics/full-tests-development.log; não houve correção de checksum ou migration persistente. Grants mínimos preparados e testados, sem DELETE financeiro no runtime.

## 10. Endpoints

GET/POST /api/finance privados; POST /api/stripe/connect/webhook por assinatura própria. Sessão/entitlement/Origin/owner/limites; corpos16KiB e webhook256KiB/15s; GET120/POST30 por minuto. Views e comandos strict, mensagens estáticas e DTO mínimo. Históricos/contratos/recebimentos/intenções 20/página no SQL; períodos de até367 datas. [Contrato completo](api-financeiro-profissional.md).

## 11. Contas conectadas

Iniciar/retomar onboarding controlado, atualizar situação/requisitos/capacidades, diferenciar recebimento/payout e restrição. Conta vinculada pelo servidor; nenhum acct_ID arbitrário aceito. URLs somente hosts HTTPS Stripe permitidos. Não armazenar documentos pessoais/banco; link temporário não persiste como resultado idempotente. UI operacional sem gateway mostra indisponibilidade, sem fingir onboarding externo.

## 12. Cobranças avulsas

Configuração única preserva total019 e gera obrigação com vencimento inicial. Checkout controlado depende de conta apta, acordo elegível e chave durável, sem alterar pagamento pelo retorno. Timeout depois da criação retorna à mesma operação; criação concorrente/diferente não gera segunda cobrança. Webhook/refresh canônico confirma fato pago. Transporte Checkout externo permanece pendente.

## 13. Cobranças recorrentes

Periodicidade explícita 1/3/6/12 meses,1..120 ciclos dentro da vigência; total contratado dividido igualmente para recorrência. Não é duração do serviço inferida, parcelamento de cartão ou trial de aluno. Parcela externa divide resto em centavos, sem débito automático. Gateway controlado cobre preparação/assinatura, falha, recuperação, cancelamento e estado de término. Não executa renovação comercial019 ou recorrência financeira infinita. Compatibilidade efetiva dos ciclos/âncoras/cancel_at na Stripe externa exige transporte/homologação.

## 14. Webhooks

SDK verifica assinatura criptográfica/timestamp sobre corpo bruto; Connect distinto de SaaS, conta conhecida e livemode false. Eventos snapshot v1, sem suporte thin/v2 presumido. Persistência mínima, deduplicação, identidade do evento, lock por profissional, reconsulta canônica e confirmação/fatos atômicos. Falha deixa pendente; recovery via evento ou comando autorizado. Usuário suspenso não impede observação de fato financeiro assinado; não pode operar por sessão.

## 15. Conciliação

Validar conta/domain, referências, assinatura conhecida, total/BRL, valor pago/reembolsado/contestado e datas. Taxas/líquido null permanecem desconhecidos; relação simplificada divergente sinaliza revisão, sem corrigir fato do provedor. Payout por conta/data/status separado, sem atribuição fictícia a cobrança. No Direct Charges proposto não há transferência da plataforma a executar. Pagamento confirmado não significa saldo bancário disponível ou payout concluído.

## 16. Inadimplência

Falha/open/overdue por saldo/data, recuperação canônica, cancelamento/encerramento de ciclo. Não suspende treino, apaga aluno, move CRM ou cancela019 automaticamente. Política de acesso, notificações, carência e recuperação ativa depende de aprovação futura; nenhuma multa/juros/tarifa presumida.

## 17. Reembolsos

Integral/parcial por intenção durável, valor positivo até disponível, conta/referência próprias e motivo; bloqueio de outra intenção incerta, retry mesma chave e consulta canônica. Autorização/reserva ocorre antes de I/O, sem transação SQL aberta na rede. Resposta perdida após refund não duplica operação controlada. Operação externa real permanece indisponível. Taxa eventualmente não devolvida pode produzir líquido negativo, exibido corretamente e separado do valor recebido.

## 18. Contestações

Eventos abrem/atualizam/encerram fatos e valor contestado canônico; preservam histórico/recebimento, sinalizam ajustes e impedem novo reembolso enquanto disputado. Não cria débito/reversão manual nem promete recuperação. Ganho/perda, taxas, saldo negativo e responsabilidade final necessitam homologação com Stripe/termos e revisão jurídica/contábil.

## 19. Pagamentos externos

Pix direto/banco/dinheiro/outro, data, referência, nota e conferência explícita. Não verificado pela Stripe. Valida saldo e concorrência; correção invalida anterior e insere substituto atomicamente, com justificativa e trilha. Invalidação nunca apaga original. Não registrar novo recebimento/correção em configuração cancelada; recebimentos tardios nessa situação exigem fluxo futuro aprovado. Não oferecer falso reembolso Stripe para dinheiro externo.

## 20. Dashboard

/financeiro integrado ao shell: resumo, obrigações, preparação, conta, repasses, histórico, eventos e intenções pendentes. Dados SQL reais do fixture sintético; aplicação sem dados mostra zeros/vazios reais. Valores contratados, manual registrado/conferido e provedor confirmados separados. Recebimentos por data paga, obrigações por vencimento, contratos por início; reembolsos/taxas/líquido são posição atual da coorte recebida, não demonstrativo contábil de movimentos por data. Não duplicar total do contrato por parcela.

Navegação local mobile em seletor nativo, desktop em botões; foco/feedback, preservação de filtros/rascunho, abort/debounce, seções progressivas e paginação. Comissão não definida nem cobrada; custo Stripe desconhecido não apresentado como gratuito. Banco/repasse não inferidos a partir de checkout.

## 21. Segurança

Sessão opaca/profissional confirmado/habilitado/SaaS, owner SQL, FKs e origem em POST; nega IDOR e valor manipulado. Lock compartilhado serializa criação/cancelamento/reembolso e019. Gravações de usuário revalidam conta habilitada sob FOR SHARE na transação; intents duráveis antes de I/O e resultados atômicos. Same key/digest protege retry; incerteza>23h exige operador. Não expor comando privado em listas, processador/credenciais nas props ou logs; sem dados brutos de cartão. Canários Connect e anteriores em build efetivo, CSP, fontes/artefatos e regressões de sessão.

## 22. Privacidade

[Inventário](../privacidade/financeiro-profissional.md): finalidade/acesso/compartilhamento Stripe/retenção, notas e risco de texto livre, KYC sob custódia do provedor. Worker016 bloqueia financial_retention antes de apagar vínculo/019/conta com registros financeiros; replay conserva proteção. Não existe política fiscal inventada, atendimento integral de eliminação financeira ou conformidade jurídica definitiva. Backups, bases/menores/PF/PJ/canais/responsáveis exigem revisão.

## 23. Testes

Rodada ampla final: 313 testes aprovados (286 regressões e 27 financeiros), zero falhas/ignorados/cancelados, duração 318.959 ms; log em full-tests-final.log. Rodadas anteriores estáveis tiveram 306/306 e 311/311; cinco cenários adicionais incluíram retomada durável,24h incertas, cancelamento019 antes de checkout, usuário suspenso com webhook e assinatura expirada/corpo excessivo. Primeira rodada durante evolução de020 invalidada por checksum, preservada; não foi declarada aprovada.

Financeiros cobrem conta/restrição, servidor canônico/UUID/propriedade, precisão/data/período, único/recorrente/manual, reenvio após efeito externo, deduplicação/ordem, rollback/retry, reembolso parcial/integral, disputa/payout/divergência, correções/concorrência, retenção, abuso e DTOs. Ensaio operacional:20 migrations/123FKs, backup/restore/replay/retentiva e runtime com proibições de DELETE/alteração monetária em recebimento.

Dois casos finais adicionais verificam reenvio de checkout após cancelamento019 e cancelamento enquanto o resultado externo é incerto; rodada final em full-tests-final.log. A tentativa de conciliação sem gateway recusa com código estático e exit1, sem criar pool ou consultar banco. ESLint, TypeScript, build real e Chrome/Axe: resultados finais consolidados em verification-summary.json. Produção testa recebimento externo e bloqueio da integração; gateway financeiro fake nunca é selecionado em runtime. Transporte SaaS no ensaio de produção é SDK oficial contra fixture loopback, sem homologação externa.

## 24. Evidências

Em test-results/020: baseline-source.json/baseline-git-status.txt, source-audit.json/final-source-sha256.json, full-tests-final.log, integration-final.log, browser-proof.json/api-measurements.json/browser/, production/after-production.json/after-build.log e capturas, operations/operations-proof.json, query-plan.json, lint.log/typecheck.log, production-tracing.json/documentation-links.json/runtime-cleanup.json e verification-summary.json. Fixtures sintéticos, nenhum dump financeiro real publicado.

Ensaios de desenvolvimento de navegador registraram correções de rota/rótulo do harness, espera de leitura após commit, volume suficiente para página2 e falha transitória JSON de compilação. Asserções não foram removidas; logs anteriores preservados em diagnostics. Uma execução ampla posterior terminou por sinal143 sem resumo válido e foi reexecutada. Uma rodada de produção detectou mensagem de 401 no console; a asserção foi mantida e acrescentou-se diagnóstico de rota/etapa. A repetição sobre o mesmo build final passou com zero erros de console; a ocorrência anterior não foi reproduzida e sua causa não é declarada corrigida. Diagnósticos preservados, sem reduzir controles. Reativação da identidade com pedido de eliminação bloqueado foi corretamente recusada; fixture operacional foi limpo explicitamente antes de reaproveitar a identidade, sem alterar a proteção de runtime.

## 25. Limitações

Gateway normalizado controlado não é transporte Stripe pronto para rede. Sem Checkout/onboarding externo, cartões/3DS/mandatos reais de teste, Accounts v2 thin events, Stripe Test Clocks, PF/PJ/KYC, Pix Automático/boleto/parcelamento de cartão, contabilidade fiscal ou homologação jurídica. Não há liberação live nem variável de bypass.

Até120 ciclos, listas20, período367 datas, payload16KiB e limites de campos. Uma configuração por contrato, sem edição retroativa/reabertura financeira silenciosa. Registro externo tardio em cancelada não implementado. Incerteza antiga exige operador, sem reconciliação externa homologada. Monitor/scheduler não provisionados. Líquido pode exigir explicação de ajustes legítimos; relatório é operacional, não contábil. Axe/Chrome não substituem leitor de tela físico ou aparelhos reais. Query plan sintético não comprova p95/SLA. O ensaio de volume usa2.500 eventos e página de 20; a consulta de fatos financeiros do fixture pequeno levou 0,421 ms, sem alegar carga financeira representativa. O fluxo Chrome registrou 63 chamadas (50 leituras), maior resposta GET de 4.970 bytes. Webpack validado; Turbopack não re-homologado.

## 26. Pendências externas

Transporte Accounts v2/Checkout/Billing/BalanceTransaction/refund/dispute/payout para modelo aprovado, validação Brasil/configuração/capacidades, chave/segredo Connect separados e endpoint autorizado, testes hospedados/Test Clocks e comparação monetária. Também jurídico/contábil/retentiva/canais, domínio/TLS/IAM/grants, migrations/backups/restore/ledger, alertas/agendas e piloto. Não criar recursos, trocar credenciais ou operar banco persistente sem nova autorização.

## 27. Decisões necessárias do fundador

Aprovar MoR e identificação do profissional; configuração/responsabilidade por perdas/tarifas, elegibilidade PF/PJ/menores e suporte/disputas/reembolsos; custos Connect/Billing/meios, termos/consentimento dos ciclos finitos; carência/notificação/acesso em inadimplência; política de retenção/eliminação e contabilidade; eventual comissão em escopo futuro. Nenhuma comissão ou cobrança adicional foi presumida. SaaS R$139,90/mês/30dias/cartão permanece separado.

## 28. Recomendações para021

Agenda deve consumir contratação/serviço/aluno canônicos019 e permissões, distinguindo atendimento agendado, entrega realizada e obrigação financeira. Não inferir pagamento a partir de agendamento ou retirar treino por evento financeiro. Reutilizar eventos/IDs sem duplicar regra monetária. Isso é recomendação, não implementação ou autorização021; pendências020/015 continuam independentes.

## 29. GO/NO-GO local

GO técnico local para o escopo controlado autorizado, com resultados em verification-summary.json. Não declarar Stripe externo pronto ou produção homologada. Sem simulação selecionável na aplicação. Servidores temporários encerrados e banco descartável removido; confirmação em runtime-cleanup.json.

## 30. GO/NO-GO produção

NO-GO mantido. Não realizar deploy, commit, configuração/credencial de produção, cobrança/transferência/payout/reembolso real, migration persistente ou dados reais.020 não homologa Personal1.0, não resolve automaticamente015 e não autoriza021.
