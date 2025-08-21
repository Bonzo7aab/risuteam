import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { UserPlus, Mail, Lock, ArrowRight, LogIn, Shield, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (user) {
    // Check user role and redirect accordingly to prevent redirect loops
    if (user.app_metadata?.role === "admin") {
      return redirect("/admin");
    } else {
      // Regular users go to dashboard, not admin
      return redirect("/dashboard");
    }
  }

  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-risu-500 to-risu-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Dołącz do nas
        </h1>
        <p className="text-sm text-slate-600">
          Utwórz konto i rozpocznij swoją przygodę z RISU Team
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-xl bg-slate-100/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Rejestracja
          </CardTitle>
          <CardDescription className="text-slate-600">
            Wypełnij poniższe pola, aby utworzyć konto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Adres email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="twoj@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border-slate-300 bg-slate-200/80 focus:border-risu-500 focus:ring-risu-500/20 focus:bg-slate-200 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Hasło
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full pl-10 pr-4 py-3 border-slate-300 bg-slate-200/80 focus:border-risu-500 focus:ring-risu-500/20 focus:bg-slate-200 transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Minimum 6 znaków</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-slate-200/80 border border-slate-300 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-700">
                  <p className="font-medium mb-1">Bezpieczeństwo</p>
                  <p>Twoje dane są chronione i nie będą udostępniane osobom trzecim.</p>
                </div>
              </div>
            </div>

            <SubmitButton
              formAction={signUpAction}
              pendingText="Tworzenie konta..."
              className="w-full bg-gradient-to-r from-risu-500 to-risu-600 hover:from-risu-600 hover:to-risu-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-risu-500/20 shadow-lg"
            >
              <span>Utwórz konto</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <div className="text-center space-y-4">
        <Separator className="bg-slate-200" />
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
          <span>Masz już konto?</span>
          <Link
            href="/sign-in"
            className="inline-flex items-center text-risu-600 hover:text-risu-700 font-medium hover:underline transition-colors"
          >
            <LogIn className="w-4 h-4 mr-1" />
            Zaloguj się
          </Link>
        </div>
      </div>

      {/* SMTP Message */}
      <SmtpMessage />
    </div>
  );
}
