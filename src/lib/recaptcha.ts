/**
 * reCAPTCHA está registrado no console do Google somente para o domínio
 * de produção (cpgg.ufba.br). Em ambientes de preview (Lovable, localhost,
 * etc.) o widget não valida e o login fica travado. Para permitir trabalho
 * nesses ambientes, fazemos bypass do captcha quando NÃO estamos em
 * produção. A verificação real continua ativa em cpgg.ufba.br.
 */
export const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

const PRODUCTION_HOSTS = ["cpgg.ufba.br", "www.cpgg.ufba.br"]

export function isRecaptchaEnforced(): boolean {
  if (typeof window === "undefined") return true
  return PRODUCTION_HOSTS.includes(window.location.hostname)
}
