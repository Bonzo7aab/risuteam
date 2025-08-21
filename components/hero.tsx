"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ContainerTextFlip } from "./ui/container-text-flip";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { TextAnimate } from "./ui/text-animate";
import { TestimonialType } from "@/app/types/types";

const rating = [
  {
    quote:
      "Profesjonalne treningi, świetna atmosfera i mnóstwo dobrej zabawy! 😊 Doświadczeni trenerzy dbają o rozwój każdego dziecka, niezależnie od poziomu zaawansowania. Treningi są nie tylko efektywne, ale też pełne pozytywnej energii, co sprawia, że chce się tu wracać. Jeśli szukasz miejsca, gdzie połączysz sport, rozwój i świetną zabawę, to dobrze trafiłeś. 😃",
    name: "Krysia",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "Polecam zajęcia w Risu team, profesjonalne podejście, ogromne doświadczenie trenerskie, dzieci będą zdrowe dzielne oraz zadowolone.",
    name: "Lev",
    title: "Hamlet",
  },
  {
    quote:
      "Polecam, zajęcia prowadzone solidnie i z pełnym zaangażowaniem trenerów. Jeśli dziecku coś nie wychodzi to trener potrafi wytłumaczyć i nie zniechęcić do dalszego działania 👍",
    name: "Michał",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "Profesjonalne podejście do dzieci jak i do zajęć !! serdecznie polecam 😊",
    name: "Kinga",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Naprawdę warto, dzieciaki uwielbiają trenera Kacpra 😉 zajęcia na wysokim poziomie , córka nabyła wiele nowych umiejętności i pokochała judo 😉 polecam wszystkim 👍",
    name: "Agata",
    title: "Moby-Dick",
  },
];

interface HeroProps {
  testimonials: TestimonialType[];
}

const Hero: React.FC<HeroProps> = ({ testimonials }) => {
  const router = useRouter();

  return (
    <div className="mx-2 md:mx-0 text-white font-rubikDirt">
      <div className="flex relative flex-col md:flex-row">
        <div className="absolute left-1/2 top-0">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-orange-500 rounded-full opacity-10 blur-xl"></div>
        </div>
        <div className="absolute right-0 bottom-0">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-orange-500 rounded-full opacity-20 blur-xl"></div>
        </div>
        <div className="flex flex-col flex-1 gap-4 mt-16 relative text-center md:text-left">
          <div className="absolute right-0 bottom-0">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-orange-500 rounded-full opacity-10 blur-2xl"></div>
          </div>
          <h1 className="text-8xl mb-16 flex flex-col md:flex-row gap-2">
            <span className="text-risu-400">
              <TextAnimate
                animation="blurInUp"
                by="character"
                once
                duration={1}
              >
                RISU
              </TextAnimate>
            </span>
            <span>
              {" "}
              <TextAnimate
                animation="blurInUp"
                by="character"
                once
                duration={1}
                delay={1}
              >
                TEAM
              </TextAnimate>
            </span>
          </h1>
          <div className="text-4xl">
            <TextAnimate animation="slideLeft" by="character" once duration={1}>
              533-020-048
            </TextAnimate>
          </div>
          <div
            onClick={() => router.push("/dashboard")}
            className="text-6xl md:mx-0 mx-auto w-fit px-4 py-2 text-black rounded-sm bg-risu-500 flex items-center cursor-pointer hover:bg-gray-300 hover:text-risu-500 transition-all duration-300"
          >
            <span>DOŁĄCZ</span>
            <ArrowRight className="w-12 h-12 animate-slideRight stroke-[3px]" />
          </div>
          <h1 className="text-4xl">
            <TextAnimate animation="slideLeft" by="character" once duration={1}>
              DO NAS
            </TextAnimate>
          </h1>
        </div>
        <div className="flex-1">
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </div>

      <div className="flex justify-center border-t-2 border-b-2 border-dashed border-risu-400 mt-16 mb-32 p-4">
        <ContainerTextFlip words={["JUDO", "KARATE", "AKROBATYKA", "SPORT"]} />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="relative flex-1 md:p-8">
          <Image
            alt="risu team hero 2"
            src="/mainLogo.jpg"
            className="object-cover w-full rounded-lg aspect-square"
            width={300}
            height={300}
          />
        </div>
        <div className="flex-1">
          <div className="my-12 text-4xl text-center font-rubikDirt leading-snug">
            Jesteśmy klubem sportowym oferującym zajęcia dla{" "}
            <span className="text-risu-400">
              dzieci, młodzieży oraz doroslych
            </span>
            . Zajęcia prowadzone są przez doświadczonych instruktorów, którzy
            dbają o bezpieczeństwo i indywidualne podejście do każdego
            uczestnika.
          </div>
        </div>
      </div>

      <div className="mt-16 mb-32 rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards items={rating} direction="right" speed="slow" />
      </div>
    </div>
  );
};

export default Hero;
