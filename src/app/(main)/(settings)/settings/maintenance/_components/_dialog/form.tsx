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
import { MaintenanceDetailResponse } from "../../_api/types";
import { useCreateMaintenance, useUpdateMaintenance } from "../../_api";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { typeMaintenances } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  judul: z.string().min(3, "Judul harus memiliki minimal 3 karakter"),
  tipe_maintenance: z.enum(["BIG_UPDATE", "BUG", "ERROR", "OTHER"]),
  deskripsi: z.string().min(3, "Deskripsi harus memiliki minimal 3 karakter"),
});

export const DialogFormMaintenance = ({
  open,
  onOpenChange,
  mode,
  detail,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  detail?: MaintenanceDetailResponse["data"];
}) => {
  const idFormMaintenance = useId();

  const { mutate: createMaintenance, isPending: isCreating } =
    useCreateMaintenance();
  const { mutate: updateMaintenance, isPending: isUpdating } =
    useUpdateMaintenance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul: detail?.judul ?? "",
      deskripsi: detail?.deskripsi ?? "",
      tipe_maintenance: detail?.tipe_maintenance ?? "BUG",
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (mode) {
      case "create":
        createMaintenance({ body: values }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateMaintenance(
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
              ? "Ubah Data Maintenance"
              : "Tambah Maintenance Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi maintenance"
              : "Tambahkan maintenance baru"}
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
                name="judul"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormMaintenance}-${field.name}`}
                    >
                      Judul
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idFormMaintenance}-${field.name}`}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Judul maintenance..."
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="tipe_maintenance"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormMaintenance}-${field.name}`}
                    >
                      Jenis Maintenance
                    </FieldLabel>
                    <Select
                      items={typeMaintenances}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                      data-invalid={fieldState.invalid}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={"Pilih jenis maintenance..."}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {typeMaintenances.map((item) => (
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
                name="deskripsi"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormMaintenance}-${field.name}`}
                    >
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={`${idFormMaintenance}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Deskripsi maintenance..."
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
