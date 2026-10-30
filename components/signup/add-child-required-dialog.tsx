"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AddChildRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddChildRequiredDialog({
  open,
  onOpenChange,
}: AddChildRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-0 p-6 shadow-card dark:bg-[#2a2015]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight text-text-main dark:text-white">
            Najpierw dodaj dziecko
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Aby zapisać się na obóz, nocowankę lub inne wydarzenia, dodaj
            najpierw profil dziecka w panelu rodzica.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/dashboard/dzieci">Dodaj dziecko</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
