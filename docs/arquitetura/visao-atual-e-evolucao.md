# Arquitetura atual e diretrizes de evolução

Estado: inspeção estática do checkout local em 01/11/2026. Não comprova schema instalado, configuração de ambiente ou disponibilidade em produção. [Inventário funcional](../produto/inventario-funcional.md).

## Estrutura atual

Aplicação web Next.js App Router/React/TypeScript. Páginas e Route Handlers estão em `src/app/`; componentes e schemas por domínio em `src/modules/`; persistência, autorização e integrações em `src/server/`, protegidas por `server-only`. PostgreSQL usa `pg`, SQL parametrizado e migrations SQL em `db/migrations/`; não há RLS. Isolamento depende de predicados de proprietário e FKs compostas, além dos guards de operação.

Sessões opacas têm digest persistido, cookie HttpOnly/Secure em produção, 30 minutos de inatividade e 12 horas absolutas. `sessions.ts`, `auth.ts`, `registration.ts` e `password-recovery.ts` implementam identidade; `professional-dashboard.ts`, `access.ts` e `subscriptions/status.ts` verificam acesso comercial no servidor. O proxy aplica headers/CSP e não substitui autorização. O trabalho local da 015 acrescenta suspensão e minimização; foi verificado localmente no fechamento015, mantendo NO-GO de produção.

Stripe SDK no servidor atende exclusivamente Billing SaaS de teste/local, com estado canônico, webhook assinado, idempotência e reconciliação. SMTP atende confirmação e recuperação. Fotos têm adaptador S3/R2 privado em `progress-photos/storage.ts`; sem configuração a operação é indisponível. PDFKit/fontes locais geram documentos, PDF.js apresenta os mesmos bytes privados; `documents/` compartilha composição e artefatos entre treinos e relatórios. Railway é o destino inicial planejado, sem deploy nesta auditoria.

O `ProfessionalShell` é o shell compartilhado: viewport controlada, cabeçalho fora da rolagem e `#app-content` rolável; a navegação extensa da sidebar rola separadamente. Não criar scroll global nas páginas. Regras de tamanho, paginação e responsividade permanecem no [Design System](../design/DESIGN_SYSTEM.md) e AGENTS.md.

## Identidade: implementação versus conceito futuro

| Conceito | Realidade atual | Evolução necessária, não implementada |
| --- | --- | --- |
| Pessoa / identidade | `users` reúne nome, e-mail verificado e um campo `role` | Distinguir pessoa de papéis sem exigir contas distintas por modalidade |
| Conta de acesso | `credentials`, `sessions`, tentativas de cadastro e resets vinculados a `users` | Preservar credencial e revogação únicas; migrar com regressão de concorrência e expiração |
| Perfil profissional | `users.role='professional'`; `professional_presentations` contém apresentação para documentos | Separar habilitação, especialidades e perfil sem transformar apresentação de PDF em validação profissional |
| Organização | Sem entidade organizacional nas migrations inspecionadas | Membros, carteiras e permissões no 027; evitar presumir tenancy organizacional já disponível |
| Modalidade | Catálogo/prescrição específicos da primeira especialidade | Participação e especialização por modalidade só quando autorizadas |
| Serviço contratado | Assinatura SaaS em `billing_*`; contratação administrativa profissional-aluno em `professional_contracts` na019 local | Financeiro local/controlado em finance_* na020; transporte externo bloqueado; sem assinatura jurídica presumida |
| Relação profissional-cliente | `student_records` e `student_links` são privados por `professional_id`; não referenciam uma conta global de aluno | Ativação/vinculação explícita no 029, com comprovação, consentimentos/finalidades e conflitos resolvidos; nunca unir por coincidência de e-mail |
| Permissões | Role único, entitlement SaaS, propriedade e capacidade explícita de moderador (`exercise_moderators`) | Múltiplos papéis e permissões contextuais; não multiplicar contas nem conceder acesso pela UI |
| Dados pessoais/sensíveis | Cadastro, avaliações, fotos, documentos e eventos em domínios distintos com propriedade | Definir finalidade, retenção e acesso por contexto; nenhum papel futuro concede visão total dos dados |

Uma pessoa poderá futuramente ser praticante de musculação, corredora e professora de jiu-jitsu com uma conta. O `role` único atual e a carteira privada não atendem integralmente a esse requisito. Esta diretriz não autoriza refatorar autenticação, migrar identidades ou inventar relações existentes.

## Núcleo e especialização

Reutilizar primeiro contratos e serviços comprovados de identidade, propriedade, alunos, validação, documentos, histórico e integração financeira SaaS; avaliar os demais componentes da [política de reutilização](../estrategia/ecossistema-e-especialidades.md) a cada escopo. Extração exige caso concreto, testes e preservação de privacidade; não criar framework multiesporte especulativo.

Connect deverá consumir contratos e serviços do backend, sem duplicar autorização, cálculo financeiro, prescrição ou regras críticas em React Native/Expo. A escolha técnica mobile permanece sujeita a confirmação no 029. Sem JWT web; eventual mecanismo de acesso mobile exige decisão futura própria, sem mudança implícita nesta documentação.

## Segurança e operação

Aplicar [controles permanentes](../seguranca/controles-e-operacao.md), [inventário de tratamento](../privacidade/inventario-e-retencao.md), [superfícies](../seguranca/superficies-e-endpoints.md) e [requisições](../seguranca/requisicoes-frontend.md). A existência de arquivos SQL não prova aplicação de migrations. Agendas de limpeza, grants/IAM, restore, homologações Stripe/R2/SMTP e eliminação integral continuam pendências; NO-GO mantido conforme [015](../engenharia/entrega-015.md).

Decisões 001–015 permanecem históricas e válidas nos respectivos escopos; a [ADR-016](ADR-016-especialidades-e-dominios.md) registra orientação documental, sem substituí-las. Sequência e dependências no [roadmap](../planejamento/roadmap.md).

## Estabilização016

A [ADR-017](ADR-017-eliminacao-e-recuperacao.md) pertence à entrega016 e preserva a ADR-016 estratégica: fila SQL de eliminação operacional por titular, ledger autenticado, worker limitado e grants separados sem infraestrutura externa nova. Health verifica histórico/checksums completos; diagnóstico é CLI privado por contagens. [Relatório016](../engenharia/entrega-016.md) distingue validação local de homologação externa e produção.

## Anamnese017

[ADR-018](ADR-018-anamneses-versionadas.md): formulários/versões, solicitações individuais, respostas e revisão isoladas por profissional. Cadastro novo reutiliza writer transacional008; capacidade pública não cria identidade global ou sessão. Pendência evita associação indevida; eliminação016 e replay tratam respostas por vínculo. [Contratos](../engenharia/api-anamneses.md) futuros consumidores018/029 não autorizam CRM/mobile/outros domínios.

## CRM018 implementado localmente

`src/server/crm` separa configuração/transação (`core`, `stages`), fatos canônicos agregados (`facts`), tarefas/auditoria (`tasks`) e transporte (`handlers`). `src/modules/crm` compartilha quadro, configuração, tarefas/histórico e diálogo entre `/crm` e perfil de aluno. Migration018 adiciona seis tabelas operacionais; não copia estados017/010/012 nem cria outra pessoa/conta/perfil. Writer008 insere vínculo CRM atomicamente quando inicializado;017 reutiliza esse writer. Worker016 trata eliminação e replay com os mesmos bloqueios prévios. Sem jobs, dependências ou integração externa novos. [ADR019](ADR-019-crm-operacional.md) e [módulo](../modulos/crm.md).Na conclusão018,019/020 ainda não existiam; a seção019 abaixo registra a evolução. NO-GO produtivo preservado.

## Serviços e consultorias019 — implementação local

Serviço, plano/revisão, contratação/revisão, obrigação e execução são entidades distintas em migration019. Domínio src/server/consultancies separa catálogo, acordos, execução/evidência, consultas e transporte. Reutiliza vínculo/guard/transação/lock existentes e o motor de condições018; não cria outro cadastro, Kanban, editor clínico ou BillingSaaS. Snapshots não contêm conteúdo clínico duplicado. Worker016 é ampliado com expurgo/replay do escopo administrativo e grants segregados.

[ADR020](ADR-020-servicos-e-consultorias.md), [módulo](../modulos/servicos-e-consultorias.md) e [fronteira financeira](../estrategia/diretrizes-financeiro-profissional.md).019 é IMPLEMENTADO LOCALMENTE; na conclusão019,020 tinha somente interfaces preparadas. A seção020 abaixo descreve o estado posterior. Não há novo provedor, dependência ou modalidade. NO-GO produtivo permanece.

## Financeiro profissional020

Domínio próprio finance_* separado de billing_* SaaS, consumindo contratação canônica019 sem duplicar serviço/plano. Obrigações/ciclos explícitos, recebimentos externos corrigíveis, intenções duráveis, conciliação e observação de repasses. [ADR021](ADR-021-financeiro-profissional-connect.md): Direct Charges recomendado sob condição; gateway de rede permanece bloqueado até decisões e homologação. Não foi criado recurso financeiro externo.

## Agenda021

Domínio canônico próprio de reservas, sem reaproveitar indevidamente o calendário de avaliações013. Reutiliza aluno008/CRM018/execução019, owner lock e infraestrutura de segurança. Oito tabelas021; referência explícita a obrigações, sem duplicar contratos/créditos ou criar receitas020. [ADR022](ADR-022-agenda-canonica.md) e [API/modelo](../engenharia/api-agenda.md). Calendários externos permanecem contratos documentais.

## Check-ins022

Catálogo e motor de formulários017 reutilizados com usage imutável; requests/submissions de check-in separados para não modificar fatos de anamnese/CRM/evidência019. Sete tabelas em migration023, após022 do Marco023. Prescrição histórica canônica, declarações/revisões append-only e eliminação016. [ADR024](ADR-024-checkins-e-finalidades.md), [contratos](../engenharia/api-checkins.md). FuturoConnect usa casos de uso existentes, sem conta aluno paralela ou worker externo.

## Central profissional024

[ADR-025](ADR-025-central-comunicacao.md): domínio de registros e modelos privado, contexto mínimo revalidado nas fontes, pendências do CRM e avisos projetados com recibos profissionais. Sem duplicar carteira, autenticação, tarefas ou dados sensíveis. SMTP continua transacional; mensageria autenticada/entrega externa somente contratos futuros. [Relatório](../engenharia/entrega-024.md).

## Inteligência025

Projeção empresarial privada sobre fontes008/018/019/020/021/022, sem persistência analítica ou fonte de verdade paralela. Reutiliza cálculos financeiros e ocupação com executor transacional opcional e snapshot read-only repeatable-read entre períodos. [ADR026](ADR-026-indicadores-canonicos.md), [semântica](../modulos/inteligencia-de-negocio.md), [relatório025](../engenharia/entrega-025.md). Sem novas dependências, serviços externos ou exportação indevida de documentos individuais.

## Importação026

Prévia/entrada temporária e estado de execução próprios, com writers008/009/010 e validação de referências023. Não é cadastro paralelo nem novo modelo de identidade. [ADR027](ADR-027-importacao-transacional.md), [formatos/política](../modulos/importacao.md), [relatório026](../engenharia/entrega-026.md). Migration025 segue numeração real; retenção/eliminação/replay016 e grants mínimos integrados. Sem adapter/API externa, scheduler de criação, ativação automática ou novo provedor.
