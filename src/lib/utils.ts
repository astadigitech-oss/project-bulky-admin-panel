import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sizesImage =
  "(max-width: 768px) 50vw, (max-width: 1200px) 75vw, 100vw";
