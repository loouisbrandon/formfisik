# Dropdowns compartilhados — novembro de 2026

Estado: IMPLEMENTADO e validado localmente, sem deploy.

## Escopo

A inspeção encontrou seletores em 45 arquivos TSX. O padrão visual é centralizado em `src/components/ui/select.css`, importado por `src/app/globals.css`, sem trocar os controles React/nativos existentes, eventos, validação, nomes ou valores. Nenhuma dependência, consulta, migration ou JavaScript adicional.

Usa o mecanismo progressivo de [seletores personalizáveis nativos](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select): menu opaco, sombra, espaçamento, checkmark, realce verde e bordas suaves; posição ancorada com alternativas quando não houver espaço; altura limitada e rolagem interna. Os tokens seguem o tema herdado mesmo na top layer. `multiple`/`size` não recebem o novo picker. Em navegadores sem suporte ao recurso, preserva-se a lista nativa com melhorias de foco/cores; não declarar paridade visual entre motores sem verificação.

## Verificação

Chrome local confirmou suporte. Playwright autenticado na biblioteca real: abertura do menu, seleção de Abdominais via Espaço/seta/Enter, valor `abdominais` preservado no controle, Escape, nome acessível “Grupo muscular”, temas dark/light e viewport de 320 px sem overflow horizontal. Somente filtros de leitura foram alterados. Capturas `/tmp/dropdown-dark-1440.png`, `/tmp/dropdown-light-1440.png` e `/tmp/dropdown-dark-320.png`. Não foi realizada revisão manual com leitor de tela nem homologação em Firefox/Safari.

Design System atualizado na mesma entrega. Sem alterações no backend ou dados de exercícios.

Build Webpack e TypeScript aprovados. Build efetivo com canários sintéticos: 252 artefatos públicos examinados, zero vazamentos. `git diff --check` aprovado; aviso preexistente de `metadataBase` permanece fora do escopo. Não houve alteração de configuração permanente do bundler.
