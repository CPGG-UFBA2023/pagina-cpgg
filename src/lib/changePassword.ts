type PasswordUpdater = (attributes: { password: string; current_password: string }) => Promise<{ error: { message: string } | null }>;

export function createPasswordChange(update: PasswordUpdater) {
  let pending = false;
  return async (current: string, password: string, confirmation: string) => {
    if (pending) return { skipped: true, error: null };
    if (!current || password.length < 6 || password !== confirmation || current === password) {
      return { skipped: false, error: { message: 'Informe a senha atual e uma nova senha diferente, com pelo menos 6 caracteres, igual à confirmação.' } };
    }
    pending = true;
    try { return { skipped: false, ...(await update({ password, current_password: current })) }; }
    finally { pending = false; }
  };
}