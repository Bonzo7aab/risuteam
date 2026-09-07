import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/layout";
import { SiteFooterVisibility } from "@/components/layout/site-footer-visibility";
import { ConvexClientProvider } from "@/components/convex-provider";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { Toaster } from "@/components/ui/sonner";
import { RouteSplashOverlay } from "@/components/route-splash-overlay";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
  icons: {
    icon: "./favicon.ico",
    href: "./favicon.ico",
  },
  title: "Risu Team",
  description: "Klub sportowy dla dzieci i młodzieży — Judo, Karate, Gimnastyka",
};

const plusJakarta = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-slate-50 font-display antialiased overflow-x-hidden transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
          <main className="flex flex-col min-h-screen">
            <SiteHeader />
            <div className="min-w-0 flex-1 md:pb-0">{children}</div>
            <SiteFooterVisibility />
          </main>
          <CookieConsent variant="small" />
          <Toaster richColors closeButton duration={4000} position="top-center" />
          <RouteSplashOverlay />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
