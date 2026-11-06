# Privacidade e retenção — Financeiro profissional 020

FormFisik independente fundada por Brandon Louis, sem presunção de constituição jurídica formalizada. Avaliação técnica local, não declaração de conformidade jurídica. Produção/dados reais continuam NO-GO.

## Inventário específico

| Dados | Finalidade / acesso | Persistência e retenção |
| --- | --- | --- |
| Vínculo profissional-aluno-contratação, versão, valor, BRL, datas, ciclos/estado | Preparar obrigações e impedir duplicidade; profissional proprietário com sessão e SaaS autorizados | finance_agreements/charges e backups; não duplicar prontuário, serviços ou planos |
| Referência opaca de conta/provedor, aptidões, códigos de requisitos/capacidades | Direcionar operações ao recebedor certo; somente servidor, flags mínimas no painel | finance_accounts; sem documentos KYC/CPF/PAN/CVV/dados bancários |
| Pagamento externo, meio, valor, data, referência/nota/conferência | Declaração administrativa, correção e prestação de contas pelo profissional | Recebimentos imutáveis e substituições/invalidações; não enviar nota ao Stripe nem logar |
| Evento mínimo, intenção/comando privado, chave/digest, objeto/conta do webhook e tentativas | Auditoria, retry, idempotência, concorrência e rastreio | finance_events/operations/webhooks; sem payload bruto, URL temporária ou segredo; comando original somente servidor |
| Valor/estado/data de repasse e taxas/líquido observados | Diferenciar recebimento/disponibilidade/repasse, identificar divergências | DTO sem conta bancária, sem atribuir operações da conta a aluno errado |

Profissional é prestador do serviço; responsabilidades como controlador/operador, compartilhamento Stripe, termos, exercício de direitos, menores/PF/PJ e bases aplicáveis exigem revisão específica. A arquitetura não fixa classificação jurídica. No modelo recomendado, coleta de KYC e cartão ocorre no processador hospedado. Informar transparência e responsabilidades antes de operação real.

## Retenção e eliminação

Não foi inventado prazo fiscal universal nem retenção perpétua como política aprovada. Financeiro exige triagem de conservação, finalidade, acesso, contabilidade, litígios e direito do titular. A política precisa definir responsáveis, revisão, descarte/anônimização cabível e tratamento em backups.

Worker 016 identifica finance_agreements do vínculo ou finance_accounts do profissional e marca financial_retention antes de eliminar fontes 019/aluno. Essa proteção evita apagar evidências por cascata administrativa; não comprova atendimento integral de eliminação financeira. Replay após restore observa o mesmo bloqueio. Pedidos sem dependência financeira mantêm comportamento anterior. Runtime não tem DELETE em tabelas financeiras; correção é append/invalidação auditada.

Intenções rejeitadas também podem conter referência/nota mínima e precisam de política de expurgo autorizada. Não usar notas livres para documentos, saúde ou dados bancários. Revisão semântica de texto não foi implementada; limites e orientação não eliminam esse risco.

## Proteções e pendências

Owner no servidor, FKs compostas, respostas mínimas, detalhe sob demanda, paginação/período, no-store/no-referrer, logs estáticos sem cartão/credencial. Webhook tem assinatura própria e conta conhecida. Sem credenciais novas ou contatos externos. Homologar IAM/grants/TLS/secret rotation, backup/ledger/cifragem, monitoramento, direitos/retentiva e operação Stripe antes de dados reais. [Módulo](../modulos/financeiro-profissional.md) e [ADR](../arquitetura/ADR-021-financeiro-profissional-connect.md).

## Projeções e exportação gerencial — 06/11/2026

Nova listagem de recebimentos contém nome, plano, valor, data, origem/método e conferência, sem observações/referências privadas. CSV limitado1000 e período367, proprietário autenticado/autorizado e filtros aplicados no servidor; gerado para download local, sem artefato público ou persistência de exportação. Fórmulas de planilha são neutralizadas. Finalidade: controle financeiro do prestador, sem consulta clínica, pontuação ou bloqueio de aluno. Mantidas retenção/bloqueios020/016 e separação SaaS; arquivo exportado fica sob guarda do profissional. Não reutilizar comprovantes/media clínica para upload financeiro sem política e controles próprios.
