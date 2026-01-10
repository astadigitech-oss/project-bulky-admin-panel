import { Separator } from "@/components/ui/separator-extended";
import { Radio } from "@base-ui/react/radio";
import { CircleIcon } from "lucide-react";
import React, { Activity, ReactNode } from "react";

export const RadioItem = ({
  label,
  children,
  value,
  type,
}: {
  label: string;
  children: ReactNode;
  value: "year" | "month" | "week" | "custom" | undefined;
  type: "year" | "month" | "week" | "custom" | undefined;
}) => {
  return (
    <Radio.Root
      value={value}
      data-slot="checkbox"
      className={
        "border border-primary/30 dark:border-primary/50 rounded-lg relative data-checked:border-primary  flex flex-col group"
      }
    >
      <div className="flex items-center p-3 group-data-checked:bg-primary/10 dark:data-checked:bg-primary/5">
        <p className="pointer-events-none font-semibold">{label}</p>
        <div className="size-4 border border-primary/30 dark:border-primary/50 group-data-checked:border-primary rounded-full justify-center relative ml-auto">
          <Radio.Indicator
            data-slot="radio-group-indicator"
            className="text-primary flex size-full items-center justify-center"
          >
            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
          </Radio.Indicator>
        </div>
      </div>
      <Activity mode={type === value ? "visible" : "hidden"}>
        <Separator variant={"dashed"} className={"bg-gray-400"} />
        {children}
      </Activity>
    </Radio.Root>
  );
};
