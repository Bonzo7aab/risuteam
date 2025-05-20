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
import { Menu, SunMoon, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import Logo from "@/lib/logo";

const components: { title: string; href: string; description: string }[] = [
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

export const Navbar = () => {
  // const supabase = await createClient();
  // const headerList = await headers();
  // const pathname = headerList.get("x-current-path");

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 flex justify-center w-full h-32 shadow-md backdrop-filter backdrop-blur-md">
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
                    {components.map((component) => (
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:text-white/80 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed top-32 right-0 w-full h-[calc(100vh-8rem)] bg-risu-600 transform transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col py-8 space-y-4 text-center">
          {components.map((item, i) => (
            <div
              key={item.title}
              className={cn(
                "transform transition-all duration-300 ease-in-out",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0",
                `delay-[${i * 50}ms]`
              )}
            >
              <Link
                href={item.href}
                className="block px-4 py-2 text-2xl font-medium text-white hover:bg-risu-400 rounded-md transition-colors tracking-wide"
                onClick={() => setIsOpen(false)}
              >
                {item.title}
              </Link>
            </div>
          ))}
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
