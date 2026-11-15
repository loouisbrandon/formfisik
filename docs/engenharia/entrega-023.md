# Marco 023 — Biblioteca de vídeos e demonstrações

FormFisik é empresa independente fundada por Brandon Louis. Não se presume constituição jurídica formalizada. Implementação exclusivamente local com dados sintéticos e provedor controlado; sem deploy, commit, contratação ou operação financeira.

## 1. Estado e escopo

023-A/B/C executados como etapas internas do mesmo marco. Funcionalidade: biblioteca oficial/privada, YouTube por URL, upload Stream, múltiplos vídeos, principal/ordenação, preferências privadas sobre exercício oficial, revisão independente e vínculos históricos em prescrições. Resultados finais constam do resumo verificável em `test-results/023/verification-summary.json`; não interpretar existência deste documento como homologação externa.

**Stream real não homologado.** Adaptador REST implementado e exercitado com transporte controlado; nenhuma conta, chave real ou serviço pago ativado. Reprodução real de vídeos YouTube não foi homologada: o embed oficial/API foram exercitados com transporte interceptado nos testes. Não há conteúdo de concorrentes copiado nem acervo oficial fictício no produto. Acervo oficial depende de conteúdo próprio/licenciado e revisão humana.

## 2. Checkpoint e preservação

Antes da primeira escrita, AGENTS.md e estado Git lidos; Chat 1 confirmado ocioso e turno 021 concluído por consulta somente leitura do aplicativo, com GO local controlado e NO-GO produtivo. Auditadas entregas 019, 020 e 021, estrutura existente e guias locais Next 16.4.3. `baseline-source.json` e `baseline-git-status.txt` capturaram 555 arquivos rastreados/não rastreados antes das mudanças. Base já continha trabalho 001–021 não commitado; não se atribui todo git diff a 023.

Reutilizado o checkout estável; sem branch/worktree/transferência silenciosa de alterações. Manifesto compara hashes inicial/final, identifica novas inclusões e alterações intencionais. Migrations 001–021, relatórios 019–021, AGENTS.md, package-lock e R2 original preservados. Não executar limpeza/descarte do trabalho anterior.

## 3. Arquitetura e reutilização

[ADR023](../arquitetura/ADR-023-demonstracoes-versionadas.md). Reutilizados exercício canônico/versões 009, editor/prescrições/snapshots 010, documentos 011 sem URLs temporárias, shell/memória/seletores/feedback, autenticação opaca/entitlement/Origin/rate/DTO, PostgreSQL/transações, ledger e privacidade 016. Não há novo exercício, segundo login, gateway financeiro ou conta aluno antecipada.

YouTube é referência externa, não arquivo. Stream é provedor preferencial para upload/transcodificação/reprodução privada; R2 de fotos permanece intacto. Novas dependências: nenhuma. Não foi instalado ou atualizado pacote. Tokens Stream são capacidades temporárias de mídia, não autenticação JWT web.

## 4. Modelo e migration

Migration aditiva 022_exercise_media.sql segue a sequência real 001–021. Tabelas: exercise_videos, exercise_video_versions, exercise_video_sets, exercise_video_set_versions, exercise_video_set_items, workout_video_references, media_operations, media_events, media_cleanup e media_publishers.

Vídeo/revisão e conjunto/revisão são distintos. Ordens0–9, primeira principal, sem repetição. FKs preservam versão/item da prescrição. Campos de demonstração opcionais mantêm compatibilidade com snapshots existentes. Runtime não atualiza metadados de revisão/eventos nem concede publicação; pode atualizar apenas campos de processamento e resultado do lease de webhook. Auditoria e intenção idempotente são transacionais.

Aplicação somente em PostgreSQL 18 descartável `formfisik-023-test`, loopback 5553, bancos `_test` separados para suites/Chrome/build e bancos efêmeros do ensaio operacional. Nenhuma migration em banco persistente.

## 5. Fluxos

- Biblioteca `/videos`, filtros/paginação 20 no SQL, resumos mínimos, histórico 20, detalhes/direitos sob demanda. Carregamento explícito do player, sem preload de vídeo em cards.
- Exercício cadastrado continua no módulo 009 e oferece associação contextual; YouTube pode ser adicionado sem baixar/hospedar mídia. Escolha de fonte, título/descrição opcionais, direitos e pessoas conferidos.
- YouTube: parser HTTPS/hosts/caminhos exatos, watch/youtu.be/shorts/live/embed, ID de 11 caracteres; rejeita HTML/iframe/credenciais/ports/domínios semelhantes. Descarta tracking/playlist. Player/API oficiais com iframe nocookie, referrer de origem e CSP; erros 100/101/150/153 e fallback externo, sem contornar restrições.
- Upload privado: reserva durável, quota, URL temporária direta ao provedor, processamento/atualização explícita, webhook e inspeção canônica. Sem configuração, UI/servidor indisponíveis de verdade; não há provedor falso selecionável no runtime.
- Vários vídeos por exercício, preferência privada completa sobre conjunto oficial, tornar principal/remover e gestão oficial autorizada. Editar metadados/substituir cria revisão. Arquivo impede nova seleção; revogar bloqueia reprodução inclusive histórica e solicita cleanup físico.
- Prescrição seleciona demos por ocorrência do exercício, ordem/principal próprios e referência imutável. Mudar catálogo não muda treino já prescrito. PDFs existentes preservados; nenhum token de reprodução incorporado.

## 6. Moderação, autoria e privacidade

Autor submete voluntariamente; publicador específico e diferente revisa técnica/direitos. Pode devolver com justificativa, publicar ou retirar conteúdo oficial. Capacidade de exercício não concede privilégio de mídia. Não foi provisionado publicador real. Declarações registradas não comprovam validade jurídica, imagem/voz/licença ou qualidade clínica.

[Privacidade](../privacidade/demonstracoes.md): finalidade demonstrativa separada de fotos corporais. URLs externas só carregadas após ação; modo privacidade aprimorada não significa ausência de processamento pelo Google. Dados de aluno não são enviados ao provedor na reserva. Títulos/notas/referências não entram em logs. Direitos, menores, fornecedores/transferências e retenção precisam de aprovação competente.

Eliminação do aluno remove referências de prescrição pela cadeia canônica e mantém biblioteca profissional de finalidade própria. Conta privada remove metadados após dependências; contribuição oficial ou mídia remota não eliminada gera bloqueio explícito. Revogações/UIDs de cleanup entram no ledger autenticado e são reaplicados após restore antes de tráfego. DELETE durável e repetido; sem promessa de recolher bytes obtidos anteriormente.

## 7. Segurança e falhas

Sessão/conta/role/entitlement/propriedade por API/página; emissão de reprodução revalida estado após rede e sessão antes da resposta. Quotas só servidor, loops/listas limitados, versão otimista e locks por proprietário. Referências estrangeiras ou não associadas são recusadas. Sem HTML/iframe arbitrário, importação por URL genérica ou dados brutos de cartão.

Stream exige signed-only, duração/tamanho/prontidão confirmados. Capacidade de 5 min tem janela residual explícita; não há DRM. CSP permite apenas YouTube nocookie e host Stream configurado, upload Cloudflare e script oficial via nonce/strict-dynamic; sem unsafe-eval em produção. Iframe envia só origem, sem afrouxar política global de referrer das demais páginas.

Webhook verifica HMAC/corpo bruto/timestamp, fingerprint durável, lease/retry e consulta canônica; duplicados e eventos atrasados não recriam vídeo nem restauram revogação. Limpeza de 20 itens/lote, retry de 5 min, tombstone diário. Falha após reserva sem UID permanece incerta, bloqueia retry cego e exige conferência operacional por reservation; recuperação automática dessa condição não foi implementada.

## 8. Validações e evidências

Suíte completa final: **378 testes aprovados, zero falhas, zero cancelados e zero ignorados**, em 345,1 s, no PostgreSQL descartável. Evidência: `test-results/023/acceptance-regression.log`. Inclui 34 casos da 023. TypeScript e ESLint aprovados. Build Webpack real corresponde aos hashes finais de `src`, conforme `build-source-check.json`.

Uma rodada anterior de 372 testes teve 371 aprovações e uma asserção antiga de navegação que não incluía Vídeos; a expectativa foi atualizada preservando cobertura. Rodadas direcionadas de mídia/dashboard também passaram (43 casos), sem serem somadas novamente ao total. Logs intermediários permanecem identificados como tentativas anteriores.

Casos 023: variantes de URL/injeção/direitos/strict, DTO/IDOR, idempotência/concorrência, associação/ordem/histórico, prescrição/versionamento/arquivo/revogação, upload indisponível, privacidade/tamanho/duração, quotas concorrentes/versões retidas, reserva incerta/retry, cleanup com falha/recuperação, assinatura/webhooks duplicados/fora de ordem, revisão independente/devolução/retirada oficial, rollback de auditoria, eliminação, preferências sobre oficial, revogação durante playback/upload e transporte REST controlado.

Chrome dedicado: fluxo YouTube, associação contextual, modal/foco/Escape, carregamento sob demanda, arquivo/reativação, IDOR 404, upload/estado controlado, quatro larguras 1440/768/375/320, Axe, altura reduzida/texto 200% e rolagem externa. Capturas em browser/. Player YouTube e Stream interceptados exclusivamente no teste; arquivo sintético não é vídeo pessoal ou homologação de codec externo.

Build real Webpack e Chrome HTTPS: árvore de identidade/alunos/exercícios/treinos/avaliações/PDF/SaaS, fluxos 017–021 e biblioteca 023. Canários Stream/Stripe/R2/SMTP/HMAC, CSP, cookies/storage e troca de usuário. Rodada final também valida iframe/API YouTube controlados sob CSP real e Referer contendo só origem, incluindo erro 153. Transporte Stripe oficial redirecionado somente no teste para loopback. Nenhuma chave real ou dependência externa validada por esse mecanismo.

Operacional: 22 migrations, 161 FKs, zero constraints não validadas; upgrade desde 013, checksum/gap/rollback/retry, pg_dump/restore, ledger/replay, outros titulares preservados e grants mínimos. Neste ensaio backup 330 ms/restore 1241 ms; não é SLA. Revogação de mídia posterior ao backup reaplicada no restore, runtime nega modificar título histórico/grants/eventos. Evidência `operations/operations-proof.json`.

Falhas intermediárias identificadas: sandbox negou acesso loopback/Docker antes de teste; execução autorizada prosseguiu no ambiente apropriado. Uma revisão automática de execução expirou e a repetição permitida iniciou normalmente. Fixtures inicialmente conservaram fila de outro caso ou tentaram remover vínculo protegido; corrigidas isoladamente. Fixture de oficial precisou remover chave de criação particular antes de simular catálogo oficial. Chrome encontrou seletor ambíguo/label sem nome exato e compilação de harness durante edição; resolvidos. Uma rodada integrada apresentou ERR_NETWORK_CHANGED; nova execução passou. No roteiro final, aguardar networkidle após redimensionamento encontrou prefetch antigo de navegação; uma navegação explícita cancelou a leitura anterior, sem alterar autorização ou relaxar os controles do produto. A seção recolhida de cadastro precisou ser reaberta após essa navegação. Nenhuma dessas tentativas foi apresentada como homologação.

## 9. Limitações e decisões pendentes

- Stream/YouTube reais, custos, webhooks públicos, redes móveis/codecs reais e conta contratada não homologados; serviços pagos/credenciais ausentes não ativados.
- Acervo oficial real depende de produção/licença/revisão; nenhum vídeo de terceiro foi copiado ou dado sintético publicado no runtime.
- Tus/retomada binária, thumbnails em cards, busca de metadados externa, denúncias públicas automatizadas, legenda automática, offline e app aluno não implementados. Player gerenciado oferece seus recursos/miniatura/legenda conforme o conteúdo, sem gerar legenda fictícia.
- Upload por POST direto até 200 MB; incerteza sem UID exige recuperação operacional. Quotas são limites técnicos iniciais configuráveis, não novo plano comercial ou armazenamento ilimitado.
- Aparelhos físicos/leitores de tela reais/outros browsers não homologados por Chrome/Axe. Transcodificação não é antivírus ou moderação semântica.
- Retenção, canais, responsáveis, direitos de imagem/voz/música, fornecedores e orçamento precisam de decisão antes de dados reais. Não há certificação jurídica/LGPD ou garantia absoluta de segurança.

## 10. Veredito e restrições

**GO local controlado** para 023-A/B/C, com as limitações deste relatório e do resumo verificável. Homologação externa e produção: **NO-GO**, mantendo as restrições 015–021. Não houve deploy, commit, cobranças, transferências, contratação de serviço, configuração de credencial real ou alteração de banco persistente. Ambiente descartável encerrado ao final e portas verificadas em cleanup.json.

[Índice oficial](../README.md) · [Módulo](../modulos/demonstracoes.md) · [API](api-demonstracoes.md) · [ADR023](../arquitetura/ADR-023-demonstracoes-versionadas.md) · [Operação](../operacao/demonstracoes-stream.md).


## 11. Arquivos e evidências verificáveis

`test-results/023/manifest.json` registra os 27 arquivos novos e 25 alterados, origem, justificativa e SHA-256 antes/depois, além dos arquivos anteriores preservados. Não houve exclusão de código. `source-audit.json` distingue a 023 do trabalho anterior não commitado.

`verification-summary.json` consolida os resultados; `browser-proof.json`, `browser/`, `api-measurements.json`, `verified-production/after-production.json` e `final-production/after-production.json` registram Chrome/Axe, medições e os ensaios de produção locais. A rodada integrada cobre 017–021; a rodada final de mídia verifica o player sob a CSP do build final. `operations/operations-proof.json` documenta backup/restore e `cleanup.json` comprova o encerramento do ambiente descartável. `evidence-manifest.json` contém hashes dos artefatos de validação. `documentation-links.json` verifica os links locais dos documentos desta entrega.
