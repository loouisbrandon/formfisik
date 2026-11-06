# Biblioteca de vídeos e demonstrações — Marco 023

FormFisik independente fundada por Brandon Louis. Implementação web local; validações efetivas e limitações no [relatório 023](../engenharia/entrega-023.md). Não há homologação Stream externa ou liberação de produção.

## Funcionalidade

`/videos` reúne conteúdo oficial e privado disponível, YouTube e uploads. Busca literal por título ou exercício associado, filtros de fonte/escopo/estado/músculo, ordem título/UUID ou atualização,20 por página no servidor, total e páginas vazias preservando filtros. Nenhuma lista carrega bytes/player. Player somente após ação; conteúdo YouTube conecta ao Google, com possível publicidade/restrição. Modo privacidade aprimorada não significa ausência de tratamento de dados externos.

Exercício canônico continua em `/exercicios`: após salvar particular, detalhes oferecem demonstrações e acesso ao cadastro de vídeo contextual. Recebe URL HTTPS, normaliza watch/youtu.be/shorts/live/embed e subdomínios explicitamente permitidos. Não recebeHTML/iframe, não baixa vídeo. Título/descrição opcionais; referência de direitos e conferência de pessoas identificáveis exigidas. Compartilhar por YouTube não transfere direitos autorais. Não há verificação automática de existência/licença.

Biblioteca permite associar vários vídeos, substituir conteúdo privado por nova versão, arquivar/reativar, revogar reprodução e solicitar eliminação do upload, consultar histórico. Associar exercício oficial privadamente não o altera. Até10demonstrações por conjunto, primeira principal. Tornar principal/remover preferência preserva conjunto anterior. Preferência privada completa substitui a seleção oficial padrão; vazio privado é ausência deliberada de demonstração padrão. Publicador pode adicionar associação oficial com conteúdo oficial revisado.

Editor de treino consulta associações somente ao expandir Demonstrações do exercício; permite escolher e ordenar as referências que entram na revisão prescrita. Modelos publicados conservam as demonstrações selecionadas na própria revisão ao serem aplicados; uma revogação continua impedindo reprodução. Mesmo modelo/serviço de prescrição; PDFs continuam consumindo snapshots canônicos sem URLs temporárias ou vídeos incorporados. Atualização de vídeo/associação não muda treinos anteriores. Arquivo conserva reprodução histórica autorizada; revogação prevalece e informa indisponibilidade. Originais externos YouTube podem mudar/remover independentemente da FormFisik.

Uploads MP4/MOV até200 MB/120 s para novos envios, com reserva máxima de120s e quotas do servidor. Sem Stream configurado, UI/servidor recusam com estado verdadeiro. Quando configurado futuramente, URL direta temporária e operação vinculada ao proprietário, upload pelo navegador e atualização explícita de processamento; webhook também reconcilia. Após ficar pronto, associar ao exercício. Falha/retorno do upload não equivale a pronto nem publicação. Atualizar processamento consulta estado canônico.

## Publicação oficial

Autor envia versão voluntariamente para revisão. Fila acessível apenas a capacidade administrativa específica, sem grant implícito do exercício ouSaaS. Outro revisor confere vídeo, autoria/licença/autorização e técnica, registra justificativa e publica; publicar não converte o exercício privado em oficial. Acervo inicial vazio é honesto: esta entrega não licencia ou copia mídias externas. Instruções/músculos/variações do exercício continuam canônicos; orientação adicional pode ser descrita e revisada nos metadados da demonstração, sem gerar conteúdo técnico porIA.

## Connect futuro

Contrato `DemoReference{videoId,revision}` e listas mínimas podem ser consumidos pelo futuro app 029. Backend continua autoridade para vínculo do aluno/prescrição; o endpoint atual atende apenas profissional confirmado/autorizado, não habilita roleAluno. YouTube no React Native exige playeroficial/WebView e identificaçãoReferer conforme políticas; não extrairMP4. Stream poderá entregar HLS assinado por contrato futuro autorizado, sem duplicar permissões noapp. Sem mobile, download/offline ou portal antecipados.

[API/modelo](../engenharia/api-demonstracoes.md) · [ADR 023](../arquitetura/ADR-023-demonstracoes-versionadas.md) · [operação](../operacao/demonstracoes-stream.md) · [privacidade](../privacidade/demonstracoes.md).

## Biblioteca profissional — refinamento 05/11/2026

Grade/lista, abas Todas/Meus vídeos/YouTube/Histórico, indicadores reais independentes dos filtros e painéis laterais de cadastro/detalhes. Indicadores: oficial ativo disponível, YouTube ativo disponível (pode também ser oficial), upload próprio ativo. Não são categorias mutuamente exclusivas. Busca é atrasada250ms e cancela leituras obsoletas; paginação SQL20. Até10 associações atuais acessíveis compõem o resumo por vídeo; não são snapshots de prescrição.

Cadastro reutiliza autoria, pessoas autorizadas e versão imutável. Novos uploads exigem exercício autorizado no servidor; seu destino é registrado no evento de reserva. Após processamento e prévia, associar explicitamente ao exercício. A reserva não publica o vídeo nem altera treinos. Declaração auditada com versão `rights:2026-11-05`, ator, data e confirmação. O envio aceita extensão/MIME declarados MP4/MOV no navegador e metadados limitados no servidor; **a inspeção independente do contêiner/MIME real não está implementada**. Conteúdo corrompido e duração efetiva dependem do processamento/inspeção canônica do provedor; homologação real pendente.

Progresso representa somente transferência. Interromper cancela o envio local; reserva/bytes remotos exigem reconciliação existente. Falha não é sucesso e não produz retry automático. Sem configuração, botão de envio fica indisponível e informa a causa. Sem miniatura autorizada, cartões exibem placeholder identificado, sem fotografia inventada ou requisição externa automática. O player existente só conecta após solicitação.

Duração histórica300s não é reescrita nem revogada silenciosamente: novas reservas máximo120s; reconciliação respeita a reserva imutável existente. Operadores com `MEDIA_MAX_SECONDS=300` precisam ajustar para120 antes de liberar novos uploads. Nenhum ambiente persistente foi migrado.
