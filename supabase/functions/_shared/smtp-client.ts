import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType?: string;
  }>;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.error("❌ Configuração SMTP incompleta");
    return { success: false, error: "Configuração SMTP incompleta" };
  }

  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

  console.log(`📧 Enviando email via SMTP (${smtpHost}:${smtpPort}) para ${toAddresses.join(", ")}`);

  try {
    const port = parseInt(smtpPort);
    // Port 465 = Direct TLS (tls: true)
    // Port 587 = STARTTLS (tls: false, library upgrades automatically)
    // Port 25 = No encryption (tls: false)
    const useTls = port === 465;

    console.log(`🔧 Configuração: port=${port}, tls=${useTls}`);

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: port,
        tls: useTls,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    await client.send({
      from: `CPGG UFBA <${smtpUser}>`,
      to: toAddresses,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    await client.close();

    console.log("✅ Email enviado com sucesso via SMTP");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao enviar email via SMTP:", error);
    return { success: false, error: error.message };
  }
}
