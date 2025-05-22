import { TextAnimate } from "@/components/ui/text-animate";
import Image from "next/image";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risu Team | Rodzaje zajęć",
};

const RodzajeZajec = () => {
  return (
    <div className="my-8 md:my-16 max-w-screen-xl">
      <div className="text-center text-4xl flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Rodzaje zajęć</h1>
      </div>
      <div className="md:my-8 divide-y divide-risu-400 text-lg leading-relaxed">
        <div className="flex items-center mx-auto sm:flex-row flex-col py-16">
          <div className="sm:mr-10 inline-flex items-center justify-center rounded-full flex-shrink-0 relative mx-8">
            <Image
              src="/karate.jpg"
              alt="karate"
              className="object-cover w-full rounded-lg aspect-square"
              width={300}
              height={300}
            />
          </div>
          <div className="mx-8 mt-8">
            <h2 className="text-3xl mb-8 text-risu-400 tracking-wider text-center md:text-left">
              KARATE
            </h2>
            <p className="text-justify flex-grow sm:text-left mt-6 sm:mt-0">
              <TextAnimate animation="fadeIn" by="word" once duration={1}>
                Karate to tradycyjna japońska sztuka walki oparta na
                precyzyjnych ciosach, kopnięciach i blokach. Styl walki w karate
                łączy szybkość, równowagę oraz kontrolę nad własnym ciałem.
                Techniki wykonuje się z dużą dyscypliną, co minimalizuje ryzyko
                kontuzji. Trening obejmuje kata – ustalone sekwencje ruchów –
                oraz kumite, czyli walkę z przeciwnikiem. Karate ma charakter
                defensywny, a jedną z podstawowych zasad jest nieatakowanie jako
                pierwszy. Styl walki kształtuje nie tylko ciało, ale też
                charakter i samodyscyplinę. Karatecy rozwijają refleks, siłę
                oraz odporność psychiczną. To sztuka walki oparta na szacunku,
                pokorze i dążeniu do doskonałości.
              </TextAnimate>
            </p>
          </div>
        </div>

        <div className="flex items-center mx-auto py-16 sm:flex-row flex-col">
          <div className="mx-8 mt-8">
            <h2 className="text-3xl mb-8 text-risu-400 tracking-wider text-center md:text-left">
              JUDO
            </h2>
            <p className="text-justify flex-grow sm:text-left mt-6 sm:mt-0">
              <TextAnimate animation="fadeIn" by="word" once duration={1}>
                Judo to japońska sztuka walki skoncentrowana na rzutach,
                chwytach i dźwigniach. Styl walki w judo opiera się na
                wykorzystaniu siły i równowagi przeciwnika przeciwko niemu
                samemu. Zamiast uderzeń, judocy dążą do obalenia lub
                unieruchomienia rywala. Kluczową zasadą jest „ustępowanie, by
                zwyciężyć” (ju yoku go o seisu). Trening obejmuje naukę padów,
                rzutów oraz walki w parterze. Judo rozwija zwinność, siłę,
                wytrzymałość i precyzję. Walki odbywają się w kontrolowanych
                warunkach, co pozwala bezpiecznie stosować skuteczne techniki.
                To nie tylko sport, ale także filozofia oparta na szacunku,
                samodoskonaleniu i dyscyplinie.
              </TextAnimate>
            </p>
          </div>
          <div className="sm:order-none order-first sm:ml-10 inline-flex items-center justify-center rounded-full flex-shrink-0 relative mx-8">
            <Image
              src="/judo.jpg"
              alt="karate"
              className="object-cover w-full rounded-lg aspect-square"
              width={300}
              height={300}
            />
          </div>
        </div>

        <div className="flex items-center mx-auto sm:flex-row flex-col py-16">
          <div className="sm:mr-10 inline-flex items-center justify-center rounded-full flex-shrink-0 relative mx-8">
            <Image
              src="/rozciaganie.jpg"
              alt="karate"
              className="object-cover w-full rounded-lg aspect-square"
              width={300}
              height={300}
            />
          </div>
          <div className="mx-8 mt-8">
            <h2 className="text-3xl mb-8 text-risu-400 tracking-wider text-center md:text-left">
              ROZCIAGANIE
            </h2>
            <p className="text-justify flex-grow sm:text-left mt-6 sm:mt-0">
              <TextAnimate animation="fadeIn" by="word" once duration={1}>
                Zajęcia z rozciągania to trening skupiony na poprawie
                elastyczności i mobilności całego ciała. Rozpoczynają się zwykle
                od delikatnej rozgrzewki, przygotowującej mięśnie do pracy.
                Następnie uczestnicy wykonują zestaw ćwiczeń rozciągających,
                obejmujących różne partie ciała, takie jak nogi, plecy, barki
                czy biodra. W trakcie zajęć stosuje się zarówno rozciąganie
                dynamiczne, jak i statyczne. Ćwiczenia prowadzone są w spokojnym
                tempie, z dużym naciskiem na prawidłowy oddech i koncentrację.
                Zajęcia są odpowiednie dla osób w każdym wieku i na każdym
                poziomie sprawności. Regularne uczestnictwo poprawia postawę,
                zmniejsza napięcia mięśniowe i pomaga zapobiegać kontuzjom. To
                doskonała forma aktywności dla osób pragnących zadbać o swoje
                ciało i dobre samopoczucie.
              </TextAnimate>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RodzajeZajec;
