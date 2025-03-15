"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { FormEvent, useRef, useState } from "react";
import { z } from "zod";

const Contact = () => {
  const ref = useRef<HTMLFormElement>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const sendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonDisabled(true);
    const formData = new FormData(e.currentTarget);
    const form_values = Object.fromEntries(formData);

    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form_values),
    });

    // if(response.status === 200) {
    //     toast.success('Wiadomość została wysłana!')
    // } else {
    //     toast.error('Błąd wysłania wiadomości. Skontaktuj się ze mną inaczej.')
    // }
    setButtonDisabled(false);
  };

  const User = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    phone_numer: z.string(),
    details: z.string(),
  });

  return (
    <div className="max-w-5xl mx-auto text-muted-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Kontakt</h1>
        <p className="mt-1 text-muted-foreground/50">Skontaktuj się z nami!</p>
      </div>

      <div className="grid items-center gap-6 mt-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col p-4 border rounded-xl sm:p-6 lg:p-8">
          <h2 className="mb-8 text-xl font-semibold">
            Wypełnij formularz poniżej
          </h2>

          <form
            ref={ref}
            onSubmit={async (formData) => {
              await sendEmail(formData);
              ref.current?.reset();
            }}
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstname" className="sr-only">
                    Imię
                  </Label>
                  <Input
                    required
                    type="text"
                    name="firstname"
                    id="firstname"
                    className="focus-visible:ring-transparent"
                    placeholder="Imię"
                  />
                </div>
                <div>
                  <Label htmlFor="lastname" className="sr-only">
                    Nazwisko
                  </Label>
                  <Input
                    required
                    type="text"
                    name="lastname"
                    id="lastname"
                    className="focus-visible:ring-transparent"
                    placeholder="Nazwisko"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  required
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  className="focus-visible:ring-transparent"
                  placeholder="Email"
                />
              </div>

              <div>
                <Label htmlFor="phone_number" className="sr-only">
                  Numer telefonu
                </Label>
                <Input
                  type="text"
                  name="phone_number"
                  id="phone_number"
                  className="focus-visible:ring-transparent"
                  placeholder="Numer telefonu (opcjonalnie)"
                />
              </div>

              <div>
                <Label htmlFor="about" className="sr-only">
                  Wiadomość
                </Label>
                <Textarea
                  required
                  id="about"
                  name="about"
                  rows={4}
                  className="focus-visible:ring-transparent"
                  placeholder="Wiadomość"
                ></Textarea>
              </div>
            </div>

            <div className="grid mt-4">
              <Button
                type="submit"
                disabled={buttonDisabled}
                className="bg-blue-400 hover:bg-blue-500"
              >
                Wyślij
              </Button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-sm text-gray-500">
                Odpowiadamy zazwyczaj w ciągu 1-2 dni.
              </p>
            </div>
          </form>
        </div>

        <div className="divide-y">
          <div className="flex py-6 gap-x-7">
            <svg
              className="shrink-0 size-6 mt-1.5 "
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
            <div className="grow">
              <h3 className="font-semibold ">FAQ</h3>
              <p className="mt-1 text-sm text-gray-500">
                Najczęściej zadawane pytania
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-gray-600 gap-x-2 focus:outline-hidden"
                href="#"
              >
                Przejdź
                <svg
                  className="shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clip-rule="evenodd"
                    d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex py-6 gap-x-7">
            <svg
              className="shrink-0 size-6 mt-1.5 "
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 11 2-2-2-2" />
              <path d="M11 13h4" />
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            </svg>
            <div className="grow">
              <h3 className="font-semibold ">Telefon</h3>
              <p className="mt-1 text-sm text-gray-500">
                W razie pilnych spraw zapraszamy do kontaktu telefonicznego.
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-gray-600 gap-x-2 focus:outline-hidden"
                href="#"
              >
                777-888-999
              </a>
            </div>
          </div>

          <div className="flex py-6 gap-x-7">
            <svg
              className="shrink-0 size-6 mt-1.5 "
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            <div className="grow">
              <h3 className="font-semibold ">Email</h3>
              <p className="mt-1 text-sm text-gray-500">
                Zapraszamy do kontaktu przez email.
              </p>
              <a
                className="inline-flex items-center mt-2 text-sm font-medium text-gray-600 gap-x-2 focus:outline-hidden"
                href="#"
              >
                example@site.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
