"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../_api";
import { useEffect, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, hasCookie } from "cookies-next/client";
import { parseAsString, useQueryState } from "nuqs";
import { cookiesKey } from "@/config";

const formSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const ClientLogin = () => {
  const router = useRouter();
  const elementId = useId();
  const [isNavigating, startTransition] = useTransition();
  const [redirect] = useQueryState("redirect", parseAsString.withDefault(""));

  console.log(redirect, decodeURIComponent(redirect));

  const { mutate: login, isPending: isLoggingIn } = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    login(
      { body: values },
      {
        onSuccess: () => {
          startTransition(() =>
            router.push(redirect.length > 0 ? redirect : "/"),
          );
        },
      },
    );
  };

  const isPending = isLoggingIn || isNavigating;

  const renderButtonContent = () => {
    if (isLoggingIn) return "Memproses...";
    if (isNavigating) return "Mengalihkan...";
    return "Masuk";
  };

  useEffect(() => {
    if (hasCookie(cookiesKey)) {
      deleteCookie(cookiesKey);
    }
  }, []);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          disabled={isPending}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${elementId}-${field.name}`} required>
                Email
              </FieldLabel>
              <Input
                {...field}
                id={`${elementId}-${field.name}`}
                aria-invalid={fieldState.invalid}
                placeholder="m@example.com"
                autoComplete="email"
                autoFocus
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          disabled={isPending}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor={`${elementId}-${field.name}`} required>
                  Password
                </FieldLabel>
              </div>
              <InputPassword
                id={`${elementId}-${field.name}`}
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button disabled={isPending} type="submit">
            {renderButtonContent()}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
