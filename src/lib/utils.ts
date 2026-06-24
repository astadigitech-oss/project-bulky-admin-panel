import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeeksInMonth,
  getYear,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const sizesImage =
  "(max-width: 768px) 50vw, (max-width: 1200px) 75vw, 100vw";

export const numericString = (e: string) => {
  if (Number.isNaN(e) || e === "" || Number.parseFloat(e) === 0) return "0";
  return e.startsWith("0") ? e.replace(/^0+/, "") : e;
};

export const extractCoordsFromURL = (url: string) => {
  // Regex untuk mencari pola @latitude,longitude
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      lat: match[1],
      lng: match[2],
    };
  }
  return null;
};

export const today = new Date();
export const startMonth = startOfMonth(today);

export const getRangeOfWeeks = () => {
  const totalWeek = getWeeksInMonth(today, { weekStartsOn: 1 });

  const endMonth = endOfMonth(today);

  const rangeWeek = eachWeekOfInterval(
    { start: startMonth, end: endMonth },
    { weekStartsOn: 1 },
  ).map((weekStart, i) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    return {
      week: i + 1,
      start: format(i === 0 ? startMonth : weekStart, "d MMM", {
        locale: id,
      }),
      end: format(weekEnd > endMonth ? endMonth : weekEnd, "d MMM", {
        locale: id,
      }),
    };
  });

  return {
    total: totalWeek,
    range: rangeWeek,
  };
};

export const getRangeOfYears = () => {
  const initialYear = 2024;
  const currentYear = getYear(today);
  return Array.from(
    { length: currentYear - initialYear + 1 },
    (_, i) => currentYear - i,
  );
};

export const getRangeOfMonths = () => {
  return eachMonthOfInterval({
    start: startOfYear(today),
    end: today,
  }).map((date, i) => ({
    num: i + 1,
    month: format(date, "MMMM", { locale: id }),
  }));
};

export const formatImageAlt = (str: string) => {
  return str.split(" ").join("_").toLowerCase();
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const typeMaintenances = [
  { label: "Big Update", value: "BIG_UPDATE" },
  { label: "Bug", value: "BUG" },
  { label: "Error", value: "ERROR" },
  { label: "Lainnya", value: "OTHER" },
];

export const typeForceUpdates = [
  { label: "Opsional", value: "OPTIONAL" },
  { label: "Wajib", value: "MANDATORY" },
];

export function formatRupiah(rupiah: string | number): string {
  const value =
    typeof rupiah === "string"
      ? parseFloat(rupiah.replace(/[^\d.-]/g, ""))
      : rupiah;

  if (!value || isNaN(value)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.ceil(value));
}
