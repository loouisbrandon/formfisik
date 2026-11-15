import {approvedMessages} from './message-catalog'
const technical=/(?:\b(?:API|webhook|worker|bucket|R2|S3|servidor|identificador(?:es)?|digest|idempotência|bucket|worker|TypeError|SyntaxError|ReferenceError|SQLSTATE|SELECT|INSERT INTO|UPDATE SET|postgres|constraint|ECONN\w*|ETIMEDOUT|ENOENT|undefined|null pointer|stack trace|payload|CSRF|JWT|HMAC|SMTP|TLS|UUID|DTO|endpoint|JSON|schema|syntax|token_hash|password_hash|DATABASE_URL)\b|\bat \S+\s*\(|[A-Za-z]:\\|\/home\/|\/tmp\/|sk_(?:live|test)_|whsec_|postgres(?:ql)?:\/\/|https?:\/\/)/i
export function friendlyMessage(value:unknown,fallback='Não foi possível concluir a ação. Tente novamente.'):string{
 const message=typeof value==='string'?value:value instanceof Error?value.message:''
 if(!message)return ''
 if(technical.test(message)||message.length>240||!approvedMessages.has(message))return fallback
 return message
}
export const errorFallbacks={
 default:'Não foi possível concluir a ação. Tente novamente.',
 students:'Não foi possível concluir a ação com o aluno. Tente novamente.',
 workouts:'Não foi possível concluir a ação com o treino. Tente novamente.',
 exercises:'Não foi possível concluir a ação com o exercício. Tente novamente.',
 agenda:'Não foi possível atualizar a agenda. Tente novamente.',
 settings:'Não foi possível salvar as configurações. Tente novamente.',
 finance:'Não foi possível concluir a operação financeira. Confira os registros antes de tentar novamente.',
 imports:'Não foi possível concluir a importação. Seus registros já importados foram preservados.',
 communication:'Não foi possível concluir a ação de comunicação. Tente novamente.',
 checkins:'Não foi possível concluir a ação com o check-in. Tente novamente.',
 intake:'Não foi possível concluir a ação com a anamnese. Tente novamente.',
 media:'Não foi possível concluir a ação com o vídeo. Tente novamente.',
 assessments:'Não foi possível concluir a ação com a avaliação. Tente novamente.',
 crm:'Não foi possível salvar a alteração no CRM. Tente novamente.',
 consultancies:'Não foi possível concluir a ação com a consultoria. Tente novamente.',
 login:'Não foi possível entrar. Confira seus dados e tente novamente.'
} as const
export function isTechnicalMessage(value:string){return technical.test(value)}
export function friendlyFieldError(value:unknown){if(value===undefined||value===null||value==='')return '';return friendlyMessage(value,'Confira este campo antes de continuar.')}
