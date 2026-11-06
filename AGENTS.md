<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Diretriz institucional da FormFisik

Toda nova documentação institucional e técnica deve seguir a [diretriz institucional](docs/institucional/diretriz-institucional.md).

- Tratar a FormFisik como empresa independente, fundada por Brandon Louis, com identidade, estratégia, produtos, operações e visão de crescimento próprios.
- Não apresentar a FormFisik como pertencente à Onebase, produto, divisão, subsidiária ou unidade de negócios da Onebase. Corrigir referências que indiquem essa relação atual.
- Manter missão, visão, valores e posicionamento próprios.
- Documentar separadamente estratégia empresarial, modelo de negócio, produto, arquitetura e roadmap.
- Não presumir compartilhamento de infraestrutura, dados, recursos financeiros ou propriedade intelectual com a Onebase.
- Registrar a independência empresarial como decisão estratégica.
- Preservar referências históricas relevantes à Onebase, identificadas como contexto anterior, sem atribuir a elas uma estrutura societária atual.
- Não presumir que a independência operacional signifique constituição jurídica ou estrutura societária já formalizadas.

# Desenvolvimento por entregas completas

Seguir a [política de desenvolvimento](docs/engenharia/politica-de-desenvolvimento.md). Planejar cada execução em torno de um objetivo funcional completo; dividir uma funcionalidade em até três entregas principais somente quando seu tamanho justificar. Esse limite não restringe operações técnicas internas.

- Inspecionar código e documentação, identificar requisitos e dependências e definir a abordagem antes de implementar.
- Concluir frontend, backend, persistência, validações, segurança, tratamento de erros e integração necessários ao escopo autorizado.
- Criar e executar testes adequados, atualizar a documentação e validar o resultado antes de declarar conclusão. Identificar explicitamente simulações e testes não executados.
- Toda alteração visual deve respeitar o Design System; atualizar sua documentação na mesma alteração quando houver novos componentes, padrões ou decisões visuais.
- Documentar módulos novos e alterações significativas, incluindo regras de negócio, contratos de API, modelo de dados e decisões arquiteturais relevantes.
- Não interromper uma entrega por conclusão de uma pequena subetapa nem impor limite artificial de tempo. Em bloqueio real, registrar evidência, trabalho concluído e pendências.
- Priorizar a aplicação web. React Native fica para fase futura. Railway é a hospedagem inicial. Autenticação web sem JWT. Manter arquitetura simples, segura e preparada para evolução.
- Seguir o [modelo de negócio](docs/estrategia/modelo-de-negocio.md); controlar assinatura e autorização no servidor, sem armazenamento próprio de dados completos de cartão.
- Ao concluir, informar funcionalidade, arquivos e módulos, regras implementadas, testes e resultados, documentação e limitações.

Estas regras orientam trabalho autorizado; seu registro não autoriza implementação, instalação ou deploy pendentes de aprovação.

# Organização e paginação de telas extensas

Nenhuma funcionalidade deve produzir páginas excessivamente extensas quando o conteúdo puder ser organizado em seções, etapas, abas, painéis progressivos ou listas paginadas sem prejudicar a experiência.

- Preferir paginação no servidor para listas e históricos; documentar tamanho, contagem, ordenação e páginas vazias. Preservar filtros e seleções durante a navegação.
- Não carregar milhares de registros para apenas ocultá-los no frontend.
- Organizar formulários extensos em seções recolhíveis, etapas ou subáreas contextualizadas; preservar alterações e avisar antes de descartá-las. Não dividir artificialmente formulários curtos.
- Limitar consultas de gráficos por período e volume, oferecer carregamento explícito e alternar indicadores quando a exibição simultânea tornar a página extensa.
- Priorizar dados efetivamente registrados nas comparações, mantendo acesso explícito a campos ausentes e sem esconder informação relevante silenciosamente.
- Em módulos anteriores, aplicar refinamentos seguros e necessários; registrar diagnóstico, proposta e prioridade no roadmap antes de mudanças profundas. Não refazer telas funcionais indiscriminadamente.

# Shell profissional obrigatório

O shell profissional da FormFisik deve preservar a sidebar na altura integral da viewport e oferecer rolagem independente do conteúdo principal. Novas páginas devem utilizar o shell compartilhado, sem criar estruturas próprias de rolagem global. Listagens extensas devem ser paginadas; formulários longos, organizados em seções ou etapas; e a navegação deve preservar filtros, seleções e alterações não salvas quando aplicável.

Utilizar `ProfessionalShell`: raiz com altura controlada, cabeçalho fora do scroll e `#app-content` como área de rolagem. Não acrescentar `overflow` global ou compensações de margem nas páginas. Marca e logout ficam acessíveis; somente a navegação lateral extensa rola. Verificar 1440/768/320 px, altura reduzida, teclado e texto a 200%.

Conteúdo absoluto e texto acessível oculto devem ter referência de posicionamento local e não podem ampliar a rolagem do documento externo. Verificar esse limite também com PDFs renderizados e dialogs abertos.

# Segurança e privacidade permanentes

1. Segredos nunca são expostos no frontend, props hidratadas, bundles ou artefatos públicos. Validar com canários sintéticos no build efetivo.
2. Todo endpoint privado exige autorização no servidor, além da autenticação.
3. Toda consulta privada deve aplicar isolamento de propriedade; UUID não é autorização.
4. Respostas devem conter o mínimo necessário, com DTO explícito e detalhes sob demanda.
5. Não realizar requisições desnecessárias; medir antes/depois e cancelar leituras obsoletas sem enfraquecer autorização.
6. Não registrar dados pessoais sensíveis, credenciais, cookies ou tokens em logs.
7. Toda funcionalidade com dados pessoais precisa de avaliação de finalidade, retenção e acesso.
8. Uploads e downloads privados exigem controle de acesso, limites, validação de conteúdo e tratamento de revogação.
9. Alterações de autenticação exigem testes de regressão, inclusive concorrência, expiração e revogação.
10. Nenhuma funcionalidade é considerada pronta com vulnerabilidade crítica ou alta conhecida; registrar bloqueio de produção explicitamente.
11. Novas dependências exigem análise de necessidade, manutenção, licença e segurança; não aplicar upgrades massivos sem regressão.
12. Segurança e privacidade são requisitos de aceite, não etapas opcionais. Consultar [controles e operação](docs/seguranca/controles-e-operacao.md) e o [inventário de tratamento](docs/privacidade/inventario-e-retencao.md).

# Documentação oficial e foco Personal 1.0

Consultar o [índice oficial](docs/README.md), o [inventário real](docs/produto/inventario-funcional.md), a [definição e critérios de homologação da Personal 1.0](docs/produto/personal-1.0.md), a [estratégia por especialidade](docs/estrategia/ecossistema-e-especialidades.md), a [arquitetura atual e evolução](docs/arquitetura/visao-atual-e-evolucao.md) e o [roadmap vigente](docs/planejamento/roadmap.md) antes de planejar novas entregas.

- Consolidar e homologar Personal 1.0 antes de implementar outra modalidade, salvo autorização estratégica expressa. Documentar possibilidades futuras não autoriza implementá-las.
- Avaliar reutilização sem duplicar regras críticas ou criar abstrações especulativas; preservar especializações de domínio e limites de finalidade/acesso.
- Distinguir pessoa, conta, perfil, organização, modalidade, serviço, vínculo e permissão como diretriz futura; não presumir entidades existentes nem refatoração autorizada. Múltiplos papéis não deverão exigir contas diferentes exclusivamente por modalidade.
- Separar Billing SaaS de Billing profissional. Stripe Connect é preferência futura condicionada à validação no Brasil; não presumir integração disponível.
- Registrar IMPLEMENTADO, PARCIAL, PREPARADO, NÃO IMPLEMENTADO, EM AUDITORIA, BLOQUEADO ou HOMOLOGADO com evidências e ambiente. Código local e testes controlados não comprovam produção ou homologação.
- Preservar entregas em andamento e decisões válidas. Segurança/LGPD exigem controles e evidências recorrentes; nenhuma declaração genérica substitui homologação. O NO-GO da 015 permanece até resolução documentada.

Estas referências complementam todas as instruções anteriores e não autorizam implementação, integração, operação financeira ou deploy por si mesmas.
