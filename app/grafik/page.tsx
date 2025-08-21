import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import ScheduleClient from "./page-client";

export const metadata: Metadata = {
  title: "Risu Team | Grafik",
};

const Schedule = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col justify-center w-full my-16">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Grafik zajęć</h1>
      </div>
      <ScheduleClient user={user} />
    </div>
  );
};

export default Schedule;
