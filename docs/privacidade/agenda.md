# Agenda — finalidade, acesso e eliminação

Finalidade: organização de atendimentos, disponibilidade, comparecimento e rastreabilidade de execução contratual solicitada pelo profissional. Dados: identificação mínima de aluno, horários, modalidade, local e notas operacionais privadas, autoria/motivo de alterações. Evitar dados clínicos no texto livre e endereços particulares em modelos reutilizáveis. Calendários externos não recebem dados nesta entrega.

Somente profissional proprietário com autorização SaaS tem acesso. Calendário/listas/CRM usam DTO mínimo; notas, local e título pessoal ficam no detalhe autorizado. Logs de erro usam eventos/códigos estáticos, sem payload, notas ou endereços. Não há acesso do aluno, link público ou novo compartilhamento. Credenciais e sessões não são persistidas em storage do navegador.

A retenção segue o inventário e processo016, sem prazo jurídico inventado. Eventos necessários à rastreabilidade permanecem enquanto houver finalidade e vínculo pertinente, sujeitos a avaliação e eliminação autorizada. Bloqueios financeiros020 são avaliados antes de qualquer remoção. Worker elimina vínculos de execução, ocorrências, eventos do sujeito e séries antes dos contratos019/aluno; invalida resultados idempotentes associados. Configuração e demais alunos permanecem. Encerramento profissional elegível remove configuração/tipos/exceções e eventos residuais conforme processo016.

Restore precisa reaplicar o ledger assinado de eliminações antes de disponibilizar a restauração. Ensaio021 inclui agendamento restaurado e depois removido pelo replay, além de autorização restrita e histórico protegido. Evidências usam exclusivamente dados sintéticos em PostgreSQL descartável. Homologação operacional e revisão jurídica continuam pendentes; não declarar conformidade LGPD genérica a partir de teste local.

Fontes: [inventário](inventario-e-retencao.md), [operação016](../operacao/estabilizacao-016.md), [controles](../seguranca/controles-e-operacao.md).


Refinamento de 05/11/2026: o nome cadastrado de bloqueio/indisponibilidade aparece nos cartões e na lista da agenda do profissional proprietário. O DTO de lista inclui esse título; local e notas permanecem no detalhe autorizado. Isso não compartilha o nome com alunos, CRM ou calendários externos. Títulos de compromissos pessoais continuam apresentados por categoria na lista.
