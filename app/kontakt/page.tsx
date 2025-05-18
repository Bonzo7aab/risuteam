"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendEmailAction } from "../api/actions";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessagesSquare, Mail, ArrowRight } from "lucide-react";

const initialState = {
  errors: {
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    phone_number: undefined,
    message: undefined,
  },
};

const Contact = () => {
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
    <div className="my-16">
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold sm:text-4xl relative w-fit">
          Skontaktuj się z nami!
          <div className="absolute -bottom-4 -left-0 w-24 border-t-4 border-risu-500 opacity-70"></div>
        </h1>
      </div>

      <div className="grid items-center gap-16 mt-12 lg:grid-cols-2 lg:gap-32">
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 relative">
          <div className="hidden xl:block absolute -top-4 -left-4 w-32 h-32 border-l-2 border-t-2 border-risu-500 opacity-70"></div>
          <div className="hidden xl:block absolute -bottom-4 -right-4 w-32 h-32 border-r-2 border-b-2 border-risu-500 opacity-70"></div>
          <h2 className="mb-8 text-xl font-semibold self-center">
            Wypełnij formularz poniżej
          </h2>

          <form action={formAction}>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstname" className="">
                    Imię
                  </Label>
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
                  <Label htmlFor="lastname" className="">
                    Nazwisko
                  </Label>
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
                <Label htmlFor="email" className="">
                  Email
                </Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  className="focus-visible:ring-transparent focus:border-risu-500"
                  required
                />
                {state?.errors?.email && (
                  <p className="px-2 text-sm text-red-400">
                    {state.errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number" className="">
                  Numer telefonu (opcjonalnie)
                </Label>
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
                <Label htmlFor="about" className="">
                  Wiadomość
                </Label>
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
                  <p className="px-2 text-sm text-red-400">
                    {state.errors.message}
                  </p>
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
        </div>

        <div className="divide-y divide-risu-500/30 p-4">
          <div className="flex py-6 gap-x-7">
            <MessagesSquare
              className="shrink-0 size-6 mt-1.5"
              stroke="#FD9E04"
            />
            <div className="grow">
              <h3 className="font-semibold ">FAQ</h3>
              <p className="mt-1 text-sm text-gray-200">
                Najczęściej zadawane pytania
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-risu-600 gap-x-2 focus:outline-hidden"
                href="/faq"
              >
                Przejdź
                <ArrowRight className="shrink-0 size-4 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="flex py-6 gap-x-7">
            <Phone className="shrink-0 size-6 mt-1.5" stroke="#FD9E04" />
            <div className="grow">
              <h3 className="font-semibold ">Telefon</h3>
              <p className="mt-1 text-sm text-gray-200">
                W razie pytań zapraszam do kontaktu telefonicznego.
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-risu-600 gap-x-2 focus:outline-hidden"
                href="#"
              >
                533 020 048
              </a>
            </div>
          </div>

          <div className="flex py-6 gap-x-7">
            <Mail className="shrink-0 size-6 mt-1.5" stroke="#FD9E04" />
            <div className="grow">
              <h3 className="font-semibold ">Email</h3>
              <p className="mt-1 text-sm text-gray-200">
                Zapraszamy do kontaktu przez email.
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-risu-600 gap-x-2 focus:outline-hidden"
                href="#"
              >
                risu.biuro@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
