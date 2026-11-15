# Provisionamento restrito da moderação

A auditoria encontrou roles de identidade no banco, mas não um processo central de concessão administrativa verificada. A entrega 009 adiciona somente a capacidade persistente `exercise_moderators`. Role, assinatura, fundador presumido, e-mail conhecido, ambiente e parâmetros públicos não concedem essa capacidade.

O responsável operacional com acesso controlado ao PostgreSQL deve verificar legitimamente a identidade e autorização do revisor fora do aplicativo. A conta deve existir e ter e-mail confirmado. Não há usuário privilegiado padrão, concessão automática, endpoint de autoatribuição ou seed de desenvolvimento. Nenhuma conta real foi provisionada nesta entrega.

Após verificação e registro operacional da identidade do operador, executar no ambiente correto:

```sh
npm run exercises:moderator -- grant UUID_DA_CONTA email-confirmado@dominio 'Motivo e referência da autorização verificada' --identity-verified
npm run exercises:moderator -- revoke UUID_DA_CONTA email-confirmado@dominio 'Motivo da revogação e referência operacional' --identity-verified
```

Placeholders devem ser substituídos explicitamente. Não inserir segredos no comando ou justificativa. A ferramenta compara UUID e e-mail confirmado, valida argumentos, registra grant/revoke e motivo, e não cria contas. `--identity-verified` é uma declaração do operador com acesso ao banco, não uma verificação automática de identidade; a evidência e identificação do operador ficam no processo operacional controlado. `granted_by` permanece nulo para concessão CLI, sem inventar identidade autenticada. Evento e data ficam no banco. Um processo futuro de IAM poderá atribuir operador autenticado e aprovação adicional.

O moderador abre `/exercicios/moderacao`. A fila e o catálogo de referência administrativo não exigem assinatura comercial; exigem permissão ativa, sessão e e-mail confirmado. Nenhum dado particular de terceiros é disponibilizado. Mutações revalidam a concessão sob lock, bloqueiam o pedido, exigem versão e proíbem revisar o próprio pedido. Revogação tem efeito em novas operações. O solicitante visualiza a justificativa final; não incluir dados sensíveis nela.

**Pendente operacional:** o responsável precisa definir quem revisará tecnicamente e verificar sua identidade antes de qualquer concessão. Ausência de moderador mantém os endpoints fechados, sem aprovações automáticas. A moderação não substitui revisão de licença e revisão técnica do catálogo inicial.
