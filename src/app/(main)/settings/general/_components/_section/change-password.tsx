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
import { MouseEvent, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useChangePassword } from "../../_api";
import { RotateCcw, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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
  const idPassword = `${useId()}-password`;
  const { mutate: changePassword, isPending: isUpdating } = useChangePassword();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.new_password !== values.confirm_password) {
      form.setError("confirm_password", { message: "Password tidak cocok" });
      return;
    }
    changePassword({ body: values }, { onSuccess: () => form.reset() });
  };

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();
    form.reset();
  };

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Ganti Password
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2"
      >
        <FieldGroup className="grid md:grid-cols-6 gap-4">
          <Controller
            name="current_password"
            control={form.control}
            disabled={isUpdating}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor={`${idPassword}-${field.name}`}>
                  Password Lama
                </FieldLabel>
                <InputPassword
                  {...field}
                  id={`${idPassword}-${field.name}`}
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
            disabled={isUpdating}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor={`${idPassword}-${field.name}`}>
                  Password Baru
                </FieldLabel>
                <InputPassword
                  {...field}
                  id={`${idPassword}-${field.name}`}
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
            disabled={isUpdating}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor={`${idPassword}-${field.name}`}>
                  Konfirmasi Password Baru
                </FieldLabel>
                <InputPassword
                  {...field}
                  id={`${idPassword}-${field.name}`}
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
          <Button
            type="button"
            disabled={!form.formState.isDirty || isUpdating}
            onClick={handleReset}
            variant={"secondary"}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || isUpdating}
          >
            {isUpdating ? (
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
