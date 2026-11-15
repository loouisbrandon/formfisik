# Operação e recuperação do núcleo — 016

Preparação e ensaios locais com dados sintéticos. Não executar exemplos em banco persistente, configurar produção, alterar credenciais ou provisionar recursos sem autorização específica. FormFisik usa infraestrutura própria; não se presume compartilhamento empresarial.

## Configuração e diagnóstico

`npm run operations:check` requer configuração de servidor e credencial operacional; lê banco e emite somente schema pronto/não pronto, indicadores básicos de privilégio da própria conexão (não do runtime de outro ambiente), presença/formato de configuração e contagens de temporários/fotos/eliminações/reconciliação. `externalHomologation:false` é deliberado: variável preenchida não comprova conectividade, permissão ou entrega. Falha retorna código não zero e evento estático, sem despejar env, URL ou resposta do provedor.

`GET /api/health` continua público: 200 `{status:"ok"}` somente com histórico completo/checksums corretos; 503 `{status:"unavailable"}` em schema parcial/divergente/indisponível. No-store, sem detalhes internos. Manifesto de SQL é empacotado apenas no servidor e cacheado por processo. Reiniciar o processo ao trocar versão, conforme implantação futura autorizada.

Segregar bancos/segredos/domínios de teste e produção. SDK financeiro preserva guardas local/test-only; nenhuma flag de produção foi criada. Não imprimir segredos nem enviar screenshots de env. SMTP de teste fica em loopback; domínio/TLS/entregabilidade reais não foram homologados.

## Migrations e recuperação de falha

1. Identificar versão/ambiente autorizado e obter backup revisado. Nunca deduzir estado de aplicação pela presença de SQL.
2. Comparar `schema_migrations` com arquivos versionados. Migrations devem formar sequência sem lacuna; histórico aplicado precisa ser prefixo exato com checksums. Arquivos 001–015 não foram editados; 016 é aditivo.
3. `npm run db:migrate` mantém lock exclusivo e transação por migration. Falha reverte aquela migration e conserva anteriores; corrigir somente arquivo ainda não aplicado ou criar nova migration. Não editar checksum aplicado para forçar passagem.
4. Reexecutar após tratar a causa. Divergência/gap/checksum desconhecido requer investigação, sem aplicar próximas migrations. Validar health e smoke antes da abertura.
5. SQL016 cria fila/tombstones e `workout_operation_keys.invalidated_at`, sem backfill destrutivo nem exclusão existente. DDL pode aguardar locks; dimensionar janela e validação em staging autorizado. Rollback operacional preferencial é corrigir para frente; não retirar tabelas de ledger com trabalhos ativos.

## Menor privilégio

Template [runtime-grants.sql](../../db/operations/runtime-grants.sql) destina-se a papel dedicado já criado, sem SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS/ownership. Revisar permissões existentes e herdadas antes; o template não remove todos os grants prévios nem cria login/senha. Exemplo futuro: `psql -v ON_ERROR_STOP=1 -v runtime_role=PAPEL_REVISADO -f db/operations/runtime-grants.sql`, conectado explicitamente ao ambiente aprovado por mecanismo seguro.

Credencial runtime sem ledger/DDL/DELETE de usuários/UPDATE de segurança. Operador, migrador e workers de expurgo/catálogo usam credenciais separadas aprovadas. Grants novos exigem revisão a cada migration. Teste local usa SET ROLE sobre papel restrito, não comprova login/IAM/TLS, contas de nuvem ou segregação real no Railway. Não confundir sinal básico do diagnóstico com certificação de menor privilégio integral.

## Eliminação: contratos de CLI

Antes: revisão do direito/identidade, definição exata do proprietário/vínculo e categorias, retenções, impacto em cobranças/contribuições, aprovação registrada, manutenção isolada e backup/ledger protegidos. Suspender pelo controle015 com autorização; isso revoga sessões e não cancela Stripe. Não desativar conta real como parte desta entrega.

Todos os comandos exigem `--database-confirmed=NOME_EXATO`. Mutações exigem também `--apply --identity-and-scope-verified --retention-reviewed --maintenance-verified`. Flags não comprovam aprovação; a referência é um protocolo UUID, sem dados clínicos ou documentos em texto livre.

- Solicitar: `npm run privacy:erasure -- request student OWNER_UUID LINK_UUID JOB_UUID APPROVAL_UUID` mais as confirmações. Para conta elegível, `professional OWNER_UUID OWNER_UUID JOB_UUID APPROVAL_UUID`.
- Consultar: `npm run privacy:erasure -- status 1 --database-confirmed=NOME_EXATO`. Páginas de20, ordem criação desc/UUID; contagem total e página vazia explícitas. Sem chaves de objeto, perfil ou referência de aprovação na saída.
- Executar/repetir: `npm run privacy:erasure -- run JOB_UUID` mais confirmações. Até20 objetos por passagem; pendência/falha retorna código não zero. Repetir depois do due_at, acompanhando status, até conclusão cabível. Jobs com milhares de objetos exigem várias passagens, sem carregar tudo no frontend.
- Exportar ledger: `npm run privacy:erasure -- ledger-export /DIRETORIO_PRIVADO/ledger-VERSAO.json --database-confirmed=NOME_EXATO`. Destino absoluto fora do repo, criação exclusiva 0600, não sobrescreve. Não usar public, bundle, anexos de suporte ou stdout. Conteúdo é pseudonimizado, não anônimo. O limite explícito é5000 jobs/10000 chaves e aproximadamente11MB; excesso é recusado, sem exportação parcial silenciosa.
- Replay: `npm run privacy:erasure -- ledger-replay /DIRETORIO_PRIVADO/ledger-VERSAO.json` mais confirmações, somente em restore isolado, antes de qualquer tráfego. Assinatura/estrutura/adulteração/conflito são verificados; contas restauradas são suspensas novamente.

Não remover tombstone/ledger por idade sem decisão. Não reativar conta com trabalho pendente; não há rollback de conteúdo já eliminado. Erro de SQL mantém exclusão relacional transacional e trabalho retomável. Erro externo não é mascarado como concluído.

## Backup/restore e continuidade

Ensaiado com PostgreSQL18 do contêiner descartável: `pg_dump -Fc --no-owner --no-acl` em origem sintética e `pg_restore --exit-on-error --no-owner --no-acl` em **novo banco vazio**; compatibilidade/grants precisam de revisão no destino real. Ferramentas oficiais: [pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html) e [pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html). Não usar dump de origem não confiável; restore executa SQL do arquivo. Backup do banco não inclui automaticamente objetos R2, papéis/segredos, configuração de nuvem ou ledger independente posterior ao snapshot.

Procedimento futuro autorizado:

1. Isolar tráfego e credenciais runtime, identificar incidente/escopo, preservar evidências mínimas conforme runbook. Restaurar em destino novo e restrito; nunca sobrescrever o banco ativo como teste.
2. Verificar origem, versão, integridade, proteção e hash do backup. Fazer restore com falha explícita; validar sequência/checksums e constraints. Aplicar somente migrations posteriores revisadas/autorizadas.
3. Obter ledger mais recente de armazenamento independente protegido, inclusive eliminações após o snapshot. Conferir checkpoint/hash e atualidade com operador. HMAC não cifra nem detecta rollback para versão antiga válida. Chave perdida/rotacionada sem plano, ledger incompleto ou atualidade desconhecida: **não reabrir**.
4. Replay e worker até limpar os escopos cabíveis, preservar bloqueios financeiros/jurídicos, reconciliar objetos externos e expirações. Ensaio usa store privado controlado; não comprova restore R2 real.
5. Confirmar sessões antigas revogadas, identidade/propriedade/assinatura, conteúdo eliminado ausente e carteira alheia preservada. Rodar smoke, health e diagnóstico. Registrar resultados antes da decisão de reabertura do responsável.
6. Reativação, quando cabível, por decisão explícita e login novo; nunca por replay/restore automático. Registrar versão e limitações. RPO/RTO e metas de continuidade ainda precisam de aprovação e ensaio representativo; tempos locais não são SLA.

## Rotinas e incidentes

Reutilizar `db:cleanup`, `photos:cleanup`, `billing:reconcile` e `privacy:erasure run`. Agendar somente em infraestrutura autorizada futura; nenhuma agenda/serviço foi provisionado. Para erasure, `npm run privacy:erasure -- run-due` mais confirmações seleciona até5 trabalhos já aprovados/vencidos, incluindo tombstones de concluídos, sem logs de IDs/conteúdo. Saída distingue concluídos, aguardando, bloqueados e falhos; não interpreta fila aguardando como eliminação concluída. Bloqueios jurídicos sem objetos ficam para revisão explícita, sem repetição automática. Não criar endpoint web privilegiado para cron.

Operação deve alertar sobre códigos de falha/429/503, schema não pronto, backlog/idade de cleanup, falha Stripe/R2/SMTP, lease vencido, pendências de eliminação e backup/replay não confirmados. Diagnóstico local fornece contagens, mas não envia alertas nem substitui observabilidade de nuvem. Definir responsável/escalonamento, retenção/acesso de logs, MFA/IAM, cifragem e testes de alerta antes de dados reais. Não coletar corpo, cookies, token, chave, URL de recuperação, cartão, imagens ou notas clínicas no APM/proxy.

[Plano de incidentes](incidentes-de-seguranca.md), [R2](fotografias-r2.md) e [Stripe](stripe-local.md) permanecem válidos. Webhook agora compartilha leitor com limite de bytes e deadline total15s, preservando corpo exato para assinatura; erro lento inválido retorna400 e tamanho acima de256KiB retorna413, sem consultar banco ou Stripe. Proteção distribuída de borda ainda depende de infraestrutura.

## ComplementoCRM018

Migration018 e `runtime-grants.sql` preparados, sem aplicação persistente. Antes de autorizar ambiente alvo: revisar backup e replay, grants das seis tabelas CRM e sequência de eventos, executar ensaio com worker separado. Runtime lê/insere eventos, sem alterar/apagar; DDL e eliminação são funções de credenciais separadas. Ensaio018 inclui restauração de tarefa/associação e sua eliminação via replay, preservando outra carteira. Nenhuma credencial externa foi criada. Crescimento de auditoria/operações requer retenção aprovada e medição antes de produção; não apagar tombstones/chaves por conta própria. [Relatório018](../engenharia/entrega-018.md).

## Complemento019 — comercial administrativo

Migration019 aditiva e grants preparados, exclusivamente ensaiados em PostgreSQL descartável. Runtime lê/insere versões/eventos sem alterá-los; execuções permitem UPDATE apenas de voided_at/void_reason. Substituição de obrigações de rascunho requer DELETE delimitado pelo repositório; worker de eliminação usa outro papel. Não usar GRANT ALL em ambiente alvo.

Backup/restauração019 inclui acordo, obrigação e execução, seguido de ledger replay que remove novamente o aluno sem apagar outra carteira. Revisar staging/backup/retentiva/grants e autorização antes de qualquer aplicação persistente. Valores administrativos não são fatos financeiros; futuro020 precisa definir retenções e bloqueios próprios. Nenhuma rotina, credencial ou serviço foi provisionado. [Relatório019](../engenharia/entrega-019.md).

### Estatísticas PostgreSQL — ensaio 019

Após importações em massa, verificar autovacuum/autoanalyze e planos das listas comerciais/CRM com operador autorizado. O fixture de 2.500 acordos sem estatísticas produziu consulta de 4.321 ms; após ANALYZE controlado, 33,66 ms (página observada em 40,04 ms). Evidências anteriores e posteriores preservadas em test-results/019. Não ampliar privilégios do runtime nem assumir SLA ou desempenho produtivo com esse ensaio sintético.

## Extensão021

Worker elimina agenda antes das dependências019/aluno e invalida idempotência do sujeito. Ensaio operacional021 cria reserva, executa pg_dump/pg_restore e confirma remoção após replay do ledger assinado. Privilégios runtime verificam auditoria imutável e proibição de apagar ocorrências. Usar apenas bancos descartáveis `_test`; homologação de produção permanece separada.

## Extensão022

Eliminar checkin_reviews/submissions/invitations antes de ocorrências/atribuições e prescrições/catálogo/aluno. Invalidar checkin_operations do sujeito; preservar modelos usados por outros alunos. Ensaio022 cobre dump/restore com submissão e eliminação via ledger antes de tráfego, além de runtime sem UPDATE de respostas/devolutivas e DELETE de auditoria. Não aplicar migration023/grants em banco persistente sem autorização operacional.

## Ampliação024

Comunicação integra o worker/ledger016 antes das referências canônicas: registros/correções, recibos e eventos do vínculo, saneamento de intenção/digest; catálogo somente em encerramento profissional elegível. Grants separados preservam imutabilidade. Ensaio024 inclui pg_dump/restore/replay e escrita real sob runtime restrito; não autoriza migração persistente ou operação de dados reais. [Runbook024](comunicacao.md), [relatório](../engenharia/entrega-024.md).
