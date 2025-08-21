"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";

import { fetchPlaces } from "@/app/actions";
import { getUserSubscriptions, registerForClass, getUserRegistrations, cancelRegistration } from "@/app/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { POLISH_DAY_ORDER } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";

import { PlaceType, ScheduleType, TrainerType } from "../types/types";
import { useRouter } from "next/navigation";
import AuthDialog from "@/components/auth-dialog";

const Filters = ({
  filters,
  onFilterChange,
  days,
  activities,
  instructors,
  places,
}: {
  filters: any;
  onFilterChange: (filters: any) => void;
  days: string[];
  activities: string[];
  instructors: string[];
  places: string[];
}) => {
  const handleFilterChange = ({
    selectedDay,
    selectedActivity,
    selectedInstructor,
    selectedPlace,
  }: {
    selectedDay?: string | null;
    selectedActivity?: string | null;
    selectedInstructor?: string | null;
    selectedPlace?: string | null;
  }) => {
    onFilterChange({
      selectedDay: null,
      selectedActivity: null,
      selectedInstructor: null,
      selectedPlace: null,
    });
    onFilterChange({
      selectedDay,
      selectedActivity,
      selectedInstructor,
      selectedPlace,
    });
  };

  return (
    <div className="grid items-center grid-cols-2 gap-4 px-4 mb-4 sm:flex">
      <Select
        defaultValue="Wszystkie"
        value={filters.selectedDay ? filters.selectedDay : "Wszystkie"}
        onValueChange={(value) => {
          handleFilterChange({
            selectedDay: value === "Wszystkie" ? null : value,
          });
        }}
      >
        <Label>Dzień</Label>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["Wszystkie", ...days].map((day, index) => (
            <SelectItem key={index} value={day}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue="Wszystkie"
        value={
          filters.selectedActivity ? filters.selectedActivity : "Wszystkie"
        }
        onValueChange={(value) => {
          handleFilterChange({
            selectedActivity: value === "Wszystkie" ? null : value,
          });
        }}
      >
        <Label>Zajęcia</Label>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["Wszystkie", ...activities].map((activity, index) => (
            <SelectItem key={index} value={activity}>
              {activity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue="Wszystkie"
        value={
          filters.selectedInstructor ? filters.selectedInstructor : "Wszystkie"
        }
        onValueChange={(value) => {
          handleFilterChange({
            selectedInstructor: value === "Wszystkie" ? null : value,
          });
        }}
      >
        <Label>Instruktor</Label>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["Wszystkie", ...instructors].map((instructor, index) => (
            <SelectItem key={index} value={instructor}>
              {instructor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue="Wszystkie"
        value={filters.selectedPlace ? filters.selectedPlace : "Wszystkie"}
        onValueChange={(value) => {
          handleFilterChange({
            selectedPlace: value === "Wszystkie" ? null : value,
          });
        }}
      >
        <Label>Miejsce</Label>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["Wszystkie", ...places].map((place, index) => (
            <SelectItem key={index} value={place}>
              {place}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="col-span-2"
        variant="outline"
        onClick={() => handleFilterChange({})}
      >
        Reset
      </Button>
    </div>
  );
};

const Schedule = ({
  filters,
  onFilterOptions,
  user,
  onEnrollClick,
  isClassFull,
  onAuthRequired,
  shouldShowEnrollmentButton,
  userHasActiveSubscription,
  getEnrollmentButtonConfig,
  isUserRegisteredForClass,
  onRemoveAttendance,
  removingAttendanceId,
  scheduleData,
  refreshScheduleData,
}: {
  filters: any;
  onFilterOptions: (opts: {
    days: string[];
    activities: string[];
    instructors: string[];
    places: string[];
  }) => void;
  user: User | null;
  onEnrollClick: (activity: ScheduleType & { trainer: string; place: string }) => void;
  isClassFull: (activity: ScheduleType & { trainer: string; place: string }) => boolean;
  onAuthRequired: (activity: ScheduleType & { trainer: string; place: string }) => void;
  shouldShowEnrollmentButton: (activity: ScheduleType & { trainer: string; place: string }) => boolean;
  userHasActiveSubscription: boolean;
  getEnrollmentButtonConfig: (activity: ScheduleType & { trainer: string; place: string }) => { text: string; action: string };
  isUserRegisteredForClass: (activity: ScheduleType & { trainer: string; place: string }) => boolean;
  onRemoveAttendance: (activity: ScheduleType & { trainer: string; place: string }) => Promise<void>;
  removingAttendanceId: number | null;
  scheduleData: ScheduleType[];
  refreshScheduleData: () => Promise<void>;
}) => {
  const [schedule, setSchedule] = useState<ScheduleType[]>([]);
  const [trainers, setTrainers] = useState<TrainerType[]>([]);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("schedule")
          .select("*")
          .order("day");
        if (error) {
          console.error("Schedule fetch error:", error);
          throw error;
        }
        setSchedule(data || []);
        const { data: trainersData, error: trainersError } = await supabase
          .from("trainers")
          .select("*");
        if (trainersError) {
          console.error("Trainers fetch error:", trainersError);
          throw trainersError;
        }
        setTrainers(trainersData || []);
        const { data: placesData, error: placesError } = await fetchPlaces();
        if (placesError) {
          console.error("Places fetch error:", placesError);
          throw new Error(placesError);
        }
        setPlaces(placesData || []);
        setError(null);
      } catch (err) {
        console.error("Full error:", err);
        setError(err instanceof Error ? err.message : "Błąd ładowania grafiku");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use scheduleData from parent if available, otherwise use local schedule
  const currentSchedule = scheduleData.length > 0 ? scheduleData : schedule;

  // Map trainer/place IDs to names
  const scheduleWithNames = currentSchedule.map((row) => ({
    ...row,
    trainer:
      trainers.find((t) => t.id === Number(row.trainer_id))?.name ||
      String(row.trainer_id) ||
      "",
    place:
      places.find((p) => p.id === Number(row.place_id))?.name ||
      String(row.place_id) ||
      "",
    start: row.start,
    end: row.end,
  }));

  // Group by day
  const grouped: { [day: string]: any[] } = {};
  for (const row of scheduleWithNames) {
    if (!grouped[row.day]) grouped[row.day] = [];
    grouped[row.day].push(row);
  }

  // Filtering
  let filtered = grouped;
  if (filters.selectedDay) {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([day]) => day === filters.selectedDay)
    );
  }
  if (filters.selectedActivity) {
    filtered = Object.fromEntries(
      Object.entries(filtered).map(([day, activities]) => [
        day,
        activities.filter(
          (activity) => activity.activity === filters.selectedActivity
        ),
      ])
    );
  }
  if (filters.selectedInstructor) {
    filtered = Object.fromEntries(
      Object.entries(filtered).map(([day, activities]) => [
        day,
        activities.filter(
          (activity) => activity.trainer === filters.selectedInstructor
        ),
      ])
    );
  }
  if (filters.selectedPlace) {
    filtered = Object.fromEntries(
      Object.entries(filtered).map(([day, activities]) => [
        day,
        activities.filter(
          (activity) => activity.place === filters.selectedPlace
        ),
      ])
    );
  }

  // For filter dropdowns
  const allActivities = Array.from(
    new Set(scheduleWithNames.map((a) => String(a.activity)))
  );
  const allInstructors = Array.from(
    new Set(scheduleWithNames.map((a) => String(a.trainer)))
  );
  const allPlaces = Array.from(
    new Set(scheduleWithNames.map((a) => String(a.place)))
  );
  let allDays = Array.from(
    new Set(scheduleWithNames.map((a) => String(a.day)))
  );
  allDays = POLISH_DAY_ORDER.filter((d) => allDays.includes(d));
  useEffect(() => {
    onFilterOptions({
      days: allDays,
      activities: allActivities,
      instructors: allInstructors,
      places: allPlaces,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allDays.join(),
    allActivities.length,
    allInstructors.length,
    allPlaces.length,
  ]);

  if (loading) return <div className="p-4">Ładowanie grafiku...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Sort filtered days by POLISH_DAY_ORDER
  const sortedFilteredEntries = POLISH_DAY_ORDER.filter(
    (day) => filtered[day] && filtered[day].length > 0
  ).map((day) => [day, filtered[day]] as [string, any[]]);

  return (
    <div className="w-full p-4">
      {/* Subscription Status Message */}
      {user && userHasActiveSubscription && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Masz aktywny plan subskrypcji</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Możesz uczęszczać na dowolne dostępne zajęcia w ramach swojego limitu. Nie musisz kupować dodatkowych planów.
          </p>
        </div>
      )}
      
      <div className="gap-4 flex flex-col">
        {sortedFilteredEntries.map(([day, activities]) => (
          <Accordion type="single" collapsible className="w-full" key={day}>
            <AccordionItem value="item-1">
              <AccordionTrigger>{day}</AccordionTrigger>
              {activities
                .slice()
                .sort((a, b) => {
                  // Try to parse as time, fallback to string compare
                  if (a.start && b.start) {
                    // Support both HH:MM and HH:MM AM/PM
                    const parse = (s: string) => {
                      // Try 24h
                      const m = s.match(/^(\d{1,2}):(\d{2})/);
                      if (m)
                        return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
                      // Try 12h with AM/PM
                      const d = new Date(`1970-01-01T${s}`);
                      if (!isNaN(d.getTime()))
                        return d.getHours() * 60 + d.getMinutes();
                      return s;
                    };
                    const av = parse(a.start);
                    const bv = parse(b.start);
                    if (typeof av === "number" && typeof bv === "number")
                      return av - bv;
                    return String(a.start).localeCompare(String(b.start));
                  }
                  return 0;
                })
                .map((activity, index) => (
                  <AccordionContent key={index}>
                    <div
                      className={`flex flex-col gap-2 py-4 pl-4 border-x-2 border-risu-400 ${index % 2 === 1 ? "bg-risu-300/10" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">
                          {activity.start.toString().slice(0, 5)} -{" "}
                          {activity.end.toString().slice(0, 5)}
                        </span>
                        <h2 className="font-semibold bg-risu-400 px-4 py-2">
                          {activity.activity}
                        </h2>
                      </div>
                      <span className="text-gray-500 text-md">
                        Trener: {activity.trainer}
                      </span>
                      <span className="text-sm flex justify-between items-center">
                        <span>Lokalizacja: {activity.place}</span>
                        <div className="flex items-center gap-4">
                          {/* Enrollment Button */}
                          <div className="flex justify-start">
                            <TooltipProvider>
                              {user ? (
                                shouldShowEnrollmentButton(activity) ? (
                                  (() => {
                                    const config = getEnrollmentButtonConfig(activity);
                                    if (config.action === "remove") {
                                      const isRemoving = removingAttendanceId === activity.id;
                                      return (
                                        <Button 
                                          onClick={() => onRemoveAttendance(activity)}
                                          variant="ghost"
                                          disabled={isRemoving}
                                          className="text-green-600 hover:text-red-600 hover:bg-transparent p-0 h-auto font-medium group"
                                        >
                                          {isRemoving ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                              <span className="text-red-600">Usuwanie...</span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="group-hover:hidden">{config.text}</span>
                                              <span className="hidden group-hover:inline text-red-600">Usuń udział</span>
                                            </>
                                          )}
                                        </Button>
                                      );
                                    } else if (config.action === "register") {
                                      return (
                                        <Button 
                                          onClick={() => onEnrollClick(activity)}
                                          variant="ghost"
                                          className="text-risu-400 hover:text-risu-700 hover:bg-transparent p-0 h-auto font-medium"
                                        >
                                          {config.text}
                                        </Button>
                                      );
                                    } else {
                                      return (
                                        <Button 
                                          onClick={() => onEnrollClick(activity)}
                                          variant="ghost"
                                          className="text-risu-400 hover:text-risu-700 hover:bg-transparent p-0 h-auto font-medium"
                                        >
                                          {config.text}
                                        </Button>
                                      );
                                    }
                                  })()
                                ) : isClassFull(activity) ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button disabled variant="outline" className="cursor-not-allowed">
                                        Brak miejsc
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Na te zajęcia nie ma już wolnych miejsc</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null
                              ) : (
                                <Button 
                                  onClick={() => onAuthRequired(activity)}
                                  variant="ghost"
                                  className="text-risu-400 hover:text-risu-700 hover:bg-transparent p-0 h-auto font-medium"
                                >
                                  Zapisz się
                                </Button>
                              )}
                            </TooltipProvider>
                          </div>
                          <span className="border-risu-400 border-l-2 px-4 py-2">
                            Miejsca: {activity.current_registrations || 0}/{activity.max_capacity || 20}
                          </span>
                        </div>
                      </span>
                    </div>
                  </AccordionContent>
                ))}
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

interface ScheduleClientProps {
  user: User | null;
}

const ScheduleClient = ({ user }: ScheduleClientProps) => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    selectedDay: null,
    selectedActivity: null,
    selectedInstructor: null,
    selectedPlace: null,
  });
  const [filterOptions, setFilterOptions] = useState<{
    days: string[];
    activities: string[];
    instructors: string[];
    places: string[];
  }>({
    days: [],
    activities: [],
    instructors: [],
    places: [],
  });

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<(ScheduleType & { trainer: string; place: string }) | null>(null);
  const [userHasActiveSubscription, setUserHasActiveSubscription] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<Set<number>>(new Set());
  const [removingAttendanceId, setRemovingAttendanceId] = useState<number | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleType[]>([]);

  // Check if user has active subscription
  const checkUserSubscription = useCallback(async () => {
    if (!user) {
      setUserHasActiveSubscription(false);
      return;
    }

    try {
      const { data, error } = await getUserSubscriptions(user.id);
      if (!error && data && data.length > 0) {
        // Check if any subscription is active
        const hasActive = data.some(sub => sub.status === "active");
        setUserHasActiveSubscription(hasActive);
      } else {
        setUserHasActiveSubscription(false);
      }
    } catch (err) {
      console.error("Error checking user subscription:", err);
      setUserHasActiveSubscription(false);
    }
  }, [user]);

  // Check user's class registrations
  const checkUserRegistrations = useCallback(async () => {
    if (!user) {
      setUserRegistrations(new Set());
      return;
    }

    try {
      const { data, error } = await getUserRegistrations(user.id);
      if (!error && data) {
        // Create a set of schedule IDs where user is registered
        const registrationIds = new Set(
          data
            .filter(reg => reg.status === "confirmed")
            .map(reg => reg.schedule_id)
        );
        setUserRegistrations(registrationIds);
      } else {
        setUserRegistrations(new Set());
      }
    } catch (err) {
      console.error("Error checking user registrations:", err);
      setUserRegistrations(new Set());
    }
  }, [user]);

  useEffect(() => {
    checkUserSubscription();
    checkUserRegistrations();
  }, [checkUserSubscription, checkUserRegistrations]);

  const handleEnrollClick = useCallback((classItem: ScheduleType & { trainer: string; place: string }) => {
    // Ensure user is authenticated before proceeding
    if (!user) {
      console.warn("User not authenticated, cannot enroll");
      return;
    }
    
    // If user has active subscription, show class registration modal
    if (userHasActiveSubscription) {
      // For now, directly register the user without showing modal
      handleClassRegistration(classItem);
      return;
    }
    
    // If user doesn't have subscription, redirect to dashboard subscriptions
    router.push('/dashboard/subscriptions');
  }, [user, userHasActiveSubscription, router]);

  const handleAuthRequired = (activity: ScheduleType & { trainer: string; place: string }) => {
    // If user already has active subscription, don't show auth dialog
    if (userHasActiveSubscription) {
      return;
    }
    
    setPendingEnrollment(activity);
    setShowAuthDialog(true);
  };



  const isClassFull = (classItem: ScheduleType & { trainer: string; place: string }) => {
    const current = classItem.current_registrations || 0;
    const max = classItem.max_capacity || 20;
    return current >= max;
  };

  // Handle removing attendance from a class
  const handleRemoveAttendance = async (classItem: ScheduleType & { trainer: string; place: string }) => {
    if (!user) return;

    try {
      setRemovingAttendanceId(classItem.id);
      
      // Find the registration ID for this class
      const { data, error } = await getUserRegistrations(user.id);
      if (error || !data) {
        throw new Error("Nie można pobrać informacji o zapisach");
      }

      const registration = data.find(reg => 
        reg.schedule_id === classItem.id && reg.status === "confirmed"
      );

      if (!registration) {
        throw new Error("Nie jesteś zapisany na te zajęcia");
      }

      // Cancel the registration
      const cancelResult = await cancelRegistration(registration.id);
      if (cancelResult.error) {
        throw new Error(cancelResult.error);
      }

      // Refresh both user registrations and schedule data
      await Promise.all([
        checkUserRegistrations(),
        refreshScheduleData()
      ]);
      
    } catch (err) {
      console.error("Error removing attendance:", err);
      alert(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania zapisu");
    } finally {
      setRemovingAttendanceId(null);
    }
  };

  // Check if user is registered for a specific class
  const isUserRegisteredForClass = (classItem: ScheduleType & { trainer: string; place: string }) => {
    return userRegistrations.has(classItem.id);
  };

  // Check if user should see enrollment button
  const shouldShowEnrollmentButton = (classItem: ScheduleType & { trainer: string; place: string }) => {
    // If class is full, don't show button
    if (isClassFull(classItem)) {
      return false;
    }
    
    // If user is not logged in, show button (will trigger auth dialog)
    if (!user) {
      return true;
    }
    
    // If user has active subscription, show button for class registration
    if (userHasActiveSubscription) {
      return true;
    }
    
    // Show button for logged in users without subscription
    return true;
  };

  // Get the appropriate button text and action based on user status
  const getEnrollmentButtonConfig = (classItem: ScheduleType & { trainer: string; place: string }) => {
    if (!user) {
      return { text: "Zapisz się", action: "auth" };
    }
    
    if (userHasActiveSubscription) {
      if (isUserRegisteredForClass(classItem)) {
        return { text: "Zapisany ✓", action: "remove" };
      }
      return { text: "Potwierdź udział", action: "register" };
    }
    
    return { text: "Zapisz się", action: "subscribe" };
  };

  const handleClassRegistration = async (classItem: ScheduleType & { trainer: string; place: string }, notes?: string) => {
    try {
      const { error } = await registerForClass(user!.id, classItem.id, notes);
      if (error) {
        throw new Error(error);
      }
      
      // Refresh both user registrations and schedule data
      await Promise.all([
        checkUserRegistrations(),
        refreshScheduleData()
      ]);
      
    } catch (err) {
      console.error("Error registering for class:", err);
      alert(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania");
    }
  };

  // Function to refresh schedule data after registration changes
  const refreshScheduleData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schedule")
        .select("*")
        .order("day");
      
      if (error) {
        console.error("Error refreshing schedule:", error);
        return;
      }
      
      setScheduleData(data || []);
    } catch (err) {
      console.error("Error refreshing schedule data:", err);
    }
  }, []);

  useEffect(() => {
    if (user && pendingEnrollment) {
      handleEnrollClick(pendingEnrollment);
      setPendingEnrollment(null);
    }
  }, [user, pendingEnrollment, handleEnrollClick]);

  return (
    <>
      <Filters
        filters={filters}
        onFilterChange={setFilters}
        days={filterOptions.days}
        activities={filterOptions.activities}
        instructors={filterOptions.instructors}
        places={filterOptions.places}
      />
      <Schedule 
        filters={filters} 
        onFilterOptions={setFilterOptions}
        user={user}
        onEnrollClick={handleEnrollClick}
        isClassFull={isClassFull}
        onAuthRequired={handleAuthRequired}
        shouldShowEnrollmentButton={shouldShowEnrollmentButton}
        userHasActiveSubscription={userHasActiveSubscription}
        getEnrollmentButtonConfig={getEnrollmentButtonConfig}
        isUserRegisteredForClass={isUserRegisteredForClass}
        onRemoveAttendance={handleRemoveAttendance}
        removingAttendanceId={removingAttendanceId}
        scheduleData={scheduleData}
        refreshScheduleData={refreshScheduleData}
      />
      


      {/* Auth Dialog */}
      {showAuthDialog && (
        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            setPendingEnrollment(null); // Clear pending enrollment when dialog closes
          }}
          onSuccess={() => {
            setShowAuthDialog(false);
            // The useEffect will handle enrollment when user state updates
          }}
        />
      )}
    </>
  );
};

export default ScheduleClient;
