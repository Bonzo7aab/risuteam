import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <div className="flex justify-center min-h-screen px-6">
      <div className="max-w-xl">
        <h2 className="text-4xl md:text-5xl !leading-[1.15] font-bold tracking-tight">
          Pytania i odpowiedzi
        </h2>

        <Accordion type="single" className="mt-6" defaultValue="question-0">
          {faq.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger className="text-lg text-left">
                {question}
              </AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
