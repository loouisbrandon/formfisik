# Modelos de treinamento e cópias independentes

Modelos são documentos privados do profissional na mesma estrutura canônica de [treinos](treinos.md), sem aluno ou datas individuais. Usam o mesmo editor, validação, catálogo e histórico. Podem ser pesquisados, criados, consultados, editados, duplicados, arquivados e reabertos como rascunho.

Somente um modelo ativo e completo pode ser aplicado. O profissional escolhe 1–50 alunos reais ativos da própria carteira; seleção permanece entre buscas/páginas. Antes da confirmação, a interface mostra modelo/versão, nomes selecionados, número de divisões/exercícios e consequências. Não são inseridos exemplos fictícios de modelos em runtime.

## Aplicação atômica

A aplicação usa uma transação única: valida versão/estado/proprietário do modelo, todos os alunos, exercício/versão/disponibilidade e todas as referências antes de criar as fichas. Se um aluno estiver arquivado, for inexistente ou de terceiro, nenhuma ficha é criada. Falha de banco na segunda cópia também reverte a primeira, snapshots, referências e chave de idempotência.

Cada resultado é **uma ficha individual nova em rascunho**, com UUID do plano e UUIDs de divisões, ocorrências, séries e grupos próprios. Membros de grupos são remapeados para as novas ocorrências. A cópia mantém parâmetros e revisões dos exercícios, mas não compartilha uma ficha mutável. O identificador e a versão do modelo original são preservados por FK. Não há sincronização futura automática.

Editar o modelo não altera fichas aplicadas. Editar uma ficha não altera modelo ou alunos irmãos. Reativar o modelo não ativa cópias. Ativar cada ficha exige revisão explícita e respeita a regra de uma ativa por aluno. Duplicar ficha/modelo também cria cópia independente em rascunho; duplicação individual preserva o aluno associado.

UUID de tentativa + digest + IDs resultantes garantem reenvio idempotente e concorrência. A mesma tentativa retorna os mesmos planos; conteúdo diferente com a mesma chave gera conflito. Recuperar uma tentativa já concluída não cria outra cópia mesmo que o modelo tenha mudado depois. O acesso comercial/proprietário continua sendo validado na requisição. A interface conserva a chave ao repetir a mesma seleção dentro do fluxo; em falha de conexão, deve-se repetir a confirmação antes de iniciar uma nova aplicação. Nova navegação/novo fluxo pode representar uma aplicação intencional nova — não há unicidade permanente modelo/aluno, pois reaplicações posteriores são legítimas.

A resposta de aplicação é resumida por aluno/plano/versão/estado e origem; não transfere dezenas de prescrições completas na mesma resposta. A consulta individual autenticada recupera o documento completo.

## Segurança e operação

Conta profissional confirmada, sessão opaca e assinatura canônica são exigidas em página e API. IDs de modelo, alunos ou exercícios não são autoridade. Não há acesso cruzado por UUID, e-mail, query ou permissão enviada pelo frontend. CSRF e schemas estritos protegem criação/edição/estado/cópia/aplicação; aplicação limitada a cinco tentativas por minuto por profissional.

Autorização de modelo não concede autenticação ao aluno nem altera pagamentos. Não há aplicativo, execução, inteligência artificial, WhatsApp, mídia externa ou PDF final. Stripe hospedada continua pendente de configuração/homologação e não é simulada pela aplicação. Testes com gateway controlado são exclusivos do harness, com PostgreSQL e sessões reais.
