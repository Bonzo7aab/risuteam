"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, MapPin, UserCheck, X, AlertTriangle, CheckCircle } from "lucide-react";
import { getUserRegistrations, cancelRegistration, getSubscriptionWithRegistrations, getAvailableClasses, registerForClass, getUserPlaceBasedSubscriptions, expirePlaceBasedSubscriptions } from "@/app/actions";

interface Registration {
  id: number;
  schedule_id: number;
  registration_date: string;
  status: string;
  notes?: string;
  created_at: string;
  schedule: {
    id: number;
    activity: string;
    day: string;
    start?: string;
    end?: string;
    trainers?: {
      id: number;
      name: string;
    };
    places?: {
      id: number;
      name: string;
    };
  };
}

interface UserRegistrationsPanelProps {
  userId: string;
}

export default function UserRegistrationsPanel({ userId }: UserRegistrationsPanelProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<{[key: string]: any}>({});
  const [suggestedClasses, setSuggestedClasses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [registeringForSuggested, setRegisteringForSuggested] = useState<number | null>(null);

  const findSuggestedSecondClasses = useCallback(async (currentRegistrations: Registration[], weeklySlotsData: {[key: string]: any}) => {
    try {
      if (currentRegistrations.length === 0) return;
      
      const availableClasses = await getAvailableClasses();
      if (availableClasses.error || !availableClasses.data) return;
      
      const suggestions: any[] = [];
      
      // For each current registration, find available classes of the same type in the same place
      currentRegistrations.forEach(registration => {
        const currentClass = registration.schedule;
        const placeName = currentClass.places?.name;
        
        // Check if user has already used 2 slots for this place (no suggestions needed)
        if (placeName && weeklySlotsData[placeName]) {
          const slots = weeklySlotsData[placeName];
          if (slots.used >= slots.maxPerWeek) {
            return; // Skip suggestions if already using max slots
          }
        }
        
        const sameTypeClasses = availableClasses.data!.filter((availableClass: any) => 
          availableClass.activity === currentClass.activity &&
          availableClass.places?.id === currentClass.places?.id &&
          availableClass.id !== currentClass.id &&
          availableClass.is_active &&
          (availableClass.current_registrations || 0) < (availableClass.max_capacity || 20)
        );
        
        // Find classes on different days to suggest as second class
        const differentDayClasses = sameTypeClasses.filter((availableClass: any) => 
          availableClass.day !== currentClass.day
        );
        
        if (differentDayClasses.length > 0) {
          // Sort by day order and take the first available
          const dayOrder = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
          const sortedClasses = differentDayClasses.sort((a, b) => 
            dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
          );
          
          suggestions.push({
            ...sortedClasses[0],
            reason: `Dodatkowe zajęcia ${currentClass.activity} w ${currentClass.places?.name} (${sortedClasses[0].day})`
          });
        }
      });
      
      setSuggestedClasses(suggestions);
    } catch (err) {
      console.error("Error finding suggested classes:", err);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [result, weeklySlotsResult, subscriptionsResult] = await Promise.all([
        getUserRegistrations(userId),
        getSubscriptionWithRegistrations(userId),
        getUserPlaceBasedSubscriptions(userId)
      ]);
      
      if (result.error) {
        setError(result.error);
      } else {
        setRegistrations(result.data || []);
        setWeeklySlots(weeklySlotsResult.data?.weeklySlots || {});
      }

      if (weeklySlotsResult.error) {
        console.warn("Could not fetch weekly slots:", weeklySlotsResult.error);
      }

      if (subscriptionsResult.error) {
        console.warn("Could not fetch subscriptions:", subscriptionsResult.error);
      } else {
        setSubscriptions(subscriptionsResult.data || []);
        // Check and update expired subscriptions
        await checkAndUpdateExpiredSubscriptions(subscriptionsResult.data || []);
      }
    } catch (err) {
      setError("Wystąpił błąd podczas pobierania zapisów");
    } finally {
      setLoading(false);
    }
  }, [userId, findSuggestedSecondClasses]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Separate useEffect to find suggested classes when weeklySlots change
  useEffect(() => {
    if (registrations.length > 0 && Object.keys(weeklySlots).length > 0) {
      findSuggestedSecondClasses(registrations, weeklySlots);
    }
  }, [weeklySlots, registrations, findSuggestedSecondClasses]);

  const handleQuickRegistration = async (scheduleId: number) => {
    if (!confirm("Czy na pewno chcesz zapisać się na te zajęcia?")) {
      return;
    }

    try {
      setRegisteringForSuggested(scheduleId);
      const result = await registerForClass(userId, scheduleId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the list to show new registration
      await fetchRegistrations();
      alert("Pomyślnie zapisano na zajęcia!");
    } catch (err) {
      console.error("Error registering for suggested class:", err);
      alert("Wystąpił błąd podczas zapisywania. Spróbuj ponownie.");
    } finally {
      setRegisteringForSuggested(null);
    }
  };

  const handleCancelRegistration = async (registrationId: number) => {
    if (!confirm("Czy na pewno chcesz anulować zapis na te zajęcia?")) {
      return;
    }

    try {
      setCancellingId(registrationId);
      const result = await cancelRegistration(registrationId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the list
      await fetchRegistrations();
    } catch (err) {
      console.error("Error cancelling registration:", err);
      alert("Wystąpił błąd podczas anulowania zapisu. Spróbuj ponownie.");
    } finally {
      setCancellingId(null);
    }
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      "Poniedziałek": "bg-blue-100 text-blue-800",
      "Wtorek": "bg-green-100 text-green-800",
      "Środa": "bg-yellow-100 text-yellow-800",
      "Czwartek": "bg-purple-100 text-purple-800",
      "Piątek": "bg-red-100 text-red-800",
      "Sobota": "bg-indigo-100 text-indigo-800",
      "Niedziela": "bg-gray-100 text-gray-800",
    };
    return colors[day] || "bg-gray-100 text-gray-800";
  };

  const groupRegistrationsByPlace = () => {
    const grouped: { [placeName: string]: Registration[] } = {};
    
    // First, add all places from weeklySlots (subscription locations)
    Object.keys(weeklySlots).forEach(placeName => {
      grouped[placeName] = [];
    });
    
    // Then add registrations to their respective places
    registrations.forEach(registration => {
      const placeName = registration.schedule.places?.name || 'Brak lokalizacji';
      if (!grouped[placeName]) {
        grouped[placeName] = [];
      }
      grouped[placeName].push(registration);
    });
    
    return grouped;
  };

  const checkAndUpdateExpiredSubscriptions = async (subscriptionsData: any[]) => {
    try {
      // Use the new batch expiration function for better performance
      const result = await expirePlaceBasedSubscriptions();
      
      if (result.error) {
        console.error('Error expiring subscriptions:', result.error);
        return;
      }

      if (result.expiredCount > 0) {
        console.log(`Successfully expired ${result.expiredCount} subscriptions:`, result.expiredIds);
        
        // Refresh subscriptions data to reflect the changes
        await fetchRegistrations();
      }
    } catch (err) {
      console.error('Error checking expired subscriptions:', err);
    }
  };

  const isSubscriptionExpired = (placeName: string) => {
    const subscription = subscriptions.find(sub => sub.place?.name === placeName);
    if (!subscription) return false;
    
    const today = new Date();
    const endDate = new Date(subscription.end_date);
    return endDate < today || subscription.status === 'expired';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 text-xs">Potwierdzony</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 text-xs">Anulowany</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Lista oczekujących</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-80 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Registration Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-5 w-20 bg-gray-200 rounded"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-5 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-5 w-32 bg-gray-200 rounded"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-5 w-28 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchRegistrations} className="mt-4">
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Moje zapisy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nie masz jeszcze żadnych zapisów na zajęcia</p>
              <p className="text-sm text-gray-400 mb-6">
                Przejdź do grafiku zajęć, aby zapisać się na wybrane zajęcia
              </p>
              <Link href="/grafik" className="flex justify-center">
                <Button className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Przejdź do grafiku zajęć
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log(groupRegistrationsByPlace());
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moje zapisy na zajęcia</h1>
            <p className="text-muted-foreground">
              Zarządzaj swoimi zapisami na zajęcia i śledź swój harmonogram
            </p>
          </div>
          <Link 
            href="/dashboard/subscriptions" 
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200"
          >
            <CreditCard className="w-4 h-4" />
            Moje subskrypcje
          </Link>
        </div>
      </div>



      {/* Suggested Second Classes */}
      {suggestedClasses.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              💡 Sugerowane dodatkowe zajęcia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedClasses.map((suggestedClass) => (
                <div key={suggestedClass.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg hover:bg-green-50/10 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">
                      {suggestedClass.activity}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestedClass.reason}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {suggestedClass.day}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {suggestedClass.start?.slice(0, 5)} - {suggestedClass.end?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {suggestedClass.places?.name}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleQuickRegistration(suggestedClass.id)}
                    disabled={registeringForSuggested === suggestedClass.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {registeringForSuggested === suggestedClass.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Szybkie zapisanie
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions with Classes */}
      {Object.keys(weeklySlots).length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Brak subskrypcji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Nie masz jeszcze żadnych aktywnych subskrypcji</p>
              <p className="text-sm text-muted-foreground mb-6">
                Przejdź do ustawień subskrypcji, aby utworzyć pierwszą subskrypcję
              </p>
              <Link href="/dashboard/subscriptions" className="flex justify-center">
                <Button className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Przejdź do subskrypcji
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupRegistrationsByPlace()).map(([placeName, placeRegistrations]) => {
            const isExpired = isSubscriptionExpired(placeName);
            console.log(placeName, isExpired);
            return (
              <Card 
                key={placeName} 
                className={`${isExpired ? 'border-2 border-red-400 bg-red-50/20' : ''}`}
              >
                <CardHeader className={isExpired ? 'bg-red-50/30' : ''}>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {placeName}
                    <Badge variant="outline" className="text-xs">
                      {placeRegistrations.length} zajęć
                    </Badge>
                    {isExpired && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Wygasła
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {placeRegistrations.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Brak zapisanych zajęć w tej lokalizacji
                    </p>
                    <Link href="/grafik">
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Zobacz dostępne zajęcia
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {placeRegistrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">
                              {registration.schedule.activity}
                            </h3>
                            {getStatusBadge(registration.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="secondary" className="text-xs">
                                  {registration.schedule.day}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {registration.schedule.start?.slice(0, 5)} - {registration.schedule.end?.slice(0, 5)}
                                </span>
                              </div>
                              
                              {registration.schedule.trainers && (
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {registration.schedule.trainers.name}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-sm">
                                <span className="font-medium">Data zapisu:</span><br />
                                {new Date(registration.created_at).toLocaleDateString('pl-PL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              
                              {registration.notes && (
                                <div className="text-sm">
                                  <span className="font-medium">Uwagi:</span><br />
                                  <span className="italic text-muted-foreground">{registration.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {registration.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRegistration(registration.id)}
                            disabled={cancellingId === registration.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600"
                          >
                            {cancellingId === registration.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Anuluj
                              </>
                              )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
