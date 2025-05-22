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

const faq = [
  {
    question: "What is your return policy?",
    answer:
      "You can return unused items in their original packaging within 30 days for a refund or exchange. Contact support for assistance.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Track your order using the link provided in your confirmation email, or log into your account to view tracking details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide. Shipping fees and delivery times vary by location, and customs duties may apply for some countries.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, MasterCard, American Express, PayPal, Apple Pay, and Google Pay, ensuring secure payment options for all customers.",
  },
  {
    question: "What if I receive a damaged item?",
    answer:
      "Please contact our support team within 48 hours of delivery with photos of the damaged item. We’ll arrange a replacement or refund.",
  },
];

const FAQ = () => {
  return (
    <div className="flex flex-col mx-auto max-w-4xl w-full px-2 md:px-0 my-8">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Pytania i odpowiedzi
        </h1>
      </div>

      <Accordion type="multiple">
        {faq.map(({ question, answer }, index) => (
          <AccordionItem key={question} value={`question-${index}`}>
            <AccordionTrigger className="text-lg text-left">
              {question}
            </AccordionTrigger>
            <AccordionContent className="m-2 text-slate-400 border-x-2 px-4 border-risu-400/20">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQ;
