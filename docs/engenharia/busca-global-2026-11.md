# Busca global —07/11/2026

IMPLEMENTADO local. Paleta inspirada em Raycast/Spotlight com Ctrl/Meta+K, Escape/foco restaurado, setas/Enter, input automático e estados vazio/carregamento/erro. Reutiliza dialog da topbar e navegação existente; não executa mutações.

Novo GET /api/search?q= exige sessão/profissional, autorização comercial existente e rate limit90/min por usuário. Query3–80 caracteres, normalização sem acentos, parâmetros SQL, propriedade profissional em alunos/treinos e biblioteca oficial publicada ou exercício próprio ativo. DTO apenas id/nome/categoria/href, sem contato, respostas, documento de treino ou IDs de terceiros. Links privados continuam autorizados na rota de destino. Sem assinatura retorna somente ausência de registros/restrição; atalhos locais não concedem permissão.

Matching fuzzy por subsequência: letras em ordem, prefixo/substring prioritários; não equivale a correção ortográfica semântica. Limite18 registros e6 atalhos com consulta,8 atalhos iniciais. Busca privada não baixa toda carteira. Os nomes de alunos/treinos/exercícios são consultados; outros módulos aparecem como atalhos, não pesquisa irrestrita de todos os seus dados. Sem índice paralelo, migrations ou dependência nova. Em grandes bases o padrão subsequência exige avaliação de plano/índice antes de ampliar volume; sem carregamento ilimitado.

Verificado: teste de ranking/acentos passou; lint direcionado/typecheck aprovados; navegador autenticado real validou Ctrl+K, foco, “trei”, endpoint200, setas/Escape e capturas1440/320. Sem mutação financeira, criação de registros ou teste global completo. Produção permanece condicionada aos gates existentes.


## Busca temporal da Agenda

Hoje/amanhã/ontem usam o fuso de agenda_settings, com fallback do domínio. Dia isolado usa mês/ano atuais; DD/MM[/AAAA], “15 de novembro [de2026]” e meses completos com ano opcional são reconhecidos; mês sem ano usa ano atual. Calendário real validado, incluindo bissexto. Janela usa dayBoundary e addDays existentes; não duração fixa24h. Consulta somente professional_id da sessão, sem notas/localização,20 por página, ordenação starts_at/id e total explícito. Inclui estados concluído/cancelado identificados e exclui bloqueios de disponibilidade. Comparação é pelo início do compromisso no período. Link abre detalhe já autorizado na Agenda. Não cria ou modifica compromisso. Nome de compromisso pessoal é minimizado.

Teste unitário temporal aprovado (fuso, relativos, meses, bissexto, datas inválidas); integração local e UI verificadas com registros existentes, sem dados fictícios.
