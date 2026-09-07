"use client";

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { CheckIcon } from "lucide-react";

export type HistoriaTimelineEntry = {
  period: string;
  title: string;
  description: string;
};

type Props = {
  entries: HistoriaTimelineEntry[];
};

export function HistoriaTimelineReui({ entries }: Props) {
  const n = entries.length;

  return (
    <Timeline defaultValue={n} className="w-full max-w-2xl mx-auto">
      {entries.map((item, i) => {
        const step = i + 1;
        return (
          <TimelineItem
            key={item.period}
            step={step}
            className="group-data-[orientation=vertical]/timeline:ms-10"
          >
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
              <TimelineDate>{item.period}</TimelineDate>
              <TimelineTitle className="text-base text-text-main dark:text-white">
                {item.title}
              </TimelineTitle>
              <TimelineIndicator className="group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=vertical]/timeline:-left-7">
                <CheckIcon className="size-4 group-not-data-completed/timeline-item:hidden" />
              </TimelineIndicator>
            </TimelineHeader>
            <TimelineContent className="text-text-light dark:text-stone-400">
              {item.description}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
