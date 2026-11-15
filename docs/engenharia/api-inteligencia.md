# API de inteligência — 025

`GET /api/intelligence?from=YYYY-MM-DD&to=YYYY-MM-DD`: schema strict, até367 datas inclusivas; comparação anterior calculada no servidor. Qualquer parâmetro extra, datas inválidas/invertidas ou excesso retorna400. Não aceita owner, aluno ou seleção de fonte externa.

Sessão opaca válida → limite durável HMAC30/min por profissional → entitlement canônico → agregações isoladas.401 sem sessão,403 acesso negado,429 limite,503 falha de dependência com código estático sem SQL/dados. Respostas private,no-store/no-referrer/nosniff. Nenhum comando ou mutação porGET.

DTO `IntelligenceReport`: generatedAt, timezone, current/previous{period,groups[{id,label,href,metrics[{id,label,value,unit,definition,scope,numerator?,denominator?}]}],stages[{name,total}],series[{date,newStudents,portfolio,providerReceived,externalDeclared}]},limitations. value decimal string ou null; centavos strings sem conversão para float; taxas têm unidadepercent. current significa período selecionado; scope=current significa posição atual, que não deve ser comparada como histórico. Até40 etapas canônicas, até367 datas por série. Sem PII de alunos, conteúdo clínico ou referências de credenciais.

Fontes e definições: [módulo](../modulos/inteligencia-de-negocio.md). Sem exportação, cache analítico ou API pública/mobile nova. Produção NO-GO preservado.
