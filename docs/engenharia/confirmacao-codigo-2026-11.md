# Confirmação de cadastro por código — 030

Estado: IMPLEMENTADO e validado localmente. Sem alteração de banco persistente ou deploy nesta entrega. FormFisik é empresa independente fundada por Brandon Louis.

## Fluxo e contratos

POST `/api/accounts/register` mantém schema estrito de cadastro, senha Argon2id e resposta genérica 202; acrescenta verificationId aleatório256bits e resendAfter=60, também para endereço já confirmado (sem criar conta/alterar credenciais). A tela conserva o identificador apenas em memória, apaga senhas e exibe campo único para colar seis dígitos, autocomplete one-time-code e teclado numérico. Recarregar exige reiniciar cadastro; não usa Web Storage nem URL para segredo/código. Confirmação leva ao login; não autentica nem ativa trial/assinatura.

POST `/api/accounts/verify` recebe `{verificationId,code}` estrito, até4KiB. A tentativa é vinculada ao cadastro e respectiva senha; não confirmar apenas por e-mail/código. Código gerado por crypto.randomInt, seis dígitos inclusive zero inicial, válido10min/uso único. No banco somente HMAC-SHA256 segregado por domínio, identificador e ABUSE_HMAC_SECRET. Comparação constante; códigos não são armazenados/registrados em texto. O identificador é guardado como SHA256 no token_hash existente. Alterar a chave interna invalida códigos pendentes.

Máximo5 erros por tentativa, limite adicional10 verificações por e-mail/15min e30 por IP/15min. Lock PostgreSQL por e-mail e validade reavaliada com clock_timestamp após lock; concorrência cria uma única conta e não troca a senha escolhida. Após sucesso consome todas as tentativas daquele e-mail. Recomeçar cadastro invalida a tentativa anterior, respeitando limites.

POST `/api/accounts/resend` recebe somente verificationId. Cooldown de60s compartilhado com cadastro no servidor; 3 tentativas de envio por endereço/15min e10 reenvios/IP/15min, teto global100/min. Verificação de propriedade pela posse da tentativa aleatória, sem IDs de terceiros escolhidos. Reenvio troca o código por um diferente, mantém a senha original e não zera as tentativas incorretas; validade até10min limitada a30min totais desde o cadastro. Tentativa já expirada/esgotada exige novo cadastro. Erro de transporte faz rollback da rotação e preserva o código anterior. Um endereço elegível só recebe202 após aceite do provedor e commit, sem sucesso simulado. Cooldown especial retorna Retry-After60; limites maiores mantêm janela900s.

Origin canônico, JSON, tamanho/rate/DTO mínimo e mensagens genéricas existentes preservados. Nenhum endpoint GET confirma conta. Erros nunca incluem código, senha, e-mail ou HMAC. Respostas/HTML privados no-store.

## Compatibilidade e persistência

Migration030 adiciona code_hash/code_attempts/last_sent_at em pending_registrations. Grants existentes desta tabela já cobrem os comandos; nenhuma permissão administrativa adicional. Cleanup existente elimina tentativas expiradas. Links legados de alta entropia permanecem consumíveis até a expiração original, somente quando code_hash IS NULL; não há novo envio de links para cadastro. Recuperação de senha e troca de e-mail mantêm links próprios, sem alteração do escopo.

Novos registros por código não podem ser confirmados passando verificationId como token do fluxo legado. Aplicar migrations pendentes antes do código; nesta workspace029 também está pendente em ambientes persistentes. Não executar migration/deploy sem aprovação específica. Resend real e entregabilidade exigem nova homologação externa.

## Visual e e-mail

Template HTML existente mantém logo superior/rodapé, arte verde e texto em uma linha. Substitui botão/link por código grande, selecionável, com validade e aviso para não compartilhar. Versão texto simples contém o mesmo código. Imagens públicas não recebem códigos/IDs nas URLs. Não criar botões falsos de copiar nem tracking de código. A UI permite colagem, reenvio com contador e reinício para corrigir o e-mail; erros de API tratados com mensagens locais seguras.

## Evidências

55 testes aprovados em PostgreSQL descartável (cadastro, autenticação, recuperação, segurança, transporte Resend e template), sem chamada externa. Reexecução da versão final dos handlers:15 testes de cadastro/transporte/template aprovados. Cobrem código incorreto/expirado/uso único, concorrência, vínculo à senha, espera por lock, reenvio/cooldown, rollback de falha de transporte e esgotamento de5 erros.

Prévia interativa isolada com API sintética:1440/768/320px sem overflow, colagem com zero inicial, cooldown/reenvio, confirmação e Web Storage vazio. Contador usa prazo absoluto em memória, suportando throttling em aba de fundo. Template de e-mail renderizado em Chrome com imagens locais e código fictício:sem overflow a320px. Isso não substitui renderização Gmail/Outlook nem e-mail real.

Lint/typecheck finais aprovados. Build com canários aprovado:283 artefatos públicos,14 canários,zero achados. Build final após ajuste de contador aprovado, com scanner sem achados. Suíte integrada tests/e2e.ts atualizada ao novo contrato, mas não executada nesta entrega. Não representa liberação de produção nem homologação de entrega na caixa de entrada.
