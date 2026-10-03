import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { BlurFade } from "@/components/ui/blur-fade";

export function CtaSection() {
  return (
    <section className="w-full px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <BlurFade inView delay={0.06} offset={16} blur="0px">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center shadow-card-hover sm:px-10 lg:px-16 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(255,255,255,0.22),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 size-48 rounded-full bg-amber-200/30 blur-3xl motion-safe:animate-orb-drift"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 top-8 size-40 rounded-full bg-white/15 blur-2xl motion-safe:animate-orb-drift"
            style={{ animationDelay: "-3.5s", animationDuration: "11s" }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Gotowy dołączyć do drużyny?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-white/92">
              Pierwsze zajęcia są gratis! Przyjdź, poznaj Risu i trenerów — zobacz,
              dlaczego dzieci kochają naszą salę.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard/zapisy"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/90 bg-transparent px-8 py-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 motion-reduce:hover:translate-y-0"
              >
                Zapisz się
                <ArrowRightIcon className="text-[1.05em] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/kontakt"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-stone-50 motion-reduce:hover:translate-y-0"
              >
                Skontaktuj się
                <ArrowRightIcon className="text-[1.05em] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
