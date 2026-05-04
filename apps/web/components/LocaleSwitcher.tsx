"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/types";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const [pending, start] = useTransition();
  const choose = (l: Locale) => {
    if (l === current) return;
    start(async () => {
      await setLocale(l);
    });
  };

  return (
    <div className="flex rounded-lg surface-mute p-0.5 text-[11px]" aria-label="Sprache wählen">
      {(["de", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => choose(l)}
          disabled={pending}
          className={`px-2 py-0.5 rounded-md font-mono uppercase tracking-wider ${
            current === l ? "bg-[rgb(var(--bg-elev))] text-[rgb(var(--fg))]" : "text-mute hover:text-[rgb(var(--fg))]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
