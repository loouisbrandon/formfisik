# Catálogo inicial: proveniência e importação

## Fonte auditada

- Tradução: [gugeldev/exercicios-bd-ptbr](https://github.com/gugeldev/exercicios-bd-ptbr/tree/6bb9118e46cf8d0ee98b42e0285bae5036d04a19), commit `6bb9118e46cf8d0ee98b42e0285bae5036d04a19`, arquivo `exercises/exercises-ptbr-full-translation.json`. Licença efetiva CC0-1.0 em LICENSE, cópia em `db/catalog/LICENSE-CC0.txt`.
- Base original: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db/tree/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5), revisão `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`, `dist/exercises.json`. Licença efetiva Unlicense em LICENSE.md, cópia local em `db/catalog/LICENSE-Unlicense.txt`.
- As versões completa e parcial PT-BR têm 873 IDs/nomes coincidentes; selecionada a completa por traduzir também taxonomias. A mínima não atende aos campos necessários. A revisão original auditada contém 876 registros: todos os 873 IDs PT-BR têm correspondência. Os três exclusivos da base inglesa não são importados automaticamente.
- `ptbr-source.json` preserva o JSON selecionado; `original-names.json` é derivado local com pares ID/nome original, utilizado somente para aliases e auditoria. Conteúdo e manifesto versionados permitem uso inteiramente offline após checkout do projeto.

## Integridade e resultados

`db/catalog/manifest.json` contém revisão, licenças, SHA-256 dos arquivos locais, taxonomias, IDs excluídos, flags e grupos semelhantes. SHA-256 PT-BR: `23d10d108bb811eb4daacdce611a7b28428a3ef03e6af817b73eddca792c983a`. Derivado de nomes: `4234f09708a4c1a7f8ee561a35e2297fc46c22ac17312a0e10302b1635a35760`.

873 registros auditados, 868 publicáveis estruturalmente, 5 excluídos por ausência de instruções. 106 registros sinalizados no arquivo, dos quais 104 fazem parte da publicação. Flags podem coexistir. Excluídos: `Iron_Cross`, `One-Arm_Kettlebell_Swings`, `Push_Press`, `Side_Bridge`, `Side_Jackknife`.

Não há IDs repetidos. Quatro grupos têm nomes iguais após normalização: supino com correntes, afundo com halteres, corrida na esteira e arranco a partir de blocos. Os oito IDs permanecem distintos, com alias original e flag. Em especial, `Power_Clean_from_Blocks` e `Snatch_from_Blocks` compartilham tradução: possível inconsistência, sem correção técnica inventada. Nomes iguais ao inglês e equipamentos ausentes recebem flags próprias. `force` e `mechanic` são metadados de origem, sem inferência técnica adicional.

Nenhuma imagem ou mídia foi baixada, copiada, armazenada no banco ou renderizada. O README da tradução restringe a declaração de licença aos JSONs, não às imagens referenciadas. O arquivo de fonte inclui caminhos textuais de imagens como parte do JSON original auditado; o importador não projeta esses campos. Não foi copiado código de interface.

## Executar

Com DATABASE_URL configurada pelo responsável, sem imprimir credenciais:

```sh
npm run db:migrate
npm run exercises:import
```

O importador verifica checksums, IDs únicos, correspondência com nomes originais, schemas, taxonomias e auditoria contra o manifesto antes de escrever. Campos inválidos ou divergência interrompem a importação; os cinco casos conhecidos são excluídos de forma reproduzível. Uma transação e lock impedem importações concorrentes. `(dataset,source_id)` preserva o mesmo UUID; digest impede mudança silenciosa. Reexecução retorna `inserted:0`, não recria versões/eventos nem substitui nomes. Uma alteração de fonte/revisão exige revisão explícita, novo manifesto e estratégia de versionamento; editar o checksum para ignorar a revisão não é procedimento operacional válido.

A publicação inicial significa disponibilidade no catálogo do ambiente, **não homologação técnica**. Descrições, traduções e classificações exigem revisão profissional antes do lançamento comercial. Não foram geradas instruções ou classificações por IA.

## Disponibilização no banco local — 07/11/2026

Diagnóstico por contagem no banco local configurado: `exercise_entries` e `exercise_datasets` estavam vazias. Executado o importador existente (`npm run exercises:import`), sem migration: 873 auditados, 868 publicados/inseridos, 5 excluídos pelas regras do manifesto e 106 sinalizados na auditoria. A operação não sobrescreve particulares e não inclui mídia. Disponibilidade local não substitui a revisão técnica profissional ou homologação de produção.
