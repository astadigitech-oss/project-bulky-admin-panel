import type { WheelPickerOption } from "@/components/ui/wheel-picker";

const createOptions = (
  length: number,
  start = 0,
): WheelPickerOption<number>[] =>
  Array.from({ length }, (_, i) => {
    const value = i + start;
    return {
      label: value.toString().padStart(2, "0"),
      value,
    };
  });

export const hour24Options = createOptions(24);
export const minuteOptions = createOptions(60);
