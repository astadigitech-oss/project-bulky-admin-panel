"use client";

import React, { useEffect, useId, useState, useTransition } from "react";
import {
  useDeleteBuyer,
  useGetBuyerDetail,
  useResetPasswordBuyer,
} from "../../_api";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn, formatImageAlt, sizesImage } from "@/lib/utils";
import { Separator } from "@/components/ui/separator-extended";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CircleAlertIcon,
  Map,
  MapPinned,
  MapPinOff,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash,
  User2,
  X,
} from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputPassword } from "@/components/ui/input-password";
import { Spinner } from "@/components/ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formSchema = z.object({
  new_password: z.string().min(8, "Password harus memiliki minimal 8 karakter"),
  confirm_password: z
    .string()
    .min(8, "Password harus memiliki minimal 8 karakter"),
});

export const CustomerDetailClient = () => {
  const idFormCustomerDetail = useId();
  const customerId = useParams().customerId;
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: { new_password: "", confirm_password: "" },
  });

  const { mutate: deleteBuyer, isPending: isDeleting } = useDeleteBuyer();
  const { mutate: resetPassword, isPending: isReseting } =
    useResetPasswordBuyer();

  const { data, refetch, isRefetching, isPending } = useGetBuyerDetail({
    id: customerId as string,
  });
  const customer = data?.data;
  const isDisable = isDeleting || isPending;

  const handleDelete = async () => {
    const ok = await confirmDelete(customer?.nama, "user");
    if (!ok) return;
    deleteBuyer(
      { params: { id: customerId as string } },
      {
        onSuccess: () => {
          startTransition(() => {
            router.push("/customers");
          });
        },
      },
    );
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    resetPassword(
      { body: values, params: { id: customerId as string } },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  useEffect(() => {
    if (isNavigating) toast.success("Mengalihkan ke halaman pelanggan");
  }, [isNavigating]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <div className="flex items-center gap-2">
        <Link href={"/customers"}>
          <Button variant={"ghost"} size={"icon-lg"}>
            <User2 className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">
          Detail Pelanggan
        </h1>
      </div>
      <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0">
        <div className="p-4 flex items-center gap-4 bg-gray-50 dark:bg-transparent">
          <div className="flex items-center justify-between gap-4">
            <div className="size-16 rounded-md border overflow-hidden relative shadow">
              <Image
                src={customer?.foto_url ?? "/assets/images/logo-bulky.webp"}
                alt={formatImageAlt(customer?.nama ?? "")}
                sizes={sizesImage}
                className="object-cover"
                fill
              />
            </div>
            <p className="text-xl font-semibold">{customer?.nama}</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Dialog open={open} onOpenChange={setOpen}>
              <TooltipText
                value="Ganti Password"
                render={
                  <DialogTrigger
                    render={
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        disabled={isRefetching || isDisable}
                      >
                        <ShieldCheck />
                      </Button>
                    }
                  />
                }
              />
              <DialogContent showCloseButton={false} className={"min-w-lg"}>
                <DialogHeader>
                  <DialogTitle>Ganti Kata Sandi Pelanggan</DialogTitle>
                </DialogHeader>
                <Alert className="border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <CircleAlertIcon />
                  <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                    Penggantian password wajib seizin pelanggan dan harus segera
                    diberitahukan kepada yang bersangkutan setelah diproses.
                  </AlertDescription>
                </Alert>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <FieldGroup className="grid md:grid-cols-6 gap-4">
                    <Controller
                      name="new_password"
                      control={form.control}
                      disabled={isReseting}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1 col-span-full"
                        >
                          <FieldLabel
                            required
                            htmlFor={`${idFormCustomerDetail}-${field.name}`}
                          >
                            Password
                          </FieldLabel>
                          <InputPassword
                            {...field}
                            id={`${idFormCustomerDetail}-${field.name}`}
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
                      disabled={isReseting}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1 col-span-full"
                        >
                          <FieldLabel
                            required
                            htmlFor={`${idFormCustomerDetail}-${field.name}`}
                          >
                            Confirm Password
                          </FieldLabel>
                          <InputPassword
                            {...field}
                            id={`${idFormCustomerDetail}-${field.name}`}
                            aria-invalid={fieldState.invalid}
                            autoComplete="new-password"
                          />

                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <DialogFooter>
                    <Button
                      disabled={isReseting}
                      type="button"
                      variant={"outline"}
                      onClick={handleClose}
                    >
                      <X className="size-3.5" />
                      Batal
                    </Button>
                    <Button disabled={isReseting} type="submit">
                      {isReseting ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      {isReseting ? "Mengirim..." : "Kirim"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <TooltipText
              value="Muat ulang"
              render={
                <Button
                  variant={"outline"}
                  size={"icon"}
                  onClick={() => refetch()}
                  disabled={isRefetching || isDisable}
                >
                  <RefreshCw className={cn(isRefetching && "animate-spin")} />
                </Button>
              }
            />
            <TooltipText
              value="Hapus"
              render={
                <Button
                  variant={"outlineDestructive"}
                  size={"icon"}
                  onClick={handleDelete}
                  disabled={isDisable}
                >
                  <Trash />
                </Button>
              }
            />
          </div>
        </div>
        <Separator
          variant={"dashed"}
          className={"border-gray-300/80 dark:border-gray-600/70"}
        />
        <div className="dark:bg-gray-950/60 p-4 grid grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">Username</p>
            <p className="text-xs font-light h-7 items-center flex">
              {customer?.username}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">Email</p>
            <p className="text-xs font-light h-7 items-center flex">
              {customer?.email}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">No. Telepon</p>
            <p className="text-xs font-light h-7 items-center flex">
              {customer?.telepon}
            </p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0">
            <CardHeader className="p-4 bg-gray-50 dark:bg-transparent">
              <CardTitle className="flex items-center gap-4">
                <MapPinned className="size-5" />
                Alamat Pelanggan
              </CardTitle>
            </CardHeader>
            <Separator
              variant={"dashed"}
              className={"border-gray-300/80 dark:border-gray-600/70"}
            />
            <div className="p-4 dark:bg-gray-950/60">
              {customer?.alamat && customer?.alamat?.length > 0 ? (
                <Accordion className="w-full mx-auto space-y-2">
                  {customer?.alamat.map((address) => (
                    <AccordionItem
                      key={address.id}
                      value={`${address.id}-1`}
                      className={"data-open:border-0"}
                    >
                      <AccordionTrigger className="py-3 px-5 text-base items-center">
                        <div className="flex items-center gap-3">
                          <Map className="size-4" />
                          <ChevronRight className="size-4" />
                          {address.nama_penerima}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="relative flex flex-col gap-4 px-5 pl-13 bg-gray-100 dark:bg-gray-800 py-4 rounded-md [&_p:not(:last-child)]:mb-0">
                        <div className="flex flex-col gap-0 group">
                          <p className="text-xs leading-relaxed font-medium text-gray-500 dark:text-gray-300/70">
                            No. Telepon:
                          </p>
                          <p className="text-sm leading-relaxed group-hover:underline group-hover:underline-offset-2">
                            {address.telepon_penerima}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0 group">
                          <p className="text-xs leading-relaxed font-medium text-gray-500 dark:text-gray-300/70">
                            Detail Alamat:
                          </p>
                          <p className="text-sm leading-relaxed group-hover:underline group-hover:underline-offset-2">
                            {address.catatan}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0 group">
                          <p className="text-xs leading-relaxed font-medium text-gray-500 dark:text-gray-300/70">
                            Alamat:
                          </p>
                          <p className="text-sm leading-relaxed group-hover:underline group-hover:underline-offset-2">
                            {address.alamat_formatted}
                          </p>
                        </div>
                        <div className="w-px h-full absolute left-7.5 inset-y-0 border-l border-dashed dark:border-gray-500" />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md font-medium flex items-center justify-center gap-3 text-sm">
                  <MapPinOff className="size-4" />
                  Tidak ada alamat yang tersedia
                </div>
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0">
            <CardHeader className="p-4 bg-gray-50 dark:bg-transparent">
              <CardTitle>Pesanan Pelanggan</CardTitle>
            </CardHeader>
            <Separator
              variant={"dashed"}
              className={"border-gray-300/80 dark:border-gray-600/70"}
            />
            <div className="p-4 dark:bg-gray-950/60">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md font-medium flex items-center justify-center">
                Tidak ada pesanan yang tersedia
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
