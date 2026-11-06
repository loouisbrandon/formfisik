# Biblioteca de vídeos — auditoria e evolução visual (05/11/2026)

FormFisik é empresa independente fundada por Brandon Louis. Trabalho local, sem deploy, commit, serviço externo ou migration persistente.

## Auditoria antes da implementação

- Reutilizar `MediaArea`, `mediaApi`, `DemoPlayer`, `MediaPreview`, `ExerciseSelector`, `ExerciseDemos` e o shell profissional. O layout atual concentra formulário, associação, filtros e todas as ações em uma página longa; precisa de grade/lista e painéis progressivos.
- Reutilizar `mediaCommand`, `mediaQuery`, `mediaHandler`, `executeMedia`, `readMedia`, versões, conjuntos de associações, eventos, intenção idempotente e quotas. Não criar outra entidade de vídeo.
- Reutilizar Stream privado com processamento remoto, webhook canônico, emissão de reprodução de cinco minutos e fila de remoção. Não duplicar armazenamento em R2, disco público ou PostgreSQL.
- Treinos já fixam `DemoReference` em snapshots. Arquivo conserva referências históricas; revogação bloqueia reprodução. Não reescrever prescrições.
- Autoria, conferência de pessoas, autor e data já persistem; registrar a versão da declaração no evento existente, sem migration.
- Consultas atuais precisam acrescentar indicadores e filtros por exercício/músculo/ordenação com isolamento e paginação no SQL. Não carregar toda a biblioteca no cliente.
- Novos componentes de painel e aparência ficam no módulo de mídia: atendem composição, foco modal, rolagem local e estados sem substituir permissões ou player existentes.

## Limites identificados

Não há identidade/portal de aluno implementado. Não equiparar cadastro de aluno a conta autenticada nem liberar biblioteca por UUID. O acesso do aluno é decisão de escopo pendente; a implementação independente concentra biblioteca profissional e preserva contratos de prescrição.

Stream externo não está homologado. Upload direto existente valida metadados declarados, tamanho/duração canônicos e processamento no provedor, mas não comprova inspeção independente do MIME/contêiner original no servidor FormFisik. Não afirmar atendimento desse requisito com validação de extensão no navegador. Sem credenciais/configuração, upload/reprodução hospedada permanecem indisponíveis. Testes com provedor controlado não comprovam mídia real nem GO integral do prompt.

Miniaturas de arquivos privados não podem ser URLs públicas permanentes. Na ausência de miniatura autorizada, usar estado visual honesto; não copiar fotos da referência ou disparar recursos YouTube antes de interação.

## Manifesto da implementação

- `src/modules/media/area.tsx`: grade/lista, filtros, abas, contagens, painéis, estados verdadeiros e seleção de exercício reutilizada.
- `src/modules/media/media.module.css`: claro/noturno, cards16:9, painel lateral e responsividade sem scroll externo.
- `src/modules/media/drawer.tsx`: modal nativo reutilizável dentro do módulo, foco/fechamento e rolagem próprios.
- `src/modules/media/upload.ts`: transferência para destino validado, progresso e interrupção explícita. Não persiste URL nem trata bytes enviados como mídia pronta.
- `src/modules/media/schema.ts`: consulta estendida, limite120s e destino obrigatório em novos uploads.
- `src/server/media/repository.ts`: busca/indicadores/associações mínimas, validação de destino antes da reserva, teto120s e evento auditável de termos; preserva transações, isolamento e snapshots.
- `src/modules/professional/shell.tsx`: largura compartilhada da biblioteca.
- `tests/media.test.ts`, `tests/media-e2e.ts`: regressão e novos casos. Fixtures de upload agora informam exercício porque o contrato passou a exigi-lo; o teste não contorna autorização. Seletores E2E acompanham painéis e campos reais, preservando verificação de arquivamento, reprodução tardia e foco.
- Documentação: módulo, API, operação Stream, Design System, roadmap e este relatório.

Declaração `rights:2026-11-05`: “Declaro que sou o autor deste vídeo ou que possuo os direitos necessários para enviá-lo e disponibilizá-lo aos meus alunos.” Conferência separada das pessoas identificáveis permanece obrigatória. Declaração não comprova titularidade por si só.

## Evidências e veredito

38 testes de integração aprovados em PostgreSQL auxiliar descartável: idempotência, concorrência, isolamento, snapshots, revogação, limpeza, declarações, exercício obrigatório, busca/músculos/indicadores,119/120/120,01 segundos canônicos e rejeição de reserva121s. Testes de Stream usam `ControlledVideo`, claramente sintético.

Chrome E2E aprovado: cadastro YouTube, associação, player sob demanda, fechamento com foco restituído, arquivo/reativação, IDOR404, upload e processamento com transporte controlado,320/375/768/1440, teclado, texto200% e Axe. Artefatos: `test-results/023/browser-proof.json`, `api-measurements.json`, `browser/`. O arquivo “vídeo” desse harness é sintético e não prova decodificação, MIME ou duração de um arquivo real.

Chrome local claro/escuro em1920/1440/768/320 cobre biblioteca vazia e painéis upload/YouTube. Artefatos em `test-results/local/video-redesign/`. Sem violações detectadas pelo Axe ou overflow externo; isso não substitui leitor de tela humano. ESLint, TypeScript e build webpack executados.

**GO local delimitado:** redesign, catálogo profissional, consultas, YouTube e integrações versionadas testadas. **NO-GO para a evolução integral do prompt e produção:** upload real/miniaturas privadas dependem de configuração e homologação Stream; inspeção independente de MIME/contêiner original não implementada; corrupção/formatos reais não testados; acesso do aluno e revogação de vínculo na futura experiência Connect não implementados. Sem serviço externo criado, credenciais reais, deploy, commit ou alteração de banco persistente. O NO-GO institucional015 permanece.

Custo/risco: preservadas quotas100 vídeos,18000 segundos,200MB/arquivo e novo teto120s. Configuração é limite técnico, não promessa comercial. Reservas interrompidas, órfãos sem UID e bytes já recebidos continuam sujeitos ao runbook e à reconciliação existente. Tokens previamente emitidos têm janela de até5min; não há promessa de recolher bytes/DRM. Miniaturas usam placeholder até existir endpoint autorizado, sem requisições externas na listagem.
