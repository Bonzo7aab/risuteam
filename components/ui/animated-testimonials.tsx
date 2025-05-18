"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type Testimonial = {
  name: string;
  date: string;
  location: string;
  src: string;
  tab?: "polkolonie" | "letnie" | "zimowe" | "nocowanka";
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay && !isHovered) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, isHovered]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className="max-w-sm px-4 py-20 mx-auto font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-20">
        <div>
          <div
            className="relative w-full h-96 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="object-fill object-center w-full h-full rounded-3xl"
                  />
                  {isActive(index) && isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() =>
                        router.push(`/obozy?tab=${testimonial.tab}`)
                      }
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col justify-center gap-4 items-center p-6 text-white"
                    >
                      <h3 className="text-4xl font-bold mb-6 text-risu-400">
                        {testimonial.name}
                      </h3>
                      <p className="text-xl font-semibold text-gray-300">
                        {testimonial.date}
                      </p>
                      <p className="text-lg font-semibold">
                        {testimonial.location}
                      </p>
                      <div className="text-3xl font-bold hover:text-risu-300 transition duration-300">
                        Przejdź do szczegółów
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
