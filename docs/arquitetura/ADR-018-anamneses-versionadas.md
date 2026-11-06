# ADR-018 — Cadastro por convite e anamneses versionadas (Entrega 017)

Estado: implementado e verificado localmente. Não autoriza dados reais ou produção. FormFisik é empresa independente fundada por Brandon Louis. Esta ADR sucede numericamente a ADR-017 da Entrega 016.

## Contexto e reutilização

A carteira 008 contém `student_records` privados e `student_links`; não é identidade global de aluno. Sessão opaca/entitlement/propriedade015, PostgreSQL/migrador e eliminação 016 já existem. Não criar `users`, credenciais, portal, CRM ou segundo cadastro por causa de um questionário.

O gravador canônico `createStudentInTransaction` foi extraído do serviço008 sem alterar regras de cadastro manual, digest/idempotência, lock813008 ou eventos. O serviço original continua sendo o consumidor manual; submissão017 reutiliza a mesma operação dentro da transação do convite. Saúde nunca é copiada para `admin_notes`.

## Decisões

1. Formulário privado tem rascunho JSON estruturado e revisão otimista. Cada publicação gera linha imutável com definição completa e número crescente. Seções/perguntas/alternativas têm UUIDs estáveis; JSON limitado e validado evita um framework de entidades ou expressões sem consumidores reais. Até100 versões por modelo; não truncar silenciosamente novas publicações.
2. Versões publicadas e respostas têm trigger que rejeita UPDATE; grants runtime tampouco permitem UPDATE de snapshots. Arquivar preserva convites/histórico e impede novos convites daquele modelo. O padrão globalv1 é código versionado somente leitura, materializado em snapshot privado arquivado quando usado; duplicação produz rascunho independente.
3. Solicitação individual contém finalidade new/existing, versão, dono, vínculo opcional, prazo e digest. Credencial é32 bytes aleatórios base64url, digest SHA-256, validade7 dias, uso único. Credencial não é identidade de pessoa nem sessão. URL `/responder#TOKEN`; fragmento removido antes de abrir por POST, sem query, logs ou persistência Web Storage. Não enviar automaticamente ao WhatsApp.
4. Cadastro novo coincidente em nome, e-mail ou telefone **na própria carteira** fica pendente. Não consultar/revelar contas globais ou carteiras alheias. Coincidência não associa identidades. Resolução exige ação profissional explícita após verificação independente de identidade/escopo/autorização; a interface registra atestado, não comprova a verificação externa. Sem comprovação, preservar pendência. Pode criar cadastro privado separado após revisão ou selecionar vínculo da própria carteira; nunca altera cadastro existente com o que foi informado no convite.
5. Fluxo existing nunca aceita bloco cadastral, não mostra cadastro existente ao portador e não cria outro aluno. Confiança no destinatário depende de entrega manual correta do link. Portador pode responder a solicitação, sem consultar resposta anterior ou conta. Suspensão do profissional e arquivo do vínculo impedem uso do link; arquivamento de modelo preserva solicitações existentes. Direito para emitir/revisar sempre é validado canonicamente; capacidade já emitida permanece limitada ao prazo/estado e não concede acesso profissional, mesmo se houver mudança posterior comercial.
6. Submissão obtém lock da solicitação, valida proprietário ativo/confirmado/profissional e vínculo, reavalia condições e validade no relógioSQL ao consumir. Cadastro, respostas, consumo e evento são uma transação; erro reverte todos. Novo cadastro compartilha lock com cadastro manual. Uma única submissão vence em concorrência; reenvio/expiração/revogação retornam indisponibilidade genérica, sem recuperar conteúdo pelo token.
7. Condição só pode apontar escolha Sim/Não ou seleção única **anterior**, com opção válida. Ordem topológica obrigatória impede ciclos. Servidor deriva respostas aplicáveis na ordem; respostas ocultas não são persistidas. Sem eval, código, scripts ou expressões arbitrárias.
8. Rascunho público somente em memória, etapas e proteção de saída compartilhada. Fechar/recarregar perde progresso; comunicado antes da coleta. Não criar cookie paralelo/armazenamento sensível por conveniência. Uma troca de link na mesma aba abre nova solicitação; respostas não enviadas exigem confirmação de descarte.
9. Mesmas filas/ledger de eliminação 016: exclusão autorizada de vínculo remove suas solicitações/submissões/eventos. Conta profissional não autoriza excluir outro titular; submissões pendentes sem vínculo bloqueiam eliminação profissional, exigindo triagem e resolução legítima. Não há endpoint paralelo de exclusão ou prazo legal automático.

## Limites e evolução

Dados clínicos não são diagnosticados nem pontuados. Textos, canal de direitos, bases e retenções aguardam homologação; público exibe ambiente local/somente dados sintéticos. Sem homologação jurídica ou disponibilidade produtiva.

O contrato pode ser consumido futuramente pelo 029 após ativação legítima e por eventos mínimos do 018; não implementar nenhum dos dois agora. JSON de definição é específico de formulário, não arquitetura multiesporte genérica. Antes de outra modalidade, revisar finalidade, modelo padrão e acesso sem copiar credenciais ou unir carteiras.
