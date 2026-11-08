const CAPTCHA_SCRIPT = 'https://www.google.com/recaptcha/api.js?onload=onloadcallback&render=explicit'

/** Fetch the same script the widget uses, without executing or verifying it early. */
export function prepareLoginResources(head: HTMLHeadElement = document.head): void {
  const resources = [
    { rel: 'preconnect', href: 'https://www.google.com' },
    { rel: 'preconnect', href: 'https://www.gstatic.com' },
    { rel: 'preload', href: CAPTCHA_SCRIPT, as: 'script' },
  ]

  for (const resource of resources) {
    if (head.querySelector(`link[rel="${resource.rel}"][href="${resource.href}"]`)) continue
    const link = document.createElement('link')
    link.rel = resource.rel
    link.href = resource.href
    if ('as' in resource) link.as = resource.as
    head.appendChild(link)
  }
}