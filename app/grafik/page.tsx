"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

interface Schedule {
  [day: string]: {
    id: number;
    start: string;
    end: string;
    type: string;
    instructor: string;
    free_slots: number;
    title: string;
    place: string;
  }[];
}

const mockSchedule: Schedule = {
  Poniedziałek: [
    {
      id: 1,
      start: "9:00 AM",
      end: "10:00 AM",
      type: "Judo",
      instructor: "John Doe",
      free_slots: 5,
      title: "Team Meeting",
      place: "Conference Room A",
    },
    {
      id: 2,
      start: "11:00 AM",
      end: "12:00 PM",
      type: "Judo",
      instructor: "Jane Smith",
      free_slots: 3,
      title: "Code Review Session",
      place: "Conference Room B",
    },
    {
      id: 3,
      start: "2:00 PM",
      end: "4:00 PM",
      type: "Karate",
      instructor: "Alice Johnson",
      free_slots: 2,
      title: "Development Time",
      place: "Office",
    },
  ],
  Wtorek: [
    {
      id: 4,
      start: "10:00 AM",
      end: "11:00 AM",
      type: "Karate",
      instructor: "John Doe",
      free_slots: 5,
      title: "Daily Standup",
      place: "Conference Room A",
    },
    {
      id: 5,
      start: "1:00 PM",
      end: "2:00 PM",
      type: "Judo",
      instructor: "N/A",
      free_slots: 0,
      title: "Lunch Break",
      place: "Cafeteria",
    },
    {
      id: 6,
      start: "3:00 PM",
      end: "5:00 PM",
      type: "Kickboxing",
      instructor: "Alice Johnson",
      free_slots: 2,
      title: "Development Time",
      place: "Office",
    },
  ],
  Środa: [
    {
      id: 7,
      start: "10:00 AM",
      end: "11:00 AM",
      type: "Kickboxing",
      instructor: "John Doe",
      free_slots: 5,
      title: "Daily Standup",
      place: "Conference Room A",
    },
    {
      id: 8,
      start: "1:00 PM",
      end: "2:00 PM",
      type: "Judo",
      instructor: "N/A",
      free_slots: 0,
      title: "Lunch Break",
      place: "Cafeteria",
    },
    {
      id: 9,
      start: "3:00 PM",
      end: "5:00 PM",
      type: "Gimnastyka",
      instructor: "Alice Johnson",
      free_slots: 2,
      title: "Development Time",
      place: "Office",
    },
  ],
  Czwartek: [
    {
      id: 10,
      start: "10:00 AM",
      end: "11:00 AM",
      type: "Team Standup",
      instructor: "John Doe",
      free_slots: 5,
      title: "Daily Standup",
      place: "Conference Room A",
    },
    {
      id: 11,
      start: "1:00 PM",
      end: "2:00 PM",
      type: "Gimnastyka",
      instructor: "N/A",
      free_slots: 0,
      title: "Lunch Break",
      place: "Cafeteria",
    },
    {
      id: 12,
      start: "3:00 PM",
      end: "5:00 PM",
      type: "Rozciąganie",
      instructor: "Alice Johnson",
      free_slots: 2,
      title: "Development Time",
      place: "Office",
    },
  ],
  Piątek: [
    {
      id: 13,
      start: "10:00 AM",
      end: "11:00 AM",
      type: "Rozciąganie",
      instructor: "John Doe",
      free_slots: 5,
      title: "Daily Standup",
      place: "Conference Room A",
    },
    {
      id: 14,
      start: "1:00 PM",
      end: "2:00 PM",
      type: "Judo",
      instructor: "N/A",
      free_slots: 0,
      title: "Lunch Break",
      place: "Cafeteria",
    },
    {
      id: 15,
      start: "3:00 PM",
      end: "5:00 PM",
      type: "Rozciąganie",
      instructor: "Alice Johnson",
      free_slots: 2,
      title: "Development Time",
      place: "Office",
    },
  ],
};

const mockSchedule_flat = Object.values(mockSchedule).flat();

const Filters = ({
  filters,
  onFilterChange,
}: {
  filters: any;
  onFilterChange: (filters: any) => void;
}) => {
  const activities = Array.from(
    new Set(mockSchedule_flat.map((activity) => activity.type))
  );
  const instructors = Array.from(
    new Set(mockSchedule_flat.map((activity) => activity.instructor))
  );
  const places = Array.from(
    new Set(mockSchedule_flat.map((activity) => activity.place))
  );
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
          {["Wszystkie", ...Object.keys(mockSchedule)].map((day, index) => (
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

const Schedule = ({ filters }: { filters: any }) => {
  const [filteredSchedule, setFilteredSchedule] =
    useState<Schedule>(mockSchedule);

  useEffect(() => {
    const filterSchedule = () => {
      let filtered = mockSchedule;
      if (filters.selectedDay) {
        filtered = Object.fromEntries(
          Object.entries(filtered).filter(
            ([day]) => day === filters.selectedDay
          )
        );
      }
      if (filters.selectedActivity) {
        filtered = Object.fromEntries(
          Object.entries(filtered).map(([day, activities]) => [
            day,
            activities.filter(
              (activity) => activity.type === filters.selectedActivity
            ),
          ])
        );
      }
      if (filters.selectedInstructor) {
        filtered = Object.fromEntries(
          Object.entries(filtered).map(([day, activities]) => [
            day,
            activities.filter(
              (activity) => activity.instructor === filters.selectedInstructor
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
      return filtered;
    };

    setFilteredSchedule(filterSchedule());
  }, [filters]);

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Grafik zajęć</h1>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(filteredSchedule).map(([day, activities]) => (
          <Accordion type="single" collapsible className="w-full" key={day}>
            <AccordionItem value="item-1">
              <AccordionTrigger>{day}</AccordionTrigger>
              {activities.map((activity, index) => (
                <AccordionContent key={index}>
                  <div className="flex flex-col gap-2 p-4 border rounded-md border-muted hover:bg-muted">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold">
                        {activity.start} - {activity.end}
                      </span>
                      <h2 className="font-semibold">{activity.type}</h2>
                    </div>
                    <p className="text-gray-500 text-md">
                      {activity.instructor}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.place} - Free Slots: {activity.free_slots}
                    </p>
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

const Page = () => {
  const [filters, setFilters] = useState({
    selectedDay: null,
    selectedActivity: null,
    selectedInstructor: null,
    selectedPlace: null,
  });

  return (
    <div className="flex flex-col justify-center w-full">
      <Filters onFilterChange={setFilters} filters={filters} />
      <Schedule filters={filters} />
    </div>
  );
};

export default Page;
