"use client";

import { useMe } from "@/components/container/_api";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Send } from "lucide-react";
import { MouseEvent, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useUpdateProfile } from "../../_api";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  email: z.email().min(1, "Email is required"),
  nama: z.string().min(1, "Nama diperlukan").min(3, "Name minimal 3 karakter"),
});

export const AccountSetting = () => {
  const idAccount = `${useId()}-account`;
  const { data, isPending: isMePending } = useMe();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      email: data?.data.email ?? "",
      nama: data?.data.nama ?? "",
    },
    resetOptions: {
      keepDefaultValues: false,
    },
  });

  const isDisabled = isUpdating || isMePending;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateProfile({ body: values });
  };

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();
    form.reset();
  };

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Profil Saya
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2"
      >
        <FieldGroup className="grid md:grid-cols-6 gap-4">
          <Controller
            name="email"
            control={form.control}
            disabled={isDisabled}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor={`${idAccount}-${field.name}`}>
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={`${idAccount}-${field.name}`}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="m@example.com"
                  autoComplete="email"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="nama"
            control={form.control}
            disabled={isDisabled}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel required htmlFor={`${idAccount}-${field.name}`}>
                  Nama
                </FieldLabel>
                <Input
                  {...field}
                  id={`${idAccount}-${field.name}`}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="ahmad fulan"
                  autoComplete="name"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end items-center w-full gap-3">
          <Button
            type="button"
            disabled={!form.formState.isDirty || isDisabled}
            onClick={handleReset}
            variant={"secondary"}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || isDisabled}
          >
            {isDisabled ? (
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
