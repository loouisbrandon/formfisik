# Store — listagens por departamento

14/11/2026. FormFisik é empresa independente fundada por Brandon Louis. Entrega frontend autorizada:três listagensRoupas,Acessórios,Suplementação,com identidade daStore e componentes compartilhados. Não há operação de e-commerce,depêndencia nova,credencial,migration persistente,commit ou deploy.

## Implementação

Uma rota dinâmica aceita somente três departamentos. `CatalogArea` recebe configuração tipada; filtroOversized/Compressão permanece emRoupas. Bonés,straps,garrafas,bolsas,toalhas,munhequeiras são tipos deAcessórios. Suplementação tem acento visual próprio e estado editorial vazio:produtos e fórmulas ainda não foram fornecidos. Não são inventadosSKU/preço/estoque/valores nutricionais.

`StoreShell` concentra navbar/footer/campanha e é usado pelahome e pelas três listagens. `StoreProductCard` e`StorePlaceholder` são extraídos da vitrine existente e reutilizados. Home mantém15 espaços de mídia; cards de categorias agora têm links verdadeiros. Navbar/footer abrem os departamentos;Coleções retorna ao índice daStore. Sem alteração dos padrões de autenticação ou assinaturaSaaS.

Catálogo tipado reaproveita8 prévias já anunciadas (2 roupas/6 acessórios). Filtros e busca apenas locais no pequeno corpus editorial, com query100 caracteres, normalização sem acentos e correspondência de todos os termos. Ordenação por sequência da coleção ou nomeA–Z/Z–A. Filtros porURL via histórico nativo sem requisição por tecla; atualizações usam aURL mais recente para evitar perder escolhas feitas rapidamente. Paginação de8 já é limitada ao corpus; sem simulação de milhares de itens ou alegação de infraestrutura de catálogo produtivo. Página inválida é normalizada pelaUI,departamento desconhecido404.

## Interface

Breadcrumb,hero editorial com placeholder,departamentos,filtrosporradio emfieldset,busca,ordenação,contador anunciado egrid.3 colunas desktop/2 tablet/mobile; filtro édetails nativo recolhível,sem modal adicional. Estado vazio recuperável emRoupa/Acessórios e preparação transparente emSuplementação. Botões de compra,favorito/conta e newsletter continuam indisponíveis conforme etapa anterior. Filtros de preço,tamanho,cor e composição não aparecem sem dados aprovados.

## Manifesto

- Novos: `src/modules/store/{catalog.ts,catalog-area.tsx,catalog.module.css,components.tsx,shell.tsx}`, `src/app/store/[department]/page.tsx`, `tests/store-catalog.test.ts`, `tests/store-catalog-e2e.ts`, este relatório.
- Alterados: `src/modules/store/{landing.tsx,content.ts,store.module.css}`, documentaçãoStore,DesignSystem e roadmap.

Outros trabalhos do checkout foram preservados. Não há leitura de dados pessoais/banco nas listagens; todos os dados são editoriais públicos. Nenhuma biblioteca nova.

## Validação e limites

Três testes puros de departamentos,identidade/filtros/busca/ordenação e destinos das categorias passaram. Evidências finais deChrome/Axe,TypeScript,ESLint ebuild em`test-results/local/store-catalog/verification.json`. Chrome usa aplicativo temporário comshell real,sem banco/provedor; não homologa pagamentos,estoque ou acessibilidade com leitor de tela físico. O cenário integrado inclui troca rápida de busca/ordem/tipo,reload,links diretos,sem resultados,filtros inválidos e texto200%. Capturas desktop/mobile são revisadas antes do fechamento.

Resultados finais:3/3 testes puros,TypeScript,ESLint dos arquivos alterados ebuildwebpack isolado aprovados. Chrome/Axe nas5 rotas em1440/768/320, filtros combinados, busca sem acentos, nomeZ–A,refresh,seleção porcard,estado vazio,filtro inválido,texto200% eEscape no menu aprovados. Nenhum pageerror ou mutação capturado no cenário final.298 arquivos públicos sem canários sintéticos de segredo. A primeira rodada detectou composição obsoleta de filtros rápidos: corrigida pela leitura daURL mais recente. Uma rodada intermediária apresentou recargaHMR com erro de inicialização doNext; harness passou a pré-compilar todas as rotas antes da navegação,sem ignorar errosJS. Rodada final sem erros. Aviso compartilhado de metadataBase ausente continua pendente de domínio público,sem deploy.
