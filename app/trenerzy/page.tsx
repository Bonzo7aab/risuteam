import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Trainer } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

const Trainers = async () => {
  const supabase = await createClient();
  const { data: trainers, error } = await supabase.from("trainers").select("*");

  return (
    <div className="flex flex-col justify-center max-w-screen-xl gap-16 px-6 py-8 mx-auto sm:py-12 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Nasi trenerzy
        </h2>
        <p className="mt-6 text-base sm:text-lg">
          Our philosophy is simple — hire a team of diverse, passionate people
          and foster a culture that empowers you to do you best work.
        </p>
      </div>
      <div className="flex w-full gap-8">
        {trainers ? (
          trainers.map((trainer: Trainer) => (
            <div key={trainer.id}>
              <div className="relative">
                <Image
                  src={trainer.image_url}
                  alt={trainer.name}
                  className="object-cover w-full rounded-lg aspect-square bg-secondary"
                  width={600}
                  height={600}
                />
                <div className="absolute right-0 p-4 mt-4 text-2xl font-semibold text-white bg-black bottom-4">
                  {trainer.name}
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{trainer.activity}</p>
              <p className="mt-3">{trainer.description}</p>
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
