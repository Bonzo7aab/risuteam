"use server"

import { Resend } from "resend";
import { z } from "zod";
import * as React from "react";
import ContactUserEmail from "../emails/helloEmail";

const contactSchema = z.object({
    firstname: z.string().min(1, "Imię wymagane").max(32),
    lastname: z.string().min(1, "Nazwisko wymagane").max(32),
    email: z.string().email("Niepoprawny email"),
    phone_number: z.string().optional(),
    message: z.string().min(10, "Minimum 10 liter").max(500, "Maximum 500 liter"),
});

export async function sendEmailAction(prevState: any, formData: FormData) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const contactData  = Object.fromEntries(formData);
    const validateContactData = contactSchema.safeParse(contactData);

    if(validateContactData.error){
      const formFieldError = validateContactData.error.flatten().fieldErrors;
      
      return {
        errors: {
          firstname: formFieldError?.firstname,
          lastname: formFieldError?.lastname,
          email: formFieldError?.email,
          phone_number: formFieldError?.phone_number,
          message: formFieldError?.message
        }
      }
    };

    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const phone_number = formData.get('phone_number') as string | null;
    const message = formData.get('message') as string;

    const emailPayload = {
      from: 'risuteam.pl - Kontakt <kontakt@risuteam.pl>',
      to: ['biuro@risuteam.pl'],
      subject: `Kontakt od ${firstname}`,
      text: 'Nowy email z risuteam.pl',
      react: ContactUserEmail({
        firstname,
        lastname,
        email,
        phone_number: phone_number || undefined,
        message
      }) as React.ReactElement
    };

    const { data: resendData, error} = await resend.emails.send(emailPayload);
    if(error){
      console.log("Error sending email:", error);
      return { error: "Resend error"}
    }

    console.log("Email send:", resendData);
    return { success: "Email wysłany"}

  } catch (error) {
    console.log("Error sending email:", error);
    return { error: "Wystąpił błąd przy wysłaniu wiadomości."}
  }
}