import Image from "next/image";
import Link from "next/link";

const SummerCamp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full py-10 max-w-7xl-lg">
        <h2 className="text-4xl md:text-5xl md:leading-[3.5rem] font-bold tracking-tight max-w-xl md:text-center md:mx-auto">
          OBÓZ RODZINNY ZAKOPANE 2025
        </h2>
        <h3 className="text-2xl md:text-3xl md:leading-[3.5rem] max-w-xl md:text-center md:mx-auto">
          Termin: <b className="text-gray-400 underline">5-12.07</b>.2025r.
        </h3>

        <div className="w-full mx-auto mt-8 space-y-20 md:mt-16">
          <div className="flex flex-col items-center md:flex-row gap-x-20 gap-y-6 md:odd:flex-row-reverse">
            <div className="w-full aspect-[6/4] bg-muted rounded-xl border border-border/50 basis-1/2">
              <Image
                alt="risu team hero"
                src="/zakopane_2025_ver2_1.jpg"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="basis-1/2 shrink-0">
              <h4 className="my-3 text-3xl font-semibold tracking-tight">
                Rodzinny obóz w Zakopanem – niezapomniane wakacje dla całej
                rodziny!
              </h4>
              <p className="text-muted-foreground text-[17px]">
                Czy marzycie o aktywnym wypoczynku w otoczeniu malowniczych
                Tatr? Zapraszamy na rodzinny obóz w Zakopanem w dniach 5-12
                lipca 2025! To wyjątkowa okazja, aby spędzić czas razem, na
                sportowo, ciesząc się pięknem gór, świetną zabawą i chwilami
                relaksu.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:flex-row-reverse gap-x-20 gap-y-6">
            <div className="basis-1/2 shrink-0">
              <h4 className="my-3 text-3xl font-semibold tracking-tight">
                Nie czekajcie!
              </h4>
              <p className="text-muted-foreground text-[17px]">
                Zarezerwujcie już dziś miejsce na rodzinnym obozie w Zakopanem i
                dajcie sobie szansę na niezapomnianą przygodę. Czekamy na Was!
                To nie tylko aktywny wypoczynek, ale też okazja do zacieśnienia
                rodzinnych więzi, zdobycia nowych umiejętności i stworzenia
                wspomnień, które zostaną z Wami na długie lata. Zakopane latem
                to idealne miejsce na rodzinne wakacje – świeże powietrze,
                górskie krajobrazy i mnóstwo atrakcji dla każdego.
              </p>
            </div>
            <div className="w-full aspect-[6/4] bg-muted rounded-xl border border-border/50 basis-1/2">
              <Image
                alt="risu team hero"
                src="/zakopane_2025_ver2_2.jpg"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>

          <div className="relative px-16 py-96">
            <iframe
              src="https://player.vimeo.com/video/1066025171?h=794321f599&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              className="absolute top-0 left-0 w-full h-full py-40 border-black sm:py-0 lg:px-80"
              title="Obóz letni Zakopane 2024"
            ></iframe>
          </div>
          <script src="https://player.vimeo.com/api/player.js"></script>

          <div className="flex flex-col items-center md:flex-row-reverse gap-x-20 gap-y-6">
            <div className="basis-1/2 shrink-0">
              <h4 className="my-3 text-3xl font-semibold tracking-tight">
                Gdzie?
              </h4>
              <Link href="https://www.basienka.com.pl/">Willa Basieńka</Link>
              <p className="text-muted-foreground text-[17px]">
                Zlokalizowana jest w Zakopanem w pięknej, zalesionej okolicy w
                pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch.
                Zakwaterowanie w pokojach 2,3,4,5 osobowych z pełnym węzłem
                sanitarnym, TV, WiFi. Ponadto do dyspozycji gości: sala
                kominkowa, bilard, tenis stołowy, grill, plac zabaw dla dzieci,
                siłownia plenerowa, bezpłatny parking.
              </p>
            </div>
            <div className="w-full aspect-[6/4] bg-muted rounded-xl border border-border/50 basis-1/2">
              <Image
                alt="risu team hero"
                src="/willabasienka.jpg"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>

          <section className="text-gray-300 bg-muted body-font">
            <div className="container px-5 py-24 mx-auto">
              <div className="mb-20 text-center">
                <h1 className="mb-4 text-2xl font-medium text-center text-white sm:text-3xl title-font">
                  Nasza oferta
                </h1>
              </div>
              <div className="flex flex-wrap -m-4">
                <div className="w-full p-4">
                  <h2 className="mb-4 font-medium tracking-widest text-center text-white text-md title-font sm:text-left">
                    W programie obozu znajdziecie między innymi:
                  </h2>
                  <nav className="flex flex-col items-center -mb-1 space-y-2 text-center sm:items-start sm:text-left">
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Wyjścia w góry i doliny</b> - odkryjcie urok
                      tatrzańskich szlaków, podziwiając zapierające dech w
                      piersiach widoki.
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Treningi na macie</b> – dla dzieci: judo i karate, dla
                      dorosłych: ćwiczenia wzmacniające dla każdego, niezależnie
                      od wieku i kondycji.
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Gry zespołowe</b> – integracja, zdrowa rywalizacja i
                      mnóstwo śmiechu podczas gier dla małych i dużych.
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Wizyta w Aqua Parku</b> – wodne szaleństwo i relaks w
                      basenach dla całej rodziny.
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Dyskoteka</b> – wieczór pełen tańca, muzyki i dobrej
                      energii
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Spotkanie z góralskim gawędziarzem</b> – posłuchajcie
                      fascynujących opowieści o tradycjach, kulturze i historii
                      Podhala.
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      <b>Animacje dla dzieci i dorosłych</b> – kreatywne
                      warsztaty, zabawy i konkursy, które zagwarantują uśmiech
                      na twarzach wszystkich uczestników.
                    </a>
                  </nav>
                </div>
                <div className="w-full p-4">
                  <br />
                  <h2 className="mb-4 font-medium tracking-widest text-center text-white text-md title-font sm:text-left">
                    Cena zawiera:
                  </h2>
                  <nav className="flex flex-col items-center -mb-1 space-y-2 text-center sm:items-start sm:text-left">
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      Zakwaterowanie 7 noclegów w Willi Basieńka w Zakopanem
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      Pełne wyżywienie – 3 posiłki dziennie
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      Opiekę kadry wychowawczej i trenerskiej
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      Ubezpieczenie NNW
                    </a>
                    <a>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-indigo-400 bg-gray-800 rounded-full">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      Program
                    </a>
                  </nav>
                </div>
              </div>
              <br />
              <div className="mt-12 text-lg leading-relaxed text-center text-red-400">
                Transport własny!
              </div>
              <br />
              <br />
              <div className="text-center">
                <div>Liczba miejsc ograniczona!!!</div>
                <div>Cena: 2190 zł</div>
                <div>Płatności:</div>
                <div>
                  I rata – zaliczka 200zł/os – zaliczka gwarantuje miejsce na
                  obozie
                </div>
                <div>II rata: 600zł/os. do 15.05.2025</div>
                <div>III rata: 600zł/os. do 15.06.2025</div>
                <div>IV rata: 790zł/os. do 1.07.2025</div>
                <div>
                  Opłaty prosimy dokonywać na poniższy nr konta w tytule
                  „Rodzinny obóz letni 5-12 lipca 2025, imiona i nazwiska
                  uczestników, nr wpłacanej raty”:
                </div>
                <div>Santander Bank:</div>
                <div>28 1090 1694 0000 0001 3471 6556</div>
                <br />
                <div>Zapisy i więcej informacji:</div>
                <div>Telefon: 533-020-048</div>
                <div>risu.biuro@gmail.com</div>
                <div>Do zobaczenia w Zakopanem!</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SummerCamp;
