# Plano de liberação — FormFisik web para personal

Data: 14/11/2026, America/Sao_Paulo. Estado: EM AUDITORIA / NO-GO para produção comercial e dados reais. Plano solicitado pelo fundador; não autoriza implementação financeira, migration, envio, deploy ou cobrança. FormFisik é empresa independente fundada por Brandon Louis; não presumir formalização jurídica concluída.

## Diagnóstico e evidência

Inspeção estática do checkout local em branch `feature`, HEAD `87546cb`, com alterações locais não consolidadas (92 entradas antes desta documentação). HEAD não representa integralmente o conteúdo inspecionado. Não há ainda versão imutável candidata a release. As últimas entregas de eCoach têm testes locais controlados; não certificam os demais módulos nem o ambiente remoto.

Consulta somente leitura ao Railway CLI: projeto `diligent-truth`. Staging: serviço `formfisik`, último deploy em 13/11/2026, SUCCESS, um deployment ativo, domínio `sta.formfisik.com.br`. Produção: serviço `heartfelt-consideration`, último deploy em 08/11/2026, FAILED, zero deployments ativos, domínio `formfisik.com.br`. Verificação HTTPS nesta inspeção: staging `/api/health` 200; produção `/api/health` 404. Isso confirma disponibilidade mínima, não homologação de fluxos, capacidade, configuração de segredos ou schema remoto. O conector Railway disponível vê outra conta (Onebase); inspeção da FormFisik foi feita pelo CLI autenticado correto. Não foram lidas variáveis secretas, alterados serviços ou consultados bancos remotos.

| Área | Implementação observada | Situação para lançamento |
| --- | --- | --- |
| Cadastro e login | Sessões opacas, confirmação por código/e-mail, recuperação, revogação e encerramento | Homologar entrega real Resend, expiração/reenvio, login/recuperação e autorização no ambiente alvo; implantação histórica não é aceite atual |
| Planos SaaS | Standard 49,90/mês (30 alunos ativos), Premium 89,90/mês (50), Pro 139,90/mês (ilimitados); anual único com 20% de desconto, trial único de 30 dias com cartão | Implementados; catálogo externo documentado somente no sandbox. Seis combinações exigem homologação; não afirmar produção financeira pronta |
| Cobrança da assinatura FormFisik | SDK, Checkout, Portal, cancelamento, faturas, estado canônico, webhook e reconciliação | BLOQUEADA em remoto/live pelo código. Não basta trocar a chave |
| Treinos e exercícios | Catálogo, particulares/moderação, fichas, divisões/séries/técnicas, modelos, aplicação, versões e PDFs | IMPLEMENTADOS localmente; testar jornada integrada no candidato de staging, catálogo efetivamente instalado e revisão técnica/direitos de conteúdo |
| Alunos e gestão | Carteira, acompanhamento, anamnese, check-ins, agenda, consultorias, CRM e indicadores | Implementação e evidências locais, com integrações/limitações por módulo. Não revalidado integralmente nesta inspeção |
| Produtos do personal | Cadastro digital/físico, capa/PDF/aulas/links, preço/oferta e snapshot de modelo de treino, prévia e estados privados | Cadastro IMPLEMENTADO localmente. Sem checkout de produto, comprador, pedido, entrega ou mensalidade cobrada; “pronto” não publica/vende |
| Financeiro do personal | Obrigações, recebimentos externos declarados, histórico e indicadores | Gestão implementada; processamento externo integrado NÃO IMPLEMENTADO no runtime, separado do SaaS |
| Store da FormFisik | Vitrine/detalhes, busca, curtidas e seleção de prévias na sacola | Prévia comercial; não é a venda dos produtos do personal. Sem compra, preço efetivo, pedido/estoque/frete/checkout |
| Aluno executando treino | Previsto na estratégia/critério de Personal 1.0 | NÃO IMPLEMENTADO: sem jornada de login/ativação/execução/séries/cargas do aluno. Convites de formulário não equivalem a isso |
| eCoach e atendimento | Gestão com propostas, contexto/histórico, mídia, filtro de escopo, cota e atendimento assistido | Evidências locais com provedores controlados; sem homologação real atual, canais externos não conectados. Recomenda-se entrega separada/beta explicitamente restrita |

Anual calculado pelo catálogo atual: Standard R$479,04, Premium R$863,04, Pro R$1.343,04, cobrança única por ano. Não há upgrade/downgrade/proration nem recontratação após encerramento implementados na entrega de múltiplos planos. Decidir fluxo comercial explícito de retorno antes de oferta recorrente pública; não prometer essas operações pelo Portal.

### Bloqueios financeiros concretos

`src/server/subscriptions/stripe.ts::stripeSettings` aceita apenas `sk_test_` e origens localhost/loopback; `assertPrice` e `validPortalConfiguration` recusam live. `service.ts` também recusa sessões/clientes/eventos live e sessões sem prefixo de teste. Uma adaptação precisa distinguir ambiente esperado de maneira uniforme em todas essas fronteiras, mantendo assinatura de webhook, produto, preço, moeda, conta recebedora e propriedade verificados. Retirar guardas sem substituição não é solução.

`src/server/finance/provider.ts::runtimeGateway` retorna `external_blocked`; testes com gateway injetado não implementam transporte real. Cobrar SaaS da FormFisik, cobrar serviço do aluno e vender produto são três domínios distintos, não uma mesma chave Stripe.

## Proposta de escopo inicial (a aprovar)

Lançamento web para o personal: cadastro/login, contratação SaaS, carteira, biblioteca, criação/modelos/versionamento de treinos e PDF; demais ferramentas de gestão somente após homologação dos fluxos expostos. Produtos entram como autoria privada, sem promessa de venda. Financeiro pode oferecer controle de recebimentos externos, sem processamento integrado. Store, canais externos, execução pelo aluno e IA comercial completa ficam fora da promessa inicial ou indisponíveis com limites reais no servidor quando houver operação privada.

Esse recorte reduz risco, mas NÃO contorna NO-GO015/016 ou requisitos de dados reais. Como a matriz oficial Personal 1.0 inclui execução e acesso do aluno, lançar um escopo reduzido exige decisão expressa do fundador e atualização da definição/oferta. Não chamar o recorte de Personal 1.0 completa. Se execução do aluno ou vendas de produtos forem requisitos do primeiro lançamento, desenvolvê-los e homologá-los antes de liberar esse escopo; não ocultar a ausência com uma vitrine.

## Três entregas para liberação

### 1. Candidato de release e pagamentos SaaS homologados

Consolidar alterações autorizadas e separar trabalhos ainda em desenvolvimento; fixar commit/tag, lockfile e manifesto do build. Confirmar escopo e descrições da oferta. Revisar todas as migrations/checksums/grants existentes versus staging antes de qualquer aplicação; não assumir equivalência com o local.

Implementar modo financeiro explícito local/test/live, restrito às origens aprovadas, com credenciais e IDs separados. Configurar e validar três planos e seis preços, valor BRL, periodicidade, trial, cartão, Portal e webhook HTTPS por ambiente. Guardar segredos somente no servidor. Definir comportamento de retorno de conta cancelada e de mudanças de plano (implementar se incluídas ou declarar indisponibilidade de forma comercialmente viável).

Em staging com sandbox real: cadastro por código, seis contratações, expiração de Checkout, retry, eventos duplicados/fora de ordem, ativação apenas por estado servidor, fim de trial, renovação mensal/anual com mecanismos de teste do provedor, recusa, recuperação, troca de cartão, cancelamento no fim da vigência, faturas e reconciliação. Simular falha de rede/webhook e validar que a página de retorno não libera acesso sozinha. Verificar limites Standard/Premium na criação, reativação e importação concorrentes. Sem coleta de cartão pela FormFisik.

Saída: evidências vinculadas a commit/ambiente, testes e resultados dos fluxos; nenhuma cobrança de cliente ou chave live em staging. Preparação live somente depois das configurações operacionais autorizadas, sem prova financeira falsa por cortesia vitalícia.

### 2. Núcleo de treino, produtos e operação segura em staging

Jornada ponta a ponta com dados sintéticos: conta nova → código → plano → aluno → exercício do catálogo → ficha completa → salvar/editar/versionar → ativar → aplicar modelo sem alterar original → PDF/mesmos bytes → arquivar/restaurar. Validar consultas entre duas carteiras e admin, assinaturas expiradas, concorrência e retorno de falhas. Confirmar catálogo instalado e revisado no ambiente, em vez de apenas contar exercícios locais.

Produtos: criar e-book com capa/PDF, curso/programa e treino pronto associado a modelo próprio; editar, prévia, estados, limites, arquivamento, revogação e exclusão. Declarar armazenamento bytea limitado (24 MiB/produto, 64 MiB/autor), monitorar volume e restauração. Produtos não ficam “vendáveis” até existir fluxo de compra/entrega completo. Se venda for obrigatória, abrir entrega própria de comprador/pedido/checkout/entitlement/entrega, com separação de recebedor e homologação.

Resolver e evidenciar remanescentes FF015-11: finalidades/retencões aprovadas, canal e responsáveis, direitos/portabilidade aplicável, retenções financeiras/contribuições, IAM, grants mínimos e isolamento. Validar storage privado R2/Stream somente onde utilizado, acesso/expiração/revogação e limpeza. Resend real: confirmação e recuperação na caixa de entrada, domínio/remetente e templates corretos.

Ensaiar backup e restore isolado incluindo ledger/reaplicação de exclusões e arquivos privados; definir RPO/RTO e medir. Agendar e monitorar rotinas realmente necessárias: reconciliação de billing, encerramento de contas, limpeza e eliminação. Definir metas de carga/latência/erro, executá-las e registrar medições; não inventar SLA aprovado. Testar teclado, viewport 1440/768/320, altura reduzida, 200%, PDFs/dialogs. Auditar dependências e canários no build efetivo; zero alta/crítica conhecida sem solução. Nenhum resultado parcial reclassifica os gates como aprovados.

Saída: matriz de aceite do escopo aprovado, defeitos bloqueadores fechados, pacote de evidências e runbook de operação/rollback. Dados reais e piloto somente após autorização e encerramento documentado do NO-GO aplicável.

### 3. Produção restrita, verificação e abertura gradual

Somente depois de GO registrado: preparar serviço produtivo hoje inativo, banco dedicado/grants, domínios/HTTPS, APP_URL, segredos e catálogo/live distintos, build imutável e health/readiness. Backup antes de migrations; executor administrativo separado do runtime. Não promover dados de teste. Aplicar alterações revisadas com plano de recuperação; reverter app somente se schema compatível, sem rollback destrutivo automático de dados ou histórico financeiro.

Configurar alertas de erro/health, webhook/reconciliação, workers e recursos; testar restauração e indisponibilidade. Realizar uma transação live controlada somente com autorização explícita, verificando fatura, conta recebedora, webhook, acesso e cancelamento/regularização previstos. Não acionar testes reais de cobrança como parte desta inspeção.

Iniciar com profissionais convidados e escopo/termos claros, amostra/duração/critérios aprovados. Monitorar suporte, latência, falhas de geração de PDF, pagamentos e filas. Abrir gradualmente após aceite técnico/profissional e decisão do fundador. Falha crítica interrompe novas contratações/ações afetadas, preservando registros e tratamento dos clientes existentes; não apagar faturamento nem confiar em rollback de webhook para desfazer cobrança.

Saída: release registrada com commit, ambiente, aprovadores, evidências, limitações e operação acompanhada. Só então declarar esse escopo pronto para produção.

## Limites desta inspeção

Foram lidos código/documentos e status público/CLI do Railway. Não foram executados novamente todos os testes do produto, auditoria de dependências, carga, restore remoto, análise jurídica ou jornada Stripe/Resend/R2 real. Não foi inspecionado schema remoto nem configurada variável/credencial. Os 99 testes e canários relatados na entrega de segurança do eCoach continuam evidência somente daquela execução local controlada. Nenhum deploy, cobrança, commit ou migration foi realizado nesta avaliação.

Referências: [Personal 1.0](../produto/personal-1.0.md), [inventário](../produto/inventario-funcional.md), [múltiplos planos](../engenharia/assinaturas-multiplanos-2026-11.md), [treinos](../modulos/treinos.md), [produtos](../modulos/produtos.md), [Store](../modulos/store.md), [NO-GO015](../engenharia/entrega-015.md), [016](../engenharia/entrega-016.md), [financeiro](../operacao/financeiro-profissional.md).

## Decisão posterior do fundador nesta sessão

O recorte web foi expressamente confirmado: personal cria treino e exporta PDF; aluno usa treino somente no aplicativo futuro. Assim, a ausência de execução/mobile não bloqueia este lançamento web, sem reclassificar o futuro como implementado. O teste em staging foi relatado pelo fundador como realizado por um personal com funcionamento normal. Sequência autorizada: planos/pagamento SaaS, financeiro do personal, revisão para produção controlada. Diagnóstico e entrega em [assinaturas por ambiente](../engenharia/assinaturas-ambientes-2026-11.md). O NO-GO remanescente não pode ser considerado resolvido apenas pelo relato funcional; será reavaliado com evidências aplicáveis ao recorte.

## Consolidação solicitada pelo fundador — feature → main

O fundador autorizou explicitamente merge e implantação produtiva. A chave permanente live foi configurada diretamente no Railway e validada em memória: conta esperada confere, details_submitted=true; charges_enabled e payouts_enabled continuam false no retorno efetivo. Isso não autoriza alegar pagamentos ativos. Nenhum segredo foi impresso ou incluído no Git.

Inspeção somente leitura de produção: PostgreSQL dedicado tem zero tabelas públicas; serviço web sem DATABASE_URL, sem modo de billing e sem segredo HTTPS de webhook. Não inicializado neste registro. A fonte GitHub do serviço heartfelt-consideration foi temporariamente desconectada, preservando serviços/variáveis/banco, para o push da main não disparar aplicação incompleta. Staging permaneceu conectado e disponível. Reativar a fonte loouisbrandon/formfisik, branch main, somente no passo de implantação operacional validado.

A autorização de deploy não foi registrada como resolução fictícia do NO-GO015/016. Continuam pendentes a homologação de Checkout hospedado, provisionamento/grants/backup/restore produtivos e operação de direitos/retencões/recuperação descrita nos relatórios. A ausência de aplicativo do aluno não é bloqueio deste recorte web.

Validações da consolidação: inspeção de 1085 arquivos candidatos sem segredos detectados; npm audit sem vulnerabilidades conhecidas; ESLint global aprovado. Build/canários e smoke hospedado constam em assinaturas-ambientes-2026-11.md. Três expectativas antigas de teste foram corrigidas: motivo billing_configuration_missing, navegação eCoach/Produtos e paginação financeira com registros legitimamente retidos por testes anteriores. Regressões direcionadas: autenticação 18/18, dashboard 10/10, encerramento + administração/financeiro 19/19. Não houve alteração da regra financeira para satisfazer teste.

Execução completa em PostgreSQL descartável: 653 testes, 650 aprovados e três expectativas antigas reprovadas; as três foram corrigidas e seus grupos reexecutados com os resultados acima, sem falhas. A suíte completa não foi repetida após esses ajustes exclusivos dos testes. O banco descartável foi removido. Nenhum resultado é declarado como homologação produtiva.
