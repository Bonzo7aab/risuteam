import { ImageFile } from "@/components/ui/image-upload";
import { ReactNode } from "react";

interface TrainerOption {
    id: number;
    name: string;
}
  
interface PlaceOption {
    id: number;
    name: string;
}
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
interface ContactFormType {
    firstname: string;
    lastname: string;
    email: string;
    phone_number?: string;
    message: string;
}

interface ScheduleType {
    id: number;
    activity: string;
    trainer_id: number | null;
    day: string;
    place_id: number | null;
    free_slots?: boolean;
    title?: string;
    start?: string;
    end?: string;
  }

export type CampType = "polkolonie" | "letnie" | "zimowe" | "nocowanka";
export type TabType = CampType | "all";

interface CampPayment {
  installment: number;
  amount: number;
  due: string;
}

interface Camp {
  date_from: string;
  date_to: string;
  description: string;
  id: number;
  images: ImageFile[] | string[];
  included: string[];
  not_included: string[];
  payments?: any[];
  place_id: number | null;
  price: number;
  program: string[];
  title: string;
  type: string;
  // trainers is now an array of linked trainer objects
  trainers: TrainerOption[];
  // Add the embedded camp_trainers structure as fetched
  camp_trainers: { trainer: TrainerOption }[] | null; // Adjust type based on actual fetch result
}

interface ActivityType {
  id: number;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}

interface FaqType {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

interface GalleryImageType {
  id: number;
  image_url: string;
  alt: string;
  order_number: number;
  created_at: string;
}

interface Hotel {
	id: number
	title: string
	subtitle: string
	description: string
	image_src: string
	image_alt: string
	amenities: HotelAmenity[]
}

type AmenityType = 
	| 'rooms'
	| 'bathroom'
	| 'tv'
	| 'wifi'
	| 'coffee'
	| 'restaurant'
	| 'mountain'
	| 'parking'
	| 'winter'
	| 'summer'

interface HotelAmenity {
  hotel_id: number;
  type: AmenityType
  text: string
}

interface CampImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface CampLocation {
  name: string;
  description: string;
  address: string;
}

interface CampIncluded {
  title: string;
  items: string[];
}

interface CampContent {
  title: string;
  date_from: string;
  date_to: string;
  description: string;
  images: CampImage[];
  price: number;
  program: string[];
  location: CampLocation;
  included: CampIncluded;
  payments: CampPayment[];
  paymentInfo: string;
}

interface CampTab {
  type: TabType;
  label: string;
  icon: ReactNode;
  content: CampContent;
}

export type { PlaceType, TrainerType, ContactFormType, ScheduleType, Camp, TrainerOption, PlaceOption, ActivityType, FaqType, GalleryImageType, CampTab, CampPayment, CampLocation, CampIncluded, CampContent, HotelAmenity, AmenityType, CampImage, Hotel };