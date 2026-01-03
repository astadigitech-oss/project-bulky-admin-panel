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
    <div className="grid lg:grid-cols-2 max-w-3xl mx-auto w-full gap-4">
      <h2 className="font-semibold text-lg lg:text-xl tracking-tight">
        Bantuan Whatsapp
      </h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
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
                <FieldLabel required htmlFor="phone">
                  No. Telepon
                </FieldLabel>
                <PhoneInput id={"phone"} placeholder="88888888" {...field} />

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
                <FieldLabel required htmlFor="message">
                  Pesan Awal
                </FieldLabel>
                <Textarea
                  id={"message"}
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
