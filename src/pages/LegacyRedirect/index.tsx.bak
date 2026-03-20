import { useEffect } from 'react'

const LEGACY_URL = 'http://www2.cpgg.ufba.br/'

export function LegacyRedirect() {
  useEffect(() => {
    const targetUrl = `${LEGACY_URL}?nocache=${Date.now()}`
    window.location.replace(targetUrl)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="max-w-xl space-y-3">
        <h1 className="text-2xl font-semibold">Abrindo página antiga…</h1>
        <p className="text-muted-foreground">
          Se o redirecionamento não acontecer automaticamente, use o link abaixo.
        </p>
        <a
          href={LEGACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
        >
          Abrir site antigo
        </a>
      </div>
    </main>
  )
}