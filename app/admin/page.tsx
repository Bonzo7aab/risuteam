import {
  Book,
  BookOpen,
  Calendar,
  HelpCircle,
  Hotel,
  LucideImage,
  MapPin,
  Tent,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";

import AdminActivitiesPanel from "./_panel/admin-activities";
import AdminCampsPanel from "./_panel/admin-camps";
import AdminFaqPanel from "./_panel/admin-faq";
import AdminGalleryPanel from "./_panel/admin-gallery";
import AdminLocalizationsPanel from "./_panel/admin-localizations";
import AdminSchedulePanel from "./_panel/admin-schedule";
import AdminTrainersPanel from "./_panel/admin-trainers";
import AdminHotelsPanel from "./_panel/admin-hotels";

export const metadata: Metadata = {
  title: "Risu Team | Admin",
};

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return redirect("/sign-in");
  }

  // Sidebar navigation items
  const navItems = [
    { label: "Trenerzy", href: "trainers", icon: <Users /> },
    { label: "Lokalizacja", href: "lokalizacja", icon: <MapPin /> },
    { label: "Grafik", href: "grafik", icon: <Calendar /> },
    { label: "Zajęcia", href: "rodzaje_zajec", icon: <BookOpen /> },
    { label: "FAQ", href: "faq", icon: <HelpCircle /> },
    { label: "Galeria", href: "galeria", icon: <LucideImage /> },
    { label: "Obozy", href: "obozy", icon: <Tent /> },
    { label: "Hotele", href: "hotele", icon: <Hotel /> },
  ];

  // Use searchParams to get the section (App Router best practice)
  const section = params?.section || "trainers";

  let panel = null;
  if (section === "trainers") panel = <AdminTrainersPanel />;
  else if (section === "lokalizacja") panel = <AdminLocalizationsPanel />;
  else if (section === "grafik") panel = <AdminSchedulePanel />;
  else if (section === "obozy") panel = <AdminCampsPanel />;
  else if (section === "rodzaje_zajec") panel = <AdminActivitiesPanel />;
  else if (section === "faq") panel = <AdminFaqPanel />;
  else if (section === "hotele") panel = <AdminHotelsPanel />;
  else if (section === "galeria") panel = <AdminGalleryPanel />;

  return (
    <div className="flex md:flex-row flex-col min-h-screen">
      <div className="flex flex-col gap-4">
        <div className="p-3 text-center md:text-left bg-risu-300 text-lg text-black">
          Panel administratora
        </div>
        <form action={signOutAction} className="px-3 pb-2">
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Wyloguj
          </Button>
        </form>
        <Sidebar
          items={navItems.map((item) => ({
            ...item,
            href: `/admin?section=${item.href}`,
          }))}
          activeHref={`/admin?section=${section}`}
        />
      </div>
      <main className="flex-1 p-8">{panel}</main>
    </div>
  );
}
