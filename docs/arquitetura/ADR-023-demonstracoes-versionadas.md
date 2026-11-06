# ADR-023 — Demonstrações versionadas e fontes de vídeo

Estado: implementação local autorizada do Marco 023. FormFisik é empresa independente fundada por Brandon Louis; não se presume formalização jurídica. Sem ativação externa, serviços pagos, credenciais reais ou produção.

## Auditoria e decisões

Checkpoint: Chat1 ocioso, último turno 021 concluído com GO local controlado, confirmado antes da primeira escrita. Auditoria de AGENTS, docs oficiais, módulos 019–021, catálogo 009, versões 010, documentos 011, arquivos 013/016, segurança 015 e Design System. Baseline SHA-256 inclui555 arquivos rastreados/não rastreados, preserva trabalho não commitado. Não houve branch/worktree/commit. Migração seguinte é 022, embora o marco funcional seja 023; não existe migration 023 ou 022 de outro marco no checkpoint.

Reutilizar exercise_entries/exercise_versions, workout_versions e propriedade existentes. Mídia não cria outro exercício. Identidade do vídeo e revisões de conteúdo são distintas de conjuntos versionados de associações por exercício. Conjunto privado, quando criado, é preferência completa do proprietário sobre o conjunto oficial, inclusive vazio. Primeira posição é principal; até 10 vídeos, sem IDs duplicados. Referências da prescrição fixam vídeo/revisão e posição por item/versão. Remover/reordenar/substituir associações não altera prescrições anteriores. Arquivar impede nova seleção; revogar impede reprodução inclusive histórica. Eliminação prevalece sobre disponibilidade histórica, sem promessa de recolher bytes já entregues.

Fontes: YouTube por URL HTTPS validada e embed oficial, Stream para uploads privados e conteúdo oficial hospedado. Biblioteca oficial é escopo de publicação, não uma cópia dos vídeos dos concorrentes. Sem acervo fictício/seed público: estado vazio informa que publicação requer direitos e revisão humana. Exercícios oficiais podem ter preferências privadas sem mutação global do catálogo.

YouTube: hosts/caminhos permitidos explícitos, identificador11caracteres; não seguir redirect/fetch da URL fornecida. Remover tracking, ignorar playlist; não aceitar HTML, iframe ou download. Título/descrição são declarados, não metadados certificados do provedor. Preservar identificador não garante conteúdo externo imutável ou disponível. Player oficial carregado só após ação; API oficial permite mapear100/101/150/153 e falhas. Iframe usa referrerPolicy strict-origin-when-cross-origin para identificar apenas a origem, mantendo no-referrer no restante da aplicação. CSP permite frames estritamente necessários e conexão de upload Stream; script dinâmico do YouTube segue nonce/strict-dynamic, sem unsafe-eval produtivo. Aplicação não remove anúncios, controles ou atribuições do YouTube.

Stream: adaptador REST próprio pequeno, sem nova dependência. Reserva direta exige requireSignedURLs, duração e expiração, allowedOrigins e metadado com chave da intenção; não envia nome/aluno. Upload do navegador direto, sem bytes grandes no servidor Railway. Reprodução por token de mídia de5 min é capacidade específica, não autenticaçãoJWT web. Tokens já emitidos e bytes baixados têm janela residual; revogação bloqueia emissões seguintes. Inspeção confirma privacidade/duração/tamanho/prontidão antes de disponibilizar. Transcodificação não certifica ausência de malware nem direitos/conteúdo adequado. Sem download de originais. Provedor controlado existe apenas nos testes, não selecionável pelo runtime.

## Alternativas e custos

R2 continua para fotos: adaptador atual JPEG/Buffer3MiB não resolve vídeo. Usar R2 como pipeline de vídeo exigiria transcodificação, thumbnails, HLS, jobs e segurança próprios. Stream reduz essa superfície e mantém o provedor Cloudflare; Mux é alternativa contratual, sem segundo backend especulativo. Referências: StreamUS$5/bloco1000min armazenados eUS$1/1000min entregues; R2US$0,015/GB-mês mais operações/infra de processamento. Valores pesquisados02/11/2026, sujeitos a alteração; não constituem oferta FormFisik. Preload conta consumo; player/lista evitam preload automático.

## Falhas, quotas e operação

Quota configurável exclusivamente no servidor: quantidade ativa, segundos reservados/retidos, máximo de tamanho e duração. Padrões100 vídeos/18000 segundos/200 MB/300 segundos são limites técnicos iniciais, não plano comercial ilimitado. Versões físicas antigas retidas contam armazenamento; revisões de metadados do mesmoUID não duplicam reserva. Arquivar não libera bytes. Revogar enfileiraDELETE durável; processamento e exclusão física são independentes.

Intenção é persistida antes da rede. Timeout de reserva sem UID não autoriza nova reserva automática: permanece incerta, bloqueia repetição e exige operador reconciliar pelo metadado reservation no provedor. URL de upload não é armazenada em log ou resultado idempotente; perda de URL exige expiração/conferência operacional. Limitação explícita: não há busca automática de reservas órfãs sem UID. Cadastro/revisão YouTube funciona sem contratação Stream. Rede real e webhook público não foram homologados por testes locais.

Webhooks verificam corpo bruto/HMAC/timestamp e fazem leitura canônica; duplicados não criam conteúdo. Conteúdo revogado não revive por evento atrasado. Cleanup20/lote, retry5 min e tombstone diário; scheduler e alertas precisam de autorização operacional. Ledger autenticado 016 incorpora revogações e UIDs de limpeza para reaplicação após restore; compatível com envelopes anteriores sem esses campos. Eliminação de conta com mídia compartilhada ou remota não eliminada bloqueia com motivo explícito, sem cascade improvisada.

## Segurança editorial

Publicação exige submissão voluntária, capacidade media_publishers independente e revisor diferente do autor. Não conceder capacidade automaticamente. Direitos e revisão técnica são declarações auditadas, sem validade jurídica automática. Conta com contribuição oficial requer triagem; tombstones nunca mantêm bytes/título. Privacidade, autoria, menores, retenção e denúncia exigem responsáveis e revisão competente antes de uso real.

## Referências oficiais

- https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
- https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
- https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
- https://developers.cloudflare.com/stream/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.google.com/youtube/terms/required-minimum-functionality
- https://developers.google.com/youtube/iframe_api_reference
- https://developers.google.com/youtube/terms/developer-policies
