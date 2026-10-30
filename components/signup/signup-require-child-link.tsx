"use client";

import {
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddChildRequiredDialog } from "@/components/signup/add-child-required-dialog";
import { cn } from "@/lib/utils";

type SignupRequireChildLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "onClick"
> & {
  children: ReactNode;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * „Zapisz się” link for camps / events: if the user is logged in without a
 * child profile, show a dialog instead of navigating to registration.
 */
export function SignupRequireChildLink({
  href,
  children,
  className,
  disabled,
  onClick,
  ...rest
}: SignupRequireChildLinkProps) {
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const myChildren = useQuery(
    api.children.listMyChildren,
    isAuthenticated === true ? {} : "skip"
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      if (disabled) event.preventDefault();
      return;
    }
    if (
      isAuthenticated === true &&
      myChildren !== undefined &&
      myChildren.length === 0
    ) {
      event.preventDefault();
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Link
        href={href}
        className={cn(
          disabled && "pointer-events-none cursor-not-allowed opacity-70",
          className
        )}
        aria-disabled={disabled || undefined}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </Link>
      <AddChildRequiredDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
