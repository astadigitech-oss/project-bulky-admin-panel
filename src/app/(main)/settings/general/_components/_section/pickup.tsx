"use client";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TimeWheelPicker } from "./_sub-section/time-wheel-picker";
import { Toggle } from "@/components/ui/toggle";
import { Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

/* =======================
   DEFAULT DATA
======================= */
const defaultSchedules = [
  { day: "Senin", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Selasa", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Rabu", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Kamis", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Jumat", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Sabtu", openTime: "09:00", closeTime: "18:00", isOpen: true },
  { day: "Minggu", openTime: "", closeTime: "", isOpen: false },
];

/* =======================
   SCHEMA
======================= */
const scheduleSchema = z.object({
  day: z.string(),
  openTime: z.string(),
  closeTime: z.string(),
  isOpen: z.boolean(),
});

const formSchema = z.object({
  schedules: z.array(scheduleSchema),
});

type FormValues = z.infer<typeof formSchema>;

/* =======================
   ROW COMPONENT
======================= */
function ScheduleRow({
  index,
  control,
  setValue,
  day,
}: {
  index: number;
  control: any;
  setValue: any;
  day: string;
}) {
  const isOpen = useWatch({
    control,
    name: `schedules.${index}.isOpen`,
  });

  return (
    <div className="flex  gap-3 items-center bg-gray-100 dark:bg-gray-800/60 px-3 py-2 rounded-lg">
      {/* Day */}
      <span className="text-sm font-medium">{day}</span>

      <div className="ml-auto flex items-center gap-4">
        <TimeWheelPicker
          control={control}
          baseName={`schedules.${index}`}
          disabled={!isOpen}
        />

        {/* Is Open */}
        <Controller
          name={`schedules.${index}.isOpen`}
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Toggle
                pressed={field.value}
                onPressedChange={(pressed) => {
                  field.onChange(pressed);

                  setValue(
                    `schedules.${index}.openTime`,
                    pressed ? "00.00" : "",
                  );
                  setValue(
                    `schedules.${index}.closeTime`,
                    pressed ? "00.00" : "",
                  );
                }}
                aria-label={`Toggle ${day}`}
                variant={"outline"}
                size={"sm"}
                className={cn(
                  "w-20 text-xs transition-all duration-300",
                  // Efek Neon Emerald saat True (Buka)
                  field.value
                    ? [
                        // THEME EMERALD (TRUE)
                        // Light Mode
                        "border-emerald-500 bg-emerald-50/50! text-emerald-600",
                        // Dark Mode
                        "dark:border-emerald-500/50 dark:bg-emerald-500/10! dark:text-emerald-400",
                        // Hover
                        "hover:bg-emerald-100/50! dark:hover:bg-emerald-500/20! hover:text-emerald-600 hover:dark:text-emerald-400",
                      ]
                    : [
                        // THEME RED (FALSE)
                        // Light Mode
                        "border-red-500 bg-red-50/50! text-red-600",
                        // Dark Mode
                        "dark:border-red-500/50 dark:bg-red-500/10! dark:text-red-400",
                        // Hover
                        "hover:bg-red-100/50! dark:hover:bg-red-500/20! hover:text-red-600 hover:dark:text-red-400",
                      ],
                )}
              >
                <Warehouse className="size-3.5" />
                {field.value ? "Buka" : "Tutup"}
              </Toggle>
            </Field>
          )}
        />
      </div>
    </div>
  );
}

/* =======================
   FORM
======================= */
export const PickupClient = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedules: defaultSchedules,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const onSubmit = (data: FormValues) => {
    console.log(data.schedules);
  };

  return (
    <div className="grid lg:grid-cols-2 max-w-3xl mx-auto w-full gap-4">
      <h2 className="font-semibold text-lg lg:text-xl tracking-tight">
        Informasi Pengambilan
      </h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FieldGroup className="gap-3">
          {fields.map((item, index) => (
            <ScheduleRow
              key={item.id}
              index={index}
              control={form.control}
              setValue={form.setValue}
              day={item.day}
            />
          ))}
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isDirty}>
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
};
