# Central de Tutoriais — relatório de entrega

06/11/2026. FormFisik independente fundada por Brandon Louis. Escopo: central escrita de documentação funcional; sem multimídia, CMS, serviços externos ou alteração de regras de negócio. GO local restrito à implementação validada; produção continua dependente dos gates existentes, inclusive NO-GO015.

## Auditoria e decisão técnica

Lidos AGENTS e documentação de frontend/Design System vigente. Conferidos guias Next instalados de page e navegação com histórico nativo. Auditados sidebar, shell, títulos, rotas e módulos funcionais. A referência visual foi aplicada à composição; categorias e contagens são reais e respeitam as16 áreas solicitadas, em vez de copiar os números ilustrativos da imagem.

Reutilizados ProfessionalShell, sidebar existente, sessão opaca do layout autenticado, tema, ícones lucide e rotas canônicas. Adição de Tutoriais em Sistema, ao lado de Indicadores; demais grupos preservados. Compactação segura de espaçamento em desktops altos para manter o item novo acessível; marca/logout e atalhos de conta permanecem fora do scroll da navegação. Sem scroll global novo.

Novo catálogo tipado centraliza conteúdo editorial e metadados, sem importar documentação técnica ou segredos. Isso dispensa uma dependência de MDX e mantém renderização escapada. Busca é função pura local sobre16 artigos; pesos e normalização testados. Artigo/categoria/busca identificados pela URL; consultas de busca não produzem chamadas por tecla. Estado de ausência é explícito.

## Implementação

-16 artigos publicados em16 categorias, listados em docs/modulos/tutoriais.md, com fontes funcionais revisadas.
- Artigo padrão de Alunos para a visão de referência; banner abre Primeiros passos.
- Índice lateral move/foca o passo correspondente no scroll do shell.
- Categorias em páginas de8, contagem real, lista contextual de categoria, relacionados, CTA do módulo e compartilhamento de URL.
- Busca em título/categoria/descrição/corpo, sem diferenciar acentos/caixa; limite120; vazio com orientação.
- Seção progressiva Sobre este tutorial apresenta finalidade, limites, atualização e relacionados.
- Nenhum progresso, favorito ou número de popularidade fictício.

## Manifesto

Novos: src/modules/tutorials/content.ts, area.tsx, tutorials.module.css; src/app/(app)/tutoriais/page.tsx; tests/tutorials.test.ts e tutorials-e2e.ts; documentação de módulo e este relatório.
Alterados: src/modules/professional/navigation.ts,shell.tsx,workspace.module.css; src/components/layout/sidebar.tsx; tests/dashboard.test.ts; package.json (comando de E2E); docs/design/DESIGN_SYSTEM.md; docs/README.md; docs/planejamento/roadmap.md; CHANGELOG.md. Preservadas as alterações anteriores de outros módulos.

## Verificação

Testes de consistência e busca:3/3 passaram (16 categorias/artigos únicos completos, rotas existentes, relacionados válidos, pesquisa textual/acentos/ranking e limites de funcionalidades).
Regressão dashboard/navegação/sessão/assinatura:9/9 passaram no banco descartável, sem migrations no banco de uso local.
Chrome/Axe: evidências em test-results/tutorials/browser-proof.json e PNGs para1672/1440/768/320, claro/escuro; busca por conteúdo, estado vazio, URL direta e refresh, categoria, relacionados, voltar, teclado do índice/sidebar, texto200% e altura reduzida. Nenhuma mutação ou erro de página.
ESLint e TypeScript passaram. Build real de produção webpack passou. Scan de 220 arquivos públicos sem os canários sintéticos de HMAC/SMTP. GO LOCAL CONTROLADO para a central escrita e navegação, sem homologação produtiva.

Limites: conteúdo editorial precisa acompanhar mudanças futuras; revisão humana contínua necessária. Não homologa provedor externo, leitor de tela físico, dispositivos reais ou produção. Nenhuma credencial, serviço externo, deploy, commit ou migration persistente. Sem rotas administrativas, dados privados de aluno ou conteúdo técnico secreto no catálogo.
