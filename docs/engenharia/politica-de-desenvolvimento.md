# Política de desenvolvimento por entregas completas

Estado: política vigente. Este documento define o processo; não atesta que as funcionalidades do produto já estejam implementadas.

## Princípio

A FormFisik desenvolve funcionalidades completas. Cada execução deve possuir um objetivo funcional específico e delimitado, como criação de conta, login, recuperação de senha, checkout ou gestão de alunos.

Não fragmentar o planejamento em dezenas de microtarefas artificiais. Uma funcionalidade pode ser dividida em até três entregas principais quando seu tamanho justificar. Esse limite se aplica às entregas, não às operações técnicas necessárias.

## Execução

1. Inspecionar o código e a documentação existente.
2. Identificar requisitos e dependências.
3. Definir a abordagem técnica.
4. Implementar frontend, backend e persistência necessários.
5. Implementar validações, segurança e tratamento de erros.
6. Integrar a funcionalidade ao restante do sistema.
7. Criar e executar testes adequados.
8. Atualizar a documentação do módulo.
9. Atualizar o Design System quando houver mudanças visuais.
10. Validar o resultado antes de declarar a funcionalidade concluída.

Trabalhar até concluir todo o escopo autorizado, sem interromper por uma pequena subetapa concluída ou impor limite artificial de tempo. Se houver impedimento real, documentar o bloqueio, o trabalho concluído e o que permanece pendente.

## Critério de conclusão

Uma funcionalidade somente está concluída quando estiver implementada, integrada, testada e documentada. Não declarar sucesso quando os testes não tiverem sido executados ou houver partes simuladas sem identificação explícita.

Manter documentação técnica e funcional atualizada. Registrar decisões arquiteturais relevantes, regras de negócio, contratos de API, modelo de dados e alterações significativas. Toda alteração visual deve respeitar o Design System da FormFisik; novos componentes, padrões ou decisões visuais exigem atualização documental na mesma alteração.

## Diretrizes técnicas

- Aplicação web como prioridade absoluta.
- React Native somente em fase futura.
- Railway como hospedagem inicial.
- Autenticação web sem JWT.
- FormFisik como empresa independente, conforme a [diretriz institucional](../institucional/diretriz-institucional.md).
- Arquitetura simples, segura e preparada para evolução.
- Regras comerciais conforme o [modelo de negócio](../estrategia/modelo-de-negocio.md), sua fonte de verdade.

## Comunicação da entrega

Apresentar funcionalidade desenvolvida, arquivos e módulos envolvidos, regras implementadas, testes executados e resultados, documentação criada ou atualizada e pendências ou limitações conhecidas.

A prioridade é entregar software real, funcional e sustentável. Esta política não amplia o escopo autorizado de cada execução.

## Aceite de segurança — 015

Aplicar as regras permanentes de AGENTS.md: segredos só servidor, autorização/propriedade por operação, DTO mínimo, requisições medidas e necessárias, logs sem dados sensíveis, avaliação de finalidade/retenção/acesso e dependências revisadas. Mudança de autenticação exige regressão; nenhuma crítica/alta conhecida sem correção permite declarar prontidão. Build efetivo deve passar teste de canários e frontend real. Registrar controles operacionais não verificados e GO/NO-GO, sem certificação automática.

## Planejamento por especialidade e homologação

Aplicar a [estratégia por especialidade](../estrategia/ecossistema-e-especialidades.md): Personal 1.0 é o foco até homologação ou exceção estratégica expressa. Antes de criar capacidade, consultar o [inventário](../produto/inventario-funcional.md) e justificar reutilização/especialização sem duplicar regras. O [roadmap](../planejamento/roadmap.md) define marcos, não autorização operacional. O [aceite Personal 1.0](../produto/personal-1.0.md) exige fluxos integrados web/mobile, evidências e decisão GO/NO-GO; código implementado e testes unitários não equivalem a produto homologado.
