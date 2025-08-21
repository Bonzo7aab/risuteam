import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

export default async function Login(props: { searchParams: Promise<Message> }) {
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
  
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-risu-500 to-risu-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
          <LogIn className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Witaj ponownie
        </h1>
        <p className="text-sm text-slate-600">
          Zaloguj się do swojego konta, aby kontynuować
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-xl bg-slate-100/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Logowanie
          </CardTitle>
          <CardDescription className="text-slate-600">
            Wprowadź swoje dane logowania
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Hasło
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-risu-600 hover:text-risu-700 hover:underline transition-colors"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border-slate-300 bg-slate-200/80 focus:border-risu-500 focus:ring-risu-500/20 focus:bg-slate-200 transition-all duration-200"
                />
              </div>
            </div>

            <SubmitButton
              pendingText="Logowanie..."
              formAction={signInAction}
              className="w-full bg-gradient-to-r from-risu-500 to-risu-600 hover:from-risu-600 hover:to-risu-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-risu-500/20 shadow-lg"
            >
              <span>Zaloguj się</span>
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
          <span>Nie masz jeszcze konta?</span>
          <Link
            href="/sign-up"
            className="inline-flex items-center text-risu-600 hover:text-risu-700 font-medium hover:underline transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}
