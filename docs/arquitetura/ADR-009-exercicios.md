# ADR-009 — Exercícios canônicos, versões e publicação controlada

Status: adotada na implementação 009.

A FormFisik mantém empresa, produto e infraestrutura próprios. O catálogo deve operar localmente, preservar propriedade privada e preparar referências estáveis para futuras fichas sem construir a prescrição nesta entrega.

Adotamos uma entidade canônica com escopo oficial/particular e CHECK de propriedade, snapshots por versão e eventos mínimos. Solicitações são entidades separadas: aprovação cria oficial novo; vínculo aponta para oficial existente; nunca converte o particular. Referências futuras devem usar FK e versão, evitando textos soltos e alterações retroativas. Não há atualizações destrutivas ou endpoint global de edição.

Importação offline de fonte fixada e licenciada, com manifesto/checksums e validação, foi preferida a consultas GitHub em runtime ou dados técnicos inventados. Identidade de origem preserva UUID em reexecuções. Nomes semelhantes geram revisão, sem fusão automática. Catálogo importado não equivale a homologação técnica profissional.

A menor superfície administrativa é uma capacidade persistente concedida por operador após verificação explícita, reutilizando sessões confirmadas. Essa permissão independe de assinatura e é conferida em cada operação; não há administrador presumido. Locks de concessão/pedido, versões e CHECK de autor distinto protegem concorrência e autoaprovação.

Busca usa texto normalizado e SQL parametrizado com paginação; corpus atual não justifica motor externo/extensões. Seletor devolve referências atuais após validação no servidor; futuros consumidores continuam responsáveis por autorizar a gravação da ficha.

Consequências: revisão técnica/licenciamento de contribuições e provisionamento inicial são responsabilidades operacionais explícitas. Atualizar a fonte exige uma evolução deliberada de versões. Não implementamos 010, treino, mídia, mobile ou deploy.
