"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Set it in Vercel environment variables so Convex Auth can wrap the app.",
  );
}

// Always construct a client and wrap with ConvexAuthProvider. Skipping the
// provider makes useAuthActions() return undefined and 500s every page that
// renders SiteHeader (the public homepage included).
const convex = new ConvexReactClient(
  convexUrl ?? "https://unconfigured.convex.cloud",
);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use ConvexAuthProvider from react (not nextjs): it wraps AuthProvider
  // around ConvexProviderWithAuth so useAuth() is defined. ConvexAuthNextjsProvider
  // omits AuthProvider and causes "Cannot destructure 'isLoading' of useAuth()".
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
