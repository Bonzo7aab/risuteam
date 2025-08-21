"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/utils";
import {
  Award,
  Book,
  BookOpen,
  Calendar,
  HelpCircle,
  HotelIcon,
  Image as LucideImage,
  MapPin,
  Menu,
  Pencil,
  Users,
  X,
  LogIn,
  Sun,
  Snowflake,
  Bed,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { MobileAuthButtons } from "./mobile-auth-buttons";

const mobileCamps: { title: string; href: string }[] = [
  {
    title: "Półkolonie",
    href: "polkolonie",
  },
  {
    title: "Letnie",
    href: "letnie",
  },
  {
    title: "Zimowe",
    href: "zimowe",
  },
  {
    title: "Nocowanka",
    href: "nocowanka",
  },
];

const mobileNavigation: { title: string; href: string }[] = [
  {
    title: "Rodzaje zajęć",
    href: "/rodzaje_zajec",
  },
  {
    title: "Grafik",
    href: "/grafik",
  },
  {
    title: "Gdzie trenujemy",
    href: "/lokalizacja",
  },
  {
    title: "Galeria",
    href: "/galeria",
  },
  {
    title: "Kontakt",
    href: "/kontakt",
  },
];

const aboutNavigation: { title: string; href: string; description: string }[] = [
  {
    title: "Historia",
    href: "/historia",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Trenerzy",
    href: "/trenerzy",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Rodzaje zajęć",
    href: "/rodzaje_zajec",
    description:
      "Displays an indicator showing the completion status of a task.",
  },
  {
    title: "Egzaminy na pasy",
    href: "/egzaminy",
    description:
      "A set of layered sections that organize content into collapsible groups.",
  },
  {
    title: "FAQ",
    href: "/faq",
    description:
      "A form input that allows users to enter multiple values.",
  },
  {
    title: "Galeria",
    href: "/galeria",
    description:
      "A form input that allows users to enter multiple values.",
  },
  {
    title: "Hotele",
    href: "/hotele",
    description:
      "A form input that allows users to enter multiple values.",
  },
];

const aboutNavigationIcons: Record<string, React.ReactNode> = {
  Historia: <Book className="w-5 h-5 text-risu-400" />,
  Trenerzy: <Users className="w-5 h-5 text-risu-400" />,
  "Rodzaje zajęć": <BookOpen className="w-5 h-5 text-risu-400" />,
  "Egzaminy na pasy": <Award className="w-5 h-5 text-risu-400" />,
  FAQ: <HelpCircle className="w-5 h-5 text-risu-400" />,
  Galeria: <LucideImage className="w-5 h-5 text-risu-400" />,
  Hotele: <HotelIcon className="w-5 h-5 text-risu-400" />,
};

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-risu-400 hover:text-risu-600 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed top-0 left-0 w-full h-full bg-white z-50 transition-all duration-300 ease-in-out flex flex-col items-center overflow-y-auto",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full bg-white shadow text-risu-400 hover:text-risu-600 transition-all duration-200",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          aria-label="Close menu"
          style={{ transitionProperty: "opacity, transform" }}
        >
          <X size={28} />
        </button>
        <div className="w-full max-w-xs mx-auto flex flex-col items-center pt-8 pb-4">
          {/* Avatar */}
          <div className="w-36 h-36 rounded-full overflow-hidden shadow-md bg-risu-400 shadow-gray-400 mb-4 flex justify-center items-center">
            <Link href="/" className="h-24 w-24" passHref>
              <Logo fill="#fff" className="h-full w-auto drop-shadow-md" />
            </Link>
          </div>
          {/* Club Info */}
          <div className="text-center mb-6 text-xl font-semibold text-gray-800">
            RISU Team
          </div>
          {/* Camps Row */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {mobileCamps.map((item) => (
              <Link
                key={item.title}
                href={`/obozy?tab=${item.href}`}
                onClick={() => setIsOpen(false)}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-risu-400 flex items-center justify-center mb-2">
                  {item.title === "Letnie" && <Sun className="w-8 h-8 text-white" />}
                  {item.title === "Zimowe" && <Snowflake className="w-8 h-8 text-white" />}
                  {item.title === "Półkolonie" && <Calendar className="w-8 h-8 text-white" />}
                  {item.title === "Nocowanka" && <Bed className="w-8 h-8 text-white" />}
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
          {/* About Accordion */}
          <Accordion type="single" collapsible className="w-full mb-2 border-0">
            <AccordionItem value="about" className="border-0">
              <AccordionTrigger
                className="w-full justify-center text-base font-medium tracking-widest text-gray-700 hover:text-risu-400 hover:bg-white transition-colors uppercase px-0 py-3"
                style={{ letterSpacing: "0.1em" }}
              >
                O NAS
              </AccordionTrigger>
              <AccordionContent className="flex flex-col w-full gap-2 px-0">
                <div className="w-full bg-gray-100 rounded-xl shadow flex flex-col py-4 mb-4">
                  {aboutNavigation.map((item, i) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 text-center text-base font-medium tracking-widest text-gray-700 hover:text-risu-400 transition-colors uppercase flex items-center justify-center gap-2"
                      style={{ letterSpacing: "0.1em" }}
                    >
                      <span className="flex items-center justify-center mr-2">
                        {aboutNavigationIcons[item.title]}
                      </span>
                      <TextAnimate
                        animation="fadeIn"
                        delay={i * 0.06}
                        duration={0.3}
                        by="text"
                        className="inline-block"
                      >
                        {item.title}
                      </TextAnimate>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {/* Menu Items */}
          <div className="flex flex-col items-center w-full gap-2">
            {mobileNavigation.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-center text-base font-medium tracking-widest text-gray-700 hover:text-risu-400 transition-colors flex items-center justify-center gap-2 uppercase"
                style={{ letterSpacing: "0.1em" }}
              >
                <span className="flex items-center justify-center mr-2">
                  {/* Assuming mobileNavigationIcons is defined elsewhere or will be added */}
                  {/* For now, just a placeholder or a placeholder for a future implementation */}
                  {/* This part of the code was not provided in the edit_specification */}
                  {/* So, I'm keeping it as is, but it will cause a runtime error if not defined */}
                  {/* <span className="flex items-center justify-center mr-2">
                    {mobileNavigationIcons[item.title]}
                  </span> */}
                  {item.title}
                </span>
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col items-center w-full gap-2 mt-4">
              <MobileAuthButtons onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
