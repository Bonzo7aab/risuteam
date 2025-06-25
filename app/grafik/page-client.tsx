"use client";

import React, { useEffect, useState } from "react";

import { fetchPlaces } from "@/app/actions";
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
import { POLISH_DAY_ORDER } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";

import { PlaceOption, ScheduleType, TrainerOption } from "../types/types";

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
}: {
  filters: any;
  onFilterOptions: (opts: {
    days: string[];
    activities: string[];
    instructors: string[];
    places: string[];
  }) => void;
}) => {
  const [schedule, setSchedule] = useState<ScheduleType[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [places, setPlaces] = useState<PlaceOption[]>([]);
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
          .select("id, name");
        if (trainersError) {
          console.error("Trainers fetch error:", trainersError);
          throw trainersError;
        }
        setTrainers((trainersData || []) as TrainerOption[]);
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

  // Map trainer/place IDs to names
  const scheduleWithNames = schedule.map((row) => ({
    ...row,
    trainer:
      trainers.find((t) => t.id === row.trainer_id)?.name ||
      String(row.trainer_id) ||
      "",
    place:
      places.find((p) => p.id === row.place_id)?.name ||
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
                      className={`flex flex-col gap-2 py-4 pl-4 border-x-2 border-risu-400 hover:bg-muted ${index % 2 === 1 ? "bg-risu-300/10" : ""}`}
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
                        <span className="border-risu-400 border-l-2 px-4 py-2">
                          Wolne miejsca: {activity.free_slots ? "Tak" : "Nie"}
                        </span>
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

const ScheduleClient = () => {
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
      <Schedule filters={filters} onFilterOptions={setFilterOptions} />
    </>
  );
};

export default ScheduleClient;
