# Anamneses — refinamento visual de novembro/2026

FormFisik é empresa independente fundada por Brandon Louis. Entrega local, sem deploy, migration, dependência ou integração externa.

## Manifesto e funcionamento

- `src/modules/intake/area.tsx`: central com indicadores, busca, linhas de solicitações, orientação de convite, temas compartilhados.
- `src/modules/intake/builder.tsx`: seções numeradas, configuração lateral, cartões de perguntas visíveis, configuração pelo lápis e ações de salvar/publicar no cabeçalho; prévia/condições/limites preservados.
- `src/modules/intake/intake.module.css`: estilo claro/noturno e responsividade.
- `src/server/intake/repository.ts` e `handlers.ts`: busca literal parametrizada, nome vinculado com isolamento e contagens mínimas. Nenhuma resposta ou contato enviado na lista.
- `src/modules/professional/shell.tsx`: largura compartilhada para anamneses.
- `tests/intake.test.ts`: isolamento, indicadores, busca literal, páginas vazias e minimização.
- `tests/intake-e2e.ts`: aguarda carregamento antes do convite no contexto do aluno.
- Documentação: módulo, API, Design System e este relatório.

Preservadas todas as operações de publicar, duplicar, arquivar modelo, revisar, resolver identidade, revogar e solicitar novo preenchimento. Motor compartilhado com check-ins não muda finalidade nem autorização. Respostas não ficam editáveis após envio. Links só aparecem na criação; não há envio automático. Indicadores contam convites criados, aguardando válidos, respostas pendentes de revisão e revisadas, independentemente do filtro. Os números das imagens não foram inseridos no banco.

## Evidências e limites

17 testes de integração passaram em PostgreSQL auxiliar descartável, incluindo o novo caso de resumo/busca. ESLint `src tests`, TypeScript e build webpack passaram. Chrome/Axe nas duas telas, claro e escuro, 1920/1440/768/320px: sem violações detectadas e sem overflow externo. Artefatos: `test-results/local/intake-verification.json`, `intake-*.png`; logs `/tmp/formfisik-intake-*.log`. Validação automática não substitui revisão humana por leitor de tela.

A publicação explícita também está disponível no cabeçalho do editor de anamnese, após validação e salvamento do rascunho. Não foram adicionadas configurações de edição posterior ou recuperação de token da imagem por serem incompatíveis com as regras vigentes. A central permite convite de novo aluno ou seleção paginada da carteira; no perfil o aluno permanece fixo. Produção, dados reais, serviços externos e homologação ampla permanecem separados. Alterações pré-existentes no checkout foram preservadas.

Chrome E2E completo: PASS (`test-results/017/browser-proof.json`). Cobriu modelo personalizado/publicação, novo aluno, aluno existente, revisão, falha de rede/retry, links expirados/revogados/usados/inválidos, tipos de pergunta/condições, teclado, ausência de respostas em Web Storage, texto200% e Axe em320/375/768/1440. Evidências em `test-results/017/browser`. O teste foi ajustado para aguardar Resultados (hidratação/leitura concluída) antes do clique no convite do aluno.

## Correção de composição após comparação com as referências

A primeira reorganização não reproduzia a composição solicitada. A correção substitui a lista por tabela, move convite e orientação para a coluna direita e mantém filtros dentro do cartão de solicitações. O editor abandona perguntas recolhidas por padrão: apresenta cartões com amostras dos campos, controles compactos e três painéis completos, sem compensações de grid por quantidade de perguntas. Título e descrição reais aparecem no cabeçalho. Controles sem contrato existente (editar respostas originais, recuperar tokens e arquivar respostas) não foram inventados.

Manifesto desta correção: `area.tsx`, `builder.tsx`, `intake.module.css`, `tests/intake-e2e.ts`, documentação do módulo, Design System e este relatório. Sem migration ou dependência nova. O teste E2E inclui editar descrição pelo lápis e fechar configuração; convite aguarda dados/hidratação antes de ser habilitado.

Validação da correção: 17/17 testes de integração, TypeScript, ESLint em `src tests` e build de produção webpack aprovados. E2E Chrome aprovado, incluindo edição pelo lápis, publicação no cabeçalho, convite de novo aluno/existente, preenchimento, revisão e teclado. Chrome/Axe claro e escuro nas larguras 1920/1440/768/320 sem violações detectadas ou rolagem externa. O teste de teclado aguarda a tabela antes de focar o botão de convite (desabilitado durante carregamento). Documentação e Design System atualizados; servidor local mantido disponível em `/anamneses`. Não equivale a homologação de produção.
