# Check-ins, feedbacks e acompanhamento — Marco022

Estado: IMPLEMENTADO — GO local controlado em02/11/2026; evidências no [relatório](../engenharia/entrega-022.md). FormFisik independente fundada por Brandon Louis. Não homologado em produção/dados reais; sem aplicativo, canais externos ou alteração do plano Pro.

## Jornada profissional

`/checkins` e `/alunos/[id]/checkins` usam shell compartilhado. Solicitações, Modelos, Periodicidade, Indicadores e Histórico têm navegação local; mobile usa seletor nativo. Listas SQL20 com total/ordenação estável, páginas vazias e filtros/período em memória privada. Detalhe/respostas somente sob demanda. Perfil do aluno agrega total, atrasados, revisão pendente e datas de última resposta/devolutiva, sem conteúdo sensível. CRM só expõe duas contagens e link contextual; não movimenta etapa automaticamente.

Criar modelo rápido/completo/personalizado abre o mesmo construtor017. Rápido cobre disposição, dificuldades e conquistas; completo acrescenta sono/recuperação percebidos e relato condicional de desconforto. Todos esses campos são opcionais inicialmente. Profissional pode configurar obrigatoriedade, números, textos, escalas, sim/não, escolhas e condições suportadas. Até12 seções/100 perguntas/30 alternativas conforme motor017; JSON128KiB. Usar formulários curtos e finalidade explícita. Salvar rascunho não publica; publicar cria versão imutável. Arquivar impede novas atribuições, sem apagar convites/respostas anteriores.

Atribuir exige aluno ativo próprio e versão publicada checkin. Modelo anamnese não é elegível. Escolher frequência, início, quantidade, fuso, prazo e janela tardia; visualizar prévia e confirmar atomicamente. Até24 ciclos e12 meses. Semanal7dias, quinzenal14dias e mensal civil com início no dia1. Solicitação avulsa corresponde a7dias. Período termina antes de abrir a resposta: a janela começa à meia-noite civil do dia seguinte. Prazo1–14dias, tolerância adicional0–14dias. Para iniciar agora, escolher período já encerrado; não emitir link antes da abertura. Pausar cancela apenas futuras ainda não abertas, preservando abertas e respostas. Nova atribuição é explícita; não há retomada/reprogramação silenciosa.

## Convites e resposta sem conta

Abrir ocorrência e gerar link quando elegível. Validade de até7dias, limitada ao encerramento para convite inicial. Token só exibido na criação, não recuperável; se houver perda de resposta de rede, emitir outro explicitamente, revogando o anterior. Copiar e compartilhar manualmente no canal/destinatário corretos. Não há envio por e-mail/WhatsApp nem alegação de entrega/leitura.

Página pública remove fragmento, verifica capacidade viaPOST e mostra somente profissional, finalidade, período, formulário e contexto mínimo da prescrição (versão). Não recebe identificação cadastral nem permite escolher aluno. Não apresenta contatos, ficha completa ou respostas anteriores. Etapas/revisão/ciência/envio usam renderizador017. Rascunho só em memória; fechar/recarregar perde progresso. Falha de rede mantém campos. Repetir mesma tentativa/digest após commit retorna somente confirmação received:true, enquanto capacidade ainda elegível; nunca recupera conteúdo. Abrir link consumido retorna indisponível. Link não comprova identidade civil.

## Feedback e correções

Prescrição é opcional; selecionar revisão ativa histórica do mesmo aluno e divisão opcional daquela revisão. Vinculação não significa prescrição atual nem execução comprovada. Campos: realizado/parcial/não realizado/não informado, esforço percebido0–10, dificuldade1–5, desconforto e descrição pertinente, observações e pedido de conversa sobre ajuste. Campos sensíveis opcionais; não há diagnóstico, recomendação clínica, monitoramento de urgência ou alteração automática.

Meta acordada de1–100treinos por período é opcional e só faz sentido com prescrição. Quantidade declarada0–100 é solicitada somente com meta. Não derivar meta das divisões da ficha, sessions019 ou agenda021. Resposta não modifica treino, presença, obrigação ou pagamento.

Respostas são imutáveis. Para corrigir, profissional informa motivo e emite convite de correção: novo formulário em branco por até7dias, sem histórico público, original preservado. Pode ocorrer após a janela original. Base da revisão e consumo são validados no servidor; uma correção concorrente não sobrescreve outra. Nova resposta retorna a recebido, exigindo revisão. Consulta privada permite abrir todas as revisões paginadas20.

Revisão profissional refere resposta exata. Iniciar revisão e registrar devolutiva são ações distintas; novas devolutivas preservam anteriores. Compartilhamento manual é declaração explícita, não confirmação técnica de recebimento. Não existe chat ou leitura pública pelo token.

## Indicadores e comparação

Período padrão90datas civis; máximo367. Taxa de resposta: respondidas/elegíveis não canceladas com prazo encerrado. Pontualidade usa primeira submissão; correção não torna resposta originalmente pontual em atrasada. Canceladas são apresentadas separadamente. Convites renovados e revisões não multiplicam denominador. Ausência não vira zero. Denominador vazio significa não calculável.

Esforço/dificuldade médios são descritivos dos valores informados, sem limite clínico. Adesão é declarada e só usa pares com meta/quantidade; pode exceder100% caso o relato exceda a meta, sem clipping ou selo de execução. Não criar índice global de saúde/engajamento ou inferir culpa por silêncio. Solicitações de ajuste são contagem operacional, não classificação clínica.

No aluno, evolução compara uma pergunta na mesma versão publicada; até100registros por página, navegação explícita, período limitado, pontos numéricos e tabela acessível. Não unir perguntas de versões diferentes por nome/UUID; alteração de significado/escala inicia outra série. Sem interpolação ou amostragem silenciosa. Histórico de textos/ausências disponível sob demanda.

[API/modelo](../engenharia/api-checkins.md), [ADR024](../arquitetura/ADR-024-checkins-e-finalidades.md), [privacidade](../privacidade/checkins.md), [relatório](../engenharia/entrega-022.md).

## Central operacional — novembro/2026

Visão geral passa a ser a entrada do módulo, com cartões reais, semana/Hoje, filtros, solicitações e resposta lado a lado no desktop; no mobile, detalhe contextual com retorno. Solicitações, Modelos, Periodicidade, Indicadores detalhados e Histórico continuam disponíveis. Modelos podem originar cópia em novo rascunho; publicações/respostas anteriores permanecem intactas.

Devolutivas são registradas com confirmação e histórico append-only, não enviadas automaticamente. A central permite preparar lembrete no mesmo painel com o Composer de Comunicação, incluindo prévia e registro idempotente como preparado, sem alegação de entrega. Contexto identifica a solicitação antes da primeira resposta; respostas posteriores exigem revalidação pelo024. O link público atual continua exclusivo para preencher; leitura de devolutiva pelo aluno e envio/horário configurável dependem de evolução futura. Atribuição permanece individual, com preview/confirmacão e ciclos civis existentes.

Indicadores da central usam fim do período de acompanhamento no intervalo selecionado; histórico usa data do evento. Revisados no período contam solicitações distintas com devolutiva no intervalo, evitando multiplicação por complementações. Taxa mantém fórmula022: respondidas elegíveis / não canceladas com prazo encerrado, null sem denominador. Busca de aluno/modelo e situação filtram somente a lista; os cartões mantêm escopo do período/carteira/aluno contextual. Há explicação na interface.

[Relatório, auditoria, limites e evidências do refinamento](../engenharia/refinamento-checkins-2026-11.md).
