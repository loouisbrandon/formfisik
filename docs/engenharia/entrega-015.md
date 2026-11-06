# Entrega 015 — Auditoria, correção e revalidação

FormFisik é empresa independente fundada por Brandon Louis. Esta entrega não presume constituição jurídica formalizada. Execução exclusivamente local com dados sintéticos; sem deploy, commit, alteração de credenciais, banco existente ou recursos externos. **Auditoria técnica local concluída; veredito NO-GO para produção e dados reais.**

## 1. Resumo executivo

Revisão das entregas 001–014, correções verificáveis e controles permanentes. Corrigida aceitação de confirmação expirada sob lock, adicionada suspensão transacional de conta, reduzidas respostas/consultas excessivas, implementados CSP e headers e ampliadas regressões. Não há certificação OWASP/LGPD nem garantia de ausência absoluta de falhas. Veredito de produção: **NO-GO**, pelas pendências essenciais documentadas abaixo, mesmo com validações locais aprovadas.

## 2. Metodologia

Leitura integral de AGENTS e solicitação, arquitetura/privacidade/operação, migrations 001–014, schemas/contratos, handlers/repositórios, componentes de chamadas, configuração/scripts/dependências antes das mudanças de runtime. Inventário inicial e SHA-256 dos arquivos em `test-results/015/baseline-source.json` preservam o trabalho 014 já não commitado. Revisão estática, reprodução negativa antes da correção, PostgreSQL 18 descartável e navegador Chrome sobre build efetivo de produção. Nenhum scan ativo externo. Consultas públicas de advisories/ANPD/OWASP não alteram serviços.

## 3. Escopo auditado

Cadastro/confirmação/login/logout/recuperação/sessões; assinatura/trial/Portal/webhooks; dashboard; alunos; catálogo/particulares/solicitações/moderação; treinos/modelos/versões; avaliações/gráficos; fotos/calendário/comparação; PDFs/identidade profissional; banco/migrations/scripts/cleanup; server-client/configuração/logs/dependências. [Decisões técnicas](../arquitetura/ADR-015-seguranca-e-minimizacao.md).

## 4. Mapa de superfícies de ataque

[Inventário detalhado](../seguranca/superficies-e-endpoints.md): páginas públicas/privadas, cookie, binários, conexões, tabelas/recursos e operações privilegiadas. Não há Server Actions próprias nem autenticação paralela. Proxy novo aplica somente headers/CSP; autorização permanece nos serviços existentes.

## 5. Inventário de endpoints

59 rotas de API existentes, com métodos/implementação/fronteira na tabela do inventário. Mutações exigem Origin/JSON/validação/limites; webhook usa assinatura oficial e corpo bruto. Consulta comercial/autenticação e moderação têm exceções de entitlement justificadas: contratar/regularizar e capacidade administrativa não dependem de assinatura ativa. UUID não autoriza. Novas projeções permanecem no endpoint/guard existente, sem duplicar autorização.

## 6. Inventário de dados pessoais

[Categorias, finalidade, fonte, titulares, acesso, compartilhamento, persistência, propostas de retenção/eliminação, riscos e bases para revisão](../privacidade/inventario-e-retencao.md). Contexto corporal recebe proteção elevada; fotografia não é classificada automaticamente como biometria. Cartão completo somente no provedor, sem persistência própria.

## 7. Achados por severidade

| ID / severidade | Componente e condição / impacto | Evidência segura / correção / regressão / estado |
| --- | --- | --- |
| FF015-01 / Moderada | `registration.ts`: confirmação espera lock; `now()` mantém início da transação; token vencido durante espera é consumido | PostgreSQL sintético: antes 200 quando esperado 400. Alterado para `clock_timestamp()`; `security.test.ts` reproduz espera/expiração e impede criação. Corrigido e verificado |
| FF015-02 / Alta para operação com contas suspensas | Ausência de estado de desativação; não havia controle de bloqueio/revogação de conta comprometida | Modelo 001–014 sem coluna/fluxo. Migration 015, trigger, guards e CLI restrita; regressão comprova revogar sessões/reset e negar login/reativação sem revival. Corrigido localmente; instalação operacional futura não executada |
| FF015-03 / Moderada | CSP global ausente; proteção de scripts/frames incompleta | Configuração anterior protegia apenas reset parcialmente. Nonce por resposta, HTML dinâmico, script sem inline/eval, headers globais. Zod configurado jitless para evitar probe Function. Verificação final de navegador na seção 13 |
| FF015-04 / Moderada | Respostas de sessão/listas/contexto continham identidade/notas/instruções não necessárias à tela | Captura before: sessão 288B; avaliação 3604B + comparação oculta 2481B; fotos 834B; exercício 545B. DTOs mínimos/detalhes autorizados sob demanda/projeção de identidade; regressão de campos e medição final. Corrigido |
| FF015-05 / Baixa | Polling inicial duplicava validação SSR e buscava indicadores/Portal/histórico só para testar acesso | Antes dashboard 2 chamadas de API ao montar; monitor consulta contagens. Removida consulta inicial redundante, view=access e details=false no serviço canônico; sem relaxar fresh entitlement. Corrigido; medição seção 15 |
| FF015-06 / Baixa | Leituras sobrepostas e conteúdo oculto podiam continuar consultas/consumir recursos | AbortController e guarda de resposta obsoleta em leituras; comparação recolhida e ampliação de foto sob demanda; bytes passivos consumidos/cancelados. Regressões de navegação e browser; pendências de refatoração não autorizam cache privado global |
| FF015-07 / Baixa | Contratos antigos de autenticação descartavam campos extras sem rejeitar | Schemas strict e verificação de token estrita; entradas role/expiry/userId rejeitadas; sem atribuição protegida anterior comprovada. Corrigido |
| FF015-08 / Baixa | Nome de aluno no filename de treino aumentava exposição fora do conteúdo deliberadamente exportado | Filename genérico por data/versão, sem nome; byte content e propriedade preservados. Regressão de documentos. Corrigido |
| FF015-09 / Baixa | Geração de treino podia deixar stream PDF aberto ao exceder limite/erro antes de end | try/catch destrói documento e trata rejeição; limites de 120 páginas/8MiB preservados. Regressão PDF. Corrigido |
| FF015-10 / Moderada (ferramentas) e Baixa | Advisories minimatch/deepmerge transitivos; npm propaga efeitos para 21 pacotes | Registro público: 0 crítica/alta, 19 moderadas/2 baixas agregadas; duas origens de advisory. Sem downgrade incompatível; Shadcn separado como build/dev. Runtime audit zero. Remanescente justificado: tratar ferramentas em ambiente restrito, sem globs/registries não confiáveis, rever versões compatíveis no release |
| FF015-11 / Alta — bloqueio operacional | Eliminação integral/restore/IAM/agendas/alertas/contratos/canais não comprovados para dados reais | Políticas anteriores explicitavam lacunas; fotos têm remoção durável, demais dados não têm expurgo integral validado. Inventário/runbooks/minutas e suspensão não equivalem a implementação desse expurgo. Remanescente: NO-GO, dono Brandon Louis/operador e revisão jurídica; não executar operações reais sem autorização |

Severidade refere-se à condição descrita; não reduzir classificação para liberar produção. Nenhuma falha de isolamento ou bypass foi comprovada nas verificações executadas; isso não prova inexistência absoluta.

FF015-12 / Moderada: leitor JSON limitava bytes, mas não a duração total de stream incompleto. Acrescentado deadline total de 15s e cancelamento do reader, com regressão de stream lento sintético. Proteção distribuída de borda permanece pendente. Corrigido localmente.

FF015-13 / Moderada: uma aba antiga podia conservar DOM da conta anterior após login em outra aba; polling reconhecia sessão válida sem distinguir a conta. Adicionados contexto pseudônimo de exibição e invalidação entre abas sem persistência/credenciais, com limpeza do shell e revalidação de navegador. Este contexto não autoriza acesso.

Controle preventivo adicional: allowlist do otimizador de imagens somente para assets públicos/build, sem remotos. Não foi comprovado vazamento no otimizador da versão instalada (fetch interno já remove headers); teste assegura rejeição de fontes privadas/loopback antes de qualquer otimização.

## 8. Vulnerabilidades corrigidas

FF015-01–09 e FF015-12–13 com reutilização de controles e mudança delimitada. Credenciais continuam Argon2id; sessões opacas e autorização comercial no servidor. [Migration/contratos e tradeoffs](../arquitetura/ADR-015-seguranca-e-minimizacao.md). Nenhuma assinatura fictícia ou coleta de cartão foi adicionada.

## 9. Vulnerabilidades e controles remanescentes

FF015-10 e FF015-11 permanecem explícitos. Eliminação integral/portabilidade, revisão de retenções e restauração com reaplicação de exclusões precisam de solução operacional e técnica validada antes de dados reais. Não foi executada exclusão real. Segurança de borda distribuída/slow body, SIEM/imutabilidade, auditoria completa de leitura, MFA/IAM de operador, grants runtime e backups de produção não são certificados pelo código local.

## 10. Evidências sanitizadas

`test-results/015`: [índice de arquivos e hashes](../../test-results/015/source-audit.json), [resumo verificável](../../test-results/015/verification-summary.json), baseline-source, before-production, after-production, build final, audits de dependências, capturas sintéticas e logs locais saneados. O índice diferencia mudanças da 015 do trabalho 014 já presente; README/CHANGELOG têm alteração documental explicitamente registrada fora do snapshot inicial. Sem senha/token/cookie em relatórios. Scanner rastreado: 357 arquivos; único padrão de URL com credenciais em `.env.example` é placeholder, não segredo real. Não imprimir `.env.local`. Valores canários servem exclusivamente como strings sintéticas de teste; teste falha se aparecerem em bundle/HTML/resposta/console/storage/log.

## 11. Testes de segurança

`tests/security.test.ts`: expiração durante lock, desativação/revogação/reativação, contratos estritos, CSP, sessão mínima com contexto pseudônimo de exibição, supressão de Portal na autorização sem alterar canonicidade, monitor mínimo, acessos cruzados (dois profissionais/múltiplos alunos), anonimato/role e DTO mínimo. Suites anteriores cobrem expiração/replay/fixação/reset, mass assignment/CSRF/SQL, webhooks assinados/dedupe/ordem/concorrrência, uploads/EXIF/limites/remoção/revogação/PDF/ausência de R2. Ambientes `_test` obrigatórios; nunca banco existente.

## 12. Testes de regressão

Suíte final completa: **210 aprovados, 0 falhas, 0 cancelados e 0 ignorados** (267.286 ms), PostgreSQL 18 descartável em banco exclusivo, com execução serial interna. O resultado cobre as alterações finais de runtime. ESLint/TypeScript, os nove runners de navegador e a reconstrução final do build real foram aprovados. Build usa Webpack, pois Turbopack encontrou restrição local ao criar porta interna; não foi desabilitada proteção de produto. A regressão fotográfica detectou e confirmou a correção de loading preso quando uma comparação pendente era cancelada ao selecionar modo manual sem duas avaliações. O estado é limpo antes do retorno antecipado, sem consulta desnecessária.

| Verificação | Resultado / ambiente |
| --- | --- |
| `npm test` | 210/210, PostgreSQL descartável, zero ignorados |
| `npm run lint` / `npm run typecheck` | Aprovados |
| `test:dashboard:e2e`, `test:students:e2e`, `test:exercises:e2e`, `test:workouts:e2e` | Aprovados, Chrome e handlers reais em harness controlado |
| `test:workout-documents:e2e`, `test:assessments:e2e` | Aprovados, contratos mínimos/detalhes e filename genérico validados |
| `test:photos:e2e`, `test:reports:e2e` | Aprovados, armazenamento privado controlado somente no teste, Axe e responsividade |
| `test:e2e` | Aprovado: SMTP local/cadastro/login/reset/sessões, acessibilidade e estados visuais controlados de assinatura |
| `test:security:e2e -- --build` | Aprovado: build Webpack e navegador HTTPS sobre a árvore real de produção |
| `git diff --check` | Aprovado no fechamento |

## 13. Auditoria do frontend

`tests/security-production-e2e.ts` executa árvore real de rotas sobre build de produção, PostgreSQL real descartável, HTTPS local e SDK Stripe oficial com transporte redirecionado somente no processo de teste para loopback. Sem provider falso/flag de autorização no produto. R2 permanece ausente e UI informa indisponibilidade. Inspeção: HTML/RSC/bundles/respostas/cookies/console/Web Storage/logout/troca de usuário, módulos e PDF.js real, Axe e 1440/768/320px. Certificado self-signed aceito apenas no contexto de navegador de teste; Secure/HttpOnly/CSP permanecem ativos.

Instrumentação lê clone das respostas para observar bytes que o frontend anterior consultava apenas por status. Não muda requisições/credenciais/respostas/entitlement. Bodies de preload perdidos por navegação são cobertos também pela inspeção do build estático. Erro CSP detectado do probe Zod corrigido com jitless, sem permitir eval. Resultado final: **zero vazamentos de canários, zero violações CSP e zero erros de console**; logout/troca entre abas e mudança de cookie sem notificação foram verificados. Fontes privadas/remotas no otimizador foram rejeitadas; arquivos de ambiente/código no HTTP retornaram 404; nome com marcação HTML foi exibido como texto sem execução. A integração com serviços externos reais não é homologada por esse ensaio.

## 14. Auditoria de dependências

Lockfile v3, 698 entradas incluindo raiz. Install scripts declarados: Argon2 (node-gyp-build), esbuild (install.js), unrs-resolver (postinstall.js) e fsevents opcional Darwin; nenhum script de instalação do projeto. Não executar scripts/registries desconhecidos. Sem prova de abandono crítico nos componentes de runtime instalados; revisão de advisories é temporal, repetir antes do release.

Licenças no lock: MIT/Apache/BSD/ISC/BlueOak/MPL/LGPL/Python/CC0/CC-BY e combinações. Sharp/libvips e assets DejaVu/catálogo exigem manter avisos/licenças; verificar obrigações concretas de distribuição com responsável. Catálogo técnico/licença de contribuições não é homologado por auditoria de software.

`npm audit` completo: 21 efeitos (19 moderadas/2 baixas, zero altas/críticas) originados em [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) e [deepmerge GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Recomendações automáticas incluem downgrades incompatíveis; não aplicados. Shadcn só gera componentes e fornece CSS no build, movido para dev sem mudar versão. `npm audit --omit=dev`: zero avisos no runtime. Isso não corrige os advisories das ferramentas nem elimina a necessidade de CI restrita.

## 15. Requisições antes/depois

Medição real com mesmos dados sintéticos e passos no build anterior e final. Evidências: [antes](../../test-results/015/before-production.json) e [depois](../../test-results/015/after-production.json). Contagens referem-se a APIs do navegador; consultas SSR/provedor são medidas separadamente e não omitidas para sugerir autorização eliminada. Prefetch de navegação pode variar; não confundir métrica de uma execução com benchmark universal.


| Fluxo / chamadas API no navegador | Antes | Depois |
| --- | ---: | ---: |
| Login | 3 | 1 |
| Dashboard | 2 | 0 |
| Alunos | 4 | 2 |
| Exercícios | 4 | 3 |
| Treinos | 3 | 1 |
| Avaliações | 5 | 2 |
| Relatórios | 4 | 2 |
| Assinatura | 2 | 1 |
| Fotografias | 7 | 4 |
| PDF | 6 | 4 |
| Logout | 4 | 2 |
| Troca de usuário | 6 | 2 |
| **Total** | **50** | **24** |

Chamadas ao transporte controlado do SDK Stripe: **155 → 67**, incluindo SSR e autorizações canônicas. Dashboard pode montar sem nova chamada API porque o SSR já autorizou; foco/prefetch pode mover chamadas entre etapas. Os testes negativos adicionais de XSS/arquivos/otimizador e entre abas ocorrem depois do snapshot de medição, para manter os passos comparáveis. Não representam tráfego real de produção.

| Resposta representativa, sem compressão | Antes | Depois |
| --- | ---: | ---: |
| Sessão passiva | 288 B | 78 B |
| Lista de exercícios | 545 B | 245 B |
| Lista de avaliações | 3.604 B | 770 B |
| Identidade de aluno em contexto de outro módulo | 456 B | 114 B |
| Lista de registros fotográficos | 834 B | 308 B |

A consulta oculta de comparação de avaliações (2.481 B no cenário anterior) foi eliminada enquanto o painel está recolhido. Detalhes continuam disponíveis mediante abertura e autorização.

Classificação permanente: autenticação/mutações/guards necessários e dependentes de autorização; pesquisas/listas paginadas necessárias e canceláveis; detalhes/PDF sob demanda necessários; checagens iniciais de sessão/acesso redundantes frente SSR; contagens/Portal para polling excessivas; comparação em details fechado excessiva; contexto de aluno/listas completas excessivos; configuração de disponibilidade candidata a reutilização curta, sem cache comercial; download separado da prévia deliberado para obter os mesmos bytes e reautorizar.

Inventário estático: [75 linhas de pontos de chamada/wrappers e decisões](../seguranca/requisicoes-frontend.md). O contexto pseudônimo de sessão foi acrescentado por necessidade de consistência entre abas; não contém perfil/finanças nem concede acesso. Resultados finais de tamanho refletem essa correção, não apenas a remoção original do perfil.

## 16. Controles técnicos relacionados à LGPD

[Inventário e propostas](../privacidade/inventario-e-retencao.md), [procedimentos/minutas](../privacidade/direitos-e-minutas.md), DTOs, proprietário, expiração, revogação, remoção fotográfica e logs mínimos. Suspensão não equivale a eliminação. Arquivamento não significa anonimização. PDF baixado não pode ser recolhido. Backup pode conservar cópias até ciclo aprovado; nenhuma promessa de descarte imediato.

## 17. Lacunas jurídicas e operacionais

Identificação jurídica/canal/responsáveis, papéis entre plataforma/profissional, bases do contexto de saúde/menores, retenções, operadores/transferências e minutas precisam de aprovação. Não presumir consentimento universal nem constituição jurídica. Atendimento integral de eliminação ainda bloqueia uso real. Não publicar políticas incompletas automaticamente.

## 18. Resposta a incidentes

[Checklist utilizável e fontes oficiais](../operacao/incidentes-de-seguranca.md): identificar/conter/preservar/avaliar/investigar/recuperar/registrar/comunicar/revisar. Prazo aplicável e risco devem ser avaliados com responsável competente. Documento não comprova treinamento, comunicação ou conformidade.

## 19. Pendências de produção

[Checklist detalhado](../seguranca/controles-e-operacao.md): Stripe e guardas local/test-only, R2/SMTP, HTTPS/IAM/grants, backup/restore, agendas de limpeza/reconciliação, proteção de borda, alertas/logs, retenção/eliminações e canal jurídico. Nenhum serviço externo criado. Migration 015 somente no PostgreSQL descartável; banco existente não foi alterado. Matriz [ASVS 5.0](../seguranca/matriz-asvs-5.md) mantém parciais/não implementados explícitos.

## 20. Veredito

**NO-GO para produção e para coleta de dados reais.** FF015-11 e homologações/controles essenciais ainda pendentes impedem liberação. Os 210 testes, nove regressões de navegador e ensaio do build final aprovados comprovam somente os cenários executados. Não há certificação OWASP/LGPD. Não houve deploy ou commit. A auditoria técnica local está concluída, com os achados altos remanescentes explicitamente bloqueando GO. Não se declara a plataforma pronta para produção.

## Acompanhamento posterior — Entrega016

O veredito original acima permanece **NO-GO**, com os resultados015 preservados. A [016](entrega-016.md) registrou separadamente mecanismos delimitados de eliminação por titular, ledger/replay, ensaio de backup/restore/grants e controles operacionais locais. Parte técnica do FF015-11 foi tratada, mas decisões de retenção/financeiro/contribuições, portabilidade ampla, operação e homologação externas continuam bloqueando produção. As novas evidências016 não são resultados retroativos desta auditoria.
