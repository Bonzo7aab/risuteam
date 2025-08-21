"use client";

import React, { useState } from "react";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUserAuth } from "@/app/context/user-auth-context";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { refreshUser } = useUserAuth();

  const supabase = createClient();

  const handleClose = () => {
    setMessage(null);
    setEmail("");
    setPassword("");
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ error: error.message });
      } else {
        setMessage({ success: "Zalogowano pomyślnie!" });
        // Refresh user context to ensure state is updated
        await refreshUser();
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1000);
      }
    } catch (err) {
      setMessage({ error: "Wystąpił nieoczekiwany błąd" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ error: error.message });
      } else {
        setMessage({ success: "Konto zostało utworzone! Sprawdź email, aby potwierdzić konto." });
        // Refresh user context to ensure state is updated
        await refreshUser();
        // After successful signup, switch to signin mode
        setTimeout(() => {
          setIsSignUp(false);
          setMessage({ success: "Konto zostało utworzone! Możesz się teraz zalogować." });
        }, 2000);
      }
    } catch (err) {
      setMessage({ error: "Wystąpił nieoczekiwany błąd" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            {isSignUp ? "Utwórz konto" : "Zaloguj się"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp 
              ? "Zarejestruj się, aby zapisać się na zajęcia" 
              : "Zaloguj się, aby zapisać się na zajęcia"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isSignUp ? (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Twoje hasło"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-risu-500 to-risu-600 hover:from-risu-600 hover:to-risu-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-risu-500/20 shadow-lg"
              >
                {isLoading ? "Tworzenie konta..." : (
                  <>
                    <span>Utwórz konto</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Sign In Form
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Twoje hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-risu-500 to-risu-600 hover:from-risu-600 hover:to-risu-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-risu-500/20 shadow-lg"
              >
                {isLoading ? "Logowanie..." : (
                  <>
                    <span>Zaloguj się</span>
                    <LogIn className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Form Messages */}
          {message && <FormMessage message={message} />}

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center">
             <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
              <span>
                {isSignUp ? "Masz już konto?" : "Nie masz jeszcze konta?"}
              </span>
              <Button
                type="button"
                variant="link"
                className="text-risu-600 hover:text-risu-700 font-medium p-0 h-auto"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
              >
                {isSignUp ? (
                  <>
                    <LogIn className="w-4 h-4 mr-1" />
                    Zaloguj się
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Zarejestruj się
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
