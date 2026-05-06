"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[shalem-care] global-error", error);
    }
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "rgb(250 250 248)",
          color: "rgb(14 14 12)",
          fontFamily:
            "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            height: "6px",
            width: "96px",
            borderRadius: "9999px",
            marginBottom: "28px",
            background:
              "linear-gradient(90deg,#FF6B6B,#FFA94D,#FFD53E,#73DD66,#5DC9D4,#748FFC,#B197FC)",
          }}
        />
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgb(140 138 128)",
            margin: 0,
            marginBottom: "12px",
            fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
          }}
        >
          Shalem Care macht kurz Pause
        </p>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            margin: 0,
            maxWidth: "640px",
          }}
        >
          Wir sind gleich wieder da.
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "rgb(90 89 80)",
            marginTop: "20px",
            maxWidth: "440px",
            lineHeight: 1.6,
          }}
        >
          Etwas Grundlegendes konnte nicht laden. Versuche es nochmal —
          falls es bleibt, melde dich gerne über die Roadmap.
        </p>

        {error?.digest && (
          <p
            style={{
              fontSize: "11px",
              color: "rgb(140 138 128)",
              marginTop: "16px",
              fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
            }}
          >
            Vorgang: {error.digest}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "32px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              fontSize: "14px",
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgb(15 110 86)",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgb(14 14 12 / 0.06)",
            }}
          >
            Nochmal versuchen
          </button>
          <a
            href="/"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid rgb(228 226 218)",
              color: "rgb(14 14 12)",
              background: "white",
              textDecoration: "none",
            }}
          >
            Zur Startseite
          </a>
        </div>
      </body>
    </html>
  );
}
