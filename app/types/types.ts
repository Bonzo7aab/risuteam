import { ImageFile } from "@/components/ui/image-upload";
import { ReactNode } from "react";

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
    title?: string;
    start?: string;
    end?: string;
    max_capacity?: number;
    current_registrations?: number;
    is_active?: boolean;
    registration_deadline?: string;
}

export type CampType = "polkolonie" | "letnie" | "zimowe" | "nocowanka";
export type TabType = CampType | "all";

interface CampPayment {
  installment: number;
  amount: number;
  due: string;
}

// Unified TrainerOption for both backend and form
export interface TrainerOption {
  id: string; // always string for consistency in form and backend
  name?: string; // for backend
  label?: string; // for form
}

// Unified Camp interface for both backend and form
export interface Camp {
  id?: number;
  date_from?: string;
  date_to?: string;
  description?: string;
  images?: ImageFile[] | string[];
  included?: string[];
  not_included?: string[];
  payments?: CampPayment[];
  place_id?: number | null;
  price?: number;
  program?: string[];
  title?: string;
  type?: CampType;
  camp_trainers?: TrainerOption[]; // always array of TrainerOption for form and backend
  hotel_id?: number | null;
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

interface TestimonialType {
  id: number;
  name: string;
  date: string;
  location_id: number | null;
  location_name: string;
  src: string;
  tab?: "polkolonie" | "letnie" | "zimowe" | "nocowanka";
  created_at: string;
}

interface ClassRegistrationType {
  id: number;
  user_id: string;
  schedule_id: number;
  registration_date: string;
  status: "confirmed" | "cancelled" | "waitlist";
  subscription_type: "single" | "monthly" | "quarterly" | "yearly";
  subscription_start_date?: string;
  subscription_end_date?: string;
  auto_renew?: boolean;
  is_active?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ClassSubscriptionType {
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
}

interface SubscriptionSessionType {
  id: number;
  subscription_id: number;
  class_registration_id?: number;
  session_date: string;
  attendance_status: "scheduled" | "attended" | "missed" | "cancelled";
  created_at: string;
}

export type { ActivityType, AmenityType, CampContent, CampImage, CampIncluded, CampLocation, CampPayment, CampTab, ClassRegistrationType, ClassSubscriptionType, ContactFormType, FaqType, GalleryImageType, Hotel, HotelAmenity, PlaceType, ScheduleType, SubscriptionSessionType, TrainerType, TestimonialType };
