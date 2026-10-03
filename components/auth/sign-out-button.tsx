"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  children = "Wyloguj się",
  className,
  variant = "outline",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline-solid" | "secondary" | "ghost" | "link";
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleClick = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <Button type="button" variant={variant} className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}
