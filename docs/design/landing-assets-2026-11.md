# Assets da campanha — fidelidade à referência

Data: 2026-11-06. Método: ferramenta integrada `image_gen`, skill imagegen. Não foi usada API/CLI ou nova dependência.

## Arquivos da composição anterior

- `public/images/marketing/hero-corrected.png`: fotografia da hero gerada a partir da referência; uma cabeça, um pescoço, pose de costas e camiseta com estampa preservadas na composição. Revisada visualmente.
- `public/images/marketing/footer-landscape.png`: panorama recriado sem textos, botões e navegação embutidos.
- `public/images/marketing/reference-artwork.png`: cópia sem alteração da referência fornecida pelo usuário. A aplicação exibe janelas delimitadas de dispositivos, vestuário, Studio e manifesto via CSS. Não é utilizada como página inteira; estrutura, headings, navegação, CTAs, preço e condições são HTML.

Na composição anterior, a marca no header/footer usava a geometria alpha de `public/images/nomelogo.png`, com variante branca/magenta via máscara CSS, conforme pedido posterior de fidelidade à referência. O arquivo oficial original não foi alterado.

Amostras de interfaces, produtos e Studio são conceitos visuais. Não comprovam disponibilidade de aplicativo, catálogo comercial, unidades, reservas ou operação financeira. A correção de anatomia é ilustrativa; não envolve identidade real conhecida.

## Prompt final da hero

```text
Use case: precise-object-edit. Asset type: isolated website hero photographic background, landscape aspect ratio about 2.65:1.
Input image is the supplied FormFisik landing reference. Extract/recreate ONLY the TOP HERO photograph (top 0–386px of reference), without any website text, logo header, buttons, icons, borders, phones or other sections.
Keep the dark cinematic gym, racks, pink strip lighting and the muscular tattooed man from the back in a black oversized shirt with the same FormFisik neon-green/magenta angel illustration. Man occupies the right half. Left half is dark gym negative space so live HTML text can sit there.
CRITICAL CORRECTION: the man must have EXACTLY ONE anatomically correct head, one neck and one coherent hairline. Remove the duplicate overlapping head/face visible in reference. Natural back-of-head with slight rightward turn, no second face or extra scalp. Keep shoulders, arms, shirt artwork and composition as close to the original as possible. Head must be fully inside image with breathing room. Photorealistic premium fitness campaign; black, magenta, warm rim lights. No added textual UI. Output only full-bleed hero image.
```

## Prompt final do footer

```text
Use case: precise-object-edit. Asset type: footer background photo. Input image is the FormFisik website reference. Reproduce ONLY the footer landscape photograph at the very bottom: an athletic backpacker sitting on a rock at lower left-center, seen from behind looking at layered mountains and a vivid red-orange sunset. The sun is low near horizontal center-right. Keep same composition and colors, dark black upper sky for native navigation to overlay. Wide cinematic panorama about 3:1. Remove all website text, logos, icons, navigation columns, copyright, dividers and the handwritten slogan; image only. Preserve the backpacker, rocks, sunset and mountain silhouettes as closely as possible. No added people, no statues.
```


## Revisão posterior — website sem fotografia

No refinamento de navegação/conteúdo de06/11/2026, o usuário optou por fornecer imagens depois. A landing atual não carrega hero-corrected, footer-landscape ou reference-artwork; preserva esses arquivos históricos e a marca oficial. Prévia do sistema e categorias passam a HTML/CSS, conforme `docs/engenharia/website-publico-2026-11.md`. Nenhum novo bitmap foi gerado.


## Assets fornecidos pelo usuário — revisão vigente

Copiados sem edição; entrega responsiva por Next Image. Nenhuma geração nova:

- `hero-performance.png`: origem `/tmp/codex-clipboard-e624f1d1-750d-4f00-80c2-d26f085b0fdc.png`; fundo da hero.
- `platform-students.png`: origem `/tmp/codex-clipboard-3e0ecbc1-71d3-4e09-9e4a-3a6928831ddb.png`; aba Alunos.
- `platform-workouts.png`: origem `/tmp/codex-clipboard-2e5200e6-b119-42b9-8d9f-0a3d29e6de7e.png`; aba Treinos.
- `platform-agenda.png`: origem `/tmp/codex-clipboard-fe1e9905-9a0f-4079-9d7a-3de95ec6033c.png`; aba Agenda.
- `wear-oversized-atlas.png`: origem `Documentos/Camisetas Formfisik com Atlas Neon.png`; categoria Oversized, enquadramento integral.

Todos ficam em `public/images/marketing`. Logo canônica `public/images/nomelogo.png` é exibida em suas cores originais; a máscara magenta anterior foi removida. Wear/Studio continuam futuros. As capturas são materiais públicos autorizados pelo usuário para apresentação, sem vínculo com consultas privadas em tempo real.

- `public/images/marketing/wear-compression.png`: cópia sem edição de `Documentos/Camiseta de Compressão Preta com Logo FK.png`, categoria Compressão, enquadramento integral.

- `public/images/marketing/wear-accessories.png`: cópia sem edição de `Documentos/Equipamentos de Academia FormFisIk em Neon.png`, integrada à categoria Acessórios em 07/11/2026.

### Hero atualizada — 07/11/2026

`public/images/marketing/hero-bodybuilder-magenta.png` é cópia sem edição da imagem `Fisiculturista de costas sob luz magenta (1).png` enviada pelo usuário. Substitui a foto anterior na hero. Desktop usa contain alinhado à direita, preservando cabeça e estampa; mobile usa cover com ponto focal à direita/topo e proteção de contraste. Arquivo anterior preservado sem uso nesta composição.


### Cenário da plataforma — 07/11/2026

`public/images/marketing/platform-laptop-scene.png`: cópia sem edição de `Documentos/Laptop FormFisik sob luzes magenta.png`, dimensão1919×820. Foto contém computador, cenário magenta e base de pedra. Usada na composição pública em largura integral; capturas já fornecidas são encaixadas no monitor por transformação CSS, mantendo os arquivos originais. Não gerar duplicata do MacBook nem recolorir a logo/interface autenticada.


07/11/2026 — Fundo de preço fornecido pelo usuário: `public/images/marketing/pro-pricing-background.png`, copiado de “Fundo geométrico escuro com neon magenta.png”, sem edição. Uso decorativo centralizado e esfumado por CSS na seção Profissionais.


07/11/2026 — CTA final usa `public/images/marketing/cta-neon-green.png`, cópia sem edição de “Zumbi fisiculturista sob luz verde neon.png” fornecida pelo usuário. Uso decorativo por CSS; título, benefícios e ação permanecem texto acessível em HTML.
