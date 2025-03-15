import { forwardRef, HTMLAttributes } from "react";
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
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { Clapperboard, Mail, Phone } from "lucide-react";
import Logo from "@/lib/logo";

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000";

export const metadata = {
  icons: {
    icon: "./favicon.ico",
    href: "./favicon.ico",
  },
  // metadataBase: new URL(defaultUrl),
  title: "Risu Team",
  description: "Klub sportwoy dla dzieci i młodzieży",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
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

const Navbar = async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="z-20 flex justify-center w-full h-32 border-b border-b-foreground/10">
      <div className="flex items-center justify-center w-full p-4 px-5 text-sm max-w-7xl">
        {process.env.NEXT_PUBLIC_PROD_TEMPLATE ? (
          <Link href="/" className="h-32 p-4" passHref>
            <Logo />
          </Link>
        ) : (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/aktualnosci" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Aktualności
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Grafik
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/lokalizacja" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Gdzie trenujemy
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Cennik
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Zapisy
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Obozy</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-md outline-none select-none bg-gradient-to-b from-muted/50 to-muted focus:shadow-md"
                          href="/"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium">
                            Oferta
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components that you can copy
                            and paste into your apps. Accessible. Customizable.
                            Open Source.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/obozy/letnie" title="Obozy letnie">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/obozy/zimowe" title="Obozy zimowe">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/obozy/polkolonie" title="Półkolonie">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>O nas</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
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
                <Link href="/kontakt" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
        {pathname === "/admin" &&
          (user && !hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />)}
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="flex justify-center w-full h-24 border-t border-foreground/10">
      <div className="flex items-center justify-between w-full p-4 px-5 text-sm max-w-7xl">
        <div className="h-24 p-4">
          <Logo />
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
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex flex-col items-center min-h-screen">
            <div className="flex flex-col items-center flex-1 w-full gap-20">
              <Navbar />
              <div className="flex flex-col flex-1 w-full gap-20 p-5 max-w-7xl">
                {children}
              </div>
              <Footer />
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
