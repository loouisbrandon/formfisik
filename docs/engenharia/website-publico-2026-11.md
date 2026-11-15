# Website público FormFisik — navegação, conteúdo e apresentação

Data: 06/11/2026. Estado: IMPLEMENTADO e validado localmente para o website público. A FormFisik é uma empresa independente fundada por Brandon Louis.

## Objetivo e diagnóstico

Evoluir o website existente para uso real de navegação e descoberta. O pedido atual substitui a busca anterior por reprodução da imagem: o usuário passou a fornecer imagens específicas durante a execução. A implementação anterior dependia de janelas recortadas de uma imagem para apresentar dispositivos, vestuário, Studio e manifesto. Esse material tornava textos pouco legíveis e não oferecia interação com a prévia do produto. Não havia área de dúvidas frequentes; as diferentes ofertas disputavam a mesma hierarquia.

A solução preserva os eixos plataforma/Wear/profissionais/Studio/marca e suas rotas canônicas, mas organiza a leitura em seções próprias. Nenhuma operação de loja, reserva ou cobrança nova foi autorizada ou implementada.

## Pesquisa aplicada

Consulta a fontes oficiais em 06/11/2026. São referências de navegação e organização de conteúdo, sem copiar ativos, slogans ou condições comerciais:

- [Gymshark](https://www.gymshark.com/): navegação por categorias e coleções. Aplicação: três linhas Wear com identificação e descrição acessível, sem produtos/preços fictícios.
- [Smart Fit](https://www.smartfit.com.br/): caminhos diretos para academias/planos, benefícios por área e exploração do aplicativo por tema. Aplicação: CTAs com destino explícito, etapa do Studio e prévia com abas.
- [Tecnofit](https://www.tecnofit.com.br/): apresentação das ferramentas por tarefas do negócio. Aplicação: alunos, prescrição e agenda explicados no contexto do trabalho do personal.

A leitura das referências não comprova disponibilidade de funcionalidades FormFisik. Oferta, inventário funcional, estratégia Personal1.0 e código local determinam o conteúdo.

## Arquitetura e reutilização

- `src/modules/marketing/landing.tsx`: conteúdo público renderizado no servidor, usando `proPlan`/`proPrice` e a fonte Exo2 já instalada via next/font; nenhuma nova dependência.
- `src/modules/marketing/platform-preview.tsx`: única nova fronteira cliente da apresentação de produto. Justificada pelas abas interativas e teclado; capturas estáticas fornecidas pelo usuário, sem API, conta ou armazenamento. Não é um segundo módulo de alunos/treinos/agenda.
- `src/components/layout/header.tsx`: reaproveitado com navegação desktop/mobile, acesso, cadastro, Escape, foco e link de salto.
- `landing.module.css`: estilos isolados da página pública; fundos na largura total, limites de leitura internos, preto/verde com detalhes em roxo/rosa e faixas claras. A paleta pública fica em tokens `--marketing-*`. Uma correção relacionada restaura os tokens verdes globais e do shell que haviam sido alterados para magenta na revisão anterior; limites de scroll e regras de negócio preservados.
- `src/app/page.tsx`: descrição de busca atualizada. Título e marca oficial permanecem canônicos.
- `tests/landing-e2e.ts`: regressão de apresentação existente estendida para interações novas e ausência de consultas privadas.

## Comportamento

Cabeçalho com âncoras para plataforma, Wear, Studio, profissionais e marca, além de login/cadastro. Hero com foto de fundo; diretório abaixo dá três caminhos de exploração. A prévia do sistema alterna Alunos/Treinos/Agenda por clique ou setas/Home/End; seleção e foco seguem o padrão de abas. A apresentação usa as três imagens de Alunos/Treinos/Agenda enviadas pelo usuário. Controles dentro das capturas não são elementos interativos. A ação Ampliar tela abre um dialog próprio com fechar/Escape e retorno do foco. Nenhuma consulta da carteira real é feita pela landing.

Wear apresenta Oversized, Compressão e Acessórios; detalhes expansíveis explicam a proposta. O Studio mostra conceito, usos pretendidos e etapa de desenvolvimento em disclosure próprio. São conteúdos informativos: nenhuma venda, fila de espera, reserva, preço de produto, endereço de unidade ou transmissão de contato foi inventado.

Plano Pro usa R$139,90/mês e30 dias com cartão obrigatório do catálogo canônico. Criar conta aponta para `/cadastro`; acesso para `/login`; consulta de assinatura para `/assinatura`. A página explica cobrança ao fim do teste e cancelamento anterior. Recebimentos externos permanecem permitidos, separados do Billing SaaS. FAQ responde público, teste, recebimentos, acesso web/mobile e operações futuras.

Details/summary são HTML nativo acessível, não dialogs de navegador. A página não coleta dados, não busca APIs privadas, não usa rastreadores ou rede social externa. Não há nova finalidade de tratamento, retenção, permissão ou persistência.

## Imagens e manutenção

Fotografias geradas e atlas anteriores deixam de ser carregados nesta composição; arquivos permanecem disponíveis no repositório. A marca oficial usa o PNG original branco/verde em header e footer, sem máscara ou recoloração. Hero, três capturas e Oversized usam os sete arquivos fornecidos pelo usuário, copiados sem edição para `public/images/marketing`. Next Image entrega tamanhos adequados; hero tem carregamento prioritário. Oversized preserva frente/costas com object-fit:contain; Compressão recebe a foto de manga longa com enquadramento integral; Acessórios recebe a fotografia enviada de mochila, garrafa e equipamentos de treino. Heading, descrição, estado e ação ficam em HTML. Não há mensagem técnica de placeholder no website.

O conteúdo futuro deve continuar identificado até sua disponibilidade real. Não substituir condições comerciais por texto da imagem. Não adicionar depoimentos, métricas, catálogo ou endereços simulados como prova social.

## Validação e limites

Em andamento: Chrome real, Axe, sete larguras de320 a2560px, texto200% com altura500px, interações de abas/menu/disclosures, TypeScript, lint e build com canários sintéticos. Evidências desta revisão em `test-results/local/website-publico`; não usar relatórios históricos da reprodução da imagem como evidência do website atual.

Sem deploy, commit, migration ou homologação produtiva. Publicação do domínio, operação comercial externa e NO-GO015 seguem as regras e gates já registrados.


### Atualização de mídia — 07/11/2026

Imagem de acessórios enviada pelo usuário aplicada ao terceiro card Wear, ao lado de Oversized e Compressão. Sete arquivos de apresentação fornecidos pelo usuário integrados. Verificação local: TypeScript e diff-check aprovados; Chrome confirmou carregamento das três imagens Wear e ausência de overflow horizontal em375px. Inspeção visual desktop1440px realizada. Projeto iniciado localmente em http://localhost:3000. Esta checagem de mídia não substitui homologação produtiva ou validação integral dos módulos.


Hero substituída em07/11/2026 pela imagem `hero-bodybuilder-magenta.png` enviada pelo usuário. Enquadramento integral à direita no desktop, foco74%/topo no mobile, texto e CTAs preservados. Chrome: imagem carregada e sem overflow horizontal em1440/768/375/320px; inspeção das capturas1440/375px concluída. ESLint dos arquivos tocados e diff-check aprovados. Servidor local reiniciado na porta3000.


### Refinamento da hero — 07/11/2026

Foto ampliada pela altura da hero, com camada proporcional e máscaras de transparência suaves nas bordas; camiseta permanece nítida. Removidos os textos auxiliares Performance & Lifestyle, Feito para quem vive o movimento e Constância constrói. Barra externa invisível apenas na landing via seletor contextual, preservando rolagem nativa. Chrome validou2548/1440/768/375/320px sem overflow horizontal, ausência das frases, scrollbar-width:none e rolagem por wheel funcionando. Capturas desktop/mobile inspecionadas; ESLint e diff-check aprovados.


### Plataforma em largura total com cenário do MacBook — 07/11/2026

Seção anterior clara substituída pela composição da referência: fundo escuro em largura integral, headline branca/rosa, contexto à direita, três benefícios selecionáveis à esquerda e descrição/CTAs abaixo. Foto `Laptop FormFisik sob luzes magenta.png` enviada pelo usuário copiada sem edição para `public/images/marketing/platform-laptop-scene.png`. Não houve geração de imagem nem nova dependência.

`PlatformPreview` reaproveita as três capturas e o dialog existente. Acrescenta navegação vertical por teclado e escala responsiva da cena com ResizeObserver desconectado ao desmontar. Uma transformação projetiva calibrada nos quatro cantos do monitor substitui apenas a tela da fotografia pela captura selecionada. O material original e a área autenticada continuam verdes; magenta limitado à seção pública. Na ampliação, a captura permanece plana e completa. Ver a plataforma abre a mesma captura; Conhecer o plano mantém a âncora canônica. Não há requisições privadas, coleta ou alteração de permissões/APIs/dados.

Validação local: TypeScript, ESLint dos arquivos tocados e diff-check aprovados; regressão Chrome/Axe passou em2560/1920/1440/1024/768/375/320px, incluindo abas, teclado, dialog, navegação, texto200% e altura500px. Capturas locais da seção1920/1440/768/375/320px inspecionadas; evidências em `test-results/local/website-publico`. Sem deploy ou homologação produtiva.


Build webpack da revisão MacBook aprovado; verificação com10 canários sintéticos em235 arquivos estáticos públicos, nenhum vazamento encontrado. Regressão final Chrome/Axe aprovada também com setas verticais nas abas. Resultados em `test-results/local/website-publico/results.json` e `platform-build.json`. GO local para esta apresentação pública; não altera gates de produção da Personal1.0.


Refinamento visual posterior (07/11/2026): seção reduzida novamente, cenário menor com proporção1919/820 preservada e centralizado, máscara de bordas suaves em foto e captura conjuntamente. Alturas medidas713px em1920px e650px em1440px; sem overflow horizontal em1920/1440/768/375/320px. Mobile também recebeu redução de escala. Alteração apenas de CSS, sem nova regra de negócio.


### Wear — apresentação por cards (07/11/2026)

Composição da referência A Forma do Seu Estilo aplicada usando as imagens existentes de Oversized, Compressão e Acessórios. Cabeçalho preto/verde com estado comercial explícito; cards arredondados, ícones Lucide já disponíveis, ações largas e destaque verde na primeira categoria. Novo layout reaproveita os disclosures existentes, sem catálogo, checkout, API, coleta ou dependência adicional. Fonte canônica e imagens preservadas. Alterações em `landing.tsx`/`landing.module.css`, com responsividade e contraste validados na regressão da landing.


Validação da revisão Wear: TypeScript, ESLint e diff-check aprovados; Chrome/Axe aprovado em2560/1920/1440/1024/768/375/320px e texto200%, incluindo abertura/fechamento dos detalhes das três categorias. Inspeção visual desktop1920px e mobile375px concluída. Capturas em `test-results/local/website-publico/wear-cards-*.png`; nenhuma operação de venda foi introduzida.


## Catálogo comercial apresentado — 07/11/2026

Autorização do responsável: apresentação na landing primeiro. Novos planos e anual são proposta comercial, sem contratação habilitada. Cobrança anual única com20% de desconto: Standard479,04 (39,92/mês equivalente), Premium863,04 (71,92), Pro1.343,04 (111,92). Trial planejado mantém30 dias/cartão obrigatório. Billing atual segue Pro mensal; não foram criados produtos/preços Stripe nem limites de alunos no backend. IA e parceria são futuras. PricingPreview usa estado local para periodicidade; não consulta APIs privadas.


Atualização multiplanos posterior: landing agora reutiliza catálogo compartilhado e direciona todos os seis pares para seleção autenticada em /assinatura. Em breve permanece somente nos recursos futuros, não nos planos. Backend implementado/testado, contratação externa depende de webhook/Portal e homologação. [Relatório](assinaturas-multiplanos-2026-11.md).
