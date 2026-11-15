# Ciclo de dados e eliminação operacional — 016

Mecanismo local para FormFisik independente. Sem eliminação de dados reais. Referência de aprovação e flags são salvaguardas de operação; não substituem verificação de identidade, escopo, fundamento e retenções pelo responsável competente. Não constitui aconselhamento jurídico, política publicada ou consentimento universal.

| Categoria | Ciclo e controle técnico | Retenção / limite que permanece |
| --- | --- | --- |
| Identidade/conta profissional | Suspensão primeiro; conta elegível sem carteira pendente/financeiro/contribuições pode ser eliminada definitivamente com credenciais/apresentação | Carteira restante exige pedidos próprios por titular; conta com financeiro ou contribuições é bloqueada para revisão; não a rotular como apagada/anonimizada |
| Senhas/sessões/reset/cadastro pendente | Suspensão revoga; exclusão elegível remove credenciais/sessões/reset e tentativas do próprio e-mail confirmado | Limites HMAC compartilhados não são apagados indiscriminadamente; expiram por janela técnica/cleanup |
| Alunos/vínculos | Um vínculo exato, de um proprietário verificado; cadastro/eventos removidos após dependências | Arquivo é exclusão lógica, não elimina; mesmo e-mail noutra carteira não é identificado globalmente nem removido |
| Avaliações/medidas/notas | Remoção definitiva das linhas e eventos do vínculo, transacional | Texto livre sobre terceiros noutras entidades não é inferido/varrido por nome; delimitação humana do pedido continua necessária |
| Treinos/snapshots | Remoção de planejamentos e versões do alvo, com documentos e referências | Dependência de outro vínculo bloqueia; modelos e cópias de outros alunos são preservados; resultados idempotentes de lote são invalidados explicitamente |
| Fotografias/autorizações | Bloqueio de leitura e revogação de PDFs; DELETE confirmado e repetido pelo adapter existente antes de hard delete relacional | Janela técnica de um dia para uploads atrasados; serviço real, versionamento e cópias externas precisam de homologação própria |
| Arquivos externos | Chaves opacas em fila independente; falha/ausência de storage não significa sucesso | Tombstones continuam DELETE diário; descarte só após política/reconciliação aprovadas, sem prazo legal inventado |
| PDFs/logo | PDFs temporários revogados/removidos; apresentação/logo somem na exclusão elegível da conta | PDFs já baixados e cópias de terceiros não podem ser recolhidos pelo servidor |
| Eventos administrativos | Eventos específicos do vínculo são removidos com seu escopo; eventos de conta removidos na eliminação elegível | Ledger operacional contém IDs pseudônimos e referência mínima, com acesso restrito e retenção ainda a aprovar |
| Catálogo/contribuições | Particular elegível removido junto da conta | Contribuição/moderação compartilhada bloqueia eliminação da conta; revisão de direitos/licença, identificação e preservação de outros consumidores pendente |
| Assinatura/histórico financeiro | Detectar conta financeira e bloquear eliminação integral | Não apagar/adulterar fatos financeiros nem inventar prazos; definir obrigações/operadores e política antes de implementar descarte correspondente |
| Logs/segurança | Somente códigos/contagens; nenhuma nota, imagem, token, cookie, cartão ou senha é acrescentada | Retenção do provedor/proxy e auditoria de acesso externa precisam de configuração/aprovação |
| Backups | Restore isolado e replay do ledger mais recente antes de reabrir acesso | Snapshots não são editados automaticamente; precisa ciclo aprovado, ledger independente atual, segredo disponível e validação operacional |

## Estados e garantias

`pending` → `cleaning` → `waiting` ou `blocked` → `completed`. `blocked` identifica motivo enumerado: conta não suspensa, retenção financeira, contribuição compartilhada, histórico relacionado, storage ou quiescência. Worker pode ser repetido; lease interrompido expira, e nenhuma fase confirma sucesso sem transação/DELETE necessários.

`completed` comprova remoção no escopo relacional elegível e último DELETE conhecido, quando existiam objetos. **Não comprova anonimização, descarte de todos os backups, liberação comercial, eliminação de cópias externas ou atendimento integral de todos os direitos.** Ledger e tombstones são pseudonimizados e sujeitos a governança. Não há nova tela ou rota pública de eliminação; somente operação revisada em manutenção.

Solicitação ainda não revisada deve permanecer fora da fila executável. Não há cancelamento/reversão depois de iniciada a eliminação; o CLI exige confirmações e escopo final antes de criar o trabalho. Fila bloqueada por retenção não deve ser manipulada com SQL improvisado para contornar esse controle. Decisão e eventual evolução do fluxo devem ser revisadas/testadas separadamente.

[Inventário geral](inventario-e-retencao.md) mantém propostas não aprovadas. [Direitos/minutas](direitos-e-minutas.md) continuam sujeitos a revisão. A 016 corrige parte técnica do FF015-11; não remove seu NO-GO original nem libera produção.

Limitação operacional explícita: a manutenção exige suspensão do profissional e afeta temporariamente seu acesso à carteira inteira, inclusive enquanto imagens aguardam quiescência. Os dados de outros vínculos são preservados; não se promete disponibilidade contínua nesse procedimento. Antes de uso real, aprovar a janela e o tratamento independente de cobranças/atendimentos. Suporte financeiro deve ser tratado antes da suspensão quando necessário; o mecanismo não cancela assinatura.
