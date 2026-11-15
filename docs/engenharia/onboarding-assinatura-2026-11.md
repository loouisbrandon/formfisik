# Contratação em tela cheia

IMPLEMENTADO localmente; publicação e homologação visual externa pendentes.

O layout autenticado consulta accessFor no servidor. Para profissionais sem paidAccess confirmado, ProfessionalShell usa variante de contratação sem sidebar/topbar e sem controles dos módulos. Mantém marca, logout, monitor da sessão e área #app-content com rolagem independente. A verificação falha fechada: indisponibilidade não exibe navegação como se houvesse assinatura válida. Profissionais com trial/período pago confirmado continuam usando o shell completo.

Não é um controle de autorização por si só. Endpoints privados e páginas mantêm seus guards existentes; professionalDashboard verifica assinatura canônica e redireciona contas sem plano. Nenhuma alteração de assinatura, trial ou permissão foi introduzida; retirar elementos visuais não protege contra chamadas diretas. Stripe remoto continua bloqueado pelo gate localhost/test-only existente.

Não há migração ou alteração de dados. Testes e verificações executados registrados na entrega da conversa; não inferir homologação de segurança completa a partir desta mudança visual.
