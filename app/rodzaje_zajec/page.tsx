import { Metadata } from "next";
import Image from "next/image";

import { fetchActivities } from "@/app/actions";
import { TextAnimate } from "@/components/ui/text-animate";

export const metadata: Metadata = {
  title: "Risu Team | Rodzaje zajęć",
};

export default async function RodzajeZajec() {
  const { data: activities, error } = await fetchActivities();

  return (
    <div className="my-8 md:my-16 max-w-screen-xl">
      <div className="text-center text-4xl flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Rodzaje zajęć</h1>
      </div>
      <div className="md:my-8 divide-y divide-risu-400 text-lg leading-relaxed">
        {error && (
          <div className="text-red-500 text-center py-8">
            Błąd ładowania danych: {error}
          </div>
        )}
        {(!activities || activities.length === 0) && !error && (
          <div className="text-center py-8">
            Brak rodzajów zajęć do wyświetlenia.
          </div>
        )}
        {activities &&
          activities.map((activity, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={activity.id}
                className={`flex items-center mx-auto py-16 sm:flex-row flex-col ${isEven ? "" : "sm:flex-row-reverse"}`}
              >
                <div
                  className={
                    isEven
                      ? "sm:mr-10 inline-flex items-center justify-center rounded-full flex-shrink-0 relative mx-8"
                      : "sm:ml-10 inline-flex items-center justify-center rounded-full flex-shrink-0 relative mx-8"
                  }
                >
                  <Image
                    src={activity.image_url}
                    alt={activity.name}
                    className="object-cover w-full rounded-lg aspect-square"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="mx-8 mt-8">
                  <h2 className="text-3xl mb-8 text-risu-400 tracking-wider text-center md:text-left">
                    {activity.name}
                  </h2>
                  <div className="text-justify flex-grow sm:text-left mt-6 sm:mt-0">
                    <TextAnimate animation="fadeIn" by="word" once duration={1}>
                      {activity.description}
                    </TextAnimate>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
