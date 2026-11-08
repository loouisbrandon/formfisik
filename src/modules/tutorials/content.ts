// Curated functional content. No internal documents or runtime data are imported.
export type Tutorial={slug:string;category:string;title:string;description:string;purpose:string;steps:{title:string;text:string;details?:string[]}[];important:string;tip:string;href:string;action:string;related:string[];updated:string;status:'published'}
export const categories=[
{id:'primeiros-passos',label:'Primeiros passos',description:'Prepare sua conta e conheça a plataforma.',icon:'rocket'},
{id:'dashboard',label:'Dashboard',description:'Consulte os destaques da sua operação.',icon:'dashboard'},
{id:'alunos',label:'Gestão de alunos',description:'Organize sua carteira e os perfis dos alunos.',icon:'users'},
{id:'treinos',label:'Treinos',description:'Prescreva fichas e organize modelos.',icon:'dumbbell'},
{id:'exercicios',label:'Exercícios',description:'Encontre e cadastre movimentos.',icon:'layers'},
{id:'acompanhamento',label:'Acompanhamento',description:'Consulte avaliações e medidas registradas.',icon:'activity'},
{id:'agenda',label:'Agenda',description:'Organize disponibilidade e compromissos.',icon:'calendar'},
{id:'anamneses',label:'Anamneses',description:'Prepare formulários e revise respostas.',icon:'clipboard'},
{id:'videos',label:'Vídeos',description:'Associe demonstrações aos exercícios.',icon:'play'},
{id:'consultorias',label:'Consultorias',description:'Organize serviços, planos e contratações.',icon:'briefcase'},
{id:'checkins',label:'Check-ins',description:'Solicite relatos e registre devolutivas.',icon:'check'},
{id:'financeiro',label:'Financeiro',description:'Controle cobranças e recebimentos.',icon:'credit'},
{id:'crm',label:'CRM',description:'Acompanhe etapas e tarefas.',icon:'workflow'},
{id:'comunicacao',label:'Comunicação',description:'Registre contatos e prepare textos.',icon:'messages'},
{id:'indicadores',label:'Indicadores',description:'Entenda os números registrados na operação.',icon:'chart'},
{id:'configuracoes',label:'Configurações',description:'Encontre conta, assinatura e preferências.',icon:'settings'},
] as const
const publish=(t:Omit<Tutorial,'updated'|'status'>):Tutorial=>({...t,updated:'2026-11-06',status:'published'})
export const tutorials:Tutorial[]=[
publish({
  "slug": "primeiros-passos",
  "category": "primeiros-passos",
  "title": "Comece a usar a FormFisik",
  "description": "Um guia prático para preparar sua conta e iniciar o atendimento.",
  "purpose": "Conheça a sequência básica para organizar sua carteira e acessar os módulos de gestão.",
  "steps": [
    {
      "title": "Confira sua conta e o acesso",
      "text": "Comece por Minha conta e Minha assinatura. Confirmação do cadastro, assinatura e cadastro de alunos são operações diferentes.",
      "details": [
        "Confirme seu e-mail pelo link recebido. Caso não consiga entrar, use a recuperação de senha; não crie outra conta apenas para contornar o acesso.",
        "Consulte a situação exibida na assinatura antes de iniciar o atendimento. Uma solicitação de contratação ainda pode depender de confirmação."
      ]
    },
    {
      "title": "Prepare seu perfil e sua segurança",
      "text": "Em Configurações, revise a apresentação profissional, os dados privados e os recursos de proteção da conta.",
      "details": [
        "Confira quais campos serão públicos antes de publicar o perfil. CPF, endereço e e-mail da conta não fazem parte da apresentação pública.",
        "Mantenha acesso ao e-mail cadastrado. Trocas de senha ou e-mail podem encerrar sessões e exigir um novo login."
      ]
    },
    {
      "title": "Organize sua primeira carteira",
      "text": "Cadastre um aluno com as informações administrativas necessárias ou avalie a importação quando já possuir uma carteira organizada.",
      "details": [
        "Pesquise antes de cadastrar para evitar duplicidades. Contatos e nascimento devem representar dados conhecidos, sem preenchimentos presumidos.",
        "Na importação, confira a prévia e o mapeamento das colunas antes de confirmar; importar não cria acesso do aluno ao aplicativo."
      ]
    },
    {
      "title": "Conheça o aluno pelo formulário",
      "text": "Prepare uma anamnese adequada, publique a versão e gere o convite individual para o destinatário correto.",
      "details": [
        "Compartilhe o link somente pelo canal combinado. Gerar um convite não significa que ele foi enviado automaticamente.",
        "Quando chegar a resposta, revise o conteúdo antes de definir o acompanhamento. Mudanças no modelo não reescrevem respostas anteriores."
      ]
    },
    {
      "title": "Defina o serviço e a rotina",
      "text": "Quando houver contratação, registre o serviço, o plano, a vigência e as entregas acordadas. Depois organize horários na Agenda.",
      "details": [
        "Plano de atendimento do aluno e assinatura FormFisik Pro têm finalidades e pagamentos distintos.",
        "Configure disponibilidade e tipos de sessão antes dos atendimentos. Criar uma contratação não preenche automaticamente o calendário."
      ]
    },
    {
      "title": "Prepare o treino e as demonstrações",
      "text": "Use o catálogo para montar a ficha individual ou aplicar um modelo. Confira séries, orientações e vídeos antes de ativar.",
      "details": [
        "Modelos geram cópias independentes: personalize cada ficha e confira o aluno escolhido.",
        "Salve alterações explicitamente. Um rascunho incompleto não deve ser apresentado como treino pronto para uso."
      ]
    },
    {
      "title": "Acompanhe e registre a operação",
      "text": "Registre avaliações, solicite check-ins e mantenha tarefas e contatos organizados nos módulos próprios.",
      "details": [
        "Avaliação é um registro profissional; check-in é um relato do aluno. Use cada informação de acordo com sua origem.",
        "Registre recebimentos efetivos no Financeiro. Agendar, contratar ou concluir uma tarefa não significa receber um pagamento."
      ]
    },
    {
      "title": "Confira os resultados e a próxima ação",
      "text": "Use Dashboard e Indicadores para localizar pendências, verificar os registros de origem e planejar o próximo atendimento.",
      "details": [
        "Confira período e filtros antes de comparar números. Uma carteira sem registros ainda não permite concluir tendência ou adesão.",
        "Se uma função estiver indisponível, leia o aviso e preserve seu trabalho antes de tentar novamente. Os tutoriais explicam o fluxo, mas não ativam integrações externas."
      ]
    }
  ],
  "important": "O plano único é FormFisik Pro, por R$ 139,90 mensais. O teste é de 30 dias, com cartão obrigatório e cobrança ao final salvo cancelamento anterior, quando o fluxo de contratação estiver disponível. A disponibilidade é informada na própria assinatura.",
  "tip": "Comece com um aluno e organize os dados necessários antes de ampliar sua carteira.",
  "href": "/configuracoes",
  "action": "Ir para Configurações",
  "related": [
    "gerenciar-alunos",
    "criar-treino",
    "utilizar-agenda"
  ]
}),
publish({
  "slug": "entender-dashboard",
  "category": "dashboard",
  "title": "Como utilizar o Dashboard",
  "description": "Acompanhe sua operação e seus alunos em um só lugar.",
  "purpose": "A visão geral reúne números e atalhos para orientar a próxima ação profissional.",
  "steps": [
    {
      "title": "Localize os destaques da operação",
      "text": "Abra o Dashboard e identifique os cartões e atalhos que resumem sua carteira e sua rotina.",
      "details": [
        "A tela apresenta informações do profissional conectado. Confira sua conta se os registros esperados não aparecerem.",
        "Os números são resumos: abra o módulo de origem para interpretar um caso específico."
      ]
    },
    {
      "title": "Leia o significado dos cartões",
      "text": "Confira a descrição de cada indicador para entender se ele conta alunos, fichas, avaliações ou valores financeiros.",
      "details": [
        "Uma pessoa pode ter vários registros e contratos. Quantidade de contratos não é necessariamente quantidade de alunos.",
        "Valor contratado, valor previsto e valor recebido têm significados diferentes; não os some como se fossem a mesma receita."
      ]
    },
    {
      "title": "Revise a agenda do período",
      "text": "Consulte os compromissos apresentados e abra a Agenda para verificar data, horário e situação.",
      "details": [
        "Agendado não significa realizado. Comparecimento precisa de registro explícito no atendimento.",
        "Se precisar reagendar ou cancelar, use o detalhe do compromisso e revise o alcance da alteração."
      ]
    },
    {
      "title": "Identifique quem precisa de atenção",
      "text": "Use os destaques e acessos aos alunos para conferir as pendências existentes no acompanhamento.",
      "details": [
        "Ausência de avaliação ou resposta pode indicar falta de registro, não necessariamente falta de participação.",
        "Abra a ficha para conferir o histórico antes de decidir qual contato ou tarefa criar."
      ]
    },
    {
      "title": "Retome o trabalho no módulo correto",
      "text": "Use os atalhos para abrir alunos, treinos, acompanhamento ou outras áreas relacionadas.",
      "details": [
        "Faça a edição no módulo responsável pelo registro. O resumo do Dashboard não substitui a ficha, a contratação ou o histórico financeiro.",
        "Quando houver um aviso de acesso ou de dependência indisponível, siga a orientação apresentada em vez de duplicar registros."
      ]
    },
    {
      "title": "Confira a origem dos valores",
      "text": "Ao consultar recebimentos, confirme a origem e a situação no Financeiro antes de usar o número em decisões comerciais.",
      "details": [
        "Recebimento externo é informado pelo profissional; um registro manual não constitui confirmação bancária.",
        "A assinatura que você paga à FormFisik é separada dos valores que seus alunos pagam pelos seus serviços."
      ]
    },
    {
      "title": "Aprofunde a análise em Indicadores",
      "text": "Para comparar períodos ou entender denominadores, abra Indicadores e selecione a visão desejada.",
      "details": [
        "Mantenha os mesmos critérios de comparação. Filtros diferentes podem explicar números distintos entre telas.",
        "Não interprete indicadores operacionais como diagnóstico de saúde ou garantia de resultado físico."
      ]
    },
    {
      "title": "Transforme a consulta em uma ação",
      "text": "Depois de conferir a origem da pendência, registre a próxima ação na Agenda, no CRM ou no módulo correspondente.",
      "details": [
        "Uma tarefa concluída descreve sua organização de trabalho; não substitui presença, entrega contratual ou confirmação de pagamento.",
        "Volte à visão geral após salvar para acompanhar as informações atualizadas."
      ]
    }
  ],
  "important": "A tela usa dados da sua operação. Ausência de registros não significa erro, nem comprova falta de adesão do aluno. Valores previstos ou contratados não equivalem a pagamentos recebidos.",
  "tip": "Use os atalhos para conferir a origem de cada informação.",
  "href": "/dashboard",
  "action": "Ir para Dashboard",
  "related": [
    "gerenciar-alunos",
    "interpretar-indicadores"
  ]
}),
publish({
  "slug": "gerenciar-alunos",
  "category": "alunos",
  "title": "Como gerenciar seus alunos",
  "description": "Organize seus alunos e acompanhe cada etapa do atendimento.",
  "purpose": "A carteira reúne o cadastro administrativo e os acessos aos registros do acompanhamento de cada aluno.",
  "steps": [
    {
      "title": "Pesquise sua carteira antes de cadastrar",
      "text": "Em Alunos, procure pelo nome e confira também os arquivados quando houver dúvida sobre um cadastro existente.",
      "details": [
        "Use os filtros de situação e ordenação e confirme sua aplicação. A lista é paginada: confira as próximas páginas.",
        "Nomes iguais podem representar pessoas diferentes. Confira os contatos disponíveis antes de confirmar um possível cadastro duplicado."
      ]
    },
    {
      "title": "Cadastre os dados administrativos",
      "text": "Escolha Cadastrar aluno, informe o nome e complete somente os contatos e a data de nascimento que você conhece.",
      "details": [
        "Revise os campos indicados como inválidos. Nome é obrigatório; dados opcionais não devem ser inventados para completar o formulário.",
        "Use observações administrativas para organização do atendimento. Informações de saúde e objetivos detalhados pertencem aos módulos apropriados."
      ]
    },
    {
      "title": "Confira o perfil e os acessos relacionados",
      "text": "Após salvar, abra o perfil para consultar os dados e os atalhos para treinos, avaliações, agenda e demais registros.",
      "details": [
        "Verifique o aluno selecionado antes de criar uma ficha ou compartilhar um formulário.",
        "O cadastro da carteira é privado e não cria conta, senha, assinatura ou acesso ao aplicativo para o aluno."
      ]
    },
    {
      "title": "Edite com conferência do histórico",
      "text": "Use Editar para corrigir dados e salve explicitamente. Consulte o histórico quando precisar entender mudanças administrativas.",
      "details": [
        "Se outra edição tiver sido salva, recarregue e confira a versão atual antes de reaplicar suas alterações.",
        "Não cadastre a mesma pessoa novamente apenas para corrigir um telefone ou e-mail."
      ]
    },
    {
      "title": "Solicite a anamnese e acompanhe a revisão",
      "text": "Gere um convite com a versão publicada do formulário e acompanhe a solicitação no contexto do aluno.",
      "details": [
        "Confira destinatário e canal antes de compartilhar o link privado. O sistema não presume o envio por você.",
        "Leia e revise as respostas no módulo de Anamneses; notas administrativas não substituem essa revisão."
      ]
    },
    {
      "title": "Organize o acompanhamento individual",
      "text": "Prepare a prescrição, registre avaliações, atribua check-ins e consulte a agenda do aluno pelos atalhos disponíveis.",
      "details": [
        "Cada módulo preserva seus próprios registros e versões. Um cadastro não gera automaticamente treino, avaliação ou cobrança.",
        "Antes de alterar um atendimento em andamento, confira também serviços contratados, tarefas e pendências relacionadas."
      ]
    },
    {
      "title": "Arquive ou reative quando necessário",
      "text": "Arquive cadastros que saíram da rotina ativa e use o filtro de arquivados para consultar ou reativar depois.",
      "details": [
        "Arquivar preserva o histórico; não é exclusão definitiva. Algumas novas operações ficam bloqueadas enquanto o vínculo estiver arquivado.",
        "Reative o cadastro existente para retomar o atendimento, preservando a continuidade dos registros."
      ]
    },
    {
      "title": "Exporte ou importe com revisão",
      "text": "Use a exportação administrativa quando precisar consultar os dados fora da plataforma. Para trazer uma carteira, acesse Importar dados em Configurações.",
      "details": [
        "Confira os filtros aplicados antes de exportar e proteja o documento baixado. Ele não equivale a uma exportação completa de todos os dados do aluno.",
        "Na importação, revise colunas, prévia e possíveis duplicidades. Cancelar após um lote não apaga os alunos que já foram importados."
      ]
    }
  ],
  "important": "Use observações administrativas somente para essa finalidade; objetivos e informações de saúde pertencem aos formulários e módulos próprios. Cadastrar um aluno não cria uma conta de acesso, assinatura ou pagamento para ele. Arquivar preserva o histórico e pode impedir novas alterações até a reativação.",
  "tip": "Mantenha os dados dos seus alunos sempre atualizados.",
  "href": "/alunos",
  "action": "Ir para Alunos",
  "related": [
    "criar-anamnese",
    "criar-treino",
    "acompanhar-evolucao"
  ]
}),
publish({
  "slug": "criar-treino",
  "category": "treinos",
  "title": "Como criar e organizar um treino",
  "description": "Prepare fichas individuais e modelos reutilizáveis.",
  "purpose": "O editor organiza divisões, exercícios e séries em uma prescrição com histórico de versões.",
  "steps": [
    {
      "title": "Escolha ficha individual ou modelo",
      "text": "Em Treinos, use Criar treino e defina se a estrutura pertence a um aluno ou será um modelo reutilizável.",
      "details": [
        "A ficha individual exige aluno ativo da sua carteira. Confira o destinatário: o tipo e o aluno não são trocados livremente depois.",
        "Pesquise fichas existentes antes de criar outra. Um modelo não é uma prescrição ativa para todos os alunos."
      ]
    },
    {
      "title": "Defina objetivo e organização",
      "text": "Dê um nome identificável, registre o objetivo e organize as divisões de acordo com o planejamento profissional.",
      "details": [
        "Use descrições e observações para orientar o uso da divisão. Datas individuais devem representar o período real planejado.",
        "Salve o rascunho ao longo da preparação. O editor avisa sobre alterações não salvas, mas não oferece recuperação offline de um fechamento forçado."
      ]
    },
    {
      "title": "Selecione exercícios do catálogo",
      "text": "Pesquise por nome, músculos e equipamentos e confirme os exercícios que serão incluídos na divisão escolhida.",
      "details": [
        "Confira as instruções e a versão do exercício. Se precisar de um movimento próprio, cadastre um exercício particular na biblioteca.",
        "Para repetir intencionalmente um movimento com parâmetros diferentes, use a duplicação da ocorrência e revise os campos."
      ]
    },
    {
      "title": "Preencha séries e parâmetros",
      "text": "Informe repetições, faixa, duração ou outra opção disponível e ajuste carga, unidade, descanso e notas quando necessários.",
      "details": [
        "Os valores não são prescritos automaticamente pela plataforma. Confira cada linha, especialmente depois de duplicar uma série.",
        "Cargas em unidades diferentes e valores por lado precisam de orientação clara. Não deixe a interpretação depender apenas do nome do exercício."
      ]
    },
    {
      "title": "Organize técnicas e sequência",
      "text": "Use as opções disponíveis de técnica, agrupamento e movimento entre divisões para representar a prescrição planejada.",
      "details": [
        "Drop-set e rest-pause usam etapas; grupos como bi-set e circuito organizam exercícios. Confira a sequência e as validações apresentadas.",
        "Duplicar cria outra ocorrência; mover preserva a ocorrência existente. Revise confirmações ao remover itens que participam de grupos."
      ]
    },
    {
      "title": "Confira as demonstrações e a prévia",
      "text": "Abra os vídeos associados aos exercícios, escolha as demonstrações adequadas e revise a ficha inteira.",
      "details": [
        "Uma demonstração não substitui suas orientações de execução e segurança. Confira se a referência realmente corresponde ao exercício.",
        "As referências prescritas preservam sua versão, mas um vídeo revogado, removido ou bloqueado pelo provedor pode deixar de reproduzir."
      ]
    },
    {
      "title": "Ative com revisão da versão",
      "text": "Depois de salvar e conferir objetivo, divisões, exercícios e séries, use a ação de ativação.",
      "details": [
        "Há uma ficha individual ativa por aluno e profissional. Se já existir outra, revise o estado anterior antes de tentar ativar a nova.",
        "Salvar uma ficha ativa gera uma nova versão ativa completa; versões anteriores permanecem no histórico. Rascunho não é ficha final."
      ]
    },
    {
      "title": "Aplique modelos e gere documentos",
      "text": "Aplique um modelo aos alunos selecionados, personalize as cópias e use a exportação para visualizar ou baixar o documento.",
      "details": [
        "Alterar o modelo depois não atualiza silenciosamente as fichas aplicadas. Confira cada cópia antes de utilizá-la.",
        "Escolha o formato e as informações do PDF. A prévia e o download devem corresponder à versão desejada; proteja as cópias compartilhadas."
      ]
    }
  ],
  "important": "Rascunho não é prescrição ativa. Uma alteração posterior em um modelo não atualiza silenciosamente as fichas já aplicadas. Revise sempre a versão que será utilizada.",
  "tip": "Use modelos para reaproveitar a estrutura e personalize a ficha de cada aluno.",
  "href": "/treinos",
  "action": "Ir para Treinos",
  "related": [
    "cadastrar-exercicio",
    "associar-videos",
    "gerenciar-alunos"
  ]
}),
publish({
  "slug": "cadastrar-exercicio",
  "category": "exercicios",
  "title": "Como encontrar e cadastrar exercícios",
  "description": "Utilize o catálogo oficial e organize sua biblioteca particular.",
  "purpose": "A biblioteca fornece os movimentos utilizados na composição dos treinos.",
  "steps": [
    {
      "title": "Pesquise antes de criar",
      "text": "Abra Exercícios e busque pelo nome ou por nomes alternativos para verificar se o movimento já existe.",
      "details": [
        "Combine os filtros disponíveis de músculo, equipamento e categoria. Resultados são paginados.",
        "Nomes semelhantes podem descrever variações diferentes; confira os detalhes antes de selecionar."
      ]
    },
    {
      "title": "Confira a origem e a execução",
      "text": "Abra o exercício e diferencie conteúdo oficial dos exercícios particulares da sua biblioteca.",
      "details": [
        "Leia músculos, equipamento e orientações existentes. A presença no catálogo não define séries, carga ou adequação individual.",
        "Demonstrações podem complementar a consulta, mas sua seleção e a prescrição continuam sob responsabilidade profissional."
      ]
    },
    {
      "title": "Cadastre um exercício particular",
      "text": "Escolha Criar exercício e preencha o nome, a classificação e as informações exigidas para identificar o movimento.",
      "details": [
        "Use um nome claro, evitando duplicar um movimento já existente apenas por uma abreviação pessoal.",
        "Campos de classificação devem corresponder às opções do formulário; não invente informação para contornar uma validação."
      ]
    },
    {
      "title": "Descreva orientações úteis",
      "text": "Registre instruções que ajudem a reconhecer a execução e distingam a variação cadastrada.",
      "details": [
        "Prefira instruções objetivas sobre posição, movimento e cuidados relevantes, sem prometer resultados.",
        "Parâmetros individuais como carga, repetições e descanso devem ser definidos no treino, não tratados como regra universal do exercício."
      ]
    },
    {
      "title": "Adicione demonstrações autorizadas",
      "text": "Associe uma referência do YouTube ou um vídeo próprio disponível na biblioteca de Vídeos.",
      "details": [
        "Cole somente a URL do YouTube; não insira HTML ou código de iframe. Confira a prévia e o exercício associado.",
        "Não baixe vídeos de terceiros para reenviá-los como seus. Um link público não demonstra autorização para copiar o conteúdo."
      ]
    },
    {
      "title": "Edite e organize seus registros",
      "text": "Em Meus exercícios, abra seus itens para editar informações ou arquivar os que não serão mais utilizados.",
      "details": [
        "Exercícios oficiais e particulares têm permissões diferentes. Você não edita o catálogo oficial como se fosse seu registro privado.",
        "Versões usadas anteriormente em prescrições são preservadas. Uma atualização no cadastro não deve reescrever o histórico de treinos."
      ]
    },
    {
      "title": "Envie uma sugestão ao catálogo",
      "text": "Quando a opção estiver disponível, solicite a inclusão do exercício no catálogo oficial e acompanhe a revisão.",
      "details": [
        "Salvar um particular não o torna oficial. A publicação depende de moderação e pode exigir ajustes.",
        "Evite incluir dados pessoais ou materiais sem direitos de uso na solicitação."
      ]
    },
    {
      "title": "Use a biblioteca no planejamento",
      "text": "Volte ao editor de Treinos e selecione o exercício correto para a divisão desejada.",
      "details": [
        "Confira as referências e preencha os parâmetros do aluno. Cadastrar ou selecionar um exercício não cria uma prescrição automaticamente.",
        "Se o item estiver arquivado, confira o motivo e as ações permitidas antes de tentar usá-lo em uma nova ficha."
      ]
    }
  ],
  "important": "Um exercício particular não se torna oficial ao ser salvo. A biblioteca não gera prescrição ou parâmetros de treino automaticamente.",
  "tip": "Use nomes claros e instruções adequadas ao movimento.",
  "href": "/exercicios",
  "action": "Ir para Exercícios",
  "related": [
    "criar-treino",
    "associar-videos"
  ]
}),
publish({
  "slug": "acompanhar-evolucao",
  "category": "acompanhamento",
  "title": "Como acompanhar a evolução física",
  "description": "Registre avaliações e consulte medidas ao longo do tempo.",
  "purpose": "O acompanhamento organiza as avaliações registradas pelo profissional e suas comparações.",
  "steps": [
    {
      "title": "Abra o acompanhamento do aluno",
      "text": "Pesquise o aluno em Acompanhamento ou use o acesso pelo seu perfil. Confira a identidade antes de registrar medidas.",
      "details": [
        "A visão individual reúne registros do aluno selecionado. Não reutilize avaliações de outra pessoa como ponto de partida.",
        "Ausência de registros deve permanecer explícita, sem valores de exemplo tratados como dados reais."
      ]
    },
    {
      "title": "Registre a avaliação com a data correta",
      "text": "Escolha Registrar avaliação, informe a data efetiva e preencha as medidas disponíveis para aquele atendimento.",
      "details": [
        "Registros parciais são permitidos. Não use zero para substituir uma medida que não foi coletada.",
        "Confira unidades, separadores decimais e valores antes de salvar. A data representa a avaliação, não apenas o dia da digitação."
      ]
    },
    {
      "title": "Revise e corrija pelo registro",
      "text": "Abra o detalhe para conferir o conteúdo salvo e use a edição quando houver uma correção necessária.",
      "details": [
        "O histórico permite distinguir versões. Se houver conflito com outra edição, consulte o estado atual antes de salvar novamente.",
        "Arquivar uma avaliação preserva o histórico e retira o registro das comparações automáticas; não equivale a apagar definitivamente."
      ]
    },
    {
      "title": "Navegue pelas datas e pelos períodos",
      "text": "Use calendário, listas e filtros para localizar os registros relevantes e limitar o período de consulta.",
      "details": [
        "Confira páginas adicionais quando o histórico tiver muitos registros. Uma página vazia ou um período curto não apaga dados antigos.",
        "Registros de avaliações e fotografias podem existir em datas diferentes; não presuma que toda foto tenha uma avaliação correspondente."
      ]
    },
    {
      "title": "Compare medidas registradas",
      "text": "Selecione o indicador ou os registros desejados e consulte os gráficos e comparações disponíveis.",
      "details": [
        "Compare medições equivalentes e confira as datas. Campos ausentes não devem ser interpretados como queda ou crescimento.",
        "Gráficos organizam registros, mas não produzem diagnóstico nem justificam, sozinhos, uma alteração clínica ou de prescrição."
      ]
    },
    {
      "title": "Adicione fotografias com autorização",
      "text": "Na área de Fotografias, confira a autorização e a disponibilidade do armazenamento antes de enviar imagens.",
      "details": [
        "Use apenas imagens pertinentes ao acompanhamento e respeite as validações de arquivo. Falha de upload não representa envio concluído.",
        "Foto é privada. Não a compartilhe fora da finalidade combinada apenas porque ela está disponível no cadastro."
      ]
    },
    {
      "title": "Compare ou remova imagens com cuidado",
      "text": "Confira datas e imagens selecionadas na comparação e use a ação de remoção quando for necessário revogar o acesso.",
      "details": [
        "Remoção bloqueia o acesso conforme o fluxo disponível; a limpeza física pode exigir processamento. Arquivar um registro é outra operação.",
        "Uma cópia já baixada ou enviada por você exige cuidado próprio de armazenamento e descarte."
      ]
    },
    {
      "title": "Prepare um relatório coerente",
      "text": "Use a exportação de acompanhamento, escolha o período e confira a prévia do relatório antes de baixar.",
      "details": [
        "Inclua fotografias somente quando houver autorização específica para esse uso e confira as opções selecionadas.",
        "Explique lacunas e limitações ao compartilhar. O PDF não transforma medições em diagnóstico nem substitui a revisão profissional."
      ]
    }
  ],
  "important": "Medidas registradas não constituem diagnóstico. Avaliações arquivadas deixam as comparações automáticas, mas o histórico é preservado. Fotos privadas dependem da autorização e da disponibilidade do armazenamento.",
  "tip": "Compare dados realmente registrados e confira as datas das avaliações.",
  "href": "/acompanhamento",
  "action": "Ir para Acompanhamento",
  "related": [
    "gerenciar-alunos",
    "atribuir-checkin"
  ]
}),
publish({
  "slug": "utilizar-agenda",
  "category": "agenda",
  "title": "Como utilizar a Agenda",
  "description": "Organize horários, disponibilidade e atendimentos.",
  "purpose": "A agenda reúne seus compromissos, bloqueios e disponibilidade profissional.",
  "steps": [
    {
      "title": "Defina disponibilidade e fuso",
      "text": "Em Disponibilidade, configure o fuso e as faixas de atendimento por dia da semana, incluindo os intervalos necessários.",
      "details": [
        "Sem faixas cadastradas, atendimentos podem ser recusados por falta de disponibilidade. Confira exceções que substituem a regra de uma data.",
        "Mudar disponibilidade não cancela compromissos existentes. Um horário verde representa uma faixa configurada, não garantia de vaga livre."
      ]
    },
    {
      "title": "Prepare os tipos de sessão",
      "text": "Cadastre os tipos de atendimento com nome, duração, modalidade, local opcional e intervalos de preparação.",
      "details": [
        "Escolha um tipo ativo ao agendar. Alterações no tipo não reescrevem os dados históricos das sessões já reservadas.",
        "Evite inserir dados sensíveis na descrição reutilizável; confira o detalhe privado do compromisso quando precisar de contexto."
      ]
    },
    {
      "title": "Abra o novo agendamento no calendário",
      "text": "Use Novo agendamento ou clique numa data ou horário para abrir o modal e revisar os campos preenchidos.",
      "details": [
        "Selecione aluno e tipo quando for atendimento. Um compromisso pessoal segue o fluxo sem aluno.",
        "Confira início, término, modalidade e local. Nas visões Dia, Semana e Mês, use os controles de período para localizar a data correta."
      ]
    },
    {
      "title": "Registre bloqueios e exceções",
      "text": "Escolha Bloqueio para reservar um período indisponível ou Disponibilidade para ajustar uma data específica.",
      "details": [
        "Use um nome que permita reconhecer o bloqueio, sem informações pessoais desnecessárias. Confira também a data final em períodos mais longos.",
        "Uma exceção por data substitui as faixas daquela data; não é uma faixa adicional somada automaticamente à semana."
      ]
    },
    {
      "title": "Revise conflitos e recorrências",
      "text": "Em Mais opções, configure a repetição quando necessária e leia a prévia antes de confirmar a gravação.",
      "details": [
        "Confira todas as ocorrências e os avisos de disponibilidade, intervalos ou sobreposição. O aceite de revisão não autoriza forçar um conflito.",
        "Recorrência mensal pode pular meses sem o dia escolhido. Revise as datas apresentadas, inclusive o término da sequência."
      ]
    },
    {
      "title": "Mova ou edite com confirmação",
      "text": "Clique no cartão para abrir o detalhe em modal. Na grade diária ou semanal, arraste a ocorrência até a data e hora desejadas.",
      "details": [
        "O cartão e o destaque indicam o destino; a mudança só é gravada após revisão e confirmação. Informe justificativa quando o fluxo exigir.",
        "Em recorrências, confira se a alteração afeta uma ocorrência ou esta e futuras. Compromissos passados ou finalizados não podem ser remarcados livremente."
      ]
    },
    {
      "title": "Cancele ou registre comparecimento",
      "text": "No detalhe, use a operação correspondente ao que aconteceu: cancelar, registrar realização ou registrar ausência.",
      "details": [
        "O relógio não registra presença. Uma correção de situação final pode exigir motivo e nova confirmação.",
        "Realizar uma sessão não confirma pagamento nem cumpre automaticamente uma entrega de consultoria. Confira a confirmação contratual específica quando existir."
      ]
    },
    {
      "title": "Confira histórico e calendário completo",
      "text": "Use Histórico e a lista de compromissos para consultar mudanças, filtros e registros além da página carregada.",
      "details": [
        "Se a grade avisar que há mais registros, navegue pelas páginas antes de concluir que um horário está livre.",
        "Sincronização com Google, Outlook ou iCloud não está disponível nesse fluxo. A Agenda da FormFisik é a referência para os registros feitos nela."
      ]
    }
  ],
  "important": "Alterar disponibilidade não cancela reservas existentes. Confirmar um horário não comprova comparecimento e não gera cobrança automática.",
  "tip": "Confira o fuso horário e os intervalos entre atendimentos.",
  "href": "/agenda",
  "action": "Ir para Agenda",
  "related": [
    "organizar-consultorias",
    "gerenciar-alunos"
  ]
}),
publish({
  "slug": "criar-anamnese",
  "category": "anamneses",
  "title": "Como criar e solicitar uma anamnese",
  "description": "Prepare formulários e revise as respostas dos alunos.",
  "purpose": "A anamnese coleta informações necessárias ao atendimento por formulário individual.",
  "steps": [
    {
      "title": "Escolha um modelo ou crie um formulário",
      "text": "Em Anamneses, abra a área de modelos e escolha uma estrutura adequada ou crie um novo formulário.",
      "details": [
        "Um modelo padrão pode ser ponto de partida; adapte perguntas à finalidade do atendimento, sem solicitar dados por mera conveniência.",
        "Confira se está editando o rascunho correto. Arquivar um modelo não equivale a apagar respostas anteriores."
      ]
    },
    {
      "title": "Organize as seções do atendimento",
      "text": "Nomeie formulário e seções de forma clara e distribua as perguntas por assunto.",
      "details": [
        "Use seções para dar contexto ao aluno, como rotina e objetivos. Evite um bloco longo com perguntas sem relação entre si.",
        "As configurações laterais correspondem à seção escolhida. Confira a seleção antes de mudar o título."
      ]
    },
    {
      "title": "Configure perguntas e alternativas",
      "text": "Use Adicionar pergunta e o lápis de edição para definir título, instrução, tipo de resposta e obrigatoriedade.",
      "details": [
        "Escolha entre texto, seleção, sim/não, número, escala, data ou bloco informativo conforme a informação necessária.",
        "Em perguntas de seleção, revise todas as alternativas. Limites numéricos precisam representar o dado esperado; não configuram diagnóstico automático."
      ]
    },
    {
      "title": "Reordene pela alça e revise condições",
      "text": "Arraste pela alça lateral para mudar a posição da pergunta dentro da seção. Pelo teclado, foque a alça e use as setas.",
      "details": [
        "O destaque mostra a posição de destino; Escape cancela o arraste. A nova ordem precisa ser salva no rascunho.",
        "Uma pergunta condicional deve vir depois daquela da qual depende. O sistema impede inversões que invalidem a condição, sem apagar a regra."
      ]
    },
    {
      "title": "Teste a prévia e publique a versão",
      "text": "Abra a prévia do aluno e confira texto, ordem, campos obrigatórios e condições. Depois salve e publique a versão a usar.",
      "details": [
        "Salvar rascunho e publicar são ações distintas. A publicação identifica uma versão; alterações posteriores não modificam o que já foi respondido.",
        "Teste também respostas que escondem perguntas condicionais para conferir se a sequência faz sentido."
      ]
    },
    {
      "title": "Gere o convite individual",
      "text": "Selecione o aluno ou o fluxo de novo aluno e a versão publicada, gere o convite e confira o link.",
      "details": [
        "Compartilhe pelo canal combinado e verifique o destinatário. O link é privado e temporário; não publique em grupos ou páginas abertas.",
        "Gerar o link não envia WhatsApp ou e-mail automaticamente. Não trate o convite como uma conta de acesso do aluno."
      ]
    },
    {
      "title": "Acompanhe solicitações e revise respostas",
      "text": "Use os filtros de Solicitações, abra a resposta recebida e registre a revisão profissional.",
      "details": [
        "Confira o formulário e sua versão antes de interpretar as respostas. O acompanhamento da solicitação não substitui a leitura do conteúdo.",
        "O aluno envia um relato; a revisão não produz diagnóstico automático nem modifica silenciosamente o treino."
      ]
    },
    {
      "title": "Preserve histórico e corrija pelo fluxo certo",
      "text": "Para uma nova coleta ou correção que exija outro preenchimento, gere uma nova solicitação e preserve a anterior.",
      "details": [
        "Respostas enviadas não ficam livremente editáveis. Uma versão nova do modelo não reescreve a resposta antiga.",
        "Se o convite estiver inválido, expirado ou revogado, confira sua situação e gere outro pelo fluxo disponível, em vez de reutilizar um link de outra pessoa."
      ]
    }
  ],
  "important": "O link é privado e temporário. Publicar uma nova versão não altera respostas anteriores. Não existe envio automático por WhatsApp ou e-mail nesse fluxo.",
  "tip": "Peça apenas as informações necessárias e confira o destinatário antes de compartilhar o link.",
  "href": "/anamneses",
  "action": "Ir para Anamneses",
  "related": [
    "gerenciar-alunos",
    "atribuir-checkin"
  ]
}),
publish({
  "slug": "associar-videos",
  "category": "videos",
  "title": "Como associar vídeos aos exercícios",
  "description": "Organize demonstrações disponíveis na sua biblioteca.",
  "purpose": "Demonstrações ajudam a apresentar o movimento sem substituir as instruções da prescrição.",
  "steps": [
    {
      "title": "Localize a demonstração adequada",
      "text": "Em Vídeos, pesquise por título ou exercício e refine por origem, biblioteca e situação disponíveis.",
      "details": [
        "Diferencie biblioteca oficial de conteúdo particular. A presença de um vídeo particular não o publica para outros profissionais.",
        "Confira o exercício associado antes de reproduzir ou incluir a demonstração num planejamento."
      ]
    },
    {
      "title": "Adicione uma URL do YouTube",
      "text": "Cole o link na opção de YouTube e confira a prévia oficial. Upload próprio só funciona quando o canal de armazenamento estiver disponível.",
      "details": [
        "Use a URL do vídeo, incluindo links watch, youtu.be ou shorts válidos; não cole HTML ou iframe. Não é preciso baixar nem hospedar esse vídeo.",
        "Informe título e descrição úteis quando necessário. A incorporação respeita restrições do YouTube e do responsável pelo conteúdo."
      ]
    },
    {
      "title": "Prepare seus vídeos próprios",
      "text": "Para upload, selecione o exercício e um arquivo permitido e confira os limites de tamanho, duração e quota apresentados.",
      "details": [
        "Use conteúdo próprio ou licenciado e tenha autorização das pessoas identificáveis. Não envie material de aluno sem finalidade e autorização adequadas.",
        "Se o upload estiver indisponível, não há envio concluído. A plataforma não oferece armazenamento ilimitado."
      ]
    },
    {
      "title": "Acompanhe envio e processamento",
      "text": "Depois do envio, aguarde a situação de processamento e confira se a demonstração está pronta para reprodução.",
      "details": [
        "Arquivo enviado e vídeo pronto são etapas diferentes. Em falhas ou resultado incerto, consulte a biblioteca antes de reenviar e consumir outra reserva.",
        "Transcodificação não comprova direitos autorais nem substitui revisão do conteúdo pelo profissional."
      ]
    },
    {
      "title": "Associe várias demonstrações",
      "text": "No exercício, organize os vídeos associados, escolha o principal e ajuste a ordenação conforme as opções disponíveis.",
      "details": [
        "Use referências que mostrem o movimento correto. Uma preferência particular para um exercício oficial não altera a biblioteca de todos.",
        "Salvar a associação é diferente de publicar o vídeo como oficial; revisão e permissões de publicação são próprias."
      ]
    },
    {
      "title": "Revise edição, substituição e arquivo",
      "text": "Edite os dados de seus vídeos ou use as ações de substituição, remoção de associação e arquivamento conforme a necessidade.",
      "details": [
        "Remover uma associação não equivale necessariamente a eliminar o arquivo hospedado. Confira a ação e sua confirmação.",
        "Prescrições anteriores preservam as referências versionadas, mas revogação ou indisponibilidade externa pode impedir a reprodução."
      ]
    },
    {
      "title": "Escolha a demonstração no treino",
      "text": "No editor de Treinos, abra as demonstrações do exercício e revise as referências que ficarão na versão prescrita.",
      "details": [
        "A ordenação da biblioteca não dispensa a conferência do treino. Verifique os vídeos selecionados antes de salvar ou ativar.",
        "Mantenha orientações técnicas por escrito: um vídeo é apoio e não substitui parâmetros e cuidados individuais."
      ]
    },
    {
      "title": "Trate indisponibilidade e direitos de uso",
      "text": "Se o player não abrir, confira se o vídeo foi removido, está privado ou tem incorporação bloqueada.",
      "details": [
        "YouTube pode exibir publicidade ou restringir a reprodução. Use a alternativa oferecida pelo player, quando existir, ou escolha outra referência autorizada.",
        "Não envie vídeos de terceiros sem autorização. Um link público não comprova licença para copiar, editar ou hospedar o material."
      ]
    }
  ],
  "important": "Não envie vídeos de terceiros sem autorização. YouTube pode ter publicidade ou restrições; um link não comprova licença. Vídeo revogado ou removido pode ficar indisponível em referências antigas.",
  "tip": "Mantenha a descrição da demonstração clara e confira o exercício associado.",
  "href": "/videos",
  "action": "Ir para Vídeos",
  "related": [
    "cadastrar-exercicio",
    "criar-treino"
  ]
}),
publish({
  "slug": "organizar-consultorias",
  "category": "consultorias",
  "title": "Como organizar serviços e consultorias",
  "description": "Gerencie ofertas, planos comerciais e contratações.",
  "purpose": "Consultorias reúne as condições comerciais que você oferece aos alunos e as entregas administrativas relacionadas.",
  "steps": [
    {
      "title": "Cadastre o serviço oferecido",
      "text": "Em Consultorias, defina o serviço, sua descrição e a forma de atendimento conforme o trabalho que você realiza.",
      "details": [
        "Separe a identificação do serviço das condições de cada plano. Um mesmo serviço pode ter opções comerciais distintas.",
        "Evite promessas de resultado garantido ou informações clínicas desnecessárias na descrição comercial."
      ]
    },
    {
      "title": "Monte os planos comerciais",
      "text": "Registre duração, valor e condições e configure as entregas que compõem o plano.",
      "details": [
        "Confira se os valores representam o total acordado e se a duração está na unidade correta.",
        "Plano comercial do aluno não é o plano FormFisik Pro. Criar um plano não gera uma cobrança ou assinatura da plataforma."
      ]
    },
    {
      "title": "Registre a contratação do aluno",
      "text": "Escolha aluno e versão do plano, revise início, vigência, valor acordado e as condições antes de confirmar.",
      "details": [
        "Confira possíveis sobreposições com contratos existentes. Uma confirmação explícita não deve ser dada sem revisar o contexto.",
        "A contratação guarda as condições da versão escolhida. Alterar o catálogo depois não reescreve o acordo já registrado."
      ]
    },
    {
      "title": "Revise e ative o acordo",
      "text": "Consulte a situação da contratação e use as transições disponíveis conforme o estágio real do atendimento.",
      "details": [
        "Rascunho e contratação ativa têm significados distintos. Ative somente após conferir as condições acordadas.",
        "O registro é administrativo; não comprova assinatura jurídica, liquidação bancária ou consentimento universal para tratamento de dados."
      ]
    },
    {
      "title": "Acompanhe as entregas combinadas",
      "text": "Abra Entregas para conferir o que está pendente, realizado ou precisa de atenção dentro da contratação.",
      "details": [
        "Criar um treino, avaliação ou agendamento não conclui sozinho uma obrigação. Confira a ação de execução e a evidência exigida.",
        "Uma entrega com quantidade pode ter execução parcial. Não marque todas as unidades se apenas uma foi realizada."
      ]
    },
    {
      "title": "Integre a rotina sem duplicar registros",
      "text": "Use os acessos para Agenda, Treinos, Anamneses e demais módulos vinculados ao aluno.",
      "details": [
        "Ao vincular sessão e entrega, confira se pertencem ao mesmo aluno e contrato. A realização contratual pode exigir confirmação adicional.",
        "Registrar uma execução administrativa não confirma automaticamente o recebimento do serviço."
      ]
    },
    {
      "title": "Renove ou encerre com histórico",
      "text": "Revise a contratação anterior e use renovação, suspensão, retomada ou cancelamento conforme as opções do detalhe.",
      "details": [
        "A renovação deve representar um novo período acordado. Confira a relação com o contrato anterior e as novas condições.",
        "Transições preservam histórico; não as use para corrigir silenciosamente valores ou execuções já registradas."
      ]
    },
    {
      "title": "Organize os recebimentos no Financeiro",
      "text": "Abra Financeiro para configurar cobranças da contratação e registrar pagamentos efetivamente recebidos.",
      "details": [
        "Valor contratado não é receita recebida. Confira o cronograma, o primeiro vencimento e a vigência antes de confirmar.",
        "Recebimentos externos podem ser usados sem conta Stripe conectada. Falta de pagamento não encerra automaticamente a contratação ou o acesso do aluno."
      ]
    }
  ],
  "important": "O plano comercial vendido ao aluno é diferente da assinatura FormFisik Pro. Um contrato administrativo não comprova pagamento; criar um registro técnico não conclui automaticamente uma obrigação contratual.",
  "tip": "Confira o histórico antes de renovar ou alterar condições.",
  "href": "/consultorias",
  "action": "Ir para Consultorias",
  "related": [
    "utilizar-agenda",
    "registrar-pagamento-externo"
  ]
}),
publish({
  "slug": "atribuir-checkin",
  "category": "checkins",
  "title": "Como atribuir check-ins e revisar respostas",
  "description": "Acompanhe os relatos do aluno e registre devolutivas.",
  "purpose": "Check-ins organizam solicitações periódicas e o retorno profissional sobre os relatos recebidos.",
  "steps": [
    {
      "title": "Escolha a estrutura do formulário",
      "text": "Em Check-ins, selecione um modelo publicado ou adapte um rascunho com perguntas adequadas ao acompanhamento.",
      "details": [
        "Use formulários rápidos para uma rotina breve ou estruturas mais completas quando houver necessidade. Evite repetir informações sem finalidade.",
        "O construtor permite seções, tipos de pergunta, condições e ordenação. Confira se as condições fazem sentido antes de publicar."
      ]
    },
    {
      "title": "Publique a versão que será usada",
      "text": "Revise a prévia e publique a versão do modelo antes da atribuição.",
      "details": [
        "Salvar rascunho não altera versões já publicadas. Respostas antigas continuam vinculadas ao formulário que o aluno recebeu.",
        "Teste perguntas obrigatórias e condicionais para evitar uma solicitação que o aluno não consiga completar."
      ]
    },
    {
      "title": "Defina aluno, período e prazo",
      "text": "Use Atribuir check-in e informe o aluno, o intervalo de referência e o prazo de resposta.",
      "details": [
        "Confira o fuso e a janela apresentada. Não confunda período que o aluno relata com prazo disponível para responder.",
        "Confira o destinatário antes de confirmar. A atribuição não cria uma conta de acesso no aplicativo."
      ]
    },
    {
      "title": "Revise periodicidade e ocorrências",
      "text": "Quando usar uma série periódica, confira frequência, quantidade de períodos e as datas geradas na prévia.",
      "details": [
        "Pausar uma série e cancelar uma ocorrência são ações diferentes; leia o alcance da operação disponível.",
        "A periodicidade organiza solicitações, mas não envia mensagens externas automaticamente."
      ]
    },
    {
      "title": "Gere e compartilhe o link privado",
      "text": "Abra a solicitação e gere o convite individual quando a janela permitir. Compartilhe pelo canal combinado.",
      "details": [
        "O link é privado e não é enviado automaticamente. Não reutilize o convite de outro aluno ou outro período.",
        "Se estiver expirado ou indisponível, confira o estado e o prazo da solicitação antes de gerar outra tentativa."
      ]
    },
    {
      "title": "Acompanhe pendências e respostas",
      "text": "Use as abas, filtros e a lista da central para distinguir solicitações pendentes, atrasadas e respostas recebidas.",
      "details": [
        "Falta de resposta não comprova falta de treino. Confira o prazo e, se pertinente, registre um contato ou prepare um lembrete.",
        "Um lembrete preparado precisa ser compartilhado pelo canal adequado; não é prova de entrega."
      ]
    },
    {
      "title": "Revise e registre a devolutiva",
      "text": "Abra a resposta, confira o período e a versão e registre a revisão e o retorno profissional.",
      "details": [
        "Respostas são relatos do aluno, não comprovação de treino, diagnóstico ou alteração automática de prescrição.",
        "A devolutiva registrada não é automaticamente entregue por WhatsApp, push ou aplicativo do aluno; respeite o canal disponível."
      ]
    },
    {
      "title": "Consulte histórico e indicadores",
      "text": "Use Histórico, Periodicidade e Indicadores para acompanhar séries, revisões e números da operação.",
      "details": [
        "Confira os denominadores e o intervalo antes de comparar taxas. Ausência de resposta não deve ser convertida em resultado físico presumido.",
        "Preserve respostas anteriores. Para uma coleta nova, use uma solicitação identificável em vez de tentar reescrever o relato enviado."
      ]
    }
  ],
  "important": "A janela de resposta depende do período escolhido. O link é privado e não é enviado automaticamente. Respostas são relatos do aluno, não comprovação de treino, diagnóstico ou alteração automática de prescrição.",
  "tip": "Use perguntas curtas e devolutivas claras, respeitando o contexto do aluno.",
  "href": "/checkins",
  "action": "Ir para Check-ins",
  "related": [
    "criar-anamnese",
    "acompanhar-evolucao",
    "registrar-contato"
  ]
}),
publish({
  "slug": "registrar-pagamento-externo",
  "category": "financeiro",
  "title": "Como registrar pagamentos externos",
  "description": "Controle recebimentos sem depender de uma conta conectada.",
  "purpose": "O financeiro organiza cobranças e valores recebidos externamente ou pelo processamento integrado, quando disponível.",
  "steps": [
    {
      "title": "Localize a contratação e o valor acordado",
      "text": "Em Financeiro, escolha Nova cobrança e selecione a contratação existente do aluno.",
      "details": [
        "Se a contratação ainda não existir, registre primeiro o acordo em Consultorias. A cobrança não substitui o cadastro do serviço.",
        "Confira aluno, plano, vigência e total acordado antes de definir o recebimento."
      ]
    },
    {
      "title": "Escolha a modalidade e o cronograma",
      "text": "Para controle por fora da plataforma, selecione a modalidade externa e confira vencimentos e frequência.",
      "details": [
        "O primeiro vencimento e o período precisam ser coerentes com a vigência. Revise a prévia antes de confirmar.",
        "Usar Pix próprio, transferência ou dinheiro não exige conta Stripe conectada. Processamento integrado, quando indisponível, não bloqueia o controle externo."
      ]
    },
    {
      "title": "Registre o que realmente recebeu",
      "text": "Abra a cobrança e informe o valor efetivo, a data e o meio de pagamento externo utilizado.",
      "details": [
        "Não registre como pago um valor apenas prometido. Confira os dados para evitar duplicar o mesmo recebimento.",
        "Conferência manual não equivale a confirmação bancária; mantenha os documentos necessários pelo procedimento adequado à sua operação."
      ]
    },
    {
      "title": "Acompanhe pagamentos parciais",
      "text": "Quando apenas parte do valor tiver sido recebida, registre a parcela efetiva e confira o saldo restante.",
      "details": [
        "Um pagamento parcial não deve ser marcado como quitação integral. Verifique também outros registros já vinculados à cobrança.",
        "A data do recebimento pode ser diferente do vencimento. Preserve cada significado ao consultar os indicadores."
      ]
    },
    {
      "title": "Corrija sem apagar o histórico",
      "text": "Se identificar um erro, abra o detalhe e use a ação de correção ou invalidação disponível.",
      "details": [
        "Confira versão, motivo e confirmação antes de gravar. Em conflito de edição, recarregue o estado atual.",
        "Invalidar um registro declarado não transfere dinheiro de volta. Reembolso real e correção administrativa são operações diferentes."
      ]
    },
    {
      "title": "Consulte origens e situações",
      "text": "Em Recebimentos, use filtros de período, aluno, plano e origem para localizar os lançamentos.",
      "details": [
        "Separe valores externos declarados dos confirmados por um processador. Contratado, vencido e recebido não representam a mesma medida.",
        "A lista é paginada; confira as páginas e filtros antes de concluir que um lançamento não existe."
      ]
    },
    {
      "title": "Exporte com os filtros conferidos",
      "text": "Use a exportação disponível para conferir a seleção de cobranças ou recebimentos fora da tela.",
      "details": [
        "A exportação segue os filtros da consulta; revise período e origem antes de baixar. Proteja o arquivo e limite seu compartilhamento.",
        "O arquivo de gestão não é extrato bancário, documento fiscal ou demonstrativo contábil oficial."
      ]
    },
    {
      "title": "Separe as relações financeiras",
      "text": "Mantenha o financeiro dos seus alunos separado da assinatura que você paga pelo uso da FormFisik.",
      "details": [
        "Recebimentos externos são permitidos sem comissão da FormFisik e sem conectar Stripe. Falta de pagamento do aluno não causa bloqueio automático.",
        "A situação do FormFisik Pro tem suas regras próprias. Registrar um pagamento de aluno não regulariza nem altera sua assinatura SaaS."
      ]
    }
  ],
  "important": "Recebimentos externos são permitidos sem comissão da FormFisik e sem conectar Stripe. Conferência manual não equivale a confirmação bancária. Falta de pagamento do aluno não causa bloqueio automático; FormFisik Pro é uma relação independente.",
  "tip": "Confira valor, data e origem antes de registrar um recebimento.",
  "href": "/financeiro",
  "action": "Ir para Financeiro",
  "related": [
    "organizar-consultorias",
    "interpretar-indicadores"
  ]
}),
publish({
  "slug": "utilizar-kanban",
  "category": "crm",
  "title": "Como utilizar o Kanban e as tarefas",
  "description": "Organize as etapas do atendimento profissional.",
  "purpose": "O CRM apresenta os alunos por etapa e reúne as tarefas da rotina.",
  "steps": [
    {
      "title": "Escolha a visão e confira os filtros",
      "text": "Em CRM, alterne entre a visão geral, Kanban e Lista para localizar alunos e pendências da rotina.",
      "details": [
        "Busca, situação e demais filtros mudam o conjunto visível. Confira páginas e contagens para não confundir filtro com ausência de cadastro.",
        "A próxima ação do atendimento pode estar numa tarefa, agenda ou módulo relacionado; abra a origem para conferir."
      ]
    },
    {
      "title": "Entenda as etapas do atendimento",
      "text": "Leia os nomes e condições das etapas antes de organizar os alunos no quadro.",
      "details": [
        "Etapa representa organização operacional, não diagnóstico, pagamento ou autorização clínica.",
        "Ao configurar regras disponíveis, confira o que é obrigatório para entrar ou sair de cada etapa."
      ]
    },
    {
      "title": "Movimente o aluno com revisão",
      "text": "Arraste o card ou use Mover etapa e confira o destino e as condições antes de confirmar.",
      "details": [
        "Uma condição obrigatória não atendida pode impedir a transição. Resolva a pendência no módulo correto.",
        "Mover um card não altera automaticamente treino, contrato, dados de saúde ou situação financeira."
      ]
    },
    {
      "title": "Crie tarefas com próxima ação clara",
      "text": "Em Minhas tarefas, defina título, prioridade e prazo; vincule um aluno quando a tarefa tiver esse contexto.",
      "details": [
        "Tarefas gerais podem organizar a rotina sem aluno. Não preencha um vínculo só para contornar uma dúvida de organização.",
        "Evite copiar respostas sensíveis ou informações clínicas no título da tarefa."
      ]
    },
    {
      "title": "Vincule a agenda quando fizer sentido",
      "text": "Quando a tarefa se referir a um atendimento existente, use o vínculo explícito com o compromisso disponível.",
      "details": [
        "Confira se o compromisso pertence ao mesmo contexto. Criar uma tarefa não agenda automaticamente um atendimento.",
        "Reagendamento e presença continuam na Agenda; o vínculo é uma referência, não outra fonte de horários."
      ]
    },
    {
      "title": "Atualize o estado conforme o trabalho",
      "text": "Use os estados disponíveis, incluindo Aguardando, para representar a situação real da tarefa.",
      "details": [
        "Concluir uma tarefa não comprova realização de treino, entrega de mensagem ou recebimento de pagamento.",
        "Não há reatribuição para uma equipe nesse fluxo: confira as permissões e a responsabilidade da sua própria conta."
      ]
    },
    {
      "title": "Consulte o contexto do aluno",
      "text": "Abra o painel do aluno para conferir próximas sessões, pendências e acessos aos módulos relacionados.",
      "details": [
        "Os resumos não substituem respostas, documentos ou detalhes de origem. Abra o módulo autorizado quando precisar do conteúdo.",
        "A falta de pagamento do aluno não movimenta automaticamente uma etapa nem cancela sua contratação."
      ]
    },
    {
      "title": "Confira o histórico antes de reorganizar",
      "text": "Use Histórico para entender transições e alterações e revise suas tarefas por prazo e prioridade.",
      "details": [
        "Mudanças de nomes e estados atuais não reescrevem eventos anteriores. Em edição concorrente, confira a versão atual.",
        "Arquivar ou transferir uma etapa pode exigir revisão dos alunos nela existentes; siga a prévia e o alcance da ação apresentada."
      ]
    }
  ],
  "important": "Mover um card não altera dados de saúde, treino, contrato ou pagamento. Tarefas e etapas mantêm histórico; concluir uma tarefa não comprova entrega de mensagem ou realização de treino.",
  "tip": "Use etapas para organizar o atendimento e tarefas para registrar a próxima ação.",
  "href": "/crm",
  "action": "Ir para CRM",
  "related": [
    "registrar-contato",
    "utilizar-agenda"
  ]
}),
publish({
  "slug": "registrar-contato",
  "category": "comunicacao",
  "title": "Como registrar contatos e preparar comunicados",
  "description": "Organize seu relacionamento sem presumir envios externos.",
  "purpose": "A central reúne contatos declarados, modelos, textos preparados e pendências vinculadas ao CRM.",
  "steps": [
    {
      "title": "Escolha entre registro e texto preparado",
      "text": "Em Comunicação, diferencie um contato já realizado de uma mensagem que ainda será compartilhada.",
      "details": [
        "Registrar contato descreve um fato declarado por você. Preparar texto organiza uma intenção e não comprova contato.",
        "Confira o aluno antes de abrir o contexto, especialmente ao alternar entre contatos recentes."
      ]
    },
    {
      "title": "Informe canal e momento do contato",
      "text": "Use Registrar contato e preencha canal, data e as informações mínimas necessárias para o histórico.",
      "details": [
        "Não marque entrega ou leitura que você não consegue comprovar. Contato externo declarado não é confirmação automática de um provedor.",
        "Evite copiar respostas de anamnese, fotos ou dados de saúde para um texto que poderá sair da plataforma."
      ]
    },
    {
      "title": "Prepare mensagens com os modelos",
      "text": "Use um modelo existente ou uma cópia personalizada para compor um texto adequado ao contexto.",
      "details": [
        "Revise variáveis e informações preenchidas na prévia. A mensagem deve fazer sentido para o destinatário escolhido.",
        "Alterar um modelo não reescreve automaticamente registros já confirmados no histórico."
      ]
    },
    {
      "title": "Confira a prévia antes de registrar",
      "text": "Revise destinatário, contexto, conteúdo e modalidade do registro e confirme somente quando estiver correto.",
      "details": [
        "Se a origem ou versão mudou, gere outra prévia. Não confirme um texto antigo sem reler o resultado.",
        "Em uma falha de resposta, consulte o estado antes de repetir a operação e criar outra intenção."
      ]
    },
    {
      "title": "Compartilhe pelo canal realmente disponível",
      "text": "Quando preparar uma mensagem, use o canal externo combinado com o aluno e respeite as opções apresentadas.",
      "details": [
        "Preparar texto não envia mensagem. Chat, envio profissional e agendamentos de mensagem permanecem indisponíveis até implementação ou habilitação.",
        "SMTP de confirmação e recuperação de conta não equivale a um canal de comunicação profissional com alunos."
      ]
    },
    {
      "title": "Organize retornos no CRM",
      "text": "Use tarefas e pendências relacionadas para lembrar a próxima ação após um contato.",
      "details": [
        "Concluir uma tarefa não envia mensagem e não comprova que o aluno recebeu o retorno.",
        "Uma tarefa vinculada deve representar a próxima ação real, sem repetir informações sensíveis do conteúdo original."
      ]
    },
    {
      "title": "Consulte contatos, preparados e histórico",
      "text": "Use as áreas e filtros da central para localizar contatos declarados, textos preparados e correções.",
      "details": [
        "O que foi preparado deve continuar distinguível do que foi registrado como contato realizado.",
        "Uma correção preserva o registro anterior; não é uma forma de inventar evidência de entrega ou leitura."
      ]
    },
    {
      "title": "Acompanhe avisos e preferências",
      "text": "Consulte avisos internos e ajuste as categorias disponíveis em Configurações quando necessário.",
      "details": [
        "Avisos internos são da sua operação. Desmarcar uma categoria não elimina compromissos, contratos ou solicitações nos módulos de origem.",
        "Revise período, destinatário e canal antes de reutilizar um texto antigo. Proteja qualquer conteúdo copiado para fora da plataforma."
      ]
    }
  ],
  "important": "Preparar texto não envia mensagem. Contato manual é uma declaração profissional, sem prova de entrega ou leitura. Chat, envio profissional e agendamentos de mensagem permanecem indisponíveis até implementação ou habilitação.",
  "tip": "Registre somente o necessário e evite copiar informações sensíveis para textos externos.",
  "href": "/comunicacao",
  "action": "Ir para Comunicação",
  "related": [
    "utilizar-kanban",
    "atribuir-checkin"
  ]
}),
publish({
  "slug": "interpretar-indicadores",
  "category": "indicadores",
  "title": "Como interpretar os indicadores",
  "description": "Entenda os números a partir dos registros da sua operação.",
  "purpose": "Indicadores ajudam a consultar a evolução operacional da carteira, com definições e limites por área.",
  "steps": [
    {
      "title": "Defina a pergunta da análise",
      "text": "Abra Indicadores e escolha a área que corresponde ao que deseja acompanhar, como carteira, serviços ou recebimentos.",
      "details": [
        "Um indicador operacional resume fatos registrados; ele não explica sozinho a causa de uma mudança.",
        "Evite misturar resultados físicos, contatos e pagamentos como se descrevessem a mesma evolução."
      ]
    },
    {
      "title": "Ajuste período e filtros",
      "text": "Selecione o intervalo e os filtros disponíveis e confira a referência temporal antes de comparar.",
      "details": [
        "Datas de contratação, vencimento, recebimento e presença podem levar a períodos diferentes.",
        "Use critérios equivalentes ao comparar telas ou exportações. Um filtro ativo pode explicar diferenças nos números."
      ]
    },
    {
      "title": "Leia a definição e o denominador",
      "text": "Abra as explicações do indicador para saber o que entra no cálculo e qual é a base da comparação.",
      "details": [
        "Sem dados suficientes, o resultado pode ficar ausente em vez de virar zero. Não complete a informação com uma estimativa pessoal.",
        "Uma taxa sem denominador conhecido não permite comparação confiável entre períodos ou alunos."
      ]
    },
    {
      "title": "Interprete carteira e serviços",
      "text": "Confira se o número representa alunos, vínculos, contratações, renovações ou entregas.",
      "details": [
        "Um aluno pode ter mais de uma contratação. Contar contratos não é contar pessoas únicas.",
        "Renovação exige registro identificável; a continuidade percebida do atendimento não cria uma renovação automática no indicador."
      ]
    },
    {
      "title": "Separe previsto, declarado e recebido",
      "text": "Na visão financeira, confira origem e situação dos valores e diferencie compromissos de recebimentos registrados.",
      "details": [
        "Valores acordados não equivalem a receita recebida. Recebimento externo é declarado, não conferência automática do banco.",
        "O financeiro profissional e a assinatura SaaS da FormFisik têm pagadores e finalidades diferentes."
      ]
    },
    {
      "title": "Leia presença e relatos com contexto",
      "text": "Na Agenda e nos Check-ins, confira o significado de realização, ausência, pendência e resposta recebida.",
      "details": [
        "Contato declarado não comprova entrega e relato de treino não comprova execução. Comparecimento precisa de registro próprio.",
        "Uma resposta atrasada pode refletir o prazo ou a falta de preenchimento, não permite diagnosticar adesão ou estado de saúde."
      ]
    },
    {
      "title": "Confira gráficos e dados de origem",
      "text": "Alterne indicadores ou consulte tabelas acessíveis e abra o módulo responsável para verificar um caso específico.",
      "details": [
        "Não conclua que um registro sumiu só porque não está numa página ou intervalo carregado.",
        "Se identificar informação incorreta, corrija na origem pelo fluxo autorizado; não tente ajustar o total diretamente."
      ]
    },
    {
      "title": "Use os resultados para orientar a rotina",
      "text": "Depois de conferir critérios e fontes, planeje contatos, tarefas ou revisão de atendimento.",
      "details": [
        "Dados operacionais não são conclusões clínicas. Registre decisões técnicas e avaliações no módulo adequado.",
        "Compare novamente após salvar os fatos reais. Não crie registros apenas para melhorar um número do painel."
      ]
    }
  ],
  "important": "Dados operacionais não são conclusões clínicas. Valores acordados não equivalem a receita recebida; contato declarado não comprova entrega e relato de treino não comprova execução.",
  "tip": "Verifique período, origem e critério antes de tomar uma decisão.",
  "href": "/indicadores",
  "action": "Ir para Indicadores",
  "related": [
    "entender-dashboard",
    "registrar-pagamento-externo"
  ]
}),
publish({
  "slug": "configurar-perfil",
  "category": "configuracoes",
  "title": "Como utilizar a Central de Configurações",
  "description": "Gerencie perfil, dados privados, segurança e preferências.",
  "purpose": "Mantenha suas informações profissionais atualizadas e controle o acesso à sua conta.",
  "steps": [
    {
      "title": "Conheça as áreas de Configurações",
      "text": "Abra Configurações e escolha Perfil público, Minha conta, Notificações, Assinatura, Importação ou Privacidade e segurança.",
      "details": [
        "Dados privados da conta e apresentação profissional têm finalidades distintas. Confira em qual seção está antes de editar.",
        "Recursos que dependam de configuração ou disponibilidade podem apresentar um aviso; uma tentativa não equivale a salvamento concluído."
      ]
    },
    {
      "title": "Atualize o perfil profissional",
      "text": "Preencha nome profissional, apresentação, CREF declarado, focos de treino e forma de atendimento e use Salvar.",
      "details": [
        "CREF informado não significa verificação de regularidade pela plataforma. Focos de treino não certificam especialidades.",
        "Confira a confirmação de salvamento. Se houver conflito com outra edição, consulte a versão atual antes de reaplicar suas mudanças."
      ]
    },
    {
      "title": "Ajuste e salve sua foto",
      "text": "Selecione um arquivo permitido, faça o recorte e revise enquadramento e zoom antes de aplicar e salvar.",
      "details": [
        "Aplicar um recorte e salvar a foto são etapas que precisam ser conferidas pelos avisos da tela. Não presuma envio concluído apenas por ver a prévia.",
        "Use uma imagem sua e adequada ao perfil. A foto de pessoa não substitui a logomarca usada nos documentos profissionais."
      ]
    },
    {
      "title": "Revise os dados privados",
      "text": "Em Minha conta, edite somente os dados necessários e confirme operações sensíveis com a senha atual.",
      "details": [
        "CPF e endereço são opcionais conforme a finalidade. A validação de um CPF não comprova a identidade da pessoa.",
        "O CPF fica mascarado nas consultas. Confira os avisos antes de substituí-lo; não use campos públicos para contornar a máscara."
      ]
    },
    {
      "title": "Proteja senha, e-mail e sessões",
      "text": "Use as ações de trocar senha, encerrar outras sessões ou solicitar alteração de e-mail conforme a necessidade.",
      "details": [
        "A troca de e-mail só se conclui pelo link de confirmação enviado ao novo endereço. Confira o acesso à caixa de entrada antes de solicitar.",
        "Alterar senha ou confirmar novo e-mail pode encerrar sessões e exigir login. Encerrar outras sessões preserva a atual conforme a ação escolhida."
      ]
    },
    {
      "title": "Escolha avisos e publicação do perfil",
      "text": "Salve as categorias disponíveis de avisos internos e confira a visibilidade do perfil antes de publicar.",
      "details": [
        "O perfil começa privado. Publicação exige conferência e confirmação; alterações de dados ou foto podem retirar a publicação para nova revisão.",
        "Preferências filtram avisos internos e não apagam fatos nos módulos. E-mails de segurança não são silenciados por essas escolhas."
      ]
    },
    {
      "title": "Use assinatura e importação nos seus módulos",
      "text": "Abra o gerenciamento da assinatura para conferir plano e situação ou acesse Importar dados para trazer registros compatíveis.",
      "details": [
        "FormFisik Pro e plano vendido ao aluno são relações diferentes. Cancelamento da assinatura precisa ser tratado no fluxo próprio.",
        "Na importação, confira formato, mapeamento e prévia. Não existe conversão automática de qualquer arquivo de outra plataforma."
      ]
    },
    {
      "title": "Consulte seus dados e solicite atendimento",
      "text": "Em Privacidade e segurança, use o download de conta ou registre a solicitação disponível e acompanhe seu protocolo.",
      "details": [
        "O download da conta é parcial e não inclui registros operacionais nem dados de alunos. Não é uma exportação integral da carteira.",
        "Solicitar exclusão registra um protocolo para análise, sem apagar dados ou cancelar a assinatura automaticamente. Preserve o protocolo para acompanhar o pedido."
      ]
    }
  ],
  "important": "CPF, endereço e e-mail não são publicados. Focos de treino não certificam especialidades. Solicitar exclusão registra um protocolo para análise, sem apagar dados ou cancelar a assinatura automaticamente.",
  "tip": "Assinatura e importação usam seus módulos existentes. O download da conta não inclui registros operacionais nem dados de alunos.",
  "href": "/configuracoes",
  "action": "Ir para Configurações",
  "related": [
    "primeiros-passos",
    "registrar-contato"
  ]
})
]
export const published=tutorials.filter(t=>t.status==='published')
export function articleUrl(slug:string){return '/tutoriais?artigo='+encodeURIComponent(slug)}
export function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim()}
export function searchTutorials(query:string,category?:string){const terms=normalize(query).slice(0,120).split(/\s+/).filter(Boolean);return published.filter(t=>!category||t.category===category).map(t=>{const categoryLabel=categories.find(c=>c.id===t.category)?.label??'',title=normalize(t.title),description=normalize(t.description),body=normalize([categoryLabel,t.purpose,t.important,t.tip,...t.steps.flatMap(s=>[s.title,s.text,...(s.details??[])])].join(' '));const haystack=[title,description,body].join(' ');return {article:t,score:terms.every(term=>haystack.includes(term))?terms.reduce((score,term)=>score+(title.includes(term)?5:0)+(description.includes(term)?3:0)+(body.includes(term)?1:0),0):-1}}).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score||published.indexOf(a.article)-published.indexOf(b.article)).map(r=>r.article)}
