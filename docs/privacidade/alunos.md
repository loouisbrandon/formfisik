# Alunos — finalidade, acesso e ciclo de dados

Este documento descreve os controles técnicos implementados na entrega 008 da FormFisik, empresa independente. Não afirma base jurídica, certificação ou conformidade integral automática.

## Finalidade e minimização

Cadastro privado para organização administrativa do trabalho do profissional: nome, contatos opcionais, nascimento opcional, notas administrativas limitadas, situação/datas do vínculo e metadados mínimos de alteração. Não há CPF, endereço, fotos, dados financeiros, avaliação clínica, anamnese ou prontuário. Não utilizar observações para saúde/histórico médico; formulário informa expressamente essa restrição. Não há análise semântica ou garantia automática de classificação do conteúdo digitado pelo operador.

Nenhuma autenticação do aluno é criada. E-mail não é único e não corresponde a identidade global. Cadastro não é autorização para compartilhar dados. Não há compartilhamento com outros profissionais ou infraestrutura/dados presumidamente compartilhados com outra empresa.

## Acesso e responsabilidade

Somente o profissional dono, com sessão válida/e-mail confirmado e direito comercial, acessa o registro via aplicação. Consultas e PDFs verificam propriedade no servidor. Metadados de histórico guardam apenas tipo, versão, data e vínculo, sem cópias anteriores dos textos. Listagem minimiza dados; relatório da carteira não inclui contato/nascimento/notas. Download individual inclui somente o cadastro daquele vínculo. O profissional deve coletar apenas o necessário, informar finalidade e manter os registros corretos; papéis jurídicos, bases aplicáveis e procedimentos organizacionais precisam ser definidos no contexto real de operação, não são inferidos deste esquema técnico.

## Retenção, arquivamento e eliminação

Arquivamento é situação administrativa reversível. Preserva registro e vínculo, inclusive histórico de transições; não equivale a exclusão, anonimização, revogação de consentimento ou atendimento de pedido formal. Situação comercial inativa impede uso operacional mas não dispara destruição de dados. Não existe exclusão física/automática por esta UI.

Não há prazo universal de retenção definido nesta entrega. O responsável pela operação deverá estabelecer prazos e justificativas adequados à finalidade real antes de adotar eliminação automática; dados não devem ser mantidos sem necessidade apenas porque foram arquivados. Não presumir retenção eterna nem promessa de descarte automático inexistente. Futuro procedimento de solicitação/eliminação deverá validar identidade e responsabilidade, considerar obrigações aplicáveis, vínculos de treinos ainda futuros, backups e documentos exportados, e registrar resultado sem conservar dados excessivos. A implementação não representa um atendimento automático desses pedidos.

## Exportação e segurança

PDFs são produzidos em memória mediante autorização e entregues como anexos privados/no-store. Não há armazenamento durável de relatórios no servidor pelo módulo. O operador passa a administrar sua cópia local; deve controlar destino, acesso e descarte. Não enviar indiscriminadamente a terceiros. Limites de exportação reduzem volume e abuso.

Não registrar conteúdo cadastral, notas, PDF ou credenciais em logs. Infraestrutura, proxy, analytics e política de backups devem manter minimização, acesso e retenção adequados; não presumir que controles de interface controlem cópias externas. Artefatos de teste usam identidades explicitamente de teste em PostgreSQL isolado, sem dados da carteira real.

## Futuro

Identidade própria do aluno e associação a múltiplos profissionais exigirão fluxo separado de verificação/associação e permissões. Igualdade de e-mail ou pessoa não autoriza combinar registros privados, revelar relacionamento com outro profissional ou compartilhar notas. Não há essas associações nesta versão.

## Prescrições e documentos — atualização 011

Os relatórios administrativos da 008 continuam gerados em memória. A exportação de fichas da 011 usa snapshots da prescrição e guarda o PDF privado por 15 minutos no PostgreSQL para prévia/download dos mesmos bytes, com no máximo três recentes por profissional. Leitura expirada é negada independentemente da limpeza; `db:cleanup` elimina os artefatos expirados. Apresentação/logo profissional permanece separada dos contatos privados do aluno. Backups, retenção e eliminação do banco devem considerar esses artefatos e as versões de prescrições; a cópia baixada é administrada pelo profissional. A aplicação não envia a terceiros. [Finalidade, controles e limites](../modulos/exportacao-treinos.md).
