import { createClient } from "@/utils/supabase/server";
import LocationContent from "./location-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risu Team | Lokalizacje",
};

const Page = async () => {
  const supabase = await createClient();

  let { data: places, error } = await supabase.from("places").select("*");
  if (error) console.error("error", error);
  if (!places) places = [];

  return (
    <>
      <div className="text-center text-4xl my-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Gdzie jesteśmy
        </h1>
      </div>
      <LocationContent places={places} />
    </>
  );
};

export default Page;
