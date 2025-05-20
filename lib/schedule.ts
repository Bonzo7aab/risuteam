export interface ScheduleType {
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

export const mockSchedule: ScheduleType = {
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