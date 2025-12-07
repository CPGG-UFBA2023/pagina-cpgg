import { Resend } from "npm:resend@2.0.0";

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
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "RESEND_API_KEY não configurada" };
  }

  const resend = new Resend(resendApiKey);
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

  console.log(`📧 Enviando email via Resend para ${toAddresses.join(", ")}`);

  try {
    const emailConfig: any = {
      from: "CPGG UFBA <onboarding@resend.dev>",
      to: toAddresses,
      subject: options.subject,
      html: options.html,
    };

    if (options.replyTo) {
      emailConfig.reply_to = options.replyTo;
    }

    if (options.attachments && options.attachments.length > 0) {
      emailConfig.attachments = options.attachments.map((att) => ({
        filename: att.filename,
        content: att.content, // Resend accepts base64 directly
      }));
    }

    const result = await resend.emails.send(emailConfig);
    
    // Check if Resend returned an error
    if (result.error) {
      console.error("❌ Erro do Resend:", result.error);
      return { success: false, error: result.error.message };
    }
    
    console.log("✅ Email enviado com sucesso via Resend:", result);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao enviar email via Resend:", error);
    return { success: false, error: error.message };
  }
}
