# Entrega018 — CRM profissional, Kanban e ciclo de atendimento

## 1. Status geral

Implementação local, PostgreSQL descartável e dados exclusivamente sintéticos. Não representa homologação da Personal1.0 ou produção. FormFisik é empresa independente fundada por Brandon Louis; sem presumir formalização jurídica.

## 2. Resumo executivo

CRM integrado à carteira canônica com seis etapas iniciais editáveis, condições configuráveis, movimentação confirmada, tarefas, histórico e indicadores reais. Nenhum segundo cadastro ou estado clínico foi criado. Prioridade web; sem serviços externos novos.

## 3. Funcionalidades implementadas

Kanban paginado por coluna, lista alternativa, filtros combinados, etapas iniciais/configuração/ordem/inativação/arquivo, quatro efeitos de condição, todas/qualquer, arraste e menu equivalentes, consulta pelo perfil, tarefas manuais/configuradas, auditoria e indicadores. [Documentação funcional](../modulos/crm.md).

## 4. Arquivos alterados

Novos: `db/migrations/018_professional_crm.sql`, `src/server/crm/{core,facts,stages,tasks,handlers}.ts`, `src/modules/crm/{schema,api,card,move-dialog,settings,tasks,area,page}.tsx/ts`, rotas `/crm`, `/alunos/[id]/crm` e `/api/crm`; `tests/crm.test.ts`, `tests/crm-e2e.ts`, `tests/helpers/crm-browser-server.ts`; módulo/API/ADR e este relatório.

Integrações: writer de alunos, worker de eliminação, grants runtime, navegação/shell e link no perfil; testes de navegação, produção e operação; script E2E no package.json. Documentação: índice, README, CHANGELOG, inventário, roadmap, arquitetura, privacidade, controles, operação e Design System. Manifesto completo e comparação com snapshot anterior à018: `test-results/018/source-audit.json`. Nenhuma comparação presume checkout limpo ou descarta trabalho anterior.

## 5. Componentes reutilizados

ProfessionalShell, memória de navegação/filtros, proteção de alterações não salvas, StudentsPicker paginado, estilos de formulários, sessão opaca, entitlement, Origin, rate/HMAC, JSON limitado, migrador e transação pg. Não há dependência adicionada ou upgrade.

## 6. Modelo de dados

Configuração por profissional; etapas com regras JSON validadas; associação por vínculo; tarefas operacionais; eventos mínimos; operações idempotentes. FKs compostas de propriedade e índices de etapa/prazo/histórico. Estados de anamnese, treino e avaliação são consultados canonicamente. [Modelo e retenção](../modulos/crm.md).

## 7. Migrations

018 aditiva. Migrations anteriores preservadas. Execução somente em bancos `_test` dentro de `formfisik-018-test` PostgreSQL18 descartável, loopback5549. Ensaio de aplicação vazia/repetida, atualização desde013, rollback de falha, checksums e constraints: `test-results/018/operations/operations-proof.json`. Nenhuma aplicação persistente.

## 8. Endpoints e contratos

GET/POST `/api/crm`, views/actions strict, paginação, DTO explícito, erros estáticos e versões. Detalhes em [api-crm](api-crm.md). GET120/min, POST60/min, synchronize adicional10/min. SemJWT, token público ou bypass comercial na aplicação. Gateway controlado existe exclusivamente nos testes. Não expõe chaves, JWT ou credenciais no web storage.

## 9. Fluxos de interface

Atendimentos/Tarefas/Etapas e regras/Histórico; filtros e indicadores progressivos. Card→menu ou arraste→prévia→confirmação→persistência. Perfil apresenta atendimento atual mesmo no celular; não restringe indevidamente à etapa inicial. Carregamento, erro de rede, retry, vazio, impedimento e sucesso são explícitos. Editor local preserva alterações entre atualizações; conflito exige revisão, sem sobrescrever outra aba.

## 10. Regras de movimentação

Conta profissional habilitada, confirmada, entitlement canônico e propriedade; aluno ativo, destino ativo não arquivado e diferente; versão de configuração/posição atuais; condições reavaliadas no servidor. Alteração, auditoria e chave idempotente na mesma transação. Preview obsoleto, disputa ou falha não deixam alteração parcial. Arquivo ocupado requer destino/digest e confirmação de lotes100, incluindo vínculos arquivados; fonte só arquiva vazia.

## 11. Condições

Informativa não bloqueia; recomendada pendente exige ciência; entrada/saída obrigatórias bloqueiam. Todas/qualquer em grupos separados.12 chaves canônicas, sem execução arbitrária. Padrão informativo não impede uso sem configuração. Recência configurável30dias inicialmente; período civil em São Paulo. Resultado é do instante observado, não garantia de estado futuro. Cancelar obrigatória não satisfaz conclusão. [Semântica integral](../modulos/crm.md).

## 12. Gestão de tarefas

Criação/edição, aluno/responsável proprietário, prioridade/prazo/obrigatoriedade, andamento/conclusão/cancelamento/reabertura/arquivo e histórico. Texto operacional no detalhe, excluído do resumo. Geração opcional por regras desativada inicialmente e executada explicitamente100alunos/lote com cursor e origem única. Não há scheduler, conclusão silenciosa ou duplicação em repetição.

## 13. Integrações com módulos anteriores

008 fornece vínculo e criação atômica;017 convite usa mesmo writer e estados reais da última solicitação;010 fornece rascunho/ativo/histórico prescrito;012 última avaliação ativa/recência. Links para páginas canônicas.016 elimina registros CRM e reaplica exclusão após restore. Credenciais/autenticação/billing/regras clínicas não foram duplicadas.

## 14. Indicadores

Carteira ativa e novos do mês globais; demais respeitam filtros: alunos, respostas/revisão pendentes, sem treino ativo, tarefas abertas/vencidas, contagem e tempo médio atual por etapa. Nenhuma receita/conversão/conclusão clínica fictícia. Permanência atual não é duração histórica de ciclo.

## 15. Segurança

Autorização e isolamento no servidor, entradas parametrizadas/strict, DTO mínimo, rate, Origin, lock+versão e idempotência transacional. Sem credenciais no cliente/logs. Runtime sem DDL, DELETE de CRM ou alteração de eventos. Build real HTTPS+CSP, canários sintéticos, regressões de sessão/abas e IDOR: `test-results/018/production/after-production.json`. Canaryscan cobre bytes efetivos de resposta, console, static/public e log, não apenas busca no código.

## 16. Privacidade

Finalidade operacional, minimização e texto livre sob orientação; datas/status não são anônimos. Sem respostas, medidas/fotos, contatos ou descrição de tarefas nos cards. Worker aprovado remove vínculo/tarefas/eventos e invalida operações relacionadas; profissional elegível remove CRM restante, preservando bloqueios anteriores. Restore seguido de ledger replay testado. Prazos jurídicos/retentiva/monitoramento de crescimento ainda exigem aprovação; não se declara conformidade LGPD por teste.

## 17. Testes automatizados

Logs verificáveis em `test-results/018/`: `full-tests.log`, `lint.log`, `typecheck.log`, `browser.log`, `production.log`, `operations.log`. Suíte completa inclui regressões001–017 e21 casos CRM: schema; matrícula inicial/manual/convite; etapas; condições; concorrência/idempotência; preview obsoleto; transferência; tarefas; geração; estados017; fatos010/012; filtros/contagens; auth/IDOR/DTO; suspensão/arquivo; rollback; eliminação;2500alunos; rate/cache; lotes100; cursor; treino ativo e limiar temporal. Suíte completa:262 aprovados,0 falhas,0 ignorados.21 são casos CRM. ESLint e TypeScript aprovados; testes Chrome, produção e operação com evidências próprias. Regressão adicional de dashboard/shell: `dashboard-browser.log` aprovada em quatro larguras, teclado/foco, Axe, zoom, retry e logout. Resultados finais consolidados em `verification-summary.json`.

## 18. Evidências Chrome

`test-results/018/browser-proof.json` e `browser/`: Kanban, configuração, editor/tarefas, bloqueio, lista/histórico,320/375/768/1440px, Axe WCAG2A/AA/2.1/2.2, teclado, arraste, altura500, texto200%, foco do menu e ausência de scroll global. Verificação visual das capturas efetuada. Harness renderiza os componentes reais com PostgreSQL e sessão reais, Stripe controlada no processo de teste. Além dele, `production/` testa rotas finais reais do build em HTTPS, sessão SecureHttpOnly/CSP e fluxo017. Testes controlados não comprovam Stripe/R2/SMTP externos ou aparelhos físicos.

## 19. Desempenho e consultas

`large-portfolio.json`:2501 alunos sintéticos, primeira coluna10cards, lista20 e plano EXPLAIN ANALYZE BUFFERS. SQL filtra/ordena/pagina e agrega fatos, sem fetch por card no cliente. Kanban10por coluna, teto400cards/40não arquivadas incluindo inativas (até16ativas para entrada); lista não busca Kanban oculto; tarefas/histórico20; transferência/reconciliação100. Board usa duas consultas de configuração e uma de fatos em snapshot consistente, além dos guards existentes. Há lookup indexado da última anamnese por vínculo no SQL; ausência de N+1 HTTP não significa custo constante do banco. `api-measurements.json` registra volume/status/chaves por operação: maior resposta GET no fluxo23leituras foi11439bytes. Esses números são do cenário testado, não limite universal do payload. Tempos locais não são SLA; maior escala precisa de benchmark representativo.

## 20. Limitações

Geração de tarefas é explícita, não serviço agendado. Nenhum movimento automático. Sem busca transliterada por acentos. Drag nativo validado em Chrome; alternativa por menu é obrigatória e funcional. Sem homologação manual com leitor de tela, aparelhos físicos ou outros browsers. Não há gestão de equipe/responsável terceiro, agenda, financeiro profissional ou contratos. O build padrãoTurbopack encontrou bloqueio de criação de processo/porta neste ambiente (EPERM), inclusive na execução autorizada; `npm run build -- --webpack` e o build efetivo de produção usam Webpack suportado, sem alterar a configuração do projeto. Log da limitação preservado em `turbopack-environment-limitation.log`. Histórico usa nome atual da etapa na apresentação, IDs preservados e resultado das condições do instante do evento.

## 21. Pendências

Produção depende das pendências015–017: infraestrutura externa/domínioHTTPS, Stripe/R2/SMTP, grants/migrador/worker separados, rotinas/backup/replay/monitoramento, política de retenção e direitos/responsáveis. Nenhum segredo foi solicitado ou provisionado. Aplicação de018 no ambiente alvo exige autorização futura; este trabalho não a concede.

## 22. Riscos residuais

Texto livre pode receber PII indevida; UI orienta, mas não faz classificação semântica. Eventos/operações crescem sem política de expurgo aprovada. Fatos canônicos podem mudar após validação de uma etapa. Sem observabilidade externa/homologação não há garantia operacional produtiva. Evidência sintética local não substitui avaliação jurídica/profissional.

## 23. Recomendações para019

Definir serviços/consultorias/vínculos e contratos comerciais com finalidade e modelo próprios. Reutilizar identidade/carteira/entitlement sem confundir assinatura SaaS com cobrança de aluno. Eventos CRM podem orientar navegação futura, não justificam implementação antecipada ou financeiro020. Connect continua condicionado à validação no Brasil e autorização estratégica.

## 24. Veredito local

**GO local** para o escopo018 com dados sintéticos, após checks aprovados; resultados e manifesto em `test-results/018/verification-summary.json`. Sem partes simuladas na aplicação; fornecedor controlado/armazenamento privado são exclusivamente ambientes de teste explicitamente identificados. Não houve commit, deploy, dados reais ou banco persistente alterado.

## 25. Veredito produção

**NO-GO para produção e dados reais**, preservando015–017. Código local/testes não são homologação externa, liberação jurídica ou aprovação operacional. Encerramento dos serviços/container e portas de teste em `runtime-cleanup.json`.
