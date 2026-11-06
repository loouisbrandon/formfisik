# ADR-017 — Eliminação durável e recuperação operacional

Decisão técnica da **Entrega 016**. A numeração de ADR é independente do roadmap: não implementa o Marco 017 (anamnese). Preserva a ADR-016 estratégica, sessões opacas, SQL/pg e os serviços existentes. FormFisik é empresa independente; não presume formalização jurídica.

## Contexto e decisão

FF015-11 agrega problemas técnicos e decisões externas. Arquivar ou suspender não elimina snapshots, arquivos ou backups. Implementar mecanismo operacional por proprietário e escopo, sem endpoint administrativo público, novos provedores, filas externas ou dependências.

`privacy_erasure_jobs` guarda UUIDs do escopo e referência opaca de aprovação; não armazena documentos de identidade, motivo livre ou conteúdo corporal. Escopos: vínculo privado de aluno (`student`) e conta profissional (`professional`). Exigir conta suspensa antes da solicitação, autorização operacional/identidade/escopo/retenção verificados fora da aplicação. A referência não comprova juridicamente a aprovação. Reativação por CLI é negada enquanto houver trabalho pendente. Nenhuma conta é suspensa automaticamente por uma solicitação HTTP.

O plano profissional bloqueia se existe conta financeira ou contribuição/moderação compartilhada. Não escolhe prazo legal, apaga fatura ou altera conteúdo de outro profissional. Dependências históricas externas ao conjunto também bloqueiam. A solicitação do profissional não autoriza eliminar alunos, que são outros titulares: carteira ainda existente bloqueia o expurgo da conta. Cada vínculo exige pedido/aprovação próprios. Somente depois de resolvida a carteira e as demais dependências a conta elegível pode ter credenciais, apresentação, modelos, particulares e identidade removidos. O bloqueio comercial requer decisão competente e eventual implementação complementar; não foi resolvido por uma flag fictícia de consentimento.

Reutilizar adapter `PrivatePhotoStore`/R2 e triggers de revogação 014. Copiar chaves opacas para tombstones independentes antes de remover metadados. Lease de 15min com UUID de fencing; lotes de até20 DELETEs, I/O fora de transação e retries. Banco guarda `last_deleted_at`; erro/ausência de storage conserva pendência. Após primeira confirmação, imagens aguardam janela técnica de um dia e novo DELETE confirmado para absorver uploads atrasados; isso não é prazo legal de retenção. Novas reservas estendem a janela. Tombstones continuam repetindo DELETE diariamente após conclusão local; sua política de descarte depende de reconciliação e retenção aprovada.

Exclusão relacional final é transacional, por owner e vínculo, na ordem das FKs. Apaga avaliações/eventos, fotos/autorizações/eventos, versões/referências de treino, PDFs e cadastro selecionados; outras carteiras não são combinadas por e-mail. Chaves de operações em lote preservam resultados remanescentes e recebem `invalidated_at`; retry retorna409 em vez de recriar o aluno apagado ou apresentar sucesso parcial. Não reescrever silenciosamente histórico de outro vínculo para liberar uma FK.

## Recuperação e menor privilégio

Ledger versionado autenticado com HMAC SHA-256 e domínio separado usa o segredo estável do ambiente; exportação contém apenas IDs de escopo/referência e chaves opacas. Ainda é dado pessoal pseudonimizado, não arquivo público ou anonimização. Escrita `0600`, criação exclusiva, fora do repositório; assinatura não cifra nem comprova atualidade. Armazenamento independente cifrado, controle de acesso, última versão/hash e gestão de chaves são responsabilidades operacionais ainda não provisionadas.

Reaplicar ledger mais recente após restaurar em isolamento, suspender contas restauradas e processar novamente antes de qualquer acesso. Integridade HMAC impede adulteração sem o segredo, mas não detecta por si rollback para ledger antigo válido. Perda/rotação da chave ou atualidade desconhecida bloqueia reabertura, sem fallback de sucesso. Backup não pode ressuscitar dados por restauração silenciosa. Sem promessa de eliminar cada snapshot ou cópia já baixada.

SQL de grants é template para papel dedicado sem ownership, não provisionamento de credenciais. Runtime não acessa ledger, altera estado de segurança ou histórico de migrations, nem exclui usuários. UPDATE somente de `users.full_name` é necessário para os locks de linha PostgreSQL usados na emissão de sessão; nenhuma coluna de papel/confirmação/suspensão recebe UPDATE. Migração, expurgo, manutenção e catálogo operam com credencial separada.

Health verifica sequência e checksums completos, sem expor nomes/versões/segredos. Manifesto SQL é lido uma vez por processo e incluído no tracing. Diagnóstico detalhado é CLI de operador por contagens/códigos; não chama provedores nem certifica IAM/retentiva.

## Alternativas e limites

Não usar CASCADE genérico sobre pessoa/e-mail, anonimização nominal mantendo conteúdo identificável, bucket público, cópia de bytes corporais no ledger ou expurgo financeiro sem decisão. Não criar infraestrutura multiesporte, Connect, mobile ou novo modelo de identidade.

Conclusão local não libera produção. Homologação Stripe/R2/SMTP, identidade jurídica/canal/bases/retenções, cobertura integral de direitos, ledger externo atual, IAM/backup real/agendas/alertas e aceite do fundador permanecem gates próprios. Ver [operação](../operacao/estabilizacao-016.md), [ciclo de dados](../privacidade/eliminacao-016.md) e [relatório](../engenharia/entrega-016.md).
