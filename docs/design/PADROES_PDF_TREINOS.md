# Padrões visuais de fichas — 011.5

FormFisik, empresa independente fundada por Brandon Louis. Documento de apresentação, sem alteração do domínio da prescrição.

| Elemento | Compacta | Premium |
| --- | --- | --- |
| Formato | A4 branco, margens 42pt | A4 branco, margens 42pt |
| Cabeçalho | Regra verde fina, marca discreta | Acento curto verde e linha editorial |
| Nome do aluno | 19pt negrito | 30pt negrito |
| Planejamento | 11pt negrito | 16pt negrito |
| Objetivo | Label e texto | Superfície clara, destaque na abertura |
| Divisão | 13pt + barra fina | Faixa preta, título branco 18pt, número 20pt em campo claro |
| Exercício | Ordem textual + nome 10,5pt | Marcador numérico preto + nome 12pt |
| Série | Linha em tabela 9,5pt | Linha editorial, prescrição 13pt e parâmetros 10pt |
| Notas | 9pt fora das células estreitas | 9pt fora das células, separação leve |
| Rodapé | Assinatura 8pt e página | Assinatura 8pt e página |

Fonte DejaVu Sans regular/negrito já incorporada/licenciada. Preto #161A18, cinza #536059, verde #96D100, superfície #F1F4EF e linhas #D8DFD8. Verde restrito ao acento, nunca único identificador. Testar cinza para conservar hierarquia de número/nome/faixa/negrito. Não usar degradês, sombras, imagens genéricas, páginas escuras ou fonte menor para forçar conteúdo.

Abertura: marca/logo se selecionadas e cadastradas, aluno, plano, objetivo Premium, responsável histórico e apresentação atual explicitamente separados, registro declarado não verificado/contato público opcionais, emissão/revisão/versão/período. Não substituir identidade autenticada pela marca. Logo mantém proporção em fit, até 100 × 48pt Premium/82 × 37pt Compacta; marca ao lado ou sozinha quando não há logo. Sem placeholder gráfico em ausência.

Divisão usa ordem canônica, título e descrição. Grupos trazem sequência de membros/posição do exercício, descanso entre voltas e notas selecionadas; exercício informa passo no grupo sem inferir execução. Séries individuais preservam formato/ordem, etapas drop/retomada, cargas/unidades e tempos. Linha mais densa evita repetir labels grandes em cada série; coluna Realizada ou espaço de anotação aparece só quando selecionado. Notas/tempo de execução não são suprimidos para diminuir páginas.

Quebra: reservas medidas a partir das mesmas linhas desenhadas. Exercício pequeno permanece inteiro quando couber; extenso pode continuar com contexto e cabeçalho de tabela. Notas longas não reservam uma página inteira automaticamente; label acompanha ao menos duas linhas. Nova divisão atualiza contexto antes da decisão de quebra, evitando referência à anterior. Cabeçalho/rodapé ficam fora do corpo até y=778pt, rodapé em y=805pt; não cortar texto para atingir altura fixa. Estado RASCUNHO e contexto histórico em cada página.

Validação: capturar snapshots sintéticos do harness PostgreSQL, congelar entrada/emissão, gerar antes/depois e comparar SHA-256 da entrada, páginas, bytes e conteúdo canônico. Renderizar Poppler, verificar coordenadas e inspecionar imagens de todos os casos, incluindo cinza, nomes extensos, séries longas e marcas de proporções diferentes. Texto extraído complementa, não substitui a inspeção visual. Artefatos não contêm dados de clientes reais. Nenhuma certificação WCAG/PDF-UA, validade jurídica ou homologação clínica é atribuída por este padrão.
