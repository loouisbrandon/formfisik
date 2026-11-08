# Central de Tutoriais

Implementação web local de 06/11/2026. FormFisik é empresa independente fundada por Brandon Louis; não se presume constituição jurídica formalizada.

## Uso

Tutoriais aparece em Sistema junto a Indicadores e abre /tutoriais, no ProfessionalShell autenticado existente. A composição segue a referência: título, busca, faixa Comece por aqui, categorias à esquerda, artigo central, índice Neste artigo à direita e três destaques inferiores. Temas e sidebar atuais preservados, incluindo o asset oficial da marca.

São16 categorias com um artigo publicado por categoria nesta versão. Contagens vêm dos metadados, não dos números ilustrativos da imagem. Categorias são paginadas em grupos de8; a página da categoria selecionada é encontrada automaticamente em um link direto. No tablet/mobile o conteúdo reflui e o menu de categorias pode ser recolhido.

Busca local por título, categoria, descrição, finalidade, passos, dica e limitações. Normaliza acentos/caixa e exige todos os termos; título tem maior peso que descrição e conteúdo. Corpus atual de16 artigos, sem banco, API, índice externo ou envio de consultas. Texto de busca limitado a120 caracteres. Não pesquisar dados pessoais: a busca é para assuntos de uso da plataforma. O termo fica na URL e pode reaparecer no histórico do navegador.

Links /tutoriais?artigo=slug abrem diretamente o artigo; ?categoria=id abre a listagem dessa categoria. Busca usa ?q=termo e atualização local do histórico do navegador, sem recarregar o servidor a cada tecla. Atualização, voltar e artigos relacionados preservam a navegação por URL. Endereço sem artigo reconhecido mostra recuperação explícita, sem conteúdo inventado.

## Conteúdo e manutenção

Fonte editorial estruturada versionada: src/modules/tutorials/content.ts. Optou-se por TypeScript tipado e JSX escapado em vez de adicionar um parser Markdown/MDX: o repositório não tem CMS ou renderizador de documentação funcional e o conteúdo inicial não exige HTML, código ou plugins. Um renderer único recebe metadados e passos, sem eval ou HTML bruto. O catálogo não importa documentos internos ou configurações do servidor; nomes de ambiente, segredos, SQL e rotas administrativas não são publicados.

Cada artigo possui slug, título, descrição, categoria, finalidade, passos, observações importantes, dica, ação/rota, relacionados, status e data editorial. Somente published entra em busca e contagens. Data controlada desta revisão:06/11/2026. Atualizar o artigo junto com a alteração do módulo e executar os testes de consistência. Manter identificadores estáveis para links compartilhados. Não tratar publicado como homologação externa do recurso descrito.

Artigos iniciais:
1. Comece a usar a FormFisik.
2. Como utilizar o Dashboard.
3. Como gerenciar seus alunos.
4. Como criar e organizar um treino.
5. Como encontrar e cadastrar exercícios.
6. Como acompanhar a evolução física.
7. Como utilizar a Agenda.
8. Como criar e solicitar uma anamnese.
9. Como associar vídeos aos exercícios.
10. Como organizar serviços e consultorias.
11. Como atribuir check-ins e revisar respostas.
12. Como registrar pagamentos externos.
13. Como utilizar o Kanban e as tarefas.
14. Como registrar contatos e preparar comunicados.
15. Como interpretar os indicadores.
16. Como utilizar a Central de Configurações.

Fontes funcionais revisadas: docs/modulos/alunos.md, treinos.md, exercicios.md, acompanhamento.md, agenda-profissional.md, anamneses.md, demonstracoes.md, servicos-e-consultorias.md, checkins.md, financeiro-profissional.md, crm.md, comunicacao.md, inteligencia-de-negocio.md e dashboard-profissional.md; refinamentos recentes de Financeiro, CRM, Comunicação e Configurações; rotas e rótulos atuais do frontend. A documentação antiga foi confrontada com os refinamentos vigentes, sem expor o conteúdo técnico interno ao profissional.

## Limites e futuro

Sem vídeos, cursos, CMS, favoritos, avaliações de utilidade, métricas de popularidade ou integração de busca global. Sem tracking de leitura ou perfil do aluno. Copiar link é ação explícita de clipboard, com fallback; não envia conteúdo a terceiros. Acesso autenticado segue o layout atual; ler ajuda não concede acesso comercial aos módulos. Nenhuma regra de negócio dos módulos foi alterada.

Tutoriais distinguem contato declarado de envio, relato de treino de comprovação, contrato de pagamento, assinatura Pro de relação profissional/aluno e perfil em prévia de perfil salvo. Não afirmar canal de vídeo/pagamento/chat disponível sem validação. Leitor de tela real, dispositivos físicos e homologação produtiva são pendências, não resultados de um teste de DOM.

Para crescimento significativo além deste catálogo editorial pequeno, reavaliar busca e paginação no servidor; não adicionar CMS ou abstrações antecipadas. Fontes, manifesto e evidências no relatório de entrega.

## Ampliação editorial — 06/11/2026

Os16 artigos passam de48 para128 etapas, com256 orientações práticas adicionais. Cada etapa apresenta um resumo e um disclosure nativo “Ver orientações e cuidados”, acessível por teclado. Os detalhes ficam recolhidos para preservar a leitura por etapas e a rolagem do shell; o índice continua levando à etapa com foco. A busca também indexa as orientações recolhidas. Slugs, categorias, contagens reais, relacionados e rotas são preservados.

Conteúdo cobre preparação, execução, conferência, histórico, correção e limites: importação e arquivo de alunos; séries/técnicas/modelos/PDFs; disponibilidade, bloqueios, arraste e presença; perguntas condicionais e reordenação; versões e direitos de vídeo; contratação e entregas; períodos/devolutivas; recebimentos parciais e invalidação; tarefas gerais, avisos e indicadores. Configurações reflete o backend atual, com salvamento, conta, segurança, publicação, preferências e protocolos; mensagens de indisponibilidade não são apresentadas como salvamento concluído. Informação funcional não comprova disponibilidade externa ou instalação em cada ambiente.
