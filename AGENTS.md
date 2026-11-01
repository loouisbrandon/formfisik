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
