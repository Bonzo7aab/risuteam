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
import { mockSchedule, ScheduleType } from "../../lib/schedule";

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
    useState<ScheduleType>(mockSchedule);

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
      <div className="gap-4 flex flex-col">
        {Object.entries(filteredSchedule).map(([day, activities]) => (
          <Accordion type="single" collapsible className="w-full" key={day}>
            <AccordionItem value="item-1">
              <AccordionTrigger>{day}</AccordionTrigger>
              {activities.map((activity, index) => (
                <AccordionContent key={index}>
                  <div
                    className={`flex flex-col gap-2 py-4 pl-4 border-x-2 border-risu-400 hover:bg-muted ${index % 2 === 1 ? "bg-risu-300/10" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold">
                        {activity.start} - {activity.end}
                      </span>
                      <h2 className="font-semibold bg-risu-400 px-4 py-2">
                        {activity.type}
                      </h2>
                    </div>
                    <span className="text-gray-500 text-md">
                      Trener: {activity.instructor}
                    </span>
                    <span className="text-sm flex justify-between items-center">
                      <span>Lokalizacja: {activity.place}</span>
                      <span className="border-risu-400 border-l-2 px-4 py-2">
                        Wolne miejsca: {activity.free_slots}
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

const Page = () => {
  const [filters, setFilters] = useState({
    selectedDay: null,
    selectedActivity: null,
    selectedInstructor: null,
    selectedPlace: null,
  });

  return (
    <div className="flex flex-col justify-center w-full my-16">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Grafik zajęć</h1>
      </div>
      <Filters onFilterChange={setFilters} filters={filters} />
      <Schedule filters={filters} />
    </div>
  );
};

export default Page;
