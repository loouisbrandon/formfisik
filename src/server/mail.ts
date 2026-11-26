import 'server-only'
import nodemailer from 'nodemailer'
import { mailConfig } from './config'
import { verificationEmailHtml } from './verification-email'

export async function sendVerification(email: string, token: string | null,purpose:'professional'|'personal'='professional') {
  const settings = mailConfig()
  const text = token
    ? `Confirme sua conta profissional FormFisik\n\nSeu código de confirmação: ${token}\n\nDigite este código na tela de cadastro. Ele expira em 10 minutos e só pode ser usado uma vez. Não compartilhe este código. Nenhuma assinatura ou período de teste será ativado. Se não solicitou, ignore esta mensagem.`
    : 'Recebemos uma solicitação de cadastro na FormFisik. Se você já possui uma conta, ela permanece inalterada. Se não solicitou, ignore esta mensagem.'
  const html=token?verificationEmailHtml(settings.appUrl,token):undefined
  await sendAccountMail(email, 'Seu código de confirmação FormFisik',purpose==='personal'?text.replace('conta profissional','conta pessoal'):text,purpose==='personal'?html?.replaceAll('conta profissional','conta pessoal').replace('Conheça os planos FormFisik','Comece sua experiência FormFisik'):html)
}

async function sendAccountMail(email: string, subject: string, text: string, html?: string) {
  const settings = mailConfig()
  if (settings.provider === 'resend') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${settings.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: settings.from, to: [email], subject, text, ...(html ? { html } : {}) }),
      })
      if (!response.ok) { await response.body?.cancel(); throw new Error('EMAIL_NOT_ACCEPTED') }
      const result: unknown = await response.json()
      if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id.trim()) throw new Error('EMAIL_NOT_ACCEPTED')
      return
    } catch { throw new Error('EMAIL_NOT_ACCEPTED') }
  }
  const transport = nodemailer.createTransport(settings.mail)
  try {
    const result = await transport.sendMail({ from: settings.from, to: email, subject, text, html, disableFileAccess: true, disableUrlAccess: true })
    if (!result.accepted.length) throw new Error('EMAIL_NOT_ACCEPTED')
  } finally { transport.close() }
}

export function mobileRecoveryLink(token:string){
  const base=process.env.CORE_MOBILE_RESET_LINK_BASE
  if(!base)return null
  if(base.length>2048||/[\u0000-\u0020\u007f]/.test(base))throw Error('RESET_LINK_CONFIGURATION_INVALID')
  const url=new URL(base),scheme=process.env.CORE_MOBILE_APP_SCHEME
  if(url.username||url.password||url.search||url.hash)throw Error('RESET_LINK_CONFIGURATION_INVALID')
  const custom=scheme==='formfisik-dev'&&process.env.NODE_ENV!=='production'&&process.env.CORE_SERVICE_ENVIRONMENT==='local'&&url.protocol==='formfisik-dev:'&&base==='formfisik-dev://redefinir-senha'
  if(url.protocol!=='https:'&&!custom)throw Error('RESET_LINK_CONFIGURATION_INVALID')
  return base+'#'+token
}
export async function sendPasswordRecovery(email: string, token: string | null,mobile=false) {
  const appLink=mobile?mobileRecoveryLink(token??''):null
  const url = token ? `${mailConfig().appUrl}/redefinir-senha#${token}` : null
  const text = url
    ? `Redefina sua senha FormFisik\n\nAbra o link para escolher uma nova senha:\n${url}\n\nO link expira em 30 minutos e só pode ser utilizado uma vez. Suas sessões serão encerradas após a alteração. Se não solicitou, ignore esta mensagem: sua senha permanece inalterada.`
    : 'Recebemos uma solicitação de recuperação na FormFisik. Se você ainda não concluiu o cadastro, confirme seu e-mail pelo link de cadastro. Se não solicitou, ignore esta mensagem. Nenhuma senha foi alterada.'
  await sendAccountMail(email, 'Recuperação de senha FormFisik', text+(token&&appLink?`\n\nAbrir no aplicativo FormFisik:\n${appLink}\nSe necessário, utilize o link Web acima.`:''))
}
export async function sendPasswordChanged(email: string) {
  await sendAccountMail(email, 'Sua senha FormFisik foi alterada', 'A senha da sua conta FormFisik foi redefinida e suas sessões anteriores foram encerradas. Para acessar, entre novamente com a nova senha. Se não reconhece esta alteração, solicite imediatamente uma nova recuperação de senha no site oficial da FormFisik.')
}

export async function sendEmailChange(email:string,token:string){
 const url=`${mailConfig().appUrl}/confirmar-alteracao-email#${token}`
 await sendAccountMail(email,'Confirme seu novo e-mail FormFisik',`Foi solicitada a alteração do e-mail de acesso à sua conta FormFisik. Confirme no link abaixo:\n${url}\nO link expira em 30 minutos e só pode ser usado uma vez. Se não solicitou a alteração, ignore esta mensagem. Nenhuma alteração ocorre sem confirmação.`)
}
export async function sendEmailChanged(email:string){await sendAccountMail(email,'E-mail de acesso FormFisik alterado','O e-mail de acesso à sua conta foi alterado e as sessões anteriores foram encerradas. Se não reconhece a alteração, entre em contato pelo canal oficial da FormFisik.')}
