"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCalendarTime,
  getCalendarDateKey,
  getMonthDays,
  getScheduledRowsByDate,
} from "./interview-calendar-data";
import { getEmployerInterviewSeedRows } from "./interview-data";
import styles from "./interview-calendar.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getKeyParts(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

function getDateLabel(key: string, includeYear = true) {
  const { year, monthIndex, day } = getKeyParts(key);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  }).format(new Date(Date.UTC(year, monthIndex, day)));
}

function getTodayParts() {
  const key = getCalendarDateKey(new Date().toISOString()) ?? "2026-07-26";
  return { key, ...getKeyParts(key) };
}

export function InterviewCalendar({
  initialYear,
  initialMonth,
}: {
  initialYear?: number;
  initialMonth?: number;
}) {
  const today = getTodayParts();
  const [viewYear, setViewYear] = useState(initialYear ?? today.year);
  const [viewMonth, setViewMonth] = useState(
    initialMonth ?? today.monthIndex,
  );
  const initialSelected =
    viewYear === today.year && viewMonth === today.monthIndex
      ? today.key
      : `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
  const [selectedDate, setSelectedDate] = useState(initialSelected);

  const rows = useMemo(() => getEmployerInterviewSeedRows(), []);
  const scheduledByDate = useMemo(
    () => getScheduledRowsByDate(rows),
    [rows],
  );
  const days = useMemo(
    () => getMonthDays(viewYear, viewMonth, today.key),
    [today.key, viewMonth, viewYear],
  );
  const selectedRows = scheduledByDate.get(selectedDate) ?? [];
  const years = Array.from({ length: 11 }, (_, index) => today.year - 5 + index);

  const setMonth = (year: number, monthIndex: number) => {
    setViewYear(year);
    setViewMonth(monthIndex);
    setSelectedDate(
      `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`,
    );
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setMonth(next.getUTCFullYear(), next.getUTCMonth());
  };

  return (
    <div className="space-y-6">
      <header className="space-y-5 border-b pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="shrink-0 bg-surface-1 hover:bg-surface-2"
            >
              <Link
                href="/employer/interviews"
                aria-label="Back to interview overview"
              >
                <ArrowLeft />
              </Link>
            </Button>
            <div>
              <p className="text-caption uppercase text-muted-foreground">
                Scheduled interviews
              </p>
              <h1 className="text-heading">
                {MONTHS[viewMonth]} {viewYear}
              </h1>
              <p className="mt-1 text-body text-muted-foreground">
                Browse confirmed interview dates, candidates, and panels.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setViewYear(today.year);
              setViewMonth(today.monthIndex);
              setSelectedDate(today.key);
            }}
          >
            Today
          </Button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-[24rem]">
            <div className="space-y-1.5">
              <label htmlFor="calendar-year" className="text-caption">
                Year
              </label>
              <Select
                value={String(viewYear)}
                onValueChange={(value) => setMonth(Number(value), viewMonth)}
              >
                <SelectTrigger id="calendar-year" aria-label="Year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="calendar-month" className="text-caption">
                Month
              </label>
              <Select
                value={String(viewMonth)}
                onValueChange={(value) =>
                  setMonth(viewYear, Number(value))
                }
              >
                <SelectTrigger id="calendar-month" aria-label="Month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={String(index)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <section>
        <div
          role="grid"
          aria-label={`${MONTHS[viewMonth]} ${viewYear} calendar`}
          className={`${styles.calendarGrid} border-x border-t bg-surface-inset`}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="border-b border-r px-1 py-2 text-center text-caption last:border-r-0 sm:px-2"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const events = scheduledByDate.get(day.key) ?? [];
            const eventLabel = `${events.length} scheduled ${
              events.length === 1 ? "interview" : "interviews"
            }`;

            return (
              <button
                key={day.key}
                type="button"
                role="gridcell"
                aria-label={`${getDateLabel(day.key)}, ${eventLabel}`}
                aria-selected={selectedDate === day.key}
                onClick={() => {
                  setSelectedDate(day.key);
                  if (!day.inCurrentMonth) {
                    const parts = getKeyParts(day.key);
                    setViewYear(parts.year);
                    setViewMonth(parts.monthIndex);
                  }
                }}
                className={cn(
                  "min-h-20 border-b border-r p-1 text-left transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-32 sm:p-2",
                  (index + 1) % 7 === 0 && "border-r-0",
                  day.inCurrentMonth
                    ? "bg-surface-1"
                    : "bg-surface-inset text-muted-foreground",
                  selectedDate === day.key &&
                    "bg-highlight-soft ring-2 ring-inset ring-primary",
                )}
              >
                <span className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums",
                      day.isToday &&
                        "bg-primary font-semibold text-primary-foreground",
                    )}
                  >
                    {day.dayNumber}
                  </span>
                  {events.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-caption sm:hidden">
                      <CalendarClock className="h-3 w-3" aria-hidden />
                      {events.length}
                    </span>
                  )}
                </span>

                <span className="mt-1 hidden space-y-1 sm:block">
                  {events.slice(0, 2).map((row) => (
                    <span
                      key={row.interview.id}
                      className="block rounded-md border bg-accent-soft px-2 py-1.5"
                    >
                      <span className="block truncate text-xs font-semibold">
                        {row.candidate.name}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {row.job.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium tabular-nums">
                        {formatCalendarTime(row.interview.scheduledAt)}
                      </span>
                    </span>
                  ))}
                  {events.length > 2 && (
                    <span className="block text-[10px] font-semibold text-secondary">
                      +{events.length - 2} more
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="selected-day-heading" className="space-y-3">
        <div>
          <p className="text-caption uppercase text-muted-foreground">
            Selected date
          </p>
          <h2 id="selected-day-heading">{getDateLabel(selectedDate, false)}</h2>
          <p className="text-meta text-muted-foreground">
            {selectedRows.length} scheduled{" "}
            {selectedRows.length === 1 ? "interview" : "interviews"}
          </p>
        </div>

        {selectedRows.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-28 items-center justify-center p-6 text-center text-body text-muted-foreground">
              No scheduled interviews on this date.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {selectedRows.map((row) => (
              <Card key={row.interview.id} className="lift-on-hover">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold"
                      >
                        {row.candidate.initials}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-body font-semibold">
                          {row.candidate.name}
                        </h3>
                        <p className="truncate text-meta text-muted-foreground">
                          {row.job.title}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{row.interview.type}</Badge>
                      <Badge variant="secondary">
                        {row.interview.duration} min
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm sm:text-right">
                    <p className="flex items-center gap-2 font-semibold tabular-nums sm:justify-end">
                      <Clock className="h-4 w-4" aria-hidden />
                      {formatCalendarTime(row.interview.scheduledAt)}
                    </p>
                    <p className="flex items-start gap-2 text-meta text-muted-foreground sm:justify-end">
                      <Users className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>{row.interview.interviewers.join(", ")}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
