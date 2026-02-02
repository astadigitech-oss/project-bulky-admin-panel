"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Plus,
  RefreshCw,
  Send,
  Trash,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipText } from "@/providers/tooltip-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
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
                      onClick={() => {
                        setIndexEdit(null);
                        setDialog(null);
                        form.reset();
                      }}
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
            Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 w-full border-b last:border-0 border-gray-300 dark:border-gray-500/50 h-10 pl-5 pr-1"
              >
                <div className="w-full flex items-center relative before:content-[''] before:absolute before:-left-2.5 before:w-1 before:h-6 before:rounded-full before:bg-yellow-400">
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-4 w-1/5 mr-2" />
              </div>
            ))
          ) : emailList.length === 0 ? (
            <div className="flex items-center justify-center w-full h-42">
              <p className="text-gray-500 dark:text-gray-400">
                No emails found
              </p>
            </div>
          ) : (
            emailList.map((email, index) => (
              <div
                key={`${email}-${index}`}
                className="flex items-center justify-between gap-4 w-full border-b last:border-0 border-gray-300 dark:border-gray-500/50 h-10 pl-5 pr-1"
              >
                <p className="h-8 text-sm items-center flex whitespace-pre-wrap relative before:content-[''] before:absolute before:-left-2.5 before:w-1 before:h-6 before:rounded-full before:bg-yellow-400">
                  {email}
                </p>
                <ButtonGroup className="[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md!">
                  <Button
                    variant={"ghost"}
                    size={"icon-sm"}
                    className={"rounded-l-md!"}
                    disabled={index === 0}
                    onClick={() => handleReorder("up", index)}
                  >
                    {isUpdating ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant={"ghost"}
                    size={"icon-sm"}
                    disabled={index === emailList.length - 1}
                    onClick={() => handleReorder("down", index)}
                  >
                    {isUpdating ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant={"ghost"}
                    type="button"
                    size={"icon-sm"}
                    onClick={() => {
                      setIndexEdit(index + 1);
                      setDialog("edit");
                    }}
                  >
                    {isUpdating ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <Edit2 className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant={"ghostDestructive"}
                    size={"icon-sm"}
                    className={"rounded-r-md!"}
                    onClick={() => handleDelete(index, email)}
                  >
                    {isUpdating ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <Trash className="size-3.5" />
                    )}
                  </Button>
                </ButtonGroup>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
