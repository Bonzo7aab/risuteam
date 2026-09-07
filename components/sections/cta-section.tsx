import Link from "next/link";

export function CtaSection() {
  return (
    <section className="w-full bg-primary py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Gotowy dołączyć do drużyny?
        </h2>
        <p className="text-lg text-white/90 font-medium mb-8">
          Pierwsze zajęcia są gratis! Przyjdź, poznaj Risu i trenerów — zobacz,
          dlaczego dzieci kochają naszą salę.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/dashboard/zapisy"
            className="inline-flex justify-center rounded-xl border-2 border-white bg-transparent px-8 py-4 font-bold text-white hover:bg-white/10 transition-colors"
          >
            Zapisz się
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex justify-center rounded-xl bg-white px-8 py-4 font-bold text-primary hover:bg-stone-100 transition-colors"
          >
            Skontaktuj się
          </Link>
        </div>
      </div>
    </section>
  );
}
