"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  message: z.string().min(1, "Pesan wajib diisi"),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
});

export const WhatsappServiceClient = () => {
  const idWhatsapp = `${useId()}-whatsapp`;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      phone: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Bantuan Whatsapp
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2"
      >
        <FieldGroup className="grid w-full">
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor={`${idWhatsapp}-${field.name}`}>
                  No. Telepon
                </FieldLabel>
                <PhoneInput
                  id={`${idWhatsapp}-${field.name}`}
                  placeholder="88888888"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor={`${idWhatsapp}-${field.name}`}>
                  Pesan Awal
                </FieldLabel>
                <Textarea
                  id={`${idWhatsapp}-${field.name}`}
                  className="min-h-28"
                  placeholder="e.g. Halo Bulky, saya butuh bantuan..."
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end items-center w-full">
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </div>
  );
};
