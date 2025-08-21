"use server";

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils';

import { AmenityType, Hotel } from "@/app/types/types";
import { ActivityType, Camp, FaqType, GalleryImageType, PlaceType, TrainerType, TestimonialType } from './types/types';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Fetch the user to check the role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Check if user is admin
    if (user.app_metadata?.role === "admin") {
      return redirect("/admin");
    } else {
      // Regular user - redirect to dashboard
      return redirect("/dashboard");
    }
  }

  return encodedRedirect("error", "/sign-in", "Authentication failed.");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/admin/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/admin/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/admin/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/admin/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/admin/reset-password", "Password updated");
};

// Places
export async function fetchPlaces(): Promise<{
  data: PlaceType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as PlaceType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// TRAINERS CRUD
export async function fetchTrainers(): Promise<{
  data: TrainerType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .order("id");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as TrainerType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function updateTrainer(id: number, data: Partial<TrainerType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("trainers")
      .update(data)
      .eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function createTrainer(data: Partial<TrainerType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("trainers").insert([{ ...data }]);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteTrainer(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("trainers").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// SCHEDULE CRUD
export async function fetchSchedule() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .order("day")
      .order("start");
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function insertSchedule(row: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("schedule").insert([{ ...row }]);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateSchedule(id: number, row: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("schedule").update(row).eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteSchedule(id: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("schedule").delete().eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// CAMPS CRUD
export async function fetchCamps(): Promise<Camp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camps")
    .select(
      `
          *,
    camp_trainers (
      trainer:trainers ( id, name )
    )`
    )
    .order("date_from");

  if (error) {
    console.error("Error fetching camps:", error.message);
    return []; // Return empty array on error
  } else {
    // The fetched data structure includes the embedded trainer
    const transformedData: Camp[] = data.map((camp: any) => ({
      ...camp,
      // Flatten the nested trainer structure from camp_trainers for the CampRow trainers property
      trainers: camp.camp_trainers?.map((ct: any) => ct.trainer).filter(Boolean) || [],
      // Keep the original embedded structure for internal use if needed, or adjust CampRow type
      camp_trainers: camp.camp_trainers // Keep the embedded structure as fetched
    }));
    return transformedData || [];
  }
}

export async function insertCamp(row: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("camps").insert([{ ...row }]).select("id").single();
    if (error) return { error: error.message, data: null };
    return { error: null, data };
  } catch (err) {
    return { error: (err as Error).message, data: null };
  }
}

export async function updateCamp(id: number, row: any) {
  console.log("updateCamp", id, row);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("camps").update(row).eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteCamp(id: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("camps").delete().eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// CAMP_TRAINERS CRUD
export async function deleteCampTrainers(campId: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("camp_trainers").delete().eq("camp_id", campId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function insertCampTrainers(trainers: { camp_id: number; trainer_id: number }[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("camp_trainers").insert(trainers);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// ACTIVITIES CRUD
export async function fetchActivities(): Promise<{
  data: ActivityType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("id");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as ActivityType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function createActivity(data: Partial<ActivityType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("activities").insert([{ ...data }]);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateActivity(id: number, data: Partial<ActivityType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("activities")
      .update(data)
      .eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteActivity(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// FAQ CRUD
export async function fetchFaq(): Promise<{
  data: FaqType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .order("id");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as FaqType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function createFaq(data: Partial<FaqType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("faq").insert([{ ...data }]);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateFaq(id: number, data: Partial<FaqType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("faq")
      .update(data)
      .eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteFaq(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("faq").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// GALLERY CRUD
export async function fetchGalleryImages(): Promise<{
  data: GalleryImageType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("order_number");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as GalleryImageType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function createGalleryImage(data: Partial<GalleryImageType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("gallery").insert([{ ...data }]);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateGalleryImage(id: number, data: Partial<GalleryImageType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("gallery")
      .update(data)
      .eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteGalleryImage(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

//HOTELS CRUD

export async function fetchHotelsWithAmenities(): Promise<{ data: Hotel[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: hotelsData, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: true });
    if (hotelsError) return { data: [], error: hotelsError.message };
    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from('hotel_amenities')
      .select('*');
    if (amenitiesError) return { data: [], error: amenitiesError.message };
    const hotelsWithAmenities = (hotelsData || []).map((hotel) => ({
      ...hotel,
      amenities: (amenitiesData || [])
        .filter((a) => a.hotel_id === hotel.id)
        .map((a) => ({ type: a.type as AmenityType, text: a.text })),
    }));
    return { data: hotelsWithAmenities, error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function createHotelWithAmenities(form: Partial<Hotel>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('hotels')
      .insert({
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        image_src: form.image_src,
        image_alt: form.image_alt,
      })
      .select('id');
    if (error) return { error: error.message };
    const hotelId = data?.[0]?.id;
    if (hotelId && form.amenities && form.amenities.length > 0) {
      const toInsert = form.amenities.map((a) => ({
        hotel_id: hotelId,
        type: a.type,
        text: a.text,
      }));
      const { error: amenityError } = await supabase.from('hotel_amenities').insert(toInsert);
      if (amenityError) return { error: amenityError.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateHotelWithAmenities(id: number, form: Partial<Hotel>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('hotels')
      .update({
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        image_src: form.image_src,
        image_alt: form.image_alt,
      })
      .eq('id', id);
    if (error) return { error: error.message };
    // Remove old amenities
    await supabase.from('hotel_amenities').delete().eq('hotel_id', id);
    // Insert new amenities
    if (form.amenities && form.amenities.length > 0) {
      const toInsert = form.amenities.map((a) => ({
        hotel_id: id,
        type: a.type,
        text: a.text,
      }));
      const { error: amenityError } = await supabase.from('hotel_amenities').insert(toInsert);
      if (amenityError) return { error: amenityError.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteHotelWithAmenities(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    await supabase.from('hotel_amenities').delete().eq('hotel_id', id);
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Fetch all images from Supabase storage 'camps' bucket
export async function fetchCampImages() {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("camps").list();
  if (error) return { error: error.message, urls: [] };
  const urls = data
    .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
    .map(
      (file) =>
        supabase.storage.from("camps").getPublicUrl(file.name).data.publicUrl
    );
  return { error: null, urls };
}

// Upload a file to Supabase storage 'camps' bucket and return its public URL
export async function uploadCampImage(file: File) {
  const supabase = await createClient();
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("camps")
    .upload(filePath, file, { upsert: false });
  if (uploadError) {
    return { error: uploadError.message, url: null };
  }
  const { data } = supabase.storage.from("camps").getPublicUrl(filePath);
  return { error: null, url: data.publicUrl };
}

// TESTIMONIALS CRUD
export async function fetchTestimonials(): Promise<{
  data: TestimonialType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("id");
    if (error) {
      return { data: null, error: error.message };
    }
    // Backward compatibility: if location_id is null, try to match location_name to places
    return { data: data as TestimonialType[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function createTestimonial(data: Partial<TestimonialType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    // If location_id is set, fetch place name for location_name
    let location_name = data.location_name;
    if (data.location_id) {
      const { data: places } = await supabase.from("places").select("name, address").eq("id", data.location_id).single();
      location_name = places?.address || places?.name || "";
    }
    const { error } = await supabase.from("testimonials").insert([{ ...data, location_name }]);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateTestimonial(id: number, data: Partial<TestimonialType>): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    // If location_id is set, fetch place name for location_name
    let location_name = data.location_name;
    if (data.location_id) {
      const { data: places } = await supabase.from("places").select("name, address").eq("id", data.location_id).single();
      location_name = places?.address || places?.name || "";
    }
    const { error } = await supabase
      .from("testimonials")
      .update({ ...data, location_name })
      .eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteTestimonial(id: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// CLASS REGISTRATION CRUD
export async function registerForClass(userId: string, scheduleId: number, notes?: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Check if class is available
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedule")
      .select("current_registrations, max_capacity, is_active")
      .eq("id", scheduleId)
      .single();

    if (scheduleError) {
      return { error: "Nie można znaleźć zajęć." };
    }

    if (!schedule.is_active) {
      return { error: "Te zajęcia nie są już dostępne." };
    }

    if ((schedule.current_registrations || 0) >= (schedule.max_capacity || 20)) {
      return { error: "Brak wolnych miejsc na te zajęcia." };
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from("class_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("schedule_id", scheduleId)
      .eq("status", "confirmed")
      .single();

    if (existingRegistration) {
      return { error: "Jesteś już zapisany na te zajęcia." };
    }

    // Create registration
    const { error: registrationError } = await supabase
      .from("class_registrations")
      .insert({
        user_id: userId,
        schedule_id: scheduleId,
        status: "confirmed",
        notes: notes?.trim() || null,
      });

    if (registrationError) {
      return { error: registrationError.message };
    }

    // Update class registration count
    const { error: updateError } = await supabase
      .from("schedule")
      .update({ 
        current_registrations: (schedule.current_registrations || 0) + 1 
      })
      .eq("id", scheduleId);

    if (updateError) {
      console.error("Error updating class count:", updateError);
      // Don't return error as registration was successful
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function cancelRegistration(registrationId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from("class_registrations")
      .select("schedule_id, status")
      .eq("id", registrationId)
      .single();

    if (regError) {
      return { error: "Nie można znaleźć zapisu." };
    }

    if (registration.status !== "confirmed") {
      return { error: "Ten zapis nie może być anulowany." };
    }

    // Cancel registration
    const { error: cancelError } = await supabase
      .from("class_registrations")
      .update({ status: "cancelled" })
      .eq("id", registrationId);

    if (cancelError) {
      return { error: cancelError.message };
    }

    // Update class registration count
    const { error: updateError } = await supabase
      .from("schedule")
      .update({ 
        current_registrations: supabase.rpc('decrement', { 
          table_name: 'schedule', 
          column_name: 'current_registrations', 
          row_id: registration.schedule_id 
        })
      })
      .eq("id", registration.schedule_id);

    if (updateError) {
      console.error("Error updating schedule count:", updateError);
      // Don't return error as cancellation was successful
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getUserRegistrations(userId: string): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Check if table exists first
    const { data: tableCheck } = await supabase
      .from("class_registrations")
      .select("id")
      .limit(1);
    
    const { data, error } = await supabase
      .from("class_registrations")
      .select(`
        *,
        schedule!schedule_id(
          *,
          trainers!trainer_id(id, name),
          places!place_id(id, name)
        )
      `)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array instead of error
      if (error.message.includes("class_registrations") || error.code === "42P01") {
        return { data: [], error: null };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    // Handle table not found gracefully
    if ((err as Error).message.includes("class_registrations")) {
      return { data: [], error: null };
    }
    return { data: null, error: (err as Error).message };
  }
}

export async function getAvailableClasses(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schedule")
      .select(`
        *,
        trainers!trainer_id(id, name),
        places!place_id(id, name)
      `)
      .eq("is_active", true)
      .order("day")
      .order("start");

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function checkClassAvailability(scheduleId: number): Promise<{
  available: boolean;
  currentCount: number;
  maxCapacity: number;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schedule")
      .select("current_registrations, max_capacity, is_active")
      .eq("id", scheduleId)
      .single();

    if (error) {
      return { available: false, currentCount: 0, maxCapacity: 0, error: error.message };
    }

    const available = data.is_active && (data.current_registrations || 0) < (data.max_capacity || 20);
    
    return {
      available,
      currentCount: data.current_registrations || 0,
      maxCapacity: data.max_capacity || 20,
      error: null
    };
  } catch (err) {
    return { available: false, currentCount: 0, maxCapacity: 0, error: (err as Error).message };
  }
}

// SUBSCRIPTION MANAGEMENT
export async function createClassSubscription(
  userId: string, 
  scheduleId: number, 
  subscriptionType: "monthly" | "quarterly" | "yearly",
  autoRenew: boolean = false,
  notes?: string
): Promise<{ error: string | null; subscriptionId?: number }> {
  try {
    const supabase = await createClient();
    
    // Check if class is available
    const availability = await checkClassAvailability(scheduleId);
    if (availability.error) {
      return { error: availability.error };
    }

    if (!availability.available) {
      return { error: "Brak wolnych miejsc na te zajęcia." };
    }

    // Check if user already has an active subscription plan
    const { data: existingSubscription } = await supabase
      .from("class_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      return { error: "Masz już aktywny plan subskrypcji. Możesz uczęszczać na dowolne dostępne zajęcia w ramach swojego limitu." };
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    switch (subscriptionType) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    endDate.setDate(endDate.getDate() - 1); // End on the day before

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("class_subscriptions")
      .insert({
        user_id: userId,
        schedule_id: scheduleId,
        subscription_type: subscriptionType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        auto_renew: autoRenew,
        status: 'active',
        currency: 'PLN',
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (subscriptionError) {
      return { error: subscriptionError.message };
    }

    // Generate subscription sessions
    await supabase.rpc('generate_subscription_sessions', {
      p_subscription_id: subscription.id,
      p_schedule_id: scheduleId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0]
    });

    return { error: null, subscriptionId: subscription.id };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getUserSubscriptions(userId: string): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_subscriptions")
      .select(`
        *,
        schedule!schedule_id(
          *,
          trainers!trainer_id(id, name),
          places!place_id(id, name)
        )
      `)
      .eq("user_id", userId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function pauseSubscription(subscriptionId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("class_subscriptions")
      .update({ status: "paused" })
      .eq("id", subscriptionId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function resumeSubscription(subscriptionId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("class_subscriptions")
      .update({ status: "active" })
      .eq("id", subscriptionId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function cancelSubscription(subscriptionId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("class_subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscriptionId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// ADMIN SUBSCRIPTION MANAGEMENT
export async function fetchAllSubscriptions(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // First fetch subscriptions with schedule data
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("class_subscriptions")
      .select(`
        *,
        schedule!schedule_id(
          *,
          trainers!trainer_id(id, name),
          places!place_id(id, name)
        )
      `)
      .order("created_at", { ascending: false });

    if (subscriptionsError) {
      return { data: null, error: subscriptionsError.message };
    }

    if (!subscriptions) {
      return { data: [], error: null };
    }

    // Fetch user data separately for each subscription
    const subscriptionsWithUsers = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            subscription.user_id
          );
          
          if (userError || !userData.user) {
            return {
              ...subscription,
              users: {
                id: subscription.user_id,
                email: 'Unknown',
                user_metadata: null
              }
            };
          }

          return {
            ...subscription,
            users: {
              id: userData.user.id,
              email: userData.user.email || 'No email',
              user_metadata: userData.user.user_metadata
            }
          };
        } catch (err) {
          return {
            ...subscription,
            users: {
              id: subscription.user_id,
              email: 'Error fetching user',
              user_metadata: null
            }
          };
        }
      })
    );

    return { data: subscriptionsWithUsers, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function updateSubscription(
  subscriptionId: number, 
  data: Partial<{
    status: "active" | "paused" | "cancelled" | "expired";
    auto_renew: boolean;
    notes: string;
    price: number;
    currency: string;
  }>
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("class_subscriptions")
      .update(data)
      .eq("id", subscriptionId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteSubscription(subscriptionId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // First delete related subscription sessions
    const { error: sessionsError } = await supabase
      .from("subscription_sessions")
      .delete()
      .eq("subscription_id", subscriptionId);

    if (sessionsError) {
      return { error: `Failed to delete sessions: ${sessionsError.message}` };
    }

    // Then delete the subscription
    const { error } = await supabase
      .from("class_subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getSubscriptionStats(): Promise<{
  data: {
    total: number;
    active: number;
    paused: number;
    cancelled: number;
    expired: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("class_subscriptions")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      return { data: null, error: totalError.message };
    }

    // Get status counts
    const { data: statusData, error: statusError } = await supabase
      .from("class_subscriptions")
      .select("status, subscription_type");

    if (statusError) {
      return { data: null, error: statusError.message };
    }

    const stats = {
      total: total || 0,
      active: statusData?.filter(s => s.status === "active").length || 0,
      paused: statusData?.filter(s => s.status === "paused").length || 0,
      cancelled: statusData?.filter(s => s.status === "cancelled").length || 0,
      expired: statusData?.filter(s => s.status === "expired").length || 0,
      monthly: statusData?.filter(s => s.subscription_type === "monthly").length || 0,
      quarterly: statusData?.filter(s => s.subscription_type === "quarterly").length || 0,
      yearly: statusData?.filter(s => s.subscription_type === "yearly").length || 0,
    };

    return { data: stats, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// USER DASHBOARD STATISTICS
export async function getUserDashboardStats(userId: string): Promise<{
  data: {
    subscriptions: {
      total: number;
      active: number;
      paused: number;
      expired: number;
      nextRenewal?: string;
    };
    registrations: {
      total: number;
      upcoming: number;
      completed: number;
      recent: any[];
    };
    activity: {
      lastLogin: string | null;
      lastRegistration: string | null;
      lastClass: string | null;
    };
  } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Get subscription stats
    let subscriptions = null;
    try {
      const { data, error: subError } = await supabase
        .from("class_subscriptions")
        .select("status, end_date, auto_renew")
        .eq("user_id", userId);

      if (subError) {
        console.error("Error fetching subscriptions:", subError);
      } else {
        subscriptions = data;
      }
    } catch (err) {
      console.error("Error accessing subscriptions table:", err);
      subscriptions = [];
    }

    // Get registration stats
    let registrations = null;
    try {
      const { data, error: regError } = await supabase
        .from("class_registrations")
        .select(`
          *,
          schedule!schedule_id(
            *,
            trainers!trainer_id(id, name),
            places!place_id(id, name)
          )
        `)
        .eq("user_id", userId)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (regError) {
        console.error("Error fetching registrations:", regError);
      } else {
        registrations = data;
      }
    } catch (err) {
      console.error("Error accessing registrations table:", err);
      registrations = [];
    }

    // Get user activity info - use regular auth for current user
    let userData = null;
    try {
      // For current user, we can get this from the session
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        userData = { user };
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }

    // Calculate subscription stats
    const subStats = {
      total: subscriptions?.length || 0,
      active: subscriptions?.filter((s: any) => s.status === "active").length || 0,
      paused: subscriptions?.filter((s: any) => s.status === "paused").length || 0,
      expired: subscriptions?.filter((s: any) => s.status === "expired").length || 0,
      nextRenewal: subscriptions
        ?.filter((s: any) => s.status === "active" && s.auto_renew)
        .sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())[0]?.end_date
    };

    // Calculate registration stats
    const now = new Date();
    const upcomingRegistrations = registrations?.filter(reg => {
      const classDate = new Date(reg.schedule?.day || '');
      return classDate > now;
    }) || [];

    const regStats = {
      total: registrations?.length || 0,
      upcoming: upcomingRegistrations.length,
      completed: (registrations?.length || 0) - upcomingRegistrations.length,
      recent: registrations?.slice(0, 5) || [] // Last 5 registrations
    };

    // Calculate activity stats
    const activityStats = {
      lastLogin: userData?.user?.last_sign_in_at || null,
      lastRegistration: registrations?.[0]?.created_at || null,
      lastClass: upcomingRegistrations?.[0]?.schedule?.day || null
    };

    return {
      data: {
        subscriptions: subStats,
        registrations: regStats,
        activity: activityStats
      },
      error: null
    };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}