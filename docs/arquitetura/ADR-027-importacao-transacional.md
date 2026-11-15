# ADR027 — Importação com writers canônicos e entrada temporária

Marco026, após checkpointGO025. FormFisik independente; produção NO-GO.

Decisão: importador próprio limitado para CSV administrativo/exercícios e JSON nativo de modelos. Parser comum cliente/servidor, sem executar fórmulas ou depender de planilha/serviço externo. Não há parser CSV reutilizável no repositório; implementação cobre quoting, CRLF/BOM/multilinha e limites, com testes adversariais. Nenhuma dependência nova. O schema/modelo atual de treino não cabe em CSV plano; envelope versionado usa exatamente o documento010, sem novo modelo ou adaptador especulativo.

Writers008 e009 já aceitam transação;010 foi extraído para createPlanInTransaction, mantendo wrapper/validação/versionamento. Nova persistência é necessária para prévias limitadas, retomada e relatórios confiáveis; não é cadastro paralelo. Duas tabelas de job/linhas e auditoria append-only, com FKs compostas de owner, inputs imutáveis exceto descarte e resultados monotônicos. Nenhum arquivo original/filename/cabeçalho armazenado.

Confirmar intenção → lotes25 com savepoints; falhas de validação por linha, falhas técnicas com rollback do lote inteiro. Chaves de job e estado durável por linha impedem repetição. Locks813008→18018 mantêm ordem008/018;9009/10010 protegem writers específicos. Sem fila externa ou scheduler de criação, sem atualização/merge de identidade e sem ativação automática de modelos.

Divergência entre cadastros é indício, não identidade; default seguro é ignorar coincidência. Criar distinto requer decisão explícita; não há associação por e-mail. O CSV operacional usa somente números/estados/códigos e anti-formula; PDFs individuais011/014 não atendem essa finalidade e não são reutilizados indevidamente.

Payloads normalizados até24h, descarte por linha e cleanup com SKIP LOCKED. Eliminação de aluno invalida todas as entradas pendentes do proprietário: não se pode relacionar com segurança conteúdo ainda não vinculado por coincidência de contato. Cadastros canônicos de outros alunos permanecem. Restore reaplica ledger antes do tráfego. Retenção jurídica e operação externa dependem de homologação própria.
