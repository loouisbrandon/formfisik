# Preparação produtiva controlada — 15/11/2026

Estado: PREPARADO / EM AUDITORIA; NO-GO comercial e para dados reais preservado. Execução expressamente autorizada pelo fundador Brandon Louis. FormFisik independente; não presumir formalização jurídica. Canal informado pelo fundador: contato@formfisik.com.br; existência da caixa, recebimento, responsável por incidentes e revisão jurídica não foram confirmados. Não apresentar esses itens como homologados.

## Infraestrutura executada

Projeto Railway diligent-truth, ambiente production, serviço heartfelt-consideration, PostgreSQL Postgres-ofwr. Banco originalmente vazio, confirmado por leitura. Backup anterior à inicialização gerado com acesso restrito no volume. Migrations 001–040 e grants revisados aplicados atomicamente. Checksums comparados com o código. Papel formfisik_runtime dedicado, sem superuser/createdb/createrole/replication/bypassrls, sem CREATE em public ou DELETE em users. Credencial aleatória somente no secret manager; rede privada e sslmode=verify-full, CA própria normalizada para PEM. Start materializa CA em /tmp com umask077 e falha se ausente. Nenhum dado de usuário de staging copiado; produção contém zero usuários.

Catálogo: manifesto local e checksums verificados, 873 fontes/868 aceitos; inclusão reutiliza insertExercise/snapshot canônicos, com versões e eventos, transação e guarda de catálogo vazio. Descrições importadas conservam avisos de revisão técnica; contagem não é homologação profissional.

Backup após preparação: dump customizado restaurado com pg_restore --exit-on-error em banco novo e isolado. Confirmados 40 migrations, 868 exercícios, zero usuários e leitura pelo runtime; CREATE de schema e DELETE de users negados. Banco de ensaio removido, banco ativo preservado. Tempo observado 17.178ms; não é RTO aprovado nem ensaio com carga real. Dump localizado no mesmo volume não protege da perda desse volume. Backups nativos diários recusados pela Railway: recurso exclusivo de workspace Pro. Nenhuma mudança de plano efetuada. Falta backup independente/agendado e ensaio de restauração dessa cópia. Replay de eliminações existe nos testes locais; produção sem usuários/jobs não prova replay remoto representativo.

## Pagamentos e abertura

Chave live permanente validada em memória, conta esperada acct_1JqMyGLU4xUSRrPt. Em consulta desta execução, details_submitted=true; charges_enabled=false/payouts_enabled=false. Catálogo live de três produtos/seis preços e Portal restrito conferidos. Webhook próprio preparado sem reutilizar segredo sandbox. STRIPE_BILLING_MODE=disabled; ECOACH_AI_ENABLED=false. Não criar cliente, Checkout ou cobrança real nesta preparação. Financeiro profissional/Connect e vendas de produtos continuam separados e não são ativados por esse catálogo.

PRODUCTION_RELEASE_STATE ausente, desconhecido ou diferente de open fecha produção no proxy compartilhado. Páginas e APIs retornam 503/no-store/retry-after/noindex; somente GET/HEAD exatos de /api/health seguem para readiness do banco. Assets públicos continuam acessíveis e não contêm segredos. Estado é configuração de servidor, não header/cookie/claim do cliente; não substitui guards canônicos quando aberto. Sem bypass de usuário/admin. Staging e local preservam funcionamento.

Fonte GitHub produtiva permanece desconectada até fechamento dos gates; deploy fechado será explicitamente identificado abaixo. Não inferir abertura pelo status SUCCESS do Railway. Para abertura: comprovar backup independente/restore, cron/alertas/IAM/borda e direitos/retentivas aplicáveis; homologar Checkout sandbox e ativação Stripe, atualizar modo para live somente no alvo correto e revalidar; registrar GO antes de definir PRODUCTION_RELEASE_STATE=open. Não abrir por alteração de documentação ou pelo simples preenchimento de chave. Transação live controlada exige autorização específica.

## Correção de CI e verificação

CI da main d8d10f6 falhou no typecheck em checkout limpo porque next-env.d.ts gerado não existia. Script typecheck agora executa next typegen antes de tsc, conforme documentação Next instalada. next-env permanece ignorado, sem declaração manual ou supressão de erros. Checkout limpo sem env/cache validado. Testes de manutenção cobrem configuração fail-closed, páginas/APIs, headers forjados e método de health. Suíte completa/build/canários/deploy terão resultados registrados após conclusão, sem presumir aprovação.

## Pendências explícitas

- Titular: confirmar caixa contato@formfisik.com.br, responsável por incidentes e revisão jurídica/retentivas/termos.
- Infraestrutura: escolher Railway Pro para backup nativo ou destino independente aprovado; agendar e ensaiar, definir RPO/RTO e alertas. Não agendar eliminação de dados com retenção jurídica pendente.
- Operação: limpeza de temporários e reconciliação monitoradas, IAM/MFA, limites de borda e exercício de incidentes.
- Financeiro: Checkout hospedado e matriz de falhas/renovação/cancelamento em sandbox; liberação Stripe live.
- Recursos sem integração real (Connect, canais externos, venda/entrega de produto, fotos/storage se ausentes) continuam indisponíveis; não confundir UI com operação homologada.

Decisão posterior do fundador: manter o plano Railway atual por enquanto, com melhoria de plano ou VPS futura. Não contratar upgrade nesta execução. Backup manual/restore existente aceito como solução temporária, preservando explicitamente o risco de cópia no mesmo volume e a ausência de backup automático independente. Isso não equivale a RPO/RTO aprovado nem fecha os demais gates.

Evidência adicional: SET ROLE no banco produtivo confirmou todos false para flags administrativas, CREATE de public, ownership de tabelas públicas, DELETE de users, UPDATE de users.role e SELECT de privacy_erasure_jobs. Contagem de usuários permanece zero. Webhook live criado: we_1UbtnpLU4xUSRrPtZM1ZQ3CV; catálogo e Portal conferidos, billing continua disabled. Build local Webpack/TypeScript com 347 artefatos públicos e 16 canários sintéticos: zero achados. ESLint global e typecheck corrigido aprovados. Deploy fechado solicitado: ce46dff1-a5ec-475d-ace0-dca6398475fb; não presumir sucesso antes da validação HTTPS.

Validação HTTPS do domínio formfisik.com.br: GET /api/health 200; GET /, /login, /admin, /assinatura e POST /api/auth/login, /api/subscriptions/checkout, /api/stripe/webhook retornaram 503 esperado, mesmo com header cliente tentando solicitar abertura. HSTS, nosniff, DENY, no-store e Retry-After conferidos. Nenhuma conta, mensagem, Checkout ou cobrança criado. Processo produtivo iniciou com readiness válido e conexão runtime TLS; health não informa credenciais/schema ao público. Webhook fechado pode ser reenviado pela Stripe após abertura; não houve eventos de clientes reais nesta implantação. Não habilitar cobranças antes de abrir e homologar o caminho completo.

Railway confirmou SUCCESS para ce46dff1-a5ec-475d-ace0-dca6398475fb. Aplicação permanece fechada por configuração de servidor; esse status comprova deploy/readiness, não GO comercial.

Validação final: suíte completa em PostgreSQL descartável executada novamente após as correções: 655 testes aprovados, zero falhas/ignorados/cancelados, duração observada 523.238ms; banco descartável removido. ESLint global, typecheck local e em checkout limpo aprovados. Build de segurança aprovado com 347 artefatos públicos e 16 canários sem achados. Scanner dos arquivos candidatos: 1088 arquivos, nenhum segredo detectado. Não houve nova transação financeira real, envio de e-mail ou coleta de dados de cliente. Pendências acima permanecem; não declarar missão de abertura comercial concluída.
