"use client";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-[90px_1fr_1fr_auto] gap-3 items-center border border-gray-500 px-3 py-2 rounded-lg">
      {/* Day */}
      <span className="text-sm font-medium">{day}</span>

      {/* Open Time */}
      <Controller
        name={`schedules.${index}.openTime`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="sr-only">
              Open Time
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="time"
              disabled={!isOpen}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Close Time */}
      <Controller
        name={`schedules.${index}.closeTime`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="sr-only">
              Close Time
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="time"
              disabled={!isOpen}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Is Open */}
      <Controller
        name={`schedules.${index}.isOpen`}
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);

                if (!checked) {
                  setValue(`schedules.${index}.openTime`, "");
                  setValue(`schedules.${index}.closeTime`, "");
                }
              }}
              aria-label={`Toggle ${day}`}
            />
          </Field>
        )}
      />
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
        Informasi Gudang
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
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </div>
  );
};
