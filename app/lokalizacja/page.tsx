import { Skeleton } from "@/components/skeleton";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Map from "@/components/google-map";
import LocationContent from "./location-content";

const Page = async () => {
  const supabase = await createClient();

  let { data: places, error } = await supabase.from("places").select("*");
  if (error) console.error("error", error);
  if (!places) places = [];

  return <LocationContent places={places} />;
};

export default Page;
