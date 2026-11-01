# Entrega 011.5 — Refinamento visual dos documentos de treinamento

A FormFisik é empresa independente, fundada por Brandon Louis. Esta entrega altera exclusivamente a apresentação PDFKit dos documentos de treinamento e a validação visual; não reconstrói o módulo 011.

## Resultado visual

Premium: composição inicial com marca/logo proporcional quando presentes, aluno em 30pt, planejamento em 16pt, objetivo destacado em superfície clara e identificação profissional/documental separada. Primeira divisão acompanha a apresentação quando couber; não se cria capa exclusiva. Divisões têm faixa preta, número em campo claro e acento verde restrito; a estrutura permanece distinguível em cinza. Exercícios têm número em marcador preto, nome em negrito e técnica/referência/participação no grupo em linha secundária. Séries passam de cards grandes a linhas técnicas alinhadas, com prescrição 13pt, parâmetros 10pt e campos de anotação proporcionais. Cabeçalhos comuns evitam repetir rótulos em cada série.

Compacta: branco dominante, faixa verde fina, títulos compactos, tabela 9,5pt com prescrição em negrito, cargas/descanso centralizados, linhas leves e espaçamento regular. Colunas respondem às opções existentes; observações não são comprimidas em células estreitas. Mantém impressão econômica, sem faixa preta por divisão.

Ambos reutilizam DejaVu Sans regular/negrito licenciadas, PDFKit, A4, margens 42pt e rodapé “Produzido com FormFisik”. Não foram adicionados fontes, bibliotecas ou assets. Não há imagens genéricas, logos gerados no produto, gradientes, sombras ou texto motivacional inventado. PNGs geométricos são fixtures sintéticas de testes de proporção.

## Paginação e fidelidade

Medição de linhas e alturas compartilhada entre reserva e desenho. Reservas mantêm exercícios pequenos juntos; exercícios extensos continuam em páginas seguintes, com contexto da divisão/exercício e cabeçalho de parâmetros repetido. Notas longas começam com título e ao menos duas linhas; notas curtas ficam juntas. Rótulo de continuação é atualizado antes da quebra, sem citar o exercício anterior. Correção visual de reserva de poucos pontos evita páginas quase vazias desnecessárias. Séries e etapas mantêm numeração explícita; grupo registra ordem de membros e a participação/passo aparece também junto ao exercício. Não infere sincronização, execução ou recomendação.

O conteúdo vem dos mesmos objetos canônicos/snapshots usados pela 011. Parâmetros de repetição, faixa, falha, tempo, por lado, execução, carga/unidade, descanso, fases, grupos, notas e identidade são preservados. Estado rascunho, arquivo e contexto histórico continuam textuais em todas as páginas. Nome histórico e apresentação atual permanecem distintos; registro declarado não se torna credencial verificada.

## Escopo e arquivos

Runtime alterado: somente `src/server/workout-documents/pdf.ts`. As funções públicas e opções permanecem idênticas. PDF.js/preview, geração, download, endpoints, contratos, propriedade, sessões, Stripe, autorização, persistência, migrations, uploads, expiração e versionamento permanecem inalterados.

Testes: `tests/workout-documents.test.ts` captura opcionalmente snapshots sintéticos e ajusta a asserção do número do exercício à composição visual; `tests/workout-pdf-visual.ts` gera matriz com emissão fixa; `tests/check-workout-pdf-content.ts` confere campos/ordem/parâmetros antes/depois; `tests/render-workout-refinement.py` renderiza, mede coordenadas e cria comparações/cinza; runner `tests/workout-documents-e2e.ts` aceita diretório de evidências e quantidade de páginas variável. Helper `tests/helpers/workouts-browser-server.ts` permite fixture mais extensa apenas no processo de teste para exercitar paginação. Nenhuma flag de teste entrou no produto.

Documentação: este relatório, Design System, módulo de exportação, padrão visual de PDFs, CHANGELOG, roadmap e README. Regras comerciais e relatórios históricos anteriores não são reescritos.

## Método de comparação

Preservados PDFs e renderer original da 011 em `test-results/011.5/original/`. Executado harness existente em PostgreSQL descartável, capturando dez snapshots reais de teste e a apresentação autorizada. Oito variantes sintéticas adicionais exercitam ABC Compacto, muitas divisões Premium, nomes longos sem notas, logos horizontal/quadrado, palavras sem espaço, 50 séries e pirâmide. Tudo permanece fora do runtime.

As 18 entradas são congeladas em `comparison-inputs.json`; a mesma entrada SHA-256 e emissão fixa geram cada PDF antes/depois. Não se trocam alunos, exercícios ou parâmetros para aparentar melhoria. `before-metrics.json`, `after-metrics.json` e `comparison.json` registram páginas/bytes e hash. A comparação de texto usa dados canônicos, descontando apenas cabeçalhos/rodapés repetidos, e não substitui a revisão visual. A matriz contém os 13 casos solicitados e os casos adicionais de personalização/paginação.

## Métricas

| Caso (entrada idêntica) | Páginas antes → depois | Bytes antes → depois |
| --- | ---: | ---: |
| abc | 3 → 2 | 26.558 → 25.598 |
| compacta-simples | 1 → 1 | 23.111 → 23.451 |
| historica | 1 → 1 | 23.098 → 23.709 |
| muitas-divisoes | 7 → 6 | 33.594 → 32.883 |
| opcionais-ausentes | 1 → 1 | 20.505 → 20.589 |
| personalizada | 12 → 8 | 45.263 → 40.232 |
| premium-simples | 1 → 1 | 22.989 → 23.612 |
| rascunho | 2 → 2 | 25.217 → 25.509 |
| tecnicas | 13 → 7 | 45.715 → 37.974 |
| textos-longos | 15 → 11 | 51.895 → 46.272 |
| compacta-abc | 2 → 2 | 25.217 → 25.509 |
| premium-muitas-divisoes | 12 → 7 | 42.621 → 34.754 |
| nomes-longos | 2 → 2 | 25.342 → 25.691 |
| marca-horizontal | 2 → 1 | 25.991 → 25.377 |
| marca-quadrada | 2 → 1 | 25.250 → 24.787 |
| palavras-longas | 3 → 2 | 26.634 → 25.587 |
| series-extensas | 9 → 5 | 38.525 → 32.174 |
| piramide | 1 → 1 | 22.660 → 23.250 |

Total da matriz: **89 → 61 páginas**. Nenhum caso aumentou em páginas. Pequenos aumentos de bytes em fichas curtas correspondem à tipografia/composição vetorial e não a mídia nova; os documentos continuam pequenos. Não houve redução de dados. ABC e séries extensas diminuíram por linhas mais densas, reservas ajustadas e eliminação de quebras evitáveis. Notas extensas podem ocupar páginas adicionais em outros conteúdos, pois não são truncadas.

Fontes da métrica: `test-results/011.5/comparison.json` (bytes exatos, não KiB arredondados); entrada SHA-256 igual nos dois lados e emissão fixa 01/11/2026 12:00 Brasília. Os PDFs de referência são aqueles gerados antes da alteração nesta execução, sem depender de datas/fixtures de execuções anteriores.

## Validação

| Verificação executada | Resultado |
| --- | --- |
| Referência 011, PostgreSQL descartável | 10/10 grupos aprovados; captura dos snapshots antes da alteração |
| `npm test` | 138/138 aprovados, zero falhas/skips; 213,5 s |
| Integração final da 011 após última alteração visual | 10/10 aprovados; 43,8 s |
| Comparação canônica | 36 PDFs (18 pares) aprovados: conteúdo, ordem de exercícios/séries/parâmetros, grupos, notas, identidade, estado e revisão |
| Comparação de entradas | SHA-256 idêntico em cada par, emissão fixa; métricas completas na tabela |
| Poppler/QA | Todos os 61 renders finais em A4, palavras dentro das margens e nenhuma colisão textual detectada |
| Inspeção direta | Todas as páginas finais em contatos, com casos de borda ampliados; primeira/intermediária/última e escala de cinza revisadas |
| TypeScript / ESLint | Aprovados, sem erros ou avisos |
| Build webpack | Aprovado; PDFKit/fontes/PDF.js reutilizados |

A matriz final cobre os 13 casos solicitados e acrescenta 50 séries, palavras sem espaço, pirâmide explícita e formatos de logo. A comparação confirma que reduzir páginas não removeu dados. Foram corrigidos rótulos de continuação com contexto anterior, reserva que quebrava por poucos pontos e última série isolada; altura/linha/área de anotação mantêm os tamanhos técnicos sem compressão de fonte.

Os ajustes de teste preservam as verificações: a numeração visual Premium passou a marcador separado, portanto a conferência do exercício 80 usa ordem textual bruta em vez de exigir “80. Nome” na mesma linha; a navegação de prévia usa contagem real de páginas. A fixture densa cria 12 séries somente no harness explicitamente controlado para exercitar mudança de página após a redução de volume do documento.

## Limitações

A4 exige zoom no celular para consulta ampliada; PDF.js e opção de abrir/baixar continuam existentes. Espaço em branco é mantido quando necessário para conservar um bloco pequeno, sem fonte minúscula ou remoção de informação. Grandes grupos/notas podem continuar por página com contexto; não é diagramação manual individual de cada ficha. DejaVu cobre os caracteres portugueses testados, sem promessa universal de alfabetos. Revisão/axe não são certificação PDF/UA, WCAG, validade jurídica ou homologação clínica.

As pendências operacionais da 011 continuam: aplicar migrations anteriores no ambiente alvo, agendar limpeza e homologar Stripe quando houver chaves. A 011.5 não exige nova migration, credencial, serviço ou configuração de armazenamento. Não houve deploy ou commit.

## Evidências e reprodução

- [Premium final](../../output/pdf/011.5/premium-simples.pdf), [Compacta final](../../output/pdf/011.5/compacta-simples.pdf).
- [Antes/depois Premium](../../test-results/011.5/compare-premium-simples.png), [Compacta](../../test-results/011.5/compare-compacta-simples.png), [ABC](../../test-results/011.5/compare-abc.png), [técnicas](../../test-results/011.5/compare-tecnicas.png).
- [ABC final](../../output/pdf/011.5/abc.pdf), [técnicas](../../output/pdf/011.5/tecnicas.pdf), [textos extensos](../../output/pdf/011.5/textos-longos.pdf), [marca horizontal](../../output/pdf/011.5/marca-horizontal.pdf), [marca quadrada](../../output/pdf/011.5/marca-quadrada.pdf), [50 séries](../../output/pdf/011.5/series-extensas.pdf).
- [Premium cinza](../../test-results/011.5/after/premium-simples/grayscale.png), [Compacta cinza](../../test-results/011.5/after/compacta-simples/grayscale.png).

Artefatos locais ignorados pelo Git; somente dados sintéticos. `output/pdf/011.5/` contém os 18 documentos finais e `test-results/011.5/after/` suas páginas completas/contatos/cinza. Os originais da 011 foram copiados antes de executar o harness em `test-results/011.5/original/`; `before/` preserva a comparação com as entradas congeladas.

Preparação usada: PostgreSQL descartável `_test`, execução de `PDF_VISUAL_CAPTURE=1 … tests/workout-documents.test.ts` captura snapshots no diretório de fixtures. `node --conditions=react-server --import tsx tests/workout-pdf-visual.ts before` foi executado com o renderer original antes de editar, guardado por checksum para impedir substituir acidentalmente a referência 011. Após refinar, `… tests/workout-pdf-visual.ts after`, `… tests/check-workout-pdf-content.ts` e `python3 tests/render-workout-refinement.py`. Não executar before com renderer refinado ou tratar novo conteúdo como a referência original. A comparação-inputs preservada permite repetir after sem banco, sempre com os mesmos dados. O harness de integração usa banco isolado para validar geração real/guards/snapshots.

A auditoria por SHA-256 do início/fim confirma que, entre `src`, `db`, `scripts` e `assets`, somente `src/server/workout-documents/pdf.ts` mudou; nenhum arquivo de runtime foi acrescentado. Evidência em `test-results/011.5/runtime-audit.json`. As alterações do checkout anteriores à 011.5 foram preservadas.

### Experiência de prévia preservada

A prévia usa o mesmo PDF.js/worker e bytes do endpoint existente, sem uma segunda versão HTML. E2E final aprovado: personalização/logo real, opções/divisões, Premium/Compacta, erro/retry de geração e carregamento da prévia, navegação em documento de duas páginas, foco/teclado, histórico e download idêntico byte a byte. Axe em cinco estados × 1440/768/320 sem violações nas regras executadas; reflow e texto 200% aprovados. [Prévia final desktop](../../test-results/011.5/browser/preview-1440.png), [detalhe do documento](../../test-results/011.5/browser/preview-document-detail.png), [320px](../../test-results/011.5/browser/preview-320.png). A interface do produto não foi redesenhada nesta entrega.

## Encerramento

Regressões finais aprovadas: exportação Chrome (59,6 s), Alunos/PDFs (54,0 s) e Treinos/Modelos/aplicação (81,4 s). A integração da 011 foi repetida na versão final: 10/10, 43,8 s. `npm test` passou 138/138; cobre também autenticação, sessões, recuperação, assinatura/autorização e módulos anteriores. Os demais runners Chrome de autenticação/dashboard/exercícios não foram repetidos nesta entrega visual; os runners relevantes à apresentação e integração de PDFs foram executados e estão nos logs. Nenhuma suíte declarada aprovada sem execução.

Build de produção final, TypeScript, ESLint e `git diff --check` aprovados. Logs: `test-results/011.5/logs/`; métricas/hashes/conteúdo/revisão visual no mesmo diretório de evidências. Nenhuma nova pendência funcional ou dependência de infraestrutura foi criada. Permanecem as limitações e pendências operacionais anteriores documentadas acima.

Servidores e diretórios temporários dos harnesses encerrados/removidos pelos runners. PostgreSQL descartável `formfisik-0115-test` parado/removido após os testes; portas de teste conferidas sem listeners. Banco existente, credenciais, regras comerciais, segurança, contratos e dados canônicos preservados. Nenhum commit ou deploy foi realizado.
