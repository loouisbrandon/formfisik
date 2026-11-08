# Administração do sistema — papel admin

Estado em 08/11/2026: role IMPLEMENTADA no schema e confirmada no banco local; atribuição de administrador, painel e permissões globais NÃO IMPLEMENTADOS nesta entrega.

## Definição e escopo atual

`users.role = 'admin'` identifica o administrador geral/dono do sistema FormFisik. Esse papel é distinto de profissional, aluno e moderador de exercícios. A intenção de produto é administrar o sistema inteiro; habilitar cada operação administrativa, seu acesso a dados e auditoria exige a implementação explícita dos respectivos controles no servidor.

A migration `001_professional_registration.sql` já aceita `professional`, `student` e `admin`. Não alterar a migration histórica nem criar outra equivalente. Sessões leem o papel atual de `users` no servidor; não existe elevação por query string, props ou armazenamento do navegador. O cadastro público permanece estrito, sem `role`, `isAdmin` ou `permissions`, e a criação pública usa o default profissional.

Nesta etapa não há bypass de assinatura, isolamento de propriedade ou capacidade de moderação. Os guards existentes permanecem intactos; portanto a existência do valor admin não equivale a acesso global já funcional. Não atribuir automaticamente o papel ao primeiro cadastro nem promover uma conta por e-mail presumido. A conta concreta do proprietário e o fluxo controlado de atribuição serão definidos em entrega posterior, com identidade confirmada, auditoria e regressão de autorização/revogação.

## Evidências e limites

Consulta somente de leitura ao banco local confirmou a constraint contendo admin e zero contas com esse papel. Nenhuma conta foi criada/promovida; sem migration, envio de e-mail ou deploy. Teste `tests/admin-role.test.ts` verifica que cadastro válido continua aceito pelo schema e tentativas de autoatribuição administrativa são rejeitadas. Esta verificação não homologa privilégios administrativos ou produção. O NO-GO015 permanece.
