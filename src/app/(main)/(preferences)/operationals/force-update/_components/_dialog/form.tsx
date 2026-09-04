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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from "lucide-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { ForceUpdateDetailResponse } from "../../_api/types";
import { useCreateForceUpdate, useUpdateForceUpdate } from "../../_api";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { typeForceUpdates, typePlatforms } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const forceUpdatePlatforms = typePlatforms.filter(
  (platform) => platform.value !== "ALL",
);

const formSchema = z.object({
  kode_versi: z.string().min(3, "Judul harus memiliki minimal 3 karakter"),
  minimum_build_number: z.coerce
    .number()
    .int("Build number harus bilangan bulat")
    .positive("Build number harus lebih besar dari 0"),
  update_type: z.enum(["OPTIONAL", "MANDATORY"]),
  platform: z.enum(["ANDROID", "IOS"]),
  informasi_update: z
    .string()
    .min(3, "Deskripsi harus memiliki minimal 3 karakter"),
  informasi_update_en: z
    .string()
    .min(3, "Deskripsi EN harus memiliki minimal 3 karakter"),
});

export const DialogFormForceUpdate = ({
  open,
  onOpenChange,
  mode,
  detail,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  detail?: ForceUpdateDetailResponse["data"];
}) => {
  const idFormForceUpdate = useId();

  const { mutate: createForceUpdate, isPending: isCreating } =
    useCreateForceUpdate();
  const { mutate: updateForceUpdate, isPending: isUpdating } =
    useUpdateForceUpdate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      kode_versi: detail?.kode_versi ?? "",
      minimum_build_number: detail?.minimum_build_number ?? 0,
      informasi_update: detail?.informasi_update ?? "",
      informasi_update_en: detail?.informasi_update_en ?? "",
      update_type: detail?.update_type ?? "OPTIONAL",
      platform: detail?.platform ?? "ANDROID",
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (mode) {
      case "create":
        createForceUpdate({ body: values }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateForceUpdate(
          { body: values, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const isDisabled = isCreating || isUpdating;

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Ubah Data Force Update"
              : "Tambah Force Update Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi force update"
              : "Tambahkan force update baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-59" />
          ) : (
            <FieldGroup className="grid md:grid-cols-6 gap-4">
              <Controller
                name="kode_versi"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Versi
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idFormForceUpdate}-${field.name}`}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="contoh: 1.0.0"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="minimum_build_number"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-3"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Minimum Build Number
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idFormForceUpdate}-${field.name}`}
                      type="number"
                      min={1}
                      step={1}
                      aria-invalid={fieldState.invalid}
                      placeholder="contoh: 141"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="update_type"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-3"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Jenis ForceUpdate
                    </FieldLabel>
                    <Select
                      items={typeForceUpdates}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                      data-invalid={fieldState.invalid}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={"Pilih jenis update..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {typeForceUpdates.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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
              <Controller
                name="platform"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-3"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Platform
                    </FieldLabel>
                    <Select
                      items={forceUpdatePlatforms}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                      data-invalid={fieldState.invalid}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={"Pilih platform..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {forceUpdatePlatforms.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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
              <Controller
                name="informasi_update"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={`${idFormForceUpdate}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Informasi update..."
                      autoComplete="off"
                      className="min-h-20"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="informasi_update_en"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormForceUpdate}-${field.name}`}
                    >
                      Deskripsi (EN)
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={`${idFormForceUpdate}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Update information..."
                      autoComplete="off"
                      className="min-h-20"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          )}
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
      </DialogContent>
    </Dialog>
  );
};
