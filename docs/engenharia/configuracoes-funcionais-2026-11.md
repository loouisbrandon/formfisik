# Configurações funcionais — relatório de06/11/2026

FormFisik independente, fundada por Brandon Louis. Evolui a central visual existente; [regras, API, pesquisa e operação](../modulos/configuracoes.md) são a referência atual.

## Entrega

Perfil profissional/CREF declarado/focos/modalidade/localidade, dados privados/CPF cifrado, foto persistente e remoção, preferências internas efetivas, troca de senha/revogação de sessões, confirmação de novo e-mail, publicação voluntária com projeção mínima, retirada e protocolos reais de privacidade. Assinatura e importação mantêm fluxos canônicos. Minha conta agrupa os formulários em seções recolhíveis, com rascunhos preservados entre áreas e aviso antes de sair da página.

Não foram implementados verificação de CREF/identidade, upload de documentos, certificação de especialidades, canal externo profissional, portabilidade universal ou eliminação automática. Solicitações de privacidade têm protocolo/estado e ferramenta operacional de análise; não representam conclusão do direito por mero registro.

## Autorizações e ambiente

O fundador aprovou link aberto mediante publicação voluntária e autorizou027 no banco local. O preflight encontrou026 de CRM pendente: sua aplicação junto à027 foi explicada e aprovada separadamente. O migrador oficial conferiu histórico/checksums e aplicou somente026/027 ao PostgreSQL local `formfisik_local_test`, em loopback. Nenhum banco de produção foi acessado e nenhum dado foi apagado.

Foi criada chave AES local independente em `.env.local`, com permissões0600, sem impressão de seu valor. O servidor local foi reiniciado e permaneceu emlocalhost:3000. O transporte de billing sintético anterior foi preservado, não introduz integração financeira real. Não foram usados documentos reais ou publicado perfil real. O smoke local autenticou a conta de teste já existente, consultou a central/health e não alterou perfil, CPF, endereço, senha, e-mail ou publicação.

## Reutilização e justificativas

Sessão opaca/locks de usuário, Argon2id, SMTP de conta, limites/CSRF/DTO privado, `ProfessionalShell`, componentes de avatar/modal, estilos compartilhados, guard de rascunho, assinatura, importações e fontes de avisos024. O perfil da pessoa foi separado da marca usada em PDFs por finalidade/visibilidade distintas. Novas tabelas limitadas à configuração própria, tentativas de e-mail, protocolos e auditoria mínima; nenhum novo provedor/dependência.

O shell consulta somente existência/versão da foto, sem carregar cadastro privado em todas as páginas. A leitura inicial duplicada do frontend foi reduzida a uma resposta efetiva de configurações compartilhada pela central e pelo avatar; a tentativa obsoleta de Strict Mode é abortada. Leituras de notificações acrescentam uma pequena consulta de preferências por proprietário, sem cache de conteúdo privado e sem tocar fatos de origem. Bancos locais anteriores mantêm o comportamento padrão enquanto a migration não for autorizada.

## Arquivos do escopo

- `db/migrations/027_professional_settings.sql`.
- `src/server/settings/{repository,handlers,email,public,identity}.ts`.
- `src/modules/settings/{area,functional,confirm-email}.tsx`, `schema.ts`, `settings.module.css`; recorte anterior reaproveitado.
- `src/app/api/settings/**/route.ts`, `src/app/api/professionals/[id]/avatar/route.ts`, `src/app/profissionais/[id]/page.tsx`, `src/app/(auth)/confirmar-alteracao-email/page.tsx`.
- `src/app/(app)/layout.tsx`, `src/modules/professional/shell.tsx`, `src/components/layout/{sidebar,topbar}.tsx`: foto mínima no shell.
- `src/server/mail.ts`, `src/server/communication/{notifications,queries,repository}.ts`: confirmação e preferências, preservando alterações anteriores de Comunicação.
- `scripts/settings-privacy.ts`, `scripts/cleanup.ts` (tokens expirados), `tests/settings.test.ts`, `tests/settings-e2e.ts`, tutoriais/asserção editorial correspondente.
- `.env.example`, `package.json`, `next.config.ts`, `eslint.config.mjs`; ignorados no lint somente diretórios gerados de testes, já ignorados no Git.
- Módulo/relatório, Design System, índice, inventário de produto/privacidade, roadmap e CHANGELOG. Alterações preexistentes de CRM, Comunicação, Financeiro, Agenda e outros módulos foram preservadas, sem reset ou commit.

## Evidências

- Regressão em banco descartável: **87/87 passaram**, abrangendo Configurações5, autenticação, cadastro, recuperação, Comunicação, navegação/dashboard e tutoriais. Log: `test-results/settings-functional/regression.log`.
- Validação de CPF inválido/repetido e CREF/UF/foco; autorização, CSRF, propriedade, versão409, senha atual, cifra/máscara, upload inválido, foto de outra conta404, protocolos idempotentes e revogação de sessões.
- SMTP local controlado: e-mail permanece inalterado até confirmar, link único consumido, sessões revogadas e replay negado. Não comprova entrega por provedor externo.
- Publicação controlada: opt-in obrigatório, DTO sem dados privados e retirada na edição. Preferências ocultam avisos canônicos da Agenda sem alterar compromissos.
- Chrome com APIs reais em harness Next/PostgreSQL descartável: persistência após reload, publicação/acesso anônimo/retirada, upload/remoção, sete seções, claro/escuro,1440/768/320px e Axe. Evidências `test-results/settings-functional/browser-proof.json` e screenshots adjacentes. Versão final aprovada também para os grupos recolhíveis, texto200% e altura500px. O harness foi corrigido para compilar as utilities Tailwind da aplicação; o teste verifica sidebar oculta em320/768px e arquivo acessível oculto corretamente.
- `npm run lint` e `npm run typecheck`: passaram na execução final.
- Build de produção isolado webpack em `/tmp` para preservar o servidor: passou. **227 arquivos públicos examinados, zero canários** de HMAC/SMTP/chaveCPF. Confirmado novamente após a organização dos formulários e últimos ajustes. Artefato `build-proof.json` registra o diretório efetivo.
- Smoke do projeto local: login200, Configurações/API200 e health200, sem erro de runtime. `local-proof.json` e `local-live.png`.

## Limites e decisão

**GO local controlado:** checks finais aprovados, migrations autorizadas aplicadas, projeto em execução e smoke200. Não é homologação de leitor de tela real/dispositivo físico ou parecer jurídico. SMTP externo, CREF, identidade real, bases/retenções aprovadas, canal/responsável de direitos e backup/rotação/recifragem da chave precisam de evidência operacional antes de dados reais. Exportação é parcial, CPF não é retornado completo e pedidos de eliminação exigem análise/preflights016. Sem deploy ou commits automáticos. Produção/dados reais: **NO-GO015 preservado**.

## Fechamento

Regressão87/87, cinco testes de Configurações repetidos após as últimas mensagens de validação5/5, Chrome funcional/Axe nos dois temas, texto200%/altura reduzida, lint, TypeScript e build efetivo aprovados. Scan final227 arquivos públicos/zero canários; somente uma resposta inicial efetiva de configurações. Smoke real local repetido: login, API e health200. Sem publicação de perfil real, alteração de documentos reais, deploy ou commit. Produção permanece NO-GO nos limites registrados.
