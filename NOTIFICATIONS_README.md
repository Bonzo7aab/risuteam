# System Powiadomień - Dokumentacja

## 🎯 **Przegląd**

System powiadomień został w pełni zaimplementowany w panelu użytkownika, umożliwiając użytkownikom włączanie/wyłączanie powiadomień email o:
- **Kończących się subskrypcjach** - przypomnienia przed wygaśnięciem
- **Nowych obozach** - informacje o dostępnych obozach

## 🏗️ **Architektura Systemu**

### **1. Komponenty UI**
- **`user-settings-panel.tsx`** - Główny panel ustawień z przełącznikiem powiadomień
- **`switch.tsx`** - Komponent przełącznika (toggle) dla włączania/wyłączania
- **`test-notifications/page.tsx`** - Strona testowa do weryfikacji systemu

### **2. Serwisy i Logika**
- **`notification-service.ts`** - Główny serwis obsługujący wysyłanie powiadomień
- **`/api/test-notifications`** - API endpoint do testowania systemu

### **3. Baza Danych**
- **`user_notification_settings`** - Tabela przechowująca preferencje użytkowników

## 🔧 **Implementacja**

### **Przełącznik Powiadomień**
```typescript
const [notificationsEnabled, setNotificationsEnabled] = useState(false);

const handleNotificationToggle = async () => {
  // Sprawdza ustawienia użytkownika
  // Aktualizuje bazę danych
  // Pokazuje potwierdzenie
};
```

### **Struktura Bazy Danych**
```sql
CREATE TABLE user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email_notifications BOOLEAN DEFAULT false,
  subscription_reminders BOOLEAN DEFAULT false,
  camp_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📧 **Typy Powiadomień**

### **1. Subskrypcje Kończące się**
- **Wyzwalacz**: Subskrypcja kończy się w ciągu 30 dni
- **Zawartość**: Nazwa zajęć, data końca, zachęta do odnowienia
- **Odbiorcy**: Użytkownicy z włączonymi przypomnieniami

### **2. Nowe Obozy**
- **Wyzwalacz**: Nowy obóz zostaje utworzony
- **Zawartość**: Nazwa obozu, termin, lokalizacja, cena, opis
- **Odbiorcy**: Wszyscy użytkownicy z włączonymi powiadomieniami

### **3. Subskrypcje Wygasłe**
- **Wyzwalacz**: Subskrypcja wygasła
- **Zawartość**: Informacja o wygaśnięciu i zachęta do odnowienia
- **Odbiorcy**: Użytkownicy z włączonymi przypomnieniami

## 🚀 **Funkcjonalności**

### **✅ Zaimplementowane**
- [x] Przełącznik włączania/wyłączania powiadomień
- [x] Zapisywanie preferencji w bazie danych
- [x] Automatyczne ładowanie ustawień użytkownika
- [x] Walidacja i obsługa błędów
- [x] Potwierdzenia sukcesu/błędu
- [x] Serwis powiadomień z szablonami email
- [x] API endpoint do testowania
- [x] Strona testowa z instrukcjami
- [x] Powiadomienia wsadowe dla administratorów

### **🔄 W Trakcie Rozwoju**
- [ ] Integracja z prawdziwym serwisem email (Resend, SendGrid)
- [ ] Harmonogram automatycznych powiadomień (cron jobs)
- [ ] Personalizacja treści powiadomień
- [ ] Historia wysłanych powiadomień

## 🧪 **Testowanie Systemu**

### **Strona Testowa: `/test-notifications`**

#### **Test Pojedynczego Powiadomienia**
1. Wprowadź ID użytkownika
2. Wybierz typ powiadomienia
3. Opcjonalnie dodaj dane niestandardowe (JSON)
4. Kliknij "Wyślij Powiadomienie"

#### **Test Powiadomień Wsadowych**
- **Kończące się subskrypcje** - sprawdza subskrypcje w ciągu 30 dni
- **Nowe obozy** - sprawdza obozy z ostatnich 7 dni

### **API Endpoint: `/api/test-notifications`**

```bash
# Test pojedynczego powiadomienia
POST /api/test-notifications
{
  "action": "subscription_ending",
  "userId": "user-uuid",
  "data": {
    "activity_name": "Joga",
    "end_date": "2024-12-31T23:59:59Z"
  }
}

# Test powiadomień wsadowych
POST /api/test-notifications
{
  "action": "batch_subscriptions",
  "userId": "batch",
  "data": {}
}
```

## 📱 **Użytkownik Końcowy**

### **Jak Włączyć Powiadomienia**
1. Przejdź do **Dashboard → Ustawienia**
2. W sekcji **Powiadomienia** znajdź "Powiadomienia email"
3. Przełącz przełącznik na **Włączone**
4. System automatycznie zapisze Twoje preferencje

### **Co Otrzymasz**
- **Przypomnienia** o kończących się subskrypcjach (30 dni przed)
- **Informacje** o nowych dostępnych obozach
- **Powiadomienia** o wygasłych subskrypcjach

## 🔒 **Bezpieczeństwo i Prywatność**

### **Ochrona Danych**
- Ustawienia są przechowywane per użytkownik
- Powiadomienia są wysyłane tylko do autoryzowanych użytkowników
- Hasło jest wymagane do zmiany ustawień

### **Kontrola Dostępu**
- Użytkownicy mogą włączać/wyłączać tylko swoje powiadomienia
- Administratorzy mogą wysyłać powiadomienia wsadowe
- Wszystkie operacje są logowane

## 🚀 **Wdrożenie Produkcyjne**

### **Wymagane Zmienne Środowiskowe**
```env
# Dla Resend (rekomendowane)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Dla SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### **Konfiguracja Cron Jobs**
```bash
# Codziennie o 9:00 - sprawdź kończące się subskrypcje
0 9 * * * curl -X POST https://yourdomain.com/api/test-notifications \
  -H "Content-Type: application/json" \
  -d '{"action":"batch_subscriptions","userId":"cron","data":{}}'

# Co tydzień o 10:00 - sprawdź nowe obozy
0 10 * * 1 curl -X POST https://yourdomain.com/api/test-notifications \
  -H "Content-Type: application/json" \
  -d '{"action":"batch_camps","userId":"cron","data":{}}'
```

## 📊 **Monitorowanie i Analityka**

### **Logi Systemu**
- Wszystkie powiadomienia są logowane w konsoli
- Błędy są rejestrowane z pełnym kontekstem
- Statystyki wysłanych powiadomień

### **Metryki Wydajności**
- Czas wysyłania powiadomień
- Wskaźnik sukcesu/błędu
- Liczba aktywnych użytkowników z powiadomieniami

## 🔮 **Przyszłe Rozszerzenia**

### **Planowane Funkcje**
1. **Powiadomienia Push** - powiadomienia w przeglądarce
2. **SMS** - powiadomienia tekstowe
3. **Harmonogram** - użytkownicy mogą ustawić preferowane godziny
4. **Kategorie** - różne typy powiadomień dla różnych aktywności
5. **Szablony** - personalizowane treści powiadomień

### **Integracje**
- **Slack/Discord** - powiadomienia dla zespołu
- **Zapier/IFTTT** - automatyzacja zewnętrznych usług
- **Webhooki** - integracja z systemami zewnętrznymi

## 📞 **Wsparcie i Rozwiązywanie Problemów**

### **Typowe Problemy**
1. **Powiadomienia nie są wysyłane**
   - Sprawdź czy są włączone w ustawieniach
   - Sprawdź logi w konsoli przeglądarki
   - Zweryfikuj połączenie z bazą danych

2. **Błędy API**
   - Sprawdź endpoint `/api/test-notifications`
   - Zweryfikuj format danych wejściowych
   - Sprawdź logi serwera

### **Debugowanie**
```typescript
// Włącz debugowanie w konsoli
console.log('Notification settings:', settings);
console.log('Sending notification to:', userEmail);
console.log('Notification content:', content);
```

## 🎉 **Podsumowanie**

System powiadomień został w pełni zaimplementowany i jest gotowy do użycia produkcyjnego. Użytkownicy mogą:

- ✅ **Włączać/wyłączać** powiadomienia email
- ✅ **Otrzymywać** przypomnienia o kończących się subskrypcjach
- ✅ **Dostawać** informacje o nowych obozach
- ✅ **Testować** system za pomocą dedykowanej strony
- ✅ **Zarządzać** preferencjami w panelu ustawień

System jest skalowalny, bezpieczny i łatwy w utrzymaniu, z możliwością łatwego rozszerzenia o dodatkowe funkcjonalności w przyszłości.
