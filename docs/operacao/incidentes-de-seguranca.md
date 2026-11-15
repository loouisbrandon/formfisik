# Resposta a incidentes — FormFisik

Runbook interno da empresa independente fundada por Brandon Louis. Responsável primário: designação formal pendente pelo fundador; substituto, contato jurídico e canal seguro precisam ser preenchidos antes da operação real. Documento não comprova treinamento ou cumprimento de obrigações.

## Checklist operacional

- [ ] Abrir protocolo restrito, registrar instante de detecção/conhecimento, quem detectou e sistemas afetados. Diferenciar suspeita, vulnerabilidade e incidente confirmado.
- [ ] Acionar responsável técnico e representante do controlador; definir líder, cronologia e canal restrito. Não colocar conteúdo corporal, tokens ou senhas no ticket geral.
- [ ] Conter com menor impacto: suspender conta comprometida/revogar sessões, restringir endpoint ou interromper operação afetada; preservar atendimento seguro. Credencial exposta exige decisão de rotação pelo proprietário, nunca reprodução do segredo.
- [ ] Preservar evidências com hashes, timestamps UTC e controle de acesso/cadeia de custódia. Capturar somente necessário; snapshot contém dados protegidos e não deve ir a repositório/chat público.
- [ ] Determinar vetor, intervalo, contas/vínculos/categorias/volume, acesso efetivo, disponibilidade/integridade e operadores envolvidos. Priorizar menores, credenciais, fotografias e contexto de saúde. Criptografia não elimina automaticamente risco.
- [ ] Avaliar risco/dano relevante e necessidade de comunicação com assessoria competente; registrar fundamentos mesmo quando não comunicar. Não esperar investigação perfeita para iniciar avaliação de prazo.
- [ ] Quando aplicável, preparar comunicação à ANPD e titulares, responsável habilitado, dados mínimos e medidas adotadas; revisar sigilo de anexos. Operador informa controlador sem demora injustificada conforme obrigações aplicáveis.
- [ ] Corrigir causa com regressão reproduzível, recuperar de backup validado se necessário e reaplicar eliminações/revogações posteriores antes de liberar acesso.
- [ ] Revalidar isolamento, autenticação, assinatura, fotos/PDFs, logs e monitoramento. Retorno exige decisão explícita do responsável e evidência de controles operacionais.
- [ ] Registrar decisões, comunicações, limitações e ação preventiva com dono/data. Realizar revisão posterior e exercício de mesa sem dados reais.

## Referência regulatória e prazos

A ANPD orienta comunicação pelo controlador à Autoridade e aos titulares em **três dias úteis**, ressalvado prazo legal específico, quando o incidente atende aos critérios de comunicação. Usar o procedimento oficial, incluindo representante habilitado e análise de risco; comunicar só à ANPD não encerra automaticamente obrigações com titulares. [Orientação oficial vigente consultada](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis).

O RCIS, Resolução CD/ANPD 15/2024, disciplina contagem do conhecimento pelo controlador, complementação fundamentada em até vinte dias úteis e registro de incidentes, inclusive não comunicados, por pelo menos cinco anos, ressalvadas obrigações adicionais. Confirmar aplicação concreta, marcos e informações exigidas com especialista; não presumir que a FormFisik se enquadra no regime diferenciado de pequeno porte. [Texto oficial na biblioteca do Ministério da Justiça](https://bibliotecadigital.mj.gov.br/bitstream/1/12879/2/RES_ANPD_2024_15.html).

Não confundir retenção de registro de incidente com retenção irrestrita de dados corporais ou logs gerais. Separar evidência protegida e registro decisório mínimo. Não enviar comunicação externa nem executar contenção em contas reais sem o procedimento e autorização cabíveis; nenhuma dessas operações ocorreu nesta auditoria.
