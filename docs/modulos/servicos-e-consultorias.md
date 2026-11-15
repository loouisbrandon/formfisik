# Serviços, planos comerciais e consultorias —019

Estado: implementação local; resultados efetivos no [relatório 019](../engenharia/entrega-019.md). Produção/dados reais continuam BLOQUEADOS pelo NO-GO 015–018. FormFisik é empresa independente fundada por Brandon Louis; não se presume constituição jurídica formalizada.

## Domínio e acesso

Serviço é oferta profissional; plano comercial configura preço/BRL, duração e obrigações; contratação fixa o acordo de um aluno; entrega representa obrigação; execução registra unidades realmente realizadas. Pagamento pertence ao módulo Financeiro020, com validação local controlada e limitações próprias; Consultorias não processa pagamentos. A assinatura SaaS Pro de R$139,90/mês, trial 30 dias/cartão, permanece independente e inalterada.

Navegação única “Consultorias” em /consultorias, áreas Serviços/Planos comerciais/Contratações/Entregas/Histórico e subárea /alunos/{id}/consultorias. Perfil e CRM apontam para o mesmo módulo. Usa ProfessionalShell e não cria outro Kanban. Sessão opaca confirmada, conta profissional habilitada, entitlement SaaS e propriedade são exigidos no servidor em cada página/API; sem JWT ou armazenamento de credenciais no navegador.

## Catálogo

Categorias: consultoria online, acompanhamento presencial, sessão avulsa, avaliação física, planejamento de treino e personalizado. Atendimento online/presencial/híbrido; modalidade desta entrega é somente musculação/personal training, sem entidades de outras especialidades. Nome 100, descrição 2000 e informações comerciais 1500, validados/normalizados. Criar, editar, duplicar, arquivar/reativar, pesquisar, filtrar e consultar eventos. Nomes não são identidade nem obrigatoriamente únicos; UUID e proprietário distinguem registros.

Arquivo impede planos/contratações novos e ativação de rascunhos; não encerra contratos ativos. Duplicação gera novo ID/revisão independente, inclusive ao reaproveitar configuração arquivada; não reativa o original. Reativar plano exige serviço não arquivado. Catálogo não possui DELETE público.

## Planos e versões

Preço em centavos inteiros,0..1.000.000.000, moeda fixaBRL. Entrada em reais admite vírgula/ponto e até 2 decimais; rejeita notação científica e frações de centavo. Não multiplicar quantidade de sessões pelo preço: o preço representa o valor total da configuração/período. Quantidade de sessões é opcional 1..1000, como dado comercial; o progresso acompanha as unidades das entregas configuradas. O profissional deve incluir as sessões que exigem acompanhamento nas obrigações do plano, pois o campo não cria entregas automaticamente. Nome 100, descrição/condições 2000, duração/unidade, disponibilidade e intenção de cobrança futura não definida/avulsa/recorrente. Intenção não executa cobrança.

Duração dias/semanas/meses/anos; limite técnico aproximadamente 10 anos/3660 dias, com validação por unidade. A vigência inclusiva termina no aniversário exclusivo menos 1 dia; ajuste para último dia do mês antes de subtrair. Exemplo:31/01/2024 +1 mês →28/02/2024 inclusive;29/02/2024 +1 ano →27/02/2025. Datas civis 2000–2099 de início, fim antes 2101; sem converter calendário de negócio em horárioUTC. A UI mostra o fim calculado antes da confirmação.

Cada gravação ou mudança de arquivo do plano gera revisão imutável. Ela preserva serviço/configuração, inclusive identificação/versão da oferta, preço e entregas. Consultas históricas são paginadas e o documento da revisão só é carregado explicitamente. Mudar preço/nome/catálogo não modifica acordos anteriores. Alterar o serviço isoladamente não publica revisão de plano: revise/salve o plano para incorporar a nova descrição do serviço às próximas contratações.

Até 30 tipos de obrigação por plano; cada linha tem nome 120, descrição 1500, tipo, quantidade 1..1000, obrigatoriedade, ordem e prazo relativo em dias desde início ou absoluto. Não expandir 1000 unidades em 1000 linhas. Prazo deve estar na vigência ao contratar; plano relativo que não couber e data absoluta fora do período impedem o acordo, sem ajustar silenciosamente.

## Contratação e transições

Escolher aluno próprio ativo e revisão atual de plano disponível. Revisar valor total acordado, sessões, início/fim, condições e obrigações, confirmar registro administrativo. Cria rascunho com snapshot imutável do acordo e entregas. Não cria conta de aluno, assinatura, pagamento, aceite externo ou assinatura eletrônica. Ativação é declaração administrativa do profissional, não comprova contrato juridicamente assinado.

| Estado persistido | Próximos estados |
| --- | --- |
| Rascunho | Ativa ou cancelada |
| Ativa | Suspensa, concluída ou cancelada |
| Suspensa | Ativa, concluída ou cancelada |
| Concluída/cancelada | Terminais; não são reabertas silenciosamente |

Ativa com início futuro aparece Programada; ativa/suspensa após fim aparece Expirada. São projeções temporais, sem job/escrita automática. Não ativar vigência vencida; retomar suspensão não prolonga prazo; conclusão não ocorre antes do início e exige todas as obrigatórias concluídas, incluindo canceladas que continuam não cumpridas. Cancelamento/suspensão exigem justificativa. Cancelamento preserva obrigações/histórico e interrompe execução; não promete estorno.

Somente rascunho pode editar termos, mantendo aluno/plano e conferindo revisão atual. Troca de revisão é explícita e substitui obrigações ainda não executadas; versões anteriores preservam o acordo anterior. Depois de ativar, termos não se editam: renovação/acordo novo é necessário. Aluno arquivado impede novo acordo, ativação, execução, renovação ou conclusão; cancelamento administrativo permanece disponível. Arquivar aluno não cancela serviço ou assinatura automaticamente.

Sobreposição do mesmo plano/aluno/período é recusada inicialmente, inclusive entre criações concorrentes com chaves diferentes. Profissional pode confirmar acordo independente explicitamente. Mesma chave/intenção retorna o mesmo resultado; intenção diferente com a chave é 409. Versões impedem perda silenciosa em edição/cancelamento/conclusão concorrentes; auditoria/versão/obrigações/chave pertencem à mesma transação.

## Renovação

Uma contratação ativa, suspensa, expirada ou concluída pode originar uma única sucessora administrativa, sempre novo rascunho e início posterior ao término anterior. Selecionar/revisar plano atual do mesmo serviço, valor e novas obrigações. Acordo anterior não muda. Detalhes oferecem navegação para contratação anterior e renovação vinculada; o histórico anterior também mostra o registro da sucessora. Vínculo único anterior→sucessora e chave idempotente previnem duplicação; sucessora cancelada continua no histórico e não libera outra renovação do mesmo vínculo. Novo acordo independente pode ser criado conscientemente se necessário. Rascunho/cancelada não renovam; não existe renovação automática financeira.

Indicador de término próximo: até 30 dias, incluindo data final, em ativa/suspensa/programada não vencida. Identifica necessidade de decisão; não dispara mensagem ou cobrança.

## Execuções e evidências

Entrega: pendente→em andamento/concluída/cancelada; em andamento→concluída/cancelada; concluída/cancelada→pendente somente por reabertura justificada. Registro de unidades pode passar de pendente diretamente a em andamento ou concluída. Quantidade executada vigente não excede prevista; conclusão quando total é atingido. Não editar definição após contratação ativa.

Tipos de treino/avaliação/revisão de anamnese exigem evidência explícita do mesmo proprietário e aluno, da vigência:

- Treino: versão publicada ativa identificada e ficha individual atualmente ativa; rascunho ou versão fora do período não serve.
- Avaliação: registro ativo e versão atual, data civil na vigência; medidas/notas não são copiadas.
- Anamnese: solicitação revisada, não revogada, versão do questionário e data do evento de revisão na vigência; respostas não são copiadas.

Cada evidência representa 1 unidade e não se repete na mesma obrigação enquanto vigente. Outras entregas admitem atestado manual de unidades com registro operacional de pelo menos 5 caracteres, ou evidência explícita quando pertinente. Não atribuir comprovação externa/jurídica à declaração manual. Consulta de candidatos 20/página retorna somente ID, título operacional, data e versão.

Execução exige contratação ativa e dentro da vigência; suspensão, programação, expiração ou encerramento impedem registrar/reabrir trabalho. Atividade fora da vigência exige revisão administrativa cabível, não burlar a data da evidência. Reabertura invalida logicamente as execuções anteriores com motivo, preservando-as; nova realização exige novo registro. Correção/arquivo posterior da fonte não apaga execução nem conclui/reabre obrigação automaticamente. Detalhe indica se a fonte ainda corresponde à versão atual ou foi alterada/arquivada/indisponibilizada. Treino abre módulo próprio; selecionar a versão indicada no seu histórico, sem novo editor.

## CRM e indicadores

Seis condições opcionais novas: existe contratação, ativa na vigência, próxima do fim, entregas pendentes, atrasadas e existe atendimento contratado concluído. Mantém todas/qualquer e efeitos info/recomendação/entrada/saída do 018; nenhuma regra configurada foi modificada e não há movimento automático.

Card mostra contagem/flags, sem preço, acordo completo ou evidência clínica. Pendências/atrasos CRM consideram obrigações de acordos administrativamente ativos/suspensos, inclusive após vencimento, para não ocultar trabalho pendente. Atendimento concluído significa existir acordo concluído; pode coexistir com outros em andamento.

Indicadores comerciais respeitam filtros: contratações totais/ativas/concluídas/próximas, alunos distintos com ativa, entregas pendentes/atrasadas,5 serviços mais contratados por ID/nome atual do catálogo. Contagens não são receita, pagamento ou conciliação. Nenhum indicador monetário agregado foi implementado.

## Paginação, dados e operação

Listas/históricos/execuções/candidatos/revisões 20 no SQL, contagens totais e página vazia preservadas. Busca literal sem distinguir caixa, curingas escapados; catálogo ordena nome/UUID; contratos fim/UUID; entregas prazo/contrato/ordem/UUID; eventos sequência decrescente; execuções data/UUID; candidatos data/ID/versão conforme domínio. Filtros por status/situação/categoria/nome, aluno, serviço, período de início, proximidade/atraso conforme contrato. Sem milhares de registros ocultos no cliente. Detalhes e documentos históricos sob demanda, leituras canceláveis, rascunho só em memória com aviso de saída.

Migration 019 aditiva: serviços, planos/versões, contratações/versões, entregas/execuções, eventos e operações. FKs compostas proprietário/aluno/contratação/entrega e versões imutáveis; sem tabela de transação financeira. [ADR 020](../arquitetura/ADR-020-servicos-e-consultorias.md), [API](../engenharia/api-consultorias.md), [privacidade](../privacidade/consultorias.md) e [fronteira 020](../estrategia/diretrizes-financeiro-profissional.md).

Migration/grants preparados, sem aplicação persistente. Worker 016 elimina acordos, versões, obrigações, execuções, eventos e respostas idempotentes do aluno aprovado antes das fontes canônicas; catálogo permanece para outros alunos. Conta profissional elegível elimina catálogo restante; bloqueios prévios continuam. Backup/restore exige replay do ledger. Nenhum prazo legal novo, expurgo agendado, cobrança, Connect, emissão fiscal, assinatura eletrônica, app ou outra modalidade.

## Central comercial — refinamento de novembro/2026

A entrada `/consultorias` passa a abrir **Visão geral**, com as abas Serviços e planos (subáreas Serviços/Planos comerciais), Contratações, Entregas e Histórico. O perfil do aluno reutiliza a mesma central, limitada ao vínculo. Os temas claro/escuro usam o shell vigente. Busca da visão geral e sua paginação/situação preservam contexto durante a navegação; listas continuam com 20 registros no SQL, ordenadas pelo término/UUID. Busca de contratação abrange aluno, nome acordado do plano e nome acordado do serviço, com curingas literais.

Definições da visão geral, sempre do proprietário e opcionalmente do aluno selecionado:

- **Contratações ativas**: estado projetado ativo, dentro da vigência atual.
- **Vencem em 30 dias**: ativas, programadas ou suspensas, término entre hoje e hoje+30 dias, inclusive.
- **Renovações pendentes**: término próximo ou estado projetado expirado, sem sucessora registrada. É sinal de decisão administrativa, não renovação prometida/aceita ou cobrança. Uma sucessora em rascunho já retira o predecessor desse contador; seu cancelamento mantém a cadeia histórica e não libera outra renovação do mesmo vínculo.
- **Entregas em aberto**: obrigações pendentes/em andamento em contratações que não estejam em rascunho, concluídas ou canceladas. Quantidade de obrigações, não de unidades ainda faltantes.
- **Entregas vinculadas**: obrigações concluídas/total por tipo, nesse mesmo conjunto de contratações. Uma obrigação de 8 sessões é uma obrigação; o detalhe preserva o acompanhamento das 8 unidades.
- **Serviços mais contratados**: até cinco serviços por quantidade de contratações, incluindo todos os estados e usando o nome atual do catálogo, conforme regra preexistente.

Os cartões e resumos consideram a carteira/aluno inteiro; a busca e situação da tabela afetam somente seus resultados. A explicação está disponível na própria interface. As próximas ações abrem as áreas de contratações/entregas para revisão e aplicação dos filtros necessários, sem mudar estados.

Serviços simples usam painel lateral modal com foco contido/restaurado, fechamento bloqueado durante gravação e confirmação de descarte. Planos e contratações mantêm os editores canônicos, com entregas/configurações progressivas, confirmação explícita e histórico. Não foi criado estado contratual de “arquivado”: estados terminais e arquivo do catálogo permanecem conforme regras existentes. Não existe novo estado de entrega “revisada”; a evidência de anamnese já exige revisão no módulo de origem.

Entregas oferecem navegação para Treinos, Acompanhamento, Anamneses, Agenda, Check-ins e perfil, conforme o tipo. Evidências continuam limitadas aos tipos e regras já suportados. Check-in/feedback não é convertido em evidência de anamnese nem conclui obrigação automaticamente. O Financeiro continua separado, acessível por link, sem nova operação financeira.

Validação e manifesto: [relatório do refinamento](../engenharia/refinamento-consultorias-2026-11.md).

### Refinamento das quatro áreas internas

Serviços e planos passam a usar cards comerciais e menus contextuais; Contratações ganha superfície própria para tabela, cabeçalho/filtros e detalhe hierarquizado; Entregas usa tabela responsiva com progresso por unidades explicitamente registradas; Histórico mostra eventos como linha do tempo. Formulários de plano/contratação e detalhe de entrega seguem a mesma hierarquia visual. A Visão geral não foi redesenhada nesta etapa.

Reutilizados os callbacks, editores, consultas, paginação, comandos e controles019. Nenhuma alteração de API, modelo de dados, autorização, finalidade ou retenção. `collection-views.tsx` contém apenas apresentação do catálogo e das entregas; menus encaminham aos comandos existentes da área. `shared.tsx` mantém as consultas do histórico e altera somente sua apresentação. Relatório e evidências na seção complementar do [refinamento](../engenharia/refinamento-consultorias-2026-11.md).
