import { fetchFaq } from "@/app/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risu Team | FAQ",
};

export default async function FAQ() {
  const { data: faq, error } = await fetchFaq();

  return (
    <div className="flex flex-col mx-auto max-w-4xl w-full px-2 md:px-0 my-8">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Pytania i odpowiedzi
        </h1>
      </div>

      {error && (
        <div className="text-red-500 text-center py-8">
          Błąd ładowania FAQ: {error}
        </div>
      )}
      {(!faq || faq.length === 0) && !error && (
        <div className="text-center py-8">Brak pytań do wyświetlenia.</div>
      )}
      {faq && faq.length > 0 && (
        <Accordion type="multiple">
          {faq.map(({ question, answer, id }, index) => (
            <AccordionItem key={id} value={`question-${id}`}>
              <AccordionTrigger className="text-lg text-left">
                {question}
              </AccordionTrigger>
              <AccordionContent className="m-2 text-slate-400 border-x-2 px-4 border-risu-400/20">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
