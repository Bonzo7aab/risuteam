import { ArrowRight, Mail, MessagesSquare, Phone } from "lucide-react";
import { Metadata } from "next";
import ContactClient from "./page-client";

export const metadata: Metadata = {
  title: "Risu Team | Kontakt",
};

const Contact = () => {
  return (
    <div className="my-16">
      <div className="text-center text-4xl flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Skontaktuj się z nami!
        </h1>
      </div>

      <div className="grid items-center gap-16 mt-12 lg:grid-cols-2 lg:gap-32">
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 relative">
          <div className="hidden xl:block absolute -top-4 -left-4 w-32 h-32 border-l-2 border-t-2 border-risu-500 opacity-70"></div>
          <div className="hidden xl:block absolute -bottom-4 -right-4 w-32 h-32 border-r-2 border-b-2 border-risu-500 opacity-70"></div>
          <h2 className="mb-8 text-xl font-semibold self-center">
            Wypełnij formularz poniżej
          </h2>

          <ContactClient />
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
