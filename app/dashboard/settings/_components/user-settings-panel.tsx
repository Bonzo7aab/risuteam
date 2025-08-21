"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell,
  Calendar,
  CreditCard,
  Settings as SettingsIcon
} from "lucide-react";

interface UserSettingsPanelProps {
  user: User;
}

export default function UserSettingsPanel({ user }: UserSettingsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user.email || "");

  const handleSave = () => {
    // TODO: Implement email update functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEmail(user.email || "");
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ustawienia konta</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoimi ustawieniami i preferencjami
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profil użytkownika
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edytuj
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        Zapisz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        Anuluj
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Data utworzenia konta</Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(user.created_at).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Bezpieczeństwo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Zmiana hasła</h4>
                <p className="text-sm text-muted-foreground">
                  Zaktualizuj swoje hasło do konta
                </p>
              </div>
              <Button variant="outline">
                Zmień hasło
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dwuetapowa weryfikacja</h4>
                <p className="text-sm text-muted-foreground">
                  Dodatkowa warstwa bezpieczeństwa dla Twojego konta
                </p>
              </div>
              <Button variant="outline">
                Włącz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Powiadomienia email</h4>
                <p className="text-sm text-muted-foreground">
                  Otrzymuj powiadomienia o zajęciach i subskrypcjach
                </p>
              </div>
              <Button variant="outline">
                Włączone
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Przypomnienia o zajęciach</h4>
                <p className="text-sm text-muted-foreground">
                  Powiadomienia przed rozpoczęciem zajęć
                </p>
              </div>
              <Button variant="outline">
                Włączone
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Akcje konta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Eksport danych</h4>
                <p className="text-sm text-muted-foreground">
                  Pobierz kopię swoich danych
                </p>
              </div>
              <Button variant="outline">
                Eksportuj
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Usuń konto</h4>
                <p className="text-sm text-muted-foreground">
                  Trwale usuń swoje konto i wszystkie dane
                </p>
              </div>
              <Button variant="destructive">
                Usuń konto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Przydatne linki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span>Grafik zajęć</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <CreditCard className="w-5 h-5" />
                <span>Subskrypcje</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Mail className="w-5 h-5" />
                <span>Kontakt</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

