import { NumberTicker } from "@/components/ui/number-ticker";
import { TextAnimate } from "@/components/ui/text-animate";
import { Dumbbell, MapPinHouse, PersonStanding, TentTree } from "lucide-react";
import React from "react";

const Onas = () => {
  return (
    <div className="my-16 relative">
      <div className="w-full max-w-7xl px-4 md:px-0 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
          <div className="w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last">
            <div className="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
              <img
                className=" rounded-xl object-cover"
                src="/historia1.jpg"
                alt="about Us image"
              />
            </div>
            <img
              className="sm:ml-0 ml-auto rounded-xl object-cover"
              src="/historia2.jpg"
              alt="about Us image"
            />
          </div>
          <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
            <div className="w-full flex-col justify-center items-start gap-8 flex">
              <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                <div className="text-center text-4xl mb-8 flex justify-center">
                  <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
                    Historia klubu Risu Team
                  </h1>
                </div>
                <p className="text-lg font-normal leading-relaxed lg:text-start text-center">
                  <TextAnimate animation="blurInUp" by="character" once>
                    Klub sportowy został założony przez Kacpa Lewandowskiego w
                    2025 roku, bo podziale poprzedniego kluby założonego w 2014
                    roku. zajmujemy siętaki sportami jak Karate, Judo,
                    Gimnastyka, Samoobrona i inne. Działamy w wielu szkołąch na
                    teranie Mysiadłą i Ursynowa.
                  </TextAnimate>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-5 py-24 mx-auto">
        <h1 className="w-full text-center text-4xl mb-16">Nasze statystyki</h1>
        <div className="flex flex-wrap -m-4 text-center">
          <div className="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div className="border-2 border-risu-300 px-4 py-6 rounded-lg">
              <div className=" flex w-full justify-center">
                <PersonStanding size={40} />
              </div>
              <h2 className="title-font font-medium text-3xl text-risu-400">
                <NumberTicker value={300} />+
              </h2>
              <p className="leading-relaxed">Dzieci</p>
            </div>
          </div>
          <div className="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div className="border-2 border-risu-300 px-4 py-6 rounded-lg">
              <div className=" flex w-full justify-center">
                <MapPinHouse size={40} />
              </div>
              <h2 className="title-font font-medium text-3xl text-risu-400">
                <NumberTicker value={8} />
              </h2>
              <p className="leading-relaxed">Placówek</p>
            </div>
          </div>
          <div className="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div className="border-2 border-risu-300 px-4 py-6 rounded-lg">
              <div className=" flex w-full justify-center">
                <Dumbbell size={40} />
              </div>
              <h2 className="title-font font-medium text-3xl text-risu-400">
                <NumberTicker value={5} />
              </h2>
              <p className="leading-relaxed">Trenerów</p>
            </div>
          </div>
          <div className="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div className="border-2 border-risu-300 px-4 py-6 rounded-lg">
              <div className=" flex w-full justify-center">
                <TentTree size={40} />
              </div>
              <h2 className="title-font font-medium text-3xl text-risu-400">
                <NumberTicker value={10} />+
              </h2>
              <p className="leading-relaxed">Odbyte obozy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex divide-x-2 divide-risu-400 my-16 text-lg">
        <div className="w-1/2 px-16 leading-relaxed">
          <TextAnimate animation="blurInUp" by="character" once>
            Poza codziennymi zajęciami organizujemy również obozy sportowe dla
            dziecie oraz rodziców dziećmi. Bezpieczeństwo, nauka oraz dobra
            zabaw - to są głowne ich cechy. Staramy się pogłębiać
            zainteresowania sportem, poprzez gry i zabawy w grupach.
          </TextAnimate>
        </div>
        <div className="w-1/2 px-16 flex align-middle">
          <ul className="list-none flex-wrap flex">
            <li className="w-1/3">sport</li>
            <li className="w-1/3">zabawa</li>
            <li className="w-1/3">dyscyplina</li>
            <li className="w-1/3">technika</li>
            <li className="w-1/3">cierpliwość</li>
            <li className="w-1/3">przygoda</li>
            <li className="w-1/3">respekt</li>
            <li className="w-1/3">przyjaźń</li>
            <li className="w-1/3">pasja</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onas;
