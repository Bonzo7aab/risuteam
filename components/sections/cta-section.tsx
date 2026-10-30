import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { BlurFade } from "@/components/ui/blur-fade";

const secondaryLinks = [
  { href: "/grafik", label: "Grafik zajęć", icon: "calendar_month" },
  { href: "/obozy", label: "Obozy i nocowanki", icon: "camping" },
  { href: "/trenerzy", label: "Poznaj kadrę", icon: "groups" },
] as const;

export function CtaSection() {
  return (
    <section className="w-full px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <BlurFade inView delay={0.06} offset={16} blur="0px">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-card dark:border-white/12 dark:bg-surface-dark dark:shadow-card-dark">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary via-primary to-amber-300"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-sky-400/5 blur-3xl dark:bg-sky-400/8"
            aria-hidden
          />

          <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-14 lg:py-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Dołącz do Risu
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
                Gotowy dołączyć do drużyny?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
                Napisz lub zadzwoń — pomożemy dobrać dyscyplinę, grupę wiekową
                i dogodny termin. Pierwsze zajęcia konsultujemy indywidualnie.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/kontakt"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_rgba(244,157,37,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover motion-reduce:hover:translate-y-0"
                >
                  Skontaktuj się
                  <ArrowRightIcon className="text-[1.05em] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="mailto:kontakt@risuteam.pl"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-transparent px-5 text-sm font-semibold text-text-main transition-colors hover:border-primary/35 hover:bg-stone-50 dark:border-white/12 dark:text-stone-100 dark:hover:bg-white/5"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
                    mail
                  </span>
                  kontakt@risuteam.pl
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-5 dark:border-white/10 dark:bg-black/20 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                Zobacz też
              </p>
              <ul className="mt-4 space-y-2">
                {secondaryLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white dark:hover:bg-white/6"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden>
                          {item.icon}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold text-text-main dark:text-white">
                        {item.label}
                      </span>
                      <ArrowRightIcon className="text-stone-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
