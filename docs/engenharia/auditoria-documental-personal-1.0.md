# Auditoria e consolidação documental — Personal 1.0

Referência: 01/11/2026, horário de São Paulo. Escopo exclusivamente documental autorizado pelo fundador. Não corresponde ao fechamento da Entrega 015 nem à execução do marco 016.

## Método e limites

Leitura da solicitação anexada, AGENTS.md, estrutura documental, relatórios 001–014 (incluindo 006.5/011.5) e estado provisório da 015; confronto com árvore de páginas/APIs, migrations e código de identidade, autorização, assinaturas, carteira, exercícios, treinos, avaliações, fotografias e documentos. Inspeção estática de guards, predicados de proprietário, referências relacionais e adaptadores. Histórico Git consultado: HEAD inicial `3c8a9f8a4b9f924f420a35738dbb9cb35d4da7c5`; entregas recentes também existem como trabalho não commitado, portanto o log Git sozinho não representa o inventário atual.

A linha de base SHA-256 foi capturada antes da primeira edição desta tarefa. O checkout já continha alterações e arquivos não rastreados das 014/015. A comparação considera esse estado inicial, e não apenas `git diff HEAD`. Não foram lidos valores de credenciais, conectados provedores, consultados bancos ou feitos scans externos. Afirmações sobre disponibilidade do Connect no Brasil foram deliberadamente deixadas como validação futura; não houve pesquisa jurídica, financeira ou de provedores nesta tarefa.

Revisão de código não prova segurança integral, schema instalado ou homologação. Testes unitários, de integração, navegador, build, canários e acessibilidade não foram reexecutados: o escopo não altera runtime, e a 015 registra revalidação ainda em andamento. Resultados de suas suítes são atribuídos aos relatórios originais, sem promover resultado provisório a conclusão.

## Documentos criados

- [Índice oficial](../README.md).
- [Ecossistema e estratégia](../estrategia/ecossistema-e-especialidades.md).
- [Definição/aceite Personal 1.0](../produto/personal-1.0.md).
- [Inventário funcional](../produto/inventario-funcional.md).
- [Arquitetura atual e evolução](../arquitetura/visao-atual-e-evolucao.md).
- [ADR-016](../arquitetura/ADR-016-especialidades-e-dominios.md).
- Este relatório e o [manifesto de evidências](evidencias-consolidacao-documental.json).

## Documentos atualizados

- AGENTS.md: referências oficiais e regras de especialidades, reutilização, estados e separação financeira, preservando instruções anteriores e bloco Next.js.
- README.md: entrada para documentação oficial e esclarecimento de indicadores/módulos atuais versus histórico da 007.
- Diretriz institucional: missão, visão, valores e posicionamento próprios, preservando independência e cautela sobre formalização jurídica.
- Modelo de negócio: separação SaaS/profissional, preferência Connect condicionada, recebimentos externos e visão do praticante; Pro e políticas atuais preservados.
- Roadmap: marcos 015–030, dependências e critérios de saída; texto anterior integralmente mantido na seção histórica.
- Política de desenvolvimento: foco por especialidade, reutilização e homologação completa.
- Módulo de acompanhamento: esclarecimento da exportação opcional de fotos na 014; limitações da 013 continuam históricas.

## Documentos preservados

Esta tarefa não escreveu nos demais documentos existentes, incluindo relatórios 001–015, ADRs 001–015, APIs, Design System, catálogo e runbooks de segurança/privacidade/operação. A comparação detectou edições concorrentes em `docs/engenharia/entrega-015.md`, `docs/seguranca/requisicoes-frontend.md` e `docs/seguranca/superficies-e-endpoints.md`; foram preservadas sem reversão. A alteração no módulo de acompanhamento esclarece evolução já implementada, sem redefinir contrato ou regra. Os hashes do manifesto identificam individualmente o conjunto inalterado e as diferenças concorrentes observadas. Não houve exclusão de documento nem reescrita dos achados em andamento da 015.

## Inventário e conclusão funcional

O [inventário canônico](../produto/inventario-funcional.md) contém finalidade, valor, evidências, documentos, dependências, limitações, operação e reutilização por módulo. Implementação local confirmada por inspeção: identidade/acesso/recuperação; oferta e Billing SaaS de teste; shell/dashboard; carteira; catálogo/particulares/moderação; prescrição/modelos/versionamento; PDFs de treino; avaliações/peso/medidas/gráficos/comparações; fotos/calendário/remoção; relatórios físicos Compacto/Premium.

Stripe e R2 estão preparados no código, com homologação externa pendente. Segurança operacional é parcial e 015 está EM AUDITORIA. Não existe evidência de Personal 1.0 homologada ou produção liberada. Anamnese, Kanban, contratos/consultorias, financeiro profissional, agenda, check-ins, multimídia, comunicação, importação de alunos, equipes, produtos digitais e app do aluno não têm implementação funcional localizada. Inteligência comercial tem apenas parte inicial em contagens do dashboard.

## Divergências e resolução

| Divergência | Evidência e resolução documental |
| --- | --- |
| Documentos antigos descrevem módulos como futuros | Relatórios representam seu momento; implementações posteriores 008–014 superam previsões. Preservar histórico e usar inventário como estado atual |
| Roadmap dizia exportação premium futura enquanto 011/014 já existem | Nota explícita no histórico e inventário atual; não apagar relatórios nem tratar PDF como futuro |
| README ainda mencionava ausência de módulos antecipados na área profissional | Esclarecido que dashboard atual usa contagens persistidas; a 007 não antecipou essas entregas |
| Módulo de acompanhamento dizia não inserir fotos em PDF | Limitado ao escopo da 013; referenciada autorização adicional da 014 já presente no código |
| Empresa ampla versus produto inicial de musculação | Estratégia multiesporte separada de Personal 1.0; nenhuma modalidade futura apresentada como implementada |
| `users.role` prevê aluno, mas carteira não cria acesso | Migrations 001/006 e sessão: role único e registros privados; identidade multipapel/vinculação mobile são evolução, sem união por e-mail |
| Stripe SaaS interpretável como financeiro dos alunos | `subscriptions/` e webhook SaaS não implementam Connect; separar domínios e manter validação Brasil pendente |
| Testes anteriores aprovados versus 015 em andamento | Relatório 015 é provisório; manter EM AUDITORIA e NO-GO, sem substituir sua revalidação |
| Arquivos de migration existentes versus banco efetivo | Nenhuma consulta ao banco realizada; existência de SQL não comprova aplicação em ambiente alvo |

Não foi encontrada classificação societária atual da FormFisik como parte da Onebase nos documentos inspecionados; as referências existentes de independência foram preservadas. A constituição jurídica não foi presumida.

## Roadmap e decisões

[Marcos 015–030](../planejamento/roadmap.md): segurança → estabilização → anamnese → CRM → serviços → financeiro profissional → agenda → feedback → multimídia → comunicação → inteligência comercial → importação → equipes → produtos digitais → Connect → homologação. A tabela detalha pré-condições e permite pesquisa/contratos futuros sem antecipar implementação. Equipes e produtos digitais são expansões dispensáveis ao lançamento individual; o app do aluno permanece requisito da Personal 1.0 completa.

Dependências centrais: 015/016 sustentam uso seguro; carteira e identidade sustentam 017/018/026; serviços 019 sustentam cobranças 020 e agenda 021; eventos e dados operacionais sustentam 022/024/025; 029 integra o lado do aluno e reutiliza backend; 030 reúne a matriz de 16 capacidades e os gates transversais. Não se impôs prazo ou limite artificial de operações internas.

ADR-016 registra independência, consolidação por especialidade, reutilização sem abstração especulativa, identidade multipapel futura, separação financeira, backend compartilhado com mobile e homologação baseada em evidências. Não modifica as decisões implementadas nas ADRs anteriores.

## Riscos e decisões do fundador

- **Bloqueio atual:** NO-GO da 015, em especial FF015-11, eliminação/portabilidade, restore, retenção, IAM/grants, operação e canais não comprovados. Esta tarefa não corrige nem reduz a severidade desses achados.
- **Integrações:** Stripe/R2/SMTP e migrations exigem revisão e homologação autorizadas; não ativar serviços ou coletar dados reais pela existência de código local.
- **Identidade:** planejar vínculo legítimo do aluno e múltiplos papéis antes do 029; migração indevida pode expor carteiras/dados sensíveis.
- **Financeiro profissional:** fundador precisa decidir taxas, responsabilidades por disputas/reembolsos/repasses e recebimentos externos após validar modelo Connect Brasil e contratos aplicáveis.
- **Privacidade e operação:** aprovar responsáveis, canal, identificação jurídica aplicável, bases/finalidades e retenções com apoio competente; independência empresarial não resolve formalização nem conformidade.
- **Qualidade:** definir metas de desempenho, amostra/duração do piloto, responsáveis e evidências de aceite antes da homologação; homologação técnica profissional do catálogo continua pendente.
- **Escopo:** confirmar tecnologia mobile no 029, dispensabilidade de equipes no lançamento individual e validação comercial de produtos digitais; eventual nova modalidade antes do aceite requer exceção estratégica expressa.

As definições estratégicas expressas nesta solicitação já foram registradas; esses pontos pendentes não interromperam a consolidação documental.

## Verificação e preservação

O manifesto compara hashes iniciais/finais de todos os arquivos preexistentes inventariados e lista adições documentais. Código de produção, scripts, configurações, lockfile e migrations permaneceram idênticos à linha de base na comparação realizada. `tests/e2e.ts` mudou concorrentemente, sem escrita por esta tarefa; essa diferença e as três diferenças documentais da 015 estão identificadas no manifesto. Não se afirma que todo o checkout permaneceu idêntico. A comparação inclui arquivos não rastreados da 014/015. O HEAD permaneceu igual. Arquivos ignorados de evidências/ambiente não foram alterados por esta tarefa; não se executou comando de aplicação ou limpeza de ambiente.

Validação documental: resolução de links relativos nos Markdown criados/alterados, existência das evidências de código referenciadas e revisão de consistência entre estados/roadmap/aceite. O manifesto registra contagens e eventuais links preexistentes fora do escopo; ele não certifica testes de produto. Não houve teste simulado apresentado como homologação.

**Esta tarefa não realizou implementação, alteração de regras de negócio, schema, aplicação de migration, configuração de integração, deploy, commit ou alteração de credenciais.** Foram escritos apenas Markdown e o manifesto JSON documental, além de scripts temporários de auditoria em `/tmp`.

Resultado da validação desta tarefa: **192 links relativos verificados em 14 documentos Markdown criados/alterados, zero destino ausente; 7 documentos preexistentes atualizados e 8 artefatos documentais criados (incluindo este relatório e o manifesto)**. Comparação da linha de base: 391 arquivos idênticos; quatro diferenças concorrentes identificadas no manifesto. Marcos 015–030 presentes e evidências centrais de código existentes. Não foram reexecutados testes de runtime.
