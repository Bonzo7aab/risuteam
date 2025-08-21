"use client";
import { useEffect, useState, useCallback } from "react";
import { 
  CreditCard, 
  Pause, 
  Play, 
  X, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  BarChart3,
  Filter
} from "lucide-react";

import { Button, Input, Label, Textarea } from "@/components/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  fetchAllSubscriptions,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
} from "../../actions";

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
  users?: {
    id: string;
    email: string;
    user_metadata?: any;
  };
}

interface SubscriptionStats {
  total: number;
  active: number;
  paused: number;
  cancelled: number;
  expired: number;
  monthly: number;
  quarterly: number;
  yearly: number;
}

export default function AdminSubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [form, setForm] = useState<Partial<SubscriptionData>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Load subscriptions and stats
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subscriptionsResult, statsResult] = await Promise.all([
        fetchAllSubscriptions(),
        getSubscriptionStats()
      ]);
      
      if (subscriptionsResult.error) setError(subscriptionsResult.error);
      else setSubscriptions(subscriptionsResult.data || []);
      
      if (statsResult.error) console.error("Stats error:", statsResult.error);
      else setStats(statsResult.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export subscriptions to CSV
  const exportToCSV = () => {
    if (!filteredSubscriptions.length) return;

    const headers = [
      "ID", "Email użytkownika", "Zajęcia", "Typ", "Status", 
      "Data rozpoczęcia", "Data zakończenia", "Cena", "Waluta", 
      "Auto-odnawianie", "Notatki", "Data utworzenia"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredSubscriptions.map(sub => [
        sub.id,
        sub.users?.email || "Nieznany",
        sub.schedule?.activity || "Nieznane",
        sub.subscription_type,
        sub.status,
        sub.start_date,
        sub.end_date,
        sub.price || 0,
        sub.currency,
        sub.auto_renew ? "Tak" : "Nie",
        sub.notes || "",
        sub.created_at
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `subskrypcje_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced filtering with date range
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesType = filterType === "all" || sub.subscription_type === filterType;
    const matchesSearch = searchTerm === "" || 
      sub.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.schedule?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.schedule?.activity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (new Date(sub.created_at) >= new Date(dateRange.start) && 
       new Date(sub.created_at) <= new Date(dateRange.end));

    return matchesStatus && matchesType && matchesSearch && matchesDateRange;
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSelectChange(name: string, value: string) {
    setForm({ ...form, [name]: value });
  }

  function startEdit(subscription: SubscriptionData) {
    setEditingId(subscription.id);
    setForm({
      status: subscription.status,
      auto_renew: subscription.auto_renew,
      notes: subscription.notes,
      price: subscription.price,
      currency: subscription.currency
    });
    setEditDialogOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
    setEditDialogOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    setError(null);
    setSuccess(null);

    try {
      const { error } = await updateSubscription(editingId, form);
      if (error) {
        setError(error);
      } else {
        setSuccess("Subskrypcja została zaktualizowana pomyślnie");
        setEditDialogOpen(false);
        cancelEdit();
        loadData(); // Reload data
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleStatusChange(subscriptionId: number, newStatus: string) {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await updateSubscription(subscriptionId, { 
        status: newStatus as "active" | "paused" | "cancelled" | "expired" 
      });
      
      if (error) {
        setError(error);
      } else {
        setSuccess(`Status subskrypcji został zmieniony na ${newStatus}`);
        loadData(); // Reload data
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Czy na pewno chcesz usunąć tę subskrypcję? Ta operacja jest nieodwracalna.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const { error } = await deleteSubscription(id);
      if (error) {
        setError(error);
      } else {
        setSuccess("Subskrypcja została usunięta pomyślnie");
        loadData(); // Reload data
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      active: { variant: "default", text: "Aktywna", icon: <Play className="w-3 h-3" /> },
      paused: { variant: "secondary", text: "Wstrzymana", icon: <Pause className="w-3 h-3" /> },
      cancelled: { variant: "destructive", text: "Anulowana", icon: <X className="w-3 h-3" /> },
      expired: { variant: "outline", text: "Wygasła", icon: <Calendar className="w-3 h-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
    );
  }

  function getTypeBadge(type: string) {
    const typeConfig = {
      monthly: { variant: "default", text: "Miesięczna" },
      quarterly: { variant: "secondary", text: "Kwartalna" },
      yearly: { variant: "outline", text: "Roczna" }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.monthly;
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pl-PL');
  }

  function formatCurrency(amount?: number, currency?: string) {
    if (!amount) return "Brak";
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency || 'PLN'
    }).format(amount);
  }

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubscriptions.length === 0) return;

    setError(null);
    setSuccess(null);

    try {
      const promises = selectedSubscriptions.map(id => 
        updateSubscription(id, { 
          status: bulkAction as "active" | "paused" | "cancelled" | "expired" 
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        setError(`Błąd podczas aktualizacji ${errors.length} subskrypcji`);
      } else {
        setSuccess(`Pomyślnie zaktualizowano ${selectedSubscriptions.length} subskrypcji`);
        setSelectedSubscriptions([]);
        setBulkAction("");
        loadData();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleSubscriptionSelection = (id: number) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const selectAllSubscriptions = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Ładowanie subskrypcji...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zarządzanie Subskrypcjami</h1>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Odśwież
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktywne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wstrzymane</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miesięczne</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.monthly}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Szukaj po email, tytule lub aktywności..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="active">Aktywne</SelectItem>
              <SelectItem value="paused">Wstrzymane</SelectItem>
              <SelectItem value="cancelled">Anulowane</SelectItem>
              <SelectItem value="expired">Wygasłe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              <SelectItem value="monthly">Miesięczne</SelectItem>
              <SelectItem value="quarterly">Kwartalne</SelectItem>
              <SelectItem value="yearly">Roczne</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? "Ukryj" : "Pokaż"} filtry
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Data od</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Data do</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ start: "", end: "" })}
                className="w-full"
              >
                Wyczyść daty
              </Button>
            </div>
          </div>
        )}

        {/* Export and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Znaleziono {filteredSubscriptions.length} subskrypcji
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!filteredSubscriptions.length}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Eksportuj CSV
            </Button>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Odśwież
            </Button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Bulk Operations */}
      {selectedSubscriptions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  Wybrano {selectedSubscriptions.length} subskrypcji
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Akcja zbiorowa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywuj</SelectItem>
                    <SelectItem value="paused">Wstrzymaj</SelectItem>
                    <SelectItem value="cancelled">Anuluj</SelectItem>
                    <SelectItem value="expired">Oznacz jako wygasłe</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Zastosuj do wybranych
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubscriptions([])}
              >
                Anuluj wybór
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                    onChange={selectAllSubscriptions}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Użytkownik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zajęcia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Okres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.includes(subscription.id)}
                      onChange={() => toggleSubscriptionSelection(subscription.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {subscription.users?.email || "Nieznany użytkownik"}
                      </div>
                      <div className="text-gray-500">
                        ID: {subscription.user_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {subscription.schedule?.title || subscription.schedule?.activity}
                      </div>
                      <div className="text-gray-500">
                        {subscription.schedule?.day} {subscription.schedule?.start}-{subscription.schedule?.end}
                      </div>
                      <div className="text-gray-400">
                        {subscription.schedule?.trainers?.name} • {subscription.schedule?.places?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(subscription.subscription_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Od: {formatDate(subscription.start_date)}</div>
                      <div>Do: {formatDate(subscription.end_date)}</div>
                      {subscription.auto_renew && (
                        <Badge variant="outline" className="mt-1">Auto-odnawianie</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(subscription.price, subscription.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(subscription)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      {subscription.status === "active" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(subscription.id, "paused")}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {subscription.status === "paused" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(subscription.id, "active")}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(subscription.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Brak subskrypcji</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== "all" || filterType !== "all" 
                ? "Spróbuj zmienić filtry lub wyszukiwanie."
                : "Nie znaleziono żadnych subskrypcji w systemie."}
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Edytuj Subskrypcję</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={form.status || ""} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywna</SelectItem>
                    <SelectItem value="paused">Wstrzymana</SelectItem>
                    <SelectItem value="cancelled">Anulowana</SelectItem>
                    <SelectItem value="expired">Wygasła</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auto_renew">Auto-odnawianie</Label>
                <Select 
                  value={form.auto_renew?.toString() || "false"} 
                  onValueChange={(value) => handleSelectChange("auto_renew", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Tak</SelectItem>
                    <SelectItem value="false">Nie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Cena</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currency">Waluta</Label>
                <Select 
                  value={form.currency || "PLN"} 
                  onValueChange={(value) => handleSelectChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLN">PLN</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
                placeholder="Dodatkowe informacje..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Anuluj
              </Button>
              <Button type="submit">
                Zapisz zmiany
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
