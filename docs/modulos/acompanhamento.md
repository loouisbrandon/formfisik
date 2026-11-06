# Acompanhamento físico — entregas 012 e 013

A FormFisik é empresa independente fundada por Brandon Louis. Módulo exclusivamente web para o profissional autenticado e confirmado, com acesso comercial canônico. A 013 acrescenta fotografias privadas e calendário. Não inclui portal do aluno, IA, diagnósticos, recomendações, teleconsulta ou PDF de acompanhamento.

## Operação

`/acompanhamento` apresenta a carteira ativa paginada no servidor (20 alunos), com busca por nome, situação administrativa, ordenação e painel de atenção. O botão Nova avaliação reutiliza `StudentsPicker` em dialog acessível. Selecionar abre `/acompanhamento/[studentId]`; o identificador é o **vínculo privado `student_links.id`**, não uma identidade global. A ficha cadastral oferece o link “Acompanhamento físico”. Alunos arquivados continuam acessíveis por sua ficha; alterações exigem reativar primeiro o vínculo.

A página individual apresenta a avaliação ativa mais recente, sem completar suas lacunas com dados antigos; histórico por data decrescente, com desempate por criação e UUID; criação, edição, detalhes, arquivamento e reativação. Histórico de avaliações tem 20 itens por página e filtro para incluir arquivadas. Não há exclusão silenciosa. Avaliações arquivadas deixam gráficos e comparações automáticas; continuam consultáveis e comparáveis por seleção explícita.

Uma avaliação tem data obrigatória; peso, 14 medidas e observações opcionais. Todos os campos podem estar ausentes, inclusive em registro somente datado: avaliações parciais são admitidas e nunca recebem valores automáticos anteriores. A autoria é o UUID do profissional, apresentado com seu nome atual. Criação e atualização têm instantes reais do servidor. Edição exige versão positiva vigente; conflito 409 preserva a versão que ganhou, não sobrescreve medidas. O formulário mantém o conteúdo conflitante e pede recarregar antes de nova tentativa. Cancelar edição modificada exige confirmação; fechamento/recarregamento da aba tem aviso do navegador. Navegar por links do shell durante a edição também pede confirmação de descarte. Ao cancelar, a página recarrega o estado atual do histórico. Não há rascunho persistido nem armazenamento de saúde em Web Storage.

## Validações e datas

- Peso: maior que zero e até **500,00 kg**.
- Pescoço, ombros, tórax, cintura, abdômen, quadril, braços direito/esquerdo, antebraços direito/esquerdo, coxas direita/esquerda e panturrilhas direita/esquerda: maior que zero e até **400,00 cm** cada.
- Valores em strings decimais, uma vírgula ou ponto, até duas casas; normalização para duas casas. Números JSON, sinais, notação exponencial, infinito, zero, negativos e casas excedentes são rejeitados. Campo vazio do formulário vira `null`, nunca zero.
- Limites são barreiras técnicas amplas contra erros de digitação. Não representam faixas clínicas, classificação corporal ou validação da técnica de medição. Não se calcula IMC, gordura corporal ou diagnóstico.
- Data civil ISO `YYYY-MM-DD`, válida entre 1900-01-01 e hoje em **America/Sao_Paulo**. PostgreSQL `DATE`, leitura com `to_char`; UI formata partes da string, sem converter a data para um instante. Não há deslocamento por fuso. Instantes administrativos ficam em `timestamptz`, apresentados com data/hora em Brasília e rótulo explícito.
- Até 3.000 caracteres de observações NFC, sem caracteres de controle proibidos; finalidade específica de acompanhamento. Não reutiliza observações administrativas do cadastro.
- Múltiplas avaliações na mesma data são permitidas: registros independentes, não substituição. A mais recente é definida por data, instante de criação e UUID. O histórico mostra prefixo do UUID para distingui-las. Datas/medidas podem ser corrigidas via edição auditada.

## Evolução e comparação

Dois gráficos de pontos independentes: peso em kg e medida selecionada em cm. X utiliza a distância temporal real entre datas; Y mostra a escala numérica da grandeza selecionada. Pontos na mesma data compartilham X; a tabela distingue todos os registros. Não há linha interpolada, preenchimento de lacunas, média, suavização ou mistura de unidades. Zero medições tem estado vazio; uma medição informa dados insuficientes para evolução. Há valores mínimo/máximo e limites de escala, datas de início/fim e títulos dos pontos. Tabela acessível por teclado contém data, valor/unidade e identificador, incluindo todas as medições carregadas.

Períodos relativos a hoje em Brasília: últimos 30 dias (hoje e 29 anteriores), 90 dias (hoje e 89 anteriores), seis e doze meses civis segundo aritmética PostgreSQL, ou histórico completo. Só entram medições realmente preenchidas e avaliações ativas; ausência em outra medida não invalida a avaliação inteira. Consulta paginada em 500 pontos, com total, aviso explícito de incompletude e ação “Carregar mais pontos” até concluir. Não há amostragem nem corte silencioso. Uma alteração concorrente durante paginação pode mudar a composição; recarregar recompõe o histórico atual.

Comparações automáticas: primeira e mais recente; anterior e mais recente, sempre entre registros ativos. Com menos de dois registros, estado insuficiente. Comparação manual: dois registros distintos do mesmo vínculo, inclusive arquivados, escolhidos entre a página do histórico e referências primeira/anterior/mais recente; seleção é mantida ao paginar para localizar outro registro. O intervalo em dias é absoluto; diferenças são direcionais **comparação menos referência**, mesmo se a seleção manual inverter datas. Mesma data resulta em zero dias.

Diferenças usam centésimos inteiros e cálculo racional com BigInt, arredondamento percentual para duas casas (metade afastada de zero). Percentual = diferença / referência × 100. Ausência de qualquer valor implica diferença e percentual não calculáveis; referência zero também impede percentual (defesa adicional, embora o cadastro atual rejeite zero). Não se infere que aumento ou redução seja positivo ou negativo para a saúde.

## Dashboard

Três indicadores derivados do banco e restritos à carteira ativa do proprietário:

1. Alunos com avaliações: ao menos uma avaliação ativa, independentemente da data.
2. Avaliações em 30 dias: avaliações ativas, em alunos ativos, de hoje e 29 dias anteriores em Brasília; múltiplos registros do dia contam separadamente.
3. Sem avaliação recente: alunos ativos sem avaliação ativa nessa janela, incluindo nunca avaliados.

Arquivar aluno o remove desses indicadores; arquivar avaliação a remove dos cálculos. São métricas administrativas, não alertas ou conclusões clínicas.

Veja [API e modelo](../engenharia/api-acompanhamento.md), [privacidade](../privacidade/acompanhamento.md), [ADR](../arquitetura/ADR-012-acompanhamento.md) e [relatório](../engenharia/entrega-012.md).


## Fotografias e navegação — entrega 013

Avaliações, Evolução e Fotografias são painéis progressivos. Gráficos e calendário compartilham período, e somente o indicador ativo consulta pontos. Comparação de medidas e detalhes priorizam campos preenchidos e permitem expandir todos os ausentes; não alteram os valores/cálculos da 012. Regiões do formulário de medidas são recolhíveis e abrem quando contêm erro. Rascunhos/filtros ficam preservados entre painéis; saída por link ou descarte pede confirmação quando existem alterações.

Fotografias possuem registro/data próprios, notas de até 1.000 caracteres e autorização específica; não exigem avaliação no dia. O fluxo registra autorização antes de oferecer upload real. Cadastro de aluno não é consentimento. É possível adicionar várias imagens, repetir posição, substituir com segurança, editar data/notas, arquivar/reativar e solicitar remoção com motivo. Posições Frente, Costas, Perfil direito/esquerdo e Outra (descrição obrigatória). Máximo 12 imagens por registro. Arquivadas permanecem em consulta privada, mas saem do calendário e das escolhas de comparação. Aluno arquivado permite consulta e remoção, sem novas alterações.

Histórico fotográfico tem filtros de data, posição e estado e páginas de 10; operações têm autoria/versão/instante e páginas de 20, sem cópias antigas dos conteúdos. Criação/upload/remoção usam chaves idempotentes e versão otimista. Substituição só bloqueia a imagem anterior após confirmar a nova; falha conserva a antiga. Remoção integral revoga autorização e bloqueia leitura imediatamente, com estado pendente até apagar objetos e metadados descritivos.

Em Evolução, select no topo direito alterna Gráficos/Calendário sem perder aluno/período. Mês mostra A/F/A+F, ano mostra 12 meses e contagens. Selecionar data consulta até 10 avaliações e 10 registros fotográficos por página. Medidas/observações são consultadas no detalhe; fotografias abrem o registro privado. Indicadores são agregações, sem bytes. Datas brasileiras sem conversão para instante. Arquivamento e exclusão atualizam presença.

Comparação fotográfica: duas datas e uma posição, escolha entre múltiplas imagens, troca de datas, duas imagens lado a lado preservando proporção, ampliação individual acessível e estados sem correspondente. Sem análise/estimativa/diagnóstico/IA. Não há compartilhamento público. A 013 não inseria fotos em PDFs; a 014 permite exportação opcional mediante autorização específica adicional, conforme a seção de relatórios abaixo.

Sem configuração R2, novo registro e upload ficam indisponíveis com aviso verdadeiro. Metadados/avaliações/calendário continuam funcionando. Configuração presente não comprova conexão: a confirmação depende da operação efetiva. Armazenamento controlado existe exclusivamente em testes.

Consulte [contratos/modelo](../engenharia/api-fotografias.md), [privacidade](../privacidade/fotografias.md), [R2 e recuperação](../operacao/fotografias-r2.md), [ADR 013](../arquitetura/ADR-013-fotografias-privadas.md) e [relatório 013](../engenharia/entrega-013.md).

## Relatórios físicos — 014

Acompanhamento e ficha do aluno oferecem Exportar relatório, com período, conteúdos, comparação, Compacto/Premium, prévia PDF.js e download privado. Dados/precisão/cálculos deste módulo são reutilizados; não há reconstrução clínica nem dados inventados. Fotos opcionais exigem autorização nova para documento compartilhável. Ver [módulo](relatorios-fisicos.md). O shell mantém cabeçalho/sidebar estáveis e painéis, períodos e seleção em memória, sem Web Storage.


## Refinamento visual — novembro de 2026

Carteira e detalhe utilizam o shell compartilhado e tokens dos temas claro/noturno. A carteira reutiliza `assessmentCounts`: alunos com avaliações ativas, avaliações em 30 dias e alunos sem avaliação recente. O painel de atenção mostra até cinco alunos sem avaliação ativa em 30 dias; “ver todos” aplica o filtro. Não existe prazo clínico presumido nem revisão profissional inventada.

O detalhe abre em Resumo da evolução, com peso/data da última avaliação e contagem do histórico segundo o filtro ativo. Reutiliza `EvolutionWorkspace`, calendário, gráficos de pontos e últimas medidas; Avaliações e histórico preserva comparação, edição e auditoria; Fotografias preserva autorizações e operações existentes. Agenda é navegação explícita, sem data de retorno sugerida automaticamente. Os gráficos continuam sem interpolação e sem gordura corporal estimada. Dados da referência visual não foram inseridos na carteira.
