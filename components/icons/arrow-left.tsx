import * as React from "react";

import { cn } from "@/lib/utils";

type Props = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function ArrowLeftIcon({ className, title, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className={cn("inline-block align-middle", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M19 12H7" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

