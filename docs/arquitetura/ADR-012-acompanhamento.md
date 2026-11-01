# ADR-012 — Avaliações privadas, decimais e evolução por pontos

Status: adotada na entrega 012. A FormFisik é empresa independente, fundada por Brandon Louis.

## Auditoria e reutilização

| Área auditada | Evidência no código | Uso na 012 |
| --- | --- | --- |
| 008 Alunos | students/schema.ts, repository.ts e handlers.ts; student_links privado, listStudents; StudentsPicker da 010 | Mesmo vínculo e endpoint de busca/paginação. Link na ficha, sem novo cadastro/identidade. |
| 010 Treinos | workouts/page.tsx, area.tsx, students-picker.tsx, handlers.ts; locks e versões no repository | Reutiliza picker, padrão de página guardada/monitor, respostas e concorrência otimista. Não reutiliza documento de prescrição como avaliação. |
| 011 PDFs / 011.5 | workout-documents/handlers.ts, presentation.ts e pdf.ts; docs de exportação e padrões PDF | Referência de privacidade, autorização por operação e preservação de checkout; não altera renderer, artefatos, opções ou upload. Não cria PDF de acompanhamento. |
| Dashboard | professional-dashboard.ts, navigation.ts, sidebar.tsx, shell.tsx, access-monitor.tsx | Mesmo shell/monitor; ativa item e adiciona contagens SQL reais. Não cria gateway de assinatura alternativo. |
| Segurança | sessions.ts, http.ts, subscriptions/status.ts, professionalAccess | Sessão opaca, confirmação, acesso canônico, Origin, jsonBody, HMAC rate limiting, privateHeaders/failure. |
| Persistência | db.ts, scripts/migrate.ts, exercises/repository.ts::transaction, migrations 006–011 | Mesmo Pool/migrator/transações; nova migration aditiva e FK composta existente. |
| Design | DESIGN_SYSTEM.md, globals.css, exercises/browser.tsx::action/control | Mesmas fontes, tokens, ações, campos, grid com min(100%,…) e foco. |

## Decisões

Avaliações merecem modelo separado: saúde potencialmente sensível não cabe em admin_notes nem em snapshots de treinos. NUMERIC(5,2) no banco e strings na API preservam centésimos; operações comparativas usam inteiros BigInt, sem nova dependência decimal. DATE representa data da avaliação; timestamps apenas administração. Múltiplos registros na mesma data são legítimos, com desempate explícito.

Histórico administrativo registra operações e autoria, sem replicar payloads sensíveis a cada edição. Isso preserva rastreabilidade e minimiza dados; reconstrução histórica das medidas corrigidas fica fora deste contrato. Arquivar nunca representa apagar. Vínculo arquivado continua legível, porém não recebe alterações até reativação.

Auditoria de package.json e lockfile não encontrou Recharts, Chart.js, ECharts, D3 ou outra biblioteca gráfica instalada. SVG é a solução estável já suportada por React/Next e pelos navegadores alvo: dois gráficos de pontos sem interpolação, escala temporal real e tabela HTML acessível. Não há dependência adicional, download/CDN ou transmissão a analytics. Novos componentes chart/comparison/editor isolam apresentação e cálculo do domínio; api.ts limita-se ao tratamento comum deste módulo, sem criar framework genérico.

Gráficos consultam somente grandezas preenchidas e registros ativos. Paginação explícita de 500 pontos evita carregar todo o histórico por padrão e não o resume silenciosamente. O operador pode carregar todas as páginas. Para volumes excepcionalmente altos, DOM e SVG completos têm custo crescente; futura virtualização pode preservar tabela e significado sem amostragem invisível.

A assinatura continua verificada pelo mesmo provedor e estado canônico em todas as leituras e escritas. Gateway controlado existe somente em processos de teste com injeção explícita, sem flags, dados de entitlement ou atalhos em produção. Nenhuma alteração em cobrança/checkout, credenciais, prescrição ou PDF foi necessária.

Guias locais do Next consultados antes da implementação: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` e `route.md`. Páginas e handlers usam params assíncronos; wrappers HTTP recebem Request/context, mantendo o parâmetro interno de ID fora da assinatura pública do Route Handler. Build e TypeScript validaram os contratos da versão instalada.
