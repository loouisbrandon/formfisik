# Anamneses017 — finalidade, acesso e ciclo de vida

**Somente implementação/teste local sintético. Produção/dados reais NO-GO.** FormFisik é empresa independente, fundada por Brandon Louis; não se presume formalização jurídica. Não há certificaçãoLGPD. Textos públicos deixam explícitas as pendências de homologação jurídica, base aplicável, canal e retenções; não são política final publicada.

## Categorias e minimização

| Categoria | Finalidade / fonte | Acesso / retenção técnica |
| --- | --- | --- |
| Nome/contato/nascimento informado | Cadastro privado e triagem de vínculo; aluno portador de convite novo | Não exibido publicamente depois do envio. Novo seguro é gravado apenas no cadastro canônico; original permanece em submissão somente no caso pendente, para revisão rastreável. Não consultar identidade global por contato |
| Definição/seções/perguntas/opções | Questionário profissional e interpretação do histórico | Proprietário e portador da solicitação válida; versões estáveis. Sem dados reais em modelos padrão |
| Respostas potencialmente de saúde | Planejamento do acompanhamento pelo personal | Proprietário com sessão/entitlement e escopo; PostgreSQL/backups. Não incluir em notas administrativas, listas, URLs, analytics, Stripe, SMTP ou PDFs automáticos |
| Digest/UUIDs/estado/datas | Capacidade de uso único, transação e rastreabilidade | Servidor/operador; digest não permite recuperar token. Validade7 dias; bloquear leitura/uso independe de scheduler |
| Ciência e revisão/eventos | Evidenciar apresentação/finalidade e ação declarada | Dono/operador, sem conteúdo de saúde nos eventos. Ciência/atestado não comprova base legal ou verificação externa de identidade |
| Rascunho não enviado | Evitar perda entre etapas sem persistência indevida | Somente memória da página; fechar/recarregar perde dados. Sem Web Storage/cookie/draft server paralelo |

Questionário padrão pergunta apenas objetivos, experiência, rotina, ambiente, limitações/lesões relevantes, hábitos e observações opcionais. Não exigeCPF/endereço, documento médico, diagnóstico ou declaração automática de aptidão. Profissional deve revisar a necessidade de cada pergunta personalizada; o sistema não identifica semanticamente toda coleta excessiva ou conteúdo sobre terceiros. O texto de minimização e limites não substitui supervisão.

## Autorização e identidade

Nome do profissional e versão/finalidade são apresentados ao portador. Link é capacidade individual que pode ser encaminhada indevidamente: entrega pelo profissional ao destinatário certo é requisito operacional. Não comprova identidade civil; não autentica conta e não concede acesso ao histórico. Convite existente fixa o vínculo pelo proprietário antes da emissão e público não altera cadastro. Convite novo com coincidência na carteira conserva pendência; resolver exige conferência independente e atestado explícito, sem autoassociação por e-mail.

Nenhum dado é compartilhado entre carteiras ou com outra empresa por presunção. Requerir avaliação jurídica antes de menores/responsáveis ou qualquer operação real. Papéis, hipótese do tratamento sensível, transparência, canal e procedimento de direitos aguardam definição competente. Não declarar que um checkbox supre esses requisitos.

## Retenção e eliminação

Não inventar prazo legal universal nem retenção perpétua. Validade do link é7 dias técnicos, distinta da retenção da submissão. Arquivar modelo ou revogar convite não elimina respostas. Revisão profissional preserva original; correção exige nova solicitação. Histórico/versões continuam enquanto necessários à finalidade aprovada, sujeitos à política ainda pendente. Eventos/contagens também são dados pessoais/pseudonimizados, não anônimos.

Reutilização016: pedido operacional aprovado de vínculo, com conta suspensa/manutenção, remove transacionalmente `intake_requests` do vínculo, suas submissões e eventos antes do cadastro; versões/formulários profissionais permanecem para outros alunos. Replay do ledger após restauração reaplica a mesma exclusão antes de reabrir acesso. Conta profissional elegível sem carteiras pode eliminar modelos/convites vazios; submissão de terceiro sem vínculo impede esse expurgo por `related_history`. Tratar a identidade/escopo do titular pendente no procedimento existente, resolver legitimamente e somente então usar a fila de vínculo016. Não criarDELETE público ou apagar saúde de terceiros para satisfazer pedido de conta profissional.

Backups/cópias/ledger continuam sujeitos ao [procedimento016](eliminacao-016.md), cifragem e checkpoint atuais a homologar. Teste sintético não prova exclusão de todos os backups ou conformidade integral. Não houve expurgo real, configuração de agenda ou serviço externo.

## Operação e riscos

Revisar envio manual, token em clipboard, dispositivo compartilhado, logs de proxy, scripts/extensões do navegador e conteúdo livre de terceiros antes de produção. Página não carrega analytics/recursos de coleta externos, removefragmento,noReferrer/noIndex/noStore, CSP e fontes locais. TLS/ingress/rate limiting distribuído e operadores reais ainda requerem homologação. Não usar link como mecanismo de login, aceite contratual, prontuário médico ou prova automática de aptidão.
