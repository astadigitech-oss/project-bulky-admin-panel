"use client";

import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { WheelPicker, WheelPickerWrapper } from "@/components/ui/wheel-picker";

import { hour24Options, minuteOptions } from "./time-option";

type Props = {
  control: any;
  baseName: string;
  disabled?: boolean;
};

export function TimeWheelPicker({ control, baseName, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const [dayField, openTime, closeTime] = useWatch({
    control,
    name: [
      `${baseName}.day_name`,
      `${baseName}.openTime`,
      `${baseName}.closeTime`,
    ],
  });

  const parse = (v?: string) => {
    if (!v) return { h: 0, m: 0 };
    const [h, m] = v.split(":").map(Number);
    return {
      h: Number.isNaN(h) ? 0 : h,
      m: Number.isNaN(m) ? 0 : m,
    };
  };

  const openParsed = parse(openTime);
  const closeParsed = parse(closeTime);

  return (
    <Field>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className={"h-7! text-xs"}
            >
              {!openTime && !closeTime ? "" : `${openTime} - ${closeTime}`}
              <Clock className="size-3.5 opacity-60" />
            </Button>
          }
        />

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Jam Operasional</DialogTitle>
            <DialogDescription>{dayField}</DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-2">
            <Controller
              name={`${baseName}.openTime`}
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-1"
                >
                  <FieldLabel required>Jam Buka</FieldLabel>
                  <WheelPickerWrapper className="mx-auto">
                    <WheelPicker
                      options={hour24Options}
                      value={openParsed.h}
                      infinite
                      onValueChange={(h) =>
                        field.onChange(
                          `${h.toString().padStart(2, "0")}:${openParsed.m
                            .toString()
                            .padStart(2, "0")}`,
                        )
                      }
                    />
                    <WheelPicker
                      options={minuteOptions}
                      value={openParsed.m}
                      infinite
                      onValueChange={(m) =>
                        field.onChange(
                          `${openParsed.h.toString().padStart(2, "0")}:${m
                            .toString()
                            .padStart(2, "0")}`,
                        )
                      }
                    />
                  </WheelPickerWrapper>
                </Field>
              )}
            />

            {/* CLOSE TIME */}
            <Controller
              name={`${baseName}.closeTime`}
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-1"
                >
                  <FieldLabel required>Jam Tutup</FieldLabel>
                  <WheelPickerWrapper className="mx-auto">
                    <WheelPicker
                      options={hour24Options}
                      value={closeParsed.h}
                      infinite
                      onValueChange={(h) =>
                        field.onChange(
                          `${h.toString().padStart(2, "0")}:${closeParsed.m
                            .toString()
                            .padStart(2, "0")}`,
                        )
                      }
                    />
                    <WheelPicker
                      options={minuteOptions}
                      value={closeParsed.m}
                      infinite
                      onValueChange={(m) =>
                        field.onChange(
                          `${closeParsed.h.toString().padStart(2, "0")}:${m
                            .toString()
                            .padStart(2, "0")}`,
                        )
                      }
                    />
                  </WheelPickerWrapper>
                </Field>
              )}
            />
          </FieldGroup>

          <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
            Simpan
          </Button>
        </DialogContent>
      </Dialog>
    </Field>
  );
}
