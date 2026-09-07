"use client";

import { useMutation } from "convex/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";

type Status = "idle" | "loading" | "success" | "error" | "missing";

function WypiszContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const unsubscribe = useMutation(api.newsletter.unsubscribeByToken);
  const [status, setStatus] = useState<Status>(() =>
    token ? "loading" : "missing"
  );
  const [message, setMessage] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        await unsubscribe({ token });
        if (!cancelled) {
          setStatus("success");
          setMessage("Zostałeś wypisany z newslettera Risu Team.");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            e instanceof Error ? e.message : "Nie udało się wypisać z listy."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, unsubscribe]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:py-24">
      <h1 className="text-2xl font-bold text-text-main dark:text-white mb-4">
        Newsletter
      </h1>
      {status === "missing" && (
        <p className="text-text-light dark:text-stone-400">
          Brak tokenu w linku. Użyj przycisku „Wypisz się” z otrzymanej
          wiadomości e-mail lub skontaktuj się z nami.
        </p>
      )}
      {status === "loading" && (
        <p className="text-text-light dark:text-stone-400">Przetwarzanie…</p>
      )}
      {status === "success" && message && (
        <p className="text-emerald-700 dark:text-emerald-400">{message}</p>
      )}
      {status === "error" && message && (
        <p className="text-red-600 dark:text-red-400">{message}</p>
      )}
      <p className="mt-8">
        <Link
          href="/"
          className="text-primary font-bold risu-underline"
        >
          Wróć na stronę główną
        </Link>
      </p>
    </div>
  );
}

export default function NewsletterWypiszPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 md:py-24">
          <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
        </div>
      }
    >
      <WypiszContent />
    </Suspense>
  );
}
