# Inventário de tratamento e retenção proposta — 015

> Atualização local — 25/11/2026: por solicitação do fundador, o login Web agora persiste por 365 dias desde a emissão, sem os antigos cortes de 30 minutos/12 horas. Cookie persistente HttpOnly/Secure/SameSite, autorização por operação, logout, revogação, suspensão, encerramento e troca de senha permanecem. Inspeções passivas não renovam o prazo. Cleanup e contagem de sessões lógicas seguem o mesmo prazo Web. Sessões antigas não são reativadas nem têm seus cookies prorrogados: novo login emite o prazo novo. Política Mobile inalterada. Descrições de 30min/12h abaixo são históricas. Sem deploy ou homologação de produção.

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

### Produtos do personal035 — autoria privada

Finalidade: organizar conteúdo e oferta comercial do próprio profissional. Dados: nome/descrição/categoria/preço do produto, materiaisPDF/imagens, aulas/links, declaração de direitos, snapshot do modelo de treino sem aluno, responsável/versão/timestamps. Somente proprietário com entitlement acessa; não há comprador/página pública. Não inserir dados de saúde ou identificar alunos nos materiais. Arquivos nunca em public/bundles/props de lista; endpoint reautoriza e revoga no arquivamento/remoção. Downloads já realizados não são revogáveis. Nome de arquivo não integra URL de upload nem logs adicionais.

No encerramento, acesso é revogado pela regra existente; eliminação profissional operacional remove produtos e cascatas (arquivos, snapshots, eventos e chaves) quando os bloqueios prévios permitem finalizar. Não cria retenção financeira. Cópias de backup continuam sujeitas ao ciclo operacional de retenção/restore existente. Volumes limitados, sem novas integrações externas. Conteúdo de YouTube é externo e aberto só por ação explícita; sem alegação de hospedagem privada ou DRM. [Contrato035](../modulos/produtos.md).

### eCoach (prévia local)

Texto digitado e respostas fixas mantidos apenas em memória do componente durante a visita, sem transmissão pelo módulo, persistência ou logs. Não consulta alunos ou dados de saúde. Formatos de arquivo e áudio são demonstrativos, sem coleta. Integração futura exige nova avaliação de finalidade, retenção e acesso antes da ativação.

Atualização da prévia eCoach: rascunho e conversa agora permanecem apenas na memória do shell autenticado para continuidade entre Finder e página completa. Até 20 envios, 2.000 caracteres por envio; descarte ao limpar, logout/desmontagem do shell ou reload. Identificação do módulo sem query strings, IDs ou registros. Nenhum texto do chat é transmitido ou registrado pelo módulo. Substitui o descarte anterior ao sair da página.

Preferência de permissão eCoach: finalidade de registrar controle explícito do profissional sobre futura assistência; enum read/create/manage em configurações existentes, acesso somente do titular profissional e versionamento otimista. Retenção e exclusão seguem `professional_settings`; evento genérico `preferences_saved` sem conteúdo da conversa. Não habilita processamento por fornecedor de IA ou criação/edição real. Sem novas tabelas ou migrations.

### eCoach — conversas e contexto persistentes (036/037, local)

Esta seção substitui a retenção apenas em memória da prévia. Finalidade: continuidade de conversas solicitadas pelo personal. Dados: título, texto do usuário, resposta fixa do servidor, snapshot de módulo/período/filtros e IDs de aluno/cobrança quando explicitamente selecionados. Sem coleta de DOM, campos de formulário, valores ou envio a fornecedor de IA. Texto livre pode conter dados pessoais/sensíveis voluntários e exige minimização pelo titular.

Acesso somente do profissional autorizado; PostgreSQL com FKs de proprietário, DTO mínimo, rate limit e cache privado. Máximo 200 conversas por conta, 20 turnos por conversa; histórico paginado no servidor. Retenção até excluir conversa ou encerramento elegível da conta, sem prazo jurídico inventado. Exclusão remove conteúdo em cascade; marcador sem título/texto impede recriação por retry e é removido na eliminação profissional. Exclusão de aluno remove conversas explicitamente vinculadas por contexto; menções em texto livre exigem revisão operacional do pedido. Processo de backup/restore e retenções obrigatórias anteriores permanecem aplicáveis. Sem logs de conteúdo ou uso para treinamento implementado. Publicação externa e revisão do tratamento por provedor são pendentes.


### eCoach — etapa 2 local (2026-11-13)

PREPARADO para integração configurável OpenAI/Anthropic, com adaptadores e ferramentas limitadas implementados e testes controlados; inferência externa NÃO HOMOLOGADA. IA desativada por padrão. Pro/cortesia, permissões, consentimento, isolamento e confirmação de propostas de rascunho no servidor. Sem pagamento, exclusão ou comunicação automáticos. Solicitações/propostas com prazo de 24h e limpeza operacional necessária. Contratos, finalidade, retenção, configuração e pendências em [eCoach](../modulos/ecoach.md#etapa-2--integração-configurável-e-ferramentas-limitadas). Sem deploy; NO-GO 015 preservado.

### eCoach — escopo interno ampliado (14/11/2026)

Consulta explícita de agenda e modelos de anamnese, sem respostas clínicas. Detalhe de compromisso pode compartilhar título privado, notas e local com OpenAI somente após consentimento v2 e solicitação, para propor agendamento/remarcação. Modelos compartilham perguntas/condições, sem respostas de alunos. Mesma retenção da 038, limpeza operacional e isolamento; vínculo estruturado de aluno em proposta de agendamento participa do fluxo de eliminação existente. Menções livres e retenção do fornecedor exigem processo próprio. [Finalidade e contratos](../modulos/ecoach.md#gestão-interna--14112026). Não homologado externamente.

### eCoach: captura e leitura temporárias (local, 14/11/2026)

Finalidade: ditar mensagem ou obter texto revisável de imagem/PDF escolhido pelo profissional. Acesso: sessão profissional Pro/cortesia e consentimento externo v3, revalidação após inferência. Áudio/bytes são temporários na memória de navegador/servidor e enviados à OpenAI somente após ação autorizada; não são gravados em banco/object storage/log. Transcrição/leitura fica no rascunho até envio voluntário; mensagem enviada segue retenção/exclusão de conversas. O provedor possui política própria; `store:false` em Responses não significa ausência de retenção operacional externa. Revogar consentimento bloqueia novas leituras e entrega tardia no servidor, sem desfazer uma transmissão já iniciada. Não enviar dados sensíveis desnecessários. Real dependente de cota e homologação; NO-GO015 mantido.

### Atendimento assistido039 — alunos e leads

Dados privados por profissional: identificação de contato (nome/canal/endereço opcional), mensagens declaradas manualmente, rascunhos/textos aprovados, regras e tarefas de preparação. Finalidade exclusiva de relacionamento/atendimento; vínculo de aluno é explícito, sem dedução por e-mail/telefone. Nenhuma recepção externa existe nesta entrega. IA requer consentimento próprio de atendimento, permissão canônica do eCoach e autorização por conversa; responsável deve informar o contato sobre esse tratamento, especialmente antes de compartilhar informações pessoais. Limitar às últimas 10 mensagens e instruções necessárias, sem prontuários, financeiro ou outras conversas.

Retenção: conversas sem atualização há 180 dias são eliminadas por cleanup; usuário pode eliminar antes. Cascade remove mensagens, eventos e tarefas. Trabalhadores concluídos/cancelados eliminam instruções temporárias; failed preserva para retry limitado. Operações com IDs/digests mínimos e tombstones são retidas até exclusão de conta para impedir replay. Eventos globais de autorização/regras usam a auditoria canônica024, sem mensagens/contatos. Eliminação de aluno remove somente conversas vinculadas; leads e menções livres exigem localização/revisão manual. Eliminação do profissional remove leads, regras, permissões e eventos do proprietário. Direitos financeiros e retenções obrigatórias seguem worker existente; nenhum transporte real ou prova de entrega é criado. Tratamento/retenção externos da OpenAI permanecem sujeitos à revisão/homologação. Ver `docs/modulos/atendimento-assistido.md`.

### eCoach — controle de finalidade

A [política de escopo](../seguranca/ecoach-escopo-e-abuso.md) limita geração e ferramentas à finalidade profissional. Recusas podem ser salvas na conversa como modo `policy`, seguindo a mesma retenção/exclusão. Log de recusa não contém prompt, identidade ou conteúdo clínico. Nome do contato foi removido do contexto de atendimento entregue ao provedor; PDF utiliza somente texto previamente validado, sem o binário. Áudio/imagem ainda exigem leitura externa inicial autorizada.

Store — preferências locais de navegação: IDs públicos de curtidas e sacola armazenados no navegador (localStorage), sem identidade, rastreamento, envio a servidor ou vínculo com conta profissional. Finalidade: preservar seleção entre páginas/reloads; até50 IDs conhecidos por lista. Retenção até remoção individual ou limpeza do armazenamento pelo usuário. Sem operação comercial ou reserva decorrente desses IDs.

Store checkout de demonstração: não coleta credenciais ou identidade de comprador; usa e-mail/endereço fictícios fixos. CEP digitado apenas no estado em memória, finalidade de validação visual, sem envio/log/persistência e descartado ao sair/recarregar. Interface orienta uso de CEP fictício. Nenhum dado de pagamento solicitado. OAuth e cadastro real permanecem não implementados e exigem avaliação própria antes de ativação.

## AUTH-01/02 — sessões integradas (local, 25/11/2026)

Finalidade: autenticação técnica Core/API, autenticação de contas existentes e continuidade/revogação de sessão Mobile. Não cria identidade paralela nem novos papéis. `core_service_assertions` contém issuer/ambiente/jti e prazo, sem dados de usuário; limpeza limitada retém apenas a janela antireplay. `mobile_session_families` contém userId, identificador de instalação autodeclarado, plataforma, rótulo e última atividade relevante; acesso somente pelo Core e desafio autenticado de escolha do próprio usuário. Metadados de dispositivo não comprovam identidade.

Access/refresh são aleatórios e persistidos por digest. Recibos de refresh guardam digests da operação/prova e resposta cifrada AES-GCM recuperável por até5min; ciphertext expirado é eliminado na limpeza e nas novas rotações daquela família. Chaves versionadas em configuração privada separada. Digests de refresh consumidos permanecem durante a família para detectar replay; isso pode crescer em sessões longas, exige monitoramento/limpeza operacional, não contém senhas ou tokens claros. Access expirado também requer limpeza operacional; nenhuma cópia do histórico pessoal é criada aqui.

Inatividade relevante365dias encerra a sessão lógica; refresh/polling não renovam esse prazo, não há expiração absoluta periódica. Revogar a âncora Web revoga a família; cleanup elimina âncoras revogadas/expiradas e suas estruturas em cascata. Desafios de sexta sessão duram5min, são digest-only e vinculados à versão da credencial. Configurar execução e evidenciar limpeza no ambiente alvo antes de produção. Sem alegação de homologação LGPD; NO-GO015 preservado.

## Rascunhos de treinos — atualização local de 2026-11-25

Finalidade: recuperar trabalho de prescrição ainda não confirmado, incluindo vínculo com aluno e informações potencialmente sensíveis registradas pelo profissional. Persistência em `workout_editor_drafts`, acesso exclusivo do profissional proprietário com sessão/assinatura válidas; respostas privadas sem cache e sem conteúdo em logs ou armazenamento do navegador. Não disponível ao aluno nem usado como prescrição publicada.

Retenção: até confirmação do planejamento ou eliminação da conta/dados relacionados; não há expiração automática por idade nesta entrega. A rotina de eliminação remove rascunhos do profissional e referências ao aluno/planejamento eliminado antes de apagar planos. Suspensão de assinatura bloqueia acesso, sem apagar automaticamente o trabalho. Não há exportação específica de rascunhos nesta entrega. Estado IMPLEMENTADO localmente; validação de produção e NO-GO da 015 permanecem independentes.

## AUTH03 — cadastro pessoal e evidências legais (local, 25/11/2026)

Cadastro reutiliza identidade/credencial e desafios efêmeros existentes; finalidade pessoal separada do cadastro profissional. Dados pendentes incluem nome, email, hash Argon2, digest de desafio/código e referência aos documentos apresentados; código10min, janela total30min e limpeza existente. A conta confirmada tem papel personal, sem vínculo automático com aluno/profissional ou liberação comercial.

Documentos legais imutáveis guardam versão, hash SHA256 de UTF8, conteúdo, título, URL, vigência e marca sintética; ponteiros de publicação por ambiente são exclusivamente operacionais. Aceites mínimos vinculam conta/documento/operação, datas de apresentação e aceite no servidor, issuer e requestId, sem IP, senha ou texto livre adicional. Ciência da privacidade não representa consentimento genérico para saúde/marketing/IA. Runtime pode ler documentos e inserir aceites, sem editar/publicar documentos ou apagar recibos. Eliminação aprovada remove recibos pelo fluxo operador canônico antes da conta; não se declara base legal/prazo jurídico definitivo. Documentos sem dados pessoais mantêm versões; nenhum documento oficial publicado nesta entrega. Metadados e reaceite de conta existente independem da abertura de novos cadastros. Sem enforcement global de módulos por aceite nesta etapa; NO-GO015 preservado.

## AUTH04 local — recuperação pessoal (26/11/2026)

Mesmo cadastro users/credentials e password_resets, sem nova cópia de usuário ou segredo na API. Finalidade de recuperação de conta; email normalizado, hash de token aleatório e expiração30min. Todos links da conta consumidos em reset confirmado e sessões Web/Mobile revogadas na transação existente. App só recebe token por link temporário, sem persistência/analytics; validação passiva não revela identidade. Handoff custom exclusivo dev, fallbackWeb com fragmento; produção/AppLinks/UniversalLinks pendentes. CapturasSMTP locais sintéticas não são deliveryexterna; descartar arquivos privados do ensaio após homologação apropriada. Sem alteração de retenções jurídicas/NO-GO015.
