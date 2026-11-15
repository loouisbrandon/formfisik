# ADR-010 — Prescrição canônica versionada e modelos por cópia

Status: adotada na implementação 010.

A FormFisik mantém identidade empresarial própria e arquitetura web Next.js/PostgreSQL existente. A prescrição precisa conservar significado histórico e preparar PDF sem implementar execução ou exportação final.

Adotamos um documento canônico estruturado por planejamento, com UUIDs estáveis e arrays ordenados de divisões/ocorrências/séries/grupos, validado estritamente por Zod. JSONB evita dezenas de endpoints por pequena mudança e permite salvar toda a ficha atomicamente. Uma projeção relacional por versão possui FKs reais para as versões canônicas de exercícios; não se armazenam apenas nomes soltos. A projeção não é uma segunda fonte de prescrição: nasce do documento validado na mesma transação.

Cabeçalho atual e snapshots imutáveis pelo fluxo da aplicação separam edição corrente e história. Cada salvamento relevante/transição cria versão, estado, operação, ator, identidade mínima e referências. O futuro PDF deve consumir o snapshot, não remontar dados a partir do catálogo/identidades atuais. Documentos arquivados são preservados e só reabrem em rascunho. Uma única ficha ativa por aluno é protegida por índice parcial e validação; não desativamos automaticamente a anterior.

Modelo usa a mesma entidade/editor, sem aluno. Aplicação é uma transação atômica para 1–50 alunos próprios ativos. Clona identidades internas, remapeia grupos e cria fichas independentes em rascunho, com FK à revisão do modelo. Idempotência persistente por chave/digest protege reenvios; resultado resumido evita devolver dezenas de documentos grandes. Erro em qualquer aluno/escrita reverte todo o lote. Não existe propagação futura de alterações do modelo.

Técnicas são metadados estruturados: séries individuais, modos de repetição, fases de continuação para drop-set/rest-pause e grupos por IDs de ocorrência. Não é um motor de execução, recomendação ou cálculo de carga. Valores técnicos novos começam vazios; o profissional os informa explicitamente.

Reutilizamos sessões opacas, guard comercial, HTTP/CSRF/limites, migrator, shell, alunos e seletor da 009. O helper JSON ganha limite interno opcional, mantendo o padrão anterior de 8 KiB; treinos usam 512 KiB e limites estruturais próprios. Locks por profissional, linha, vínculo e referência mais versão otimista protegem concorrência e corridas com arquivamento. Não há novos serviços ou dependências.

Consequências: documentos têm tamanho limitado; busca usa cabeçalhos e índices existentes, sem consultas pesadas a cada edição local. Alterar a estrutura canônica futuramente exige estratégia explícita de versão/schema, mantendo snapshots legíveis. Política organizacional de retenção/eliminação deve considerar prescrições históricas. Revisão técnica do catálogo e homologação Stripe seguem pendências separadas; esta decisão não autoriza deploy ou operação financeira.

Duplicações registram também a revisão exata do planejamento de origem, por FK composta. Migration complementar aditiva não tenta reconstruir revisionamento desconhecido de cópias preexistentes. Novas cópias têm origem explícita; snapshots anteriores permanecem inalterados.
