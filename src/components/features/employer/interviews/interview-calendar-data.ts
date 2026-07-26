import type { EmployerInterviewRow } from "@/lib/data-helpers";

export const SINGAPORE_TIME_ZONE = "Asia/Singapore";

export type CalendarDay = {
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((part) => part.type === type)?.value;
}

export function getCalendarDateKey(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SINGAPORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");

  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function getMonthDays(
  year: number,
  monthIndex: number,
  todayKey = getCalendarDateKey(new Date().toISOString()),
): CalendarDay[] {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setUTCDate(firstDay.getUTCDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      dayNumber: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === monthIndex,
      isToday: key === todayKey,
    };
  });
}

export function getScheduledRowsByDate(rows: EmployerInterviewRow[]) {
  const grouped = new Map<string, EmployerInterviewRow[]>();

  rows
    .filter((row) => row.interview.status === "Scheduled")
    .sort(
      (a, b) =>
        new Date(a.interview.scheduledAt).getTime() -
        new Date(b.interview.scheduledAt).getTime(),
    )
    .forEach((row) => {
      const key = getCalendarDateKey(row.interview.scheduledAt);
      if (!key) return;
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    });

  return grouped;
}

export function formatCalendarTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-SG", {
    timeZone: SINGAPORE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function toSingaporeIso(localDateTime: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDateTime)) {
    return "";
  }
  return `${localDateTime}:00+08:00`;
}
