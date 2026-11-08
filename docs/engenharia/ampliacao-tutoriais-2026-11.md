# Ampliação editorial dos tutoriais — novembro/2026

FormFisik é empresa independente fundada por Brandon Louis. Escopo: ampliar a ajuda funcional existente, sem mudanças nas regras de negócio, dependências, banco ou serviços externos.

## Conteúdo e abordagem

Auditados AGENTS, módulos de alunos, treinos, exercícios, acompanhamento, agenda, anamneses, demonstrações, consultorias, check-ins, financeiro, CRM, comunicação, indicadores e Configurações. As descrições históricas foram confrontadas com refinamentos atuais: Agenda com modal/arraste, reordenação de perguntas e backend atual de Configurações. Tutorial explica funcionalidade e avisos; não afirma homologação externa nem disponibilidade de instalação em todo ambiente.

Mantidos16 artigos/categorias e slugs compartilháveis. Cada artigo passa de3 para8 etapas:128 etapas no total, antes48. Acrescentadas256 orientações (duas por etapa) cobrindo preparação, execução, conferência, edição, histórico e exceções. Busca inclui também orientações recolhidas, preservando normalização e ordenação existentes. Conteúdo editorial em TypeScript tipado, renderizado como texto escapado, sem HTML bruto ou importação de documentação interna/segredos.

Cada etapa mantém resumo visível e disclosure nativo “Ver orientações e cuidados”. O cabeçalho informa quantidade e uso dos detalhes. Reutiliza shell, índice com foco, relacionados, navegação por URL, temas e tokens; não cria scroll global ou tracking. Sem favoritos, métricas fictícias, envio automático, ativação de providers ou onboarding transacional. Orientações de recursos dependentes de serviços respeitam indisponibilidade e confirmação de salvamento.

## Manifesto funcional

- `src/modules/tutorials/content.ts`:8 etapas por artigo, orientações tipadas e indexação do conteúdo adicional.
- `src/modules/tutorials/area.tsx`: indicação de etapas e disclosures com nomes acessíveis contextualizados.
- `src/modules/tutorials/tutorials.module.css`: disclosure, foco/hover e listas de orientações responsivas.
- `tests/tutorials.test.ts`: consistência e pesquisa em orientações adicionais.
- `tests/tutorials-e2e.ts`: expectativas atualizadas ao conteúdo vigente, teclado nos detalhes, índice e Axe com orientações abertas; evidências em diretório separado do histórico original.
- `docs/modulos/tutoriais.md`, `docs/design/DESIGN_SYSTEM.md` e este relatório.

Preservados os arquivos e trabalhos preexistentes. Nenhuma migration, credencial, conta ou dado de negócio alterado. Nenhum deploy ou commit. Teste de navegador utiliza shell real em aplicativo temporário, sem backend de negócio; não comprova autorização ou disponibilidade externa de cada módulo descrito.

## Validação

Os resultados finais desta ampliação são registrados em `test-results/local/tutorials-expanded/verification.json`, com logs, capturas e manifestoSHA-256. A verificação limita-se ao conteúdo e à navegação da central; não substitui homologação de produção, uso com leitor de tela físico ou revisão profissional contínua dos artigos.

Resultados finais locais:4/4 testes de conteúdo/busca aprovados; TypeScript e ESLint dos arquivos alterados aprovados; build webpack real isolado aprovado (89 páginas).227 arquivos estáticos inspecionados sem canários sintéticos de segredo. Chrome/Axe aprovado nos temas claro/noturno e larguras1672/1440/768/320, com orientações abertas no artigo de Alunos; pesquisa em conteúdo adicional, URL/refresh, relacionados, categorias, índice com foco, teclaEnter no disclosure, texto200% e altura reduzida passaram. Nenhuma mutação de API ou pageerror no cenário final. Capturas desktop claro e mobile noturno inspecionadas. O harness foi atualizado para distinguir o texto repetido nas orientações e no rodapé, e acionar o disclosure de informações por teclado. Nenhum ensaio de banco necessário para o conteúdo editorial; nenhuma integração de negócio homologada por este teste.
