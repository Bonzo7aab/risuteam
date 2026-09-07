export type ScheduleItem = {
  time: string;
  title: string;
  description: string;
  highlight?: boolean;
};

export type DailyProgramProps = {
  title: string;
  subtitle?: string;
  items: ScheduleItem[];
};

export function DailyProgram({ title, subtitle, items }: DailyProgramProps) {
  return (
    <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-600 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.time + item.title}
              className={`rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 md:p-5 shadow-sm flex gap-4 ${
                item.highlight ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="shrink-0 font-bold text-stone-900 dark:text-white w-14">
                {item.time}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
