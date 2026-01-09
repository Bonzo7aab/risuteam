"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Users,
  BookOpen,
  CheckCircle,
  Home,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  AlertCircle,
  CheckSquare,
  XCircle,
  Pause
} from "lucide-react";
import { getUserDashboardStats, getPlaceBasedSubscriptionStats } from "@/app/actions";

interface UserDashboardProps {
  user: User;
}

interface DashboardStats {
  subscriptions: {
    total: number;
    active: number;
    paused: number;
    expired: number;
    nextRenewal?: string;
  };
  registrations: {
    total: number;
    upcoming: number;
    completed: number;
    recent: any[];
  };
  activity: {
    lastLogin: string | null;
    lastRegistration: string | null;
    lastClass: string | null;
  };
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get both registration stats and place-based subscription stats
      const [regStats, subStats] = await Promise.all([
        getUserDashboardStats(user.id),
        getPlaceBasedSubscriptionStats(user.id)
      ]);

      if (regStats.error) {
        setError(regStats.error);
        return;
      }

      if (subStats.error) {
        console.warn("Could not fetch subscription stats:", subStats.error);
      }

      // Combine the stats
      setStats({
        ...regStats.data,
        subscriptions: subStats.data || {
          total: 0,
          active: 0,
          paused: 0,
          expired: 0,
          nextRenewal: null,
          totalClassesRemaining: 0
        }
      });
    } catch (err) {
      setError("Wystąpił błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchStats();
  }, [user.id, user.last_sign_in_at, fetchStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString?.slice(0, 5) || '';
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      active: "default",
      paused: "secondary",
      expired: "destructive",
      confirmed: "default",
      cancelled: "destructive"
    };

    const statusText: { [key: string]: string } = {
      active: 'Aktywna',
      paused: 'Wstrzymana',
      expired: 'Wygasła',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana'
    };

    const statusIcons: { [key: string]: React.ReactNode } = {
      active: <CheckCircle className="w-3 h-3 mr-1.5" />,
      paused: <Pause className="w-3 h-3 mr-1.5" />,
      expired: <XCircle className="w-3 h-3 mr-1.5" />,
      confirmed: <CheckSquare className="w-3 h-3 mr-1.5" />,
      cancelled: <XCircle className="w-3 h-3 mr-1.5" />
    };

    return (
      <Badge 
        variant={variants[status] || "outline"}
        className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-none shadow-sm border-0 min-w-[60px] h-8"
      >
        {statusIcons[status]}
        {statusText[status] || status}
      </Badge>
    );
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
          
          {/* Content Skeleton */}
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section - Matching registrations dashboard style */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel użytkownika</h1>
        <p className="text-muted-foreground">
          Przeglądaj swoje subskrypcje, zapisy na zajęcia i aktywność
        </p>
      </div>

      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informacje o użytkowniku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ostatnie logowanie
                </label>
                <p className="text-sm">
                  {stats?.activity.lastLogin 
                    ? formatDate(stats.activity.lastLogin)
                    : 'Brak danych'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place-Based Subscription Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Przegląd Subskrypcji Miejscowych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.subscriptions.active || 0}</div>
                <div className="text-sm text-muted-foreground">Aktywne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats?.subscriptions.paused || 0}</div>
                <div className="text-sm text-muted-foreground">Wstrzymane</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats?.subscriptions.expired || 0}</div>
                <div className="text-sm text-muted-foreground">Wygasłe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.subscriptions.totalClassesRemaining || 0}</div>
                <div className="text-sm text-muted-foreground">Zajęcia do wykorzystania</div>
              </div>
            </div>
            
            {stats?.subscriptions.nextRenewal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Następna odnowienie: {formatDate(stats.subscriptions.nextRenewal)}
                  </span>
                </div>
              </div>
            )}
            
            {stats?.subscriptions.total === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Nie masz jeszcze żadnych subskrypcji miejscowych. Zapisz się na zajęcia w wybranej lokalizacji!
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/subscriptions">
                  Zarządzaj subskrypcjami
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Class Registrations Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Moje zapisy na zajęcia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.registrations.total || 0}</div>
                <div className="text-sm text-muted-foreground">Łącznie zapisów</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.registrations.upcoming || 0}</div>
                <div className="text-sm text-muted-foreground">Nadchodzące</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats?.registrations.completed || 0}</div>
                <div className="text-sm text-muted-foreground">Ukończone</div>
              </div>
            </div>

            {stats?.registrations.recent && stats.registrations.recent.length > 0 ? (
              <div className="space-y-3 mb-4">
                <h4 className="font-medium text-sm text-muted-foreground">Ostatnie zapisy:</h4>
                {stats.registrations.recent.slice(0, 3).map((reg: any) => { 
                  return ( 
                  <div key={reg.id} className="relative p-3 border border-blue-600 rounded-lg">
                    {/* Status Badge - Square and attached to corner */}
                    <div className="absolute top-0 right-0">
                      {getStatusBadge(reg.status)}
                    </div>
                    
                    {/* Content with proper spacing for badge */}
                    <div className="pr-16">
                      <div className="font-medium text-sm">{reg.schedule?.activity}</div>
                      <div className="text-xs text-muted-foreground">
                        {reg.schedule?.day} • {formatTime(reg.schedule?.start)} - {formatTime(reg.schedule?.end)}
                      </div>
                      {reg.schedule?.trainers && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Trener: {reg.schedule.trainers.name}
                        </div>
                      )}
                      {reg.schedule?.places && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Miejsce: {reg.schedule.places.name}
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            ) : stats?.registrations.total === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Nie masz jeszcze żadnych zapisów na zajęcia</p>
                <p className="text-xs text-gray-500">Przeglądaj grafik zajęć i zapisz się na interesujące Cię zajęcia</p>
              </div>
            )}
            
            <div className="mt-4">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/registrations">
                  Zobacz wszystkie zapisy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Grafik zajęć
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Przeglądaj dostępne zajęcia i zapisuj się
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/grafik">
                  Zobacz grafik
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Ustawienia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Zarządzaj swoimi preferencjami i kontem
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/settings">
                  Otwórz ustawienia
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Ostatnia aktywność
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.activity.lastRegistration || stats?.activity.lastClass ? (
              <div className="space-y-4">
                {stats.activity.lastRegistration && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Ostatni zapis na zajęcia</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(stats.activity.lastRegistration)}
                      </div>
                    </div>
                  </div>
                )}
                
                {stats.activity.lastClass && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Następne zajęcia</div>
                      <div className="text-sm text-muted-foreground">
                        {stats.activity.lastClass}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak ostatniej aktywności</p>
                <p className="text-sm">Twoja aktywność pojawi się tutaj po zapisaniu się na zajęcia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
