# Operação local e homologação de demonstrações 023

FormFisik independente; nenhuma contratação, chave real, bucket novo, webhook público ou serviço pago ativado. Este runbook não é autorização para ativação. Fotos/R2 existentes continuam independentes.

## Configuração futura

Somente servidor: STREAM_ACCOUNT_ID (32hex), STREAM_API_TOKEN (menor privilégio de vídeo), STREAM_CUSTOMER_CODE (customer-...), STREAM_WEBHOOK_SECRET (assinatura). Nunca NEXT_PUBLIC, props, logs, URLs de aplicação ou WebStorage. Ausentes: upload/reprodução Stream retornam 503 e YouTube pode ser cadastrado. Variáveis não são prova de conectividade/homologação. Tokens de mídia temporários são entregues somente após autorização, distintos de segredos de API.

Limites administrativos: MEDIA_VIDEO_QUOTA padrão 100, MEDIA_SECONDS_QUOTA 18000, MEDIA_MAX_BYTES 200000000, MEDIA_MAX_SECONDS 120. Máximos seguros validados; valor inválido falha fechado. Configuração não autoriza promessa comercial ou aumento ilimitado. Quota de segundos inclui revisões hospedadas antigas/arquivadas ainda retidas, uma reserva por UID; versões puramente descritivas não multiplicam bytes. Remoção libera reserva só após confirmação do provedor. Verificar consumo monetário na Cloudflare com alertas de orçamento antes de piloto.

## Reservas, falhas e recuperação

A intenção durável antecede a API. URL única de upload é emitida ao cliente, não persistida ou logada. Prazo 15 min; duração reservada corresponde à quota. Upload HTTP direto tem limite de 200 MB; uso de tus para conexões instáveis é evolução, não está implementado. Se conexão falhar, não repetir cegamente a criação: consultar a situação e validar o objeto no provedor.

Timeout sem UID mantém reserva incerta; mesma chave não cria outro objeto. Operador autorizado procura pelo metadado reservation, confere propriedade/conta e destino em ambiente aprovado. Limitação: ferramenta automática de recuperação sem UID ainda não existe. Não editar snapshots ou apagar intenção para forçar nova cobrança/reserva. Confirmar expiração/ausência de objeto e documentar resolução antes de nova tentativa. Conteúdo sem confirmação permanece indisponível; essa condição bloqueia expurgo de conta quando não for possível comprovar eliminação.

Situação no aplicativo é atualizada explicitamente por Atualizar processamento ou webhook. Ready exige estado do provedor e requireSignedURLs, duração/tamanho válidos. Não usar status recebido do navegador. Eventos duplicados/atrasados consultam o mesmo objeto canônico; revogação não é revertida. Provedor pode falhar ao processar: arquivo não é publicado, usuário conserva exercício/treino.

## Limpeza e privacidade

`npm run media:cleanup` executa 20 UIDs devidos/lote com credencial operacional apropriada. DELETE idempotente; falha agenda 5 min, sucesso registra estado e repete diariamente para reconciliação. Conta revogada deixa de emitir reprodução; tokens já emitidos podem durar até 5 min e bytes já obtidos não são recolhidos. Não alegar DRM.

Não executar comando contra ambiente existente sem autorização. Scheduler, observabilidade/alertas, contratos/retentiva do provedor, região/transferências e custos exigem decisão e homologação. Originais não são baixados/servidos pelo aplicativo. Não há rotina de cópia automática para R2.

Para eliminar conta: revogar uploads, executar limpeza/reconciliação, resolver reservas incertas e só então executar procedimento 016 já autorizado por titular/retentiva. Vídeos oficiais e participações editoriais exigem triagem de contribuição compartilhada, sem eliminação silenciosa. URLs externas YouTube são referências: eliminar na FormFisik não apaga o vídeo na Google. Arquivo não é eliminação.

Ledger 016 inclui revogações de vídeos e UIDs de limpeza; conservar cópia atualizada/cifrada, validar assinatura e reaplicar antes de reabrir tráfego após restore. Limpeza remota deve ser repetida depois do replay; restauração de metadados não pode restaurar autorização revogada. Testes em armazenamento controlado não comprovam eliminação física/cloud real.

## Publicadores e acervo

media_publishers é capacidade separada. Provisionar/revogar somente por operador autorizado com verificação de identidade e registro de aprovação, sem UI de autoelevação ou endpoint de grant. Runtime somente lê essa tabela. Não há publicador real provisionado nesta entrega. Acervo oficial vazio até conteúdo próprio/licenciado e revisão independente. Antes de publicar, conferir execução, autoria/contrato, uso da imagem, trilha sonora e restrições de reutilização.

## Validação externa futura

Com autorização específica: criar credenciais restritas, cadastrar webhook HTTPS assinado, testar upload real sintético/formatos/falhas/limites, inspeção, reprodução assinada desktop/mobile, token expirado, revogação, DELETE/retry, valores cobrados e restrição de origem. Conferir CSP/Referer do YouTube sem remover controles. YouTube real também exige teste representativo de rede/restrições; transporte interceptado não homologa Google. Nenhum túnel público é criado automaticamente.

Testes locais: `npm run test:media:e2e`, suíte `tests/media.test.ts`, `npm run typecheck`, `npm run lint`, build e runner de produção com TEST_MEDIA_FLOW=1. Usar apenas TEST_DATABASE_URL descartável terminada em _test; nunca ambiente persistente. [Relatório](../engenharia/entrega-023.md).


### Revisão de novembro/2026

Novos uploads têm teto120s e exercício obrigatório. Não foi instalado ffmpeg/ffprobe nem provisionado processamento adicional. O adaptador Stream permanece responsável por processamento e metadados canônicos; a exigência de inspeção própria do formato original permanece BLOQUEADA/PENDENTE. Nenhuma implementação de teste comprova arquivo real ou acesso do aluno. O laboratório de navegador usa transporte controlado identificado, não Cloudflare real.

Referências técnicas consultadas: [upload direto](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) e [formatos aceitos](https://developers.cloudflare.com/stream/uploading-videos/). O POST direto admite até200MB e a restrição de duração é aplicada durante processamento pelo provedor. Isso não substitui homologação nem prova de MIME original no servidor FormFisik.
