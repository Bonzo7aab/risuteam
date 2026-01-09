"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllUserPlaceBasedSubscriptions, expirePlaceBasedSubscriptions, deletePlaceBasedSubscription } from '@/app/actions';
import { useUserAuth } from '@/app/context/user-auth-context';

export default function TestExpiredSubscriptionsPage() {
  const { user } = useUserAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiring, setExpiring] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchAllSubscriptions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllUserPlaceBasedSubscriptions(user.id);
      
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
  };

  const handleExpireSubscriptions = async () => {
    try {
      setExpiring(true);
      const result = await expirePlaceBasedSubscriptions();
      
      if (result.error) {
        setError(result.error);
      } else {
        alert(`Successfully expired ${result.expiredCount} subscriptions: ${result.expiredIds.join(', ')}`);
        // Refresh the list
        await fetchAllSubscriptions();
      }
    } catch (err) {
      setError("Wystąpił błąd podczas wygaszania subskrypcji");
    } finally {
      setExpiring(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę anulowaną subskrypcję? Ta operacja jest nieodwracalna.")) {
      return;
    }

    try {
      setDeleting(subscriptionId);
      const result = await deletePlaceBasedSubscription(subscriptionId);
      
      if (result.error) {
        setError(result.error);
      } else {
        alert("Subskrypcja została usunięta pomyślnie");
        // Refresh the list
        await fetchAllSubscriptions();
      }
    } catch (err) {
      setError("Wystąpił błąd podczas usuwania subskrypcji");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchAllSubscriptions();
  }, [user?.id]);

  const getStatusBadge = (status: string, endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const isExpired = end < today;
    
    if (isExpired) {
      return <Badge variant="outline" className="text-red-600 border-red-300">Wygasła (Data)</Badge>;
    }
    
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600">Aktywna</Badge>;
      case "paused":
        return <Badge variant="secondary">Wstrzymana</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulowana</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-red-600 border-red-300">Wygasła (Status)</Badge>;
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Ładowanie subskrypcji...</p>
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
            <Button onClick={fetchAllSubscriptions} className="mt-4">
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Test: Wszystkie Subskrypcje</h1>
        <p className="text-muted-foreground">
          Strona testowa do sprawdzania widoczności wygasłych subskrypcji
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={handleExpireSubscriptions}
          disabled={expiring}
          className="bg-red-600 hover:bg-red-700"
        >
          {expiring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Wygaszanie...
            </>
          ) : (
            "Wygasnij wszystkie przeterminowane subskrypcje"
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Brak subskrypcji</p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className={subscription.status === 'expired' ? 'border-red-400 bg-red-50/20' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{subscription.place?.name || 'Brak miejsca'}</span>
                    <span className="text-sm text-muted-foreground">- {subscription.class_type}</span>
                  </div>
                  {getStatusBadge(subscription.status, subscription.end_date)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Typ:</span><br />
                    {getSubscriptionTypeLabel(subscription.subscription_type)}
                  </div>
                  <div>
                    <span className="font-medium">Okres:</span><br />
                    {new Date(subscription.start_date).toLocaleDateString('pl-PL')} - {new Date(subscription.end_date).toLocaleDateString('pl-PL')}
                  </div>
                  <div>
                    <span className="font-medium">Zajęcia:</span><br />
                    {subscription.classes_used} / {subscription.max_classes_per_period || '∞'}
                  </div>
                </div>
                {subscription.notes && (
                  <div className="mt-4">
                    <span className="font-medium">Uwagi:</span><br />
                    <span className="text-muted-foreground">{subscription.notes}</span>
                  </div>
                )}
                
                {/* Delete button for cancelled subscriptions */}
                {subscription.status === 'cancelled' && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      disabled={deleting === subscription.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting === subscription.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Usuwanie...
                        </>
                      ) : (
                        "Usuń subskrypcję"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">Legenda statusów:</h3>
        <div className="space-y-1 text-sm">
          <div><Badge variant="default" className="bg-green-600">Aktywna</Badge> - Subskrypcja jest aktywna</div>
          <div><Badge variant="secondary">Wstrzymana</Badge> - Subskrypcja jest wstrzymana</div>
          <div><Badge variant="destructive">Anulowana</Badge> - Subskrypcja została anulowana</div>
          <div><Badge variant="outline" className="text-red-600 border-red-300">Wygasła (Status)</Badge> - Status w bazie danych to "expired"</div>
          <div><Badge variant="outline" className="text-red-600 border-red-300">Wygasła (Data)</Badge> - Data zakończenia minęła, ale status może być nadal "active"</div>
        </div>
      </div>
    </div>
  );
}
