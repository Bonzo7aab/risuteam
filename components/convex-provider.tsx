"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!convex) {
    return <>{children}</>;
  }

  // Use ConvexAuthProvider from react (not nextjs): it wraps AuthProvider
  // around ConvexProviderWithAuth so useAuth() is defined. ConvexAuthNextjsProvider
  // omits AuthProvider and causes "Cannot destructure 'isLoading' of useAuth()".
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
