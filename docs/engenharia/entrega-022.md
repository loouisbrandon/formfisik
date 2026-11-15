# Marco022 — Check-ins, feedbacks e acompanhamento do aluno

FormFisik independente fundada por Brandon Louis; não se presume constituição jurídica formalizada. Implementação local com dados sintéticos, sem deploy/commit/credenciais reais/serviço externo/banco persistente. Fases022-A/B/C internas de uma entrega. Estado: **IMPLEMENTADO — GO LOCAL CONTROLADO**, validado em02/11/2026. Produção: NO-GO anterior preservado.

## 1. Funcionalidade

Modelos rápido/completo/personalizado com o mesmo motor017; periodicidade semanal/quinzenal/mensal civil; prévia e atribuição atômica; convites individuais seguros; resposta por navegador sem conta/aplicativo; feedback declarado ligado à revisão da prescrição; respostas imutáveis/correções versionadas; revisão/devolutiva profissional; histórico, resumo do aluno, CRM mínimo e indicadores. [Manual](../modulos/checkins.md).

## 2. Auditoria, concorrência e preservação

Autorização expressa do fundador e fechamento023 confirmados antes da escrita. `test-results/023/verification-summary.json` registra GO local/378 testes históricos, não revalidados automaticamente nesta auditoria. Consulta somente leitura mostrou FORMFISIK CHAT2 ocioso; observação de561 arquivos sem mudanças concorrentes. AGENTS, estado Git e documentos/código existentes revisados. Baseline-source/status capturados antes de editar. Não criar branch/worktree/reset/commit nem atribuir o worktree001–023 inteiro à022. Manifesto compara hashes anteriores/finais. Qualquer conflito externo exige interromper.

Pesquisa/arquitetura anteriores no mesmo chat são a referência autorizada. Nenhuma biblioteca ou pacote novo. Sequência SQL real:023_student_checkins.sql após022_exercise_media.sql do Marco023; ADR024 apósADR023. Número do marco não determina número da migration.

## 3. Reutilização e justificativas

FormBuilder, formSchema, validateAnswers/visible/applicableAnswers, QuestionField, AnswerReview e PublicIntake017 parametrizado; catálogo intake_forms/versions com usage imutável. Helpers de capacidade extraídos e usados por017/022. Mesmos mecanismos de sessão/entitlement/Origin/HMAC/body/headers/SQL/transação, shell/memória/aviso de alterações, StudentsPicker e Feedback/Pagination. Geometria de gráficos012 ganha opção explícita para negativos, default anterior preservado.

Novos ciclos/ocorrências/convites/submissões/devolutivas/eventos/idempotência são necessários para repetir períodos, reemitir links e corrigir sem alterar onboarding017. Persistir check-in em intake_requests/submissions contaminaria fatosCRM e evidência019. [ADR024](../arquitetura/ADR-024-checkins-e-finalidades.md) registra a exceção e a ausência de segundo motor.

## 4. Arquivos e módulos

Novos: src/modules/checkins (schema/standard/schedule/api/assignment/area/detail/feedback/public-form/page/student-summary); src/server/checkins (repository/queries/handlers); src/server/forms/capability; páginas /checkins, /alunos/[id]/checkins e /responder/check-in; GET/POST /api/checkins e POST público; migration023; testescheckins. Integrações limitadas: catálogo/página/builder017, perfil008, fatos/cardCRM, navegação/shell, geometria012, erasure016/runtimegrants, runners de produção/operação e fixture sintética. Documentação: módulo/API/ADR/privacidade/DS/índice/inventário/roadmap/referências afetadas/README/CHANGELOG. [Manifesto de arquivos](manifesto-022.md) e hashes exatos em test-results/022/source-audit.json; relatórios anteriores não são reescritos.

## 5. Banco e contratos

Sete tabelas checkin_assignments, checkin_occurrences, checkin_invitations, checkin_submissions, checkin_reviews, checkin_events e checkin_operations. FKs compostas de profissional/aluno/versão; chaves únicas de posição/revisão/convite/digest; triggers append-only para submissões/devolutivas. Catálogo017 recebe usage default intake, sem converter registros anteriores. Runtime não apaga históricos nem altera respostas/devolutivas. [API/modelo](api-checkins.md).

## 6. Convites, identidade e finalidade

Token256bits/SHA256, até7dias, fragmento removido ePOST, uso único/revogação/locks/relógioSQL. Link inicial limitado pela janela; reemissão revoga o anterior. Token só uma vez, não persistido em resultado de operação; falha de criação exige nova emissão explícita. Retry de submissão exata confirma apenas recebimento, sem abrir conteúdo. Sem JWT, cookie paralelo, associação por e-mail ou cadastro do aluno. Público nunca recebe histórico, contatos ou prescrição completa. Ciência não resolve base legal. Convites/check-ins não são anamnese017.

## 7. Ciclos, fusos e concorrência

Semana7dias, quinzena14dias, mês civil começando dia1; avulso7dias. Até24 ciclos em12meses, término explícito e prévia paginada20. Abertura após período, prazo1–14dias e tolerância0–14. Fuso IANA, datas civis e instantes via primitivas021; disponibilidade da agenda não é ocupada por check-in. Pausa cancela só futuros não abertos; reatribuição explícita, sem retomada silenciosa. Lock18018, versões e digest da prévia; auditoria/idempotência na transação. Respostas/cancelamento/revogação e correção concorrentes não sobrescrevem silenciosamente.

## 8. Prescrição, realização e revisões

Referência canônica à ficha individual/aluno/versão ativa histórica e divisão daquela revisão. Alterar ficha não muda relato. Esforço/dificuldade/desconforto/observações/pedido de conversa são declarações, não comprovação. Nenhuma alteração de treino, presença021, execução019 ou pagamento020. Meta explícita opcional, sem derivar sessões/créditos/divisões.

Submissões imutáveis; correção exige motivo e novo link, base_revision e novo envio sem revelar original ao portador. Original preservado e nova revisão volta a recebido. Devolutivas append-only vinculadas à submissão exata; compartilhamento manual declarado não é entrega/leitura comprovada. Sem chat ou notificações.

## 9. Perfil, CRM e indicadores

Perfil: total/atrasados/revisão pendente/últimas datas e acesso contextual a histórico/devolutivas/indicadores. CRM recebe checkin_overdue/checkin_review e link, sem respostas/escalas/notas ou alteração automática de etapa. Condições/evidências de anamnese preservadas.

Taxas usam ocorrências não canceladas com prazo encerrado; renovação de link/correção não cria denominador. Pontualidade considera primeira submissão, última revisão determina conteúdo atual. Cancelamentos separados, desconhecido não vira zero. Adesão somente declarada com meta/quantidade, pode exceder100% sem clipping. Evolução por pergunta e mesma versão publicada, período máximo367datas, páginas100 e tabela/pontos acessíveis; não mistura significados/escala ou interpola ausências. Sem índice clínico/receita inferida.

## 10. Interface e Design System

Shell integral/#app-content sem overflowglobal, navegação progressiva/seletor mobile, formulários com rótulos e confirmações, detalhe sob demanda, listas20, feedback focável/status/alert e proteção de alterações. Paleta/tipografia/componentes existentes, nenhum novo framework visual. Mesma página pública017 adaptada à finalidade, preenchimento mobile-first, dados só em memória, aviso de perda/rede. Estados sem sucesso simulado. Ver [DS](../design/DESIGN_SYSTEM.md) e41 evidências Chrome finais; testes automatizados não equivalem a certificação ou leitor de tela humano.

## 11. Segurança, privacidade e recuperação

Autorização/SaaS/propriedade no servidor; Origin/JSON128KiB/15s; limitesGET120/POST40 por minuto e público60/IP/30capacidade em15min. ContadoresHMAC; sem token/credenciais/relatos em logs. DTO mínimo, sem cadastro/histórico público; eventos não copiam respostas. Motivos operacionais minimizados. Conta suspensa/vínculo arquivado/cancelamento/revogação/expiração bloqueiam capacidade.

[Privacidade](../privacidade/checkins.md): finalidade, sensibilidade, opcionalidade, ciência/base, canal e menores sujeitos a governança. Sem prazo jurídico novo. Worker016 elimina022 antes de prescrição/formulários/aluno e invalida retries; mantém preflightfinanceiro020 e outros sujeitos. Restore reaplica ledger assinado antes de tráfego. Sem política LGPD genérica declarada homologada.

## 12. Testes e resultados

26 testes específicos passaram na regressão integral: motor/padrões, períodos, segregação017/019, vínculo de prescrição histórica, correção/revisão imutável, idempotência, consumo concorrente, expiração após espera de lock, revogação/suspensão, rollback de auditoria, cancelamento concorrente, rate/Origin/schema/IDOR, CRM mínimo e eliminação. Regressão integral sequencial:404/404, zero falhas, cancelamentos ou testes ignorados,24 arquivos (402,6s neste ensaio). Inclui isolamento entre finalidades mesmo com definição idêntica, criação/publicação sem duplicação após retry, pontualidade após correção e paginação SQL com2501 ocorrências. Repetição dirigida017/022:42/42 (26 específicos +16 do motor de anamnese), incluindo DTO explícito sem professional_id/token_digest, rejeição de revisão sobre resposta superada e vencedor concorrente independente da ordem. ESLint/TypeScript aprovados (exit0). Build real Next16.4.3/webpack aprovado e executado no Google Chrome156.0.8078.47, PostgreSQL18.6, Node24.22.0. Chrome validou a jornada022 e regressões integradas017–021/023, inclusive resposta anônima sem cookies/storage, uso único, prescrição versionada, revisão e correção, série/indicadores/histórico. Axe WCAG2A/AA/2.1AA/2.2AA em10 estados ×4 larguras (1440/768/375/320),41 capturas com texto200%/altura reduzida. Envio final por teclado e navegação/Escape verificados. Zero violações Axe/CSP, erros de console ou vazamentos detectados pelos canários sintéticos. Isso não substitui auditoria humana de tecnologias assistivas.

Percurso022 medido:25 requisições privadas ao domínio checkins e1 verificação de sessão; maior payload privado2488bytes, metadados em production/checkin-api-measurements.json. Não representa benchmark de carga ou SLA. O público foi validado em contexto anônimo separado. Snapshot dos arquivos de runtime e hash do runner conferidos após o build, sem divergências. SQL023 está no trace de empacotamento do health, junto às23migrations.

Operacional passou:23migrations,180FKs, zero constraints não validadas; atualização013→atual, rollback/checksum/retry; pg_dump564ms/pg_restore2690ms neste ensaio, não SLA. Submissão022 restaurada e removida por replay, outros titulares e revogação023 preservados. Runtime executa fluxo022 e nega UPDATE dos históricos/DELETE da auditoria. Evidência operations/operations-proof.json.

Falhas intermediárias corrigidas: execução auxiliar dos arquivos017/022 em paralelo interferiu nas fixtures destrutivas; resultado rejeitado e regressão integral refeita com --test-concurrency=1. aspas na consulta de data civil; uso de Node.remove no código de teste; reset síncrono em effect apontado pelo lint; nomes acessíveis explícitos dos selects; confirmação antecipada da devolutiva antes do refresh (corrida corrigida aguardando a leitura atualizada). Fixture de produção ampliada para prescrição ativa real quando TEST_CHECKIN_FLOW=1. O ensaio de texto200% inicialmente tentou injetar CSS sem nonce e foi bloqueado corretamente pela CSP; o runner foi corrigido para usar o nonce da página, sem relaxar a política. Não ocultar falhas ou declarar aprovação do teste em andamento.

## 13. Evidências e reprodução

Diretório test-results/022: baseline-source/baseline-git-status, source-audit, integration/regressionlogs, lint/typecheck, production/after-build/after-production e capturas, operações/ledger/replay, medidas de payload quando fluxo concluído, cleanup e verification-summary finais. [Verificação consolidada](../../test-results/022/verification-summary.json), [manifesto/hashes](../../test-results/022/source-audit.json), [Chrome](../../test-results/022/production/checkin-proof.json), [backup/restore](../../test-results/022/operations/operations-proof.json). PostgreSQL18 descartável loopback5552, bancos `_test` exclusivos, sem banco persistente. Executar node --conditions=react-server --import tsx --test --test-concurrency=1 nos arquivos do manifesto; `npm run test:security:e2e -- --build` com TEST_CHECKIN_FLOW=1 e demais flags017–023, SECURITY_EVIDENCE_DIR e TEST_DATABASE_URL explícitos. Operacional usa TEST_POSTGRES_CONTAINER=formfisik-022-test/OPERATIONS_EVIDENCE_DIR e cria bancos efêmeros próprios. Não usar ambiente real.

## 14. Limitações conhecidas

Sem aplicativo/login do aluno, envio automático, push/WhatsApp/e-mail, wearable, upload, execução série a série, diagnóstico ou algoritmo de ajuste. Resposta pelo link não comprova identidade civil/execução. Nova janela de correção não revela original. Periodicidade usa materialização limitada; nova série exige atribuição explícita, sem recorrência infinita. Comparação entre versões diferentes não é automática. Evidência local não é teste de carga/SLA, homologação externa, dispositivos físicos ou tecnologias assistivas humanas.

## 15. Preparação e pendências futuras

Connect029 deverá reutilizar serviços com identidade legítima; não transformar capacidade em conta. Canais024 precisam preferências/finalidade/deduplicação/evidência de entrega; eventos mínimos não são notificação ativa. Wearables exigem origem/unidade/autorização e comparabilidade próprias. Outras modalidades somente depois da homologação Personal1.0 ou exceção estratégica. Permanecem gates015–023: governança/jurídico/infraestrutura/Stripe/R2/SMTP/Stream/YouTube externos, operação e piloto autorizado. Sem ativação Connect financeiro ou serviços externos por esta entrega.

## 16. Veredito

**GO LOCAL CONTROLADO** para o escopo022-A/B/C: implementado, integrado, testado e documentado. **NO-GO produção/dados reais**, preservando bloqueios anteriores015–023 e a homologação Personal1.0 pendente. Container descartável parado/removido; portas3443/3112/5552/15260/3130/3131 fechadas.35 arquivos anteriores alterados de forma delimitada,28 novos, zero excluídos; AGENTS, dependências, migrations e relatórios anteriores preservados por hash. Sem serviços temporários em execução. Nenhuma autorização de deploy/commit ou banco persistente implícita.
