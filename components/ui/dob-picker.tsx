"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseStoredDob(ymd: string): Date | undefined {
  const d = parse(ymd.trim(), "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export type DobPickerProps = {
  id: string;
  valueYmd: string;
  onChangeYmd: (value: string) => void;
  /** Raise z-index when used inside a `Dialog` so the calendar appears on top. */
  inDialog?: boolean;
  /**
   * Portal popover into this element (e.g. the open `DialogContent` node) so the
   * calendar is inside the dialog for focus/pointer-outside checks.
   */
  popoverContainer?: HTMLElement | null;
  className?: string;
};

export function DobPicker({
  id,
  valueYmd,
  onChangeYmd,
  inDialog = false,
  popoverContainer = null,
  className,
}: DobPickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = valueYmd.trim() ? parseStoredDob(valueYmd) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {selected
            ? format(selected, "d MMMM yyyy", { locale: pl })
            : "Wybierz datę"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={inDialog ? popoverContainer ?? undefined : undefined}
        className={cn("w-auto p-0", inDialog ? "z-[100]" : "z-[60]")}
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onChangeYmd(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          disabled={{ after: new Date() }}
          captionLayout="dropdown"
          defaultMonth={selected ?? new Date(new Date().getFullYear() - 8, 0)}
        />
        {selected && (
          <div className="border-t border-border px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChangeYmd("");
                setOpen(false);
              }}
            >
              Wyczyść datę
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
