# Auditoria de integrações — 016

Leitura de configuração, gateway, handlers, store/locks, service, lifecycle, status e management Stripe; adapter, handlers, normalização e repository de fotografias. Regressões SQL/criptográficas e navegador são registradas no relatório016. Nenhuma chamada aos serviços financeiros/objetos reais, criação de recurso ou configuração de credencial.

## Billing SaaS

| Verificação | Implementação/evidência local | Resultado e limite |
| --- | --- | --- |
| Oferta/trial/cartão | `plan.ts`, `startCheckout` e captura de argumentos no provedor controlado | BRL13990/mês,30 dias, cartão sempre; parâmetros nunca vêm do cliente |
| Customer/associação | Metadata, client_reference_id, UUID de conta, lock por usuário | IDs/preço/produto/cliente validados no servidor, sem associação por URL |
| Idempotência/trial único | Chaves persistidas, índice de tentativa pendente, `trial_used_at`, bloqueio de tentativa incerta antiga | Testes repetidos/concorrentes, timeout/retry sem duplicar trial |
| Estados de assinatura/fatura | `loadSnapshot` e `persistSnapshot`; consulta canônica pelo gateway | Ativo exige fatura paga cobrindo período/preço; trial precisa método inicial; pendência/inadimplência não concede acesso |
| Renovação/recusa/cancelamento | `management`, limites e alvo persistido, política sem carência | Testes de regularização e cancelamento sem renovação/reembolso automático; não há cobrança real |
| Portal | Configuração/cliente/return_url conferidos, destino HTTPS exato | Gateway controlado, indisponibilidade quando falta configuração; não coletar cartão na FormFisik |
| Webhook | SDK oficial, assinatura/timestamp/corpo bruto; agora limite256KiB/deadline15s | Token/credencial fora do browser; evento inválido/live/Connect recusado; teste antes/depois do stream lento |
| Deduplicação/reordenação | `stripe_event_id` e lock, novo fetch canônico em vez de confiar na ordem/payload | Repetição/concorrência/evento antigo não restaura estado indevido |
| Conciliação/indisponibilidade | `reconcileUser` e CLI existente, sync_state e freshness | Falha fecha acesso; estimativa de próxima fatura não autoriza; cron real não provisionado |

Stripe não garante ordem e pode repetir entregas; por isso o evento funciona como sinal para buscar fatos canônicos, com dedupe persistido. [Fonte oficial de webhooks](https://docs.stripe.com/webhooks). A aplicação continua síncrona/limitada, sem fila externa; medir carga e latência de webhook no ambiente autorizado antes de produção. Retentativa do provedor e reconciliação existentes não equivalem a fila provisionada.

**Não homologado externamente:** Checkout hospedado/cartões de teste/autenticação adicional/Test Clocks/renovação/Portal/listener reais. Configuração local verificada apenas por presença sem imprimir valores: não havia chave Stripe de teste/preço. Guardas local/test-only preservadas. Stripe Connect continua somente futuro Marco020, rejeitado pelo webhook SaaS.

## Cloudflare R2 e arquivos privados

| Verificação | Implementação/evidência local | Resultado e limite |
| --- | --- | --- |
| Configuração | Endpoint HTTPS derivado de conta/bucket, região auto, credencial explícita | Ausência/formato inválido retorna indisponível; não se presume bucket/contrato/permissão |
| PUT/GET/DELETE | Mesmo `R2PhotoStore`/`PrivatePhotoStore`; testes com store privado controlado | Retry, substituição, remoção, falha após PUT, órfão e revogação/inflight revalidados |
| URLs/TTL | Não há URL pública nem URL R2 assinada entregue ao cliente | Download é proxy autenticado que reautoriza; TTL de sessão/PDF não é validade de URL assinada de storage |
| Isolamento | Owner/vínculo/autorizações, keys opacas, revalidação após I/O | Outro profissional/aluno não acessa bytes; ledger é só de operador |
| Conteúdo | Magic bytes/Sharp JPEG-PNG-WebP estáticos,5MiB/24MP/6000px; reencode JPEG até3MiB | EXIF/rotação, animação/inválido/limites revalidados, sem SVG/URL remota |
| Remoção/retentiva | Worker013 e triggers014; fila016 independente dos pais apagados | Sem sucesso em DELETE falho; repetição diária e janela técnica; cópias/backups reais não homologados |

A consistência de DELETE não elimina a possibilidade de um PUT concorrente terminar depois. A fila mantém tombstones e repete a remoção; confirmar configurações reais de bucket e caches antes de uso. [Modelo de consistência oficial R2](https://developers.cloudflare.com/r2/reference/consistency/). Não introduzir cache público para arquivos privados.

**Não homologado externamente:** credenciais/bucket/políticas/negação de acesso público/PUT-GET-DELETE/recuperação reais, localização/versionamento e ciclo de backups. Nenhum bucket, credencial ou CORS público foi criado. Ausência de configuração foi preservada na UI; figuras geométricas dos testes não são fallback de produção.

## SMTP e hospedagem

SMTP real de loopback cobre cadastro/recuperação nos testes. Não havia SMTP configurado no ambiente local para homologação externa; domínio, TLS, SPF/DKIM/DMARC, entregabilidade e política de tracking permanecem pendentes. Railway não foi acessado/provisionado; HTTPS público, IP confiável, segredos, alertas, agendas e backup requerem autorização e configuração futuras. Nenhum GO externo é concedido por este arquivo.
