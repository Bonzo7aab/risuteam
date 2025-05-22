import Image from "next/image";
import { Skeleton } from "@/components/skeleton";
import { createClient } from "@/utils/supabase/server";
import { TrainerType } from "@/app/types/types";

const Trainers = async () => {
  const supabase = await createClient();
  const { data: trainers, error } = await supabase.from("trainers").select("*");

  return (
    <div className="flex flex-col mx-auto max-w-4xl px-2 py-8 md:px-0 mb-16">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Nasi trenerzy</h1>
      </div>
      <div className="flex w-full flex-col md:flex-row gap-8">
        {trainers ? (
          trainers.map((trainer: TrainerType) => (
            <div key={trainer.id}>
              <div className="relative">
                <Image
                  src={trainer.image_url}
                  alt={trainer.name}
                  className="object-cover rounded-lg aspect-square"
                  width={500}
                  height={500}
                />
                <div className="absolute right-0 p-4 mt-4 text-2xl font-semibold text-white bg-black bottom-4 border-y-2 border-l-2 border-risu-400">
                  {trainer.name}
                </div>
              </div>
              <div className="border-x-2 border-risu-400 px-4">
                <p className="mt-4 text-muted-foreground">{trainer.activity}</p>
                <p className="mt-3">{trainer.description}</p>
              </div>
            </div>
          ))
        ) : (
          <Skeleton className="h-[500px] w-[500px] rounded-xl" />
        )}
      </div>
    </div>
  );
};

export default Trainers;
