# Entrega 011 — Exportação profissional Compacta e Premium

## Resultado funcional

Exportação web de fichas individuais reais do PostgreSQL, acessível pela ficha, histórico e seção de treinos do aluno. Configuração efetiva de layout, divisões, cargas, notas, orientações gerais, anotação em papel, identidade e marca. Prévia do PDF real e download dos mesmos bytes, sem gerar novamente; versões anteriores autorizadas e estado documental explícito. FormFisik permanece empresa independente, fundada por Brandon Louis.

Compacta usa tabelas claras e apresentação contida para impressão; Premium usa hierarquia editorial, títulos maiores e blocos de séries com parâmetros, mais agradáveis à consulta digital. Ambas A4, branco/preto/cinza/verde institucional, fontes locais e “Produzido com FormFisik” com paginação. Sem capa vazia, efeitos exagerados, recomendações automáticas ou dados inventados no produto.

## Arquivos, módulos e reutilização

| Área | Arquivos |
| --- | --- |
| Persistência aditiva | `db/migrations/011_workout_documents.sql` |
| Contratos/UI | `src/modules/workout-documents/{schema.ts,presentation-form.tsx,export-area.tsx,pdf-preview.tsx}` |
| Backend | `src/server/workout-documents/{presentation.ts,pdf.ts,handlers.ts}` |
| APIs | `src/app/api/professional/presentation/route.ts`, `api/workouts/[id]/documents/route.ts`, `api/workout-documents/[id]/route.ts` |
| Navegação | `src/app/(app)/treinos/[id]/exportar/page.tsx`, `src/modules/workouts/area.tsx` |
| Build/fontes/operação | `assets/fonts/DejaVuSans-Bold.ttf`, `next.config.ts`, `scripts/cleanup.ts`, `package.json`, `package-lock.json` |
| Testes | `tests/workout-documents.test.ts`, `workout-documents-e2e.ts`, `render-workout-documents.py`, extensão do helper `tests/helpers/workouts-browser-server.ts` e dos guards no E2E principal |
| Documentação | módulo exportação, API exportação, ADR-011, DS, Treinos, privacidade/alunos, operação/ambientes, roadmap, README, CHANGELOG e relatório 011 |

Reutilizados: PDFKit da 008, fonte DejaVu e licença existente (acrescido peso negrito), snapshots/getPlan/history/validações da 010, modelos/dados reais de alunos e exercícios, Zod, PostgreSQL/migrator/transaction, sessões opacas/readSession, professionalAccess e Stripe canônica, HTTP/Origin/limites, shell/monitor e action/control. Sharp já era transitivo do Next; promovido a dependência direta explícita para sanitizar imagens. PDF.js é somente visualizador dos bytes gerados pelo PDFKit, não outro gerador ou layout de documento. Não atribuir todas as alterações acumuladas no checkout à 011.

## Fontes, revisão e segurança

Fonte única: documento/identidade/estado da revisão em workout_versions e nomes/instruções da revisão referenciada em exercise_versions (PDF usa os nomes, não adiciona instruções do catálogo). Não reconstrói conteúdo histórico com o catálogo atual nem altera snapshots, ficha ou estado. Nome autenticado registrado na revisão é independente da apresentação atual, rotulada. Drop/rest-pause mostram etapas; grupos mostram membros/ordem explícitos; pirâmides preservam linhas individuais sem cálculos. Datas de emissão/revisão e período informado são distintos. Rascunho em todas as páginas, arquivado/histórico identificados.

Apresentação opcional em tabela própria por profissional, sem alterar users/credentials ou autorizações. Nome/marca/registro/contato público validados; registro declarado não é verificado. PNG/JPEG até 256 KiB/2000², assinatura + decode real com limites + reencode PNG reduzido sem metadata; SVG/URLs/animação/truncamento rejeitados. PostgreSQL bytea privado permite substituir/remover e operar Railway sem disco efêmero ou bucket. Nenhuma marca fictícia no runtime; imagens geométricas dos testes são fixtures explicitamente sintéticas.

Geração e cada leitura exigem sessão confirmada, papel, assinatura canônica vigente, proprietário da ficha/aluno/revisão e opções strict. CSRF em POST/PUT, SQL parametrizado, versão otimista da apresentação, limites duráveis e arquivos restritos a 8 MiB/120 páginas. Artefato privado por 15 minutos, no máximo três recentes por conta; limpeza remove expirados e leitura sempre os rejeita. Não registra conteúdo em logs. Contatos privados/nascimento/notas administrativas do aluno não entram no PDF. Headers no-store/private/Vary Cookie/no-referrer/nosniff/noindex/CORP same-origin; UUID não autoriza acesso. [Contrato completo](api-exportacao-treinos.md).

## Fluxo e endpoints

1. Abrir ficha individual e Exportar PDF, inclusive uma revisão do histórico.
2. Selecionar apresentação, divisão/conteúdo; opcionalmente salvar dados públicos/logo na seção progressiva.
3. POST `/api/workouts/:id/documents` autoriza e gera artefato; resposta 201 contém ID/nome/prazo, sem conteúdo fictício.
4. PDF.js faz GET `/api/workout-documents/:id` e renderiza o PDF real em canvas, uma página por vez. Alternativa em outra aba também disponível.
5. Baixar PDF faz GET autenticado `?download=1` com nova autorização e os mesmos bytes. Se expirou/ficou indisponível, mostra erro e permite gerar de novo.
6. Alterar opção/versão/apresentação remove a prévia anterior. Exportar não salva a ficha nem autentica aluno.

GET/PUT `/api/professional/presentation` consultam/salvam a apresentação privada, sem devolver os bytes da logo. Opções/versões usam contratos da 010, sem segunda API de prescrição.

## Verificação

Validação com PostgreSQL 18 descartável, sessões opacas e handlers reais. O provedor financeiro controlado só é injetado no processo de teste; não substitui autorização/persistência.

| Verificação | Resultado |
| --- | --- |
| `npm test` | 138/138 passaram, zero falhas/skips, 170,3 s; inclui dez grupos novos da 011 |
| `test:workout-documents:e2e` | Passou com Chrome: upload real de PNG, apresentação persistida, opções/divisões, Compacta/Premium, geração e prévia PDF.js real, paginação, falha/retry de geração e do visualizador, download idêntico aos bytes da prévia, versões e integração no aluno |
| Axe 011 | Cinco estados (configuração, apresentação, erro, prévia, histórica) × 1440/768/320, zero violações nas regras A/AA/2.1/2.2 executadas |
| Reflow/teclado/foco | Sem overflow nas três larguras e texto 200%; submissão por Enter, foco em erro/h2 da prévia e navegação de páginas |
| PDFs/Poppler | Dez exemplos, 56 páginas renderizadas e inspecionadas diretamente, coordenadas de todo texto dentro dos limites A4 verificados; estresse adicional de 27/80 páginas com primeira/intermediária/última renderizadas e revistas |
| Build | Passou com PDF.js/worker local; tracing contém fontes regular/negrito/licença |
| TypeScript/ESLint/diff check | Passaram; encerramento das regressões registrado abaixo |

Os dez grupos abrangem guards/sessão/assinatura/propriedade/CSRF/strict/versões, mesmos bytes e headers/expiração, snapshots após editar catálogo/ficha, opções efetivas e exclusão de dados privados, apresentação/logo válida/inválida/JPEG/APNG/dimensões/conflito/remoção, abuso/capacidade, matriz visual, segundo profissional pago/indisponibilidade comercial, arquivo do aluno/ficha e estresse de 80 exercícios/400 séries nos dois layouts. Não houve truncamento silencioso.

Os runners usam Next temporário com componentes reais e ponte para handlers/sessões/PG reais. Uma falha HTTP é deliberadamente mantida até retry explícito no teste; depois o fluxo volta ao endpoint real. Não é simulação de conclusão financeira ou de persistência. As páginas da aplicação principal continuam sujeitas a guards; regressão principal verifica redirecionamento sem assinatura, inclusive a nova exportação.

A inspeção encontrou e corrigiu layout Premium semelhante ao Compacto, cabeçalhos curtos para duas linhas, blocos/títulos órfãos, confirmação de apresentação perdida por remount e iframe nativo vazio. O teste final usa canvas do PDF real com worker local e confirma que os bytes baixados são exatamente os gerados para a prévia.

Dependências: PDFKit preservado; Sharp direto 0.35.5 e PDF.js 6.4.299. Instalação registrou os mesmos 21 avisos baixos/moderados conhecidos do conjunto de dependências; não foi feito upgrade amplo/force do toolchain nesta entrega.

## Evidências visuais

Dez PDFs exclusivamente de testes em `output/pdf/011-*.pdf`; PNGs de todas as páginas, painéis de revisão e manifesto em `test-results/011/pdf/`. Interface e download real do navegador em `test-results/011/browser/`. Nenhum artefato contém carteira real. Esses diretórios são ignorados pelo Git.

Revisão visual é realizada sobre renders Poppler, não apenas bytes ou texto extraído. Casos: Compacta simples, Premium simples, ABC, muitas divisões, técnicas, textos/nomes longos, opcionais ausentes, rascunho, histórica, personalizada com logo de teste. São revistas primeira/intermediária/última e todas as páginas dos casos que revelam defeitos. Ajustes incluem diferenciação dos layouts, altura de cabeçalhos e reserva de blocos/títulos para impedir órfãos e fragmentação desnecessária.

## Limitações e operação

Aplicar migration 011 no ambiente alvo por procedimento autorizado; nesta execução, somente banco descartável `_test`. Agendar rotina existente `db:cleanup` para eliminação global dos artefatos expirados. Backups/retencão/eliminação do banco devem abranger logo e documentos pessoais privados. Sem filas: geração síncrona e limitada exige monitoramento de concorrência/recursos antes de abertura pública.

Visualizador PDF.js local exige JavaScript/Worker e navegador moderno; erro/retry e alternativas de nova aba/download disponíveis. PDF A4 pode exigir zoom no celular. Anotações são espaços em branco no documento, sem PDF interativo ou persistência de cargas realizadas. Cobertura de acentos portugueses validada, sem promessa de todos os alfabetos/símbolos. Axe/teclado/inspeção não certificam WCAG/PDF-UA; sem assinatura digital, validade jurídica atribuída ou homologação clínica.

Homologação Stripe hospedada continua pendente das chaves que o titular ainda criará; testes financeiros usam exclusivamente ControlledGateway explícito em processo de teste, com estado canônico PostgreSQL. Não há bypass financeiro no runtime. Revisão técnica do catálogo e provisionamento real de moderação continuam separados. Nenhuma credencial alterada, serviço externo criado, WhatsApp API, envio, mobile, commit ou deploy. O produto passa a exportar prescrições; execução/portal de aluno e acompanhamento permanecem futuros.

### Exemplos e capturas

- [Compacta, PDF](../../output/pdf/011-compacta-simples.pdf) e [imagem](../../test-results/011/pdf/compacta-simples/page-1.png).
- [Premium, PDF](../../output/pdf/011-premium-simples.pdf) e [imagem](../../test-results/011/pdf/premium-simples/page-1.png).
- [ABC](../../output/pdf/011-abc.pdf), [muitas divisões](../../output/pdf/011-muitas-divisoes.pdf), [técnicas](../../output/pdf/011-tecnicas.pdf), [textos extensos](../../output/pdf/011-textos-longos.pdf).
- [Ausentes](../../output/pdf/011-opcionais-ausentes.pdf), [rascunho](../../output/pdf/011-rascunho.pdf), [histórica](../../output/pdf/011-historica.pdf), [personalizada](../../output/pdf/011-personalizada.pdf).
- [Configuração desktop](../../test-results/011/browser/configuration-1440.png), [tablet](../../test-results/011/browser/configuration-768.png), [320px](../../test-results/011/browser/configuration-320.png).
- [Prévia real desktop](../../test-results/011/browser/preview-1440.png), [prévia 320px](../../test-results/011/browser/preview-320.png), [apresentação](../../test-results/011/browser/presentation-1440.png), [histórica](../../test-results/011/browser/historical-1440.png), [texto 200%](../../test-results/011/browser/text-zoom-200.png).

São 16 capturas finais: cinco estados × três larguras + texto ampliado. Arquivos de falhas anteriores são removidos após aprovação; não representam o resultado final. Inspeção direta da configuração desktop e da prévia efetivamente renderizada desktop/mobile, além dos testes axe/reflow em todos os estados.

Revalidação final específica após ajustes de logo/data: 10/10 grupos aprovados em 30,3 s. A fixture de sessão expirada foi corrigida para manter expires_at maior que created_at mesmo em execução rápida; não foi alterada a regra de sessões. Stress: 80 exercícios/400 séries, Compacta 27 páginas (~65 KiB), Premium 80 páginas (~144 KiB), sem truncamento; amostras de início/meio/fim revistas em PNG.

## Encerramento verificável

As cinco regressões Chrome anteriores passaram na versão final: autenticação/SMTP/recuperação/assinaturas e guards (232,8 s), dashboard (28,9 s), alunos/PDFs (42,6 s), exercícios/seletor/moderação (55,7 s), treinos/modelos/aplicação (69,6 s). A sexta suíte Chrome, específica da 011, passou com upload, navegação de páginas e retry explícito da prévia PDF.js. Logs e resultados estruturados em `test-results/011/logs/`.

Suíte completa: 138/138, sem skips. Integração específica reexecutada após o último ajuste: 10/10. TypeScript, ESLint e build webpack aprovados; tracing de fontes e worker local conferidos. Dez documentos renderizados novamente na versão final; total 56 páginas, todas revistas. Estresse adicional renderizado por amostragem de início/meio/fim. Documentação técnica/funcional/DS/privacidade/operação atualizada. O banco de desenvolvimento existente e as credenciais foram preservados; nenhuma migration anterior foi editada.

Servidores/harnesses temporários encerrados pelos runners; container PostgreSQL `formfisik-011-test` parado/removido. Nenhum servidor de desenvolvimento foi deixado em execução. Sem deploy, commit, recursos externos ou modificação de credenciais. Para usar no ambiente alvo, aplicar migration 011 e manter a limpeza agendada; homologação Stripe permanece pendente e não é simulada pela funcionalidade.
