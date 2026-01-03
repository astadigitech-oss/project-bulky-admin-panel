import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const sizesImage =
  "(max-width: 768px) 50vw, (max-width: 1200px) 75vw, 100vw";

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
