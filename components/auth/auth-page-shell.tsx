import Image from "next/image";
import Link from "next/link";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

type AuthPageShellProps = {
  children: React.ReactNode;
  /** Short label above the form column — shown only on mobile brand strip */
  mobileEyebrow?: string;
};

export function AuthPageShell({ children, mobileEyebrow }: AuthPageShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] lg:min-h-screen">
      {/* One full-page atmosphere — spans both columns and sits under the menu */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-[#F7F0E6] dark:bg-[#0c0a08]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_18%,rgba(244,157,37,0.22)_0%,transparent_48%)] dark:bg-[radial-gradient(ellipse_at_22%_18%,rgba(244,157,37,0.28)_0%,transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_12%,rgba(244,157,37,0.12)_0%,transparent_42%)] dark:bg-[radial-gradient(ellipse_at_78%_12%,rgba(244,157,37,0.14)_0%,transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_78%,rgba(200,140,60,0.10)_0%,transparent_45%)] dark:bg-[radial-gradient(ellipse_at_70%_78%,rgba(180,120,40,0.12)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_72%,rgba(255,255,255,0.55)_0%,transparent_30%)] dark:bg-[radial-gradient(circle_at_12%_72%,rgba(255,255,255,0.05)_0%,transparent_30%)]" />
        <div
          className="absolute inset-0 opacity-[0.045] dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(28,22,13,0.55) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0 hidden opacity-[0.06] dark:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="animate-orb-drift absolute left-[6%] top-[14%] size-48 rounded-full bg-primary/18 blur-3xl dark:bg-primary/22" />
        <div
          className="animate-orb-drift absolute right-[8%] top-[8%] size-64 rounded-full bg-amber-400/16 blur-3xl dark:bg-amber-400/12"
          style={{ animationDelay: "-3s", animationDuration: "11s" }}
        />
        <div
          className="animate-float absolute left-[48%] top-[58%] size-36 rounded-full bg-white/50 blur-2xl dark:bg-white/8"
          style={{ animationDelay: "-1.5s" }}
        />
        <div
          className="animate-orb-drift absolute bottom-[6%] left-[28%] size-52 rounded-full bg-primary/12 blur-3xl dark:bg-primary/10"
          style={{ animationDelay: "-6s", animationDuration: "13s" }}
        />

        {/* Scattered rings across the full viewport */}
        <div
          className="animate-auth-ring absolute -left-[10%] top-[4%] size-[24rem] rounded-full border border-stone-800/10 dark:border-white/10"
          style={{ animationDuration: "14s" }}
        />
        <div
          className="animate-auth-ring absolute right-[-8%] top-[18%] size-[30rem] rounded-full border border-primary/20 dark:border-primary/12"
          style={{ animationDelay: "-2.5s", animationDuration: "17s" }}
        />
        <div
          className="animate-auth-ring absolute left-[18%] bottom-[-12%] size-[22rem] rounded-full border border-stone-800/10 dark:border-white/10"
          style={{ animationDelay: "-5s", animationDuration: "12s" }}
        />
        <div
          className="animate-auth-ring absolute right-[22%] bottom-[6%] size-[16rem] rounded-full border border-amber-600/20 dark:border-amber-300/15"
          style={{ animationDelay: "-1s", animationDuration: "10s" }}
        />
        <div className="absolute left-[38%] top-[10%] size-[10rem] -rotate-12 rounded-full border border-dashed border-stone-800/12 dark:border-white/10" />
        <div className="absolute right-[40%] top-[42%] size-[7rem] rotate-[18deg] rounded-full border border-stone-800/8 dark:border-white/8" />

        <div className="absolute left-[14%] top-[48%] size-3 rounded-full bg-primary/45 blur-[1px]" />
        <div className="absolute right-[18%] top-[28%] size-2 rounded-full bg-stone-700/25 dark:bg-white/35" />
        <div className="absolute left-[56%] top-[36%] size-1.5 rounded-full bg-amber-600/40 dark:bg-amber-200/50" />
        <div className="absolute left-[32%] top-[16%] size-1 rounded-full bg-stone-700/20 dark:bg-white/25" />
        <div className="absolute right-[30%] bottom-[22%] size-2 rounded-full bg-primary/35 dark:bg-primary/30" />
      </div>

      <div className="relative z-10 grid min-h-[inherit] lg:grid-cols-2">
        <aside className="relative hidden min-h-[inherit] lg:flex">
          <div className="flex min-h-[inherit] w-full flex-col items-center px-10 pb-10 pt-6 text-center xl:px-14 xl:pt-8">
            <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center py-8">
              <div className="flex w-full flex-col items-center gap-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary drop-shadow-[0_0_18px_rgba(244,157,37,0.25)] dark:text-primary/90 dark:drop-shadow-[0_0_18px_rgba(244,157,37,0.35)]">
                  Portal rodzica
                </p>

                <Link
                  href="/"
                  className="group flex flex-col items-center gap-5"
                >
                  <div className="relative transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <div
                      className="animate-auth-glow absolute -inset-10 rounded-full bg-primary/25 blur-3xl dark:bg-primary/30"
                      aria-hidden
                    />
                    <div
                      className="absolute -inset-3 rounded-full bg-primary/12 blur-xl opacity-70 transition-opacity duration-500 group-hover:opacity-100 dark:bg-primary/15"
                      aria-hidden
                    />
                    <div
                      className="relative flex size-36 items-center justify-center rounded-full bg-linear-to-b from-white to-stone-100/90 p-3 ring-1 ring-stone-300/70 backdrop-blur-md dark:from-white/18 dark:to-white/5 dark:ring-white/25 xl:size-40"
                      style={{
                        boxShadow:
                          "0 28px 70px -18px rgba(28,22,13,0.28), 0 12px 28px -10px rgba(28,22,13,0.18), 0 0 0 1px rgba(255,255,255,0.65), 0 0 40px rgba(244,157,37,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
                      }}
                    >
                      <div
                        className="absolute inset-3 rounded-full bg-stone-900/5 shadow-[inset_0_8px_24px_rgba(28,22,13,0.08)] dark:bg-black/20 dark:shadow-[inset_0_8px_24px_rgba(0,0,0,0.35)]"
                        aria-hidden
                      />
                      <Image
                        src="/logoWithBorder.png"
                        alt="Risu Team"
                        width={288}
                        height={288}
                        className="relative size-full object-contain drop-shadow-[0_8px_20px_rgba(28,22,13,0.2)] dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                        priority
                      />
                    </div>
                  </div>

                  <span className="relative inline-block text-4xl font-black tracking-tight text-text-main drop-shadow-none dark:text-white dark:drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] xl:text-5xl">
                    Risu Team
                    <span
                      className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-primary"
                      aria-hidden
                    />
                  </span>
                </Link>

                <p className="max-w-[16rem] text-sm leading-relaxed text-stone-600 dark:text-white/65 dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] xl:max-w-xs xl:text-base">
                  Treningi, obozy i zapisy — spokojnie, w jednym miejscu.
                </p>
              </div>
            </div>

            <p className="w-full text-xs text-stone-400 dark:text-white/40">
              © {year} Risu Team
              {" · "}
              <Link
                href="/polityka-prywatnosci"
                className="hover:text-stone-600 dark:hover:text-white/70"
              >
                Polityka prywatności
              </Link>
              {" · "}
              <Link
                href="/regulamin"
                className="hover:text-stone-600 dark:hover:text-white/70"
              >
                Regulamin
              </Link>
            </p>
          </div>
        </aside>

        <main className="relative flex flex-col">
          <div className="relative z-10 flex flex-1 flex-col px-5 pb-8 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-10 lg:pt-12">
            <div className="mb-6 flex flex-col items-center gap-3 text-center lg:hidden">
              {mobileEyebrow ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {mobileEyebrow}
                </p>
              ) : null}
              <Link href="/" className="inline-flex">
                <RisuTeamLogoTitleMark
                  variant="formRow"
                  underlineStyle="solid"
                  titleClassName="text-text-main dark:text-white"
                  priority
                />
              </Link>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="rounded-2xl border border-stone-200/80 bg-white/95 p-6 shadow-[0_20px_50px_-24px_rgba(28,22,13,0.28)] backdrop-blur-sm dark:border-white/10 dark:bg-[#2a2015]/92 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)] sm:p-8">
                {children}
              </div>
            </div>

            <p className="relative z-10 mt-8 text-center text-xs text-stone-400 dark:text-white/40 lg:hidden">
              © {year} Risu Team
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
