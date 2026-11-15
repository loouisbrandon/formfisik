# Navegação e experiência de Exercícios

Estado: IMPLEMENTADO e verificado localmente; não representa homologação de produção.

## Diagnóstico e decisões

A inspeção encontrou `professionalAccess` forçando reconciliação externa em toda abertura de módulo. O serviço canônico já define validade de cinco minutos, autorização via PostgreSQL e reconciliação de snapshots antigos. O guard compartilhado de páginas e endpoints profissionais passa a usar essa política existente (`refresh=false`, `details=false`): não consulta Portal nem faturas, não faz cache de permissão no navegador e não remove checagens de sessão, papel, período, cancelamento, pagamento ou estado de sincronização. Webhooks continuam atualizando a fonte canônica; estados vencidos ou indisponíveis negam acesso. Falhas conhecidas respeitam o retry de 60 segundos. Atualização explícita da assinatura conserva seu fluxo de reconciliação.

Cada módulo recebe `loading.tsx` próprio reutilizando o skeleton comum, para streaming e prefetch parcial automático do Next. A sidebar confirma navegação pendente por `useLinkStatus`; não força prefetch integral de todos os módulos nem antecipa consultas privadas de listas. Em desenvolvimento há custo adicional de compilação; medir produção separadamente antes de prometer latência.

Exercícios recebeu abas com estado ativo, editor compartilhado em seções, grupos musculares em chips, disclosure de aliases, orientação contextual e cards de solicitações. Reutiliza contratos e paginação; não há migration, dependência nova ou mudança da política de publicação. Leituras obsoletas de correspondências são abortadas; debounce da biblioteca fica restrito à digitação.

## Evidências locais

Playwright, conta sintética já existente, sem submissões de exercícios: três abas abertas em 1440 px; editor também em 768/320 px, sem overflow horizontal ou erros JavaScript. Capturas em `/tmp/exercise-{create,request,requests}-1440.png` e `/tmp/exercise-create-{768,320}.png`.

Medição exploratória no servidor de desenvolvimento: Exercícios antes 1.889–4.085 ms até heading, após 481–1.210 ms; Agenda antes 3.896 ms, após 754 ms. Amostra pequena, com compilação e cache variáveis; não é benchmark de produção. Remoção determinística de 200 ms na leitura inicial/filtros da biblioteca e de reconciliação externa nas navegações com snapshot recente.

Regressões usam PostgreSQL descartável e gateway Stripe controlado, separados do banco de desenvolvimento e da API financeira externa. O guard do teste impediu uma primeira execução sem `TEST_DATABASE_URL`; nenhuma operação de teste ocorreu no banco local. Validação manual de envio/descartar formulários não foi realizada contra a conta persistente: o roteiro inicial de confirmação foi bloqueado pela revisão automática e substituído por navegação somente de leitura.

Resultados: typecheck e lint dos arquivos/rotas envolvidos aprovados. As 14 regressões de Exercícios passaram no banco descartável. As 10 regressões de Dashboard passaram após adaptar a expectativa ao retry passivo já existente: snapshot recente evita Stripe; snapshot antigo com falha nega; retry após 60 segundos confirma cancelamento; trial vencido localmente nega imediatamente. A primeira rodada teve uma expectativa antiga de recuperação imediata, corrigida no teste, sem remover o cooldown do produto.

Segunda passagem de leitura após aquecer as rotas: Agenda 437/467 ms e Exercícios 707 ms até o heading. A variação reforça a necessidade de medir ambiente otimizado separado. Capturas mobile foram atualizadas após compactar as abas em duas colunas.

Build otimizado aprovado com `npm run build -- --webpack`. O build padrão Turbopack falhou ao tentar abrir uma porta no ambiente (`Operation not permitted`), sem mudança permanente do bundler. Segunda compilação efetiva com canários sintéticos em variáveis privadas aprovada: 252 artefatos públicos examinados, zero ocorrências. Aviso preexistente de `metadataBase` continua fora deste escopo. `git diff --check` aprovado. Nenhum deploy realizado.
