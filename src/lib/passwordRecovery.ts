type RecoveryError = { status?: number; code?: string; message?: string };
type SendRecovery = (email: string, options: { redirectTo: string }) => Promise<{ error: RecoveryError | null }>;

export function recoveryErrorMessage(error: RecoveryError): string {
  if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
    return 'O limite de envio de e-mails foi atingido. Aguarde antes de solicitar outro link.';
  }
  return 'Não foi possível enviar o e-mail de recuperação. O serviço de envio precisa ser verificado pela administração.';
}

// One outstanding request per form, without reading or changing profile data.
export function createRecoveryRequest(send: SendRecovery) {
  let pending = false;
  return async (email: string, origin: string) => {
    if (pending) return { skipped: true as const, error: null };
    pending = true;
    try {
      const result = await send(email.trim(), { redirectTo: `${origin}/reset-password` });
      return { skipped: false as const, error: result.error };
    } finally {
      pending = false;
    }
  };
}