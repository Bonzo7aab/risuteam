"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, UserCheck, X, AlertTriangle, CheckCircle } from "lucide-react";
import { getUserRegistrations, cancelRegistration } from "@/app/actions";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUserRegistrations(userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setRegistrations(result.data || []);
      }
    } catch (err) {
      setError("Wystąpił błąd podczas pobierania zapisów");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Potwierdzony</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Anulowany</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-100 text-yellow-800">Lista oczekujących</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <p className="text-sm text-gray-400">
                Przejdź do grafiku zajęć, aby zapisać się na wybrane zajęcia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Moje zapisy na zajęcia</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoimi zapisami na zajęcia i śledź swój harmonogram
        </p>
      </div>

      <div className="space-y-4">
        {registrations.map((registration) => (
          <Card key={registration.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-xl">
                      {registration.schedule.activity}
                    </h3>
                    {getStatusBadge(registration.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Badge className={getDayColor(registration.schedule.day)}>
                          {registration.schedule.day}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {registration.schedule.start?.slice(0, 5)} - {registration.schedule.end?.slice(0, 5)}
                        </span>
                      </div>
                      
                      {registration.schedule.trainers && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {registration.schedule.trainers.name}
                          </span>
                        </div>
                      )}
                      
                      {registration.schedule.places && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {registration.schedule.places.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">
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
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Uwagi:</span><br />
                          <span className="italic">{registration.notes}</span>
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
