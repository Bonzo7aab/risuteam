import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserDashboard } from "./_components/user-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <UserDashboard user={user} />;
}
