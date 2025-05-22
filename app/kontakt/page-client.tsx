"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useActionState, useEffect } from "react";
import { sendEmailAction } from "../api/actions";

const initialState = {
  errors: {
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    phone_number: undefined,
    message: undefined,
  },
};

const ContactClient = () => {
  const [state, formAction, isPending] = useActionState(
    sendEmailAction,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        variant: "success",
        title: state.success,
        description: "Odpowiadamy zazwyczaj w ciągu 1-2 dni.",
      });
    } else if (state.error) {
      toast({
        variant: "destructive",
        title: state.error,
        description: "Wyślij mail ręcznie ze swojej skrzynki.",
      });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstname">Imię</Label>
            <Input
              type="text"
              name="firstname"
              id="firstname"
              className="focus-visible:ring-transparent focus:border-risu-500"
              required
              maxLength={32}
            />
            {state?.errors?.firstname && (
              <p className="px-2 text-sm text-red-400">
                {state.errors.firstname}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastname">Nazwisko</Label>
            <Input
              type="text"
              name="lastname"
              id="lastname"
              className="focus-visible:ring-transparent focus:border-risu-500"
              required
              maxLength={32}
            />
            {state?.errors?.lastname && (
              <p className="px-2 text-sm text-red-400">
                {state.errors.lastname}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            className="focus-visible:ring-transparent focus:border-risu-500"
            required
          />
          {state?.errors?.email && (
            <p className="px-2 text-sm text-red-400">{state.errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone_number">Numer telefonu (opcjonalnie)</Label>
          <Input
            type="text"
            name="phone_number"
            id="phone_number"
            className="focus-visible:ring-transparent focus:border-risu-500"
          />
          {state?.errors?.phone_number && (
            <p className="px-2 text-sm text-red-400">
              {state.errors.phone_number}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="about">Wiadomość</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            className="focus-visible:ring-transparent focus:border-risu-500"
            required
            minLength={10}
            maxLength={500}
          ></Textarea>
          {state?.errors?.message && (
            <p className="px-2 text-sm text-red-400">{state.errors.message}</p>
          )}
        </div>
      </div>

      <div className="grid mt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-risu-300 hover:bg-risu-500"
        >
          {isPending ? "Wysyłam..." : "Wyślij"}
        </Button>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-200">
          Odpowiadamy zazwyczaj w ciągu 1-2 dni.
        </p>
      </div>
    </form>
  );
};

export default ContactClient;
