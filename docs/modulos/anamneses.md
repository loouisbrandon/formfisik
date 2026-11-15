# Anamneses e cadastro inteligente — Entrega 017

Implementação local da FormFisik, empresa independente. Estado de validação e GO/NO-GO no [relatório017](../engenharia/entrega-017.md). Sem deploy, migration no banco persistente, credenciais externas ou dados reais. [Decisão arquitetural](../arquitetura/ADR-018-anamneses-versionadas.md).

## Operação profissional

`/anamneses`: Modelos e Solicitações. Sidebar/shell compartilhados; listagens SQL de20, total, ordenação criaçãoDESC/UUID e páginas vazias explícitas. Filtro por estado e página permanecem na memória limitada do shell; respostas/links não entram nessa memória. Detalhes carregados por ação explícita. Perfil do aluno mostra resumo mínimo com última solicitação, última resposta/versão e pendências; `/alunos/:id/anamneses` delimita histórico/convites desse vínculo.

Cadastro manual008 permanece operacional. Convidar aluno abre solicitações. Escolher padrão FormFisik v1 ou abrir modelo privado e usar versão publicada; gerar link individual, copiar e compartilhar manualmente. Token só é mostrado nessa criação; perda exige nova solicitação e revogação da anterior quando cabível. Não há envio automático, consulta de contatos ou WhatsApp API.

Construtor: criar/nomear/descrever, uma seção em edição, adicionar/reordenar/excluir seções, perguntas recolhíveis, tipos/obrigatoriedade/descrições/alternativas/limites/condição, duplicar/remover perguntas e prévia. Reordenação por botões acessíveis, sem drag obrigatório. Salvar rascunho é explícito e exige versão atual; conflito409 solicita recarga. Publicar cria snapshot; editar depois não muda solicitações anteriores. Prévia do rascunho e consulta de versões publicadas; duplicar padrão ou modelo cria rascunho; arquivar preserva respostas. Limite de 100 publicações por modelo, rejeição422 ao exceder.

Tipos: Sim/Não, curto até 300 caracteres, longo até 4.000 caracteres, inteiro seguro, decimal, seleção única, múltipla, select, escala inteira, data civil válida, bloco informativo sem resposta. Até 12 seções,30 perguntas por seção,100 no total,30 alternativas por pergunta. Títulos até 180 caracteres, descrição até 600 caracteres; nome do modelo até 120 caracteres, descrição até 1.200 caracteres. Limites numéricos configuráveis entre -1.000.000 e 1.000.000, coerentes; inteiro/escala exigem limites inteiros. Opções usamUUID e rótulos numéricos/textuais, não executam conteúdo. JSON máximo 128 KiB por requisição; explicitar/refinar questionários maiores em vez de presumir capacidade ilimitada.

Condições somente sobre Sim/Não ou seleção única anterior e alternativa válida. Mover/remover dependência pode invalidar rascunho: corrigir condições antes de salvar/publicar. Dependências futuras/circulares e campos desconhecidos são rejeitados. Valores que deixaram de ser aplicáveis são descartados do payload efetivo/persistência, nunca utilizados para exigir perguntas ocultas.

## Preenchimento e identidade

`/responder` é público, sem conta/senha. Apresentação/finalidade/profissional/privacidade → cadastro controlado quando novo → uma seção por etapa → revisão → ciência explícita → envio → confirmação. Dados cadastrais reutilizam schema 008 sem notas administrativas. Nome obrigatório; contatos/nascimento opcionais. Anamnese separada e versão visível. Ciência não equivale à validação de base legal/consentimento universal.

Novo sem coincidência na carteira cria cadastro privado canônico. Coincidência de nome/e-mail/telefone conserva submissão pendente; resposta pública é a mesma confirmação. Nunca associa por e-mail a `users`, não revela conta global e não concede login/assinatura. Na resolução profissional, conferir identidade/escopo por canal independente antes de selecionar vínculo próprio ou criar cadastro separado. Atestado naUI não substitui prova externa; registrar aprovação no procedimento competente. Nenhum cadastro existente é automaticamente atualizado.

Aluno existente: vínculo é fixado antes de gerar token; público não vê contatos/nascimento/dados existentes e não pode enviar bloco de identificação. Resposta não duplica aluno. Nova solicitação conserva respostas anteriores; comparação é manual entre registros, sem sobrescrita, scoring, recomendação médica ou diagnóstico. Correção posterior exige novo preenchimento versionado, sem edição da submissão original.

Rascunhos ficam somente na memória; proteção compartilhada de saída e confirmação ao trocar convite na mesma aba. Não há recuperação depois de fechar/recarregar. Falha de rede mantém dados na página; se o servidor já consumiu o link e a confirmação se perdeu, repetir retorna link indisponível: confirmar recebimento com o profissional, sem sucesso fictício ou recuperação anônima do histórico.

## Estados e histórico

waiting (convite criado/aguardando) → received ou pending na submissão. pending → received após resolução explícita. received → reviewing → reviewed; pode marcar reviewed diretamente após leitura. Histórico é imutável; novas respostas são novas solicitações. Expirada/revogada são estados de apresentação derivados de datas, não mudança destrutiva das respostas. Revogar somente antes da submissão; não apaga resposta recebida. Novo preenchimento gera novo link individual para vínculo existente.

Auditoria: created, revoked, received, pending, resolved, reviewing, reviewed, viewed. Dono/solicitação/data/tipo, sem cópia de respostas ou token. Detalhe registra consulta; histórico em páginas de 20, decrescente por ID. Eventos são contratos mínimos para 018, sem CRM, tarefas, notificações externas ou Kanban implementados. Lista registra indicação real de resposta; não há push/email ao profissional nesta entrega.

## Modelo SQL

| Tabela | Conteúdo / propriedade |
| --- | --- |
| intake_forms | Dono, rascunhoJSON, revisão otimista, arquivo/data; sem segundo cadastro de alunos |
| intake_versions | Formulário/dono por FK composta, número único por modelo, definição estável/data; trigger rejeita UPDATE |
| intake_requests | Dono, versão por FK composta, vínculo opcional por FK composta, finalidade, digest, validade/consumo/revogação, estado/data |
| intake_submissions | Uma por solicitação; respostas e identificação somente quando pendente, ciência/data; trigger rejeita UPDATE |
| intake_events | Dono/solicitação por FK composta, tipo/data; sem conteúdo sensível |

Versão/definição inclui conceitos de seção/pergunta/opção, com UUIDs e limites; não são tabelas extras sem necessidade. Cascade de submissões/eventos é restrita à eliminação operacional da solicitação aprovada. Runtime não podeDELETE snapshots nem modificar versões/submissões. Migration017 adiciona chave composta do vínculo para integridade, sem alterar SQL 001–016.

## Segurança, privacidade e validação

[ContratosHTTP](../engenharia/api-anamneses.md), [privacidade](../privacidade/anamneses.md). Toda operação profissional requer sessão opaca, confirmação, role e entitlement canônico; owner vem da sessão. Público usa capacidade mínima validada no servidor, sem cookie/conta paralela. Persistência de token somente SHA-256; IP/token têm rate limitHMAC, nunca chave em texto puro. Corpo JSON/timeouts/Origin estritos existentes. Público sem cache, sem Referrer/indexação e sem recursos de terceiros de coleta. CSP global preservada; novos bundles não recebem segredos.

Limites: privado120 operações/min/profissional; público60 requisições/15min/endereço confiável e30/15 min/capacidade. Sem configuração de borda confiável, IP é chave compartilhada conservadora, com risco de indisponibilidade; não inventar proteção distribuída já homologada. Erros não incluemSQL, contatos, notas ou credenciais. UUID sozinho não autoriza.

Testes e limitações de Chrome/Axe, cenários de concorrência/restore e evidências verificáveis constam no relatório. Homologação externa, leitores de tela humanos, política jurídica, produção e outras modalidades permanecem separados.

## Reutilização022 e fronteira de finalidade

Motor, construtor, campos, revisão e página pública são reutilizados por022 com contexto explícito. Catálogo tem usage intake/checkin imutável, default intake nos registros anteriores. APIs017 filtram intake e convites não aceitam versão checkin. Ciclos/convites/respostas022 têm persistência separada: não são anamnese revisada nem evidência intake019. Sem mudança da política de cadastro017. [ADR024](../arquitetura/ADR-024-checkins-e-finalidades.md).

## Central e editor — refinamento novembro/2026

Solicitações apresentam aluno vinculado quando existente; convites sem vínculo mostram “Novo aluno · vínculo não definido”, sem expor identificação pendente. Busca por nome vinculado ou título do formulário é substring literal no servidor (até120 caracteres), com paginação de20 e filtro de estado preservados. Os quatro indicadores independem do filtro: total de convites criados, aguardando válidos/não revogados, respostas pendentes (received/pending/reviewing) e revisadas. “Convite criado” não significa enviado por canal externo. Expirados/revogados não entram em aguardando.

Editor reorganizado em seções, perguntas e configurações, com a mesma regra de rascunho/publicação e prévia. Não há edição posterior da resposta original, link recuperável, envio automático ou publicação implícita ao salvar. O construtor é compartilhado com check-ins, mantendo as finalidades separadas.

### Ajuste de fidelidade à referência — 05/11/2026

A central usa tabela paginada ao lado do convite. É possível escolher um aluno existente por busca paginada reutilizada de `StudentsPicker`, ou manter convite de novo aluno. O contexto do perfil mantém vínculo fixo. Modelo padrão e versão personalizada previamente selecionada continuam disponíveis, sem carregar todo o catálogo.

O editor mostra cartões de perguntas abertos visualmente, com configuração progressiva pelo lápis, opções e campos ilustrativos (não são respostas). Salvar continua sem publicar. A ação explícita Publicar versão salva o rascunho validado, obtém sua revisão atual e solicita publicação ao endpoint existente; conflitos continuam sujeitos à revisão otimista do servidor. Se publicar falhar após salvar, o rascunho permanece salvo e o erro é informado. Check-ins reutilizam o construtor sem receber essa ação opcional de anamnese.

## Reordenação no construtor

As perguntas podem ser movidas dentro da seção atual pela alça lateral, com prévia flutuante e indicação da posição de inserção. Na alça focada, setas para cima/baixo oferecem alternativa ao arraste; Escape cancela o gesto. A mudança marca o rascunho como não salvo e mantém identificadores, respostas esperadas, opções e obrigatoriedade. A ordem será persistida no contrato existente de salvar/publicar, sem endpoint adicional. Uma pergunta condicional não pode preceder a pergunta da qual depende; a tentativa é recusada com aviso, sem apagar condições. Versões publicadas e convites anteriores permanecem imutáveis. O padrão também se aplica a consumidores do construtor compartilhado.
