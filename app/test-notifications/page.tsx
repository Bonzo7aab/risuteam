"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Bell } from 'lucide-react';

export default function TestNotificationsPage() {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('subscription_ending');
  const [customData, setCustomData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const testNotification = async () => {
    if (!userId) {
      setResult({ type: 'error', message: 'Proszę wprowadzić ID użytkownika' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let data = {};
      
      // Set default data based on action
      switch (action) {
        case 'subscription_ending':
          data = {
            activity_name: 'Joga dla początkujących',
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          break;
        case 'new_camp':
          data = {
            name: 'Letni obóz sportowy 2024',
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Bieszczady, Polska',
            price: 1200,
            description: 'Ekscytujący obóz sportowy w pięknych Bieszczadach z różnymi aktywnościami.'
          };
          break;
        case 'subscription_expired':
          data = {
            activity_name: 'Pilates',
            end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          };
          break;
      }

      // Override with custom data if provided
      if (customData) {
        try {
          const parsedData = JSON.parse(customData);
          data = { ...data, ...parsedData };
        } catch (e) {
          setResult({ type: 'error', message: 'Nieprawidłowy format JSON w danych niestandardowych' });
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId,
          data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: result.message });
      } else {
        setResult({ type: 'error', message: result.error || 'Wystąpił błąd' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Wystąpił błąd podczas wysyłania powiadomienia' });
    } finally {
      setIsLoading(false);
    }
  };

  const testBatchNotifications = async (batchAction: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: batchAction,
          userId: 'batch',
          data: {}
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: `Batch notification sent: ${result.message}` });
      } else {
        setResult({ type: 'error', message: result.error || 'Wystąpił błąd' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Wystąpił błąd podczas wysyłania powiadomień wsadowych' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Test Systemu Powiadomień
        </h1>
        <p className="text-muted-foreground">
          Strona do testowania systemu powiadomień dla kończących się subskrypcji i nowych obozów
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Notification Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Pojedynczego Powiadomienia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID Użytkownika</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Wprowadź ID użytkownika"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Typ Powiadomienia</Label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="subscription_ending">Subskrypcja kończy się</option>
                <option value="new_camp">Nowy obóz</option>
                <option value="subscription_expired">Subskrypcja wygasła</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customData">Dane Niestandardowe (JSON, opcjonalnie)</Label>
              <Textarea
                id="customData"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                placeholder='{"custom_field": "value"}'
                rows={3}
              />
            </div>

            <Button 
              onClick={testNotification} 
              disabled={isLoading || !userId}
              className="w-full"
            >
              {isLoading ? "Wysyłanie..." : "Wyślij Powiadomienie"}
            </Button>
          </CardContent>
        </Card>

        {/* Batch Notifications Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Powiadomień Wsadowych</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Te akcje wyślą powiadomienia do wszystkich użytkowników z włączonymi powiadomieniami.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => testBatchNotifications('batch_subscriptions')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Powiadom o Kończących się Subskrypcjach
              </Button>

              <Button 
                onClick={() => testBatchNotifications('batch_camps')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Powiadom o Nowych Obozach
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p><strong>Uwaga:</strong> Powiadomienia wsadowe są wysyłane tylko do użytkowników z włączonymi powiadomieniami.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {result && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              result.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {result.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{result.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instrukcje Użycia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Test Pojedynczego Powiadomienia:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Wprowadź ID użytkownika (możesz znaleźć je w ustawieniach konta)</li>
              <li>Wybierz typ powiadomienia</li>
              <li>Opcjonalnie dodaj dane niestandardowe w formacie JSON</li>
              <li>Kliknij "Wyślij Powiadomienie"</li>
            </ul>
            
            <p><strong>2. Test Powiadomień Wsadowych:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Powiadomienia o kończących się subskrypcjach - sprawdza subskrypcje kończące się w ciągu 30 dni</li>
              <li>Powiadomienia o nowych obozach - sprawdza obozy utworzone w ciągu ostatnich 7 dni</li>
            </ul>

            <p><strong>3. Sprawdzanie Powiadomień:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Wszystkie powiadomienia są logowane w konsoli przeglądarki</li>
              <li>W produkcji będą wysyłane jako prawdziwe emaile</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
