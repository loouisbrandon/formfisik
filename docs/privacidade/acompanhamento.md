# Privacidade do acompanhamento físico

Peso, medidas e observações são dados pessoais potencialmente sensíveis. A finalidade implementada é o acompanhamento individual pelo profissional proprietário do vínculo, dentro de sua carteira privada na FormFisik, empresa independente. Não há portal do aluno, acesso público, pesquisa entre profissionais, associação por e-mail, fotografia, teleconsulta ou uso para IA.

Coletar somente informações necessárias ao serviço autorizado. Observações de acompanhamento são distintas de notas administrativas; a aplicação não determina automaticamente a base aplicável ao tratamento, não comprova consentimento, não realiza diagnóstico nem promete conformidade jurídica por existir um campo. O profissional e a operação da empresa devem estabelecer finalidade, informação ao titular e condições adequadas antes do uso real.

Sessão opaca, e-mail confirmado, autorização comercial e propriedade são exigidos em cada API; alteração também exige Origin, validação, versão e limites. Sem dados em localStorage/sessionStorage, URLs de valores, logs de payload ou analytics novos. URLs incluem apenas UUIDs privados. Respostas são privadas/no-store/no-referrer. PostgreSQL e seus backups contêm os valores: acesso operacional restrito, transporte seguro e proteção dos backups são responsabilidades da configuração de produção; esta entrega não cria nem certifica tais serviços.

A auditoria guarda somente identificação do proprietário/autor, avaliação, versão, operação e instante. Não duplica notas ou medidas anteriores. Edição corrige o registro atual de modo auditado; o histórico não restaura medidas antigas. Arquivamento lógico preserva dados, retira a avaliação de gráficos/comparações automáticas e permite reativação. Arquivar aluno preserva consultas e bloqueia novas alterações até sua reativação.

## Retenção e eliminação

Não há expurgo automático de avaliações nesta entrega: registros persistem até uma operação deliberada de eliminação. A empresa precisa definir e revisar prazo, finalidade e eventuais necessidades de conservação antes da operação real, sem converter arquivamento em retenção indefinida automática por política. Não foi inventado um prazo legal universal.

Solicitações de acesso, correção e eliminação exigem verificar titular e escopo pelo procedimento operacional autorizado. A UI oferece correção/arquivamento; **eliminação física ainda não tem endpoint nem botão**. Em atendimento operacional autorizado, avaliar vínculos com treinos/documentos e retenções justificadas; em transação, eliminar primeiro os eventos físicos e depois as avaliações do proprietário/vínculo exatos, sem apagar dados de outros profissionais. A eventual eliminação do cadastro completo precisa também tratar dependências anteriores. Não executar scripts genéricos de cascade na carteira.

Backups podem conservar cópias até seu ciclo de retenção definido pela operação. Restaurar backups exige reaplicar eliminações registradas, com evidência mínima e sem replicar conteúdo sensível. Nenhuma deleção, alteração de backups ou migration no banco existente foi realizada nesta entrega. Política operacional de retenção, canal de direitos, controle de administradores e configuração dos backups permanecem tarefas de governança antes de produção; não se declara que o software já as formalizou.

O cadastro e seus PDFs administrativos permanecem no modelo anterior; medidas e notas de acompanhamento não são adicionadas automaticamente a esses documentos nem a PDFs de treinos. Não foi implementada exportação específica de avaliações.

## Ampliação 013

As restrições históricas da 012 relativas a fotografias descrevem o escopo original. A 013 implementa registros fotográficos separados, com autorização específica, entrega privada e remoção controlada conforme [política de fotografias](fotografias.md). Fotografias continuam fora de PDFs, IA e compartilhamento público. Observações administrativas do cadastro não foram reutilizadas para conteúdo corporal.
