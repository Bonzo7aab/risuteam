"use client";

import {
  AnimatedTestimonials,
  Testimonial,
} from "@/components/ui/animated-testimonials";
import { ContainerTextFlip } from "./ui/container-text-flip";
import { Button } from "./ui/button";
import Image from "next/image";
import { GradientMeshBackground } from "./ui/gradient-mesh-background";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    date: "21.06.2025 - 28.06.2025",
    location: "SP 141 Zamienie",
    src: "/carousel1.jpg",
    tab: "letnie",
  },
  {
    name: "Michael Rodriguez",
    date: "10.11.2025 - 17.11.2025",
    location: "SP 141 Zamienie",
    src: "/carousel2.jpg",
    tab: "zimowe",
  },
  {
    name: "Emily Watson",
    date: "10.07.2025 - 11.07.2025",
    location: "SP 141 Zamienie",
    src: "/carousel3.jpg",
    tab: "nocowanka",
  },
];

const testimonials2 = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

export default function Hero() {
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
            <span className="text-risu-400">RISU</span>
            <span>TEAM</span>
          </h1>
          <div className="text-4xl">533-020-048</div>
          <div
            onClick={() => router.push("/zapisy")}
            className="text-6xl md:mx-0 mx-auto w-fit px-4 py-2 text-black rounded-sm bg-risu-500 flex items-center cursor-pointer hover:bg-gray-300 hover:text-risu-500 transition-all duration-300"
          >
            <span>DOŁĄCZ</span>
            <ArrowRight className="w-12 h-12 animate-slideRight stroke-[3px]" />
          </div>
          <h1 className="text-4xl">DO NAS</h1>
        </div>
        <div className="flex-1">
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </div>

      <div className="flex justify-center border-t-2 border-b-2 border-dashed border-risu-400 mt-16 mb-32 p-4">
        <ContainerTextFlip words={["JUDO", "KARATE", "AKROBATYKA", "SPORT"]} />
      </div>

      <div className="flex">
        <div className="relative flex-1">
          <Image
            alt="risu team hero 2"
            src="/mainLogo.jpg"
            fill
            className="object-contain"
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

      <div className="h-[40rem] rounded-md flex flex-col antialiased  dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials2}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  );
}
