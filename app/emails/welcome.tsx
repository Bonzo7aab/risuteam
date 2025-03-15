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

interface ContactUserEmailProps {
  username?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const ContactUserEmail = ({
  username,
  email,
  phone,
  message,
}: ContactUserEmailProps) => {
  const previewText = `risuteam.pl kontakt`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="px-2 mx-auto my-auto font-sans bg-white">
          <Container className="bg-black my-16 border border-solid border-[#fcd100] rounded mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://filmsmk.pl/logoTransparent.png`}
                width="60"
                height="60"
                alt="filmsmk_logo"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Kontakt od <strong>{username}</strong> z{" "}
              <strong>filmsmk.pl</strong>
            </Heading>
            <Text className="text-white text-[14px] leading-[24px]">
              <strong>{username}</strong> (
              <Link
                href={`mailto:${email}`}
                className="text-blue-600 no-underline"
              >
                {email}
              </Link>
              ) wysłał wiadomość.
            </Text>
            <Text className="text-white text-[14px] leading-[12px]">
              Telefon: <strong>{phone}</strong>
            </Text>
            <Hr className="border border-solid border-[#fcd100] my-[26px] mx-0 w-full" />
            <Section>
              <Text className="text-white text-[14px] leading-[12px]">
                {message}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactUserEmail.PreviewProps = {
  username: "alanturing",
  email: `test@email.com`,
  phone: "123456789",
  message: "Witam, piszę w sprawie...",
} as ContactUserEmailProps;

export default ContactUserEmail;
