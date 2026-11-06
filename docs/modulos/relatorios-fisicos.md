# Relatórios profissionais de evolução física

A FormFisik é empresa independente fundada por Brandon Louis. A exportação produz documentos privados para impressão e compartilhamento manual. Não interpreta resultados nem fornece recomendações clínicas.

## Fluxo

Profissional autenticado, e-mail confirmado e autorização comercial vigente abre Exportar relatório no acompanhamento ou na ficha do aluno. Rota `/acompanhamento/[studentId]/exportar`. Define histórico completo, 30/90 dias, 6/12 meses ou datas inclusivas, escolhe Compacto/Premium e conteúdos independentes. Pode gerar somente identificação, somente peso, medidas, comparação, observações autorizadas ou fotografias autorizadas. Objetivo próprio não existe no módulo atual; interface informa sua ausência.

Peso é kg, medidas cm e datas são civis. Medições ausentes permanecem Não informado. Gráficos excluem ausências, exibem pontos reais, datas e unidades sem interpolação; um ponto ou período vazio tem explicação explícita. Comparação reutiliza 012: primeira/última, anterior/última ou dois IDs específicos do período; manual pode selecionar arquivadas com identificação explícita. Não reconstitui valores de versões anteriores. Selecionar medidas também delimita comparação, que inclui peso.

Dados cadastrais privados, contatos do aluno e notas administrativas nunca são exportados. Observações físicas e fotos começam desmarcadas. A apresentação pública atual da 011 é reutilizada, distinta do nome do responsável na emissão e das versões das avaliações. Não há segundo cadastro profissional.

## Fotografias

Metadados paginados por 12, filtrados por data, posição e registro. Consulta de bytes exige ação explícita. Seleção preservada entre páginas/filtros, com seção recolhível para revisar/remover qualquer imagem selecionada. Até 12 imagens prontas, pertencentes ao aluno e dentro do período. Autorização de armazenamento não autoriza exportação. Uma nova declaração exige referência verificável, data, titular adulto ou responsável identificado e confirmação para documento compartilhável. O servidor vincula sua finalidade às imagens/versões e ao digest da configuração e snapshot; sem declaração válida a geração é recusada. Menores conhecidos exigem responsável para exportação e autorização de origem compatível. A plataforma registra a conferência declarada pelo profissional; não valida juridicamente documentos.

Sem R2 os relatórios sem fotos funcionam. Falha de leitura nunca insere placeholder. Substituição, remoção ou revogação da autorização de origem exclui PDFs temporários que usem a imagem, inclusive bytes, referências e declaração, por triggers transacionais. Arquivos já baixados/compartilhados não podem ser recolhidos.

## Consistência e persistência

Captura REPEATABLE READ de aluno, apresentação e avaliações. Fotos são revalidadas após I/O e sob locks antes de persistir. O manifest privado contém apenas opções/dados selecionados, IDs/versões/instante e hashes das imagens; não contém chaves R2 nem cópia de bytes de imagens. Edição concorrente de avaliação preserva o snapshot capturado. Alteração da foto interrompe a geração, sem PDF inconsistente.

A tabela existente `workout_documents` recebe `kind=physical_report`, vínculo de aluno e manifest. `document_photo_authorizations` guarda declaração/finalidade/context_digest; `document_photo_references` vincula imagens e versões. Tudo é temporário, em cascata, por 15 minutos, até três documentos por profissional compartilhados com fichas de treino. Limites: 500 avaliações ativas, 12 fotos, 120 páginas, 8 MiB. Excesso é recusado sem truncamento silencioso; reduzir período/conteúdo.

PDF.js renderiza os bytes do endpoint autenticado usado também no download. Alterar configuração remove a prévia anterior da interface; o artefato imutável anterior segue sujeito a TTL, capacidade e revogação. Descartar a prévia atual apaga seu artefato no servidor. Não há envio automático pelo WhatsApp, armazenamento permanente nem histórico de exportações. Ver [API](../engenharia/api-relatorios-fisicos.md), [ADR 014](../arquitetura/ADR-014-relatorios-e-shell.md) e [operação](../operacao/relatorios-fisicos.md).
