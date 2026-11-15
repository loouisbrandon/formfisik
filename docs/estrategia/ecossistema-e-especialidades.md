# Ecossistema e desenvolvimento por especialidade

Estado: diretriz estratégica definida pelo fundador; expansão futura NÃO IMPLEMENTADA por esta tarefa. A [diretriz institucional](../institucional/diretriz-institucional.md) rege a identidade independente da empresa.

## Estratégia empresarial

A FormFisik pretende conectar praticantes, profissionais de educação física, personal trainers, treinadores de corrida, professores de artes marciais, treinadores de esportes coletivos, médicos e outros profissionais habilitados, academias, estúdios, clubes, centros esportivos, lojas e estabelecimentos parceiros. O valor pretendido é continuidade entre descoberta, contratação, prática e acompanhamento autorizado.

**Desenvolvimento e consolidação por especialidade:** concluir e homologar a [Personal 1.0](../produto/personal-1.0.md) antes de implementar outra modalidade, salvo autorização estratégica expressa do fundador. Pesquisa e requisitos futuros são permitidos sem expansão prematura. Web é a prioridade atual; mobile pertence ao marco 029.

## Possibilidades de longo prazo

| Eixo | Possibilidades futuras, sem autorização de implementação |
| --- | --- |
| Modalidades | Musculação como primeira especialidade; corrida, ciclismo, natação, jiu-jitsu, outras artes marciais, futebol, vôlei, demais esportes coletivos e outras modalidades |
| Integrações esportivas | Wearables, relógios inteligentes, aplicativos de corrida, monitoramento, histórico de atividades e métricas autorizadas pelo usuário |
| Marketplace | Busca por modalidade, especialização, localização/distância, disponibilidade, experiência, avaliações, serviços, benefícios e parceiros. Exemplo: viajante encontra personal próximo em São Paulo para sessão avulsa |
| Saúde | Profissionais médicos, agendamentos, telemedicina, integração de serviços, acompanhamentos autorizados e benefícios; sujeitos a atribuições, validação regulatória e proteção de dados antes de qualquer implementação |
| Comunidade e gamificação | Comunidades, grupos, desafios, metas, conquistas, rankings apropriados, pontuação, evolução individual e incentivo à prática; critérios de segurança e adequação ainda a definir |
| Benefícios comerciais | Academias, suplementos e lojas esportivas parceiras, descontos, cupons, fidelidade e benefícios vinculados a profissionais ou estabelecimentos |
| Praticante | Acesso essencial gratuito e possibilidade de premium, marketplace, benefícios e integrações avançadas; oferta e preço futuros, sem alterar o Pro |

## Reutilização e não duplicação

Avaliar identidade/autenticação, usuários, perfis profissionais, organizações, permissões, clientes, agenda, serviços, contratos, pagamentos, notificações, comunicação, arquivos, relatórios, questionários, avaliações, histórico e auditoria como capacidades potencialmente compartilháveis. A lista não atesta existência dessas capacidades: o [inventário](../produto/inventario-funcional.md) distingue implementação de planejamento.

Preservar as regras de domínio nas camadas de servidor e contratos reutilizáveis. Antes de criar abstração, verificar consumidores reais, propriedade, finalidade e diferenças entre modalidades. Reutilização não permite compartilhar automaticamente dados sensíveis, carteira, credenciais, infraestrutura ou recursos entre organizações ou com a Onebase.

Musculação especializa exercícios, séries, repetições, cargas, divisões e progressão; corrida poderá especializar distância, pace/ritmo, percursos, provas e zonas; jiu-jitsu poderá especializar aulas, técnicas, graduação e presença. Não criar antecipadamente tabelas, entidades genéricas ou serviços dessas modalidades. Evoluir incrementalmente conforme [arquitetura](../arquitetura/visao-atual-e-evolucao.md) e [ADR-016](../arquitetura/ADR-016-especialidades-e-dominios.md).

O [modelo de negócio](modelo-de-negocio.md) define monetização; o [roadmap](../planejamento/roadmap.md) define sequência. A visão empresarial não é compromisso de prazo nem comprovação de produto disponível.
