# FormFisik Store — vitrine de lançamento

FormFisik é empresa independente fundada por Brandon Louis. Rota pública `/store`, implementada como frontend editorial, sem operação de comércio eletrônico ativada.

## Composição e reaproveitamento

Referência visual fornecida pelo fundador: hero, quatro categorias, quatro produtos em destaque, banner de identidade, quatro itens de kit, banner de mentalidade, chamada para novidades e rodapé. Badge STORE compacto magenta/branco ao lado da marca oficial, seguindo o exemplo HUB. Logo original preservada, sem recoloração. FontesExo2, marca e Header compartilhados com a landing principal; props opcionais mantêm o comportamento padrão da rota`/`. Estilos próprios da Store emCSSModule não alteram os tokens da área profissional.

15 áreas de mídia marcadasEm breve:1 hero+4 categorias+4 produtos+2 banners+4 itens de kit. Títulos eCTAs ficam emHTML, separados das imagens futuras. `content.ts` concentra nomes e categorias; `Placeholder` é compartilhado entre mídias, `Products` entre vitrines. Quando os arquivos forem fornecidos, substituir cada placeholder por imagem local otimizada mantendo a proporção do slot e o texto alternativo. Cards de categoria usam proporção aproximada1:1; produto1.4:1; kit2:1; campanhas possuem recorte responsivo próprio. Preparar versões desktop/mobile para campanhas sem incorporar textos na arte.

## Comportamento e limites

Navegação por âncoras reais, link institucional para a landing original e menu mobile comEscape/foco. Busca, conta da loja, favoritos, sacola e inscrição aparecem indisponíveis, identificadosEm breve. Não há preços aprovados, estoque, pedidos, checkout, captação de e-mail, cookies comerciais, chamadas de pagamento ou reaproveitamento da identidade/SaaS como conta de comprador. Produtos são prévia, sem comprovação de popularidade ou vendas. Frete grátis/compra segura/entrega nacional da referência não foram publicados como condições aprovadas.

Desktop4 colunas, mobile2, sem rolagem horizontal externa. Placeholders são informativos e não acionáveis; nenhum botão de compra finge sucesso. Documentação de política, atendimento e condições comerciais da loja depende de uma entrega futura. Nenhum serviço externo, dependência, migration ou deploy.

## Arquivos

`src/app/store/page.tsx`; `src/modules/store/{landing.tsx,content.ts,store.module.css}`; elementos compartilhados`src/modules/marketing/{brand.tsx,campaign-font.ts}`, ajustes mínimos em`landing.tsx`,`landing.module.css` e`src/components/layout/header.tsx`; teste`tests/store-e2e.ts`. Evidências em`test-results/local/store`.

## Validação local

Chrome/Axe passou em`/store` e`/` nas larguras1440/768/320, incluindo menu mobile/Escape,15 placeholders, ausência de mutações e errosJS. Capturas desktop/mobile inspecionadas. Ajustados contraste branco/magenta, quebra de títulos mobile e ocultação do skip link antes do foco. TypeScript,ESLint dos arquivos alterados e buildwebpack isolado passaram. Scan de298 arquivos públicos sem canário sintético de segredo. Aviso compartilhado de metadataBase ausente permanece para configuração do domínio antes de publicação; nenhum deploy realizado. Evidências em`test-results/local/store/verification.json`,capturas e logs. Não houve homologação de funcionalidades comerciais.

A landing principal passa a apresentar Store em vez de Wear nos textos e metadados. Navbar, chamada da hero, atalho do ecossistema, CTA da seção e rodapé direcionam para`/store`. A seção de coleção e seus assets atuais são preservados; nomes internos deCSS/arquivos não precisam ser renomeados. FAQ distingue vitrine disponível de vendas ainda não abertas.

Validação do redirecionamentoWear→Store:Chrome/Axe nas duas rotas em1440/768/320 passou; links da navbar/hero/seção para/store e ausência de links#wear conferidos. TypeScript eESLint passaram. Build não repetido nesta alteração restrita a texto/links.

## Escala visual ampliada

Por solicitação do fundador, hero, vitrines, banners, kit, CTA e footer recebem maior área útil, altura e tipografia aproximada da landing principal. Conteúdo de vitrines limitado a1920px com recuos fluidos, hero até1800px, títulos e textos maiores, cards com espaçamento ampliado. Mobile mantém2 colunas, títulos com quebra e conteúdo legível; não aplica um zoom global. Estrutura,15 placeholders,links e estado comercial preservados. Validação desta revisão registrada em`test-results/local/store/scale-verification.json`.

## Listagens por departamento

Três destinos públicos compartilham uma única implementação: `/store/roupas`, `/store/acessorios` e `/store/suplementacao`. `app/store/[department]/page.tsx` aceita somente esses departamentos e retorna404 para outros. Oversized/compressão são filtros `?tipo=oversized|compressao` em Roupas, não páginas próprias. Acessórios usa tipos bonés,straps,garrafas,bolsas,toalhas,munhequeiras. Suplementação possui identidade de campanha própria e estado de coleção em preparação, sem produtos/fórmulas fictícios.

`StoreShell` centraliza navbar/footer/fontes e é reutilizado pela home e listagens. `StorePlaceholder` e `StoreProductCard` são os mesmos nas vitrines e resultados. Categorias na home passam a ser links para o departamento/filtro real. Não há três cópias de tela ou novo cadastro comercial. A navbar principal da plataforma permanece intacta.

Catálogo editorial reaproveita8 prévias já existentes (2 roupas,6 acessórios), sem inventário/preço/estoque/tamanhos/cores/composição nutricional. Busca `q` até100 caracteres, normalizada sem acentos; tipo único por departamento e ordenação `ordem=collection|name_asc|name_desc`. Estado de filtros porURL, atualização por histórico nativo semAPI por tecla, preservação emrefresh e limite8 cards por página (`pagina` positiva, limitada ao total). Filtro/tipo inválido é ignorado pelaUI; página inválida retorna à primeira. Mensagem vazia distingue ausência de correspondência de coleção ainda não anunciada. Nenhuma coleta privada, tracking ou compra simulada. Trata-se de prévia editorial pequena local, não infraestrutura de catálogo/estoque produtivo: crescimento exige paginação/busca no servidor e contrato comercial antes de conectar produtos reais.

Desktop com filtros laterais e resultados3 colunas; tablet2; mobile filtros recolhíveis no fluxo e cards2 colunas, sem drawer duplicado nem rolagem global adicional. Índice de resultados é anunciado porrole=status. ProdutosEm breve não são botões de compra. Preço/tamanho/cor não recebem filtros fictícios. Evidências desta entrega em`test-results/local/store-catalog`.

## Imagem da hero —14/11/2026

Imagem fornecida pelo fundador em`Downloads/Dupla FormFisIK no Neon Rosa.png`,copiada sem edição para`public/images/store/hero-neon-duo.png` (1916×821;SHA-256c0563ffc1b01cf51205e6c52ce210d3f678681c20347fe05fc3b01d12c36fa04). `next/image` com dimensões explícitas e prioridade; largura visual limitada a1916px,nunca ampliada além da original e reduzida proporcionalmente quando necessário. Imagem inteira semobject-fit:cover/estiramento. MáscarasCSS horizontais/verticais suavizam bordas; overlay escuro à esquerda preserva leitura. Não háblur nem modificação de rosto,modelo,estampa ou arquivo original. No mobile,foto fica abaixo do conteúdo,com proporção integral e fusão das bordas. Uso decorativo comalt vazio;textos permanecemHTML. Agora14 mídias continuamEm breve e1 possui imagem real. Evidências específicas em`test-results/local/store-hero`.


Store — refinamento da hero: altura desktop reduzida para440–720px, fotografia preenchendo a altura sem máscara vertical e deslocada3% à direita. Máscara apenas nas laterais, sobre fundo radial vinho/rosa escuro inspirado no neon. Proporção preservada; mobile mantém foto integral no fluxo.


Store — tipografia da hero: título condensado em Bebas Neue já carregada no layout, peso visual forte e inclinação CSS de9graus; frase integral branca e risco magenta irregular com clip-path sob MENTALIDADE. Subtítulo Montserrat semibold itálico. Texto continua HTML selecionável/acessível, sem imagem de texto ou nova dependência. Botões mantêm o padrão existente.


Store — imagens das vitrines: quatro categorias e três produtos utilizam assets fornecidos pelo fundador em next/image, compartilhados com as listagens. Categorias usam cover com contraste inferior reforçado; produtos usam contain para preservar a peça. Sete placeholders permanecem (straps, quatro itens do kit e dois banners). Foto da camiseta branca não substitui o produto Black; reservada até definição editorial. Arte de suplementos é conceitual, sem confirmar fórmula, benefício ou disponibilidade comercial.

Validação local das mídias: Chrome com carregamento/decodificação das8 imagens,5 larguras (320,768,1440,1916,2560), Axe sem violações e nenhuma mutação de dados; regressão das3 listagens com filtros,busca e ordenação aprovada. TypeScript e ESLint aprovados. Manifesto dos6 arquivos copiados com SHA-256 e capturas em `test-results/local/store-media`; regressão de listagens em `test-results/local/store-catalog`. Não foi executado novo build de produção nesta troca de assets.


Store — vitrine Mais desejados com5 colunas desktop,3 tablet e2 mobile. Quinta prévia Compression FK Black reutiliza a imagem existente. Fotografias de produto usam dimensões naturais, largura100% e altura automática: sem faixas laterais nem recorte; alturas variam conforme a proporção original. Categoria Oversized recebe camiseta branca; produto Black preserva sua fotografia. Catálogo compartilhado passa a9 prévias (3 roupas,6 acessórios).

Validação do ajuste para5 cards: Chrome/Axe em5 larguras e regressão das listagens aprovados, carregamento das9 imagens confirmado, TypeScript/ESLint e testes do catálogo aprovados. Evidências atualizadas em `test-results/local/store-media` e `test-results/local/store-catalog`. Nenhum build/deploy nesta revisão visual.


Store — padronização final de Mais desejados: cinco cards de mesma altura por linha, mídia quadrada (referência do menor card anterior), object-fit:cover e foco vertical30%; placeholder também quadrado. Informações com altura mínima100px e expansão uniforme para nomes com quebra. Recorte proporcional das fotos verticais aceito nesta revisão; sem faixas laterais. Regra limitada à vitrine, sem mudar imagens das categorias ou listagens.


Store — hover da landing: categorias e cards das vitrines ampliam1,025×, com sombra suave e foto1,04× dentro da mídia recortada. Transform não altera o grid; foco por teclado nas categorias recebe o mesmo destaque. Hover limitado a ponteiro fino; movimento reduzido desativa zoom e transição. Cards de produto continuam prévias, sem simular ação de compra.


Straps de Treino recebe foto fornecida pelo fundador (`straps-neon.png`), compartilhada entre landing e listagem de acessórios. Preserva área quadrada da vitrine e hover; texto alternativo descritivo. Restam6 placeholders (kit e banners). Origem e SHA-256 no manifesto de mídias.


Store — primeiro banner com foto do casal fornecida pelo fundador em next/image. Desktop preserva proporção de campanha3:1, chamada à direita e gradiente escuro para contraste. Mobile exibe foto integral antes do texto para manter os dois modelos visíveis e leitura. Mídia decorativa; frase permanece HTML. Cinco placeholders restantes (kit e segundo banner). Origem e hash no manifesto de mídias.


Store — primeiro banner refinado: altura280–480px, imagem proporcional em contain, sem zoom/recorte, deslocada3% à esquerda e transição para fundo preto à direita. Título em Bebas Neue com inclinação9graus, ambas as linhas brancas; risco magenta irregular mais espesso sob É IDENTIDADE. Mobile conserva foto integral e texto no fluxo.


Store — quatro fotos do kit fornecidas pelo fundador: bolsa,toalha,garrafa,munhequeira. Componentes compartilhados com acessórios; dimensões intrínsecas, largura100% e altura automática, sem recorte/estiramento. Cards acompanham a foto e alinham base das informações com flex. Hover mantém zoom do card, mas desativa zoom interno da imagem no kit para preservar todas as bordas. Apenas o segundo banner continua com placeholder. Assets e SHA-256 no manifesto.


Store — segundo banner com arte zumbi fornecida pelo fundador, integral em contain, limitada à dimensão original e posicionada à esquerda. Fundo preto/rosa escuro e transição gradual da borda direita. Reutiliza tipografia Bebas Neue inclinada e risco irregular do primeiro banner; segunda linha e risco verde-lima. Desktop com texto à direita; mobile empilha foto integral e chamada. Todas as16 mídias da landing agora têm imagens; sem placeholders. Estado comercial permanece lançamento em breve.


Store — correção da fusão do segundo banner: máscara aplicada à caixa real da imagem proporcional, e não ao espaço vazio de contain, com fade amplo45–100% até fundo uniforme#080608. Frase completa em uma linha, sem br explícito, tipografia fluida e risco verde; mobile reduz texto para preservar a linha sem overflow.


Store — frase do segundo banner ampliada para38–100px (4,8vw), ocupando57% da largura e começando junto à transição da imagem. Uma linha desktop; escala mobile preservada para evitar overflow.


Store — footer reutiliza badgeSTORE do header junto à logo, com link para/store. Faixa Entre para o movimento compacta: conteúdo centralizado,14px de padding vertical desktop, título22–32px em linha e texto auxiliar12px; botão40px. Mobile reorganiza com espaçamento8px, mantendo leitura e sem coleta ativa.


Store — logo da navbar retorna para/store em todo StoreShell, incluindo listagens. Header compartilhado aceita homeHref/homeLabel opcionais; landing institucional conserva destino padrão/. Footer já retorna à home da loja.


Roupas — grid preparado para5 cards lado a lado acima de1100px,3 tablet e2 mobile; espaçamento14px e tipografia14px dos nomes. Reutiliza cards e fotos sem recorte, sem adicionar produtos fictícios: há3 prévias cadastradas atualmente. Outros departamentos preservam seu grid.

## Detalhe compartilhado de produto

IMPLEMENTADO localmente: `/store/produto/[slug]` resolve exclusivamente IDs das prévias do catálogo existente, com404 para desconhecidos. `getStoreProduct` centraliza descrição editorial, galeria, moedaBRL, preço nulo e estado coming_soon. Não duplica cadastro, inventário ou regras comerciais. Todos os cards de vitrines e listagens possuem link semântico para o detalhe; foco visível, hover com elevação e movimento reduzido respeitado. Header/footer reutilizam StoreShell.

Galeria reutilizável permite alternar todas as imagens associadas; atualmente cada produto tem somente uma imagem correspondente, sem usar foto de outro produto como variante. Layout de detalhe reutilizado por roupas e acessórios: título, descrição, seção de opções, preço, entrega/trocas e avaliações. Preço, tamanhos, materiais, frete e avaliações não cadastrados aparecem explicitamente em preparação. Compra desativada; não há checkout, cálculo de CEP, publicação de comentários, cobrança ou API comercial simulada. Sem coleta de dados pessoais. Conteúdo editorial público estático, nenhum acesso a banco ou credenciais. Expansão comercial exige contratos e backend próprios antes de ativar operações.

Validações específicas: `tests/store-detail-e2e.ts`; capturas em `test-results/local/store-detail`. Build de produção não executado nesta entrega.

Galeria do detalhe: foto principal reduzida para92% da coluna (máximo620px). Múltiplas fotos exibem miniaturas selecionáveis abaixo. Clique abre dialog nativo modal com foco contido, retorno ao acionador e Escape; navegação anterior/próxima quando houver múltiplas imagens. Imagem inteira em contain; hover amplia1,8× acompanhando o ponteiro, toque/clique alterna zoom, redução de movimento elimina a transição. Sem dependências ou imagens adicionais fictícias.

## Interações locais — curtidas, busca e sacola

IMPLEMENTADO localmente: coração no card/detalhe alterna curtida; navbar abre dialog nativo com lista de miniaturas e link para detalhes. Contador e estado sincronizam na página e entre abas pelo evento storage. Busca expansível no cabeçalho, até100 caracteres e5 resultados por nome, sem rede por tecla; mobile abre painel ancorado abaixo do cabeçalho. Escape fecha busca/dialog. `/store/carrinho` reutiliza shell, lista seleções, remoção, resumo sem valores fictícios e checkout indisponível. Detalhe oferece salvar/remover da sacola, sem reserva nem compra.

Persistência exclusivamente neste navegador: localStorage `formfisik.store.likes.v1`/`formfisik.store.bag.v1`, somente IDs públicos conhecidos, deduplicados, limite50, JSON inválido ignorado. Nenhum dado pessoal, preço, credencial ou autorização armazenado. Falha de escrita mostra aviso e não altera o estado. Sem conta de comprador, sincronização em nuvem ou backend comercial. Preferências continuam após reload e podem ser removidas pelo usuário ou limpeza do navegador; não são associadas à conta profissional. Conta da loja continua fora do escopo; sem login fictício. Carrinho nesta fase é uma seleção de prévias, não pedido ou reserva. Antes de comércio real: preços/variantes/estoque/frete no servidor, validade da seleção e checkout autorizado.

Teste de fluxo: `tests/store-shopping-e2e.ts`; evidências em `test-results/local/store-shopping`. Sem build/deploy/financeiro nesta entrega.

Validação local: fluxo de curtidas/busca/sacola no Chrome aprovado, persistência após reload e remoção confirmadas, Axe sem violações no carrinho em1440/768/320px. TypeScript/ESLint e teste de validação do armazenamento aprovados. Evidências: `test-results/local/store-shopping`; manifestoSHA-256 dos arquivos desta revisão. Sem homologação comercial externa.


Store — painel de curtidas ancorado ao retângulo real do coração,12px abaixo, com ponta ligada ao centro do ícone e limites16px da viewport; reposiciona em resize/scroll. Lista interna rolável mantém ponta visível. Entrada suave180ms; busca expande da direita220ms. Movimento reduzido desativa animações.

## Checkout de demonstração controlada

IMPLEMENTADO como prévia interativa, NÃO IMPLEMENTADO como comércio/autenticação real: `/store/checkout` (noindex) exibe identificação antes da etapa de pagamento. Alterna entrar/criar conta com identidade fixa `cliente@example.com`; não recebe senha, não cria sessão nem conta, não reutiliza a sessão profissional. Google/Apple desativados e identificados como pendentes. Estado demonstrativo somente em memória; reload retorna à identificação. Não é barreira de autorização ou evidência de OAuth homologado.

Sacola oferece campoCEP com validação sintática8 dígitos. Cotação de teste fixaR$19,90/5–8 dias, explicitamente fictícia, sem consulta de existência/transportadora. Checkout apresenta preço ilustrativoR$149,90 por prévia para permitir visualizar resumo, frete e total; nenhum preço real é gravado no catálogo. Endereço fictício fixo, Pix/cartão como opções de visualização sem chave, QR, dados de cartão ou transação. Concluir demonstração não registra pedido, não limpa sacola, não reserva estoque e não cobra. CEP permanece apenas no estado do componente, sem armazenamento, logs ou envio.

Pendências produtivas: identidade de comprador com autenticação/autorização no servidor e recuperação, OAuthGoogle/Apple com credenciais e redirecionamentos autorizados, variantes/preços/estoque válidos no servidor, cotação e endereço reais, consentimentos/políticas, provedor de pagamento seguro, idempotência/webhooks e homologação. Não confundir BillingSaaS, Billing profissional e comércioStore. A demonstração está publicamente acessível como prévia sem checkout real; produção exige aprovação específica.

Teste `tests/store-checkout-e2e.ts` verificaCEP inválido/válido, entrada de demonstração, cadastro ilustrativo, pagamento sem dados financeiros, conclusão, reload, ausência de mutações de rede e Axe/responsividade. Evidências em`test-results/local/store-checkout`.

Validação do checkout demonstrativo: Chrome/Axe aprovados em1440/768/320px nas etapas de entrada e pagamento, validaçãoCEP e conclusão/reload aprovados; zero requisições mutáveis. TypeScript e ESLint aprovados nesta execução. Build/deploy não executados. Não comprova autenticação, transporte ou pagamento real.


Store — refinamento do login de checkout: painel claro com filete magenta e símbolo de acesso, tabs em superfície neutra, Google com símbolo multicolorido e Apple monocromático sobre preto, botões48px. Separador de e-mail com linha, campo com ícone, hierarquia de título e rótulo editorial. Mantém aviso demonstrativo e provedores desativados; não altera autenticação. Sem dependência ou requisição externa para íconesSVG.


Store — conclusão do checkout demonstrativo: ações separadas em botões com espaçamento e banner de agradecimento abaixo do comprovante de simulação, antes do footer. Campanha300px, fonteBebasNeue inclinada, risco magenta e CTAContinuar explorando. Slot editorial à esquerda com placeholderImagem em breve, fundo preto/rosa e máscara lateral; preparado para imagem futura fornecida pelo fundador. Não apresenta confirmação de compra real nem novo asset fictício. Mobile integra o placeholder ao fundo mantendo texto legível.


Store — banner de agradecimento recebe Energia Atlética em Neon fornecida pelo fundador,2172×724, sem edição. Imagem integral em contain, fundo escuro e máscara lateral para fusão; mobile mantém arte3:1 acima do texto. Substitui placeholder, conserva fraseHTML e CTA.
