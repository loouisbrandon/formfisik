# Landing e identidade compartilhada — 2026-11-06

> Composição histórica, substituída pelo [website público](website-publico-2026-11.md). Magenta compartilhado e recoloração da logo revogados; área profissional permanece verde.

## Objetivo e diagnóstico

Implementar a referência performance/lifestyle enviada, preservando a marca oficial e a Personal 1.0. A landing anterior tinha âncoras sem destino e não apresentava adequadamente o ecossistema. O repositório tem logo branca/verde, monograma e cena de montanha; não contém catálogo Wear, fotografia de Studio nem personagem oficial. Na primeira versão, a fotografia da hero foi dispensada pelo usuário. A revisão seguinte solicitou fidelidade à imagem de referência, incluindo a fotografia com correção da duplicação anatômica. Essa revisão substitui a decisão inicial de hero sem foto.

## Implementação

- `src/modules/marketing/landing.tsx` e `landing.module.css`: hero fotográfica corrigida, composição compacta de plataforma/Wear/profissionais/Studio, manifesto e footer. Títulos Exo 2 900 itálica via next/font, restritos ao marketing.
- `src/components/layout/header.tsx`: âncoras reais, login/cadastro, menu mobile com Escape e foco, link de salto.
- `src/app/page.tsx`: composição e metadata de título, descrição, Open Graph/Twitter com asset oficial.
- `src/app/globals.css` e `src/modules/professional/workspace.module.css`: acentos magenta em ações e shell, logo verde preservada. Nenhuma mudança na estrutura de scroll, autenticação ou autorização.
- Preço e duração do teste reutilizam `src/modules/subscriptions/plan.ts`. CTA Pro abre `/assinatura`; nenhuma cobrança nova foi implementada.

## Regras e limites

Wear e Studio são futuros, sem compra ou reserva. Aplicativo de alunos é futuro. Prévias de dispositivos usam a arte conceitual enviada, identificada como tal; aplicativo e comunidade estão em desenvolvimento. Nenhum dado de aluno é consultado para a landing. O footer usa panorama recriado da referência, sem links embutidos. Assets fornecidos pelo usuário e dois derivados via image_gen, detalhados em `docs/design/landing-assets-2026-11.md`. Sem dependência, API, entidade ou migração nova. Não há nova coleta de dados pessoais; acesso, retenção e autorização existentes permanecem inalterados. A empresa é apresentada como independente, fundada por Brandon Louis.

## Validação

Evidência de navegador em `test-results/local/landing-redesign`, produzida por `tests/landing-e2e.ts`. Verifica cinco larguras, Axe WCAG A/AA, metadata, âncoras, menu, Escape/foco e overflow. Typecheck, lint e build devem ser registrados no fechamento da entrega. Testes locais não constituem homologação de produção. O NO-GO da 015 e a homologação externa de billing permanecem independentes desta entrega.

### Resultado da primeira implementação local

- TypeScript e lint global: PASS.
- Build webpack de produção: PASS.
- Landing Chrome/Axe: PASS em 1440/768/375/320 px, menu/âncoras/Escape/foco, texto a 200% e altura 500 px sem overflow externo; sem erro JavaScript.
- Regressão existente `tests/feedback-e2e.ts`: PASS para shell, temas claro/escuro, dialogs, teclado, toasts e acessibilidade em 1440/768/320 px.
- Capturas desktop/mobile inspecionadas, incluindo imagem lazy do footer.
- GO para revisão visual local. Sem deploy. A liberação de produção continua subordinada à homologação operacional e ao NO-GO 015 já registrado.
- Build final com dez canários sintéticos: PASS; 230 arquivos em `.next/static` inspecionados, zero vazamentos. Evidência `test-results/local/landing-redesign/canaries.json`.


## Revisão de fidelidade à referência

Reorganização em sete faixas compactas, header sobre a hero, produtos com fotografias da referência, painel profissional claro, Studio panorâmico, manifesto com arte original e footer de pôr do sol. Marca oficial aplicada como máscara sem distorcer a geometria; variante magenta restrita ao marketing. Todas as ações seguem destinos reais. Não há CTAs de compra/reserva fictícios nem promessa de teste sem cartão. A hero foi revisada visualmente com uma única cabeça.

`tests/landing-e2e.ts` agora testa1440/1024/768/375/320px, decodificação de todos os assets, Axe WCAG A/AA, navegação/âncoras/foco e ampliação efetiva dos tamanhos computados de texto a200% em320x500. A auditoria não se limita a mudar o tamanho de fonte da raiz: títulos em px também são ampliados. Capturas são inspecionadas além dos checks automáticos.

Diferenças intencionais da referência: informações verdadeiras do plano (cartão obrigatório), indicações de recursos futuros, ausência de links sociais não configurados, textos de navegação acessíveis e reflow mobile. Não se declara equivalência pixel a pixel, disponibilidade comercial de Wear/Studio ou homologação em produção.

### Evidências da revisão de fidelidade

- Chrome/Axe: PASS em1440/1024/768/375/320px, todos os assets decodificados, menu/âncoras/Escape/foco e texto efetivamente ampliado200% em320x500.
- Inspeção visual de desktop, hero mobile e vestuário; recortes delimitados para não repetir títulos da imagem. Hero mobile usa resolução suficiente para `object-fit:cover`, com personagem centralizado no recorte.
- TypeScript, ESLint global e build webpack: PASS. Build com10 canários sintéticos,235 arquivos públicos, zero vazamentos.
- GO para revisão local do visual. Sem commit, migração ou deploy. O NO-GO015 de produção permanece fora deste escopo.

Observação de ambiente: build local avisa ausência de `metadataBase` e resolve OG para localhost. O domínio canônico deve ser configurado/validado na etapa de publicação; esta revisão visual não publicou a aplicação nem definiu domínio de produção.


## Refinamento de largura e espaçamento

Pedido posterior: seções na largura total da tela e menos compactas. Removido o teto externo de1600px em `landing.module.css`, ajustadas alturas/paddings fluidos, espaços de leitura e disposição profissional no tablet. Sem mudanças em imagens, conteúdo, regras comerciais, API ou persistência. Teste existente ampliado para1920/2560px e asserção explícita de bordas de todas as seções.

Chrome/Axe PASS nas sete larguras2560/1920/1440/1024/768/375/320 e em320x500 com texto200%; todos os assets carregados, sem overflow, erros JavaScript ou violações Axe. Capturas1920 e320 inspecionadas. Evidências atualizadas no mesmo diretório `test-results/local/landing-redesign`.

Build final deste refinamento: PASS, incluindo TypeScript. Lint do teste atualizado e `git diff --check`: PASS. Dez canários sintéticos ausentes dos235 arquivos públicos inspecionados. Nenhuma migração ou publicação executada.

## Ajuste pontual de fidelidade — revisão de 06/11/2026

Pedido: aproximar novamente a referência sem reconstruir a landing. Diagnóstico: o último refinamento havia aumentado excessivamente padding e altura das faixas, afastando dispositivos, produtos e Studio da composição original. Alteração restrita ao CSS de marketing: hero com proporção próxima de37,8vw, plataforma26,55vw, Wear19vw e Studio14,8vw; removido o excesso de padding entre faixas. Títulos de campanha têm escala fluida até telas grandes, preservando largura total e composição mobile. Mantidos assets, conteúdo HTML, navegação, acessibilidade e condições reais do plano. Sem API, coleta, dependência, migration ou deploy.

Chrome/Axe: PASS em2560/1920/1440/1024/768/375/320px, texto200% em320x500, imagens decodificadas, menu, foco, âncoras e ausência de overflow/erros JavaScript. Captura1440 inspecionada comparativamente à referência. Evidências atualizadas em test-results/local/landing-redesign. Este ajuste substitui os paddings amplos da subseção anterior; não remove a largura total solicitada.

Fechamento desta revisão: TypeScript, ESLint global, git diff --check e build webpack PASS. Dez canários sintéticos ausentes dos235 arquivos públicos do build; relatório canaries.json no diretório de evidências. Desktop1440 e mobile375 inspecionados. GO para avaliação visual local; produção permanece sem deploy e sujeita aos gates existentes.
