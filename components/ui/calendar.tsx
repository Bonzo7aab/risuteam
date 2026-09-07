"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { pl } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={pl}
      {...props}
    />
  );
}

export { Calendar };
