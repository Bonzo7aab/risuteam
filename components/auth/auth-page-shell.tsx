import Image from "next/image";
import Link from "next/link";
import { Highlighter } from "@/components/ui/highlighter";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

type AuthPageShellProps = {
  children: React.ReactNode;
  /** Short label above the form column — shown only on mobile brand strip */
  mobileEyebrow?: string;
};

export function AuthPageShell({ children, mobileEyebrow }: AuthPageShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#14100a] lg:flex">
        {/* Atmosphere + motion */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(244,157,37,0.28)_0%,transparent_58%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.08)_0%,transparent_38%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_78%,rgba(244,157,37,0.16)_0%,transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,0,0,0.55)_0%,transparent_45%)]" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Drifting light orbs */}
          <div className="animate-orb-drift absolute left-[12%] top-[18%] size-40 rounded-full bg-primary/25 blur-3xl" />
          <div
            className="animate-orb-drift absolute bottom-[16%] right-[10%] size-52 rounded-full bg-amber-400/15 blur-3xl"
            style={{ animationDelay: "-3s", animationDuration: "11s" }}
          />
          <div
            className="animate-float absolute left-[22%] bottom-[28%] size-24 rounded-full bg-white/10 blur-2xl"
            style={{ animationDelay: "-1.5s" }}
          />
          <div
            className="animate-float absolute right-[18%] top-[24%] size-16 rounded-full bg-primary/35 blur-xl"
            style={{ animationDelay: "-2.2s", animationDuration: "7s" }}
          />

          {/* Soft light wedge */}
          <div className="animate-auth-shimmer absolute left-1/2 top-[8%] h-[70%] w-[55%] -translate-x-1/2 bg-[conic-gradient(from_210deg_at_50%_40%,transparent_0deg,rgba(244,157,37,0.12)_40deg,transparent_90deg)] blur-2xl" />

          {/* Concentric rings */}
          <div className="absolute left-1/2 top-[46%] size-[18rem] -translate-x-1/2 -translate-y-1/2">
            <div className="animate-auth-ring size-full rounded-full border border-white/10 shadow-[0_0_40px_rgba(244,157,37,0.08),inset_0_0_30px_rgba(255,255,255,0.03)]" />
          </div>
          <div className="absolute left-1/2 top-[46%] size-[26rem] -translate-x-1/2 -translate-y-1/2">
            <div
              className="animate-auth-ring size-full rounded-full border border-white/6 shadow-[0_0_60px_rgba(244,157,37,0.06)]"
              style={{ animationDelay: "-2s" }}
            />
          </div>
          <div className="absolute left-1/2 top-[46%] size-[34rem] -translate-x-1/2 -translate-y-1/2">
            <div
              className="animate-auth-ring size-full rounded-full border border-primary/15"
              style={{ animationDelay: "-4s", animationDuration: "12s" }}
            />
          </div>
          <div className="absolute left-1/2 top-[46%] size-[42rem] -translate-x-1/2 -translate-y-1/2">
            <div
              className="animate-auth-ring size-full rounded-full border border-dashed border-white/5"
              style={{ animationDelay: "-1s", animationDuration: "14s" }}
            />
          </div>

          {/* Floating accent sparks */}
          <span className="animate-float absolute left-[28%] top-[34%] size-1.5 rounded-full bg-primary/80 shadow-[0_0_12px_rgba(244,157,37,0.9)]" />
          <span
            className="animate-float absolute right-[26%] top-[38%] size-1 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.7)]"
            style={{ animationDelay: "-2s", animationDuration: "6.5s" }}
          />
          <span
            className="animate-float absolute left-[34%] bottom-[32%] size-1 rounded-full bg-amber-200/80 shadow-[0_0_10px_rgba(251,191,36,0.7)]"
            style={{ animationDelay: "-3.5s", animationDuration: "8s" }}
          />
          <span
            className="animate-float absolute right-[32%] bottom-[36%] size-2 rounded-full bg-primary/50 shadow-[0_0_16px_rgba(244,157,37,0.8)]"
            style={{ animationDelay: "-1s", animationDuration: "7.5s" }}
          />
        </div>

        <div className="relative z-10 flex min-h-screen w-full flex-col px-10 py-10 xl:px-14 xl:py-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90 drop-shadow-[0_0_18px_rgba(244,157,37,0.35)]">
            Portal rodzica
          </p>

          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <Link
              href="/"
              className="group flex flex-col items-center gap-5 text-center transition-transform duration-500 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <div className="relative">
                <div
                  className="animate-auth-glow absolute -inset-10 rounded-full bg-primary/30 blur-3xl"
                  aria-hidden
                />
                <div
                  className="absolute -inset-3 rounded-full bg-primary/15 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <div
                  className="relative flex size-40 items-center justify-center rounded-full bg-linear-to-b from-white/18 to-white/5 p-3 ring-1 ring-white/25 backdrop-blur-md xl:size-44"
                  style={{
                    boxShadow:
                      "0 28px 70px -18px rgba(0,0,0,0.75), 0 12px 28px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), 0 0 48px rgba(244,157,37,0.28), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -12px 24px rgba(0,0,0,0.25)",
                  }}
                >
                  <div
                    className="absolute inset-3 rounded-full bg-black/20 shadow-[inset_0_8px_24px_rgba(0,0,0,0.35)]"
                    aria-hidden
                  />
                  <Image
                    src="/logoWithBorder.png"
                    alt="Risu Team"
                    width={288}
                    height={288}
                    className="relative size-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                    priority
                  />
                </div>
              </div>
              <Highlighter
                action="underline"
                color="hsl(30, 91%, 55%)"
                strokeWidth={2}
                multiline={false}
                isView
              >
                <span className="text-4xl font-black tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] xl:text-5xl">
                  Risu Team
                </span>
              </Highlighter>
            </Link>

            <p className="mt-6 max-w-xs text-center text-sm leading-relaxed text-white/65 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] xl:text-base">
              Treningi, obozy i zapisy — spokojnie, w jednym miejscu.
            </p>
          </div>

          <p className="text-center text-xs text-white/40">
            © {year} Risu Team
            {" · "}
            <Link href="/polityka-prywatnosci" className="hover:text-white/70">
              Polityka prywatności
            </Link>
            {" · "}
            <Link href="/regulamin" className="hover:text-white/70">
              Regulamin
            </Link>
          </p>
        </div>
      </aside>

      <main className="relative flex flex-col bg-[#FDFBF7] dark:bg-background-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
          aria-hidden
        >
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/20" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link href="/" className="inline-flex">
              <RisuTeamLogoTitleMark
                variant="formRow"
                titleClassName="text-text-main dark:text-white"
                priority
              />
            </Link>
            {mobileEyebrow ? (
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                {mobileEyebrow}
              </p>
            ) : null}
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm dark:border-stone-800 dark:bg-[#2a2015]/95 dark:shadow-card-dark sm:p-8">
              {children}
            </div>
          </div>

          <p className="relative z-10 mt-8 text-center text-xs text-stone-400 lg:hidden">
            © {year} Risu Team
          </p>
        </div>
      </main>
    </div>
  );
}
