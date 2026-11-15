# eCoach: escopo, abuso e consumo

Estado: IMPLEMENTADO localmente; testes controlados, sem homologação com provedor real ou deploy. Esta política não habilita novos públicos. A autorização atual continua limitada ao profissional elegível, com sessão, permissão e consentimento; acesso de alunos depende de entrega futura. O NO-GO da 015 permanece.

## Finalidade

O eCoach atende esporte, treino, saúde informativa e a operação profissional na FormFisik: alunos, acompanhamento, anamnese, agenda, comunicação, produtos e financeiro do personal. A FormFisik é empresa independente fundada por Brandon Louis. Esta política de produto não altera a estrutura jurídica ou as finalidades de tratamento já documentadas.

Pedidos de programação, astronomia, entretenimento geral e outros assuntos alheios são recusados, inclusive quando apresentados como requisito de um treino. Pedidos mistos são recusados integralmente. Diagnóstico, prescrição de medicamentos e orientação de doses/ciclos não são oferecidos. Saúde permanece informativa, com orientação para atendimento habilitado quando necessário.

## Contratos e camadas

1. `src/server/ecoach/scope.ts` normaliza acentos, caracteres invisíveis e algumas ofuscações; detecta assuntos e ataques conhecidos. Entrada ambígua pede esclarecimento. Saudação recebe orientação fixa. Essas respostas usam `mode: policy`, sem provedor, ferramenta ou proposta. Continuação curta herda somente o escopo de turnos anteriores aprovados; o contexto visual não concede autorização.
2. A política obrigatória acompanha a instrução de sistema nos dois fluxos de geração. Histórico, anexos, resultados de ferramentas, mensagens de contatos e orientações livres são dados não confiáveis. Nomes de contatos não são enviados ao gerador de atendimento.
3. Ferramentas têm lista permitida por intenção: financeiro, treino, anamnese ou agenda. Uma decisão incompatível é rejeitada antes da consulta. Isolamento por proprietário, assinatura, permissão, revisão humana e validações canônicas continuam obrigatórios.
4. Respostas e campos livres de propostas são inspecionados antes de retornar/persistir. Cache e confirmação de propostas antigas passam novamente pelas regras. Saída com código, segredos reconhecíveis, URLs externas, HTML ou ataques conhecidos é bloqueada. Não há execução de código gerado.
5. Chat completo e Finder compartilham o mesmo endpoint. Atendimento assistido valida o último recebimento e as orientações antes de gerar; regras só podem ser ativadas com orientações válidas. O histórico entregue ao provedor é filtrado. Aprovar rascunho continua sem enviar a canais externos.

`040_ecoach_scope_policy.sql` amplia somente a restrição de modo em `ecoach_turns` para `demo`, `ai` e `policy`; não cria novos dados ou privilégios. Resposta local é imediata e identificada como orientação de escopo. Conversas seguem exclusão/retencão já documentadas. Eventos de recusa registram apenas superfície e motivo fixos, sem texto pessoal.

## Mídia e custos

Texto recusado na pré-validação não gera chamada externa. PDFs devem ter texto selecionável, até 20 páginas/8 MB e 20 mil caracteres extraídos; o texto é validado localmente antes da chamada. PDFs escaneados são recusados. O arquivo binário e suas imagens não são enviados ao modelo.

Áudio precisa da transcrição inicial e imagens precisam da leitura inicial para conhecer seu conteúdo; portanto há custo mesmo se forem recusados depois. Imagens são sanitizadas e enviadas com detalhe baixo. Saída usa envelope JSON estrito e é validada antes de preencher o rascunho. Limites existentes de tamanho, tempo, mídia e revogação permanecem.

Cada chamada externa, incluindo rodada de ferramenta, atendimento, transcrição e visão, reserva uma cota persistente compartilhada em janela de 24h: `ECOACH_AI_CALL_DAILY_LIMIT=30` por profissional e `ECOACH_AI_CALL_GLOBAL_DAILY_LIMIT=300` global. Contam tentativas/falhas. `ECOACH_AI_MAX_OUTPUT_TOKENS=4096` aceita 512–4096; leitura usa no máximo 1024. Limites anteriores de pedidos, seis rodadas, 60 mil caracteres de contexto e timeout continuam ativos. Reservas conservadoras podem consumir cota sem resposta; não são cobrança financeira nem garantia de teto em reais. Configurar limites financeiros também no provedor é uma ação operacional separada.

## Evidência e limites

Regressões usam PostgreSQL descartável e provedores sintéticos, cobrindo pedidos mistos, ofuscação, instruções falsas, ferramenta incompatível, cache e retorno de mídia. Não comprovam resistência a todo ataque semântico nem comportamento do modelo real. Filtros determinísticos e instrução de sistema reduzem risco, mas não tornam prompt injection impossível; manter revisão de casos, limites e validação de novas ferramentas. Não declarar a IA “100% inviolável”. Homologar com o modelo escolhido antes de ampliar uso.

Referências: [segurança de agentes da OpenAI](https://developers.openai.com/api/docs/guides/agent-builder-safety) e [boas práticas](https://developers.openai.com/api/docs/guides/safety-best-practices).

### Validação desta entrega (local)

- 99 testes automatizados aprovados em PostgreSQL descartável: eCoach, mídia/PDF, atendimento, comunicação, permissões, privacidade e produtos. Provedores simulados, sem uso da chave real.
- Navegador com conta sintética: chat e Finder retornam `policy`, zero linhas em `ecoach_ai_requests` para os pedidos recusados, viewport 1440/768/320, altura 480 e texto a 200%. Conta de teste removida.
- ESLint, TypeScript e build de produção aprovados; auditoria dos 323 artefatos públicos com 16 canários sintéticos sem achados. Aviso preexistente de `metadataBase` não impede o build.
- Migration 040 aplicada apenas em `127.0.0.1:5544/formfisik_local_test`; staging/produção sem alteração. Não foram realizados testes pagos, testes de carga ou homologação do modelo real.
