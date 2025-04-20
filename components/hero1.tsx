"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ContainerTextFlip } from "./ui/container-text-flip";
import { Button } from "./ui/button";
import Image from "next/image";
import { GradientMeshBackground } from "./ui/gradient-mesh-background";

const testimonials = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "/carousel1.jpg",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "/carousel2.jpg",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "/carousel3.jpg",
  },
];

export function CarouselPlugin() {
  return (
    <div className="my-16 text-white font-rubikDirt">
      <h1 className="text-center text-8xl">RISU TEAM</h1>

      <div className="flex">
        <div className="flex flex-col flex-1 gap-4 my-auto">
          <div className="text-8xl text-risu-500">DOŁĄCZ</div>
          <h1 className="text-4xl">DO NAS</h1>
          <div className="text-4xl">533-020-048</div>
        </div>
        <div className="flex-1">
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </div>

      <div className="flex justify-center border-t-2 border-b-2 border-dashed border-risu-400">
        <ContainerTextFlip words={["JUDO", "KARATE", "AKROBATYKA", "SPORT"]} />
      </div>

      <div className="flex mt-16">
        <div className="relative flex-1">
          <Image alt="risu team hero 2" src="/mainLogo.jpg" fill />
        </div>
        <div className="flex-1">
          <div className="my-12 text-4xl text-center font-rubikDirt">
            Jesteśmy klubem sportowym oferującym zajęcia dla dzieci, młodzieży
            oraz doroslych. Zajęcia prowadzone są przez doświadczonych
            instruktorów, którzy dbają o bezpieczeństwo i indywidualne podejście
            do każdego uczestnika.
          </div>
        </div>
      </div>
    </div>
  );
}
