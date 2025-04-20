interface PlaceType {
    id: number
    created_at: number;
    name: string;
    address: string;
    map_link: string;
    position: {
        lat: number;
        lng: number
    }
}[]

interface TrainerType {
    id: number
    created_at: number;
    name: string;
    description: string;
    image_url: string;
    join_date: string;
    activity: string;
}[]

interface ScheduleType {
    id: number;
    created_at: number;
    day: string;
    time_start: string;
    time_end: string;
    activity: string;
    trainer: string;
    place: string;
}

interface ContactFormType {
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    message: string;
}

export type { PlaceType, TrainerType, ScheduleType, ContactFormType };