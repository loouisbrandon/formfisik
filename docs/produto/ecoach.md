# eCoach — o cérebro da FormFisik

## Visão de produto

O eCoach é a inteligência artificial gestora da FormFisik, trabalhando ao lado do personal. Sua visão abrange toda a operação profissional da plataforma: entender solicitações em linguagem natural, reunir o contexto autorizado, propor decisões e ajudar a executar tarefas entre os módulos existentes. O personal permanece responsável pelas decisões profissionais e pelo relacionamento com seus alunos.

A FormFisik é uma empresa independente fundada por Brandon Louis. Esta visão de produto não presume constituição jurídica formalizada nem autoriza novas integrações, operações financeiras ou modalidades.

## Experiência desejada

O profissional poderá conversar por texto ou áudio, enviar imagens, PDFs e outros anexos e continuar o trabalho pelo eCoach completo ou pelo Finder, sem abandonar a tela atual. Exemplo futuro: na rua ou na praia, abrir o aplicativo e dizer “Crie um treino chamado Força A, com estas características” ou “Quanto tenho para receber neste mês?”. O aplicativo e os recursos de voz são possibilidades futuras, não funcionalidades disponíveis nesta entrega web.

O Finder funciona como acesso rápido: Ctrl+K, busca normal ou conversa contextual. O eCoach completo oferece espaço para trabalhos mais longos. As duas superfícies devem compartilhar a conversa, sem duplicar regras ou autorizações.

## Abrangência funcional futura

| Área | Apoio pretendido |
| --- | --- |
| Alunos | Localizar alunos, organizar informações e ajudar na gestão da carteira e dos vínculos autorizados. |
| Treinos e exercícios | Criar propostas com nome, objetivo, exercícios, séries, repetições e progressões; adaptar e revisar usando a biblioteca existente. |
| Acompanhamento | Reunir evolução registrada, comparar períodos, identificar informações ausentes e preparar resumos para revisão profissional. |
| Agenda | Consultar compromissos, disponibilidades e pendências; propor agendamentos e notificar próximos atendimentos. |
| Anamneses | Ajudar a criar questionários, preparar envios e resumir respostas com acesso controlado a dados de saúde. |
| Produtos | Ajudar a estruturar ofertas, descrições, conteúdos e produtos digitais ou físicos, reutilizando o módulo Produtos. |
| Consultorias | Apoiar organização de serviços, contratos, etapas e entregas profissionais existentes. |
| Check-ins | Preparar perguntas, resumir respostas, indicar pontos para atenção e apoiar o retorno ao aluno. |
| Financeiro | Explicar recebimentos, valores a receber, vencimentos, inadimplência e resultados; preparar relatórios por período e apoiar previsões transparentes. |
| Comunicação e CRM | Preparar mensagens, organizar tarefas e conversas; futuramente integrar WhatsApp e Instagram Direct, mediante configuração e permissões. |
| Indicadores | Reunir métricas autorizadas, explicar sua origem e apoiar decisões da operação. |
| Demais módulos profissionais | Evoluir a cobertura dos recursos existentes com ferramentas específicas, sem presumir acesso universal a dados. |

## Financeiro como capacidade central

A experiência financeira deve responder perguntas como “Quanto tenho para receber neste mês?”, “Quem está com pagamento pendente?” e “Como foi meu resultado neste período?”. Deve distinguir valores previstos, vencidos, pagos, cancelados e efetivamente confirmados. Estimativas precisam declarar critério, período, moeda, fonte e limitações; nunca apresentar projeção como recebimento garantido.

Dados ausentes não devem ser inventados. Alunos com nomes semelhantes exigem desambiguação. Mensagens de cobrança, alterações de valores e qualquer operação com efeito externo precisam de revisão e confirmação apropriadas. Billing profissional e assinatura SaaS da FormFisik continuam domínios separados; eCoach não altera essa regra.

## Contexto e autoridade

O eCoach deve conhecer o módulo aberto e, quando implementado e autorizado, o período, filtros e registro selecionado. Contexto é informação para orientar a conversa, não autorização. Dados são obtidos por serviços do backend com isolamento por proprietário e DTOs mínimos; o conteúdo da página não deve ser coletado indiscriminadamente.

A visão de “gestor total” significa cobertura funcional da operação do personal. Não significa privilégios administrativos globais, acesso a outros profissionais, bypass de assinatura ou execução irrestrita. Ações relevantes devem produzir propostas revisáveis, confirmação, autorização no servidor, auditoria sem exposição de dados sensíveis e proteção contra repetição.

Arquivos, mensagens recebidas e documentos são dados, não instruções capazes de ampliar permissões. Antes de conectar modelo ou anexos reais, definir provedor, custos, limites, finalidade, retenção, exclusão, uso dos dados pelo fornecedor e validações contra conteúdo malicioso.

## Estado e sequência de evolução

1. **PREPARADO — entrega 1, local:** Finder com busca e chat demonstrativo, identificação do módulo, conversa e rascunho em memória compartilhados com `/ecoach`, fechamento por clique fora/Esc/Ctrl+K e expansão sem perder conversa. Sem modelo, leitura dos registros ou ações reais.
2. **IMPLEMENTADO localmente / integração externa NÃO HOMOLOGADA — entrega 2:** adaptadores configuráveis OpenAI/Anthropic, consultas delimitadas de Financeiro, alunos, exercícios e treinos; propostas revisáveis de criação/edição de rascunhos, fontes, limites e confirmação. Desativado por padrão até escolher provedor/modelo e autorizar dados.
3. **NÃO IMPLEMENTADO — evolução posterior:** novas propostas e ações confirmadas nos demais módulos; anexos e áudio reais; comunicação externa; experiência móvel e notificações proativas. Escopos e homologações próprios, preservando foco Personal 1.0.

A entrega 1 valida interação e visual, não qualidade de IA ou capacidade de gestão real. Nenhuma afirmação deste documento substitui testes e homologação por ambiente. O NO-GO de segurança da 015 permanece conforme a documentação vigente.

## Referências

- [Contrato técnico e evidências](../modulos/ecoach.md)
- [Design System](../design/DESIGN_SYSTEM.md)
- [Inventário de tratamento e retenção](../privacidade/inventario-e-retencao.md)
- [Roadmap](../planejamento/roadmap.md)

## Controle do personal sobre o eCoach

O usuário escolhe antes da primeira mensagem entre somente leitura, criação ou criação e edição. A preferência pode ser revisada em Configurações → eCoach. “Criação e edição” representa gestão da própria operação, nunca a role admin da FormFisik. Preferência sem escolha não permite continuar a conversa até salvar explicitamente; é possível cancelar e manter o rascunho.

Preparação local implementada: preferência persistente com controle de versão, dialog inicial e seção de configurações. A etapa 2 implementa adaptadores e ferramentas limitadas com permissões verificadas no servidor. Criação e edição começam por propostas de rascunho de treino revisáveis; não concedem acesso global. Inferência real depende de configuração e homologação externas.

## Etapa 1 — conversas e contexto, implementação local

Histórico persistente com abrir/renomear/excluir, paginação e resposta demonstrativa salva pelo servidor. Rascunho continua temporário. Contexto visível/removível do módulo, período/filtros do Financeiro, cobrança selecionada e vínculo de aluno na página de detalhe. Outros módulos fornecem somente sua identificação até publicar contexto estruturado próprio. Conversas permanecem privadas do profissional; a resposta não consulta os dados referenciados. Limites, retenção e contratos em [implementação](../modulos/ecoach.md).

Etapa 2 implementada localmente em entrega posterior: integração configurável, consultas autorizadas e propostas de rascunho de treino com revisão/confirmação. Sem provedor escolhido nem chamadas pagas. Configuração, contratos, limites e pendências em [implementação](../modulos/ecoach.md#etapa-2--integração-configurável-e-ferramentas-limitadas).

## Gestão interna — 14/11/2026

IMPLEMENTADO localmente: consultas e propostas revisáveis de treinos, modelos de anamnese e agenda (atendimentos, pessoal, bloqueios; remarcação de uma ocorrência). Reutilização dos domínios017/021 e painel existente, com autorização atual e confirmação transacional. Anamnese salva rascunho, sem publicar/enviar. OpenAI escolhido, inferência real NÃO HOMOLOGADA por falta de modelo/chave locais. Atendimento externo, demais módulos e automações seguem futuros. [Escopo técnico e evidências](../modulos/ecoach.md#gestão-interna--14112026).
