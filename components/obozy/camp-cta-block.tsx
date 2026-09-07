import Link from "next/link";
import { campRegistrationCtaHref } from "@/lib/camp-registration-links";

export type CampCtaBlockProps = {
  headline?: string;
  description?: string;
  signUpHref: string;
  signUpLabel?: string;
  questionHref?: string;
  questionLabel?: string;
  isRegistrationClosed?: boolean;
};

export function CampCtaBlock({
  headline = "Gotowi na przygodę życia?",
  description = "Zarezerwuj miejsce już dziś i dołącz do wesołej ekipy Risu Camp. Liczba miejsc ograniczona!",
  signUpHref,
  signUpLabel = "Zapisz się teraz",
  questionHref = "/kontakt",
  questionLabel = "Zadaj pytanie",
  isRegistrationClosed = false,
}: CampCtaBlockProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-primary px-6 py-10 md:px-12 md:py-14 text-primary-foreground">
          <div className="absolute top-4 right-4 md:top-6 md:right-8 opacity-20" aria-hidden>
            <span className="material-symbols-outlined text-6xl md:text-8xl">terrain</span>
          </div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {headline}
            </h2>
            <p className="text-primary-foreground/90 text-sm md:text-base mb-6">
              {description}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={campRegistrationCtaHref(signUpHref, isRegistrationClosed)}
                onClick={(e) => {
                  if (isRegistrationClosed) e.preventDefault();
                }}
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                  isRegistrationClosed
                    ? "bg-white/20 cursor-not-allowed"
                    : "bg-white text-primary hover:bg-white/90"
                }`}
                aria-disabled={isRegistrationClosed}
              >
                {signUpLabel}
              </Link>
              <Link
                href={questionHref}
                className="inline-flex items-center justify-center rounded-xl border-2 border-white px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              >
                {questionLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
