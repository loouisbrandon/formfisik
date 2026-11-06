# FormFisik Personal 1.0 — definição e homologação

Estado: produto alvo em consolidação; não homologado. A [estratégia](../estrategia/ecossistema-e-especialidades.md) define musculação e gestão de personal trainers como primeira especialidade completa, dentro de uma empresa multiesporte independente. O [inventário](inventario-funcional.md) registra o que existe hoje; o [roadmap](../planejamento/roadmap.md), o que falta.

## Resultado para o profissional

Permitir administrar alunos, serviços, treinos, avaliações, cobranças, agenda, acompanhamentos e relacionamento na FormFisik. A oferta vigente é o [Pro](../estrategia/modelo-de-negocio.md), sem novos preços ou planos nesta definição. Acesso mobile do aluno é parte do resultado alvo; web permanece prioridade de execução atual.

## Matriz objetiva de aceite funcional

Cada linha precisa de cenário integrado aprovado, evidência sanitizada vinculada à versão e ambiente, responsável e data. Ausência de implementação ou evidência impede marcar o requisito como homologado. Nenhuma linha é aprovada por esta auditoria documental.

| Capacidade | Cenário mínimo a demonstrar | Dependência |
| --- | --- | --- |
| Cadastro e assinatura | Confirmar e-mail, entrar, contratar trial com cartão, cancelar e regularizar; recusa/expiração retiram acesso corretamente | 001–006 + 015–016 |
| Cadastro e importação de alunos | Criar/editar/arquivar, importar com duplicidade e erro parcial explicados, sem cruzar carteiras | 008 + 026 |
| Organização da carteira | Filtrar/paginar e movimentar ciclo de atendimento com regras, tarefas e histórico preservados | 018 |
| Anamnese | Enviar versão identificável, responder, revisar e preservar histórico/finalidade | 017 + acesso do aluno |
| Prescrição | Criar ficha, aplicar modelo sem propagação indevida e consultar versão anterior | 009–011 |
| Execução | Aluno autorizado consulta treino e registra séries/cargas; profissional vê histórico consistente | 029 |
| Avaliações | Registrar/editar avaliação parcial, tratar concorrência e acesso indevido | 012 |
| Evolução | Comparar medições e fotos autorizadas, declarar ausências e revogar acesso a arquivos | 012–014 + 016 |
| Consultorias | Contratar serviço com período/entregas, renovar e cancelar preservando histórico | 019 |
| Cobranças e renovações | Cobrar avulso/recorrente, registrar externo, reconciliar webhook duplicado/fora de ordem, tratar recusa, estorno e disputa | 020 |
| Agenda | Agendar dentro da disponibilidade, resolver conflito, reagendar/cancelar e preservar histórico | 021 |
| Feedback | Solicitar e receber check-in, identificar pendência e atualizar adesão | 022 |
| Comunicação | Trocar mensagem e notificação autorizadas com preferências e histórico | 024 |
| Documentos e relatórios | Gerar, visualizar e baixar os mesmos bytes privados; respeitar limites, expiração e revogação | 008, 011, 014 |
| Indicadores operacionais | Reconciliar alunos, serviços, receita e renovações com dados fonte/período/filtros | 025 |
| Acesso mobile | Ativar vínculo legítimo, autenticar, executar e acompanhar sem duplicar regra crítica; negar acesso de outro aluno | 029 |

## Gates transversais de GO/NO-GO — marco 030

1. Todas as capacidades obrigatórias acima implementadas e integradas, com casos positivos, negativos, falhas de dependências e concorrência aplicável aprovados em ambiente autorizado representativo. Mocks/harnesses identificados não substituem Stripe/R2/SMTP homologados.
2. Zero vulnerabilidade crítica ou alta conhecida em aberto; fechar achados bloqueadores da 015 com evidências. Validar canários sintéticos no build efetivo, autorização em cada operação, isolamento entre profissionais/alunos/organizações quando existentes, revogação/expiração e uploads/downloads privados.
3. Finalidades, acesso, retenção, operadores e canal aprovados; demonstrar direitos dos titulares, eliminação/portabilidade e restauração sem ressuscitar exclusões. [Inventário e retenção](../privacidade/inventario-e-retencao.md) não é comprovação de operação.
4. Validar web e mobile com teclado/tecnologias assistivas aplicáveis, 1440/768/320 px, altura reduzida, texto a 200%, dialogs e PDFs; shell sem rolagem externa indevida. Registrar dispositivos, navegadores, falhas e correções. Axe isolado não basta.
5. Antes do piloto, definir e aprovar carga representativa, limites e metas mensuráveis de latência p95, erros, geração de PDF e consumo. Executar os cenários e anexar resultados dentro dessas metas. Valores ainda não definidos são pendência de homologação, sem inventar SLA validado.
6. Validar migrations em staging autorizado com plano de recuperação, grants mínimos, HTTPS, backups/restore, limpeza/reconciliação agendadas, alertas, runbooks e tratamento de indisponibilidade. Conferir reconciliação financeira por recebedor/domínio.
7. Piloto autorizado com profissionais e alunos: amostra, duração e critérios de sucesso aprovados antes do início; executar os 16 fluxos, registrar ocorrências, corrigir bloqueadores e obter aceite técnico/profissional e decisão do fundador. Dados reais permanecem vedados enquanto o NO-GO vigente não for resolvido.
8. Dossiê de release com versão, ambientes, evidências, responsáveis, limitações residuais, rollback e decisão GO/NO-GO assinada/registrada. Testes unitários aprovados, documentação ou conclusão de código não substituem homologação.

Equipes (027) não bloqueiam lançamento individual se dispensáveis; produtos digitais (028) são expansão sujeita à validação comercial. Uma exclusão de capacidade obrigatória da matriz exige alteração estratégica explícita do fundador, documentada antes de declarar Personal 1.0 completa. Outra modalidade somente após esse aceite ou exceção estratégica expressa.
