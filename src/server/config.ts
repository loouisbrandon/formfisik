import 'server-only'

export function config() {
  const { DATABASE_URL, APP_URL, ABUSE_HMAC_SECRET } = process.env
  if (!DATABASE_URL || !APP_URL || !ABUSE_HMAC_SECRET || ABUSE_HMAC_SECRET.length < 32) throw new Error('CONFIGURATION_UNAVAILABLE')
  const appUrl = new URL(APP_URL)
  const production = process.env.NODE_ENV === 'production'
  if (appUrl.origin !== APP_URL || (production && appUrl.protocol !== 'https:') || !['http:', 'https:'].includes(appUrl.protocol)) throw new Error('INVALID_APP_URL')
  return { databaseUrl: DATABASE_URL, appUrl: appUrl.origin, abuseSecret: ABUSE_HMAC_SECRET, production }
}

export function mailConfig() {
  if (process.env.MAIL_TRANSPORT === 'resend') {
    const { RESEND_API_KEY, MAIL_FROM } = process.env
    if (!RESEND_API_KEY || !MAIL_FROM) throw new Error('EMAIL_CONFIGURATION_UNAVAILABLE')
    return { provider: 'resend' as const, apiKey: RESEND_API_KEY, from: MAIL_FROM, appUrl: config().appUrl }
  }
  if (process.env.MAIL_TRANSPORT && process.env.MAIL_TRANSPORT !== 'smtp') throw new Error('INVALID_MAIL_TRANSPORT')
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } = process.env
  if (!SMTP_HOST || !MAIL_FROM) throw new Error('SMTP_CONFIGURATION_UNAVAILABLE')
  const { production, appUrl } = config()
  const port = Number(process.env.SMTP_PORT || 587)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_SMTP_PORT')
  if (production && (!SMTP_USER || !SMTP_PASSWORD)) throw new Error('SMTP_AUTH_REQUIRED')
  return { provider: 'smtp' as const, appUrl,
    mail: { host: SMTP_HOST, port, secure: port === 465, requireTLS: production,
      auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000 }, from: MAIL_FROM }
}
