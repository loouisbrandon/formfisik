# Cortesia para homologação de staging — 031

IMPLEMENTADO e validado no staging autorizado. Provisão de conta específica solicitada pelo responsável, somente staging. FormFisik é empresa independente fundada por Brandon Louis.

## Regra e limites

Cortesia sem expiração, revogável pelo operador, com capacidade Pro/alunos ilimitados. Não é assinatura Stripe, trial, promoção pública ou plano comercial novo. Não cria cobranças/faturas/cartões; não remove dependências externas e não habilita funcionalidades ainda não implementadas. Conta continua professional; nunca admin/moderador.

Autorização central subscriptionStatus consulta concessão persistida e retorna estado explícito courtesy. paidAccess é o campo legado de entitlement, também verdadeiro para essa concessão, sem representar pagamento. commercial/courtesy, financialStatus=null, datas/valores de cobrança ausentes, invoices vazias e ações financeiras desabilitadas. Interfaces mostram Cortesia vitalícia e acesso gratuito.

Exige simultaneamente RAILWAY_ENVIRONMENT_NAME=staging e APP_URL=https://sta.formfisik.com.br, além de usuário profissional confirmado, não suspenso, sem encerramento vencido e grant staging não revogado. Importar dados do staging em produção não ativa essa cortesia. Não aceita flag, UUID de terceiro, query ou cookie para autoatribuição. Sem endpoint HTTP de concessão/revogação. Runtime tem somente SELECT; INSERT/UPDATE e auditoria exclusivos da credencial operacional. Revogação invalida sessões e a concessão imediatamente. Não usar cache de autorização para grant.

Migration031 cria complimentary_access_grants e eventos mínimos com referência de autorização, sem e-mail/senha. Timestamps de concessão/revogação auditam o ciclo. Sem prazo automático; retenção operacional desses metadados precisa ser revisada no ciclo de privacidade. Suspensão/encerramento e guards de proprietário continuam obrigatórios. Checkout não deve iniciar para conta cortesia.

## Provisionamento

`scripts/complimentary-access.ts` usa stdin JSON com email,fullName,password,authorizationReference. Requer --owner-authorized e --database-confirmed=NOME. Somente credencial operacional no staging confirmado; não passar senha em argumento nem salvar em arquivo. Hash Argon2id 19MiB/t2/p1. Conta existente nunca tem senha/nome/grant sobrescritos. Operação nova é transacional e invalida tentativas pendentes do endereço. Confirmação da conta é administrativa, autorizada pelo responsável para teste; email_verified_at não prova cerimônia de verificação da caixa postal nesse procedimento. Não enviar mensagem externa automaticamente.

Revogação: `node --conditions=react-server --import tsx scripts/complimentary-access.ts revoke UUID_USUARIO UUID_AUTORIZACAO --owner-authorized --database-confirmed=NOME`. IDs não são credenciais, mas devem ficar em registro operacional restrito. Revogação de cortesia não altera eventual assinatura existente; o entitlement canônico de billing continua separado.

## Operação pendente

Verificar identidade CLI, projeto, ambiente, schema/checksums e domínio; preparar backup antes de migrations aditivas pendentes029–031 e grants. Não excluir nem reinicializar banco existente. Backup restrito, credenciais administrativas fora do web, TLS verificado preservado. Publicar somente staging e validar login/rota privada/entitlement via HTTPS sem imprimir cookie, senha ou sessão. Produção permanece fora do escopo.

## Evidências

41 testes de cortesia/lifecycle/exclusão aprovados em PostgreSQL descartável. Incluem restrição de produção/domínio, suspensão/confirmação, idempotência de revogação, sessões revogadas, identidade existente preservada e runtime incapaz de criar/alterar concessão. Lint, typecheck e build Webpack com14 canários/283 artefatos sem achados aprovados.

Operação autorizada no staging: CLI na conta correta, histórico028 conferido com checksums; backup do PostgreSQL em arquivo restrito no volume do próprio banco, catálogo de archive validado sem restaurar sobre dados. Migrations aditivas029–031/grants aplicados em transação única, sem reinicializar/excluir registros. Conta solicitada provisionada como profissional e confirmação administrativa; somente hash Argon2id transmitido por stdin ao banco. Senha nunca em argumentos, arquivo ou saída de logs. Nenhuma mensagem externa ou chamada Stripe realizada.

Deployment staging `e21a27e7-11d5-4aab-83b7-0954b6dcfd4c` enviado por fonte local, sem commit automático; SUCCESS. Smoke HTTPS externo: login200/destino dashboard; cookie Secure/HttpOnly; health200; assinatura200/state courtesy/entitlement true/sem expiração/sem billing; dashboard e APIs de alunos, exercícios e configurações200. Logout200 e replay de sessão401. Sessão de teste encerrada; nenhuma senha/cookie/hash foi registrado. Verificação SQL confirmou usuário professional, concessão ativa, ausência de billing e runtime com SELECT mas sem INSERT/UPDATE nos grants. Parâmetros de Argon2id confirmados (m19456/t2/p1); a checagem inicial por LIKE não correspondeu à ordem serializada dos parâmetros, corrigida por inspeção somente do algoritmo/custos, sem ler hash/salt. Esta versão também inclui os fluxos locais anteriormente solicitados de e-mail HTML/código e shell de contratação. O worker de exclusão não foi provisionado nem executado em contas reais. Registrar resultados externos separadamente. Não declarar homologação produtiva ou autorização para dados reais; NO-GO015 permanece.

## Evolução034 — gestão administrativa local

O relato031 acima é histórico. A entrega034 adiciona gestão de concessões existentes no painel Financeiro, prazo opcional e auditoria de admin; [contrato e limites atuais](../modulos/administracao.md#cortesias-no-financeiro--034-08112026). Runtime passa a INSERT de grant/event e UPDATE apenas revoked_at, sem alteração/eliminação de audit ou prazo. Local de desenvolvimento explicitamente separado de staging. O grant já existente em staging permanece sem prazo;034 não foi aplicada nem publicada remotamente. A conta convidada não foi alterada nesta entrega.
