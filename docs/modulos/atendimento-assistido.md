# Atendimento assistido e automação autorizada do eCoach

Estado: IMPLEMENTADO localmente na Central de Comunicação, 14/11/2026. Conexões de canais PREPARADAS como requisitos/estados, transporte externo NÃO IMPLEMENTADO. Não é homologação externa. FormFisik é empresa independente, fundada por Brandon Louis; esta entrega não presume constituição jurídica formalizada. Web/Personal 1.0, sem aplicativo ou modalidade nova.

## Escopo e experiência

Reutiliza `CommunicationArea`, shell, tokens, Button, campos, Skeleton, Feedback, paginação, registro compartilhado de alterações não salvas, sessões e entitlement canônicos. Substitui as antigas prévias de Caixa de entrada e Automações; não cria outro módulo de navegação. Rota `/comunicacao`, abas Caixa de entrada e Automações. A ficha de comunicação de um aluno usa o mesmo componente, com vínculo explícito; na central sem aluno selecionado, novo contato é lead privado e não cria cadastro de aluno automaticamente. Nunca associa aluno por coincidência de telefone/e-mail.

Conversa contém canal pretendido, nome, contato opcional e vínculo de aluno opcional. Mensagens recebidas são **declaradas manualmente** pelo personal; não há inbox Meta/SMTP ativa, leitura/entrega fictícia ou importação automática. Um texto digitado pelo personal é rascunho. Sugestão do eCoach também é rascunho. Revisão permite editar, aprovar ou descartar; **aprovar não envia**. Se uma nova mensagem recebida chegar antes da aprovação, o rascunho anterior não pode ser aprovado sem preparar outra resposta. Fechar conversa bloqueia novas mensagens/rascunhos e cancela preparações pendentes; reabrir permite continuar. Exclusão da conversa remove mensagens, trabalhos e eventos, invalidando operações anteriores para impedir recriação por retry.

A caixa preserva busca, canal, situação e página; lista paginada no servidor (20) ordenada por atualização/id, contendo somente resumo. Contato e texto só no detalhe autorizado. Histórico da conversa: 20 mensagens/página, página 1 com as mais recentes em ordem cronológica dentro da página; páginas seguintes permitem consultar anteriores. Lista vazia preserva filtros, sem paginação desnecessária. Desktop: lista e conversa; abaixo de 900 px: alterna lista/conversa com botão de retorno. Transcript tem scroll local e altura limitada; página usa `#app-content`, sem scroll global. Formulário de conversa curto, regra em seção progressiva, instruções de sugestão sob demanda. Draft de texto por conversa preservado no estado de navegação; edições locais exigem confirmação antes de trocar painéis.

## Autorizações e automação

Três controles independentes: acesso profissional canônico; permissão/consentimento do eCoach com Pro/cortesia equivalente; consentimento próprio de **atendimento assistido** (`support-v1:<fingerprint do eCoach>`). Este último autoriza enviar somente mensagens deste atendimento ao provedor e preparar rascunhos. Não concede role admin ou autorização de envio. É exigido adicionalmente `ai_allowed` por conversa, com declaração de finalidade/transparência pelo responsável. Nenhuma caixa é automaticamente autorizada.

Regras: até 20 por profissional, nome, canal específico/todos, 1–8 expressões (3–40 caracteres) e orientações (10–1.000). Pode salvar pausada sem consentimento. Ativar exige autorização atual e configuração pronta. Uma mensagem recebida nova enfileira a **primeira regra ativa por ordem de criação/id** que corresponda ao canal e a qualquer expressão; matching ignora acento/caixa, por trecho literal (sem regex). A conversa precisa estar aberta e autorizada. O mesmo POST de registro processa a tarefa, com o mesmo motor da sugestão manual. Ativar/editar regra não processa mensagens antigas. Não existem envios agendados ou processamento autônomo em background nesta etapa.

Revogar consentimento de atendimento desativa regras e cancela tarefas pendentes/em execução; pausar conversa também cancela suas tarefas. O servidor revalida sessão, entitlement, consentimentos, estado/versão da conversa, último recebimento e versão/ativação da regra antes e depois da inferência. Mudança descarta resposta tardia, sem sobrescrever conteúdo. Aprovação sempre humana. Mudança de provedor/modelo/fingerprint exige novo consentimento. Revogar não desfaz transmissão externa já iniciada.

## Motor e integração

`configuredProvider` existente e seu protocolo JSON são reutilizados. No atendimento, aceita somente `{kind:'answer',text}`; consultas, propostas ou comandos são rejeitados. Não reutiliza o motor de ferramentas internas para conceder ao contato externo acesso a agenda, financeiro, alunos, prontuários ou outras conversas. Recebe no máximo 10 mensagens recebidas/textos aprovados, nome do contato, canal e instruções explícitas. Textos aprovados são identificados como **não enviados** no contexto; não implica que o contato já recebeu a resposta. Nenhuma gravação financeira, prescrição, publicação ou comunicação externa pode ser executada por esta fronteira.

Timeout total 45 s, saída sanitizada pelo `messageBody` canônico, no máximo 4.000 caracteres (prompt pede até 2.000). Sem fallback fictício em caso de cota/configuração/estrutura inválida. HTTP/adaptador mantém erros fixos sem corpo bruto de provedor. Documentação oficial utilizada: [JSON mode e validação](https://developers.openai.com/api/docs/guides/structured-outputs); a validação e a decisão de execução são sempre do servidor.

Tarefas persistentes: queued → running (lease 60 s) → done/failed; revogação/fechamento geram canceled. Uma tarefa gera no máximo um rascunho. Retry explícito/idempotente até três tentativas; tarefas em fila podem ser retomadas e running só pode ser recuperada após expirar lease. `cleanup` marca leases expiradas como failed. Não repetir automaticamente cobrança após falha do provedor. Limites duráveis específicos do atendimento: 20 tentativas/usuário e 200 globais numa janela de 24 h, contando falhas. Os limites dos outros fluxos do eCoach permanecem independentes.

Sem SDK, dependência ou transporte duplicado. Sem credenciais OAuth/Meta/caixa postal em props, banco de conexões fictício, URLs arbitrárias, callback público ou webhook inseguro. Envio é recusado pelo servidor mesmo que o cliente force `action:'send'`.

## API

`/api/communication/assistance`, Node Route Handler. GET/POST privados com no-store; POST exige Origin exata e não cross-site, JSON estrito até 16 KiB. Limites HTTP: 120 GET/40 POST por usuário/minuto. Sessão opaca, role profissional, acesso comercial e propriedade verificados no servidor. Escritas bloqueiam profissional/conversa/sessão e usam chave idempotente + digest. Nenhum UUID substitui autorização.

GET: `view=threads` com `page,q,channel,state,studentId?`; `view=thread&id` com página; `view=rules` (máximo 20); `view=settings` com consentimento/versão/runtime e capacidades explicitamente falsas dos canais. DTOs não incluem chave/token ou histórico de outras conversas.

POST (`operationKey: UUID` obrigatório):

| Ação | Campos principais | Resultado |
| --- | --- | --- |
| settings | version, consent | Autoriza/revoga atendimento |
| thread_create | name, contact, channel, studentId/null, body, aiAllowed | Nova conversa e recebimento manual |
| receive | id, version, body | Declara recebimento; avalia regra |
| thread_update | id, version, state, aiAllowed | Pausa/autoriza IA, fecha/reabre |
| draft | id, version, body | Novo rascunho manual |
| suggest | id, version, instructions | Enfileira/prepara sugestão da IA |
| review | id de mensagem, version, body, decision approve/discard | Aprova texto ou descarta |
| rule_save | id/version se edição, fields | Regra versionada |
| retry | id de tarefa | Retoma até três tentativas |
| delete | id, version, confirmed=true | Elimina conversa e dependências |
| send | id, version, confirmed=true | 409, transporte indisponível |

Registro do recebimento não é revertido quando a inferência falha: POST retorna 200 com `automationError`, preservando texto e falha no painel. Erros anteriores à gravação retornam status 400/401/403/404/409/429/503 conforme fronteira. Cancelamento/timeout durante inferência deixam tarefa failed quando o processo consegue finalizar; morte do processo é recuperada pelo lease. Sessão inválida nunca entrega texto externo tardio ao usuário.

## Persistência, finalidade e retenção

Migration aditiva 039: `communication_assistance_settings`, `communication_inbox_threads`, `communication_inbox_messages`, `communication_inbox_rules`, `communication_inbox_jobs`, `communication_inbox_events`, `communication_inbox_operations`. FKs compostas por proprietário, cascade das dependências da conversa, auditoria sem corpo de mensagem, versões/estado/limites e idempotência. Não altera tabelas/ciclos de contato024 nem transforma registros históricos preparados em enviados.

Até 500 conversas/profissional e 1.000 mensagens/conversa. Finalidade: relacionamento e preparação de atendimento para alunos/leads, sob controle do personal. Não presume autorização clínica ou treinamento de fornecedor. Não compartilhar dados sensíveis desnecessários. OpenAI recebe contexto mínimo quando autorizado, com `store:false`; retenção externa depende do fornecedor. Nenhum log inclui contato, mensagens, credenciais ou tokens.

Retenção operacional: `cleanup` exclui conversas sem atualização há 180 dias e suas dependências. Concluídos/cancelados apagam instruções temporárias; falhas retêm instruções necessárias ao retry enquanto a conversa existir. Textos de regra podem conter referências livres e exigem revisão manual em direitos do titular. Operações guardam somente digest/IDs/resultados mínimos; tombstones após exclusão manual ficam até eliminação da conta para evitar replay. Fluxo de eliminação do aluno remove conversas com vínculo estruturado e dependências/ops; eliminação profissional remove também leads/regras/configurações. Conversa de lead sem vínculo não é associada por contato automaticamente e pode exigir localização manual em pedido de titular.

## Conexões pendentes e aceite

WhatsApp: conta Business/número e integração oficial homologada; Instagram: conta profissional/autorização e integração oficial de mensagens; e-mail: caixa profissional autorizada/recebimento e transporte próprios. Estado atual de todos: **não conectado**, `canSend:false`, `canReceive:false`. Requisitos exibidos na própria aba Automações. Não reaproveitar SMTP transacional de confirmação de conta como caixa de atendimento pessoal do profissional.

Próxima entrega depende de configuração dos canais: OAuth/credenciais server-only por profissional, webhook assinado e deduplicado, mapeamento canônico de contato, preferências/opt-out, janelas/templates, outbox e reconciliação de entrega, autorização separada de envio autônomo e homologação. Nenhum transporte de testes é exposto ao usuário como real. A revisão aprofundada de contexto/escopo da IA solicitada pelo fundador fica posterior; os guards obrigatórios não são adiados.

Migrations/browsers/testes somente locais. Sem commit, deploy ou alteração em staging/produção. Cota OpenAI continua dependência externa de homologação; simulação controlada não comprova inferência real. NO-GO015 permanece.

## Evidências e resultado — 14/11/2026

**69 testes aprovados, zero falhas**, em PostgreSQL descartável: inbox/consentimento/regras, contrato HTTP com provedor injetado controlado, concorrência, versões, dono alheio, role admin negada, aluno alheio/arquivado, sessão revogada, novos recebimentos invalidando resposta/aprovação, revogação durante inferência, regra alterada, recuperação de lease, retries até três, orçamento, idempotência, ausência de envio/ação de domínio e eliminação de dados vinculados. Regressões selecionadas de Comunicação024, eCoach/histórico/permissões/gestão interna, Produtos e privacidade aprovadas. Teste HTTP de cota confirma 200 com aviso e recebimento salvo; não chama provedor quando o orçamento é excedido.

Chrome local com PostgreSQL real e dados sintéticos: autorizar atendimento, criar regra, registrar lead, autorizar conversa, sugerir, editar/aprovar texto, nova mensagem acionando regra, persistência após reload/reabertura e revogar regras. IA foi controlada no roteiro; nenhuma inferência paga ou envio externo. Verificados 1440/768/320 px, altura480 e texto200%, sem rolagem indevida do documento externo. A memória privada de navegação não persiste após reload; conversa é reaberta da lista e seu conteúdo permanece no servidor. Dados sintéticos removidos ao concluir. Screenshots locais de inspeção: `/tmp/communication-assistance-inbox.png`, `/tmp/communication-assistance-automations.png`, `/tmp/communication-assistance-mobile.png` (não são assets públicos).

Achados corrigidos durante validação: tipo explícito de submit nos formulários Base UI, preservação da seção de controle expandida durante atualização e retorno de falha de preparação separado do sucesso do recebimento. O roteiro foi corrigido para distinguir texto exibido de textarea oculta e para reabrir a conversa após reload conforme o shell; não se alterou persistência privada para Web Storage.

Lint, typecheck e build Webpack aprovados. Auditoria do build: **321 artefatos públicos, 16 canários sintéticos, zero achados**. Aviso preexistente de metadataBase permaneceu sem bloquear o build. Migration039 aplicada somente em `127.0.0.1/formfisik_local_test` após passar em banco descartável. Concessões runtime documentadas, sem alterar permissões ou bancos hospedados. Sem commit/push/deploy. Inferência real e canais externos não homologados; dependem de cota/configuração e da próxima integração expressamente autorizada. NO-GO015 preservado.

## Escopo obrigatório

O atendimento segue a [política do eCoach](../seguranca/ecoach-escopo-e-abuso.md): recebimentos e orientações são validados antes da geração; regras não ativam instruções fora do escopo. Histórico entregue é filtrado e o nome do contato não integra o contexto externo. Respostas são inspecionadas antes do rascunho. A cota de chamadas reais é compartilhada com chat e mídia. Nenhum canal externo foi conectado por esta mudança.
