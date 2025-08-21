import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserSettingsPanel from "./_components/user-settings-panel";

export default async function UserSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <UserSettingsPanel user={user} />;
}
