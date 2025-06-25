import { GridPatternBackground } from "@/components/ui/grid-pattern-background";
import Logo from "@/components/ui/logo";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils";
import { Clapperboard, Mail, Phone } from "lucide-react";
import { Protest_Riot, Rubik_Dirt } from "next/font/google";
import { forwardRef, HTMLAttributes } from "react";
import { Navbar } from "../components/navbar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  icons: {
    icon: "./favicon.ico",
    href: "./favicon.ico",
  },
  title: "Risu Team",
  description: "Klub sportwoy dla dzieci i młodzieży",
};

const protestRiot = Protest_Riot({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-protestRiot",
});
const rubikDirt = Rubik_Dirt({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rubikDirt",
});

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
    href: "/docs/primitives/scroll-area",
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

interface ListItemProps extends HTMLAttributes<HTMLAnchorElement> {
  className?: string;
  title: string;
  href: string;
  children: React.ReactNode;
}

const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

const Footer = () => {
  return (
    <footer className="flex justify-center w-full h-24 border-t border-foreground/10">
      <div className="flex items-center justify-between w-full p-4 px-5 text-sm max-w-7xl">
        <div className="h-16">
          <Logo fill="#fff" className="h-full w-auto drop-shadow-md" />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Mail />
            <span>risu.biuro@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone />
            <span>533 020 048</span>
          </div>
          <a
            className="flex items-center gap-2"
            href="https://www.youtube.com/@risuteam"
          >
            <Clapperboard />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${protestRiot.variable} ${rubikDirt.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <Providers>
          <main className="flex flex-col items-center min-h-screen font-protestRiot relative w-full">
            <GridPatternBackground
              gridType="lines"
              gridSize={32}
              opacity={0.3}
              color="#F29602"
              animate={false}
              className="fixed inset-0 -z-10"
            />
            <div className="flex flex-col items-center flex-1 w-full relative">
              <Navbar />
              <div className="flex flex-col flex-1 w-full xl:max-w-7xl tracking-wider relative">
                {children}
              </div>
              <Footer />
            </div>
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
