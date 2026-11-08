# Remediação da auditoria — 08/11/2026

Escopo autorizado: corrigir achados locais e preparar prevenção de regressões. O responsável confirmou que a FormFisik está somente local. A conexão Railway foi consultada apenas para identificar projeto próprio; não havia projeto FormFisik. Nenhuma infraestrutura de outra empresa foi utilizada ou alterada. Não houve deploy, commit, configuração remota de WAF, serviço financeiro externo ou troca de credenciais reais.

## Dependências

O `npm audit` anterior continha 13 ocorrências transitivas: 11 moderadas e duas baixas, originadas de minimatch e deepmerge no tooling. A árvore foi corrigida sem downgrade do Next/ESLint ou `audit fix --force`:

- Removido o CLI `shadcn@4.23.0`, cujo único uso era o import de CSS. CSS e licença MIT foram preservados sem mudanças em arquivo local, com versão/origem/SHA-256 em `licenses/README.md`. Isso elimina deepmerge (sem versão corrigida publicada), ts-morph e a árvore desnecessária do gerador, em vez de ocultar o advisory. Instalação removeu 131 pacotes e não executou scripts de instalação.
- Override restrito a `@typescript-eslint/typescript-estree > minimatch`, fixado em `11.0.5`. Não troca as versões 3.x utilizadas pelos demais plugins. Node 22/24 satisfaz o requisito `20 || >=22`; licença BlueOak-1.0.0 permissiva, sem uso no aplicativo cliente/servidor. O override atravessa a major do utilitário porque o upstream ainda dependia de 10.x: compatibilidade é validada pelo lint completo e registrada, não presumida.
- Resultado atualizado: **zero alertas conhecidos no audit completo**, incluindo ferramentas de desenvolvimento. Lockfile registra a resolução; advisories futuros exigem nova avaliação.

Fontes: [advisory minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) e [advisory deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Não se afirma que auditoria npm detecta vulnerabilidades desconhecidas.

## Sessão e conta

A mesma revalidação de inatividade pós-lock aplicada às configurações sensíveis foi acrescentada ao pedido de troca de e-mail, antes da criação do token/envio SMTP. A sessão precisa continuar não revogada, válida por prazo absoluto e ativa nos últimos 30 minutos depois de aguardar o lock e verificar a senha. Teste concorrente verifica rejeição e ausência de token; envio externo não é necessário.

## Banco e operação

O script existente `db/operations/runtime-grants.sql` foi complementado para configurações027: perfil/conta, preferências/avatar, solicitações de privacidade, eventos e troca de e-mail. Não há permissão de alterar role, suspensão, auditoria, resolução de solicitação ou excluir configurações. O UPSERT de solicitação recebe somente UPDATE(user_id), sem privilégio sobre status/resolução. A alteração de e-mail confirmado recebe colunas específicas, sem UPDATE irrestrito de users. Todos os grants passam a estar numa transação, evitando aplicação parcial do arquivo.

Ensaio em PostgreSQL18 descartável valida operações reais de configurações com runtime restrito, DDL negado, proteção de roles/contas/auditoria/ledger, demais módulos e backup/restore com replay das eliminações. **Os grants não foram aplicados ao banco local existente** e nenhuma credencial foi criada/trocada nele. Antes do ambiente externo, provisionar runtime/migrador/operador separados e aplicar o script revisado no alvo explicitamente autorizado. Não reutilizar credencial administrativa de desenvolvimento em produção.

O diagnóstico de privilégios inclui agora ownership do banco/schema e privilégio CREATE do banco. `operations:check` passa a sair com erro se o schema não estiver pronto **ou** se os privilégios básicos não forem seguros; saída é mínima, sem nomes/credenciais. O comando é diagnóstico operacional, não certificação de infraestrutura; runtime continua sem leitura dos dados do ledger operacional.

Durante esta execução, uma chamada redundante de verificação de migration recebeu TEST_DATABASE_URL, mas não DATABASE_URL; o migrador carregou a conexão local. O schema já estava atualizado (health anterior 200 e mesmo conjunto/checksums), portanto nenhuma migration nova foi aplicada. Foi acrescentada trava no CLI: com TEST_DATABASE_URL presente, DATABASE_URL precisa coincidir explicitamente; divergência falha antes de conectar, sem imprimir URLs. As demais migrations e testes ocorreram exclusivamente nos bancos descartáveis do harness.

## Prevenção de regressões

- `npm run security:build`: build Webpack efetivo com credenciais sintéticas, seguido de inspeção de `public` e `.next/static`. Não usar esse build de teste como artefato de deploy.
- `npm run security:exposure -- --history`: verificação de valores configurados, padrões reconhecíveis de credenciais e mapas públicos. `--public-only` delimita a inspeção aos artefatos; é usado no build com canários, cujos literais existem no próprio script de teste. O histórico verifica valores configurados; padrões de credenciais são verificados nos arquivos atuais, não representam detecção universal/histórica de qualquer formato.
- Workflow `.github/workflows/security.yml`: audit completo falha a partir de baixa severidade, lint, typecheck, suíte em PostgreSQL descartável e build com canários. Ações oficiais fixadas em SHA, token somente leitura e sem persistir credencial de checkout; sem segredos reais e sem deploy. Arquivo preparado; a execução em GitHub depende de commit/push autorizado, não realizado nesta entrega.

## Limites e pendências externas

Como só existe ambiente local, WAF, domínio público, TLS externo, IAM dos provedores, agendamento/alertas e backups externos ainda não existem para homologar. Não foram substituídos por flags dizendo “aprovado”. Ao provisionar staging: origem restrita atrás da borda confiável, HTTPS, limites de corpo/tempo/conexão/concorrência, bot management, logs saneados, MFA/IAM, banco sem acesso público indevido e ensaio real de restore/revogação de objetos.

Acesso direto ao HTML/CSS/JS/imagens e às respostas autorizadas é inerente ao navegador. O projeto não implementa bloqueio de DevTools, cópia ou scraping absoluto. A barreira de beta continua uma funcionalidade separada, ainda não implementada. NO-GO015 de produção/dados reais permanece até cumprir seus gates operacionais/jurídicos; não é removido por corrigir dependências ou passar em testes locais.

## Verificações adicionais

O `.env.local` existente tem permissão0600; app e PostgreSQL de desenvolvimento foram conferidos escutando em 127.0.0.1, sem bind público. Não foi preciso alterar o conteúdo ou permissões do arquivo de segredos.

O ensaio operacional aprovado abrange criação/upgrade/idempotência/checksums/rollback de migrations, dump/restore em banco vazio, replay de eliminação, retenção financeira, retry de objeto privado e smoke sob runtime restrito dos módulos, agora incluindo configurações027. Esses resultados são locais e sintéticos, não um backup real do ambiente de desenvolvimento nem homologação de R2/Stripe/SMTP externos.

A suíte ampliada identificou cenários antigos de falha do provedor que presumiam consulta Stripe em toda leitura. Foram ajustados para vencer a confirmação canônica de cinco minutos antes de provocar falha e reconciliar explicitamente o provedor controlado depois. Não se alterou a regra de autorização para fazer esses testes passarem. Um texto aprovado do Checkout foi simplificado para remover o termo técnico “identificadores”; o filtro de erros desconhecidos/sensíveis permanece inalterado.

As fixtures de SMTP de cadastro, recuperação e troca de e-mail passaram a limpar autenticação herdada antes de usar o servidor local controlado. Foram revalidadas deliberadamente com usuário/senha SMTP fictícios no processo pai:21 testes de cadastro/recuperação e sete de configurações passaram, sem utilizar credenciais reais.

O CI utiliza checkout v7.0.1 e setup-node v7.1.0, com commits oficiais verificados e runtime Node24 das ações; a aplicação é testada em Node22. YAML/permissões foram verificados localmente. O workflow remoto ainda não foi executado.

## Resultado final e rastreabilidade

- Audit npm completo: **zero alertas conhecidos**, incluindo tooling; sem dependências omitidas para esconder o resultado.
- Build final Webpack com canários: aprovado;281 artefatos públicos,13 configurações sensíveis sintéticas,nenhum vazamento/source map público encontrado. Controles negativos de credencial desconhecida e source map foram detectados e removidos.
- Navegador no build final HTTPS: aprovado com canário adicional da chave de criptografia027;zero vazamentos,zero violações CSP e zero erros de console. Cookies Secure/HttpOnly/SameSite=Lax,logout,revogação,troca entre abas,isolamento,PDF,axe e responsividade nos fluxos exercitados preservados. Provedores controlados somente em loopback.
- Lint global,typecheck e `git diff --check`: aprovados. Uma tentativa de typecheck concorrente com o build encontrou arquivos de tipos em regeneração; a execução sequencial após o build passou. Nenhuma supressão de erro TypeScript aplicada.
- Suíte ampla:544 testes exercitados;524 passaram na primeira execução e20 falharam por cenários antigos de frescor canônico,texto técnico e contaminação da autenticação SMTP das fixtures. **Os20 foram reexecutados e passaram após correções**, com correspondência de nomes conferida;nenhum desses cenários permaneceu sem revalidação. Não se apresenta essa primeira execução como uma rodada única limpa nem se afirma ter repetido os544 integralmente.
- Rodada conjunta final de segurança: **63 aprovados,zero falhas/ignorados** em autenticação,cadastro,recuperação,sessões,isolamento,configurações,admin,feedback e hardening operacional. Os quatro cenários de guard dos módulos de avaliações,fotos,relatórios e documentos também passaram em rodada direcionada.
- Operação descartável: backup/restore/replay e runtime restrito aprovados, incluindo configurações027. Contêiner descartável removido ao terminar;nenhuma implantação de grants no banco existente.
- CI: arquivo validado,sem execução remota,commit ou push. Infraestrutura externa continua não provisionada.

Evidências temporárias: `/tmp/formfisik-remediation-audit-after.json`, `*-tests.log`, `*-union-proof.json`, `*-final-security.log`, `*-operations/operations-proof.json`, `*-browser-final/after-production.json`, `*-build.log`, `*-exposure-final.log`, `*-lint.log` e `*-typecheck.log`, com o prefixo `/tmp/formfisik-remediation`. Não publicar esses artefatos como conteúdo do site. São ensaios sintéticos; arquivos temporários podem ser removidos pelo sistema.

**Status:** remediação local concluída para os achados técnicos descritos;NO-GO de produção015 preservado. Segurança depende de manutenção contínua e dos gates externos já registrados. Não é promessa de ausência de vulnerabilidades ou de impedimento absoluto de cópia/scraping.
