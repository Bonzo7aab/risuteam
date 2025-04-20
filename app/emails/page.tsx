import { ContactFormType } from "@/lib/types";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const ContactUserEmail = ({
  firstname,
  lastname,
  email,
  phone_number,
  message,
}: ContactFormType) => {
  const previewText = `risuteam.pl kontakt`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="px-2 mx-auto my-auto font-sans bg-white">
          <Preview>{previewText}</Preview>
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/logoWithBorder.png`}
                width="100"
                height="100"
                alt="Risu Team"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[20px] mx-0">
              Risu <strong>Team</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px] p-4">
              Nowa wiadomość od {firstname} {lastname} ({email}),
            </Text>
            <Section>
              <Text className="p-6 mx-4 text-black bg-gray-200 rounded-sm">
                {message}
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px] p-4">
              Numer telefonu {phone_number ? phone_number : "Nie podany"}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactUserEmail.PreviewProps = {
  firstname: "alan",
  lastname: "turing",
  email: `test@email.com`,
  phone_number: "123456789",
  message: "Witam, piszę w sprawie...",
} as ContactFormType;

export default ContactUserEmail;
