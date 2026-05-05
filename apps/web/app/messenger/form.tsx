"use client";

// Messenger-Send-Form mit @-/#-Auto-Suggest, Anhang, Voicemail-Aufnahme.

import { useRef, useState, useTransition } from "react";
import { sendeMessageFormAction } from "@/lib/messenger/actions";

type Person = { id: string; name: string; beruf: string };
type Tag    = { tag: string; label: string; farbe: string };
type Klient = { id: string; name: string };

export function MessengerForm({
  klienten,
  personen,
  prozessTags,
  defaultKlient,
}: {
  klienten: Klient[];
  personen: Person[];
  prozessTags: Tag[];
  defaultKlient?: string;
}) {
  const [body, setBody] = useState("");
  const [klientId, setKlientId] = useState(defaultKlient ?? "");
  const [pending, start] = useTransition();
  const [recording, setRecording] = useState(false);
  const [voicemailBlob, setVoicemailBlob] = useState<Blob | null>(null);
  const [voicemailDauer, setVoicemailDauer] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-Suggest: zeigt Vorschläge unter dem Textarea wenn @ oder # eingegeben wird
  const lastWord = body.split(/\s+/).pop() ?? "";
  const showMentionSuggest = lastWord.startsWith("@") && lastWord.length > 1;
  const showTagSuggest     = lastWord.startsWith("#") && lastWord.length > 1;

  const filteredPersonen = showMentionSuggest
    ? personen.filter((p) => p.id.toLowerCase().includes(lastWord.slice(1).toLowerCase()) || p.name.toLowerCase().includes(lastWord.slice(1).toLowerCase()))
    : [];
  const filteredTags = showTagSuggest
    ? prozessTags.filter((t) => t.tag.includes(lastWord.slice(1).toLowerCase()) || t.label.toLowerCase().includes(lastWord.slice(1).toLowerCase()))
    : [];

  const replaceLastWord = (replacement: string) => {
    const parts = body.split(/(\s+)/);
    if (parts.length === 0) {
      setBody(replacement + " ");
      return;
    }
    parts[parts.length - 1] = replacement;
    setBody(parts.join("") + " ");
  };

  // Voicemail-Aufnahme via MediaRecorder
  const startRecording = async () => {
    setRecordError(null);
    setVoicemailBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        setVoicemailBlob(blob);
        setVoicemailDauer(Math.round((Date.now() - startTimeRef.current) / 1000));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      startTimeRef.current = Date.now();
      setRecording(true);
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : "Mikrofon-Zugriff verweigert.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submit = () => {
    if (!formRef.current) return;
    start(() => {
      const fd = new FormData(formRef.current!);
      if (voicemailBlob) {
        const ext = voicemailBlob.type.includes("mp4") ? "mp4" : voicemailBlob.type.includes("ogg") ? "ogg" : "webm";
        fd.set("voicemail", new File([voicemailBlob], `voicemail.${ext}`, { type: voicemailBlob.type }));
        fd.set("voicemail_dauer_sec", String(voicemailDauer));
      }
      // Server-Action via fetch-trigger via form
      const formAction = sendeMessageFormAction;
      void formAction(fd);
    });
  };

  return (
    <section className="surface rounded-2xl p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Neue Nachricht</p>
      <form ref={formRef} action={sendeMessageFormAction} encType="multipart/form-data" className="space-y-3">
        {/* Klient-Select */}
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-soft font-medium block mb-1">Bezug zu Klient:in (optional)</span>
          <select
            name="klient_id"
            value={klientId}
            onChange={(e) => setKlientId(e.target.value)}
            className="w-full surface-mute rounded p-2 text-[13px] focus:outline-none"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
          >
            <option value="">— team-weit (kein Klient-Bezug) —</option>
            {klienten.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </label>

        {/* Body mit Auto-Suggest */}
        <div className="relative">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-soft font-medium block mb-1">
              Nachricht — nutze <code className="font-mono">@person-id</code> für Mentions, <code className="font-mono">#tag</code> für Behandlungen
            </span>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Beispiel: @person-arzt-001 hat Helga heute 0,5 mg Tilidin verordnet. #medikation #schmerz-nrs"
              rows={4}
              required
              maxLength={4000}
              className="w-full surface-mute rounded p-2.5 text-[13px] resize-y focus:outline-none"
              style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
            />
          </label>
          {/* Auto-Suggest-Dropdown */}
          {(showMentionSuggest && filteredPersonen.length > 0) && (
            <div className="absolute left-0 right-0 mt-1 surface rounded-lg shadow-md p-1 z-10 max-h-48 overflow-y-auto">
              {filteredPersonen.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => replaceLastWord("@" + p.id)}
                  className="w-full text-left px-2 py-1 text-[12px] hover:bg-[rgb(var(--bg-mute))] rounded flex items-baseline justify-between gap-2"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-soft font-mono text-[11px]">@{p.id} · {p.beruf}</span>
                </button>
              ))}
            </div>
          )}
          {(showTagSuggest && filteredTags.length > 0) && (
            <div className="absolute left-0 right-0 mt-1 surface rounded-lg shadow-md p-1 z-10 max-h-48 overflow-y-auto">
              {filteredTags.slice(0, 8).map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => replaceLastWord("#" + t.tag)}
                  className="w-full text-left px-2 py-1 text-[12px] hover:bg-[rgb(var(--bg-mute))] rounded flex items-baseline gap-2"
                >
                  <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: `rgb(${t.farbe})` }} />
                  <span className="font-medium">#{t.tag}</span>
                  <span className="text-soft text-[11px]">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Anhang + Voicemail */}
        <div className="flex flex-wrap gap-3 items-baseline">
          <label className="text-[12px] flex items-baseline gap-2 cursor-pointer">
            <span className="text-soft">📎</span>
            <input type="file" name="attachment" accept="image/*,application/pdf,audio/*,video/*"
              className="text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-[rgb(var(--bg-mute))] file:text-[rgb(var(--fg-mute))]"
            />
          </label>
          {/* Voicemail-Aufnahme */}
          <div className="flex items-baseline gap-2">
            {!recording && !voicemailBlob && (
              <button type="button" onClick={startRecording}
                className="text-[12px] px-2.5 py-1 rounded transition-colors"
                style={{ background: "transparent", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}
              >
                🎙️ Voicemail aufnehmen
              </button>
            )}
            {recording && (
              <button type="button" onClick={stopRecording}
                className="text-[12px] px-2.5 py-1 rounded animate-pulse"
                style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
              >
                ⏹ Aufnahme stoppen
              </button>
            )}
            {voicemailBlob && (
              <span className="text-[11px] text-soft">
                Voicemail aufgenommen ({voicemailDauer}s)
                <button type="button" onClick={() => setVoicemailBlob(null)} className="ml-2 text-[10px] underline">verwerfen</button>
              </span>
            )}
            {recordError && <span className="text-[10px]" style={{ color: "rgb(var(--mon))" }}>{recordError}</span>}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="text-[10px] text-soft italic max-w-md">
            Phase 1: alle Care-Team-Messages sind sichtbar. Phase 2: Klient-Filter via FHIR CareTeam.
          </p>
          <button
            type={voicemailBlob ? "button" : "submit"}
            onClick={voicemailBlob ? submit : undefined}
            disabled={pending || !body.trim()}
            className="btn btn-primary text-[12px] disabled:opacity-50"
          >
            {pending ? "Sende …" : "Senden →"}
          </button>
        </div>
      </form>
    </section>
  );
}
