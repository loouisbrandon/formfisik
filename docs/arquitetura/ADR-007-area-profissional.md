# ADR-007 — Shell profissional e autorização do dashboard

Decisão: layout autenticado compartilhado em `(app)` com navegação única e conteúdo do dashboard condicionado pelo servidor ao serviço financeiro existente. FormFisik permanece empresa independente. Não alterar mecanismos de sessão/Stripe nem criar tabelas operacionais sem módulo real.

Login retorna `/dashboard` para profissionais, destino estático que não depende de disponibilidade comercial para autenticar. Página valida sessão e entitlement separadamente. Conta e assinatura ficam fora da exigência paga para permitir regularização. Layout não substitui os guards de página/API devido à persistência de layouts em navegação Next.

Dashboard service recebe identidade somente do servidor; handler lê cookie e ignora parâmetros de identidade. Injeção opcional de BillingGateway segue padrão existente, exclusivamente por chamada explícita de testes; nenhuma rota recebe esse parâmetro. Falhas removem autorização; limite persistente contém consultas repetidas ao provedor.

Substituir Sidebar/Topbar de protótipo elimina links quebrados e busca fictícia. Preservar primitives, fontes, tokens, LogoutButton e SessionStatus. Indicadores e atividades têm contratos pequenos, retornando arrays vazios até fontes reais existirem. Sem abstração genérica de módulos, sem sistema de eventos paralelo.

Sem chaves Stripe, validar acesso pelo serviço real com PostgreSQL isolado/provedor controlado e renderizar os componentes em harness Next temporário para revisão visual. Não adicionar bypass, rota de demonstração ou flag paga à aplicação. Limite: E2E visual autorizado não homologa Stripe hospedada. Acesso manual exige configuração de teste e assinatura real elegível.
