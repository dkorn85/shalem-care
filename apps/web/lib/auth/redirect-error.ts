// Helper: Erkennt Next.js' interne NEXT_REDIRECT-Exception.
//
// `redirect()` aus `next/navigation` wirft eine spezielle Exception, die
// vom Framework abgefangen werden muss, um den HTTP-Redirect auszulösen.
// Wenn wir eigene try/catch-Blöcke um redirect-werfende Funktionen legen,
// MÜSSEN wir diese Exception durchreichen — sonst landet der User auf
// einer Error-Seite statt am Ziel.
//
// Next 15 markiert die Exception via Error.digest = "NEXT_REDIRECT;<typ>;<url>;<status>".
// In älteren Versionen war message === "NEXT_REDIRECT". Wir prüfen beides.

export function isNextRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.message === "NEXT_REDIRECT") return true;
  const digest = (err as { digest?: string }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
