"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from "lucide-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  CreateStaffBody,
  ResetPasswordStaffBody,
  StaffDetailResponse,
  UpdateStaffBody,
} from "../../_api/data";
import {
  useCreateStaff,
  useGetSelectRole,
  useResetPasswordStaff,
  useUpdateStaff,
} from "../../_api";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  nama: z.string().min(3, "Nama harus memiliki minimal 3 karakter"),
  email: z.email("Email tidak valid"),
  is_active: z.boolean(),
});

export const DialogFormStaff = ({
  open,
  onOpenChange,
  mode,
  detail,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "password" | null;
  detail?: StaffDetailResponse["data"];
}) => {
  const idFormStaff = useId();

  const finalSchema = formSchema.extend({
    password:
      mode === "create" || mode === "password"
        ? z.string().min(8, "Password harus memiliki minimal 8 karakter")
        : z.string().optional(),
    confirm_password:
      mode === "create" || mode === "password"
        ? z.string().min(8, "Password harus memiliki minimal 8 karakter")
        : z.string().optional(),
    role_id:
      mode === "create"
        ? z.string().min(1, "Role harus dipilih")
        : z.string().optional(),
  });

  const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
  const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff();
  const { mutate: updatePassword, isPending: isUpdatingPassword } =
    useResetPasswordStaff();

  const { data: role } = useGetSelectRole();

  const listRole = role?.data ?? [];

  const form = useForm<z.infer<typeof finalSchema>>({
    resolver: zodResolver(finalSchema),
    values: {
      nama: detail?.nama ?? "",
      email: detail?.email ?? "",
      password: "",
      confirm_password: "",
      role_id: "",
      is_active: detail?.is_active ?? true,
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: z.infer<typeof finalSchema>) => {
    switch (mode) {
      case "create":
        if (values.password !== values.confirm_password) {
          form.setError("confirm_password", {
            message: "Password tidak cocok",
          });
          return;
        }
        const bodyCreate: CreateStaffBody = {
          email: values.email,
          nama: values.nama,
          password: values.password as string,
          confirm_password: values.confirm_password as string,
          role_id: values.role_id as string,
        };
        createStaff({ body: bodyCreate }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        const bodyEdit: UpdateStaffBody = {
          email: values.email,
          nama: values.nama,
          is_active: values.is_active,
        };
        updateStaff(
          { body: bodyEdit, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
      case "password":
        if (values.password !== values.confirm_password) {
          form.setError("confirm_password", {
            message: "Password tidak cocok",
          });
          return;
        }
        const bodyPassword: ResetPasswordStaffBody = {
          new_password: values.password as string,
          confirm_password: values.confirm_password as string,
        };
        updatePassword(
          {
            body: bodyPassword,
            params: { id: detail?.id ?? "" },
          },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const title = () => {
    switch (mode) {
      case "edit":
        return "Ubah Data Staff";
      case "create":
        return "Tambah Staff Baru";
      case "password":
        return "Ganti Kata Sandi";
    }
  };
  const description = () => {
    switch (mode) {
      case "edit":
        return "Kelola informasi staff.";
      case "create":
        return "Daftarkan staff baru.";
      case "password":
        return "Perbarui kata sandi staff.";
    }
  };

  const isDisabled = isCreating || isUpdating || isUpdatingPassword;

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title()}</DialogTitle>
          <DialogDescription>{description()}</DialogDescription>
        </DialogHeader>
        {(mode === "create" && !listRole) || (mode === "edit" && !detail) ? (
          <Skeleton className="w-full h-50" />
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FieldGroup className="grid md:grid-cols-6 gap-4">
              {mode !== "password" && (
                <>
                  <Controller
                    name="email"
                    control={form.control}
                    disabled={isDisabled}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-full"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormStaff}-${field.name}`}
                        >
                          Email
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
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
                        <FieldLabel
                          required
                          htmlFor={`${idFormStaff}-${field.name}`}
                        >
                          Nama
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
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
                </>
              )}

              {mode !== "edit" && (
                <>
                  <Controller
                    name="password"
                    control={form.control}
                    disabled={isDisabled}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-full"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormStaff}-${field.name}`}
                        >
                          Password
                        </FieldLabel>
                        <InputPassword
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
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
                    disabled={isDisabled}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-full"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormStaff}-${field.name}`}
                        >
                          Confirm Password
                        </FieldLabel>
                        <InputPassword
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </>
              )}
              {mode === "create" && (
                <Controller
                  name="role_id"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      className="gap-1 col-span-full"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idFormStaff}-${field.name}`}
                      >
                        Role
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        items={listRole.map((roleItem) => ({
                          label: roleItem.nama,
                          value: roleItem.id,
                        }))}
                      >
                        <SelectTrigger
                          id={`${idFormStaff}-${field.name}`}
                          aria-invalid={fieldState.invalid}
                          className={"bg-transparent"}
                        >
                          <SelectValue
                            placeholder="Select Role"
                            className={"capitalize"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {listRole.map((roleItem) => (
                            <SelectItem key={roleItem.id} value={roleItem.id}>
                              {roleItem.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              {mode === "edit" && (
                <Controller
                  name="is_active"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <Switch
                        id={`${idFormStaff}-${field.name}`}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        className={
                          "data-checked:bg-emerald-500 data-unchecked:bg-red-500 dark:data-checked:bg-emerald-400 dark:data-unchecked:bg-red-400"
                        }
                        classThumb="data-checked:bg-emerald-50 data-unchecked:bg-red-50 dark:data-checked:bg-emerald-950 dark:data-unchecked:bg-red-950"
                        size="sm"
                      />
                      <FieldLabel
                        htmlFor={`${idFormStaff}-${field.name}`}
                        className="whitespace-nowrap"
                      >
                        Status Akun
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={isDisabled}
                type="button"
                variant={"outline"}
                onClick={handleClose}
              >
                <X className="size-3.5" />
                Batal
              </Button>
              <Button disabled={isDisabled} type="submit">
                {isDisabled ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
                {isDisabled ? "Mengirim..." : "Kirim"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
