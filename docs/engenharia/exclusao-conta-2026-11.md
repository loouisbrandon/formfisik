# Encerramento e exclusão de conta — 029

Estado: IMPLEMENTADO e validado localmente; migration e operação externa NÃO APLICADAS. FormFisik é empresa independente fundada por Brandon Louis.

## Contrato e regras

Configurações → Privacidade e segurança oferece Excluir conta. GET/POST `/api/settings/closure` exige sessão opaca, profissional, e-mail confirmado e rate por conta. POST exige JSON estrito até 4KiB, Origin canônico, senha atual e confirmação literal `EXCLUIR MINHA CONTA`. Identidade do alvo vem exclusivamente da sessão. Senha e sessão são verificadas antes do provedor e novamente sob lock de usuário/billing. Leituras não renovam sessão.

Sem assinatura e sem Checkout em andamento: pedido é persistido e acesso/sessões encerrados imediatamente. Com assinatura: estado canônico fresco obrigatório, cancelamento de renovação confirmado pelo fluxo existente; gravação de data de fim confirmada no servidor. Falha/estado incerto não é convertido em ausência de assinatura. Checkout aberto bloqueia o pedido; cancelá-lo/resolvê-lo antes de repetir. Pedidos idempotentes; nenhum botão desfaz a exclusão nesta entrega. Nova contratação é bloqueada após pedido.

A data usa timestamptz do PostgreSQL; frontend não escolhe prazo. Sessões existentes e novas são negadas no prazo, sem depender de cron. Não há exclusão física síncrona de todos os dados no POST: o acesso encerra e a eliminação seletiva é operacional. Textos devem distinguir essas etapas.

Migration 029 cria account_closures com índice único por usuário, prazo e estado/protocolo sem FK, preservado após remoção da conta. Não contém senha, e-mail, aluno ou detalhes financeiros. Ledger HMAC inclui pedidos/data para reaplicação após restore. Retenção dos tombstones precisa de política operacional aprovada.

## Operação e menor privilégio

Aplicar migration029 e grants revisados somente com autorização de ambiente. Runtime lê/insere pedidos e pode atualizar disabled_at para encerramento próprio via endpoint autorizado; não recebe DELETE de credentials/users nem acesso ao ledger de eliminação. Worker separado usa credencial operacional fora do processo web:

```sh
node --conditions=react-server --import tsx scripts/account-closures.ts --database-confirmed=NOME_DO_BANCO --retention-reviewed --apply --maintenance-verified
```

A flag exige alvo explícito e revisão, não constitui aprovação por si. Processa até 20 por execução. Agendar em ambiente autorizado (por exemplo, a cada minuto) com monitoramento de falhas e backlog. Nenhum cron foi provisionado nesta alteração. Revalida renovação/prorrogação: inconsistência bloqueia limpeza; nunca apagar contrato prorrogado silenciosamente. Pedidos vencidos permanecem sem acesso por regra de sessão.

Worker suspende conta, revoga sessões, remove credenciais/resets/trocas de e-mail pendentes e saneia perfil e foto/publicação; CPF/endereço privados só são saneados automaticamente se não houver conta de billing/financeiro vinculada. Registra job de eliminação016 e conclui fechamento. Fluxo016 continua impondo quiescência e bloqueios de retenção financeira/históricos/contribuições. O mesmo comando processa em lote de até 20 os jobs016 originados exclusivamente destes pedidos, com escopo, manutenção, retenção e ledger verificados para eliminar o restante permitido; não contornar bloqueios nem apagar dados de alunos indiscriminadamente. Usuário autorizou encerramento com preservação de retenções obrigatórias; isso não aprova uma política jurídica genérica.

Exportar ledger protegido após pedidos e antes de backup/restore; reaplicar antes de reabrir tráfego. Ledger inclui closures mesmo quando job016 ainda não foi criado. Credencial administrativa, ledger e backups nunca entram em bundles ou no serviço web.

## Dependências e limites externos

Stripe em staging permanece bloqueado por localhost/test-only. Portanto encerramento de conta sem assinatura pode ser homologado depois de migration/deploy autorizados; assinatura vigente externa falha fechada até homologação Billing própria. Não há cobrança real, alteração de regras de trial, migrations remotas ou deploy nesta entrega.

Não executar em pessoas reais para testes. Homologação requer banco descartável e fixtures de provedor; Gmail/Resend não são chamados por testes. Interface responsiva conserva shell compartilhado e não usa rolagem global nova.

## Evidências locais

- 60 testes de fechamento, autenticação, recuperação e lifecycle de assinatura aprovados em PostgreSQL descartável.
- 11 testes específicos aprovados na revisão final do serviço: concorrência no plano pago, expiração sem cron, indisponibilidade do provedor, retenção financeira, replay do ledger, runtime restrito com DDL/DELETE negados e bloqueio de eliminação após alteração canônica do cancelamento. Os 5 casos iniciais de fechamento estão incluídos na execução de 60; não somar como testes distintos.
- Lint e typecheck aprovados; build com canários aprovado sem achados em 282 artefatos públicos/14 canários. Revisão final do worker também compilada e validada.
- Prévia isolada com API sintética: 1440/768/320px, sem overflow horizontal; campos/ação com bloqueio inicial e habilitação após frase e senha. Não é homologação de tela integrada em staging.
- Nenhuma chamada financeira externa, dado real ou execução em banco persistente foi realizada.
