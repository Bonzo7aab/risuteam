import { Skeleton } from "@/components/ui/skeleton";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Map from "@/components/google-map";

const Page = async () => {
  const supabase = await createClient();

  let { data: places, error } = await supabase.from("places").select("*");
  if (error) console.error("error", error);
  if (!places) places = [];

  return (
    <div className="flex justify-center w-full h-screen gap-8">
      <Skeleton className="h-[500px] w-[500px] rounded-xl" />
      {/* <Map places={places} /> */}

      <div className="z-10 flex flex-col gap-4 p-12 mt-8 -ml-32 bg-gray-800 rounded-xl h-fit">
        <h1>Gdzie jesteśmy</h1>
        {places ? (
          places.map((place) => (
            <div key={place} className="">
              <h1 className="font-bold leading-8">{place.title}</h1>
              <div className="">{place.address}</div>
              <Button>
                <a href={place.link} className="flex gap-2">
                  <MapPinned size={20} />
                  <span>Link do mapy</span>
                </a>
              </Button>
            </div>
          ))
        ) : (
          <Skeleton className="h-[500px] w-[500px] rounded-xl" />
        )}
      </div>
    </div>
  );
};

export default Page;
