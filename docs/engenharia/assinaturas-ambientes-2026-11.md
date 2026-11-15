# Assinaturas SaaS por ambiente — 14/11/2026

Estado: IMPLEMENTADO localmente; homologação hospedada PARCIAL/PENDENTE. Não declara produção liberada. FormFisik independente fundada por Brandon Louis. Escopo autorizado: planos e pagamento SaaS primeiro, financeiro do personal depois, revisão de produção controlada por último. Aplicativo/execução pelo aluno excluídos expressamente do lançamento web atual; personal monta treino e exporta PDF. Relato do fundador de uso bem-sucedido por personal em staging registrado, sem inferir testes financeiros não apresentados.

## Implementação

`src/server/subscriptions/environment.ts` centraliza modo e verificação de ambiente. `STRIPE_BILLING_MODE` admite test/live/disabled; ausente só mantém compatibilidade test em loopback sem ambiente Railway. Hospedagem exige opção explícita. Teste remoto aceita exclusivamente `RAILWAY_ENVIRONMENT_NAME=staging`, `APP_URL=https://sta.formfisik.com.br`; live exige production e `https://formfisik.com.br`. Chaves sk/rk precisam corresponder ao modo. `STRIPE_ACCOUNT_ID=acct_…` é obrigatório em remoto. Origem desconhecida, modo errado, chave incompatível ou ausência de configuração falham sem permitir Checkout.

O gateway confere `/v1/account` antes da primeira operação de negócio da instância e compara com a conta esperada. Falha/ID divergente impede operações; novos clientes/Checkouts live também exigem charges_enabled, payouts_enabled e details_submitted verdadeiros. A restrição de ativação não impede consultar faturas ou solicitar cancelamento de assinaturas existentes, que continuam exigindo identidade correta; identidade não é aceita do navegador. Chave restrita precisa permitir essa leitura além das operações necessárias de billing. Cache de verificação dura somente a instância; erro não libera chamadas. Segredos não integram DTO, props, logs ou bundles.

Preço/produto, cliente, sessão (`cs_test_`/`cs_live_`), assinatura, fatura, evento e Portal precisam concordar com o modo esperado. O webhook segue usando assinatura/timestamp sobre bytes exatos e recusa Connect neste domínio. Valores, moeda BRL, intervalo, metadata, titularidade, trial, cartão, idempotência e estado canônico continuam verificados. Chave live sozinha não habilita cobrança local/staging. Banco, conta, endpoints e segredos devem ser separados por ambiente; não trocar o modo de um banco já preenchido como migração de clientes.

O cabeçalho/avisos da assinatura mostram ambiente de teste somente em test. Live mostra pagamento seguro, com orientações sem cartão de teste. Modo público é enum limitado; não controla autorização. Contratos/API privados permanecem iguais, salvo motivo de indisponibilidade `billing_configuration_missing`; nenhum schema foi adicionado por esta entrega.

Continuam três planos, dois intervalos, anual único com 20%, trial único de 30 dias/cartão e limites ativos. Não foi autorizado/desenvolvido upgrade/downgrade ou recontratação neste ajuste. Financeiro profissional/Connect e venda de produtos não são ativados pelo suporte live do SaaS.

## Inspeção Stripe efetiva

Consulta somente leitura pela API sandbox usando configuração local confirmou os seis preços, moeda, valor, intervalo, produto e atividade. CLI já autorizado permitiu selecionar a conta real sem nova chave manual. Consulta live: conta `acct_1JqMyGLU4xUSRrPt`, charges_enabled=false, payouts_enabled=false, details_submitted=true, disabled_reason=requirements.pending_verification. Na nova execução autorizada, foram criados três produtos e seis preços live separados do sandbox (Standard, Premium e Pro; mensal e anual com 20%). A conta observada ainda aguarda verificação para cobrar/receber. Não concluir que outra conta não exista; não foi selecionada outra conta.

Foram criados somente produtos/preços live; nenhum cliente, Checkout ou cobrança real. A ativação/cadastro de negócio e eventuais verificações da conta precisam ser concluídos pelo titular no painel; não inserir documentos, aceitar termos ou alterar dados em nome do titular nesta entrega.

## Homologação que falta

1. Disponibilizar a versão revisada em staging, após consolidar o candidato e verificar schema/grants/backup do alvo. Configurar mode=test, conta esperada, seis preços sandbox, Portal e segredo de webhook próprio hospedado. Não reutilizar segredo do listener local. Inspecionar versão aplicada antes de testes.
2. Executar Checkout hospedado real sandbox: seis combinações, cartão obrigatório, webhook, retorno, faturas, cancelamento, recusa, expiração e renovação (Test Clocks/fluxos oficiais), falhas/reentregas e reconciliação. Cortesia não prova pagamento. Associar evidência à versão/ambiente.
3. Titular habilita conta real. Criar catálogo live separado com os mesmos valores e Portal restrito; configurar ambiente production e segredo próprio. Conta esperada deve ser a conta efetivamente escolhida. Não copiar clientes/assinaturas do sandbox. Transação live controlada exige autorização específica; nenhum teste controlado equivale a essa homologação.

Referências oficiais consultadas: [chaves/modos](https://docs.stripe.com/keys), [webhook HTTPS e assinatura](https://docs.stripe.com/webhooks), [trials no Checkout](https://docs.stripe.com/payments/checkout/free-trials). Modo teste e live possuem recursos separados.

## Evidências de validação local

82 testes aprovados em PostgreSQL descartável, zero falhas/ignorados: modos/domínios/chaves/conta, preços e Portal, seis ofertas hospedadas e lifecycle live com SDK/objetos sintéticos, webhook/idempotência, cancelamento, limites/importação de alunos e retenções/privacidade. Guarda de conta inativa confirma zero criação externa e permite leitura/cancelamento existentes. Não são transações live nem Checkout hospedado real.

Chrome local com conta sintética e disponibilidade interceptada: badge sandbox, três cards, orientação correta de cartão e layout 1440/768/320 sem overflow; nenhuma sessão de Checkout criada. ESLint dos arquivos desta entrega aprovado. Os três links internos para `/store` na landing passaram a usar o Link compartilhado, preservando o visual; ESLint global aprovado na consolidação.

Build final Webpack/TypeScript aprovado; auditoria de 345 artefatos públicos com 16 canários sintéticos sem achados. Aviso preexistente de metadataBase permanece. Nenhuma publicação Git ou cobrança real. Atualização operacional de staging registrada abaixo. Confirmação da conta via CLI foi somente leitura; detalhes pessoais do retorno não foram mantidos no relatório.

## Preparação hospedada autorizada — 14/11/2026

Staging: backup pg_dump restrito no volume do PostgreSQL, catálogo do arquivo verificado (restauração completa ainda não ensaiada). Checksums 001–034 conferidos; migrations 035–040 e grants de formfisik_runtime aplicados atomicamente. Permaneceram quatro usuários e 868 exercícios oficiais publicados. Produção não foi alterada.

Configurados por stdin, sem registrar segredos: modo test, conta esperada, chave sandbox, três produtos/seis preços, Portal `bpc_1UbsljLU4xUSRrPtmj1OZfNN` e webhook `we_1UbslkLU4xUSRrPtBQXZURVa` com 19 eventos SaaS e API 2026-10-28.endive. Portal permite histórico de faturas e atualização do pagamento; troca e cancelamento pelo Portal desabilitados para preservar os fluxos do sistema. Segredo HTTPS próprio, separado do listener local. Publicação e homologação hospedada continuam pendentes até evidência abaixo.

A autenticação do Stripe CLI permite operar o catálogo, mas não substitui uma credencial permanente de servidor em produção. Não copiar credenciais temporárias do CLI para Railway. NO-GO operacional/privacidade permanece até fechamento documentado.

Validação final: ESLint global e build Webpack/TypeScript aprovados; 346 artefatos públicos auditados com 16 canários e zero achados. Snapshot de código enviado ao staging: SHA-256 `4f644af90b6c32f6067309950e045ce30f558fd37231185b526fc1743e241656`, 1084 arquivos; excluídos segredos, caches, credenciais e artefatos de teste. Deploy solicitado `2b07d3a5-d8f9-4328-9c6b-d1b6093a85fa`; resultado deve ser conferido, não presumido pelo upload. Portal live preparado `bpc_1UbssmLU4xUSRrPtKaF9SqBZ`, sem clientes/cobranças; CLI restaurado ao sandbox. Credencial permanente live solicitada diretamente em Railway, nunca no chat.

Resultado hospedado: deploy `2b07d3a5-d8f9-4328-9c6b-d1b6093a85fa` SUCCESS. HTTPS `/api/health` 200; disponibilidade e Checkout sem sessão 401; webhook sem assinatura 400. Conta sintética autenticada confirmou as seis ofertas `ready` em staging. Nenhum Checkout, e-mail ou cobrança criado nesse smoke. Isso não comprova conclusão de pagamento, processamento de webhook genuíno, renovação ou cancelamento hospedados; a matriz financeira permanece pendente.
