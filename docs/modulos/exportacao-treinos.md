# Exportação profissional de fichas — 011

A FormFisik é empresa independente fundada por Brandon Louis. Exportação web privada de prescrições individuais reais, para compartilhamento manual pelo profissional. Não envia documentos, não cria acesso de aluno e não altera assinatura, estado da ficha ou dados técnicos.

## Uso

Na ficha individual, no histórico ou nos treinos do perfil do aluno, selecione **Exportar PDF**. `/treinos/:id/exportar?version=n` carrega uma revisão autorizada; sem parâmetro, usa a atual. O seletor lista revisões com estado/data e paginação de 20 para alcançar as anteriores. Modelos não são exportáveis: aplique a um aluno e revise a ficha resultante.

Escolha Compacta ou Premium; todas ou determinadas divisões; cargas sugeridas; observações de divisão/exercício/série/grupo; orientações gerais da ficha; espaços para anotar cargas no papel; identificação profissional; marca, se cadastrada. Descrição da divisão, objetivo, repetições, tempos, ordem, técnica e contexto documental são preservados. Sem divisões, o rascunho declara a ausência; seleção parcial vazia é impedida. Observações administrativas, nascimento, telefone e e-mail do aluno não entram neste PDF.

**Gerar prévia real** valida no servidor e cria um único PDF. O visualizador PDF.js local e o download autenticado leem os mesmos bytes armazenados. Não existe reprodução HTML do documento. Ao mudar opções/versão ou salvar apresentação, a prévia é retirada e deve ser gerada novamente. O download verifica novamente sessão e autorização; falhas/expiração não são exibidas como sucesso. A prévia renderiza uma página por vez, ajustada à tela, com anterior/próxima, texto auxiliar para tecnologia assistiva e retry. Também há Abrir prévia em outra aba e Baixar PDF. Alterar a página não salva opções automaticamente.

## Fonte e versão documental

`getPlan` da 010 recupera `workout_versions.document`, estado e identidade do snapshot e os nomes de `exercise_versions.definition` pela projeção referenciada. Não consulta nomes atuais do catálogo para reconstruir a ficha. Datas de emissão e de registro da revisão são distintas. Identidade autenticada na revisão permanece explícita; apresentação personalizada atual é rotulada separadamente. Exportação não reescreve snapshots nem concede atribuição de propriedade a marcas/nomes informados.

O PDF registra número da versão, estado e contexto histórico na emissão. Rascunho informa **RASCUNHO — NÃO É PRESCRIÇÃO FINAL** em todas as páginas; ativo tem emissão normal; arquivado é identificado. Revisão anterior diz VERSÃO HISTÓRICA. Um PDF já gerado é imutável durante sua disponibilidade: alterações posteriores da ficha ou apresentação só aparecem em nova emissão.

Séries são individuais, sem agrupar parâmetros diferentes em um único “3 × 12”. Repetições fixas, intervalo, por lado, falha, segundos, execução, cargas kg/lb/%/peso corporal e ausência de parâmetros permanecem explícitos. Drop e rest-pause numeram série/etapa e distinguem redução/retomada. Bi-set, tri-set, superset e circuito mostram sequência numerada de membros e posições da divisão, descanso entre voltas e notas selecionadas. Pirâmide é preservada pelas linhas ordenadas de carga/repetição, sem detecção/recomendação automática. Não há cálculo de carga ou motor de execução.

## Apresentação persistente

Seção **Personalizar apresentação profissional** no próprio fluxo. Nome profissional (160), marca (160), registro (100), contato público (200), todos opcionais; validação NFC, limites e rejeição de controles. Registro é declarado pelo titular e explicitamente **não verificado**. Nenhum nome, título, CREF ou certificação é gerado. Salvar não altera `users`, credenciais, permissões ou snapshots. Versão otimista exige recarregar em conflito; campos não salvos não entram no documento.

Logo opcional: PNG/JPEG estático até 256 KiB e 2000 × 2000, até quatro milhões de pixels. Assinatura binária é apenas pré-filtro; Sharp decodifica com falha em conteúdo suspeito, confere formato/dimensões/frames, orienta, reduz a no máximo 600 × 600 e regrava PNG sem metadados. SVG, URLs, animação, imagem truncada ou conteúdo inválido são rejeitados. Bytes canônicos privados em PostgreSQL `bytea`, um por proprietário, substituição/exclusão explícitas ao salvar. Não depende do filesystem efêmero Railway, bucket ou endereço público. Imagem ausente não cria logotipo fictício. A figura verde nos artefatos de teste é exclusivamente uma fixture de validação, nunca marca de produção.

## Layouts

**Compacta (refinamento 011.5):** A4 branco, margens 42pt, cabeçalho discreto, aluno 19pt, planejamento 11pt e divisões 13pt. Tabela técnica 9,5pt, prescrição em negrito, valores de carga/descanso centralizados, cabeçalhos 8pt repetidos nas continuações. Separadores suaves e colunas proporcionais às opções. Impressão econômica, sem faixas escuras dominantes.

**Premium (refinamento 011.5):** aluno 30pt, plano 16pt, objetivo destacado e marca/logo em cabeçalho proporcional. Divisões em faixa preta com número de 20pt em campo claro e acento verde; nome de divisão 18pt. Exercícios com marcador numérico, nome 12pt, técnica e passo no grupo. Séries em linhas técnicas, prescrição 13pt e parâmetros 10pt, em lugar de cards grandes por série. Os dados se alinham sob cabeçalho comum; campo de carga realizada é espaço para anotar no papel, não AcroForm nem histórico. Sem capa decorativa. Identidade e informações documentais secundárias preservadas.

Ambas: DejaVu Sans regular/negrito local licenciada, texto selecionável e acentuação portuguesa, preto/cinza/verde #96D100 e contraste independente da cor. Medição compartilhada para reserva/desenho; blocos pequenos ficam juntos e extensos continuam com contexto e cabeçalhos repetidos. Notas curtas ficam juntas, longas podem continuar. Rodapé “Produzido com FormFisik” e paginação em todas as páginas. Logo usa fit sem distorção, com área limitada e nome da marca ao lado quando presente. A4 pode exigir zoom no celular; sem alegação PDF/UA, assinatura digital, validade jurídica ou homologação clínica. [Padrão visual](../design/PADROES_PDF_TREINOS.md), [comparação e validação 011.5](../engenharia/entrega-011.5.md).

## Persistência, limites e operação

Migration aditiva `011_workout_documents.sql`: `professional_presentations` por usuário (campos, logo, revisão); `workout_documents` com proprietário, ficha/revisão por FK composta, nome seguro, bytes, emissão/expiração. Não duplica a prescrição: é artefato temporário de uma revisão existente.

Disponível por 15 minutos, até três PDFs recentes por profissional; novas gerações removem expirados/antigos desse proprietário sob lock transacional. Leitura não prolonga prazo. `npm run db:cleanup` elimina documentos expirados globalmente; agendar a rotina existente no ambiente operacional. O endpoint rejeita expirados mesmo antes da limpeza. Documentos contêm dados pessoais privados e devem integrar backup/retencão/eliminação do PostgreSQL; exclusão do usuário elimina apresentação/artefatos por cascade. Nenhum documento é armazenado publicamente.

Geração: cinco tentativas por minuto por conta; apresentação: 15 gravações/minuto; leituras: 120/minuto/operação. Limites duráveis compartilhados pelo backend; corpo de opções 8 KiB, apresentação 360000 bytes, imagem canônica 256 KiB, documento 8 MiB e até 120 páginas. Limites canônicos da 010 (30 divisões, 300 ocorrências, 1000 séries) continuam válidos. Documentos excessivos exigem selecionar menos divisões, sem truncar. Sem worker/fila: geração síncrona no servidor Node, adequada ao escopo delimitado; escala concorrente deve ser monitorada antes de abrir produção.

Aplicar migrations no ambiente alvo por procedimento autorizado; preservar PostgreSQL e fonte local no tracing Next. Sharp já era transitivo do Next e passa a dependência direta para a sanitização. [API](../engenharia/api-exportacao-treinos.md), [decisão](../arquitetura/ADR-011-documentos-privados.md), [validação](../engenharia/entrega-011.md).

PDF.js é empacotado localmente com worker versionado pelo bundler, sem CDN, analytics, fontes ou documentos externos. Não executa ações/anotações/JavaScript do documento; a UI só fornece os bytes do endpoint privado gerado internamente. O visualizador nativo inicialmente testado ficou em branco no Chrome de teste; por isso a prévia foi substituída por renderização explícita do próprio PDF. Renderiza uma página por vez e cancela tarefas ao navegar/redimensionar/desmontar.
