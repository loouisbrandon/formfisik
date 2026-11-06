# Privacidade de fotografias de acompanhamento

A FormFisik é empresa independente fundada por Brandon Louis. Fotografias corporais são tratadas como conteúdo privado e sensível de acompanhamento, sem compartilhamento público, portal do aluno, treinamento de IA ou inclusão automática em PDFs.

## Autorização específica

Cadastro de aluno não autoriza fotografias. Antes do registro, o profissional informa origem/referência da autorização, data em que foi obtida, adulto ou responsável e atesta a finalidade exclusiva de acompanhamento físico. Para menor conhecido pela data de nascimento, o servidor exige responsável e referência correspondente. Quando nascimento não está cadastrado, exige declaração explícita, sem deduzir maioridade. Corrigir cadastro e obter documentação adequada continuam responsabilidade humana; a aplicação não verifica assinatura, vínculo legal ou validade jurídica do documento.

Não inserir documentos completos, números de identidade, dados de terceiros ou detalhes clínicos desnecessários na referência. As referências não são exportadas nem copiadas ao histórico. Autorização está vinculada ao registro e às suas imagens, não é consentimento universal para novas finalidades ou alunos. Retirada da autorização do registro deve usar remoção integral; remoção individual por correção preserva demais imagens autorizadas.

Sessão opaca, profissional confirmado, assinatura canônica e propriedade são verificados em cada API, inclusive na entrega dos bytes. Chaves de objeto aleatórias não contêm nome, aluno ou data. Imagens passam por validação e reencodificação, removendo EXIF/localização/ICC. Endpoints privados não incluem URLs permanentes; cache no-store, referrer no-referrer e CORP same-origin. Nenhum analytics ou serviço externo recebe fotografias na comparação. Um profissional autorizado ainda pode salvar ou capturar o que visualiza; não há DRM.

## Retenção e remoção

Registros ativos/arquivados permanecem sob controle do profissional até solicitação de remoção; arquivamento não é eliminação e continua permitindo consulta privada. Não existe retenção automática de fotografias por prazo nesta entrega. Definir prazo institucional e acordos com titulares/provedores antes da operação real; não presumir prazo legal nem formalização jurídica já concluída.

Solicitação com motivo registrado bloqueia acesso imediatamente e entra em fila. A remoção física depende de R2 disponível e worker operacional; não se declara concluída antes do DELETE. Após exclusão integral confirmada: data, notas, posições, descrições, dimensões, bytes/digests e referência/data/tipo/responsável da autorização são saneados. Permanecem IDs de vínculo/profissional/registro, instantes, estados, versão, motivo, atores e chaves opacas indispensáveis a idempotência/auditoria e repetição de limpeza; não se mantêm miniaturas nem cópias das imagens em eventos.

Tombstones são reconferidos diariamente e não têm purga automática enquanto a política de reconciliação/retenção operacional não for aprovada. Isto é limitação explícita: eliminação do conteúdo não equivale à eliminação de todo identificador administrativo. Solicitação integral envolvendo todo o vínculo, backups e obrigações aplicáveis requer processo operacional próprio, sem exclusão ad hoc do ledger.

Backups, eventual versionamento e retenção do provedor devem ser configurados e auditados pelo operador. Não foram criados nem homologados aqui. Restauração deve reaplicar exclusões antes de liberar acesso. Ver [runbook](../operacao/fotografias-r2.md). Sem configuração real de R2, uploads ficam indisponíveis; testes usam apenas figuras geométricas sintéticas e banco descartável, não fotos pessoais.

## Exportação compartilhável — 014

A autorização de armazenamento não se estende automaticamente ao PDF. Exige referência, data, sujeito/responsável e confirmação específica vinculada a imagens/versões e contexto. O profissional confere legitimidade; o software não verifica juridicamente documentos. Menores conhecidos exigem responsável na exportação e autorização de origem compatível. Sem isso, nenhuma foto é incluída. Só dados/imagens explicitamente selecionados entram no PDF privado temporário. A declaração/referência não deve conter documentos completos.

Substituição, remoção ou revogação de autorização de origem apaga os artefatos temporários vinculados, com bytes/manifest/dependências. Downloads exigem autorização vigente e expiram em 15 minutos. PDFs já baixados não podem ser recolhidos. Compartilhamento é manual, sob responsabilidade do profissional. Sem credenciais R2, fotos não são simuladas. Ver [operação](../operacao/relatorios-fisicos.md).
