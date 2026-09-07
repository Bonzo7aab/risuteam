import Link from "next/link";

const footerLinks = [
  { label: "O NAS", href: "/historia" },
  { label: "DYSCYPLINY", href: "/rodzaje_zajec" },
  { label: "CENNIK", href: "/cennik" },
  { label: "KONTAKT", href: "/kontakt" },
];

const programs = [
  { label: "Grafik", href: "/grafik" },
  { label: "Zajęcia", href: "/rodzaje_zajec" },
  { label: "Obozy i Nocowanki", href: "/obozy" },
  { label: "Cennik", href: "/cennik" },
  { label: "Galeria", href: "/galeria" },
];

const support = [
  { label: "Lokalizacje", href: "/lokalizacja" },
  { label: "Historia", href: "/historia" },
  { label: "Kadra", href: "/trenerzy" },
  { label: "FAQ", href: "/faq" },
  { label: "Regulamin", href: "/regulamin" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
];

const socialLinks = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: "public",
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: "alternate_email",
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: "play_arrow",
  },
];

export function SiteFooter() {
  return (
    <footer
      className="border-t border-stone-100 bg-[#f3f4f6] pt-14 pb-[calc(3.5rem+var(--risu-mobile-bottom-nav-h))] dark:border-stone-800 dark:bg-[#181109] md:py-14"
      id="contact"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile-only simplified footer */}
        <div className="mx-auto max-w-md text-center md:hidden">
          <h3 className="text-4xl font-black tracking-tight text-primary sm:text-5xl">
            RISUTEAM
          </h3>
          <p className="mx-auto mt-4 max-w-sm text-base font-semibold leading-relaxed text-slate-400 dark:text-stone-400">
            High-performance training for the next generation of champions.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex size-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm transition-colors hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
              >
                <span className="material-symbols-outlined text-[1.35rem]">
                  {item.icon}
                </span>
              </a>
            ))}
          </div>

          <ul className="mx-auto mt-9 grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-3 justify-items-center">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-base font-medium tracking-[0.08em] text-slate-400 underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors hover:text-primary dark:text-stone-400 dark:decoration-stone-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-stone-500">
            © {new Date().getFullYear()} Risu Team Academy. Energetic Mentor Design.
          </p>
        </div>

        {/* Desktop/tablet footer */}
        <div className="hidden md:block">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <h3 className="text-3xl font-black tracking-tight text-primary">RISUTEAM</h3>
              <p className="mb-6 mt-3 text-sm text-text-light dark:text-stone-400">
                Wspieramy rozwój następnego pokolenia przez ruch, dyscyplinę i zabawę.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex size-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm transition-colors hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
                  >
                    <span className="material-symbols-outlined text-[1.2rem]">
                      {item.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-text-main dark:text-white">Zajęcia</h4>
              <ul className="flex flex-col gap-2 text-sm text-text-light dark:text-stone-400">
                {programs.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-text-main dark:text-white">Wsparcie</h4>
              <ul className="flex flex-col gap-2 text-sm text-text-light dark:text-stone-400">
                {support.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-text-main dark:text-white">Kontakt</h4>
              <ul className="flex flex-col gap-3 text-sm text-text-light dark:text-stone-400">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-primary text-lg">
                    location_on
                  </span>
                  <span>ul. Przykładowa 123, Warszawa</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-primary text-lg">
                    call
                  </span>
                  <a href="tel:533020048" className="hover:text-primary">
                    533 020 048
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-primary text-lg">
                    mail
                  </span>
                  <a href="mailto:risu.biuro@gmail.com" className="hover:text-primary">
                    risu.biuro@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-8 dark:border-stone-800">
            <p className="text-xs text-stone-400">
              © {new Date().getFullYear()} Risu Team. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex gap-4 text-xs text-stone-400">
              <Link href="/polityka-prywatnosci" className="hover:text-primary">
                Polityka prywatności
              </Link>
              <span>|</span>
              <Link href="/regulamin" className="hover:text-primary">
                Regulamin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
