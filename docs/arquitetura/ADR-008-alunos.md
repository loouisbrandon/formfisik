# ADR-008 — Carteira privada, concorrência e relatórios

A FormFisik é empresa independente. Decisão: manter identidade cadastral privada (`student_records`) e vínculo administrativo (`student_links`) separados, ambos delimitados pelo profissional. FK composta impede associação acidental de registro de terceiro. Não criar autenticação/globalização por e-mail. Futura identidade global será associada por fluxo próprio, sem reuso automático dos dados privados.

Reutilizar sessão, requireUser, shell, monitor, Zod, PostgreSQL, helpers de Origin/rate-limit/erros e serviço comercial. `professionalAccess` foi extraído da autorização da 007; dashboard acrescenta consultas reais, handlers operacionais usam o mesmo guard sem executar contagens desnecessárias. Nenhuma política Stripe foi alterada.

Chave UUID de criação e digest do payload garantem idempotência; lock transacional por profissional serializa verificação de possíveis duplicatas. Confirmação explícita permite homônimos. Edição/arquivamento usam versão + SELECT FOR UPDATE, com evento administrativo atômico e mínimo, sem snapshots pessoais. Histórico existe para preservar transições relevantes do vínculo, não para decorar o dashboard nem criar auditoria genérica de toda a aplicação.

Consultas delimitadas no PostgreSQL, paginação 20, count e resultados no mesmo statement, ordenação permitida/estável e busca literal. Listagem/API resumida e PDF da carteira omitem campos pessoais desnecessários. Arquivamento não apaga registros/histórico e não equivale a eliminação de dados.

PDFKit no servidor Node com fonte local licenciada permite relatório estruturado/selecionável, A4, acentos e paginação sem Python/Chromium em produção. Assets são incluídos no tracing do Next; gerar em memória e limitar a 500 registros. Fonte DejaVu específica para impressão é registrada no Design System, sem mudar a tipografia web. Nenhum provedor de documentos externo recebe dados.

Sem Stripe configurada, testes usam injeção explícita do provedor apenas em funções/processos de teste e PostgreSQL real isolado. Aplicativo Next temporário serve os componentes UI; ponte de teste encaminha APIs para handlers reais no processo controlado com sessão opaca. Não é rota, seed, ambiente pago ou bypass da aplicação de produção. Homologação Stripe externa segue pendente e separada.
