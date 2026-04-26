import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  plainTextOnly?: boolean;
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

  if (!options.html && !options.text) {
    return { success: false, error: "Conteúdo do email não informado" };
  }

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

    // Preparar anexos se existirem
    const attachments = options.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      encoding: "base64" as const,
      contentType: att.contentType || "application/pdf",
    }));

    // Gerar versão em texto simples como fallback, removendo caracteres invisíveis
    // gerados por componentes de preview de email que alguns clientes exibem indevidamente.
    const htmlAsText = options.html
      ? options.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      : "";

    const plainText = (options.text || htmlAsText)
      .replace(/[\u200B-\u200F\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const safePlainText = options.plainTextOnly
      ? plainText
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
      : plainText;

    const baseMessage = {
      from: `CPGG UFBA <${smtpUser}>`,
      to: toAddresses,
      subject: options.subject,
      replyTo: options.replyTo,
      attachments: attachments,
    };

    await client.send(options.plainTextOnly
      ? {
        ...baseMessage,
        mimeContent: [{
          mimeType: 'text/plain; charset="us-ascii"',
          content: safePlainText,
        }],
      }
      : {
        ...baseMessage,
        content: plainText,
        ...(options.html ? { html: options.html } : {}),
      });

    await client.close();

    console.log("✅ Email enviado com sucesso via SMTP");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Erro ao enviar email via SMTP:", error);
    return { success: false, error: errorMessage };
  }
}
