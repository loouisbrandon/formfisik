# Chat futuro — contrato conceitual e critérios de decisão

Estado em 06/11/2026: PREPARADO somente em documentação e interface; backend NÃO IMPLEMENTADO. FormFisik é empresa independente fundada por Brandon Louis. Nenhum provedor selecionado, recurso criado, SDK instalado, migration ou endpoint de chat aplicado nesta entrega.

## Objetivo e identidade

Conversa privada profissional/aluno, separada de contato declarado, aviso interno e resposta de check-in. Antes de implementar, resolver a identidade autenticada do aluno e seu vínculo autorizado no FormFisik Connect. Convites de anamnese e check-in não autorizam chat. Uma mesma pessoa poderá ter papéis distintos sem exigir contas por modalidade; isto é diretriz futura, não entidade existente. Manter sessões opacas web e autorização por vínculo em toda leitura/escrita; nenhum JWT de autenticação web introduzido.

Fluxo proposto: profissional abre aluno autorizado → consulta conversa paginada → envia mensagem com chave de intenção → servidor autoriza e persiste atomicamente → publicação posterior ao commit → cliente confirma persistência. Aluno autentica-se pelo fluxo futuro, consulta somente suas conversas, responde; fim do vínculo/revogação revalida acesso e encerra streams. Mensagem não altera prescrição, contrato, assinatura, comparecimento ou cobrança.

## Modelo conceitual, ainda sem tabelas

- Conversa: identidade, proprietário/escopo profissional, vínculo do aluno, estado, versão de participantes, política de retenção. Não inferir participante por e-mail semelhante.
- Mensagem: identidade, conversa, sequência monotônica por conversa, remetente autorizado, instante do servidor, conteúdo mínimo, tipo, chave de idempotência e referência opcional de versão de domínio. Edits/deleções precisam de política explícita e histórico/tombstone, não apagar silenciosamente o sentido de respostas.
- Recibo: cursor confirmado por participante/dispositivo e instante, distinto de entrega ao transporte. Sem presumir que conexão aberta ou push aceito significa leitura humana.
- Intenção/outbox: publicação transacional vinculada ao evento, retries, lease, tentativas, próxima execução, falha final e reconciliação. Não guardar corpo em logs.

Contratos conceituais: listar conversas autorizadas com cursor; consultar mensagens antes/depois de sequência com limite; enviar com conversationId/clientIntentId/body; confirmar cursor; retomar eventos desde sequência. DTOs e nomes de rotas serão definidos na implementação. Nenhuma rota existe agora. UUID, canal ou cursor não concedem autorização.

## Transporte e infraestrutura a avaliar

| Alternativa | Benefício | Custo e risco a validar |
| --- | --- | --- |
| HTTP para escrita + SSE para atualização | Separação simples de comandos e eventos, recuperação por cursor | Conexões longas, proxy, reconexão e fan-out; sem presumir suporte operacional no Railway |
| WebSocket próprio | Comunicação bidirecional | Autorização em conexão e comandos, limites de buffers, heartbeat, reconexão, balanceamento, observabilidade e operação persistente |
| Serviço gerenciado de tempo real | Reduz trabalho de distribuição e conectividade | Região, operadores/suboperadores, preço por conexão/volume, revogação, dependência, exportação, garantias de ordenação e LGPD |

Pesquisa primária em 06/11/2026: a [API WebSocket do navegador](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) não oferece backpressure; limitar filas e tamanho, priorizar dados persistidos e desconectar clientes lentos. [LISTEN/NOTIFY do PostgreSQL](https://www.postgresql.org/docs/18/sql-notify.html) notifica sessões inscritas após commit; utilizar, se escolhido, como sinal de atualização, com mensagens duráveis consultadas no banco e recuperação por cursor, nunca como armazenamento do chat. [Ordenação da Ably](https://ably.com/docs/chat/rooms/messages) exemplifica que ordem em tempo real e ordem global exigem análise; serviço avaliado como alternativa, sem contratação ou escolha. Estas informações não autorizam integração.

Decisão futura exige prova de conceito em ambiente isolado, custos estimados por conexões/egress/retention, regiões e transferências, SLA e portabilidade, compatibilidade Railway e operação de desconexão. Não adicionar um barramento abstrato ao produto sem consumidor real.

## Continuidade, concorrência e sincronização

Sequência do servidor determina ordenação, e não relógio do dispositivo. Paginação por cursor/seq, limites de volume e resumos mínimos de conversa. Na reconexão, autenticar/reautorizar e buscar lacunas; deduplicar por identidade/seq; mensagem otimista só pode aparecer como pendente até confirmação persistente. Mesma intenção repetida retorna o mesmo resultado; corpo divergente com a mesma chave falha. Responder ao commit antes da publicação não dispensa outbox/reconciliação. Testar perda de resposta, crash entre commit e publicação, eventos duplicados/fora de ordem e retomada após período offline.

Web e aplicativo futuro consomem os mesmos comandos e cursores. Nenhum aplicativo mobile é desenvolvido aqui. Push futuro será genérico por padrão, opt-in por dispositivo/preferência, independente da leitura no chat, com revogação de inscrição; payload não deve revelar saúde ou conteúdo privado na tela bloqueada.

## Anexos e privacidade

Anexos privados exigem finalidade, autorização, limites, validação de assinatura/conteúdo, quarentena/antimalware quando necessário, chave aleatória, downloads revogáveis e política de retenção. Não reutilizar upload de fotos clínicas sem auditoria de escopo. Não permitir URLs permanentes ou fetch arbitrário de mídia. Retenção deverá ser homologada com direitos, legal hold, eliminação e backups. Separar recibos operacionais de conteúdo; auditoria mínima por ator/ação/conversa sem corpo, token ou contato em logs. Produção continua NO-GO até homologação, inclusive controles015.

## Testes e gates obrigatórios

- Autorização em cada operação, acesso entre profissionais, aluno removido, troca de participante, expiração/revogação de sessão e stream.
- Idempotência concorrente, sequência, paginação vazia, volume, envio offline, retomada sem lacunas e sem duplicação.
- Rate limits por remetente/conversa, mensagens grandes, clientes lentos, quedas e pico de conexões.
- Recibos de aceitação/transporte/leitura distintos, opt-out de push, reprocessamento sem disparo excessivo.
- Conteúdo escapado, anexos inválidos, malware, IDOR de downloads, ausência de segredos em HTML/RSC/bundle e logs.
- Eliminação de titular, retenção, exportação autorizada e restauração com reaplicação do ledger antes do tráfego.
- Acessibilidade, foco e leitor de tela, responsividade, scroll ancorado, novas mensagens sem roubo de foco, claro/escuro e sincronização Web/mobile futura.

Dependências: decisão de identidade Connect, política de mensagens, canal de direitos/retention, provedor e contratos de dados, operação de conexões/outbox, armazenamento privado, métricas sem conteúdo e homologação de segurança. A interface atual informa indisponibilidade, não cria conversas, não mostra mensagens fictícias, não envia nem recebe mensagens, não abre WebSocket e não dispara notificações de chat.
