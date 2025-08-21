import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserSubscriptionsPanel from "./_components/user-subscriptions-panel";

export default async function UserSubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <UserSubscriptionsPanel userId={user.id} />;
}
