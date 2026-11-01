# Operação de fotografias privadas — R2

Preparação implementada, sem conta, bucket, credenciais ou homologação externa criados nesta entrega. A FormFisik mantém infraestrutura própria; Railway continua hospedagem inicial. Não há deploy autorizado.

## Configuração posterior pelo proprietário

Variáveis exclusivamente no servidor (sem prefixo NEXT_PUBLIC), em `.env.local` ou variáveis protegidas do ambiente:

| Variável | Valor esperado |
| --- | --- |
| `R2_ACCOUNT_ID` | Identificador Cloudflare de 32 caracteres hexadecimais |
| `R2_PHOTOS_BUCKET` | Nome do bucket privado, 3–63 caracteres compatíveis com S3 |
| `R2_ACCESS_KEY_ID` | Identificador de credencial S3 restrita ao bucket |
| `R2_SECRET_ACCESS_KEY` | Segredo da credencial S3 |

Manter todas vazias enquanto não configuradas. Não copiar valores para documentação, chat, logs ou cliente. SDK calcula endpoint HTTPS da conta e usa região auto conforme [documentação oficial](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/). Não há variável de URL pública.

O proprietário deverá criar bucket com acesso público/domínio público/r2.dev desativados e credencial de menor privilégio para ler, criar e remover objetos somente nesse bucket. Não precisa CORS público: navegador acessa somente a aplicação. Confirmar políticas de acesso, retenção, localização e backups da conta contratada; a aplicação não as configura automaticamente.

Após autorização e configuração: aplicar migrations em ambiente escolhido com backup validado; testar JPEG/PNG/WebP, acesso negado fora da aplicação, substituição, perda de resposta, remoção/retry e indisponibilidade de credencial. Conferir ausência de nomes/aluno/EXIF nos objetos. Essa homologação ainda está pendente. `configured:true` valida presença/formato das variáveis, não permissões ou serviço; PUT/GET/DELETE só confirmam a própria operação.

## Limpeza durável

`npm run photos:cleanup` carrega `.env.local` e executa o worker com o DATABASE_URL configurado. **Não executar contra banco existente sem a autorização operacional correspondente.** Não é endpoint web nem exige publicar rota privilegiada.

O worker processa até 100 objetos vencidos por execução, com lock/rechecagem de registro e imagem. PUT confirmado é protegido; pendente abandonado vence em uma hora. Falhas tentam novamente após cinco minutos. DELETE idempotente confirmado saneia metadados da imagem. Ao apagar todas as imagens, apaga data/notas/referência de autorização do registro removido. Exclusão sem imagem pode terminar sem R2; se existem objetos, ausência de configuração conserva estado pendente e reporta falhas.

Tombstones mantêm chave opaca e identificadores operacionais, sem conteúdo corporal, para repetir DELETE diariamente e remover eventual PUT que terminou muito depois da falha da aplicação. Não remover esses tombstones apenas por idade sem reconciliação de objetos e decisão de retenção. Execuções concorrentes são serializadas por registro. Lotes extras são necessários se a fila superar 100; acompanhar atraso máximo e contagens de falha, sem logar payloads/chaves.

Não foi provisionado scheduler externo. Antes de uso real, o operador deverá agendar o comando periodicamente (ex.: a cada cinco minutos) no ambiente autorizado, monitorar backlog e falhas, e manter exclusões repetidas. A interface distingue bloqueio imediato de leitura e remoção física pendente, sem prometer apagamento já concluído.

## Interrupções e recuperação

- Falha no PUT/abort/conflito após envio: reserva existe antes de enviar; objeto nunca é apresentado como pronto; worker remove o provisório. Recarregar registro e reenviar somente faltantes.
- Falha ao substituir: antiga continua disponível; nova só vira ready depois de confirmação transacional.
- Falha no DELETE: não saneia o estado como concluído; retry mantém referência operacional. Nunca limpar banco para esconder erro do serviço.
- Banco indisponível após PUT: reserva persistida vence e é recuperada pelo worker. Reconciliar backlog após restauração.
- Restauração de backup: reaplicar solicitações de eliminação posteriores ao snapshot antes de reabrir acesso, manter R2 privado e reconciliar referências/objetos. Backups e versionamento do serviço podem conservar conteúdo: eliminação na aplicação não os apaga automaticamente.
- Rotação de credencial: configurar no servidor, validar leitura/escrita/remoção em ambiente autorizado, revogar anterior. Não despejar env em logs.

Logs do script contêm somente contagens e mensagem genérica de falha. Armazenamento controlado em memória é exclusivo dos testes e não é fallback operacional. Nenhuma fotografia é salva em public, disco efêmero ou bytea PostgreSQL.
