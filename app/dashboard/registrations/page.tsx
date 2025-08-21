import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserRegistrationsPanel from "./_components/user-registrations-panel";

export default async function UserRegistrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <UserRegistrationsPanel userId={user.id} />;
}
