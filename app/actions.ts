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
  if (user && user.app_metadata?.role === "admin") {
    return redirect("/admin");
  }

  return encodedRedirect("error", "/sign-in", "You are not an admin user.");
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