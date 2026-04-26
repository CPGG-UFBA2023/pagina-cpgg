import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { sendEmail } from "../_shared/smtp-client.ts"

const hookSecret = Deno.env.get('SEND_CUSTOM_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    const html = buildConfirmationEmailHtml({
      supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
      token,
      tokenHash: token_hash,
      redirectTo: redirect_to,
      emailActionType: email_action_type,
    })

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Acesso CPGG - Confirme seu registro',
      html,
    })
    
    if (!emailResult.success) {
      throw new Error(emailResult.error)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? error.code : 401
    console.log('Error sending email:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: errorCode,
          message: errorMessage,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

function buildConfirmationEmailHtml({
  supabaseUrl,
  token,
  tokenHash,
  redirectTo,
  emailActionType,
}: {
  supabaseUrl: string
  token: string
  tokenHash: string
  redirectTo: string
  emailActionType: string
}) {
  const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(emailActionType)}&redirect_to=${encodeURIComponent(redirectTo)}`

  return `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><title>Acesso CPGG</title></head>
  <body style="background:#ffffff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;color:#333333;">
    <main style="max-width:560px;margin:0 auto;padding:40px 12px;">
      <h1 style="font-size:24px;line-height:32px;margin:0 0 32px;font-weight:700;color:#333333;">Acesso CPGG</h1>
      <p style="font-size:14px;line-height:24px;margin:0 0 24px;">Este é um e-mail enviado para confirmar o cadastro na página do CPGG/UFBA.</p>
      <p style="font-size:14px;line-height:24px;margin:0 0 24px;">Bem-vindo! Para completar seu registro no CPGG, clique no link abaixo:</p>
      <a href="${confirmationUrl}" target="_blank" style="display:block;margin:0 0 16px;background:#936aeb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;text-align:center;font-size:14px;">Confirmar Registro</a>
      <p style="font-size:14px;line-height:24px;margin:0 0 14px;">Ou, copie e cole este código temporário:</p>
      <code style="display:block;padding:12px;background:#f4f4f5;border-radius:6px;font-size:16px;letter-spacing:2px;color:#333333;">${token}</code>
      <p style="font-size:14px;line-height:24px;color:#ababab;margin:14px 0 16px;">Se você não tentou se registrar, pode ignorar este email com segurança.</p>
      <p style="font-size:12px;line-height:20px;margin:0;"><a href="https://cpgg.ufba.br" target="_blank" style="color:#898989;text-decoration:underline;">CPGG - Centro de Pesquisa em Geofísica e Geologia</a></p>
    </main>
  </body>
</html>`
}
