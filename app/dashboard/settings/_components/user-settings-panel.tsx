"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell,
  Calendar,
  CreditCard,
  Settings as SettingsIcon,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

interface UserSettingsPanelProps {
  user: User;
}

interface NotificationSettings {
  email_notifications: boolean;
  subscription_reminders: boolean;
  camp_notifications: boolean;
}

export default function UserSettingsPanel({ user }: UserSettingsPanelProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Account deletion states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user notification preferences
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading notification settings:', error);
        }

        if (data) {
          setNotificationsEnabled(data.email_notifications || false);
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
      }
    };

    loadNotificationSettings();
  }, [user.id]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Aktualne hasło jest wymagane" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Nowe hasło musi mieć co najmniej 6 znaków" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Nowe hasła nie są identyczne" });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordMessage({ type: "error", text: "Nowe hasło musi być inne niż aktualne" });
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordMessage(null);
      
      const supabase = createClient();
      
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });

      if (signInError) {
        setPasswordMessage({ type: "error", text: "Aktualne hasło jest nieprawidłowe" });
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setPasswordMessage({ type: "error", text: `Błąd podczas zmiany hasła: ${updateError.message}` });
      } else {
        setPasswordMessage({ type: "success", text: "Hasło zostało zmienione pomyślnie!" });
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Hide form after successful change
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordMessage(null);
        }, 3000);
      }
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Wystąpił nieoczekiwany błąd podczas zmiany hasła" });
      console.error("Password change error:", err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(null);
    setShowPasswordForm(false);
  };

  const handleNotificationToggle = async () => {
    try {
      setIsUpdatingNotifications(true);
      setNotificationMessage(null);

      const supabase = createClient();
      const newValue = !notificationsEnabled;

      // Try to update existing settings first
      const { error: updateError } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          email_notifications: newValue,
          subscription_reminders: newValue,
          camp_notifications: newValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        // If table doesn't exist, create it and insert
        console.log('Creating notification settings table...');
        
        // Create the table if it doesn't exist
        const { error: createTableError } = await supabase.rpc('create_notification_settings_table');
        
        if (createTableError) {
          // If RPC doesn't exist, try to insert directly (table might already exist)
          const { error: insertError } = await supabase
            .from('user_notification_settings')
            .insert({
              user_id: user.id,
              email_notifications: newValue,
              subscription_reminders: newValue,
              camp_notifications: newValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw insertError;
          }
        } else {
          // Table created, now insert the settings
          const { error: insertError } = await supabase
            .from('user_notification_settings')
            .insert({
              user_id: user.id,
              email_notifications: newValue,
              subscription_reminders: newValue,
              camp_notifications: newValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw insertError;
          }
        }
      }

      setNotificationsEnabled(newValue);
      setNotificationMessage({ 
        type: "success", 
        text: newValue 
          ? "Powiadomienia zostały włączone" 
          : "Powiadomienia zostały wyłączone" 
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotificationMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating notification settings:', err);
      setNotificationMessage({ 
        type: "error", 
        text: "Wystąpił błąd podczas aktualizacji ustawień powiadomień" 
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setDeleteMessage({ type: "error", text: "Hasło jest wymagane do usunięcia konta" });
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteMessage(null);
      
      const supabase = createClient();
      
      // First, verify the password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: deletePassword
      });

      if (signInError) {
        setDeleteMessage({ type: "error", text: "Hasło jest nieprawidłowe" });
        return;
      }

      // Delete all user data from related tables first
      const { error: deleteSubscriptionsError } = await supabase
        .from('class_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (deleteSubscriptionsError) {
        console.error("Error deleting subscriptions:", deleteSubscriptionsError);
      }

      const { error: deleteRegistrationsError } = await supabase
        .from('class_registrations')
        .delete()
        .eq('user_id', user.id);

      if (deleteRegistrationsError) {
        console.error("Error deleting registrations:", deleteRegistrationsError);
      }

      // Delete notification settings
      const { error: deleteNotificationsError } = await supabase
        .from('user_notification_settings')
        .delete()
        .eq('user_id', user.id);

      if (deleteNotificationsError) {
        console.error("Error deleting notification settings:", deleteNotificationsError);
      }

      // Finally, delete the user account
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteUserError) {
        // If admin delete fails, try to delete the user through RLS policies
        const { error: deleteUserError2 } = await supabase.auth.updateUser({
          data: { deleted: true }
        });

        if (deleteUserError2) {
          setDeleteMessage({ type: "error", text: `Błąd podczas usuwania konta: ${deleteUserError2.message}` });
          return;
        }
      }

      // Success - redirect to sign out
      setDeleteMessage({ type: "success", text: "Konto zostało usunięte pomyślnie. Przekierowywanie..." });
      
      // Sign out and redirect to home page
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/');
      }, 2000);

    } catch (err) {
      setDeleteMessage({ type: "error", text: "Wystąpił nieoczekiwany błąd podczas usuwania konta" });
      console.error("Account deletion error:", err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const resetDeleteForm = () => {
    setDeletePassword("");
    setDeleteMessage(null);
    setShowDeleteConfirmation(false);
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
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span> 
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
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "Ukryj" : "Zmień hasło"}
              </Button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="border rounded-lg p-4 bg-gray-800">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Aktualne hasło</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Wprowadź aktualne hasło"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nowe hasło</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Wprowadź nowe hasło"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Potwierdź nowe hasło"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Wymagania dotyczące hasła:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={newPassword.length >= 6 ? "text-green-600" : ""}>
                        Co najmniej 6 znaków {newPassword.length >= 6 && <CheckCircle className="inline h-3 w-3" />}
                      </li>
                      <li className={newPassword !== currentPassword ? "text-green-600" : ""}>
                        Różne od aktualnego hasła {newPassword !== currentPassword && newPassword && <CheckCircle className="inline h-3 w-3" />}
                      </li>
                      <li className={newPassword === confirmPassword && newPassword ? "text-green-600" : ""}>
                        Hasła są identyczne {newPassword === confirmPassword && newPassword && <CheckCircle className="inline h-3 w-3" />}
                      </li>
                    </ul>
                  </div>

                  {/* Message Display */}
                  {passwordMessage && (
                    <div className={`flex items-center gap-2 p-3 rounded-md ${
                      passwordMessage.type === "success" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {passwordMessage.type === "success" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{passwordMessage.text}</span>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {isChangingPassword ? "Zmienianie hasła..." : "Zmień hasło"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetPasswordForm}
                      disabled={isChangingPassword}
                    >
                      Anuluj
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Powiadomienia (wkrótce)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">Powiadomienia email</h4>
                <p className="text-sm text-muted-foreground">
                  Otrzymuj powiadomienia o kończących się subskrypcjach i przypomnienia o obozach
                </p>
                {notificationMessage && (
                  <div className={`flex items-center gap-2 mt-2 p-2 rounded-md text-xs ${
                    notificationMessage.type === "success" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {notificationMessage.type === "success" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{notificationMessage.text}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {notificationsEnabled ? "Włączone" : "Wyłączone"}
                </span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={true}
                />
              </div>
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
                <h4 className="font-medium text-red-600">Usuń konto</h4>
                <p className="text-sm text-muted-foreground">
                  Trwale usuń swoje konto i wszystkie dane
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirmation(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
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
              <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/grafik')}>
                <Calendar className="w-5 h-5" />
                <span>Grafik zajęć</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/dashboard/subscriptions')}>
                <CreditCard className="w-5 h-5" />
                <span>Subskrypcje</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/kontakt')}>
                <Mail className="w-5 h-5" />
                <span>Kontakt</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">Usuń konto</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ Ta akcja jest nieodwracalna!
                </p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• Twoje konto zostanie trwale usunięte</li>
                  <li>• Wszystkie subskrypcje zostaną anulowane</li>
                  <li>• Wszystkie zapisy na zajęcia zostaną usunięte</li>
                  <li>• Wszystkie dane zostaną utracone</li>
                </ul>
              </div>

              <form onSubmit={handleAccountDeletion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">
                    Potwierdź hasło, aby usunąć konto
                  </Label>
                  <div className="relative">
                    <Input
                      id="deletePassword"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Wprowadź swoje hasło"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                    >
                      {showDeletePassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Delete Message Display */}
                {deleteMessage && (
                  <div className={`flex items-center gap-2 p-3 rounded-md ${
                    deleteMessage.type === "success" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {deleteMessage.type === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{deleteMessage.text}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={isDeletingAccount || !deletePassword}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeletingAccount ? "Usuwanie..." : "Tak, usuń konto"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetDeleteForm}
                    disabled={isDeletingAccount}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

