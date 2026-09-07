"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewsletterTemplateInput } from "@/lib/schemas/email";

type BroadcastPayload = {
  subject: string;
  monthLabel?: string;
  tagline?: string;
  classes?: NewsletterTemplateInput["classes"];
  camps?: NewsletterTemplateInput["camps"];
  story?: NewsletterTemplateInput["story"];
  baseUrl?: string;
};

export default function AdminNewsletterPage() {
  const subscribers = useQuery(api.newsletter.listNewsletterSubscribers);
  const sendBroadcast = useAction(api.newsletter.sendNewsletterBroadcast);

  const [subject, setSubject] = useState("Risu Team — newsletter");
  const [monthLabel, setMonthLabel] = useState("");
  const [tagline, setTagline] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyQuote, setStoryQuote] = useState("");
  const [storyAuthor, setStoryAuthor] = useState("");
  const [storyAuthorMeta, setStoryAuthorMeta] = useState("");
  const [storyReadMoreUrl, setStoryReadMoreUrl] = useState("");
  const [classesJson, setClassesJson] = useState("");
  const [campsJson, setCampsJson] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const activeCount =
    subscribers?.filter((s) => s.subscribed).length ?? null;

  const buildPayload = (): BroadcastPayload => {
    const payload: BroadcastPayload = {
      subject: subject.trim(),
      monthLabel: monthLabel.trim() || undefined,
      tagline: tagline.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined,
    };
    if (storyTitle.trim() && storyQuote.trim() && storyAuthor.trim()) {
      payload.story = {
        title: storyTitle.trim(),
        quote: storyQuote.trim(),
        author: storyAuthor.trim(),
        authorMeta: storyAuthorMeta.trim() || undefined,
        readMoreUrl: storyReadMoreUrl.trim() || undefined,
      };
    }
    if (classesJson.trim()) {
      try {
        const parsed = JSON.parse(classesJson) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error("Pole „Zajęcia (JSON)” musi być tablicą.");
        }
        payload.classes = parsed as NewsletterTemplateInput["classes"];
      } catch (e) {
        throw new Error(
          e instanceof Error
            ? e.message
            : "Nieprawidłowy JSON w polu „Zajęcia”."
        );
      }
    }
    if (campsJson.trim()) {
      try {
        const parsed = JSON.parse(campsJson) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error("Pole „Obozy (JSON)” musi być tablicą.");
        }
        payload.camps = parsed as NewsletterTemplateInput["camps"];
      } catch (e) {
        throw new Error(
          e instanceof Error ? e.message : "Nieprawidłowy JSON w polu „Obozy”."
        );
      }
    }
    return payload;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!subject.trim()) {
      setError("Temat wiadomości jest wymagany.");
      return;
    }
    let payload: BroadcastPayload;
    try {
      payload = buildPayload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd walidacji.");
      return;
    }
    setPending(true);
    try {
      const res = await sendBroadcast({
        subject: payload.subject,
        monthLabel: payload.monthLabel,
        tagline: payload.tagline,
        classes: payload.classes,
        camps: payload.camps,
        story: payload.story,
        baseUrl: payload.baseUrl,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wysyłka nie powiodła się.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-main dark:text-white">
          Newsletter
        </h1>
        <p className="mt-2 text-sm text-text-light dark:text-stone-400">
          Wyślij wiadomość do wszystkich aktywnych subskrybentów. Wymagane są
          zmienne środowiskowe Convex:{" "}
          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded">
            BREVO_API_KEY
          </code>
          ,{" "}
          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded">
            NEWSLETTER_RENDER_SECRET
          </code>
          ,{" "}
          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded">
            SITE_URL
          </code>{" "}
          lub{" "}
          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded">
            NEXT_PUBLIC_APP_URL
          </code>{" "}
          (ta sama wartość co publiczny adres strony).
        </p>
      </div>

      {subscribers === undefined ? (
        <p className="text-text-light dark:text-stone-400">Ładowanie listy…</p>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6">
          <p className="text-sm text-text-main dark:text-stone-200">
            Subskrybenci:{" "}
            <span className="font-bold">{subscribers.length}</span> wpisów,{" "}
            <span className="font-bold text-primary">{activeCount}</span>{" "}
            aktywnych (otrzymują mailing).
          </p>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="space-y-6 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6"
      >
        <div>
          <Label htmlFor="subject">Temat</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="monthLabel">Etykieta miesiąca (nagłówek)</Label>
          <Input
            id="monthLabel"
            value={monthLabel}
            onChange={(e) => setMonthLabel(e.target.value)}
            className="mt-1"
            placeholder="Np. KWIECIEŃ 2026"
          />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="baseUrl">Bazowy URL (opcjonalnie, linki w szablonie)</Label>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="mt-1"
            placeholder="https://risuteam.pl"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-700">
          <p className="text-sm font-bold text-text-main dark:text-white">
            Historia (opcjonalnie)
          </p>
          <p className="text-xs text-text-light dark:text-stone-400">
            Wypełnij tytuł, cytat i autora, aby dodać sekcję historii.
          </p>
          <div>
            <Label htmlFor="storyTitle">Tytuł</Label>
            <Input
              id="storyTitle"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="storyQuote">Cytat</Label>
            <textarea
              id="storyQuote"
              value={storyQuote}
              onChange={(e) => setStoryQuote(e.target.value)}
              className="mt-1 w-full min-h-[80px] rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="storyAuthor">Autor</Label>
            <Input
              id="storyAuthor"
              value={storyAuthor}
              onChange={(e) => setStoryAuthor(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="storyAuthorMeta">Autor — dopisek</Label>
            <Input
              id="storyAuthorMeta"
              value={storyAuthorMeta}
              onChange={(e) => setStoryAuthorMeta(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="storyReadMoreUrl">Link „czytaj więcej”</Label>
            <Input
              id="storyReadMoreUrl"
              value={storyReadMoreUrl}
              onChange={(e) => setStoryReadMoreUrl(e.target.value)}
              className="mt-1"
              type="url"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
          <Label htmlFor="classesJson">Zajęcia (JSON tablica, opcjonalnie)</Label>
          <textarea
            id="classesJson"
            value={classesJson}
            onChange={(e) => setClassesJson(e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-mono"
            placeholder='[{"title":"...","ageRange":"...","description":"..."}]'
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campsJson">Obozy (JSON tablica, opcjonalnie)</Label>
          <textarea
            id="campsJson"
            value={campsJson}
            onChange={(e) => setCampsJson(e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-mono"
            placeholder='[{"dateLabel":"...","title":"...","description":"..."}]'
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {result && (
          <div className="text-sm rounded-lg bg-stone-100 dark:bg-stone-800/80 p-4 space-y-1">
            <p>
              Wysłano: <strong>{result.sent}</strong>, błędy:{" "}
              <strong>{result.failed}</strong>
            </p>
            {result.errors.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-red-700 dark:text-red-300 max-h-40 overflow-y-auto">
                {result.errors.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Button type="submit" disabled={pending || activeCount === 0}>
          {pending
            ? "Wysyłanie…"
            : activeCount === 0
              ? "Brak aktywnych subskrybentów"
              : "Wyślij do wszystkich aktywnych"}
        </Button>
      </form>
    </div>
  );
}
