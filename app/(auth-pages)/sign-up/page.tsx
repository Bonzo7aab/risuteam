import { FormMessage, Message } from "@/components/form-message";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";
import Link from "next/link";

export default async function SignUpPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="col-span-2 flex flex-col flex-1 items-center justify-center p-6">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <aside className="hidden min-h-screen flex-col border-r border-stone-200 bg-gradient-to-br from-primary/20 to-primary/5 px-12 pb-16 pt-[max(env(safe-area-inset-top),2rem)] dark:border-stone-800 dark:from-primary/30 dark:to-primary/10 lg:flex xl:px-20">
        <div className="flex justify-center">
          <RisuTeamLogoTitleMark
            className="items-center text-center"
            titleClassName="text-text-main dark:text-white"
            logoCircleClassName="bg-stone-200/90 ring-stone-300/90 dark:bg-stone-800/90 dark:ring-stone-600"
            priority
          />
        </div>
        <div className="mt-10 flex flex-1 flex-col justify-between">
        <div>
          <h2 className="text-2xl xl:text-3xl font-bold text-stone-900 dark:text-white mb-3">
            Budujemy razem lepszą przyszłość.
          </h2>
          <p className="text-stone-600 dark:text-stone-400 max-w-sm">
            Dołącz do społeczności, aby zarządzać zajęciami dziecka, śledzić
            postępy i kontaktować się z innymi rodzicami.
          </p>
          <div className="flex gap-1.5 mt-8">
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
          <span>© {new Date().getFullYear()} Risu Team</span>
          <Link href="/kontakt" className="hover:text-primary">
            Polityka prywatności
          </Link>
          <Link href="/kontakt" className="hover:text-primary">
            Regulamin
          </Link>
        </div>
        </div>
      </aside>
      <main className="flex flex-col justify-start bg-white px-6 py-8 dark:bg-stone-950 sm:px-12 sm:py-10 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <SignUpForm />
          {"error" in searchParams || "success" in searchParams ? (
            <FormMessage message={searchParams} />
          ) : null}
        </div>
      </main>
    </>
  );
}
