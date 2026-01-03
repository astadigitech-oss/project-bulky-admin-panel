"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputPassword } from "@/components/ui/input-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  current_password: z.string().min(1, "Password lama diperlukan"),
  new_password: z
    .string()
    .min(1, "Password baru diperlukan")
    .min(8, "Password baru minimal 8 karakter"),
  confirm_password: z
    .string()
    .min(1, "Konfirmasi password baru diperlukan")
    .min(8, "Konfirmasi password baru minimal 8 karakter"),
});

export const ChangePasswordClient = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <div className="grid lg:grid-cols-2 max-w-3xl mx-auto w-full gap-4">
      <h2 className="font-semibold text-lg lg:text-xl tracking-tight">
        Ganti Password
      </h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FieldGroup className="grid md:grid-cols-6 gap-4">
          <Controller
            name="current_password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor="current_password">
                  Password Lama
                </FieldLabel>
                <InputPassword
                  {...field}
                  id="current_password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="new_password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor="new_password">
                  Password Baru
                </FieldLabel>
                <InputPassword
                  {...field}
                  id="new_password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirm_password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor="confirm_password">
                  Konfirmasi Password Baru
                </FieldLabel>
                <InputPassword
                  {...field}
                  id="confirm_password"
                  aria-invalid={fieldState.invalid}
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
