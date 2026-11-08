# Central de Comunicação Profissional — Marco 024

Estado: IMPLEMENTADO — GO LOCAL CONTROLADO em02/11/2026. FormFisik independente fundada por Brandon Louis; constituição jurídica não presumida. Produção/dados reais permanecem NO-GO. [Relatório](../engenharia/entrega-024.md), [API](../engenharia/api-comunicacao.md), [ADR-025](../arquitetura/ADR-025-central-comunicacao.md).

## Uso profissional

`/comunicacao` e `/alunos/[id]/comunicacao`, dentro do ProfessionalShell. Contatos, Modelos, Notificações, Pendências e Indicadores; seletor nativo no mobile, detalhes progressivos e listas SQL de 20 com total, ordenação estável, páginas vazias e filtros preservados em memória privada. Nada é salvo em Web Storage. Buscas limitadas, leituras obsoletas canceladas; Atualizar central permite recuperar falhas, com confirmação antes de descartar alterações. Cadastro e identidade vêm da carteira existente, sem duplicação.

Contatos mostra somente nome/situação, quantidade e último contato declarado e contagem de tarefas CRM. Pesquisa por nome, situação e contato recente. Abrir aluno permite consultar o histórico, preparar texto ou registrar contato declarado. Perfil e CRM têm caminhos contextuais. Texto do registro é carregado apenas ao consultar o detalhe. Datas do histórico usam o instante declarado e depois data de registro/UUID para desempate; detalhe distingue os dois instantes e o responsável proprietário.

## Modelos e prévia

Criar modelo próprio ou copiar um dos sete exemplos: boas-vindas, check-in, treino, acompanhamento semanal, atendimento, retorno e renovação. Exemplos não são registros persistidos nem envios. Editar cria versão imutável; arquivar impede novo uso, preservando referências históricas; reativar é explícito. Pesquisa/paginação/consulta de arquivados disponíveis.

Título até 120 e corpo até 4.000 caracteres; texto simples. Variáveis exatas: `{{aluno.nome}}`, `{{profissional.nome}}`, `{{contexto.tipo}}`, `{{hoje}}` (data de São Paulo). Sem HTML ativo, expressões, código, campos arbitrários, contato/saúde ou URLs individuais de acesso automaticamente. Modelos não devem conter dados individuais. Editar o corpo selecionado desvincula a referência ao modelo; não atribuir texto livre a uma versão que não o contém.

No registro, escolher aluno/tipo/canal/texto/contexto; Gerar prévia renderiza no servidor e vincula digest aos campos e referências. Confirmar revalida tudo. Mudança que invalida a prévia exige nova conferência. Falha mantém campos e mesma chave de intenção; confirmação perdida pode ser repetida sem duplicar. Registro não recuperável pelo browser depois de fechar/recarregar; dados ainda não salvos existem apenas em memória.

## Natureza e contexto

Mensagem preparada: texto armazenado, não enviado; instante de preparação vem do servidor. Contato externo declarado: profissional informa canal e instante (horário do dispositivo), sem comprovar envio, entrega, leitura ou conteúdo de conversa. Canais: e-mail, WhatsApp, telefone, presencial e outro. Não há importação de conversas ou disparo real. Instantes aceitos entre 2000 e 2100, sem futuro além de tolerância técnica de um minuto; nenhum agendamento de envio. Copiar texto só usa clipboard, não muda a natureza do registro.

Registros são imutáveis. Correção cria outro registro da mesma natureza/aluno e preserva o original; concorrência não permite duas correções divergentes sobre a mesma ponta. Histórico contém todas as revisões, contagem operacional usa apenas a ponta de cada cadeia. Não converter preparado em enviado ou contato por uma correção.

Contexto opcional: prescrição individual e versão, check-in/solicitação ou revisão de resposta, agenda, contratação e versão; avaliação física somente após confirmação específica de necessidade/autorização e finalidade operacional. Todos são revalidados por proprietário e aluno. Versão zero interna do check-in identifica a solicitação anterior à primeira resposta, apresentada assim na UI. Não copiar ficha, medidas, respostas, notas, contato ou valores no texto. Contexto é uma referência, não autorização ampliada. Detalhe oferece painel mínimo e acesso ao módulo de origem; a origem pode ter revisões posteriores. Avaliações/agenda não ganham snapshots corporais pela comunicação. Se a fonte desaparecer, mostrar indisponibilidade, sem ressuscitar cópia.

## Avisos e pendências

Avisos internos são projeções de fatos atuais: check-in recebido aguardando revisão (com solicitação de conversa quando existente), atendimento nas próximas 24 horas, presença pendente nos últimos 7 dias e contrato ativo vencendo em até 7 dias civis de São Paulo. Não mostram conteúdo de saúde, respostas, local/notas ou valores. Chaves determinísticas por fato/revisão impedem repetição. Leitura persistida é somente do profissional; revisão iniciada não renotifica a mesma resposta, correção recebida gera nova revisão. Quando a condição deixa de existir, o aviso sai da lista, mantendo o histórico canônico na origem. Atualização é consulta explícita; nenhum scheduler, polling global, push ou envio externo novo.

Pendências reutilizam tarefas/serviços/idempotência/auditoria do CRM: criar no contexto do aluno e concluir, com acesso ao módulo completo para outras operações. Não existe segunda fila, movimento automático de etapa, obrigação contratual ou confirmação de entrega.

## Indicadores e limites

Contatos externos declarados e textos preparados no período (padrão 90 dias, até 367 datas por consulta), correções contadas uma vez. Pendências CRM e avisos não lidos refletem o estado atual. Alunos ativos sem contato declarado nos últimos 30 dias incluem quem nunca teve registro; preparar texto não altera esse indicador. Não inferir qualidade do acompanhamento, abandono, diagnóstico, execução de treino, pagamento ou taxas de resposta/entrega/leitura.

Mensageria bidirecional, identidade do aluno/Connect, anexos, e-mail profissional, WhatsApp e push são futuros, não funcionalidades disponíveis. SMTP de conta permanece exclusivo de autenticação. [Privacidade](../privacidade/comunicacao.md) e [operação](../operacao/comunicacao.md) mantêm os gates produtivos e a recuperação016.

## Evolução visual e operacional — 06/11/2026

[Relatório e manifesto](../engenharia/redesign-comunicacao-2026-11.md). Visão geral alinhada à referência do fundador: seis abas principais (Visão geral, Contatos, Comunicados, Modelos, Automações, Histórico), com Caixa de entrada, Notificações, Pendências e Indicadores acessíveis em Mais áreas e no seletor mobile. Toda a largura do shell, métricas compactas e coluna lateral de prioridades/modelos. Chat exclusivamente visual e desativado. Comunicados são textos individuais preparados, sem envio. Agendamento e automações externas indisponíveis até canal profissional homologado. Modelos podem ser duplicados e usados na preparação. Variáveis novas: aluno.primeiroNome e compromisso.data/hora, estas exigem contexto Agenda autorizado e versão exata. Histórico geral paginado, detalhes privados por aluno. Limites e evidências no relatório; produção segue NO-GO.
