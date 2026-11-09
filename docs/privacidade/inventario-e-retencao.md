# Inventário de tratamento e retenção proposta — 015

**Proposta para revisão jurídica e decisão operacional; não publicada nem aplicada automaticamente.** A FormFisik é empresa independente fundada por Brandon Louis. Independência operacional não comprova constituição jurídica. Responsável legal, canal de privacidade, papéis de controlador/operador e acordos com profissionais precisam ser definidos antes do uso de dados reais. Não há certificação LGPD.

Proteção elevada para dados corporais e observações de saúde. Fotografias não são automaticamente biometria: o enquadramento depende de finalidade e uso; não existe reconhecimento facial, identificação biométrica ou IA nesta aplicação. Avaliar o contexto do conjunto, inclusive associação entre imagem, aluno e histórico físico. Referências de autorização registram uma declaração profissional, sem validar documentos ou estabelecer por si uma base legal.

## Inventário

Todas as categorias são privadas, salvo catálogo oficial e campos profissionais declarados para documentos. Acesso administrativo ao banco não representa autorização genérica para consultar conteúdo. Profissional acessa somente sua carteira; não há portal do aluno ou associação automática por e-mail.

| Categoria / fonte / titulares | Finalidade e necessidade | Acesso / compartilhamento / armazenamento | Retenção proposta e eliminação | Risco e base proposta para análise jurídica |
| --- | --- | --- | --- | --- |
| Nome/e-mail do profissional; próprio formulário | Identificar conta e enviar mensagens transacionais | Titular; operação autorizada; PostgreSQL; SMTP recebe destinatário e texto necessário | Durante conta ativa; encerramento em até 30 dias após verificação e triagem de retenções justificadas. Prazo proposto, sem expurgo geral implementado | Identificação/contato; avaliar execução contratual e obrigações aplicáveis |
| Credenciais, sessões, tokens; servidor/titular | Autenticação e prevenção de abuso | Somente servidor; Argon2id/digests no PostgreSQL; token temporário apenas no e-mail; cookie HttpOnly | Tokens 30min; sessão 30min inatividade/12h absoluto; cleanup remove expirados/revogados. Hash até encerramento autorizado; suspensão revoga sessões e links | Tomada de conta; avaliar execução contratual, segurança e eventual interesse legítimo documentado para dados comuns |
| Limites HMAC; requisições | Evitar automação e esgotamento | Servidor/PostgreSQL; IP confiável só com proxy explicitamente configurado; não guardar IP/e-mail puro na chave | Até fim da janela (até 15min nos limites de autenticação), removido por cleanup; configurar agenda | Correlação residual/HMAC é pseudonimização, não anonimização; avaliar necessidade/proporcionalidade |
| Cadastro de alunos; profissional | Organização administrativa; nome obrigatório, contatos/nascimento/notas opcionais | Proprietário confirmado e autorizado; PostgreSQL/backups; SMTP não recebe cadastro de aluno | Enquanto necessário ao serviço; revisar necessidade a cada 12 meses; arquivar preserva, não elimina. Prazo final por contrato/finalidade, sem retenção perpétua implícita | Exposição da carteira/menores. Profissional deve definir base e transparência; avaliar contrato e regras de crianças/adolescentes no contexto concreto |
| Prescrições e versões; profissional | Preservar prescrição e referência histórica | Proprietário; PostgreSQL/JSON e versões; PDF só por exportação explícita | Revisão anual; conservação histórica somente justificada. Expurgo completo precisa tratar cópias/modelos/FKs; não há endpoint de eliminação geral | Histórico físico e texto livre podem revelar saúde; analisar bases do art. 11 quando aplicável, sem usar interesse legítimo como base para dados sensíveis |
| Peso/medidas/notas físicas; profissional | Acompanhamento individual sem diagnóstico automático | Proprietário; PostgreSQL/backups; gráficos locais | Revisão semestral; propor eliminação até 30 dias após solicitação cabível verificada e triagem. Correção e arquivamento disponíveis; eliminação geral ainda operacionalmente pendente | Saúde potencialmente sensível. Analisar finalidade e hipótese adequada do art. 11; consentimento específico, quando escolhido, exige gestão válida de revogação |
| Fotos/descrições; profissional; aluno/responsável | Comparação datada individual autorizada | API privada proprietária e R2 privado; metadados PostgreSQL; sem URLs públicas | Revisão semestral; remoção bloqueia imediatamente; DELETE físico via worker, com retry. Tombstones opacos até reconciliação/política aprovada; nenhuma promessa de exclusão instantânea | Risco elevado de exposição corporal e menores; avaliar base aplicável/contexto, autorização específica não universal |
| Autorizações de origem/exportação; profissional | Vincular finalidade, referência, sujeito e contexto | Proprietário; PostgreSQL; sem documento de identidade completo; não entra no PDF | Origem saneada na remoção integral confirmada; autorização de exportação acompanha PDF temporário e cascata. Evidência externa deve ter retenção própria aprovada | Dados de responsáveis/referências. Hipótese jurídica acompanha tratamento principal; atestado não comprova validade legal |
| Apresentação profissional/logo; profissional | Personalizar documento solicitado | Proprietário; PostgreSQL; somente campos de apresentação selecionados entram no PDF | Até substituição/remoção/encerramento autorizado; logo pode ser removido pela UI | Contato declarado público não autoriza usar contatos privados do aluno |
| Assinaturas/faturas resumidas; Stripe e servidor | Elegibilidade, cobrança, reconciliação | Servidor e titular; Stripe recebe conta/contato e cartão diretamente; PostgreSQL guarda IDs/estado/valores resumidos | Definir conservação fiscal/contábil com especialista; não inventar prazo universal. Encerramento de acesso não cancela automaticamente cobrança | Dados financeiros; avaliar contrato e obrigações legais; sem PAN/CVC completos no aplicativo |
| Eventos administrativos/segurança; servidor/operador | Rastrear autoria, versão, concessão e suspensão | Operação restrita; PostgreSQL; sem snapshots de conteúdo corporal nos eventos | Proposta 180 dias para eventos operacionais, salvo necessidade documentada; definir expurgo compatível com FKs. Eventos de incidente seguem procedimento específico | IDs ainda são dados pessoais; evitar motivos livres com dados sensíveis e acesso irrestrito |
| Logs técnicos; aplicação/proxy | Diagnóstico e detecção de falhas | Operação autorizada; provedor de hospedagem escolhido após contrato/configuração | Proposta 30 dias online, 90 dias restritos quando necessário; aprovação e configuração pendentes | Não registrar headers/cookies/corpos/URLs com tokens/notas/imagens; logs não substituem auditoria de acesso |
| PDF temporário/manifest; solicitação profissional | Prévia/download dos mesmos bytes | Proprietário e PostgreSQL por 15min; PDF administrativo somente memória; cópia baixada sob responsabilidade profissional | Artefatos temporários até 15min/3 por dono, bloqueio de leitura independente do worker; cleanup físico agendável; fotos revogadas invalidam documentos | Conteúdo elevado; autorização de origem não permite exportação automática; cópias externas não são recolhidas |
| Backups; banco/operador | Recuperação de desastre | Operadores com menor privilégio; armazenamento cifrado e acesso auditado a configurar | Proposta ciclo de 30 dias, a validar com RPO/RTO e obrigações. Registro mínimo de eliminações para reaplicar após restore antes de liberar acesso | Backup conserva cópias; não há mecanismo para apagar cada dado imediatamente em todos os snapshots |

Prazos acima são propostas de governança, não imposições legais nem scheduler já implementado. Aprovação deve registrar responsável, fundamento, data de revisão e exceções. Nenhuma exclusão real foi executada nesta entrega.

## Direitos e lacunas técnicas

Confirmação/acesso/correção: procedimento verificado, consultas por proprietário e vínculo, interfaces de detalhes e correção disponíveis; documentos atuais não são exportação integral estruturada de todos os dados. Portabilidade deve observar requisitos aplicáveis, segredos/terceiros e formato acordado; não se promete portabilidade automatizada.

Eliminação cabível: fotografias possuem fluxo durável; demais categorias não possuem expurgo integral de titular, inclusive snapshots de treinos e cópias. Não executar cascatas improvisadas. Elaborar plano transacional por vínculo, revisar dependências e retenções, testar em cópia sintética e autorizar operação específica. **A falta desse procedimento técnico integral validado bloqueia operação com dados reais até sua conclusão**, não é resolvida por arquivar.

Suspensão de conta na 015 bloqueia autenticação e invalida sessões/recuperações por trigger; não elimina conteúdo, cancela assinatura nem atende sozinha um pedido de titular. Reativação não revive sessões anteriores. Controle CLI restrito, sem autoatribuição no frontend.

## Compartilhamentos e contratação

Railway (hospedagem inicial), fornecedor PostgreSQL, SMTP, Stripe e Cloudflare R2 precisam de avaliação contratual, localização, suboperadores, acesso e transferência internacional quando aplicável. Presença de SDK não comprova contratação ou homologação. Não se presume compartilhamento com Onebase. Não enviar dados corporais à Stripe/SMTP/analytics. Definir contato de privacidade verificável antes de publicar avisos.

Referência legal oficial: [LGPD, Lei 13.709/2018, texto na Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html). Bases, direitos e prazos devem ser revisados por especialista; este inventário descreve engenharia e propostas.

O contexto de exibição de sessão (`context`) é um pseudônimo HMAC estável por conta sob o segredo do ambiente, derivado somente no servidor para detectar troca de conta entre abas. Não é credencial nem dado anônimo: permite correlação dentro do ambiente e recebe proteção de dado pessoal pseudonimizado. Vai ao SSR/checagem privada no-store, permanece apenas em memória e não é registrado em logs nem gravado em Web Storage; descarte ao sair/trocar conta. Finalidade: segurança e consistência da interface; hipótese jurídica deve acompanhar a avaliação dos controles de autenticação. Rotação do segredo altera o contexto e requer recarregamento seguro.

## Atualização técnica 016 — sem alterar o veredito histórico015

[Ciclo de vida e eliminação016](eliminacao-016.md) implementa fila operacional e exclusão transacional por vínculo aprovado, conta profissional elegível sem carteira/financeiro/contribuições, limpeza externa repetida e ledger autenticado para restore. Pedidos de titulares distintos não são unidos; conta com carteira restante fica bloqueada até procedimentos próprios. Eliminação integral de casos financeiros/compartilhados e portabilidade ampla continuam pendentes de política/implementação cabível; não se afirma atendimento integral de direitos.

Novos dados pseudonimizados: UUID de operação/proprietário/alvo/aprovação, estados/datas, lease e chave opaca de objeto para cleanup. Finalidades: executar pedido cabível, evitar repetição indevida e reaplicar exclusões após restore. Acesso apenas por operador autorizado, sem frontend/runtime. Sem conteúdo corporal, documento de identidade ou motivo livre. Ledger/tombstones ainda são dados pessoais; retenção/descarte, cópia independente cifrada, atualidade e chave exigem decisão operacional/jurídica. Janela técnica de um dia de quiescência não é prazo legal. Sem execução em dados reais.

## Ampliação017 — anamneses e convites

[Inventário específico](anamneses.md): respostas sensíveis segregadas do cadastro, versões estáveis, identificação original de casos pendentes, credencial por digest/validade, ciência e eventos mínimos. Novo cadastro seguro reutiliza carteira; caso ambíguo não associa por e-mail. Rascunhos apenas em memória. Eliminação/replay016 remove solicitações/respostas do vínculo aprovado; submissão sensível sem vínculo bloqueia expurgo de conta profissional até triagem de outro titular. Prazos legais, bases, canal, menores e publicação jurídica continuam pendentes; produção e dados reais permanecemNO-GO.

## CRM018 — finalidade e novos registros

Configuração/etapas operacionais por profissional; associação ao vínculo de aluno com etapa/data/versão; tarefas operacionais com título/descrição/prazo/prioridade/status/responsável proprietário; eventos mínimos e chaves de repetição. Finalidade: organizar atendimento da carteira. Proprietário autorizado acessa; nenhum endpoint público ou compartilhamento entre profissionais. Datas/status também são dados pessoais, e texto livre pode inadvertidamente receber conteúdo sensível: UI instrui não registrar saúde nas tarefas/etapas. Cards/indicadores excluem respostas de anamnese, medidas, fotos, contatos e textos livres.

Retenção enquanto necessária ao atendimento, sujeita à política a aprovar; nenhum prazo jurídico novo foi presumido. Histórico preservado no arquivo operacional não impede eliminação016 aprovada. Worker remove tarefas/eventos/associações do vínculo e saneia resultados/digests de operações e cursores relacionados; conta elegível remove CRM restante. Backup/restauração exige replay do ledger antes de reabrir acesso, verificado localmente018. Eventos não copiam nomes nem conteúdo clínico. Configurações compartilhadas do proprietário não desaparecem com um aluno; não inserir PII nelas. Sem expurgo CRM agendado nesta entrega.

Produção/dados reais seguem NO-GO015–017: bases legais, canais, prazos, responsáveis, backups e homologação externa dependem de decisão e evidência próprias. [Módulo](../modulos/crm.md), [API](../engenharia/api-crm.md) e [relatório018](../engenharia/entrega-018.md).

## Serviços e consultorias019

[Inventário específico](consultorias.md): oferta comercial, preço/vigência acordados, vínculo do aluno, obrigações, execuções, referências mínimas de evidência, justificativas e versões. Finalidade administrativa privada; não representa pagamento ou contrato juridicamente assinado. Sem cópia de medidas, respostas ou prescrição e sem envio paraStripe/SMTP. Textos livres podem revelar contexto sensível e exigem disciplina de finalidade.

Worker016/replay elimina acordos/versões/entregas/execuções/eventos e saneia tentativas individuais aprovadas, preservando catálogo para outros vínculos e bloqueios prévios. Conta elegível elimina restante do catálogo. Retenção/prazos/canais/base e governança de backup continuam a aprovar;020 deverá acrescentar suas retenções antes de financeiro real. Produção e dados reais seguem NO-GO, sem prazo fiscal inventado.

## Financeiro profissional020

[Inventário específico](financeiro-profissional.md): obrigações/valores/vínculos, referências mínimas do processador, pagamentos externos, correções, intenções privadas, eventos e repasses. Sem KYC/cartão/dados bancários próprios. Worker016 retorna financial_retention antes de apagar aluno/019 com dependência financeira, inclusive após restore. Política de retenção e eliminação financeira/jurídica ainda pendente; nenhum prazo legal inventado.

## Agenda021

Finalidade operacional: reserva, disponibilidade, comparecimento e execução contratual explícita; identificação mínima, horários e notas/local privados sob acesso proprietário. [Avaliação e eliminação](agenda.md). Sem retenção jurídica nova nem compartilhamento externo ativo. Ledger016/replay contempla agenda e vínculos019, preservando preflight financeiro020.

## Demonstrações023

[Inventário específico](demonstracoes.md): vídeo/imagem/voz, autoria/direitos, metadados, referências e auditoria. Player externo sob demanda; divulgação de fornecedor/finalidade antes de produção. Revogação prevalece sobre histórico; cleanup eledger/replay preservam eliminação, contribuição compartilhada e reserva remota incerta bloqueiam expurgo indevido. Sem prazos jurídicos presumidos.

## Check-ins022

Experiência do aluno e revisão profissional; relatos de disposição/sono/recuperação/esforço/desconforto e textos podem revelar saúde. [Avaliação específica](checkins.md) define minimização, convites sem identidade/histórico, acesso proprietário, correções imutáveis e eliminação/replay016. Sem prazo jurídico novo ou compartilhamento externo ativo; produção/dados reais NO-GO.

## Comunicação024

[Inventário específico](comunicacao.md): textos preparados, contatos declarados, canal/instante/responsável, modelos/versões, referências mínimas e leitura interna do profissional. Conteúdo livre pode revelar saúde; não copiar origem automaticamente nem expor em avisos/logs. Sem leitura por terceiros ou canal externo. Eliminação016 apaga dados do vínculo antes das fontes, saneia/invalida retries e restore reaplica ledger; modelos sem dados individuais ficam para a carteira. Governança de base/prazo/canal permanece pendente; nenhum prazo jurídico presumido.

## Indicadores025

Consulta privada agregada, sem nova persistência ou compartilhamento. Sem respostas clínicas, fotos, nomes/contatos individuais; nomes de etapas configurados continuam privados e podem revelar contexto se mal utilizados. Finalidade operacional, acesso por proprietário habilitado, no-store e sem exportação. Dados eliminados deixam de compor novas consultas; restauração deve reaplicar ledger016 antes de abrir tráfego. Período limitado não é prazo jurídico de retenção, e agregação não constitui anonimização certificada. [Semântica e limites](../modulos/inteligencia-de-negocio.md).

## Importação026

Finalidade de migração administrativa autorizada da operação profissional; carteira privada, catálogo particular e modelos sem aluno. Original/filename/cabeçalhos não persistem; ignorados e valores inválidos não são armazenados. Campos válidos normalizados ficam até24h ou processamento/cancelamento/expiração, com limite técnico, gate de leitura e worker preparado. Não importar prontuário ou informações sensíveis fora das finalidades aprovadas.

Metadados de job/linha/tipo/estado/instantes, HMAC de intenção por proprietário e IDs resultantes sustentam idempotência, retomada e auditoria mínima. São pseudonimizados, não anônimos; histórico exige política de conservação aprovada, sem prazo jurídico presumido. Somente proprietário confirmado/habilitado com entitlement; relatório privado sem nomes/contatos. Sem operador externo, adapter, scraping ou nova conta do aluno.

Eliminação016 invalida retries e remove referências ao aluno. Como não se presume identidade em entradas não vinculadas, descarta todos os payloads pendentes daquele proprietário e cancela seus jobs abertos, preservando outros cadastros canônicos. Conta elegível remove dados026. Backup/restore requer replay do ledger antes de reabrir tráfego; retenção financeira020 permanece bloqueadora. [Política/formatos](../modulos/importacao.md) e [operação](../operacao/importacao.md). Produção/dados reais permanecem NO-GO.

## CRM & Operação — extensão026

Finalidade permanece organização da rotina pelo proprietário. Tarefas gerais sem aluno e referências opcionais a compromissos ampliam o domínio018, sem cópia de notas da Agenda, respostas, prescrições ou dados financeiros. Responsável é a conta profissional; não há compartilhamento com equipe. Resumo lateral expõe apenas nome, título operacional, data/estado e contagens autorizadas; descrição da tarefa e dados especializados continuam sob demanda.

Sem prazo jurídico novo. Arquivar não elimina histórico; eliminação016 de aluno remove tarefas e eventos daquele vínculo, e de profissional remove também tarefas gerais. FK do compromisso limpa a referência corrente quando a ocorrência é eliminada; histórico da tarefa vinculada ao aluno é removido pelo mesmo procedimento aprovado. Retenção de tarefas gerais/textos livres segue necessidade operacional e política a aprovar, sem expurgo automático presumido. Evidências e limites em [CRM novembro/2026](../engenharia/redesign-crm-2026-11.md). NO-GO015 preservado.

## Configurações profissionais027

Cadastro privado opcional de identificação/endereço, CPF cifrado AES-GCM/máscara e foto própria; apresentação, CREF declarado e focos separados. Publicação voluntária cria projeção mínima e revogável, sem CPF/endereço/e-mail. Não é verificação de habilitação. Tokens de troca de e-mail são temporários30min e vinculados à credencial vigente; pedidos de direitos e eventos guardam protocolo/estado/tipo/data sem conteúdo sensível nos logs. Exportação autenticada limita-se à conta/configurações, não à portabilidade integral.

Acesso somente proprietário confirmado, mesmo sem assinatura ativa; API não aceita proprietário arbitrário. Eliminação elegível016 remove por cascata de conta, preservando seus bloqueios/ledger/replay e retenções anteriores. Retenção jurídica de cadastro/eventos/protocolos, responsabilidades, canal e base por finalidade ainda precisam de aprovação; nenhuma duração foi inventada. Operação de chave/backup/rotação e publicação exigem avaliação antes de dados reais. [Modelo, regras, fontes e limitações](../modulos/configuracoes.md). NO-GO015 preservado.

### Consulta administrativa de contas — 08/11/2026

A visão admin de Usuários consulta somente contas existentes: lista de nome, papel, bloqueio e criação, paginada em 20; e-mail, confirmação, data de bloqueio e vigência de encerramento apenas no perfil solicitado. Finalidade operacional cadastral, acesso exclusivo à sessão admin com verificação em cada consulta. Sem acesso à carteira/saúde, credenciais ou sessões, sem exportações/mutações, sem nova cópia ou prazo de retenção. A busca por nome e filtros são preservados na URL para navegação; não registrar querystrings/dados identificáveis em logs operacionais. Não confundir aluno em carteira com conta autenticável. A retenção das fontes segue as decisões existentes; este módulo não amplia a finalidade para marketing ou cruzamento de carteiras.

### Consulta administrativa de assinaturas — 08/11/2026

Finalidade operacional SaaS, exclusivamente sessão admin: lista de titular e contrato resumido; contato e faturas resumidas sob demanda, 10 por página, sem PAN/CVC, identificadores de integração ou payloads Stripe. Fontes `billing_*` e identidade existente; sem acesso financeiro profissional `finance_*`, sem cópias/exportação ou retenção adicional. Interface somente leitura, sem reconciliação externa ou alteração de entitlement; consultas validam admin e ID da conta. Política de retenção das fontes permanece vigente. Não registrar contatos, filtros ou querystrings identificáveis nos logs operacionais.

Visão financeira SaaS integrada (08/11/2026): agregados de faturas e estimativa de próxima cobrança com finalidade operacional exclusiva do admin. Painéis paginados apresentam somente nome do titular, datas e valores/situação, sem contato ou identificador de integração. Sem exportação, nova cópia, retenção adicional, reconciliação externa ou mutação de entitlement. Não reutiliza `finance_*` do profissional. Critérios, ausência de data de pagamento, taxas e estornos documentados no módulo de administração.

### Monitoramento administrativo de privacidade e segurança — 08/11/2026

Finalidade: acompanhamento operacional de pedidos, encerramentos, eliminação/retentivas e bloqueios de conta. Acesso exclusivo à sessão admin, validado em cada consulta; lista limitada a 20 registros. Exibe nome da conta responsável e metadados enumerados/datas; detalhe sob demanda. Jobs de aluno não revelam sujeito/identidade do aluno. Conta removida é apresentada como tombstone sem reidentificação. Não acessa credenciais, IPs, chaves, objetos de arquivo, referências de aprovação ou saúde. Nenhuma nova cópia, exportação ou retenção; fontes mantêm políticas anteriores e não são modificadas pelo painel. Busca/filtros preservados na URL; não registrar querystrings identificáveis nos logs operacionais. Interface não resolve solicitações, executa eliminação nem remove retenções.

Bloqueio/reativação administrativa (08/11/2026): evento registra ID do administrador autor, alvo, tipo, motivo enumerado e data. Finalidade de responsabilização e controle de acesso, consulta somente admin no perfil (últimos dez registros). Sem texto livre, IP, credencial, token ou saúde. Autoria histórica permanece ausente quando desconhecida; nova coluna não reidentifica operadores anteriores. Retenção acompanha política dos eventos de segurança existente. Suspensão revoga sessões e recuperação, preserva dados e contrato; não é eliminação. Reativação não cancela encerramentos ou retenções e não ressuscita sessões.

Decisões administrativas de privacidade (migration 033, local): autor, solicitação, estados anterior/novo, justificativa de 10–1000 caracteres, referência operacional e data. Finalidade de atendimento e responsabilização; acesso admin sob demanda, últimos dez eventos. Formulário instrui não incluir saúde, senhas ou conteúdo entregue na justificativa. Não registrar esses campos em logs. Histórico acompanha retenção da solicitação existente (FK cascade), não promete conservação eterna ou evidência externa imutável. Concluir não elimina automaticamente; pedidos de eliminação dependem de job profissional concluído, sem jobs abertos. Moderação usa autoria/justificativa existentes e não amplia acesso à carteira do contribuinte.

### Gestão de cortesia034 — local

Finalidade: conceder acesso gratuito controlado a profissionais de teste e comprovar concessão/revogação. Dados mínimos: ID do titular, ambiente, prazo, responsável admin, motivo operacional e timestamps; sem saúde, credenciais ou cartão. Listagem admin contém nome e estado; justificativa/autor sob demanda. UI orienta a não inserir dados sensíveis. Metadados anteriores preservam autor desconhecido; nenhuma atribuição retroativa.

Registro não elimina contas/alunos e não contorna retenções. Grants e eventos existentes031 sem FK de usuário permanecem no encerramento; retenção operacional desses registros exige revisão periódica e definição competente, sem presumir retenção perpétua autorizada. A expiração encerra o entitlement, não apaga o histórico. Não amplia tratamento para produção.
