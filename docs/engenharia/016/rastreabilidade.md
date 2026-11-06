# Rastreabilidade da estabilização 016

Linha de base: `test-results/016/baseline-source.json` e status Git inicial. Preserva alterações anteriores 014/015 e consolidação Personal 1.0. Sem autorização de produção. Estados iniciais abaixo serão confrontados com evidências finais.

| Pendência / origem | Arquivos / impacto e risco | Correção e verificação necessárias | Classe / estado inicial |
| --- | --- | --- | --- |
| FF015-11: eliminação integral | FKs 006–015, snapshots, objetos R2; exclusão incompleta ou de terceiros | Fila operacional idempotente por titular/proprietário; bloqueios de retenção; saneamento transacional após DELETE externo; falha/retry/interrupção/isolamento e replay de eliminações após restore | Técnica local + decisão jurídica; IMPLEMENTADO; verificado localmente conforme provas016 |
| FF015-11: histórico financeiro/contribuições | `billing_*`, catálogo/moderação; retenção não decidida e conteúdo de outros titulares | Detectar dependências e bloquear eliminação integral sem apagar fatos financeiros ou conteúdo compartilhado; decisões de controlador/jurídico não inventadas | Jurídica/fundador; BLOQUEADO |
| 014: schema ainda não aplicado no banco existente | SQL 001–015; implantação parcial e incompatibilidade | Auditar sequência/checksums, banco vazio e upgrade com dados sintéticos, rollback de falha e backup/restore; manter banco existente intacto | Técnica local; IMPLEMENTADO; verificado localmente conforme provas016; aplicação persistente NÃO AUTORIZADA |
| FF015-11: restore e grants | Migrador, health, permissões; retorno de dados eliminados ou DDL indevido | Ensaio pg_dump/pg_restore, replay de ledger autenticado e privilégio runtime restrito, detecção de schema incompleto | Técnica local; IMPLEMENTADO; verificado localmente conforme provas016; infraestrutura real pendente |
| FF015-11: rotinas/logs/alertas | Cleanup/reconciliação e diagnóstico; filas sem operação/sem visibilidade | Reutilizar workers, diagnóstico por contagens/códigos sem segredos e runbooks com responsáveis/ordem/recuperação | Técnica local + operacional; IMPLEMENTADO; verificado localmente conforme provas016; scheduler externo NÃO PROVISIONADO |
| Stripe 005/006/015 | `subscriptions/`, webhook e SDK; trial/acesso indevido | Reauditar e executar testes canônicos/assinados/falhas/concorrrência; sem chave de teste disponível, homologação externa não executada | Técnica local; testes controlados aprovados. Credenciais; BLOQUEADO externo |
| R2 013/014/015 | Store privado, worker/autorizações; exposição ou órfãos | Reutilizar store e testar PUT/GET/DELETE/recuperação controlados, limites/EXIF/isolamento; não criar bucket | Técnica local; testes controlados aprovados. Credenciais/infra; BLOQUEADO externo |
| SMTP | Confirmação/reset; entrega e domínio não homologados | Revalidar servidor loopback, documentar TLS/domínio/entregabilidade externos pendentes | Local aprovado; externo BLOQUEADO |
| FF015-10: ferramentas | Lockfile; advisories transitivos moderados/baixos | Revisar audit/licenças, sem upgrades massivos/downgrades incompatíveis | Técnica; revisado: 21 efeitos dev (19 moderados/2 baixos),0 runtime; sem alta/crítica conhecida |
| Índice chama 015 provisória | `docs/README.md`, inventário, arquitetura e roadmap; decisão baseada em estado antigo | Atualizar estado atual com manifesto final 015 (210 testes) preservando relatório/veredito e auditoria documental histórica | Documental local; IMPLEMENTADO; verificado localmente conforme provas016 |
| Retenção/bases/canal/contratos/IAM/backup real | Inventário, runbooks; dados reais sem governança aprovada | Distinguir política proposta de executada; registrar responsáveis e validação necessária | Fundador/jurídica/operação/infra; BLOQUEADO para produção |
| Personal 1.0 futura | Marcos 017–030 | Não antecipar Connect, anamnese, mobile ou novas modalidades; apenas recomendações futuras | FORA DO ESCOPO |

## Descobertas durante a execução

- FF016-01: webhook bruto tinha limite de tamanho sem prazo total. Regressão antes falhou; compartilhamento de `boundedBody` preserva bytes e assinatura, com deadline15s/256KiB. Regressores Stripe e stream lento obrigatórios.
- FF016-02: health anterior aceitava qualquer histórico de migrations, inclusive incompleto. Agora exige sequência/checksum completo, inclui SQL no tracing e retorna somente status público. Migração rejeita gap/histórico divergente antes de DDL novo.
- FF016-03: eliminação de resultado de operação em lote não deve recriar titular nem corromper outro aluno. `invalidated_at`, remoção só do resultado autorizado e409 no replay; teste preserva bytes JSON do histórico remanescente.
- FF016-04: um pedido de conta profissional não autoriza apagar carteira de alunos. Plano profissional bloqueia carteira restante; vínculos de terceiros exigem revisão/pedido próprios. Não combinar titulares ou carteiras por e-mail.
- FF016-05: restore reaplica ledger autenticado e suspende contas restauradas antes da abertura. Ledger atual fora do snapshot é dependência operacional; HMAC não certifica atualidade nem anonimização.
- FF016-06: reexecução de testes escrevia artefatos em diretórios históricos. Fixtures PDF agora usam `TEST_ARTIFACT_ROOT`/`test-results/current` e navegador de produção aceita diretório explícito da entrega. Relatórios históricos não são reescritos como novos resultados.

## Estado final por classe

Técnicos locais: implementados e verificados na suíte225, operações reais em PostgreSQL descartável e navegador. Financeiro/contribuições/carteira pendente: bloqueados pelo próprio mecanismo, com retenção/escopo por titular a decidir, sem presumir exclusão integral resolvida. Credenciais/infraestrutura externa: Stripe/R2/SMTP reais não executados. Fundador/jurídico/operação real: pendentes e bloqueadores de produção. Marcos017–030: não implementados. NO-GO original015 preservado; não há reclassificação de FF015-11 para liberação.

Evidências finais: [225 testes](../../../test-results/016/logs/suite-final.log), [ensaio operacional](../../../test-results/016/operations-proof.json), [navegador de produção](../../../test-results/016/production/after-production.json) e [regressões Chrome](../../../test-results/016/browser-regressions.json). FF016-02–05 implementados/verificados localmente; FF016-06 corrige destino de novas evidências sem atribuir execução atual a resultados históricos. FF015-11 permanece bloqueio parcial para produção.
