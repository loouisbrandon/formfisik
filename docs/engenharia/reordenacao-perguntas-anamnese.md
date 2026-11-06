# Reordenação de perguntas no construtor de anamneses

FormFisik é empresa independente, fundada por Brandon Louis. Alteração local do construtor compartilhado; não constitui homologação de produção.

## Comportamento e integração

A alça lateral inicia arraste de perguntas dentro da seção atual, com mouse ou toque. O gesto preserva campos, opções, obrigatoriedade, identificadores e condições. Cartão flutuante acompanha o ponteiro; origem translúcida e linha de inserção indicam o destino. Há limite mínimo de deslocamento, cancelamento por Escape/pointercancel/perda de foco, soltura externa sem alteração e rolagem nas bordas de `#app-content`. Setas no botão da alça oferecem alternativa por teclado, com foco preservado e anúncio da nova posição. As ações existentes de subir/descer usam a mesma regra.

`reorderQuestion` rejeita índices inválidos e movimentos que coloquem uma pergunta condicional antes da dependência, inclusive em relação a outras seções. Não apaga condições para permitir movimentação. O restante da validação continua no `formSchema` e no servidor. A alteração atua somente no rascunho em memória, sinaliza alterações não salvas e utiliza os contratos existentes de salvar/publicar; não há endpoint, migration, dependência ou mudança de autorização. Versões publicadas e convites anteriores permanecem imutáveis. A mudança também alcança os demais consumidores do `FormBuilder` compartilhado.

## Manifesto funcional

- `src/modules/intake/builder.tsx`: integra alça, arraste, teclado, anúncio e regra de dependências.
- `src/modules/intake/question-order.ts`: operação imutável de ordenação.
- `src/modules/intake/use-question-drag.ts`: captura de ponteiro, destino, cancelamento e rolagem local.
- `src/modules/intake/intake.module.css`: prévia, hover, indicador de destino, origem e movimento reduzido.
- `tests/intake-order.test.ts`: limites, identidade/imutabilidade, dependências e preservação de outras seções.
- `tests/intake-order-e2e.ts`: ambiente temporário com shell real e dados sintéticos; contrato de salvamento em memória, sem banco.
- `docs/modulos/anamneses.md`, `docs/design/DESIGN_SYSTEM.md` e este relatório: comportamento e padrão visual.

## Limites da validação

O teste de navegador usa callbacks controlados de salvar/publicar para conferir a ordem entregue pelo componente e a reabertura do estado salvo. Não comprova integração de banco ou homologação externa. Persistência e versionamento do servidor são reutilizados sem alterações. Nenhum banco persistente, dado real, serviço pago, deploy ou commit faz parte desta alteração. Alterações preexistentes são preservadas.

## Resultados locais

- Três testes automatizados de regra: PASS (`node --import tsx tests/intake-order.test.ts`).
- Chrome real: PASS para arraste, cartão flutuante, indicador de destino, toque via CDP, teclado/foco, Escape, bloqueio de inversão de condição e callbacks de rascunho/publicação.
- Axe WCAG A/AA e responsividade em 1440/768/320px: PASS, sem violações detectadas ou ampliação horizontal externa no cenário sintético com shell real. Não substitui revisão humana com leitor de tela.
- TypeScript, ESLint nos arquivos alterados e build webpack: PASS.
- Canários sintéticos de segredo no build: não encontrados em `.next/static` ou `public`. Sem alteração de autenticação, autorização ou persistência.

Evidências em `test-results/local/intake-order/`: `verification.json`, capturas do arraste e das três larguras, logs de validação e `manifest.json` com SHA-256 dos arquivos desta alteração. Os testes de banco dos módulos anteriores não foram reexecutados nesta alteração de interface. O teste de toque usa eventos reais de ponteiro do Chrome via CDP; não representa homologação em aparelho físico.
