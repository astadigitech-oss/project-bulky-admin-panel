"use client";

import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subYears,
  endOfDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { DialogHeader, DialogTitle } from "./ui/dialog";

type CalendarEvent = {
  label: string;
  date_start: Date;
  date_end: Date;
};

const eventDay: CalendarEvent[] = [
  {
    label: "Event 1",
    date_start: new Date("2026-02-10"),
    date_end: new Date("2026-02-11"),
  },
  {
    label: "Event 2",
    date_start: new Date("2026-02-12"),
    date_end: new Date("2026-02-14"),
  },
  {
    label: "Event 3",
    date_start: new Date("2026-02-15"),
    date_end: new Date("2026-02-23"),
  },
];

export default function CalendarEvent() {
  const [currentYear, setCurrentYear] = useState(new Date());
  const weekStartsOn = 0; // Minggu

  function generateCalendar(date: Date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return days.map((day) => ({
      date: day,
      label: format(day, "d"),
      isCurrentMonth: isSameMonth(day, date),
      isToday: isToday(day),
    }));
  }

  function getEventByDay(day: Date, events: CalendarEvent[]) {
    const found = events.find((event) =>
      isWithinInterval(day, {
        start: startOfDay(event.date_start),
        end: endOfDay(event.date_end),
      }),
    );

    if (!found) return null;

    return {
      label: found.label,
      isStart: isSameDay(day, found.date_start),
      isEnd: isSameDay(day, found.date_end),
    };
  }

  const yearStart = startOfYear(currentYear);

  const months = Array.from({ length: 12 }).map((_, i) => {
    const monthDate = addMonths(yearStart, i);
    return {
      monthDate,
      calendar: generateCalendar(monthDate),
    };
  });

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    format(addDays(startOfWeek(new Date(), { weekStartsOn }), i), "EEEEEE", {
      locale: id,
    }),
  );

  return (
    <div className="flex flex-col gap-6 p-5">
      <DialogHeader className="flex items-center justify-between flex-row">
        <DialogTitle className="text-xl">Kalender Event Banner</DialogTitle>
        <div className="flex gap-6 items-center">
          <Button
            onClick={() => setCurrentYear(subYears(currentYear, 1))}
            variant={"outline"}
          >
            ←
          </Button>

          <h1 className="text-xl font-semibold">
            {format(currentYear, "yyyy")}
          </h1>

          <Button
            onClick={() => setCurrentYear(addYears(currentYear, 1))}
            variant={"outline"}
          >
            →
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className={"h-[65vh]"}>
        <div className="grid grid-cols-4 gap-6">
          {months.map(({ monthDate, calendar }) => (
            <div
              key={monthDate.toISOString()}
              className="border border-gray-300 dark:border-gray-300/30 rounded-lg p-3"
            >
              <h2 className="text-center font-medium mb-2">
                {format(monthDate, "MMMM", { locale: id })}
              </h2>

              <div className="grid grid-cols-7 text-xs mb-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 text-xs rounded border border-gray-300 dark:border-gray-300/30">
                {calendar.map((day) => {
                  const events = getEventByDay(day.date, eventDay);

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={cn(
                        "h-10 flex items-center justify-center flex-col gap-1",
                        !day.isCurrentMonth && "text-gray-300",
                      )}
                    >
                      <div
                        className={cn(
                          "size-5 rounded-full flex items-center justify-center",
                          day.isToday &&
                            "bg-black text-white dark:bg-white dark:text-black",
                        )}
                      >
                        {day.label}
                      </div>
                      <div
                        className={cn(
                          "w-full h-1",
                          events?.isStart && "pl-1",
                          events?.isEnd && "pr-1",
                        )}
                      >
                        {events?.label && (
                          <TooltipText
                            value={events.label}
                            render={
                              <div
                                className={cn(
                                  "size-full bg-blue-500",
                                  events?.isStart && "rounded-l-full",
                                  events?.isEnd && "rounded-r-full",
                                )}
                              />
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
