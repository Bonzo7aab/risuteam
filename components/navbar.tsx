"use client";

import { useState } from "react";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
// import { createClient } from "@/utils/supabase/server";
// import { headers } from "next/headers";
import {
  Menu,
  SunMoon,
  X,
  Sun,
  Snowflake,
  Bed,
  BookOpen,
  Award,
  Calendar,
  MapPin,
  Mail,
  Pencil,
  Book,
  Users,
  HelpCircle,
  Image as LucideImage,
  SunSnow,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import Logo from "@/lib/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import React from "react";
import { TextAnimate } from "@/components/ui/text-animate";

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
    title: "Kontakt",
    href: "/kontakt",
  },
];

const aboutNavigation: { title: string; href: string; description: string }[] =
  [
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
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
      title: "Egzaminy na pasy",
      href: "/egzaminy",
      description: "Visually or semantically separates content.",
    },
    {
      title: "FAQ",
      href: "/faq",
      description: "Najczęsciej zadawane pytanie.",
    },
    {
      title: "Galeria",
      href: "/galeria",
      description: "Galeria zdjęć oraz filmów z naszych zajęć i obozów.",
    },
  ];

const campIcons: Record<string, React.ReactNode> = {
  Letnie: <Sun className="w-6 h-6 text-risu-400" />, // Summer camp
  Zimowe: <Snowflake className="w-6 h-6 text-risu-400" />, // Winter camp
  Półkolonie: <SunSnow className="w-6 h-6 text-risu-400" />, // Summer camp
  Nocowanka: <Bed className="w-6 h-6 text-risu-400" />, // Sleepover
};

const mobileNavigationIcons: Record<string, React.ReactNode> = {
  "Rodzaje zajęć": <BookOpen className="w-5 h-5 text-risu-400" />,
  "Egzaminy na pasy": <Award className="w-5 h-5 text-risu-400" />,
  Grafik: <Calendar className="w-5 h-5 text-risu-400" />,
  "Gdzie trenujemy": <MapPin className="w-5 h-5 text-risu-400" />,
  Kontakt: <Mail className="w-5 h-5 text-risu-400" />,
};

const aboutNavigationIcons: Record<string, React.ReactNode> = {
  Historia: <Book className="w-5 h-5 text-risu-400" />,
  Trenerzy: <Users className="w-5 h-5 text-risu-400" />,
  "Rodzaje zajęć": <BookOpen className="w-5 h-5 text-risu-400" />,
  "Egzaminy na pasy": <Award className="w-5 h-5 text-risu-400" />,
  FAQ: <HelpCircle className="w-5 h-5 text-risu-400" />,
  Galeria: <LucideImage className="w-5 h-5 text-risu-400" />,
};

export const Navbar = () => {
  // const supabase = await createClient();
  // const headerList = await headers();
  // const pathname = headerList.get("x-current-path");

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 flex justify-center w-full h-32 shadow-md bg-black md:bg-transparent md:backdrop-filter md:backdrop-blur-md">
      <div className="flex items-center justify-between w-full p-4 px-5 max-w-7xl">
        <Link href="/" className="h-24 w-auto flex items-center" passHref>
          <Logo fill="#FD9E04" className="h-full w-auto drop-shadow-md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* <NavigationMenuItem>
                <Link href="/aktualnosci" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white font-medium hover:bg-risu-400 hover:text-black"
                    )}
                  >
                    Aktualności
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem> */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white font-medium hover:bg-risu-400 hover:text-black">
                  Obozy
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white rounded-md shadow-lg">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="group flex flex-col justify-end w-full h-full p-6 no-underline rounded-md outline-none select-none bg-gradient-to-b from-orange-100 to-orange-200 hover:from-orange-200 hover:to-risu-300 focus:shadow-md"
                          href="/obozy?tab=nocowanka"
                        >
                          <div className="w-full h-full flex justify-center text-orange-900">
                            <SunMoon size={80} />
                          </div>
                          <div className="mt-4 mb-2 text-lg font-medium text-orange-900 group-hover:text-gray-900">
                            Nocowanka
                          </div>
                          <p className="text-sm leading-tight text-orange-800 group-hover:text-gray-800">
                            Noclegi i zajęcia dla dzieci w wieku szkolnym.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/obozy?tab=letnie" title="Obozy letnie">
                      Letnie obozy sportowe i rekreacyjne dla dzieci i
                      młodzieży.
                    </ListItem>
                    <ListItem href="/obozy?tab=zimowe" title="Obozy zimowe">
                      Zimowe obozy narciarskie i snowboardowe w górach.
                    </ListItem>
                    <ListItem href="/obozy?tab=polkolonie" title="Półkolonie">
                      Wakacyjne półkolonie z zajęciami sportowymi i
                      rekreacyjnymi.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white font-medium hover:bg-risu-400 hover:text-black">
                  O nas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] rounded-md bg-white shadow-lg">
                    {aboutNavigation.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/grafik" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white font-medium hover:bg-risu-400 hover:text-black"
                    )}
                  >
                    Grafik
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/lokalizacja" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white font-medium hover:bg-risu-400 hover:text-black"
                    )}
                  >
                    Gdzie trenujemy
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/kontakt" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white font-medium hover:bg-risu-400 hover:text-black"
                    )}
                  >
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/zapisy" legacyBehavior passHref>
                  <NavigationMenuLink className="px-6 py-3 font-medium text-black transition-colors bg-risu-400 rounded-md hover:bg-risu-600">
                    Zapisy
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
        {/* 
        {pathname === "/admin" &&
          (user && !hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />)} */}
      </div>
    </nav>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

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
          <div className="w-36 h-36 rounded-full overflow-hidden shadow-md shadow-risu-400 mb-4 flex justify-center items-center">
            <Link href="/" className="h-24 w-24" passHref>
              <Logo fill="#FD9E04" className="h-full w-auto drop-shadow-md" />
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
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-300 transition shadow mb-2">
                  {campIcons[item.title] || (
                    <SunMoon className="w-6 h-6 text-risu-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {item.title}
                </div>
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
                  {mobileNavigationIcons[item.title]}
                </span>
                {item.title}
              </Link>
            ))}
            <Link
              href="/zapisy"
              onClick={() => setIsOpen(false)}
              className="py-3 text-center text-base bg-risu-300 w-fit px-8 hover:bg-risu-400 rounded-sm font-medium tracking-widest text-gray-700 transition-colors flex items-center justify-center gap-2 uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              <span className="flex items-center justify-center mr-2">
                <Pencil className="w-5 h-5 mr-2" /> Zapisy
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ListItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  className?: string;
  title: string;
  href: string;
  children: React.ReactNode;
}

const ListItem = ({ className, title, children, ...props }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-risu-500 group",
            className
          )}
          {...props}
        >
          <div className="text-md font-medium leading-none text-orange-900 group-hover:text-gray-900">
            {title}
          </div>
          <p className="text-sm leading-snug line-clamp-2 text-orange-700 group-hover:text-gray-700">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};
