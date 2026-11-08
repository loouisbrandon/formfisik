import 'server-only'

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

/** Table layout and inline styles keep the confirmation usable without CSS/images. */
export function verificationEmailHtml(origin: string, code: string) {
  const safeCode = escape(code), base = escape(origin)
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>Confirme seu e-mail — FormFisik</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;color:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">Sua evolução começa aqui. Confirme seu e-mail em até 10 minutos.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background-color:#101210;border:1px solid #293024;border-radius:20px;overflow:hidden">
<tr><td align="center" style="padding:32px 24px;border-top:3px solid #a9e600"><img src="${base}/images/nomelogo.png" width="220" alt="FormFisik" style="display:block;width:220px;max-width:100%;height:auto;color:#a9e600;font-size:26px;font-weight:bold"><p style="margin:20px 0 0;color:#a9e600;font-size:20px;line-height:1.3;font-weight:900;font-style:italic">SUA EVOLUÇÃO COMEÇA AQUI.</p></td></tr>
<tr><td><img src="${base}/images/marketing/cta-neon-green.png" width="640" alt="Força e movimento — FormFisik" style="display:block;width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:32px 28px 20px">
<p style="margin:0 0 20px;color:#a9e600;font-size:12px;letter-spacing:3px;font-weight:bold">// CONFIRME SUA CONTA</p>
<h1 style="margin:0;font-size:20px;line-height:1.2;letter-spacing:-0.5px;font-style:italic;font-weight:900;white-space:nowrap">CONFIRME SEU E-MAIL.</h1>
<div style="height:24px;line-height:24px">&nbsp;</div>
<p style="margin:0;color:#e0e4dc;font-size:16px;line-height:1.7">Falta um passo para criar sua conta profissional. Confirme seu endereço de e-mail para continuar na FormFisik.</p>
</td></tr>
<tr><td style="padding:4px 28px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #648700;border-radius:14px;background-color:#151b0e"><tr><td style="padding:22px">
<p style="margin:0 0 14px;font-size:12px;letter-spacing:2px;font-weight:bold;color:#a9e600">SEU PRÓXIMO PASSO</p>
<p style="margin:0;font-size:15px;line-height:1.8;color:#f4f4f4">01 &nbsp; Confirme seu e-mail<br>02 &nbsp; Acesse sua conta profissional<br>03 &nbsp; Conheça os planos FormFisik</p>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:4px 28px 28px"><p style="margin:0 0 12px;color:#b8c0b2;font-size:14px">Digite este código na tela de cadastro:</p><p style="margin:0;padding:24px 12px;background-color:#a9e600;color:#0a0a0a;font-family:monospace;font-size:36px;letter-spacing:8px;font-weight:bold;border-radius:12px">${safeCode}</p><p style="margin:16px 0 0;color:#b8c0b2;font-size:13px;line-height:1.6">Válido por 10 minutos. Uso único. Não compartilhe este código.</p></td></tr>
<tr><td align="center" style="padding:24px 28px 32px;border-top:1px solid #293024"><img src="${base}/images/nomelogo.png" width="160" alt="FormFisik" style="display:block;width:160px;max-width:100%;height:auto;margin:0 auto 20px;color:#a9e600;font-size:20px;font-weight:bold"><p style="margin:0 0 12px;color:#b8c0b2;font-size:12px;line-height:1.7">Confirmar seu e-mail não ativa assinatura nem período de teste.</p><p style="margin:0;color:#b8c0b2;font-size:12px;line-height:1.7">Se você não solicitou uma conta, ignore este e-mail.</p></td></tr>
</table></td></tr></table></body></html>`
}
