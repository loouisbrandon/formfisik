# Configurações profissionais

Estado: implementação local em validação, novembro de 2026. FormFisik é empresa independente fundada por Brandon Louis. Não representa certificação jurídica, regularidade profissional verificada ou homologação de produção.

## Auditoria e limites

A central anterior tinha navegação e prévias locais. Foram auditados sessão opaca, cadastro/recuperação por SMTP, apresentações de documentos, notificações024, importações026, assinatura SaaS, controles de conta e eliminação016. Mantidos `ProfessionalShell`, tokens do Design System, `AvatarCrop`, `CrmDialog`, `useUnsavedChanges`, Argon2id, limites persistentes, cookies HttpOnly, transações e fluxo canônico de assinatura/importação.

Perfil e foto de pessoa não reutilizam o campo de logomarca dos PDFs: finalidades e visibilidade são diferentes. Não existe verificação externa de identidade ou CREF. Dados profissionais não mudam contratos, PDFs históricos, preços, autorização técnica ou assinatura. Não houve criação de nova integração financeira, dependência ou provedor.

## Funções

- Perfil: nome profissional, apresentação, CREF declarado, focos de treino, modalidade, cidade e UF. Rascunhos persistem em memória entre as seções; salvar persiste no PostgreSQL com versão otimista. A concorrência retorna409 para conferência, sem sobrescrever alterações silenciosamente.
- Focos: hipertrofia, emagrecimento, força, condicionamento, mobilidade/flexibilidade, qualidade de vida, preparação física, treinamento funcional, iniciação e envelhecimento ativo. Taxonomia editorial de objetivos de atendimento, sem atribuição de título de especialista, tratamento clínico ou resultado garantido.
- Dados privados: nome completo, telefone, CPF opcional, CEP, logradouro, número, complemento, bairro, cidade e UF. Não se afirma que todos sejam uma obrigação legal de cadastro em SaaS. CPF/endereço são opcionais e devem ser preenchidos somente quando pertinentes à identificação/operação. Não há upload de RG, diploma ou documento nem consulta externa de CEP/CPF.
- CPF: validação dos dígitos verificadores não comprova identidade. AES-256-GCM com nonce aleatório e chave própria do servidor; apenas dois últimos dígitos são apresentados, além de máscara. O valor completo não retorna no GET/exportação ou em props. Substituição exige senha atual. Limpeza pode ser requerida pelo fluxo de correção/eliminação; não existe remoção automática por arquivamento.
- Foto: JPEG/PNG/WebP estático até5MiB,24MP e6000px/lado; servidor recodifica512×512JPEG, remove metadados, limita armazenamento a256KiB e rejeita animação. Download privado exige sessão do proprietário. Remoção disponível. Foto salva é integrada aos avatares do shell.
- Conta: alteração de nome/dados privados exige senha atual. Troca de senha exige8–128 caracteres, com maiúscula, minúscula e caractere especial, confirmação visual, Argon2id e revoga todas as sessões e links de recuperação. Encerrar outras sessões preserva a atual. Eventos guardam tipo/data, sem senha, CPF, endereço ou respostas.
- E-mail: senha atual e confirmação em link de uso único no novo endereço,30min. Token só em fragmento removido do navegador, digest no servidor, sem troca antes de confirmar. A confirmação invalida sessões e recuperação; credencial alterada após o pedido invalida o link. SMTP existente é reutilizado. Falha no aviso ao e-mail antigo não desfaz a alteração já confirmada.
- Avisos: preferências reais de Agenda, Check-ins e Contratos filtram o sininho e a Comunicação. Não eliminam fatos nos módulos de origem. Leitura por proprietário; uma consulta pequena de preferências por consulta de notificações, com disponibilidade da tabela verificada uma vez após sua existência. Bancos anteriores à migration mantêm avisos padrão até a autorização local. E-mails de segurança não são silenciados. Não existem canais profissionais de WhatsApp/SMS/push ativados.
- Assinatura e importação: reutilizam `/assinatura/gerenciar` e `/importar`, sem duplicação de regras, obrigações ou processamento.
- Privacidade: download autenticado de conta/configurações em JSON, explicitamente parcial e sem dados de alunos, foto binária, digests, segredos ou CPF completo. Não equivale à portabilidade integral dos demais módulos. Pedidos de acesso/correção/eliminação geram protocolo e estado real, únicos por tipo enquanto pendentes. Interface mostra os20 mais recentes; operador consulta100 abertos por execução. Não há aprovação ou eliminação automática.

## Publicação voluntária

Padrão privado. O fundador aprovou o link aberto com publicação voluntária. Não foi publicado nenhum perfil real. A publicação exige ação e confirmação explícitas, versão atual, nome profissional, apresentação, CREF e foco. Snapshot público contém nome completo/profissional, apresentação, CREF, focos, modalidade e cidade/UF; CPF, endereço, telefone privado e e-mail não fazem parte dele. Perfil publicado pode incluir sua foto.

Alterar perfil, dados privados ou foto retira a publicação para nova conferência. `/profissionais/[id]` e seu endpoint de foto só servem conteúdo publicado de conta não suspensa; retirar o perfil bloqueia novos acessos. Respostas não devem ser armazenadas por caches compartilhados; robôs recebem noindex. Cópias já salvas por terceiros não podem ser revogadas. CREF declarado aparece com aviso, jamais selo de verificação. O software não garante que uma declaração corresponda à situação do conselho.

## Pesquisa realizada em06/11/2026

Fontes primárias de produto são referências de experiência, não normas profissionais:

- [Prime Coaching](https://primecoaching.com.br/): gestão integrada de consultoria, treino e acompanhamento; a página pública não forneceu contrato de campos de cadastro/CREF. Não foi inferida a estrutura interna nem copiado fluxo financeiro.
- [PrimeTrainer Portal](https://portal.primetrainer.com.br/como-funciona/): outro produto, distinto da Prime Coaching, documenta bio, foto, localização, objetivos e modalidade; apoia separar apresentação profissional de identificação privada.
- [PersonalGO — perfil e CREF](https://ajuda.personalgo.com.br/assuntos/perfil-profissional-e-cref/): credencial e perfil são áreas próprias. Regras comerciais/cadastrais de concorrentes não são adotadas como autorização regulatória.

Fontes normativas e oficiais:

- [Código de Ética, Resolução CONFEF508/2023, art.4](https://www.cref12.org.br/codigo-de-etica/): divulgação profissional deve conter nome e registro. A regra de publicação do produto exige ambos, sem certificar regularidade ou atribuições.
- [CREF3/SC — apresentação do número](https://crefsc.org.br/voce-utiliza-o-numero-do-registro-profissional-corretamente-3/): referência de formato número-categoria/UF. Validação sintática aceita4–10 dígitos, G/P e UF brasileira; variações legítimas não previstas requerem revisão, não falsificação do campo. Categoria e UF não constituem autorização automática de atuação.
- [LGPD, texto atualizado, arts.6,7,9,18,46](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html): finalidade, minimização, transparência, direitos e proteção fundamentam a separação de dados, a publicação voluntária e o atendimento. Base legal/prazo por finalidade, identidade jurídica/canal e contratos precisam de aprovação específica; esta implementação não os inventa.
- [Ministério da Saúde — atividade física](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/atividade-fisica) e [Guia brasileiro](https://bvsms.saude.gov.br/ministerio-da-saude-disponibiliza-guia-de-atividade-fisica-para-a-populacao-brasileira/): referências de linguagem para condicionamento, mobilidade, fortalecimento e envelhecimento ativo. Não são catálogo de especialidades reconhecidas nem prescrição automática.

## Persistência, API e permissões

Migration027 cria `professional_settings` (perfil, dados privados, cifra/máscara, preferências, foto, publicação e versão), `settings_email_changes` (tentativas temporárias), `settings_privacy_requests` e `settings_events`. FK de proprietário `users(id) ON DELETE CASCADE` mantém compatibilidade com eliminação016 elegível e replay de conta. Não representa autorização para eliminar registros sob retenção. Não há prazo jurídico novo; somente expiração técnica de links30min, removidos no próximo pedido, após consumo e pelo comando de limpeza já existente (`npm run db:cleanup`).

`GET /api/settings`: DTO privado de configurações e20 protocolos recentes. `?export=1`: download parcial descrito. `POST`: comandos estritos `profile`, `account`, `preferences`, `password`, `revokeOthers`, `privacy`; campos/versão, senha atual nas ações sensíveis. `PUT/DELETE /api/settings/avatar`: bytes ou remoção, cabeçalho `X-Settings-Version`. `GET` da foto é privado. `POST /api/settings/publication`: versão, publicação e confirmação explícita. `POST /api/settings/email` solicita; `/confirm` consome token. Nenhum ownerId fornecido pelo cliente é aceito. Perfil público é projeção explícita, sem API privada anônima.

Todos os comandos verificam origem, sessão, papel profissional, limites e propriedade no servidor. Configurações não exigem assinatura ativa: acesso à própria conta/segurança/privacidade permanece disponível. Transações sensíveis compartilham lock de usuário com sessão/recuperação e revalidam a sessão. Senhas, tokens, CPF, endereço e conteúdo de perfil não entram em logs. Respostas privadas no-store, Vary Cookie e nosniff. Pedidos e eventos são próprios, não há acesso de terceiros por UUID.

## Operação

Preparar migration027 e executar somente no ambiente autorizado. O fundador autorizou explicitamente026 e027 e ambas foram aplicadas somente ao banco local de desenvolvimento. Testes usam banco descartável. A chave local foi criada sem divulgação e o servidor foi reiniciado. Chave `SETTINGS_ENCRYPTION_KEY`:32 bytes/64hex independentes de SMTP/HMAC/billing, somente servidor. Ausência/formato incorreto impede salvar CPF; demais campos não dependem de cifragem. Não registrar a chave em docs/bundle/props. Backup e rotação com recifragem/versionamento devem ser definidos antes de dados reais; não trocar a chave arbitrariamente. SMTP externo e produção continuam sujeitos à homologação existente.

Operador: `npm run settings:privacy -- list` lista protocolos sem nome/documento. `resolve <uuid> processing|completed|denied <referência-opaca> --identity-and-scope-verified` registra análise/conclusão. Não executa exclusão. Para atender eliminação, conferir identidade/finalidade/retenções, suspender a conta quando aprovado e usar o mecanismo016, seus preflights e ledger; só concluir o protocolo após evidência. Referência não deve conter PII. Canal, responsável, prazos, política aprovada e revisão humana permanecem gates de produção.

## Validação e estado

Ver relatório [Configurações funcionais](../engenharia/configuracoes-funcionais-2026-11.md). Testes controlados não verificam a inscrição no conselho, entrega real de SMTP, documentos reais, dispositivos físicos ou conformidade jurídica integral. Produção/dados reais permanecem NO-GO015. Sem deploy ou commit automático. Migrations locais somente com aprovação explícita, obtida para026 e027.

## Entrada direta de Minha conta

Para profissionais, a sidebar aponta para `/configuracoes?section=account`, selecionando Minha conta no primeiro render e destacando esse atalho na navegação. O parâmetro é validado por whitelist no servidor; outros valores abrem Visão geral. A rota antiga `/conta` autentica e redireciona profissionais para essa entrada, sem exibir o onboarding legado. Perfis não profissionais mantêm uma página mínima informando acesso profissional não habilitado, sem encaminhá-los aos recursos de configuração profissional. Não altera autenticação, autorização dos endpoints ou informações salvas. A proteção compartilhada contra descarte em navegação permanece.

Correção de navegação entre abas: a aba visível agora deriva da query string validada contra as seções existentes. Trocas internas atualizam o histórico nativo integrado ao Next sem recarregar a página; conteúdo funcional acompanha a seleção atual. Isso evita manter Visão geral/Perfil público ao retornar pelo atalho Minha conta após uma entrada anterior. Valores desconhecidos continuam usando Visão geral. Campos permanecem no componente funcional montado e o guard de navegação é preservado.
