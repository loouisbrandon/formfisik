# Importação e migração profissional — Marco026

FormFisik é independente, fundada por Brandon Louis; não se presume constituição jurídica formalizada. Estado verificável no [relatório026](../engenharia/entrega-026.md). Produção permanece NO-GO. [Marco025](../engenharia/entrega-025.md) foi fechado antes de iniciar este marco, conforme `test-results/025/checkpoint.json`.

## Jornada e fontes

`/importar` usa ProfessionalShell e acesso SaaS canônico. Selecionar tipo e arquivo local, validar UTF-8/tamanho/estrutura, mapear colunas CSV, conferir amostra local e solicitar prévia no servidor. Somente após revisar dados transformados, coincidências e ações, a confirmação explícita autoriza criar os registros. Upload/prévia não criam alunos, exercícios, modelos, contas ou assinaturas.

| Fonte suportada | Destino canônico e limites |
| --- | --- |
| Alunos CSV | `studentFields` e `createStudentInTransaction`008, com inscrição CRM018 condicional existente. Vínculo privado, sem conta global, convite ou associação por contato |
| Exercícios particulares CSV | `exerciseFields` e `insertExercise`009, incluindo versão/evento. Sempre private/active do proprietário; nunca publicação oficial, solicitação de moderação ou privilégio |
| Modelos JSON nativo | Envelope `formfisik.templates.v1`; `workoutFields`, `validateExercises` e `createPlanInTransaction`010/023. Somente template sem aluno/datas; referências/versões próprias ou oficiais autorizadas. Sempre rascunho v1, com snapshots/referências; nunca ativação ou prescrição automática |

Modelos podem ser rascunhos incompletos representáveis pelo editor canônico; ativação continua exigindo revisão/completude pela regra010. JSON conserva séries, técnicas/grupos e referências identificáveis; CSV plano não representa essa estrutura com segurança. O writer010 foi extraído para participação na transação do lote, mantendo o wrapper público e o caminho único de validação/versionamento. Não há cadastro paralelo ou novo modelo de exercícios/treinos.

Não há adaptadores Prime Coaching, ABC Trainerize, Everfit, APIs de terceiros, scraping, XLSX/XLS/macros, importação financeira, anamnese, foto ou saúde. Formatos de outros sistemas exigem amostras reais e autorização. Nomes de exercícios não são resolvidos automaticamente para IDs; modelos devem referenciar versões existentes/autorizadas.

## Formatos, mapeamento e normalização

Arquivos UTF-8, até1MiB. CSV aceita BOM, vírgula ou ponto e vírgula explícitos, aspas duplas, aspas escapadas e campos multilinha. Cabeçalho obrigatório,1–20 colunas únicas ignorando caixa/espaços, até80 caracteres; até500 registros de dados, célula até4.000 caracteres. Linhas vazias são ignoradas; todas as linhas de dados devem ter a mesma quantidade de colunas. Aspas inválidas, controles, surrogates inválidos, codificação substituída ou excesso rejeitam o arquivo. Número do registro é lógico, sem contar cabeçalho/linhas vazias; campo multilinha não muda esse número.

Campos de alunos: fullName obrigatório; email,phone,birthDate,adminNotes opcionais. Datas AAAA-MM-DD conforme schema008, não converter datas ambíguas; nomes/espaços/NFC, e-mail minúsculo e telefone sem pontuação seguem o cadastro manual. Observações são somente administrativas, sem prontuários. Campos de exercícios: name,category,primaryMuscles obrigatórios; secondaryMuscles,equipment,level,instructions,aliases opcionais. Listas usam `|`, enums são os códigos da [taxonomia](../catalogo/exercicios.md)/`src/modules/exercises/taxonomy.ts`, sem tradução aproximada. Variações usam os campos canônicos de nome/alternativos; não importar FKs de variação, escopo, propriedade ou moderação que o formulário009 não expõe.

Coluna pode ter um único destino. Colunas não mapeadas são descartadas antes de persistir; arquivo original, nome do arquivo, cabeçalhos e valores inválidos não são armazenados. Fórmulas/células iniciadas por =,+,@,- são rejeitadas após trim; telefone numérico com DDI+ é exceção validada pelo schema. Não há avaliação de fórmulas, execução de código/HTML ou fetch de URLs. Textos são renderizados por React, sem HTML arbitrário.

JSON nativo: objeto strict `{format:"formfisik.templates.v1",templates:[...]}`,1–20 documentos canônicos e mesmo limite1MiB. Cada documento deve ter kind=template,studentId=null,startDate/endDate vazios. Preserva limites010 de30 divisões,300 ocorrências/1.000 séries, IDs internos únicos e grupos íntegros; exercício/versão e demonstrações são revalidados. Campos desconhecidos ou prescrição individual tornam o registro inválido. A estrutura JSON baixável contém somente exemplo em rascunho, sem IDs inventados de exercícios. Para migrar conteúdo completo, use IDs/versões reais autorizados no catálogo da conta.

[Modelos CSV](../../public/import-models/alunos.csv) e [exercícios](../../public/import-models/exercicios.csv) contêm exemplos sintéticos que devem ser substituídos antes de uso. Nunca são inseridos automaticamente.

## Duplicidades e identidade

Comparação é indício, não comprovação de identidade. Alunos: coincidência de nome normalizado em minúsculas, e-mail ou telefone canônico, somente na carteira do proprietário. Igualdade cadastral de nome/contatos/nascimento indica duplicado potencial; coincidência parcial indica conflito. Exercícios: nome normalizado no próprio acervo privado ou catálogo oficial autorizado; modelos: nome no próprio acervo. Não consultar contatos privados de outro profissional, usuários globais ou fontes externas.

Coincidências anteriores no arquivo são indicadas por número de registro. Prévia apresenta até3 candidatos autorizados por registro, com aviso de outros; nenhum contato/saúde dos candidatos é copiado. Link permite conferência do cadastro original. Nunca fundir, sobrescrever, vincular ou associar conta automaticamente. Válidos começam em Criar; duplicados/conflitos em Ignorar. Criar distinto exige escolha explícita por registro e confirmação geral. Mudança no destino após prévia pode rejeitar uma criação normal por destination_changed, sem alterar o cadastro encontrado. Reenviar outro arquivo é nova intenção e passa novamente pelos mesmos controles.

## Política transacional e resultados parciais

Até3 importações abertas por profissional. Prévia é imutável, identificada por UUID e chave de criação + HMAC da intenção; reenvio igual retorna o mesmo job, conteúdo diferente409. Nenhum digest/credencial de criação é entregue no DTO. Confirmar mesma decisão pode ser repetido; trocar decisões após aprovação409.

Processar até25 registros por transação. Ordem de locks813008→18018, compatível com cadastro/CRM; depois9009 para exercícios ou10010 para modelos. Lock de job serializa confirmação/lote/cancelamento. Cada registro usa savepoint e writers canônicos. Validação/indisponibilidade conhecida do destino rejeita aquela linha; falha técnica inesperada, banco ou auditoria reverte o lote inteiro. Lotes anteriores permanecem confirmados. Retomar só escolhe pendentes; resposta perdida ou chamadas concorrentes não repetem linhas já concluídas.

Estados por registro: válido, inválido, duplicado potencial, possível conflito; após execução: importado, ignorado, rejeitado ou referência eliminada. Inválidos são rejeitados, nunca inseridos silenciosamente. Total e contagens são canônicos; processamento concluído não significa que todas as linhas foram importadas. Relatório informa cada número/estado/código. Nenhum estado de sucesso é simulado.

Frontend processa em sequência após confirmação, com progresso por lote. Interromper após lote conclui a transação em curso e preserva retomada explícita, inclusive após recarregar/histórico. Cancelar descarta somente pendentes, preservando cadastros já criados; não é desfazer importação. Falha de rede exige consultar estado/retomar, sem reenviar outro arquivo automaticamente. Não há worker de criação em background ou continuação automática após sair.

## Consulta, relatório e privacidade

Histórico e registros20/página no servidor, com total, ordem created_at DESC/id e line ASC, páginas vazias explícitas. Detalhes normalizados somente em prévia não expirada. Leituras consistentes repeatable-read, abortadas quando obsoletas no cliente. Filtros/seleção/decisões em memória privada do shell; arquivo fica somente na memória local do formulário com aviso de saída. Botões internos também confirmam descarte; ações concorrentes e navegação ficam bloqueadas durante gravação.

Resultados de alunos e modelos abrem o cadastro específico. A biblioteca009 usa detalhe em painel e não possui rota individual de exercício; o resultado oferece acesso à biblioteca, onde os importados pertencem ao acervo particular. Não criar outra página ou cadastro de exercício para contornar essa organização existente.

Relatório CSV privado tem somente Registro,Situacao,Codigo, até500 linhas, sem nome/contato/observação/identificador do aluno. Usa UTF-8/BOM, quoting e proteção contra CSV injection, nome de download fixo, autorização, limite próprio e auditoria. Não depende do exportador PDF011/014: são artefatos individuais com finalidade diferente; relatório operacional mínimo não deve incluir dados cadastrais ou corporais.

Entradas válidas normalizadas ficam temporariamente no PostgreSQL por até24h; são removidas imediatamente por registro processado, cancelamento ou expiração. Campos inválidos não são persistidos. Expiração bloqueia exposição mesmo antes do worker. Cleanup limitado20 jobs usa locks SKIP LOCKED e pode ser invocado no acesso do proprietário ou pelo comando operacional preparado; scheduler real não foi criado. Metadados mínimos/HMAC/resultados permanecem conforme finalidade de histórico e política a aprovar; não há prazo jurídico inventado.

Eliminação016 remove referências ao aluno e invalida retries. Como um arquivo pendente não comprova identidade, eliminação aprovada de aluno descarta **todos os payloads pendentes daquele profissional**, cancela jobs abertos e invalida digests, sem eliminar outros cadastros canônicos. Evita ressuscitar dados por retomada/restore ou inferir identidade por contato. Conta profissional elegível remove jobs/linhas/auditoria antes das dependências. Preflight financeiro020 continua bloqueando os casos retidos. Restore precisa reaplicar ledger antes de abrir tráfego. [Operação e retenção](../operacao/importacao.md).
