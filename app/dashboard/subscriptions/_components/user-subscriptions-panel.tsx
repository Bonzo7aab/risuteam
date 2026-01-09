"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Pause,
  Play,
  Plus,
  RefreshCw,
  X,
  UserCheck
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  cancelPlaceBasedSubscription,
  cancelRegistration,
  createPlaceBasedSubscription,
  deletePlaceBasedSubscription,
  extendSubscription,
  fetchPlaces,
  getAvailableClassTypes,
  getSubscriptionWithRegistrations,
  getUserPlaceBasedSubscriptions,
  pausePlaceBasedSubscription,
  removeExtension,
  resumePlaceBasedSubscription,
  toggleAutoRenewal
} from "@/app/actions";
import { PlaceType } from "@/app/types/types";

interface PlaceBasedSubscriptionData {
  id: number;
  user_id: string;
  place_id: number;
  class_type: string;
  subscription_type: "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date: string;
  original_end_date?: string;
  auto_renew: boolean;
  status: "active" | "paused" | "cancelled" | "expired";
  price?: number;
  currency: string;
  max_classes_per_period?: number;
  classes_used: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  place?: {
    id: number;
    name: string;
    address: string;
  };
}

interface UserSubscriptionsPanelProps {
  userId: string;
}

export default function UserSubscriptionsPanel({ userId }: UserSubscriptionsPanelProps) {
  const [subscriptions, setSubscriptions] = useState<PlaceBasedSubscriptionData[]>([]);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [classTypes, setClassTypes] = useState<string[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: "info" | "warning" | "success";
    message: string;
    timestamp: Date;
  }>>([]);
  
  // New subscription form state
  const [showNewSubscriptionDialog, setShowNewSubscriptionDialog] = useState(false);
  const [newSubscriptionForm, setNewSubscriptionForm] = useState({
    placeId: "",
    classType: "",
    subscriptionType: "monthly" as "monthly" | "quarterly" | "yearly",
    autoRenew: false
  });
  const [creatingSubscription, setCreatingSubscription] = useState(false);

  // Extension dialog state
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [extensionForm, setExtensionForm] = useState({
    subscriptionId: 0,
    subscriptionType: "monthly" as "monthly" | "quarterly" | "yearly",
    currentType: "monthly" as "monthly" | "quarterly" | "yearly"
  });
  const [extendingSubscription, setExtendingSubscription] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subscriptionsResult, placesResult, classTypesResult, weeklySlotsResult] = await Promise.all([
        getUserPlaceBasedSubscriptions(userId),
        fetchPlaces(),
        getAvailableClassTypes(),
        getSubscriptionWithRegistrations(userId)
      ]);

      if (subscriptionsResult.error) {
        setError(subscriptionsResult.error);
        return;
      }

      if (placesResult.error) {
        console.warn("Could not fetch places:", placesResult.error);
      }

      if (classTypesResult.error) {
        console.warn("Could not fetch class types:", classTypesResult.error);
      }

      if (weeklySlotsResult.error) {
        console.warn("Could not fetch weekly slots:", weeklySlotsResult.error);
      }

      try {
        setSubscriptions(subscriptionsResult.data || []);
        setPlaces(placesResult.data || []);
        setClassTypes(classTypesResult.data || []);
        setWeeklySlots(weeklySlotsResult.data?.weeklySlots || {});
      } catch (stateError) {
        console.error("Error setting state:", stateError);
      }
    } catch (err) {
      setError("Wystąpił błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addNotification = (type: "info" | "warning" | "success", message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };



  const handleCancelSubscription = async (subscriptionId: number) => {
    setActionLoading(subscriptionId);
    try {
      const result = await cancelPlaceBasedSubscription(subscriptionId);
      if (result.error) {
        addNotification("warning", result.error);
      } else {
        addNotification("success", "Subskrypcja została anulowana");
        // Update the specific subscription in local state
        updateSubscriptionInState(subscriptionId, {
          status: "cancelled",
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas anulowania subskrypcji");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę anulowaną subskrypcję? Ta operacja jest nieodwracalna.")) {
      return;
    }

    setActionLoading(subscriptionId);
    try {
      const result = await deletePlaceBasedSubscription(subscriptionId);
      if (result.error) {
        addNotification("warning", result.error);
      } else {
        addNotification("success", "Subskrypcja została usunięta");
        // Remove the subscription from local state
        removeSubscriptionFromState(subscriptionId);
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas usuwania subskrypcji");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRegistration = async (registrationId: number) => {
    if (!confirm("Czy na pewno chcesz anulować zapis na te zajęcia?")) {
      return;
    }

    try {
      setActionLoading(registrationId);
      const result = await cancelRegistration(registrationId);
      
      if (result.error) {
        addNotification("warning", result.error);
      } else {
        addNotification("success", "Zapis na zajęcia został anulowany");
        await fetchData();
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas anulowania zapisu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAutoRenewal = async (subscriptionId: number, currentAutoRenew: boolean) => {
    try {
      setActionLoading(subscriptionId);
      const success = await toggleAutoRenewal(subscriptionId, !currentAutoRenew);
      
      if (success) {
        // Update local state without page refresh
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { ...sub, auto_renew: !currentAutoRenew }
              : sub
          )
        );
        addNotification("success", `Auto-odnawianie zostało ${!currentAutoRenew ? 'włączone' : 'wyłączone'}`);
      } else {
        addNotification("warning", "Nie udało się zaktualizować auto-odnawiania.");
      }
    } catch (error) {
      console.error('Error toggling auto-renewal:', error);
      addNotification("warning", "Nie udało się zaktualizować auto-odnawiania.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscriptionForm.placeId || !newSubscriptionForm.classType || !newSubscriptionForm.subscriptionType) {
      addNotification("warning", "Wypełnij wszystkie wymagane pola");
      return;
    }

    try {
      setCreatingSubscription(true);
      const result = await createPlaceBasedSubscription(
        userId,
        parseInt(newSubscriptionForm.placeId),
        newSubscriptionForm.classType,
        newSubscriptionForm.subscriptionType,
        newSubscriptionForm.autoRenew,
        undefined, // maxClassesPerPeriod - removed
        undefined  // notes - removed
      );

      if (result.error) {
        addNotification("warning", result.error);
      } else {
        addNotification("success", "Subskrypcja została utworzona pomyślnie!");
        setShowNewSubscriptionDialog(false);
        resetNewSubscriptionForm();
        
        // Fetch the newly created subscription and add it to local state
        if (result.subscriptionId) {
          try {
            const { data: newSubscription } = await getUserPlaceBasedSubscriptions(userId);
            if (newSubscription) {
              const createdSub = newSubscription.find(sub => sub.id === result.subscriptionId);
              if (createdSub) {
                setSubscriptions(prev => [...prev, createdSub]);
              }
            }
          } catch (err) {
            // If fetching fails, fall back to full refresh
            await fetchData();
          }
        }
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas tworzenia subskrypcji");
    } finally {
      setCreatingSubscription(false);
    }
  };

  const resetNewSubscriptionForm = () => {
    setNewSubscriptionForm({
      placeId: "",
      classType: "",
      subscriptionType: "monthly",
      autoRenew: false
    });
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const isExpired = end < today;
    const isExpiringSoon = !isExpired && end <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // If subscription is expired, show "Wygasła" regardless of status
    if (isExpired) {
      return <Badge variant="outline" className="text-red-600 border-red-300">Wygasła</Badge>;
    }
    
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">Aktywna</Badge>
            {isExpiringSoon && (
              <Badge variant="outline" className="text-orange-600 border-red-300">
                <AlertCircle className="w-3 h-3 mr-1" />
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
        return <Badge variant="outline" className="text-red-600 border-red-300">Wygasła</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionTypeLabel = (type: string) => {
    switch (type) {
      case "monthly":
        return "Miesięczna (1 miesiąc)";
      case "quarterly":
        return "Kwartalna (3 miesiące)";
      case "yearly":
        return "Roczna (12 miesięcy)";
      default:
        return type;
    }
  };

  const getWeeklySlotsForPlace = (placeName: string | undefined) => {
    if (!placeName || !weeklySlots || !weeklySlots[placeName]) {
      return null;
    }
    return weeklySlots[placeName];
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to get proper Polish grammar for days
  const getDaysText = (days: number) => {
    if (days === 1) {
      return "dzień";
    } else if (days >= 2 && days <= 4) {
      return "dni";
    } else {
      return "dni";
    }
  };

  // Helper function to get proper Polish grammar for "remaining"
  const getRemainingText = (days: number) => {
    if (days === 1) {
      return "pozostał";
    } else {
      return "pozostało";
    }
  };

  // Helper function to check if user already has a subscription for a place and class type
  const hasSubscriptionForPlaceAndClass = (placeId: number, classType: string) => {
    return subscriptions.some(sub => 
      sub.place_id === placeId && 
      sub.class_type === classType && 
      (sub.status === "active" || sub.status === "paused")
    );
  };

  // Helper function to get subscription status for a place and class type
  const getSubscriptionStatusForPlaceAndClass = (placeId: number, classType: string) => {
    const subscription = subscriptions.find(sub => 
      sub.place_id === placeId && 
      sub.class_type === classType
    );
    return subscription?.status || null;
  };

  // Helper function to update a single subscription in the local state
  const updateSubscriptionInState = (subscriptionId: number, updates: Partial<PlaceBasedSubscriptionData>) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId ? { ...sub, ...updates } : sub
    ));
  };

  // Helper function to remove a subscription from the local state
  const removeSubscriptionFromState = (subscriptionId: number) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
  };

  const handleExtendSubscription = (subscriptionId: number) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      setExtensionForm({
        subscriptionId: subscriptionId,
        subscriptionType: subscription.subscription_type,
        currentType: subscription.subscription_type
      });
      setShowExtensionDialog(true);
    }
  };

  const handleConfirmExtension = async () => {
    try {
      setExtendingSubscription(true);
      
      const subscription = subscriptions.find(sub => sub.id === extensionForm.subscriptionId);
      const isRenewal = subscription?.status === "expired" || (subscription && new Date(subscription.end_date) < new Date());
      
      const result = await extendSubscription(
        extensionForm.subscriptionId, 
        true, 
        extensionForm.subscriptionType
      );
      
      if (result.error) {
        addNotification("warning", result.error);
      } else {
        const actionText = isRenewal ? "odnawiona" : "przedłużona";
        const typeChanged = extensionForm.subscriptionType !== extensionForm.currentType;
        const typeText = typeChanged ? ` (zmieniono typ na ${extensionForm.subscriptionType})` : "";
        addNotification("success", `Subskrypcja została ${actionText} do ${new Date(result.newEndDate!).toLocaleDateString('pl-PL')}${typeText}`);
        
        // Update the specific subscription in local state
        updateSubscriptionInState(extensionForm.subscriptionId, {
          end_date: result.newEndDate!,
          original_end_date: result.originalEndDate!,
          subscription_type: extensionForm.subscriptionType,
          status: "active", // Always set to active after extension/renewal
          updated_at: new Date().toISOString()
        });
        
        setShowExtensionDialog(false);
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas przedłużania subskrypcji");
    } finally {
      setExtendingSubscription(false);
    }
  };

  const handleRemoveExtension = async (subscriptionId: number) => {
    try {
      setActionLoading(subscriptionId);
      const result = await removeExtension(subscriptionId);
      
      if (result.error) {
        addNotification("warning", result.error);
      } else {
        addNotification("success", `Przedłużenie zostało cofnięte. Subskrypcja kończy się ${new Date(result.revertedEndDate!).toLocaleDateString('pl-PL')}`);
        // Update the specific subscription in local state
        updateSubscriptionInState(subscriptionId, {
          end_date: result.revertedEndDate!,
          original_end_date: undefined, // Clear the original end date
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      addNotification("warning", "Wystąpił błąd podczas cofania przedłużenia");
    } finally {
      setActionLoading(null);
    }
  };



  const isSubscriptionExtended = (subscription: any) => {
    // Check if the original_end_date field exists and is different from end_date
    if (!subscription.hasOwnProperty('original_end_date') || !subscription.original_end_date) {
      return false;
    }
    return subscription.original_end_date !== subscription.end_date;
  };

  const getSubscriptionTypeDays = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'monthly':
        return 30;
      case 'quarterly':
        return 90;
      case 'yearly':
        return 365;
      default:
        return 30;
    }
  };

  const shouldShowExtendedBadge = (subscription: any) => {
    // Show extended badge only for true extensions (not renewals from expired)
    if (!isSubscriptionExtended(subscription)) {
      return false;
    }
    
    // Check if this was a renewal from expired state
    const today = new Date();
    const originalEndDate = new Date(subscription.original_end_date);
    
    // If the original end date was in the past, this was a renewal, not an extension
    if (originalEndDate < today) {
      return false;
    }
    
    return true;
  };

  // Helper function to calculate extension duration in days
  const getExtensionDuration = (subscription: any) => {
    if (!isSubscriptionExtended(subscription)) return 0;
    
    const originalDate = new Date(subscription.original_end_date);
    const currentDate = new Date(subscription.end_date);
    const diffTime = currentDate.getTime() - originalDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const shouldShowRemoveExtensionButton = (subscription: any) => {
    // Show the button only if:
    // 1. The subscription is active
    // 2. The subscription was extended (not renewed from expired)
    // 3. The subscription is still within its normal time period
    if (subscription.status !== "active" || !isSubscriptionExtended(subscription)) {
      return false;
    }
    
    // Check if this was a renewal from expired state (should not show remove extension)
    const today = new Date();
    const originalEndDate = new Date(subscription.original_end_date);
    
    // If the original end date was in the past, this was a renewal, not an extension
    if (originalEndDate < today) {
      return false;
    }
    
    return true;
  };

  const shouldShowCancelButton = (subscription: any) => {
    // Allow cancellation for active and expired subscriptions
    return subscription.status === "active" || subscription.status === "expired";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
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
            <h1 className="text-3xl font-bold">Moje Subskrypcje</h1>
            <p className="text-muted-foreground text-sm">
              Zarządzaj swoimi subskrypcjami na zajęcia w wybranych lokalizacjach (do 2 zajęć tygodniowo)
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showNewSubscriptionDialog} onOpenChange={setShowNewSubscriptionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nowa Subskrypcja
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Utwórz nową subskrypcję</DialogTitle>
                  <DialogDescription>
                    Wybierz lokalizację i typ zajęć dla swojej subskrypcji
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Model subskrypcji:</strong> Każda subskrypcja daje dostęp do 2 wybranych zajęć w tygodniu.
                </div>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="place">Lokalizacja *</Label>
                      <Select
                        value={newSubscriptionForm.placeId}
                        onValueChange={(value) => setNewSubscriptionForm(prev => ({ ...prev, placeId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz lokalizację" />
                        </SelectTrigger>
                        <SelectContent>
                          {places.map((place) => {
                            // Check if user has any subscription for this place
                            const hasActiveSubscription = subscriptions.some(sub => 
                              sub.place_id === place.id && 
                              (sub.status === "active" || sub.status === "paused")
                            );
                            const hasExpiredSubscription = subscriptions.some(sub => 
                              sub.place_id === place.id && 
                              sub.status === "expired"
                            );
                            const hasCancelledSubscription = subscriptions.some(sub => 
                              sub.place_id === place.id && 
                              sub.status === "cancelled"
                            );

                            return (
                              <SelectItem 
                                key={place.id} 
                                value={place.id.toString()}
                                disabled={hasActiveSubscription}
                                className={hasActiveSubscription ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={hasActiveSubscription ? "text-gray-500" : ""}>{place.name}</span>
                                  {hasActiveSubscription && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aktywna
                                    </Badge>
                                  )}
                                  {hasExpiredSubscription && !hasActiveSubscription && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Wygasła
                                    </Badge>
                                  )}
                                  {hasCancelledSubscription && !hasActiveSubscription && !hasExpiredSubscription && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                                      <X className="w-3 h-3 mr-1" />
                                      Anulowana
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {/* Helper text for disabled options */}
                      {subscriptions.some(sub => sub.status === "active" || sub.status === "paused") && (
                        <p className="text-xs text-gray-500 mt-1">
                          Opcje z aktywną subskrypcją są wyłączone. Możesz przedłużyć istniejącą subskrypcję zamiast tworzyć nową.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classType">Typ zajęć *</Label>
                      <Select
                        value={newSubscriptionForm.classType}
                        onValueChange={(value) => setNewSubscriptionForm(prev => ({ ...prev, classType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz typ zajęć" />
                        </SelectTrigger>
                        <SelectContent>
                          {classTypes.map((type) => {
                            const placeId = parseInt(newSubscriptionForm.placeId);
                            const hasActiveSubscriptionForThisClass = placeId > 0 && hasSubscriptionForPlaceAndClass(placeId, type);
                            const subscriptionStatus = placeId > 0 ? getSubscriptionStatusForPlaceAndClass(placeId, type) : null;

                            return (
                              <SelectItem 
                                key={type} 
                                value={type}
                                disabled={hasActiveSubscriptionForThisClass}
                                className={hasActiveSubscriptionForThisClass ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={hasActiveSubscriptionForThisClass ? "text-gray-500" : ""}>{type}</span>
                                  {hasActiveSubscriptionForThisClass && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aktywna
                                    </Badge>
                                  )}
                                  {subscriptionStatus === "expired" && !hasActiveSubscriptionForThisClass && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Wygasła
                                    </Badge>
                                  )}
                                  {subscriptionStatus === "cancelled" && !hasActiveSubscriptionForThisClass && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                                      <X className="w-3 h-3 mr-1" />
                                      Anulowana
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {/* Helper text for disabled class type options */}
                      {newSubscriptionForm.placeId && subscriptions.some(sub => 
                        sub.place_id === parseInt(newSubscriptionForm.placeId) && 
                        (sub.status === "active" || sub.status === "paused")
                      ) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Typy zajęć z aktywną subskrypcją są wyłączone dla wybranej lokalizacji.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionType">Typ subskrypcji *</Label>
                    <Select
                      value={newSubscriptionForm.subscriptionType}
                      onValueChange={(value: "monthly" | "quarterly" | "yearly") => 
                        setNewSubscriptionForm(prev => ({ ...prev, subscriptionType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Miesięczna (1 miesiąc)</SelectItem>
                        <SelectItem value="quarterly">Kwartalna (3 miesiące)</SelectItem>
                        <SelectItem value="yearly">Roczna (12 miesięcy)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      do 2 zajęć tygodniowo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoRenew">Auto-odnawianie</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoRenew"
                        checked={newSubscriptionForm.autoRenew}
                        onCheckedChange={(checked) => setNewSubscriptionForm(prev => ({ ...prev, autoRenew: checked }))}
                      />
                      <Label htmlFor="autoRenew" className="text-sm">
                        {newSubscriptionForm.autoRenew ? "Włączone" : "Wyłączone"}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subskrypcja będzie automatycznie odnawiana po wygaśnięciu
                    </p>
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewSubscriptionDialog(false)}>
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleCreateSubscription}
                    disabled={creatingSubscription || !newSubscriptionForm.placeId || !newSubscriptionForm.classType || !newSubscriptionForm.subscriptionType}
                  >
                    {creatingSubscription ? "Tworzenie..." : "Utwórz subskrypcję"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Odśwież
            </Button>
          </div>
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
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
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
                  Nie masz jeszcze żadnych aktywnych subskrypcji miejscowych.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowNewSubscriptionDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Utwórz pierwszą subskrypcję
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => {
              console.log(subscription);
              return (
              <Card key={subscription.id} className={`${subscription.status === "expired" ? 'border-2 border-red-400/50 bg-red-200/10' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {subscription.place?.name ? (
                            <span>{subscription.place.name}</span>
                          ) : (
                            <span className="text-red-500">Brak lokalizacji</span>
                          )}
                        </CardTitle>
                        {getStatusBadge(subscription.status, subscription.end_date)}
                      </div>
                      

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(subscription.start_date).toLocaleDateString('pl-PL')} - {new Date(subscription.end_date).toLocaleDateString('pl-PL')}
                        </span>
                        
                        {/* Days Remaining Indicator */}
                        {subscription.status === "active" && getDaysRemaining(subscription.end_date) > 0 && (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            getDaysRemaining(subscription.end_date) <= 7 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : getDaysRemaining(subscription.end_date) <= 14 
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : getDaysRemaining(subscription.end_date) <= 30 
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                  : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {getDaysRemaining(subscription.end_date)} {getDaysText(getDaysRemaining(subscription.end_date))} {getRemainingText(getDaysRemaining(subscription.end_date))} 
                            {shouldShowExtendedBadge(subscription) && (
                              <span className="ml-1 text-xs">
                                (przedłużona o {getExtensionDuration(subscription)} {getDaysText(getExtensionDuration(subscription))})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {getSubscriptionTypeLabel(subscription.subscription_type)}
                        </div>
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

                  {/* Cancelled Subscription Notice */}
                  {subscription.status === "cancelled" && (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <X className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-800 mb-1">
                            Subskrypcja anulowana
                          </p>
                          <p className="text-gray-700">
                            Ta subskrypcja została anulowana. Możesz ją usunąć z listy, aby uporządkować swoje subskrypcje.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Classes Under This Subscription */}
                  {(() => {
                    const slots = getWeeklySlotsForPlace(subscription.place?.name);
                    if (!slots || !slots.registrations || slots.registrations.length === 0) {
                      return (
                        <div className="mb-4 p-3 border border-blue-400/20 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Brak zapisanych zajęć w tygodniu</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Użyj swojej subskrypcji, zapisując się na zajęcia w grafiku
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mb-4 space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <Calendar className="w-4 h-4" />
                          <span>Zapisane zajęcia w tygodniu ({slots.registrations.length}/{slots.maxPerWeek})</span>
                        </div>
                        <div className="space-y-2">
                          {slots.registrations.map((registration: any) => (
                            <div key={registration.id} className="flex items-center justify-between p-3 border border-blue-400/20 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {registration.schedule?.activity}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {registration.schedule?.day}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {registration.schedule?.start?.slice(0, 5)} - {registration.schedule?.end?.slice(0, 5)}
                                    </span>
                                    {registration.schedule?.trainers?.name && (
                                      <span className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" />
                                        {registration.schedule.trainers.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs">
                                    Zapisano: {new Date(registration.created_at).toLocaleDateString('pl-PL')}
                                  </span>
                                  {registration.notes && (
                                    <span className="text-xs italic">
                                      Uwagi: {registration.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelRegistration(registration.id)}
                                  disabled={actionLoading === registration.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600 h-7 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {subscription.status === "active" && (
                        <>
                          {/* Remove Extension Button */}
                          {shouldShowRemoveExtensionButton(subscription) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveExtension(subscription.id)}
                              disabled={actionLoading === subscription.id}
                              className="border-orange-500 text-orange-600 hover:bg-orange-50/5"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cofnij przedłużenie
                            </Button>
                          )}
                          {shouldShowCancelButton(subscription) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={actionLoading === subscription.id}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Anuluj
                                </Button>
                              </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Czy na pewno chcesz anulować subskrypcję?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ta akcja jest nieodwracalna. Subskrypcja zostanie anulowana i nie będzie można jej wznowić.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelSubscription(subscription.id)}>
                                  Tak, anuluj subskrypcję
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                        </>
                      )}
                      
                      {/* Extend Subscription Button - Available for active subscriptions when ≤30 days */}
                      {subscription.status === "active" && getDaysRemaining(subscription.end_date) <= 30 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExtendSubscription(subscription.id)}
                                disabled={actionLoading === subscription.id || subscription.auto_renew}
                                className={`border-green-500 text-green-600 hover:bg-green-50/5 ${
                                  subscription.auto_renew ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Przedłuż
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs" side="top" sideOffset={5}>
                              {subscription.auto_renew ? (
                                <p>Autoodnawianie jest włączone i automatycznie przedłuży subskrypcję po wygaśnięciu.</p>
                              ) : (
                                <p>Przedłuż subskrypcję o wybrany okres.</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Renew Expired Subscription Button */}
                      {(subscription.status === "expired" || (new Date(subscription.end_date) < new Date())) && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleExtendSubscription(subscription.id)}
                          disabled={actionLoading === subscription.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Odnów subskrypcję
                        </Button>
                      )}

                      {/* Delete Cancelled Subscription Button */}
                      {subscription.status === "cancelled" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === subscription.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Usuń
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Czy na pewno chcesz usunąć tę subskrypcję?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ta operacja jest nieodwracalna. Subskrypcja zostanie całkowicie usunięta z systemu. 
                                Można usunąć tylko anulowane subskrypcje.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSubscription(subscription.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Tak, usuń subskrypcję
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      



                    </div>

                    {/* Auto-renewal section - Only show for active subscriptions */}
                    {subscription.status === "active" && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Autoodnawianie</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="w-3 h-3 text-muted-foreground cursor-help self-start -ml-1" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-xs" side="top" sideOffset={5}>
                              <p>Gdy włączone, subskrypcja będzie automatycznie odnawiana po wygaśnięciu, zachowując te same ustawienia i lokalizację. Możesz wyłączyć to w dowolnym momencie. Autoodnawianie działa tylko dla aktywnych subskrypcji¹.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Switch
                          checked={subscription.auto_renew}
                          onCheckedChange={(checked) => {
                            handleToggleAutoRenewal(subscription.id, subscription.auto_renew);
                          }}
                          disabled={actionLoading === subscription.id || getDaysRemaining(subscription.end_date) <= 0}
                          className="data-[state=checked]:!bg-green-500 data-[state=unchecked]:!bg-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>

      {/* Extension Dialog */}
      <Dialog open={showExtensionDialog} onOpenChange={setShowExtensionDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Przedłuż subskrypcję</DialogTitle>
            <DialogDescription>
              Wybierz typ subskrypcji dla przedłużenia. Możesz zmienić typ subskrypcji podczas przedłużania.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="extensionType">Typ subskrypcji</Label>
              <Select
                value={extensionForm.subscriptionType}
                onValueChange={(value: "monthly" | "quarterly" | "yearly") => 
                  setExtensionForm(prev => ({ ...prev, subscriptionType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ subskrypcji" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <span>Miesięczna</span>
                      {extensionForm.currentType === "monthly" && (
                        <Badge variant="outline" className="text-xs">Aktualna</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="quarterly">
                    <div className="flex items-center gap-2">
                      <span>Kwartalna</span>
                      {extensionForm.currentType === "quarterly" && (
                        <Badge variant="outline" className="text-xs">Aktualna</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="yearly">
                    <div className="flex items-center gap-2">
                      <span>Roczna</span>
                      {extensionForm.currentType === "yearly" && (
                        <Badge variant="outline" className="text-xs">Aktualna</Badge>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {extensionForm.subscriptionType !== extensionForm.currentType && (
                <p className="text-xs text-blue-600">
                  Zmieniasz typ subskrypcji z {extensionForm.currentType} na {extensionForm.subscriptionType}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowExtensionDialog(false)}
              disabled={extendingSubscription}
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleConfirmExtension}
              disabled={extendingSubscription}
              className="bg-green-600 hover:bg-green-700"
            >
              {extendingSubscription ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Przedłużanie...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Przedłuż subskrypcję
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
