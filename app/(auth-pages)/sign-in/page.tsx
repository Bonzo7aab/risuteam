import { FormMessage, Message } from "@/components/form-message";
import { SignInForm } from "@/components/auth/sign-in-form";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";
import Image from "next/image";
import Link from "next/link";

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <aside className="hidden lg:flex relative min-h-screen overflow-hidden">
        <Image
          src="/zakopane_2025_ver2_1.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative z-10 flex min-h-screen w-full flex-col px-10 pb-8 pt-[max(env(safe-area-inset-top),2rem)] xl:px-16">
          <div className="flex justify-center">
            <RisuTeamLogoTitleMark
              className="items-center text-center"
              titleClassName="text-white"
              priority
            />
          </div>
          <div className="mt-auto space-y-0">
          <h2 className="text-2xl xl:text-3xl font-bold text-white mb-3 leading-tight">
            Budujmy lepszą przyszłość razem.
          </h2>
          <p className="text-white/90 text-sm xl:text-base max-w-md mb-8 leading-relaxed">
            Dołącz do naszej społeczności: zarządzaj zajęciami dzieci, śledź
            postępy i bądź w kontakcie z innymi rodzicami.
          </p>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-8 h-1 rounded-full bg-primary" aria-hidden />
            <span className="w-2 h-2 rounded-full bg-white/50" aria-hidden />
            <span className="w-2 h-2 rounded-full bg-white/50" aria-hidden />
          </div>
          <p className="text-white/70 text-xs">
            © {new Date().getFullYear()} Risu Team
            {" · "}
            <Link href="/kontakt" className="hover:text-white/90 underline">
              Polityka prywatności
            </Link>
            {" · "}
            <Link href="/kontakt" className="hover:text-white/90 underline">
              Regulamin
            </Link>
          </p>
          </div>
        </div>
      </aside>
      <main className="flex flex-col justify-start bg-white px-6 py-8 dark:bg-stone-950 sm:px-12 sm:py-10 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <SignInForm />
          {"error" in searchParams || "success" in searchParams ? (
            <FormMessage message={searchParams} />
          ) : null}
        </div>
      </main>
    </>
  );
}
