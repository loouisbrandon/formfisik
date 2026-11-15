# Inteligência de negócio — Marco 025

FormFisik é uma empresa independente fundada por Brandon Louis; independência não presume constituição jurídica. Estado desta implementação depende do [relatório verificável](../engenharia/entrega-025.md). Produção permanece NO-GO.

## Jornada

`/indicadores` exige sessão opaca, e-mail confirmado, profissional habilitado e assinatura SaaS autorizada. API revalida tudo. Visão executiva mostra três indicadores por área e oferece abertura explícita dos demais. Filtros civis De/Até, até 367 datas inclusivas, preservados na memória privada do shell. Comparação automática com intervalo imediatamente anterior de igual número de datas; ano bissexto é tratado por datas civis. Nenhum cache compartilhado ou armazenamento web de dados privados.

Grupos: carteira; comercial/consultorias; financeiro; agenda; acompanhamento. Cada métrica oferece definição, unidade, escopo e referência ao módulo de origem. Posição atual não ganha comparação histórica fictícia. Zero denominador retorna null, exibido como Não calculável. Financeiro usa centavos inteiros em strings, inclusive bigint, sem perda de precisão. Gráfico de carteira com equivalente textual por data; evolução financeira diária separa fontes. Até 367 linhas agregadas na seção progressiva, nenhum cadastro individual recebido. Estados de carregamento, erro e recarregamento removem resultados favoráveis anteriores até nova confirmação.

## Fontes e semântica formal

| Grupo / métrica | Fonte e regra |
| --- | --- |
| Carteira total/ativa/arquivada | `student_links`, estado atual; ativo não significa contrato vigente |
| Novos | `created_at` no intervalo civil São Paulo com início inclusivo/fim seguinte exclusivo |
| Evolução | Cumulativo dos vínculos ainda existentes por data de criação; inclui arquivados, não reconstrói eliminados nem mede retenção |
| Acompanhamento pendente | Alunos distintos com check-in waiting vencido ou received/reviewing, inclusive arquivados; posição atual |
| Vínculos por etapa | `crm_stages` e `crm_memberships`, incluindo etapas inativas/arquivadas; não oportunidades qualificadas |
| Conversão comercial | Não calculável: etapas personalizáveis sem classificação ganha/perdida ou denominador confiável. Não inferir conversões de movimento |
| Contratos vigentes | `professional_contracts`: active e hoje dentro de starts_on/ends_on |
| Próximos de vencer | active/suspended com ends_on entre hoje e hoje+30 dias |
| Renovações | Novos acordos com previous_id explícito, criados no período; inclui rascunhos |
| Cancelamentos | Contratos distintos com evento contract_canceled no período |
| Ativações/retomadas | Eventos contract_active no período; não são vendas únicas |
| Entregas pendentes | pending/in_progress em acordos active/suspended, posição atual |
| Pendências comerciais | Tarefas CRM pending/in_progress não arquivadas, posição atual |
| Valor contratado | Preço atual dos acordos não draft com início no período, inclusive cancelados; não receita |
| Provedor confirmado | Soma paid_cents por paid_on, reutilizando `queryFinance`020; externo não homologado |
| Previsto | Nominal das obrigações não canceled/refunded por due_on, inclusive pagas; não saldo a receber |
| Emitido/referenciado | Nominal de cobranças com provider_ref por due_on, independente do estado; não pagamento |
| Pendente | Regra canônica020, saldo atual por vencimento, deduz pagamentos confirmados e declarações externas |
| Externo declarado/conferido | Regra020, recebimentos não invalidados por paid_on; conferido é subconjunto e não é somado novamente |
| Reembolso/contestação | Saldos atuais da coorte recebida no período, não movimentos por data do ajuste |
| Divergências | Posição atual das cobranças com discrepancy, não restrita ao período |
| Agenda | `queryAgenda`021 reutilizado integralmente: ocorrências que intersectam o intervalo no fuso da agenda; scheduled inclui pendentes, contagem pending é subconjunto |
| Horas reservadas | Duração de sessões não canceladas recortadas ao período, sem buffers |
| Horas disponíveis/ocupadas | Disponibilidade semanal/exceções atual menos bloqueios; interseção das reservas e buffers. Configuração atual não é reconstrução histórica |
| Ocupação | Horas ocupadas / disponíveis ×100, limitada a100 pela regra021; denominador zero=null |
| Check-ins atribuídos | Ocorrências por period_end, inclusive canceladas |
| Respondidos | Ocorrências não canceladas com resposta, correções não multiplicam |
| Pendentes/vencidos/revisão | waiting; waiting com prazo atingido; received/reviewing, respectivamente, na coorte |
| Taxa de resposta | Numerador: não cancelados com prazo atingido e resposta; denominador: não cancelados com prazo atingido, na mesma coorte. Ambos explícitos |

A comparação dos mesmos indicadores e denominadores em coortes adjacentes permite tendências operacionais; não mede adesão, execução comprovada, diagnóstico, recomendação clínica ou cumprimento contratual. Não agregar respostas, medidas, fotos, notas, nomes/contatos de alunos. Nomes de etapas continuam privados e não são anonimizados.

## Arquitetura e desempenho

Agregações SQL parametrizadas por proprietário; transação READ ONLY REPEATABLE READ fornece snapshot consistente entre módulos e períodos. Configuração de agenda ausente é lida com padrão vazio sem inicialização ou escrita. `queryFinance` e `queryAgenda` aceitam executor transacional opcional; consumidores anteriores mantêm contrato e comportamento padrão. Não duplicar cálculo financeiro/ocupação. Série diária usa agregações e janela SQL, sem N+1 por aluno/data ou carregamento de documentos individuais. Número de consultas é fixo em relação ao volume da carteira, períodos limitados a367 datas. Índices canônicos por proprietário existentes; EXPLAIN/volume registrados em evidências, sem infraestrutura analítica externa.

Não há exportação no025: mecanismos011/014 exigem aluno/prescrição/finalidade individual e não devem receber um agregado empresarial por adaptação sem contrato próprio. Consulta agregada acessível atende o objetivo; não há CSV que possa introduzir fórmulas ou download sem trilha. Exportação futura exige autorização, minimização, auditoria e proteção contra injection.

Finalidade é análise privada operacional, sem nova persistência de indicadores, snapshots ou conteúdo pessoal. Eliminação016 altera naturalmente os agregados em novas consultas; restore continua exigindo replay do ledger antes do tráfego. Não cria prazo jurídico ou substitui o inventário de retenção; nenhuma integração ou operação externa é autorizada.

## Refinamento visual — 05/11/2026

Visão executiva substituída visualmente por Visão geral, com quatro métricas: alunos ativos, contratos vigentes, pagamento confirmado pelo provedor e ocupação da disponibilidade. Não existe taxa canônica de comparecimento no relatório atual; não inferir esse indicador da referência. Abas Alunos/Comercial/Financeiro/Agenda/Check-ins preservam métricas e definições; CRM mostra etapas atuais, sem inferir funil de atendimento. Distribuição usa ativos/arquivados e total atuais, sem inventar estado em integração. Pendências reutilizam acompanhamento, check-ins vencidos e contratos próximos do fim. Filtros, comparação por períodos, autorização e consultas permanecem existentes. Sem novo endpoint, migração, dependência ou exportação.

Arquivos: intelligence/area.tsx e intelligence.module.css, professional/shell.tsx, workspace.module.css e dashboard-view.module.css. Validação visual local Chrome/Axe em320/768/1440/1672/1920/2560px e altura500, sem overflow horizontal ou violações detectadas; artefatos ignorados em test-results/local/indicators-dark-verification.json. TypeScript e ESLint verificados. Build de produção e novos testes de integração de backend não executados neste refinamento visual.
