import 'server-only'
import nodemailer from 'nodemailer'
import { mailConfig } from './config'

export async function sendVerification(email: string, token: string | null) {
  const settings = mailConfig()
  const url = token ? `${settings.appUrl}/verificar-email#${token}` : null
  const text = url
    ? `Confirme sua conta profissional FormFisik\n\nAbra o link e confirme seu e-mail:\n${url}\n\nO link expira em 30 minutos e só pode ser usado uma vez. Nenhuma assinatura ou período de teste será ativado. Se não solicitou, ignore esta mensagem.`
    : 'Recebemos uma solicitação de cadastro na FormFisik. Se você já possui uma conta, ela permanece inalterada. Se não solicitou, ignore esta mensagem.'
  await sendAccountMail(email, 'Sua conta profissional FormFisik', text)
}

async function sendAccountMail(email: string, subject: string, text: string) {
  const settings = mailConfig()
  const transport = nodemailer.createTransport(settings.mail)
  try {
    const result = await transport.sendMail({ from: settings.from, to: email, subject, text, disableFileAccess: true, disableUrlAccess: true })
    if (!result.accepted.length) throw new Error('EMAIL_NOT_ACCEPTED')
  } finally { transport.close() }
}

export async function sendPasswordRecovery(email: string, token: string | null) {
  const url = token ? `${mailConfig().appUrl}/redefinir-senha#${token}` : null
  const text = url
    ? `Redefina sua senha FormFisik\n\nAbra o link para escolher uma nova senha:\n${url}\n\nO link expira em 30 minutos e só pode ser utilizado uma vez. Suas sessões serão encerradas após a alteração. Se não solicitou, ignore esta mensagem: sua senha permanece inalterada.`
    : 'Recebemos uma solicitação de recuperação na FormFisik. Se você ainda não concluiu o cadastro, confirme seu e-mail pelo link de cadastro. Se não solicitou, ignore esta mensagem. Nenhuma senha foi alterada.'
  await sendAccountMail(email, 'Recuperação de senha FormFisik', text)
}
export async function sendPasswordChanged(email: string) {
  await sendAccountMail(email, 'Sua senha FormFisik foi alterada', 'A senha da sua conta FormFisik foi redefinida e suas sessões anteriores foram encerradas. Para acessar, entre novamente com a nova senha. Se não reconhece esta alteração, solicite imediatamente uma nova recuperação de senha no site oficial da FormFisik.')
}
