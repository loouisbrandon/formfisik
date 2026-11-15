# Gestão de alunos — entrega 008

A FormFisik é empresa independente fundada por Brandon Louis. Este é o primeiro módulo operacional da plataforma web. Não inclui login/portal/convites de alunos, identidade global compartilhada, exercícios, treinos, avaliações ou aplicativo mobile.

## Operação

`/alunos` lista exclusivamente os vínculos do profissional autenticado: busca por nome, situação (ativos por padrão, arquivados ou todos), ordenação por nome A-Z/Z-A ou cadastro recente/antigo, total e páginas de 20. Filtros são aplicados ao confirmar “Aplicar filtros”; exportação usa os filtros efetivamente aplicados, não o texto ainda não submetido. Pesquisa é case-insensitive e literal (%, _ e barra não são curingas); preserva acentos. Consultas/paginação/ordenação ocorrem no PostgreSQL, sem carregar toda a carteira no navegador. Ordenação tem desempate por UUID estável.

`/alunos/novo`: nome obrigatório (2–120 caracteres), e-mail opcional até 254, telefone opcional normalizado para 8–15 dígitos e + opcional, nascimento opcional válido entre 1900 e hoje, observações administrativas opcionais até 1.000 caracteres. Nome/e-mail/textos normalizados em NFC, nome com espaços repetidos compactados, e-mail em minúsculas e telefone sem pontuação. Não são coletados CPF, endereço, saúde ou dados clínicos. Observações têm aviso explícito de uso administrativo; não são prontuário nem consentimento para compartilhar informações. Não há classificação semântica automática dos textos; o profissional deve respeitar a finalidade informada.

O sistema define situação inicial ativa. Cadastro não cria `users`, credenciais, sessão ou assinatura para aluno. E-mail não é único e não vincula pessoas entre profissionais.

O formulário tem labels, validação compartilhada Zod, erros por campo com foco, loading, bloqueio de duplo envio, sucesso e retry. Cada tentativa possui UUID de idempotência. Reenvio com mesma chave/dados retorna o mesmo vínculo; reutilização com outros dados é conflito. Sob lock transacional por profissional, nome normalizado (sem diferenciar caixa) + e-mail + telefone + nascimento idênticos pedem confirmação explícita de outro aluno. O operador pode confirmar homônimo; não há unicidade global nem bloqueio definitivo por nome. A verificação também considera arquivados. Observações não definem identidade.

`/alunos/[id]`: cadastro, contato opcional, nascimento, situação, datas, identificação estável do vínculo e histórico administrativo das últimas 20 versões. Dados ausentes são explícitos. Editar em `/alunos/[id]/editar`, arquivar com confirmação, reativar e exportar cadastro individual. Sem seções de avaliação/treino/evolução fictícias.

Edição e transições exigem versão inteira positiva. Lock do vínculo e comparação de versão impedem perda de edição; conflito 409 exige recarregar. Alteração de dados e registro do evento são atômicos. Arquivar é lógico, preserva identidade, vínculo e eventos; reativar mantém histórico anterior. `archivedAt` descreve arquivamento corrente (null quando ativo), enquanto eventos preservam as transições anteriores; `reactivatedAt` é a última reativação. Repetir a situação já vigente com a versão atual não cria evento nem incrementa versão.

## Modelo de dados

| Tabela | Finalidade / integridade |
| --- | --- |
| student_records | Identidade cadastral privada por profissional: UUID, professional_id, nome, contato/nascimento opcionais, notas. FK para usuário; UNIQUE(professional_id,id). Nenhuma associação por e-mail. |
| student_links | UUID do vínculo privado, professional_id + student_id com FK composta de propriedade, status active/archived, versão, cadastro/atualização/arquivamento/reativação; chave de criação única por profissional e SHA-256 do payload normalizado para replay. Um vínculo por registro privado/profissional. |
| student_administrative_events | Tipo created/updated/archived/reactivated, versão e data, FK composta para vínculo/profissional. UNIQUE(link_id,version). Sem nomes, contatos, notas anteriores, payload, IP ou credenciais. |

Migrations novas: `006_students.sql` e `007_student_administrative_events.sql`. Anteriores preservadas. A 007 registra criação somente a partir da data factual existente; não reconstrói alterações sem evidência. Índices de proprietário/situação/data, nome normalizado e histórico suportam consultas delimitadas. Busca contains pode exigir futura indexação especializada em escala; statement_timeout e limites de página/exportação já limitam operações.

Futura identidade própria do aluno deverá usar associação separada e verificada entre identidade global e registros privados, mediante regras próprias de consentimento/propriedade. Não reaproveitar e-mail como prova nem transformar o registro privado em cadastro global compartilhado. Uma associação futura não concede a outro profissional acesso a dados, histórico ou notas desta carteira.

## Contratos HTTP

Base `/api/students`, sessão opaca HttpOnly, e-mail confirmado, perfil profissional e direito comercial confirmado no servidor em **cada operação**. Origin igual a APP_URL em POST/PUT. Não há JWT ou bypass local. `professionalAccess` reutiliza a política existente de assinaturas, extraída do dashboard sem alterar Stripe. Todas as consultas de registros usam professional_id da sessão + ID do vínculo, nunca proprietário enviado pelo cliente.

| Rota / método | Entrada / saída |
| --- | --- |
| GET /api/students | q (até 120), status=active\|archived\|all, sort=name_asc\|name_desc\|newest\|oldest, page inteiro 1–100000. Retorna items resumidos, total, page, pageSize=20, pages, filters. |
| POST /api/students | JSON fullName,email,phone,birthDate,adminNotes,creationKey; allowDuplicate opcional. 201 {student}. Campos opcionais podem ser omitidos; são normalizados para strings vazias quando ausentes. |
| GET /api/students/:id | 200 {student} completo, incluindo history com até 20 eventos. |
| PUT /api/students/:id | Campos cadastrais completos + version; 200 {student}. Propriedade/situação não são atribuíveis. |
| POST /api/students/:id/status | {status:'active'\|'archived',version}; 200 {student}. |
| GET /api/students/:id/pdf | PDF individual como attachment após autorização/propriedade. |
| GET /api/students/export | Mesmos filtros/ordenação da lista; exporta todos os resultados filtrados (não só a página), até 500. page não seleciona o universo exportado. |

Lista resumida inclui somente id, fullName, status, version, createdAt e updatedAt; não distribui contato, nascimento ou observações desnecessariamente. Detalhe inclui dados cadastrais e metadados administrativos. Schemas strict rejeitam mass assignment e filtros desconhecidos. SQL parametrizado, ordenação por mapa interno, IDs UUID validados. Registro de terceiro e inexistente retornam o mesmo 404.

Erros: 400 validação (errors por campo no cadastro/edição); 401 sessão; 403 perfil/acesso/origem, com destination interno quando comercial; 404 registro; 409 duplicate/version/key; 422 relatório >500; 429 limite; 503 dependência. Nenhum erro expõe SQL, dados pessoais ou configuração. Respostas API/PDF private,no-store + Vary Cookie + no-referrer; PDF attachment, application/pdf e nosniff. Sem logs de nomes, documentos, notas ou corpo pelo módulo. Infraestrutura/proxy/analytics devem preservar a mesma minimização e não reter buscas/URLs pessoais desnecessariamente.

Limites persistentes por operação/profissional: listagem 120/min; cadastro/detalhe/edição/transição 40/min; cada modalidade de PDF 5/min. Corpo JSON limitado pelo helper existente a 8KB. Limite ocorre antes da consulta comercial canônica para conter abuso de provedor. Página servidor verifica sessão/acesso antes de renderizar cliente; API repete autorização. Monitor de acesso existente protege a apresentação, mas não substitui autorização de operações.

## PDFs

Geração estruturada no servidor por PDFKit (Node), sem screenshot, navegador, envio a serviço externo ou dados enviados pelo frontend como fonte do relatório. Fonte local DejaVu Sans com licença incluída, A4, margem lateral 48pt, cabeçalho recorrente, faixa verde e palavra FormFisik preta, corpo 10/11pt, rodapé paginado, fundo branco para impressão. Textos com quebra automática e entradas da carteira mantidas juntas quando couberem. Rodapé usa margem temporária específica para não criar páginas vazias.

Individual: aluno, vínculo, dados opcionais, situação, cadastro/atualização, notas administrativas, profissional responsável e emissão em Brasília. Carteira: profissional, emissão, filtros/ordenação, nome/situação/cadastro de cada resultado e total; omite contato, nascimento e notas. Sem dados financeiros, tokens ou credenciais. Não há assinatura digital, certificação ou validade jurídica alegada. Arquivos não são persistidos no servidor em runtime: memória da requisição e download autenticado. Limite de 500 exige refinar filtros, sem truncar silenciosamente. Destinatário deve guardar/eliminar o download com segurança.

Fontes primárias da implementação: [fluxo e fontes PDFKit](https://pdfkit.org/docs/text.html), [documento e stream Node](https://pdfkit.org/docs/getting_started.html). Fonte é empacotada em assets/fonts com licença, PDFKit externalizado no Next e tracing dos assets preparado para o build; Railway não exige Python/Chromium para gerar PDFs.

## Integração e testes

Menu Alunos ativo em desktop/mobile, inclusive subrotas. Dashboard consulta contagens reais de vínculos ativos/arquivados por usuário; zero agora é contagem real, não ausência de implementação. Onboarding oferece cadastro real e lista, com orientação de primeiro aluno quando total=0. Atividades de treino/acompanhamento permanecem indisponíveis, sem eventos operacionais inventados.

Ver [privacidade e retenção](../privacidade/alunos.md), [ADR-008](../arquitetura/ADR-008-alunos.md), [Design System](../design/DESIGN_SYSTEM.md) e [relatório 008](../engenharia/entrega-008.md). Banco de testes descartável `_test`; fluxo autorizado usa PostgreSQL/sessões reais e ControlledGateway explícito em processo de teste. O harness UI temporário importa componentes reais e chama handlers reais, não é uma rota/flag de produção. Stripe hospedada/manual continua dependente de configuração; nenhum sucesso externo é simulado.

## Integração 010

O perfil passa a mostrar [treinos reais](treinos.md) do vínculo: estado/versão, ficha ativa, criação com aluno preselecionado, seleção de modelo e abertura da ficha. Não cria login de aluno ou altera a política de propriedade. Alunos arquivados preservam acesso histórico, mas não podem receber nova prescrição até reativação. A descrição original da 008 acima delimita o escopo histórico daquela entrega.

## Integração 012

A ficha oferece acesso direto ao [acompanhamento físico](acompanhamento.md) do vínculo privado existente. Saúde não migra para notas administrativas. Aluno arquivado mantém consulta de avaliações, mas precisa ser reativado para alterações. Não se cria conta ou associação global.

## Integração017 — convites e anamneses

[Anamneses](anamneses.md) implementa convites individuais e preenchimento web sem conta, preservando cadastro manual e identidade privada008. Extrai gravador transacional canônico para reutilização, sem outro cadastro. Perfil mostra resumo mínimo e acesso ao histórico por vínculo. Coincidências na própria carteira exigem revisão explícita; e-mail não vincula conta global nem altera identidade automaticamente. Escopo histórico008 acima não descreve disponibilidade017; [relatório017](../engenharia/entrega-017.md).

## Serviços e consultorias019

O perfil oferece “Serviços contratados e entregas” em /alunos/{id}/consultorias. Usa o vínculo privado existente, sem outra identidade ou conta. Lista contratações, datas/status/entregas e histórico autorizado; novo acordo exige aluno ativo, plano/revisão disponíveis e confirmação administrativa. Aluno arquivado conserva consulta e permite cancelamento administrativo, sem cancelar serviços automaticamente. [Regras e limitações](servicos-e-consultorias.md), [API](../engenharia/api-consultorias.md) e [relatório019](../engenharia/entrega-019.md). Não há cobrança de aluno, assinatura eletrônica ou Connect. Worker016 trata eliminação aprovada dos registros comerciais administrativos antes das fontes canônicas.

## Financeiro profissional020

Contratações elegíveis da carteira008/019 podem receber configuração financeira em /financeiro, com preço preservado e sem duplicar o aluno. Financeiro não cria identidade/login do aluno. Pagamento e inadimplência não alteram automaticamente treinos ou vínculo; dependência financeira bloqueia expurgo016 até triagem de retenção.

## Agenda021

Perfil disponibiliza Agenda e atendimentos, contextualizada em `/alunos/[id]/agenda`; autorização do aluno e consultas por proprietário no servidor. Não copia prontuário, notas clínicas ou financeiro. [Agenda](agenda-profissional.md).

## Check-ins022

Perfil oferece resumo de solicitações, atrasos, revisões e datas de última resposta/devolutiva. Subárea `/alunos/[id]/checkins` reúne histórico, respostas, devolutivas, comparação e indicadores; dados completos sob demanda e owner no servidor. [Módulo](checkins.md).

## Comunicação024

Perfil oferece Central de comunicação e histórico contextual do vínculo canônico, sem novo cadastro ou conta do aluno. [Módulo](comunicacao.md) separa preparado, contato declarado, avisos internos e futuros canais; sem envio automático.

## Importação026

CSV administrativo026 reutiliza o cadastro/vínculo privado008 e a inscrição CRM condicional, com prévia, confirmação e sem associação por contato. [Política/formatos](importacao.md), [API](../engenharia/api-importacao.md) e [relatório](../engenharia/entrega-026.md). Estado GO local controlado; produção NO-GO. As limitações anteriores descrevem o escopo histórico da entrega original.

## Refinamento visual da carteira — 05/11/2026

Listagem noturna conforme referência aprovada, com resumos de ativos/arquivados/sem avaliação recente. API GET `/api/students` acrescenta `summary: {active, archived, withoutRecentAssessment}` após as mesmas guardas de sessão/assinatura, reutilizando studentCounts e assessmentCounts com proprietário explícito. Resumos da carteira inteira são independentes da busca; sem avaliação recente significa aluno ativo sem avaliação ativa nos últimos30dias, incluindo quem nunca foi avaliado. Contagem e página permanecem consistentes na consulta existente; resumos são leituras separadas e podem refletir alterações concorrentes. Nenhum contato/nota clínica adicionado ao DTO.

Colunas reais: nome, situação, cadastro e atualização cadastral, ação Ver perfil. Alternância lista/cards não faz requisição. Limpar filtros restaura ativos/nome A–Z/página1. Paginação20 no servidor e exportação pelos filtros aplicados preservadas. Convite continua direcionando ao módulo de anamneses. Sem seleção em massa, busca por e-mail, fotos fictícias, atividade presumida ou novas entidades.

Arquivos: students/portfolio.tsx, portfolio.module.css, student-area.tsx, schema.ts; server/students/handlers.ts; professional/shell.tsx; tests/students.test.ts. Sem dependência ou migration nova. Testes locais:12/12 integração de alunos no banco auxiliar isolado (incluindo isolamento do resumo e privacidade); TypeScript e ESLint aprovados; Chrome/Axe320/768/1440/1672/1920/2560 e altura500 sem overflow horizontal/violações detectadas. Em1440–2560 com altura normal e carteira atual, sem scroll principal. Artefatos em test-results/local/students-dark-verification.json. Build de produção não executado nesta alteração; servidor de desenvolvimento Webpack disponível em localhost:3000.

## Perfil em painéis — 05/11/2026

StudentProfile reutiliza Student já autorizado, StudentIntakeSummary, StudentCheckinSummary e WorkoutList. Nenhum endpoint ou persistência nova. Visão geral organiza registros existentes; Treinos abre listagem completa, Histórico mostra até20 versões cadastrais e Documentos reúne exportações existentes. Avaliações/anamnese/check-ins/agenda são links para os módulos, preservando autorização independente. Serviços, CRM e comunicação continuam acessíveis. Arquivamento mantém confirmação original; reativação e exportação mantêm handlers. Observações continuam administrativas, sem finalidade clínica nova.

WorkoutList recebe opção compact apenas de apresentação: visão geral oculta filtros/abas e aviso geral; listagem da seção Treinos permanece completa. Paginação de registros continua no servidor, sem carregar carteira inteira. Estados vazios, loading, erro e retry dos componentes existentes preservados. Sem consultas agregadas extras para imitar KPIs da referência. Não há feed que misture versões de respostas com eventos cadastrais: histórico indica sua finalidade explicitamente.

Arquivos: students/student-profile.tsx, student-profile.module.css, student-area.tsx; workouts/area.tsx e workouts.module.css; professional/shell.tsx. TypeScript e ESLint aprovados. Chrome/Axe WCAG2A/AA/2.1AA em320/768/1440/1672/1920/2560px e altura500, sem overflow externo; seções locais verificadas por interação. Evidências em test-results/local/student-profile-verification.json. Sem alterações de backend ou migrations. Build de produção não executado neste refinamento.
