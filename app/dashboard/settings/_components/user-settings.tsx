"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface UserSettingsProps {
  user: User;
}

export function UserSettings({ user }: UserSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Nowe hasła nie są identyczne" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Nowe hasło musi mieć co najmniej 6 znaków" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Hasło zostało zmienione pomyślnie" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Wystąpił błąd podczas zmiany hasła" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ustawienia konta</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi ustawieniami konta i bezpieczeństwem
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informacje o koncie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  <Badge variant="secondary">Główny</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  ID użytkownika
                </Label>
                <p className="text-sm font-mono text-xs mt-1">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Data utworzenia konta
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(user.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Ostatnie logowanie
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('pl-PL')
                      : 'Brak danych'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Zarządzanie Subskrypcjami
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Zarządzaj swoimi subskrypcjami na zajęcia, sprawdź status i historię płatności
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Szybki dostęp</Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Zarządzanie statusem</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Historia transakcji</span>
                </div>
              </div>
              <Link href="/dashboard/subscriptions">
                <Button variant="default" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Przejdź do subskrypcji
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Zmień hasło
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wprowadź nowe hasło"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Potwierdź nowe hasło"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message.type === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full md:w-auto"
              >
                {loading ? "Zmienianie hasła..." : "Zmień hasło"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Informacje o bezpieczeństwie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status weryfikacji email
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  {user.email_confirmed_at ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Zweryfikowany</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600">Niezweryfikowany</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Ostatnia zmiana hasła
                </Label>
                <p className="text-sm mt-1">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString('pl-PL')
                    : 'Brak danych'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
