"use client";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TimeWheelPicker } from "./_sub-section/time-wheel-picker";
import { Toggle } from "@/components/ui/toggle";
import { RotateCw, Send, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetSchedule, useUpdateSchedule } from "../../_api";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { MouseEvent } from "react";

/* =======================
   SCHEMA
======================= */
const scheduleSchema = z.object({
  day: z.string(),
  day_name: z.string(),
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
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
                type="button"
                pressed={field.value}
                onPressedChange={(pressed) => {
                  field.onChange(pressed);

                  setValue(
                    `schedules.${index}.openTime`,
                    pressed ? "00.00" : null,
                  );
                  setValue(
                    `schedules.${index}.closeTime`,
                    pressed ? "00.00" : null,
                  );
                }}
                aria-label={`Toggle ${day}`}
                variant={"outline"}
                size={"sm"}
                className={cn(
                  "w-20 text-xs transition-all duration-300",
                  field.value
                    ? [
                        "border-emerald-500 bg-emerald-50/50! text-emerald-600",
                        "dark:border-emerald-500/50 dark:bg-emerald-500/10! dark:text-emerald-400",
                        "hover:bg-emerald-100/50! dark:hover:bg-emerald-500/20! hover:text-emerald-600 hover:dark:text-emerald-400",
                      ]
                    : [
                        "border-red-500 bg-red-50/50! text-red-600",
                        "dark:border-red-500/50 dark:bg-red-500/10! dark:text-red-400",
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
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule();
  const { data: schedule, isLoading } = useGetSchedule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      schedules:
        schedule?.data.map((item) => ({
          day: item.hari.toString(),
          day_name: item.nama_hari,
          isOpen: item.is_buka,
          openTime: item.jam_buka ? item.jam_buka.replace(/:\d{2}$/, "") : null,
          closeTime: item.jam_tutup
            ? item.jam_tutup.replace(/:\d{2}$/, "")
            : null,
        })) ?? [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const onSubmit = (values: FormValues) => {
    updateSchedule({
      body: {
        jadwal: values.schedules.map((item) => ({
          hari: Number.parseFloat(item.day),
          jam_buka: item.openTime ?? null,
          jam_tutup: item.closeTime ?? null,
          is_buka: item.isOpen,
        })),
      },
    });
  };

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();
    form.reset();
  };

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Informasi Pengambilan
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2"
      >
        <FieldGroup className="gap-3">
          {isLoading && fields.length === 0
            ? Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))
            : fields.map((item, index) => (
                <ScheduleRow
                  key={item.id}
                  index={index}
                  control={form.control}
                  setValue={form.setValue}
                  day={item.day_name}
                />
              ))}
        </FieldGroup>

        <div className="flex justify-end items-center w-full gap-3">
          <Button
            type="button"
            disabled={!form.formState.isDirty || isLoading || isUpdating}
            onClick={handleReset}
            variant={"secondary"}
          >
            <RotateCw className="size-3.5" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || isLoading || isUpdating}
          >
            {isLoading || isUpdating ? (
              <Spinner className="size-3.5" />
            ) : (
              <Send className="size-3.5" />
            )}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
};
