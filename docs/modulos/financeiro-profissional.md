# Financeiro profissional — Entrega 020

FormFisik independente fundada por Brandon Louis. Estado: domínio local implementado; provedor controlado nos testes; Stripe Test Mode externo, operação e produção NÃO HOMOLOGADOS. [Decisão Connect e fontes oficiais](../arquitetura/ADR-021-financeiro-profissional-connect.md).

## Finalidade e limites

Organizar recebimentos do aluno por serviços do profissional, reutilizando contratação/versionamento/preço de 019. Não alterar Billing SaaS (Pro R$ 139,90/mês, trial 30 dias/cartão). A aplicação não processa cartão, KYC ou dados bancários, nem cria recursos externos nesta entrega. Transporte Stripe externo permanece bloqueado e ainda requer implementação/validação da configuração escolhida; contratos locais não equivalem a integração externa completa.

## Configuração e valores

Uma configuração financeira por contratação canônica, inclusive após cancelamento: previne recriação silenciosa de dívida. Configurar outra contratação exige acordo administrativo explícito. Somente profissional proprietário, confirmado/habilitado e com SaaS autorizado. Preparação exige aluno ativo, acordo ativo, preço positivo e término não passado, com versão atual. Aceita início futuro como preparação administrativa; checkout não ativa acesso ao serviço.

Preço total inteiro BRL vem do snapshot 019, sem override frontend. Duração e periodicidade são independentes. Modos: único via provedor, recorrência finita, externo único e parcelas externas. Cycles 1..120; intervalos 1/3/6/12 meses; parcelas devem caber na vigência; único exige 1. Datas civis São Paulo, aniversário ajustado ao fim do mês. Parcelas externas repartem resto em centavos nas primeiras; recorrência exige divisão exata. Não criar novo trial ou cobrança automática além do total/vigência. Não é parcelamento de cartão.

## Cobrança e execução controlada

Configuração: prepared → pending → active → canceled/ended; cancel_pending conserva resultado externo incerto. Obrigações: prepared/open/paid/failed/canceled/refunded/disputed, com valores pagos/reembolsados/contestados explícitos. Vencida é projeção da data/saldo, não perda de dados. Recebimento externo integral produz projeção manual_recorded ou manual_reconciled; parcial mantém saldo restante. Conferência manual não é Stripe. Não marcar pagamento no retorno do checkout.

Conta conectada: ausência, pendência, habilitação ou restrição; recebimento e payout separados; requisitos/capacidades mínimos. Não permite associação arbitrária de ID enviado pelo frontend. URLs hospedadas somente HTTPS nos hosts Stripe permitidos, com abertura confirmada. Links temporários não são gravados como resultado durável. Reenvio de checkout já confirmado consulta link por referência e não cria outra operação financeira.

Recorrência controlada registra assinatura profissional independente e ciclos finitos; eventos de falha/recuperação atualizam fatos, preservando 019 e treinos. Renovar 019 cria novo acordo, sem débito automático. Cancelamento financeiro cancela obrigações futuras não pagas, preserva recebimentos e acordo. Não habilitar segundo checkout para substituir tentativa incerta. Cancelamento com checkout de resultado desconhecido é bloqueado até retomar a intenção original e recuperar referências; não declarar cancelamento local enquanto a cobrança externa pode existir.

## Pagamentos externos e correções

Registro por obrigação externa: valor positivo até saldo, data não futura, meio pix/bank/cash/other, referência 120, nota 500, conferência explícita. Não usar campos para documentos bancários/dados sensíveis. Correção exige motivo mínimo 5, invalida logicamente o anterior e insere substituto vinculado na mesma transação; erro reverte ambos. Invalidação mantém conteúdo original e justificativa. Sem DELETE financeiro pelo runtime. Configuração cancelada não aceita novos recebimentos/correções; invalidação de registro incorreto continua disponível. Registrar recebimento tardio após cancelamento demandará política/fluxo específico; não inventar estorno externo como reembolso Stripe.

## Conciliação

Webhook assinado ou refresh autorizado consulta snapshot canônico com escopo de conta. Valida identificadores conhecidos, propriedade, assinatura vinculada, moeda BRL, total esperado, limites pagos/reembolsados/contestados e datas. Eventos repetidos são deduplicados; atrasados consultam estado atual. Falhas permanecem pendentes, com tentativas e recuperação explícita. Não persistir payload bruto.

Taxa e líquido desconhecidos são null e contados como pendência. Líquido divergente da relação simplificada pago menos reembolso menos taxa aciona revisão; ajustes de saldo/disputa podem exigir explicação legítima e não são corrigidos automaticamente. Reembolso parcial/integral é intenção idempotente; disputa bloqueia novo reembolso administrativo até revisão. Reversões/encerramento de disputa são observações posteriores do provedor, sem transferência manual.

Direct Charges não exige transferência da plataforma ao recebedor. Repasses são fatos separados por conta/data/estado, sem dados bancários; podem conter outras operações da conta e não são atribuídos indevidamente às cobranças FormFisik. Pagamento confirmado não prova disponibilidade ou liquidação no banco.

## Dashboard, listas e navegação

`/financeiro` no ProfessionalShell compartilhado: resumo, cobranças, preparação, conta, repasses, histórico, eventos e operações pendentes. Filtros em memória privada, sem Web Storage. Listas/contratos/correções/eventos/intenções 20 no SQL, ordenação estável e contagem separada; página vazia permanece explícita. Pesquisa de aluno limitada a 100 caracteres; leituras abortáveis e debounce 200 ms. Períodos com até 367 datas; não buscar histórico inteiro para ocultar frontend.

Recebimentos são por data de pagamento; pendentes/vencidos por vencimento; valor de acordos por início, sem somar total por parcela. Reembolso/taxa/líquido exibem posição atual da coorte recebida no período, não movimento contábil datado do estorno. Manual registrado/conferido é mostrado separado, sem somar duas vezes. Totais SQL bigint são transportados como strings decimais e formatados sem perda de precisão. Comissão não definida; zero cobrança de comissão nesta entrega, sem inventar tarifa do processador.

Formulários progressivos, confirmação explícita, foco em feedback, erros/retry preservando dados e chave, aviso de saída, ações desabilitadas em gravação. Paginação preserva contrato selecionado/rascunho. Documentar melhorias antes de refatorar outros módulos.

## Segurança e retenção

[API](../engenharia/api-financeiro-profissional.md), [privacidade](../privacidade/financeiro-profissional.md), [runbook](../operacao/financeiro-profissional.md). Origin/session/entitlement, rate, owner e FKs compostas; eventos públicos somente com assinatura. Intenções preservam comando mínimo para retomada após reload; digest impede trocar dados sob mesma chave. Nenhuma variável seleciona provedor simulado no app. Testes possuem DI explícita.

Histórico financeiro impede expurgo 016 do vínculo e da conta com domínio financeiro; não existe prazo legal presumido nem exclusão silenciosa. Revisar necessidade/retentiva e implementar eliminação financeira cabível depois de aprovação. Sem dados reais ou GO produtivo.

## Redesign e autonomia — 06/11/2026

Diretriz definitiva: recebimento externo sem comissão FormFisik e sem necessidade de Stripe; processamento integrado opcional; inadimplência do aluno não bloqueia módulos/vínculo automaticamente. Pro independente. Nova UI reúne origens identificadas, dashboard, cobranças, recebimentos paginados/exportáveis, planos via catálogo019, repasses, histórico e configuração/recuperação. Nova cobrança em drawer, primeiro vencimento dentro da vigência, valor do acordo preservado. [Auditoria, arquitetura e validação](../engenharia/refinamento-financeiro-2026-11.md). Controle integrado continua condicionado; não há simulação na carteira normal.
