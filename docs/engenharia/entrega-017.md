# Entrega 017 — Cadastro inteligente de alunos, anamnese digital e construtor

**CONCLUÍDA LOCALMENTE. Produção e dados reais: NO-GO.** FormFisik é empresa independente fundada por Brandon Louis; não se presume constituição jurídica formalizada. Somente PostgreSQL descartável, dados sintéticos e provedores controlados. Sem deploy, commit, credenciais externas ou migration no banco persistente.

## 1. Status geral

Objetivo funcional implementado de ponta a ponta: profissional cria/publica modelo e gera solicitação; aluno responde no navegador sem conta; servidor cria cadastro privado seguro ou mantém pendência; profissional consulta/revisa histórico. Fluxo para aluno existente preserva o vínculo e não duplica cadastro. Resultado local não homologa Personal 1.0, serviços externos ou produção.

## 2. Funcionalidades implementadas

Cadastro manual008 preservado; convites novos/existentes; padrão Personal v1; construtor com11 tipos obrigatórios, seções, opções textuais/numéricas, condições, limites, reordenação/duplicação/prévia/rascunho/publicação/arquivo; versões estáveis; credencial individual temporária de uso único; etapas públicas, revisão e confirmação; histórico, resolução pendente e revisão profissional. Resumo no perfil com datas, última versão respondida e pendências. Listas/históricos paginados no SQL, estados vazios/loading/erro/retry.

## 3. Arquivos alterados

[Índice de arquivos e hashes](../../test-results/017/source-audit.json) compara o snapshot anterior à017, incluindo trabalho anterior não commitado; não atribui todo o diffGit à entrega. Núcleo:

- `db/migrations/017_intake_forms.sql`, grants runtime existente.
- `src/modules/intake/{schema,standard,fields,public-form,builder,area,page,student-summary}`.
- `src/server/intake/{repository,handlers}`, extração do writer em `students/repository`, extensão do expurgo em `privacy/erasure`.
- `/api/intake`, `/api/intake/public`, `/anamneses`, `/alunos/[id]/anamneses`, `/responder`; navegação/perfil de alunos e headers.
- `tests/intake.test.ts`, `intake-e2e.ts`, fixture de navegador, regressões/produção/operação e segregação de artefatos; script de teste no package.json.
- Documentação do módulo/API/privacidade/ADR, Design System, inventário/roadmap, arquitetura/segurança, README/CHANGELOG e este relatório.

Nenhuma nova dependência. SQL 001–016/lockfile e relatórios históricos preservados; fontes/artefatos preexistentes não são substituídos por reset/checkout.

## 4. Componentes e regras reutilizados

ProfessionalShell/Sidebar/Topbar, memória limitada de navegação, proteção compartilhada de alterações não salvas, tokens/tipografia/foco, controlesHTML nativos e estados de acesso. `studentFields`, `createStudentInTransaction`, sessões opacas, confirmação/suspensão, entitlement canônico, pg/transações, helpersOrigin/JSON 15 s/HMAC/rate/errors e fila/ledger016. Não há cadastro, autenticação, assinatura ou fluxo paralelo de eliminação.

[ADR-018](../arquitetura/ADR-018-anamneses-versionadas.md) registra decisões, tradeoffs e limites, incluindo interpretação de capacidade emitida anteriormente à alteração comercial, sem acesso profissional concedido pelo token.

## 5. Modelo de dados

Migration017 aditiva: `intake_forms`, `intake_versions`, `intake_requests`, `intake_submissions`, `intake_events`; chave composta adicional do vínculo existente. Definição JSON validada contém seções/perguntas/alternativas estáveis, evitando tabelas ou framework sem necessidade. Versões por modelo com número único; requests têm FK composta de proprietário/versão/vínculo; submissão única por solicitação; snapshots rejeitamUPDATE por trigger e grants. Dados de saúde separados do cadastro administrativo.

[Modelo e limites detalhados](../modulos/anamneses.md). Ensaio operacional17 migrations,77 FKs e0 constraints não validadas. Migrations repetíveis, upgrade sequencial com dados anteriores, rejeição de checksum/gaps e rollback de falha sintética. Nenhuma aplicação no banco persistente.

## 6. Endpoints e contratos

[Contrato completo](api-anamneses.md): GET/POST `/api/intake` profissional, views de listas/detalhes/versões/resumo e comandos estritos; POST `/api/intake/public` mínimo paraopen/submit. Todos os privados exigem sessão/perfil/confirmado/assinatura/propriedade no servidor; mutações exigem Origin. Público exige capacidade, validade, estado e limites. Respostas privadas/noStore/noReferrer; público tambémnoIndex. Não háGET consumindo link, endpoint de editar resposta, recuperar token puro ou criar conta de aluno.

## 7. Fluxos de cadastro

Manual mantém schema/normalização/idempotência/lock/eventos008. Novo convite sem coincidência na própria carteira utiliza exatamente o mesmo writer dentro da transação de submissão. Coincidência em nome/contato fica pendente; confirmação pública é igual, sem enumeração de contas. Profissional pode resolver somente após conferência independente explícita, escolhendo vínculo próprio ou cadastro separado; nenhum dado cadastral existente é sobrescrito. O sistema registra atestado e evento, sem afirmar que comprovou identidade civil ou execução do procedimento externo.

Existente fixa vínculo previamente; não aceita identificação no POST e não exibe contatos/nascimento ao portador. Não consulta/une identidade global por e-mail. Nenhuma conta/sessão/assinatura é criada para o aluno.

## 8. Fluxos de questionários

Criar/duplicar → configurar seção/pergunta/opção/condição → salvar revisão otimista → publicar snapshot → escolher versão → gerar solicitação. Alteração posterior de rascunho não muda convite/resposta. Arquivo impede novos convites daquele modelo e preserva solicitações anteriores. Limite de 100 versões explícito, sem truncar novas publicações.

Público: apresentação/finalidade/profissional/privacidade e cadastro quando novo → uma seção por etapa → revisão → ciência → envio → confirmação. Anterior preserva memória; condição usa somente escolha anterior, reavaliada no servidor. Não hádiagnóstico, pontuação de aptidão, tratamento ou prescrição médica.

## 9. Fluxos de compartilhamento

Token de 256 bits aleatório, base64url, digest SHA-256 no SQL,7 dias, uso único/revogação. Link `/responder#TOKEN`, fragmento removido antes dePOST; sem dados pessoais em parâmetro. Cópia explícita e WhatsApp manual, sem integração/envio automático. Link deve ser entregue ao destinatário certo; posse não comprova identidade. Token não é recuperável depois da criação; perder exige nova solicitação e eventual revogação anterior. Troca de convite na mesma aba respeita descarte confirmado das respostas não enviadas.

## 10. Segurança

Schemasstrict,SQL parametrizado/FKs compostas, proprietário da sessão,11 tipos de perguntas sem expressão dinâmica, limites de corpo de 128 KiB/15s e de estrutura. Privado120/min/profissional; público60/15 min/IP e30/15 min/capacidade, chavesHMAC. Sem ingress confiável, IP compartilhado conservador; proteção distribuída continua pendente.

Lock da solicitação e consumo condicionado a `clock_timestamp()` após espera impedem replay/expiração concorrente; transação inclui cadastro, respostas, token e evento. Erro de persistência não cria sucesso parcial. Conta suspensa/vínculo arquivado negam capacidade; token não lê histórico nem conta. Origem inválida e enumeração/IDOR são rejeitados. CSP/nonces e proibição de terceiros de coleta preservadas. Testes no build efetivo verificam bundles/HTML/respostas/cookies/console/WebStorage/canários.

## 11. Privacidade e retenção

[Inventário específico](../privacidade/anamneses.md): finalidade, categorias, acesso, minimização, risco e descarte. Rascunho só em memória, aviso antes da coleta e proteção de saída. Não hálocalStorage/sessionStorage, analytics ou envio de saúde aStripe/SMTP. Ciência não define base legal universal. Textos públicos identificam pendências jurídicas e ambiente sintético; nenhuma política final é publicada por esta entrega.

Expurgo016 de vínculo remove requests/submissões/eventos correspondentes; versões profissionais ficam para interpretar outros registros. Submissões sensíveis pendentes sem vínculo bloqueiam expurgo da conta profissional, preservando outro titular até triagem/resolução cabível. Sem DELETE paralelo, anonimização fictícia ou prazo legal inventado. Restore com ledger reaplica a mesma eliminação antes da reabertura; backups/ledger reais e portabilidade ampla continuam pendentes.

## 12. Testes automatizados

**241/241 aprovados**,0 falhas/ignorados/cancelados, 250.530 ms, [suíte final](../../test-results/017/suite-final.log).225 regressões anteriores e 16 grupos da 017: tipos/limites/schemas/condições, snapshots/publicação/arquivo, convites/consumo concorrente, novo/existente/pendência/resolução separada, expiração/revogação/suspensão, autenticação/entitlement/Origin/IDOR, respostas manipuladas, rollback, rate limiting/digest/DTO/cache, paginação e eliminação por vínculo, retenção de titular sem vínculo, espera de lock e histórico/resumo/versionamento isolado.

[Prova operacional](../../test-results/017/operations/operations-proof.json): PostgreSQL real descartável, `pg_dump -Fc`/`pg_restore`, anamnese restaurada e novamente eliminada por replay, outra carteira preservada, CLI/leases/quiescência e smoke do módulo sob papel runtime restrito. UPDATE/DELETE de snapshots e acesso aledger/DDL negados. Storage externo é controlado, não R2 homologado.

Os 16 grupos específicos foram repetidos após os últimos ajustes, todos aprovados; o teste de inteiros seguros integra essa repetição. ESLint, TypeScript, build de produção e verificações finais estão no [manifesto](../../test-results/017/verification-summary.json). Não confundir resultado de harness/fixture com integração externa homologada.

## 13. Evidências Chrome

[Fluxo017](../../test-results/017/browser-proof.json) e [medições deAPI](../../test-results/017/api-measurements.json): modelo personalizado publicado, aluno novo sem conta, carteira criada, revisão, solicitação para existente sem duplicação, rede falha/retry, links inválidos/usados/expirados/revogados, WebStorage vazio, foco/teclado/texto200%/altura reduzida e Axe em 320/375/768/1440. Todos os 11 controles e condições também exercitados no navegador em fixture de renderização explicitamente test-only.

[Produção real local](../../test-results/017/production/after-production.json): HTTPS local, árvore realNext, SDKStripe oficial com transporte loopback de teste, sessãoSecure/HttpOnly/SameSite, fluxo público em contexto sem cookies, envio e revisão, replay negado, CSP e canários. `intakeVerified:true`, `crossTabVerified:true`,0 vazamentos/violaçõesCSP/erros de console nos cenários positivos. Certificado local aceito somente no contexto de teste; nenhumTLS de produção foi desativado.

[Regressões](../../test-results/017/regressions.json): cadastro manual/perfil/PDF/arquivo/reativação/IDOR, dashboard/shell e autenticação/cadastroSMTP/recuperação/sessões. Resultados e tentativas preservados; somente o manifesto final confirma aprovação. Capturas sintéticas em `test-results/017/browser` e`regressions`, sem atribuir homologação externa.

O ensaio do fluxo017 registrou 35 requisições de API concluídas, incluindo cenários negativos, recargas explícitas e os dois destinatários; a falha de rede abortada não entra nessa contagem. Aberturas válidas retornaram somente quatro campos, cerca de 4,1 KiB de definição; confirmações têm 17 bytes e apenas `received`. Avançar/voltar seções não consulta o servidor. São medidas do harness controlado, sem comparação artificial com módulo antes inexistente nem equivalência a benchmark/consultas SSR e de provedor.

## 14. Limitações conhecidas

Sem retomada de rascunho após fechar/recarregar; sem notificação push/email de resposta, exportaçãoPDF de anamnese, comparação automática, upload clínico, prova automatizada de identidade ou login do aluno. Respostas originais não são editáveis; correções exigem novo preenchimento. Perda da resposta HTTP após COMMIT pode retornar 410 ao repetir: conferir recebimento com profissional, sem recuperar saúde anonimamente. Corpo de 128 KiB e limites de estrutura exigem questionários proporcionais.

Chrome/Axe/teclado não equivalem a certificaçãoWCAG nem teste humano com leitor de tela, teclado virtual físico ou outros navegadores. Limites e ensaios locais não são SLA ou teste de carga representativo. Nome do profissional é deliberadamente mostrado ao destinatário do convite.

## 15. Ocorrências e correções da validação

O primeiro Axe detectou título ausente no harness; corrigido no ambiente de teste, mantendo assert. Chrome revelou troca de convite na mesma aba mantendo confirmação anterior; corrigido no produto, com reabertura segura e proteção de descarte. A primeira suíte de 237 testes teve 236 aprovados e uma falha por menu esperado ainda semAnamneses; atualizada expectativa explícita para a rota implementada e a suíte posterior de 241 testes passou, sem remover verificação.

Regressão visual do dashboard inicialmente buscava fixture em caminho novo sem que o gerador tivesse sido segregado; gerador alinhado e repetição registrada. Fixtures de teste anteriores de dashboard/PDF podem ter sido regeneradas pelos runners legados antes da segregação; relatórios/manifests históricos não foram reclassificados como evidência nova. Novas execuções relevantes usam raiz017; arquivos de produto preexistentes não foram descartados.

## 16. Pendências

Homologação jurídica de finalidade/base de saúde/menores/canal/retentiva e procedimento independente de identidade, homologação externaStripe/R2/SMTP, TLS/ingress/IAM/grants reais, schedulers/alertas/backups/restore representativos, definição de responsáveis e metas/piloto. A017 não elimina FF015-11 nem tornaPersonal 1.0 homologada. Migration017 permanece somente no banco descartável; rollout real requer autorização própria e runbook 016.

## 17. Riscos residuais e decisões futuras

Link repassado indevidamente pode ser preenchido por terceiro; compartilhe individualmente e revogue quando necessário. Perguntas livres podem coletar além da finalidade; revisão profissional/jurídica é indispensável. Atestado profissional não é prova externa, pendência não pode ser resolvida por conveniência. Conservar casos sem vínculo até triagem pode bloquear pedido de conta; não apagar dados de outro titular silenciosamente. Rotação/perda/atualidade do ledger e descarte de backups continuam riscos016.

Reutilização futura: eventos mínimos paraCRM 018 e contratos paraConnect 029, condicionados à autorização e ativação legítima. Não implementados Kanban, mobile, Connect financeiro, outra modalidade, telemedicina ou automaçãoWhatsApp. Evoluir comparações/rascunhos persistentes somente com necessidade comprovada e proteção própria.

## 18. GO/NO-GO local

**GO técnico local**, com manifesto final aprovado para dados sintéticos/banco descartável e escopo desta entrega. Cadastro manual e convites/anamneses integram o mesmo cadastro privado; conclusão não autoriza migrations no banco persistente, operação externa ou coleta real. Serviços de teste encerrados e PostgreSQL descartável removido; evidência de limpeza no manifesto.

## 19. GO/NO-GO para produção

**NO-GO para produção e dados reais**, preservando015/016. Não houve deploy/commit/provisionamento de serviços, configuração de credenciais ou cobrança real. Código/testes/documentação locais não substituem validação jurídica, operacional e de ambiente; nenhum marco futuro ou Personal 1.0 completa é declarado concluído.
