"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Send, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipText } from "@/providers/tooltip-provider";
import { cn } from "@/lib/utils";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { UseQueryResult } from "@tanstack/react-query";
import { WholesalerMarketingConfigResponse } from "../../_api/types";
import { AxiosError } from "axios";
import { useUpdateWholesalerConfig } from "../../_api";
import { useConfirm } from "@/hooks/use-confirm";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { LoadingData } from "./loading-data";
import { EmptyData } from "./empty-data";
import { ItemData } from "./item-data";

const formSchemaConfig = z.object({
  email: z.email(),
});

export const EmailSection = ({
  queryConfig,
}: {
  queryConfig: UseQueryResult<
    WholesalerMarketingConfigResponse,
    AxiosError<unknown, any>
  >;
}) => {
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [indexEdit, setIndexEdit] = useState<number | null>(null);
  const { mutate, isPending: isUpdating } = useUpdateWholesalerConfig();
  const { data, refetch, isRefetching, isLoading } = queryConfig;

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [name]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const emailList = data?.data.daftar_email ?? [];

  const form = useForm({
    resolver: zodResolver(formSchemaConfig),
    values: {
      email: "",
    },
  });

  const handleAddEmail = (value: z.infer<typeof formSchemaConfig>) => {
    const isFound = emailList.includes(value.email);
    if (isFound) {
      form.setError("email", { message: "Email sudah ada" });
      toast.error("Email sudah ada");
      return;
    }
    const body = [...emailList, value.email];
    mutate(
      { body: { daftar_email: body } },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  const handleEditEmail = (value: z.infer<typeof formSchemaConfig>) => {
    if (!indexEdit) return;
    const isFound = emailList.includes(value.email);
    if (isFound) {
      form.setError("email", { message: "Email sudah ada" });
      toast.error("Email sudah ada");
      return;
    }
    const body = emailList.map((item, index) =>
      index === indexEdit - 1 ? value.email : item,
    );
    mutate(
      { body: { daftar_email: body } },
      {
        onSuccess: () => {
          form.reset();
          setIndexEdit(null);
        },
      },
    );
  };

  const handleReorder = (order: "up" | "down", index: number) => {
    const body = [...emailList];
    const t = order === "up" ? index - 1 : index + 1;
    [body[index], body[t]] = [body[t], body[index]];
    mutate(
      { body: { daftar_email: body } },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  const handleDelete = async (index: number, email: string) => {
    const ok = await confirmDelete(email, "name");
    if (!ok) return;
    const body = emailList.filter((_, idx) => idx !== index);
    mutate(
      { body: { daftar_email: body } },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  const handleClose = () => {
    setIndexEdit(null);
    setDialog(null);
    form.reset();
  };

  useEffect(() => {
    if (indexEdit && emailList) {
      form.setValue("email", emailList[indexEdit - 1]);
    }
  }, [indexEdit, emailList]);

  return (
    <Card>
      <DialogDelete />
      <Dialog
        open={dialog === "create" || (dialog === "edit" && indexEdit !== null)}
        onOpenChange={(e) => {
          if (!e) handleClose();
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {dialog === "edit" ? "Edit Email" : "Tambah Email Baru"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              dialog === "create"
                ? form.handleSubmit(handleAddEmail)
                : form.handleSubmit(handleEditEmail)
            }
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="Email baru..."
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <DialogFooter>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant={"outline"}
                      onClick={handleClose}
                    >
                      <X className="size-3.5" />
                      Batal
                    </Button>
                  }
                />
                <Button type="submit">
                  {isUpdating ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  {dialog === "create" ? "Tambah" : "Perbarui"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
      <CardHeader className="flex w-full items-center justify-between">
        <CardTitle>List Email</CardTitle>
        <div className="flex items-center gap-2">
          <TooltipText
            value="Segarkan data"
            render={
              <Button
                size={"icon"}
                variant={"outline"}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          <TooltipText
            value="Tambah Email Baru"
            render={
              <Button
                disabled={isUpdating}
                size={"icon"}
                onClick={() => setDialog("create")}
              >
                {isUpdating ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center flex-col w-full border rounded-lg">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => <LoadingData key={i} />)
          ) : emailList.length === 0 ? (
            <EmptyData type="email" />
          ) : (
            emailList.map((email, index) => (
              <ItemData
                key={`${email}-${index}`}
                label={email}
                handleUp={() => handleReorder("up", index)}
                handleDown={() => handleReorder("down", index)}
                handleDelete={() => handleDelete(index, email)}
                handleEdit={() => {
                  setIndexEdit(index + 1);
                  setDialog("edit");
                }}
                isDisabled={isUpdating}
                isDisabledUp={index === 0}
                isDisabledDown={index === emailList.length - 1}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
