# Documentação oficial da FormFisik

Referência da consolidação: 01/11/2026. A empresa é independente, fundada por Brandon Louis; não se presume constituição jurídica formalizada. Personal 1.0 é a primeira especialidade operacional alvo, não todo o ecossistema futuro.

| Assunto / fonte canônica | Uso |
| --- | --- |
| [Diretriz institucional](institucional/diretriz-institucional.md) | Identidade, missão, visão, valores, posicionamento e independência |
| [Ecossistema e especialidades](estrategia/ecossistema-e-especialidades.md) | Estratégia empresarial, futuro multiesporte e reutilização |
| [Modelo de negócio](estrategia/modelo-de-negocio.md) | Oferta Pro, Billing SaaS versus profissional e preferência Connect |
| [Personal 1.0](produto/personal-1.0.md) | Escopo de produto, matriz de aceite e homologação |
| [Inventário funcional](produto/inventario-funcional.md) | Estado real, evidências, limites e dependências dos módulos |
| [Roadmap](planejamento/roadmap.md) | Marcos 015–030 e histórico das entregas |
| [Arquitetura atual e evolução](arquitetura/visao-atual-e-evolucao.md) | Código atual, identidade, dados e fronteiras futuras |
| [ADR-016](arquitetura/ADR-016-especialidades-e-dominios.md) | Decisões desta consolidação; preserva ADRs 001–015 |
| [Política de desenvolvimento](engenharia/politica-de-desenvolvimento.md) | Entregas completas, verificação e documentação |
| [Design System](design/DESIGN_SYSTEM.md) e [PDFs](design/PADROES_PDF_TREINOS.md) | Interface, shell, acessibilidade e documentos |
| [Segurança e operação](seguranca/controles-e-operacao.md) | Controles permanentes e bloqueios operacionais |
| [Tratamento e retenção](privacidade/inventario-e-retencao.md) e [direitos](privacidade/direitos-e-minutas.md) | Finalidades, acesso, propostas e lacunas de privacidade |
| [Ambientes](operacao/ambientes.md), [Stripe](operacao/stripe-local.md) e [R2](operacao/fotografias-r2.md) | Preparação e homologação externas, sem autorização implícita |
| [Estabilização016](engenharia/entrega-016.md) e [operação](operacao/estabilizacao-016.md) | Migrations, eliminação delimitada, recuperação e integrações locais; sem produção |
| [Anamneses017](modulos/anamneses.md), [contratos](engenharia/api-anamneses.md) e [relatório](engenharia/entrega-017.md) | Cadastro por convite, formulários versionados, respostas/revisão; somente local |
| [CRM018](modulos/crm.md), [API](engenharia/api-crm.md) e [relatório](engenharia/entrega-018.md) | Kanban, regras, tarefas e ciclo operacional; somente local |
| [Serviços/consultorias019](modulos/servicos-e-consultorias.md), [API](engenharia/api-consultorias.md) e [relatório](engenharia/entrega-019.md) | Catálogo, acordos administrativos, obrigações/execuções e base futura020, somente local |
| [Financeiro020](modulos/financeiro-profissional.md), [API](engenharia/api-financeiro-profissional.md), [ADR](arquitetura/ADR-021-financeiro-profissional-connect.md), [operação](operacao/financeiro-profissional.md) e [relatório](engenharia/entrega-020.md) | Financeiro profissional local/controlado; Stripe externo e produção bloqueados |
| [Agenda021](modulos/agenda-profissional.md), [API/modelo](engenharia/api-agenda.md), [ADR022](arquitetura/ADR-022-agenda-canonica.md), [calendários futuros](operacao/calendarios-externos.md) e [relatório](engenharia/entrega-021.md) | Disponibilidade, recorrência, comparecimento e execução019 explícita; validação local, sem sincronização externa |
| [Relatório desta auditoria](engenharia/auditoria-documental-personal-1.0.md) | Método, divergências, riscos e preservação |


## Como interpretar as fontes

Modelo comercial define oferta; produto define resultado; roadmap define sequência; inventário confronta implementação; módulos e APIs detalham contratos; ADRs registram decisões; relatórios de entrega são históricos e limitados ao ambiente testado. Um documento não transforma recurso futuro em implementação. Divergência exige inspeção do código e registro de resolução, sem apagar histórico válido.

O [relatório final015](engenharia/entrega-015.md) registra auditoria técnica local concluída,210 testes e NO-GO para produção/dados reais. A consolidação documental anterior não havia observado esse fechamento; seus resultados históricos foram preservados. A [entrega016](engenharia/entrega-016.md) registra separadamente estabilização, evidências novas e bloqueios residuais. Consulte as definições de estado no inventário; HOMOLOGADO depende de evidência específica do ambiente alvo.

Os documentos técnicos existentes em `modulos/`, `engenharia/`, `arquitetura/`, `operacao/`, `privacidade/`, `seguranca/`, `catalogo/` e `design/` foram mantidos; o inventário liga cada módulo às suas fontes e os relatórios 001–015 permanecem no histórico do roadmap. Nenhuma referência documental autoriza migration, integração, alteração de credencial ou deploy.

## Demonstrações023

[Vídeos e demonstrações](modulos/demonstracoes.md) · [API/modelo](engenharia/api-demonstracoes.md) · [ADR023](arquitetura/ADR-023-demonstracoes-versionadas.md) · [operaçãoStream](operacao/demonstracoes-stream.md) · [privacidade](privacidade/demonstracoes.md) · [relatório023](engenharia/entrega-023.md). Fontes aprovadas: oficialFormFisik, upload privado eYouTube; homologação externa/produção permanecem separadas.

## Check-ins022

[Módulo](modulos/checkins.md) · [API/modelo](engenharia/api-checkins.md) · [ADR024](arquitetura/ADR-024-checkins-e-finalidades.md) · [privacidade](privacidade/checkins.md) · [relatório](engenharia/entrega-022.md). Motor017 reutilizado com finalidade distinta; ciclos/feedback/revisão e links individuais, sem aplicativo ou notificação externa.

## Comunicação024

[Central profissional](modulos/comunicacao.md) · [API/modelo e contratos futuros](engenharia/api-comunicacao.md) · [ADR-025](arquitetura/ADR-025-central-comunicacao.md) · [privacidade](privacidade/comunicacao.md) · [operação](operacao/comunicacao.md) · [relatório](engenharia/entrega-024.md). Registros operacionais, modelos e avisos internos; sem canal externo ou identidade de aluno ativa.

## Inteligência025

[Indicadores e semântica](modulos/inteligencia-de-negocio.md) · [API](engenharia/api-inteligencia.md) · [ADR026](arquitetura/ADR-026-indicadores-canonicos.md) · [relatório025](engenharia/entrega-025.md). GO local controlado, produção NO-GO; sem conversão comercial ou receita presumida.

## Importação026

[Formatos/política](modulos/importacao.md) · [API](engenharia/api-importacao.md) · [ADR027](arquitetura/ADR-027-importacao-transacional.md) · [operação/privacidade](operacao/importacao.md) · [relatório026](engenharia/entrega-026.md). Alunos/exercícios CSV e modelos JSON nativos, com validação e confirmação; GO local controlado, sem adapters externos ou produção autorizada.

Tutoriais funcionais para usuários: [módulo e manutenção editorial](modulos/tutoriais.md); [relatório da central](engenharia/central-tutoriais-2026-11.md). O catálogo público ao usuário é uma curadoria separada dos documentos técnicos internos.

Configurações funcionais: [módulo, pesquisa e contratos](modulos/configuracoes.md) · [validação novembro2026](engenharia/configuracoes-funcionais-2026-11.md). Substitui o estado de prévia local descrito no relatório histórico da interface, sem alterar gates de produção.

Experiência compartilhada: [toasts, erros amigáveis e confirmações](engenharia/feedback-e-confirmacoes-2026-11.md), incluindo limites de navegação ao fechar/recarregar a aba.

- [Landing e identidade performance/lifestyle — implementação e evidências locais](engenharia/redesign-landing-2026-11.md).
- [Assets e prompts da landing de campanha](design/landing-assets-2026-11.md).
- [Website público — pesquisa, navegação, prévia interativa e validação](engenharia/website-publico-2026-11.md).

- [Assinaturas Standard/Premium/Pro — catálogo, backend e homologação local](engenharia/assinaturas-multiplanos-2026-11.md).

Refinamento de navegação e Exercícios: [diagnóstico, decisões e evidências locais](engenharia/navegacao-e-exercicios-2026-11.md).
