"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Pause,
  Play,
  X,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  Bell,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  getUserSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/app/actions";

interface SubscriptionData {
  id: number;
  user_id: string;
  schedule_id: number;
  subscription_type: "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: "active" | "paused" | "cancelled" | "expired";
  price?: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  schedule?: {
    id: number;
    title?: string;
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

interface UserSubscriptionsPanelProps {
  userId: string;
}

export default function UserSubscriptionsPanel({ userId }: UserSubscriptionsPanelProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: "info" | "warning" | "success";
    message: string;
    timestamp: Date;
  }>>([]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUserSubscriptions(userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSubscriptions(result.data || []);
      }
    } catch (err) {
      setError("Wystąpił błąd podczas pobierania subskrypcji");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const addNotification = (type: "info" | "warning" | "success", message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handlePauseSubscription = async (subscriptionId: number) => {
    try {
      setActionLoading(subscriptionId);
      const result = await pauseSubscription(subscriptionId);
      
      if (result.error) {
        setError(result.error);
        addNotification("warning", "Nie udało się wstrzymać subskrypcji");
      } else {
        await fetchSubscriptions();
        addNotification("success", "Subskrypcja została wstrzymana");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas wstrzymywania subskrypcji");
      addNotification("warning", "Wystąpił błąd podczas wstrzymywania subskrypcji");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: number) => {
    try {
      setActionLoading(subscriptionId);
      const result = await resumeSubscription(subscriptionId);
      
      if (result.error) {
        setError(result.error);
        addNotification("warning", "Nie udało się wznowić subskrypcji");
      } else {
        await fetchSubscriptions();
        addNotification("success", "Subskrypcja została wznowiona");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas wznawiania subskrypcji");
      addNotification("warning", "Wystąpił błąd podczas wznawiania subskrypcji");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      setActionLoading(subscriptionId);
      const result = await cancelSubscription(subscriptionId);
      
      if (result.error) {
        setError(result.error);
        addNotification("warning", "Nie udało się anulować subskrypcji");
      } else {
        await fetchSubscriptions();
        addNotification("success", "Subskrypcja została anulowana");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas anulowania subskrypcji");
      addNotification("warning", "Wystąpił błąd podczas anulowania subskrypcji");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const isExpiringSoon = new Date(endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">Aktywna</Badge>
            {isExpiringSoon && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Wygasa wkrótce
              </Badge>
            )}
          </div>
        );
      case "paused":
        return <Badge variant="secondary">Wstrzymana</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulowana</Badge>;
      case "expired":
        return <Badge variant="outline">Wygasła</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionTypeLabel = (type: string) => {
    switch (type) {
      case "monthly":
        return "Miesięczna";
      case "quarterly":
        return "Kwartalna";
      case "yearly":
        return "Roczna";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moje Subskrypcje</h1>
            <p className="text-muted-foreground">
              Zarządzaj swoimi subskrypcjami na zajęcia
            </p>
          </div>
          <Button onClick={fetchSubscriptions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Odśwież
          </Button>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-3 rounded-md border ${
                  notification.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : notification.type === "warning"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : notification.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
                <span className="text-sm">{notification.message}</span>
                <span className="text-xs opacity-70 ml-auto">
                  {notification.timestamp.toLocaleTimeString('pl-PL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak subskrypcji</h3>
                <p className="text-muted-foreground">
                  Nie masz jeszcze żadnych aktywnych subskrypcji na zajęcia.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {subscription.schedule?.activity || "Nieznane zajęcia"}
                        </CardTitle>
                        {getStatusBadge(subscription.status, subscription.end_date)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {subscription.schedule?.day}
                        </span>
                        {subscription.schedule?.start && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subscription.schedule.start} - {subscription.schedule.end}
                          </span>
                        )}
                        {subscription.schedule?.places?.name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {subscription.schedule.places.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {getSubscriptionTypeLabel(subscription.subscription_type)}
                      </div>
                      {subscription.price && (
                        <div className="text-lg font-semibold">
                          {subscription.price} {subscription.currency}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Data rozpoczęcia
                      </label>
                      <p className="text-sm">
                        {new Date(subscription.start_date).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Data zakończenia
                      </label>
                      <p className="text-sm">
                        {new Date(subscription.end_date).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    {subscription.schedule?.trainers?.name && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Trener
                        </label>
                        <p className="text-sm">{subscription.schedule.trainers.name}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Auto-odnawianie
                      </label>
                      <p className="text-sm">
                        {subscription.auto_renew ? "Tak" : "Nie"}
                      </p>
                    </div>
                  </div>

                  {subscription.notes && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <label className="text-sm font-medium text-muted-foreground">
                        Notatki
                      </label>
                      <p className="text-sm">{subscription.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {subscription.status === "active" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseSubscription(subscription.id)}
                          disabled={actionLoading === subscription.id}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Wstrzymaj
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === subscription.id}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Anuluj
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Anuluj subskrypcję</AlertDialogTitle>
                              <AlertDialogDescription>
                                Czy na pewno chcesz anulować tę subskrypcję? 
                                Ta akcja nie może być cofnięta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelSubscription(subscription.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Tak, anuluj subskrypcję
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {subscription.status === "paused" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleResumeSubscription(subscription.id)}
                        disabled={actionLoading === subscription.id}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Wznów
                      </Button>
                    )}

                    {subscription.status === "cancelled" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="w-4 h-4" />
                        Subskrypcja została anulowana
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
