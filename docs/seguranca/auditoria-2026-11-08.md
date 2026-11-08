# Auditoria de exposição e autenticação — 08/11/2026

Estado: auditoria local com correções; **NO-GO para produção preservado**. Escopo: aplicação web FormFisik, código atual, build de produção local e PostgreSQL descartável. Não houve deploy, commit, migração de banco existente ou operação financeira externa. O documento não representa pentest independente, certificação ou promessa de ausência de vulnerabilidades.

## Achados e correções

| Prioridade | Achado | Resultado |
| --- | --- | --- |
| Média | Operações sensíveis de configurações revalidavam revogação e validade absoluta após o lock, mas não a inatividade. Uma sessão podia ficar inativa enquanto aguardava o usuário bloqueado. | Corrigido: revalidação SQL de 30 minutos após bloqueio/verificação de senha; teste concorrente comprova 401 e ausência de gravação. |
| Média | Leituras de sessão, conta, acesso pago, estado de assinatura e avatar privado não possuíam orçamento próprio de requisições. | Corrigido por conta/minuto: sessão 120, conta 90, acesso pago 30, assinatura 90, avatar 120. Limites anteriores de login, mutações e módulos preservados. 429/no-store/Retry-After; teste de excesso de consultas de sessão. |
| Preventiva | Source maps de navegador dependiam do padrão do framework. | `productionBrowserSourceMaps: false` explícito; build inspecionado. Código JavaScript executado no navegador continua inspecionável. |
| Preventiva | Verificação de exposição precisava de comando reutilizável. | `npm run security:exposure`, com opção `-- --history`. Inspeciona valores configurados sem imprimi-los; falha se houver vazamento ou mapa público. Controle negativo sintético validado. |
| Média residual | Auditoria npm aponta 13 dependências afetadas: 11 alertas moderados e 2 baixos, em ferramentas de desenvolvimento. | Não corrigidos por downgrade/upgrade massivo automático. Runtime: zero alertas conhecidos em `npm audit --omit=dev`. Revisar minimatch/TypeScript-ESLint/ts-morph e deepmerge/shadcn em atualização específica com regressão. |
| Alta operacional pendente | Borda/WAF, limitação distribuída, transporte e menor privilégio do banco, proteção dos provedores e domínio público não foram homologados nesta execução. | Bloqueio de produção mantido; seguir controles e operação segura e NO-GO015. |

Os novos limites são contenção por conta, não proteção DDoS nem impedimento absoluto de scraping. A implementação reutiliza o contador HMAC atômico existente; não coleta IPs novos, conteúdo clínico ou credenciais em logs. O fallback de IP é compartilhado quando a borda confiável não foi configurada: não aceitar `X-Forwarded-For` arbitrário como solução.

## Exposição e limites da inspeção

- Build real Webpack com 13 valores sintéticos de configuração sensível: 281 arquivos públicos, sem correspondência e sem source map público detectado.
- Valores de credenciais locais configuradas: sem correspondência nos artefatos públicos, 855 arquivos rastreados e sete revisões Git. Valores não foram copiados ao relatório. Varredura adicional de padrões de chaves Stripe/Resend/AWS e chaves privadas: nenhum candidato nos arquivos rastreados/histórico.
- Esse resultado verifica os valores/padrões conhecidos; não prova ausência de segredos antigos rotacionados, outros formatos, credenciais em sistemas externos, backups ou logs do provedor.
- Apenas `.env.example` é rastreado; `.env.local` está ignorado. Nenhuma variável `NEXT_PUBLIC_` foi encontrada em `src`. Logs de segurança inspecionados usam códigos estáticos/UUID/status, sem corpo ou credenciais.
- Fluxos privados usam sessão, role, entitlement e propriedade no servidor; listagens paginadas e DTO mínimo. Regressões verificam isolamento entre dois profissionais e ausência de campos privados nos resumos.
- Login usa Argon2id, erro neutro, limitação e sessão aleatória opaca; cookie HttpOnly, Secure em produção e SameSite=Lax; validade absoluta 12 horas/inatividade 30 minutos. Recuperação e alterações de credenciais revogam sessões; não há JWT ou senha em Web Storage.
- Mutações exigem origem canônica/JSON limitado; SQL parametrizado, upload de imagem decodificado/reencodificado, limites de corpo/tempo e webhooks assinados foram inspecionados. Sem HTML arbitrário, eval aplicativo, CORS genérico ou TLS deliberadamente desativado encontrados em `src`.

## Requisições e conteúdo público

Inspecionados wrappers, busca e monitores de sessão/acesso: busca tem debounce de 250 ms e cancelamento de leitura obsoleta; monitores ignoram abas ocultas, evitam sobreposição, cancelam no unmount e consultam a cada 60 segundos/foco. Autorização continua no servidor. Não se removeu proteção para reduzir contagem nem se declarou ausência de todas as redundâncias sem medir cada fluxo.

A landing page, imagens de marketing e perfis voluntariamente publicados são públicos por desenho. No DevTools será possível ver HTML/CSS/JavaScript, imagens e as requisições/respostas necessárias ao usuário autenticado. Ocultar URL de endpoint, bloquear F12 ou `robots.txt` não substitui autorização. A barreira de beta discutida anteriormente ainda não foi implementada. Se a intenção é esconder também a landing e suas imagens de visitantes, essa barreira precisa de entrega própria cobrindo rotas e recursos.

Nunca publicar `next dev`: ele expõe recursos de desenvolvimento e source maps. Usar build/start e HTTPS na futura homologação externa. Bloquear `.env`, `.git`, artefatos internos e acesso direto à origem na borda; limitar corpo, conexão, duração e concorrência; WAF/bot management e alertas precisam de configuração/ensaio no provedor. Não há configuração remota de infraestrutura nesta auditoria.

## Evidências locais e reprodução

Evidências operacionais desta execução ficam em `/tmp/formfisik-security-*` e `/tmp/formfisik-production-audit/`; são temporárias, não devem ser publicadas como arquivos da aplicação. Testes usam apenas identidades sintéticas e PostgreSQL `formfisik_security_audit_test` descartável. Nunca apontar `TEST_DATABASE_URL` ao banco de desenvolvimento persistente: os testes podem truncar tabelas.

Comandos: `npm run lint`, `npm run typecheck`, build Webpack com canários, `npm run security:exposure -- --history`, testes de auth/recovery/security/settings/operational-hardening/admin-role e harness `tests/security-production-e2e.ts` com transporte Stripe controlado em loopback. As verificações de 52 rotas GET anônimas passaram, incluindo headers/no-store e exceções públicas esperadas. O harness antigo precisou ser atualizado para o rótulo Logout, confirmação e destino atual de Minha conta; falhas iniciais de seletor não foram tratadas como falhas de autorização. O teste de configuração ausente foi isolado do `.env.local`; o teste concorrente limpa snapshot estatístico ao observar locks.

## Fontes e próximos gates

[Checklist oficial Next.js](https://nextjs.org/docs/app/guides/production-checklist), [source maps](https://nextjs.org/docs/pages/api-reference/config/next-config-js/productionBrowserSourceMaps) e [OWASP Next.js](https://cheatsheetseries.owasp.org/cheatsheets/Nextjs_Security_Cheat_Sheet.html) fundamentam limites entre desenvolvimento, autorização e conteúdo público. Guias da versão instalada foram consultados antes das alterações de configuração.

Antes de publicação: encerrar os bloqueios operacionais da [015](../engenharia/entrega-015.md), homologar [controles](controles-e-operacao.md), provedores/backup/restore, remediar advisories de tooling em entrega dedicada e repetir estas verificações no ambiente final. Credencial de conta de teste fornecida em chat deve ficar restrita a ambiente sintético; provisionar credenciais individuais para beta e não reutilizar essa senha em produção.

### Resultado do navegador de produção

Harness final aprovado: build real, PostgreSQL descartável, HTTPS/Chrome reais e Stripe simulado somente em loopback. Cookie Secure/HttpOnly/SameSite=Lax, isolamento entre contas, logout confirmado, revogação e troca de identidade entre abas passaram. Zero vazamentos dos canários inspecionados, zero violações CSP e zero erros de console. Também passaram PDFs, verificações axe nas telas exercitadas e larguras 1440/768/320. Não foram habilitados os fluxos opcionais adicionais de todos os módulos do harness; isso não é homologação exaustiva do produto.

Medição das aberturas exercitadas: alunos 1 leitura de lista; exercícios 1 capability + 1 lista; treinos 1 lista; assinatura 1 leitura de estado; avaliações 1 identidade + 1 lista/resumo + 1 série de gráfico. As duas consultas de avaliações têm DTOs/finalidades diferentes, não foram consideradas duplicação apenas por compartilharem pathname. Resultados de consulta permanecem visíveis ao próprio usuário autorizado no navegador.

### Fechamento dos checks

Execução final limpa: **48 testes aprovados, zero reprovados/ignorados**, nos seis arquivos de regressão descritos acima. Lint global, typecheck, build Webpack e `git diff --check` aprovados. Aviso pré-existente de `metadataBase` no build não é vazamento de segredo; configurar a URL canônica na futura preparação do domínio.

O comando `npm run dev` passa a usar `next dev --hostname 127.0.0.1`, evitando exposição involuntária do servidor com depuração à rede local. Isso não altera o bind do serviço de produção/Railway. Necessidade de teste em outro dispositivo exige escolha explícita de rede confiável; nunca publicar o servidor de desenvolvimento na internet.

Status: **GO para as verificações locais delimitadas; NO-GO para produção**. As 13 ocorrências de tooling e os gates operacionais permanecem pendentes. Não há proteção absoluta contra cópia de conteúdo entregue ao navegador.

Teste HTTP adicional no servidor de produção: oito tentativas de obter `.env`, `.env.local`, `.git/config`, manifesto interno, código de servidor, `package.json`, pacote de dependência e source map retornaram 404. O banco descartável da auditoria foi removido ao final. O serviço PostgreSQL local existente foi apenas reiniciado para utilização normal da aplicação, sem executar migrations ou testes nele.

**Atualização posterior na mesma data:** os 13 alertas de tooling registrados acima foram resolvidos na [remediação](remediacao-2026-11-08.md), que também amplia as correções de sessão e valida os grants preparados. As contagens anteriores são histórico da auditoria, não o estado atual das dependências.
