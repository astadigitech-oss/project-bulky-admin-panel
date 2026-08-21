"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  Edit,
  Eye,
  Package,
  ReceiptText,
  RefreshCw,
  Send,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useId, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import z from "zod";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, formatRupiah, numericString } from "@/lib/utils";
import { DropzonePDF } from "@/components/ui/dropzone-pdf";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useGetBrandSelect } from "@api/product/brands";
import { useGetSourceSelect } from "@api/product/sources";
import { useGetCategorySelect } from "@api/product/categories";
import { useGetPackageConditionSelect } from "@api/product/conditions/package";
import { useGetProductConditionSelect } from "@api/product/conditions/product";
import {
  useGetProductDetail,
  useMarkWmsCargoSynced,
  useUpdateProduct,
} from "@api/product/list";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { ImageSection } from "./_section/image";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipText } from "@/providers/tooltip-provider";
import { Spinner } from "@/components/ui/spinner";
import { CargoIdField } from "@/app/(main)/products/list/_components/cargo-id-field";
import { WmsCargoPricedItemType } from "@/app/(main)/products/list/_api/types";

const reference_ids = [
  {
    id: "cargo_1",
    name: "Bundle Cargo 1",
  },
  {
    id: "cargo_2",
    name: "Bundle Cargo 2",
  },
  {
    id: "cargo_3",
    name: "Bundle Cargo 3",
  },
];

const FILE_RULES = {
  docMimeTypes: ["application/pdf"],
  maxSize: 10 * 1024 * 1024,
};

const getOptionLabel = (value: unknown) => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const localized = value as {
      nama_id?: unknown;
      nama_en?: unknown;
      id?: unknown;
      en?: unknown;
      nama?: unknown;
    };

    if (typeof localized.nama === "string" && localized.nama.trim()) {
      return localized.nama;
    }
    if (typeof localized.nama_id === "string" && localized.nama_id.trim()) {
      return localized.nama_id;
    }
    if (typeof localized.id === "string" && localized.id.trim()) {
      return localized.id;
    }
    if (typeof localized.nama_en === "string" && localized.nama_en.trim()) {
      return localized.nama_en;
    }
    if (typeof localized.en === "string" && localized.en.trim()) {
      return localized.en;
    }

    if (localized.nama && typeof localized.nama === "object") {
      return getOptionLabel(localized.nama);
    }
  }

  return "";
};

const normalizeSelectOptions = <T extends { id?: unknown }>(items: T[]) =>
  items.filter((item) => typeof item.id === "string" && item.id.trim());

const getSelectId = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as { id?: unknown };
    if (typeof obj.id === "string") return obj.id;
  }
  return "";
};

const getSelectIds = (values: unknown[]) =>
  values
    .map((value) => getSelectId(value))
    .filter((value) => typeof value === "string" && value.trim());

export const formSchema = z.object({
  reference_id: z.string(),
  nama_id: z.string().min(1, "Nama ID tidak boleh kosong"),
  nama_en: z.string().min(1, "Nama EN tidak boleh kosong"),
  id_cargo: z.string().min(1, "Id Cargo tidak boleh kosong"),
  discrepancy: z.string().optional(),
  merek_id: z.array(z.object({ data: z.string() })),
  kategori_id: z.string().min(1, "Kategori id tidak boleh kosong"),
  kondisi_id: z.string().min(1, "Kondisi id tidak boleh kosong"),
  kondisi_paket_id: z.string().min(1, "Konsidi paket id tidak boleh kosong"),
  sumber_id: z.string().min(1, "Sumber id tidak boleh kosong"),
  harga_sebelum_diskon: z.string(),
  harga_sesudah_diskon: z.string(),
  quantity: z.string(),
  panjang: z.string(),
  lebar: z.string(),
  tinggi: z.string(),
  berat: z.string(),
  is_active: z.boolean(),
  dokumen: z
    .array(
      z
        .file()
        .max(FILE_RULES.maxSize, "Ukuran maksimal 10MB")
        .mime(FILE_RULES.docMimeTypes),
    )
    .max(1, "Hanya boleh 1 file")
    .optional(),
});

export const ProductIdClient = () => {
  const router = useRouter();
  const idFormProduct = useId();
  const anchor = useComboboxAnchor();
  const productId = useParams().productId as string;
  const [state, setState] = useQueryState("state", { defaultValue: "" });

  const {
    data: productDetail,
    refetch,
    isRefetching,
  } = useGetProductDetail({ id: productId });
  const detail = productDetail?.data;

  const { mutate, isPending } = useUpdateProduct();
  const { mutate: markWmsCargoSynced } = useMarkWmsCargoSynced();
  const [selectedCargo, setSelectedCargo] =
    useState<WmsCargoPricedItemType | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  const { data: brandSelectData, isSuccess: isSuccessBrand } =
    useGetBrandSelect();
  const { data: categorySelectData, isSuccess: isSuccessCategory } =
    useGetCategorySelect();
  const {
    data: packageConditionSelectData,
    isSuccess: isSuccessPackageCondition,
  } = useGetPackageConditionSelect();
  const {
    data: productConditionSelectData,
    isSuccess: isSuccessProductCondition,
  } = useGetProductConditionSelect();
  const { data: sourceSelectData, isSuccess: isSuccessSource } =
    useGetSourceSelect();

  const selectProduct = useMemo(() => {
    const rawBrand = normalizeSelectOptions(brandSelectData?.data ?? []);
    const rawCategory = normalizeSelectOptions(categorySelectData?.data ?? []);
    const rawPackageCondition = normalizeSelectOptions(
      packageConditionSelectData?.data ?? [],
    );
    const rawProductCondition = normalizeSelectOptions(
      productConditionSelectData?.data ?? [],
    );
    const rawSource = normalizeSelectOptions(sourceSelectData?.data ?? []);

    if (selectedCargo) {
      const catId =
        selectedCargo.bulky_category?.bulky_id ||
        selectedCargo.bulky_category?.id;
      if (
        catId &&
        !rawCategory.some(
          (c) =>
            c.id === catId ||
            (selectedCargo.bulky_category?.name &&
              getOptionLabel(c.nama).trim().toLowerCase() ===
                selectedCargo.bulky_category.name.trim().toLowerCase()),
        )
      ) {
        rawCategory.push({
          id: catId,
          nama: {
            id: selectedCargo.bulky_category?.name,
            en: selectedCargo.bulky_category?.name,
          },
        } as any);
      }
      const pCondId =
        selectedCargo.bulky_product_condition?.bulky_id ||
        selectedCargo.bulky_product_condition?.id;
      if (
        pCondId &&
        !rawProductCondition.some(
          (c) =>
            c.id === pCondId ||
            (selectedCargo.bulky_product_condition?.name &&
              getOptionLabel(c.nama).trim().toLowerCase() ===
                selectedCargo.bulky_product_condition.name
                  .trim()
                  .toLowerCase()),
        )
      ) {
        rawProductCondition.push({
          id: pCondId,
          nama: {
            id: selectedCargo.bulky_product_condition?.name,
            en: selectedCargo.bulky_product_condition?.name,
          },
        } as any);
      }
      const pkgCondId =
        selectedCargo.bulky_package_condition?.bulky_id ||
        selectedCargo.bulky_package_condition?.id;
      if (
        pkgCondId &&
        !rawPackageCondition.some(
          (c) =>
            c.id === pkgCondId ||
            (selectedCargo.bulky_package_condition?.name &&
              getOptionLabel(c.nama).trim().toLowerCase() ===
                selectedCargo.bulky_package_condition.name
                  .trim()
                  .toLowerCase()),
        )
      ) {
        rawPackageCondition.push({
          id: pkgCondId,
          nama: {
            id: selectedCargo.bulky_package_condition?.name,
            en: selectedCargo.bulky_package_condition?.name,
          },
        } as any);
      }
      const srcId =
        selectedCargo.bulky_product_source?.bulky_id ||
        selectedCargo.bulky_product_source?.id;
      if (
        srcId &&
        !rawSource.some(
          (s) =>
            s.id === srcId ||
            (selectedCargo.bulky_product_source?.name &&
              getOptionLabel(s.nama).trim().toLowerCase() ===
                selectedCargo.bulky_product_source.name.trim().toLowerCase()),
        )
      ) {
        rawSource.push({
          id: srcId,
          nama: {
            id: selectedCargo.bulky_product_source?.name,
            en: selectedCargo.bulky_product_source?.name,
          },
        } as any);
      }
      if (selectedCargo.bulky_brands) {
        for (const b of selectedCargo.bulky_brands) {
          const brandId = b.bulky_id || b.id;
          if (
            brandId &&
            !rawBrand.some(
              (rb) =>
                rb.id === brandId ||
                (b.name &&
                  getOptionLabel(rb.nama).trim().toLowerCase() ===
                    b.name.trim().toLowerCase()),
            )
          ) {
            rawBrand.push({
              id: brandId,
              nama: b.name,
            } as any);
          }
        }
      }
    }

    return {
      brand: rawBrand,
      category: rawCategory,
      packageCondition: rawPackageCondition,
      productCondition: rawProductCondition,
      source: rawSource,
    };
  }, [
    brandSelectData,
    categorySelectData,
    packageConditionSelectData,
    productConditionSelectData,
    sourceSelectData,
    selectedCargo,
  ]);

  const isSuccessAllSelect =
    isSuccessBrand &&
    isSuccessCategory &&
    isSuccessPackageCondition &&
    isSuccessProductCondition &&
    isSuccessSource;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      nama_en: detail?.nama_en ?? "",
      nama_id: detail?.nama_id ?? "",
      discrepancy: detail?.discrepancy ?? "",
      id_cargo: detail?.id_cargo ?? "",
      reference_id: detail?.reference_id ?? "",
      kategori_id: detail ? detail.kategori.id : "",
      kondisi_id: detail ? detail.kondisi.id : "",
      kondisi_paket_id: detail ? detail.kondisi_paket.id : "",
      sumber_id: detail?.sumber?.id ?? "",
      harga_sebelum_diskon: detail
        ? detail.harga_sebelum_diskon.toString()
        : "0",
      harga_sesudah_diskon: detail
        ? detail.harga_sesudah_diskon.toString()
        : "0",
      quantity: detail ? detail.quantity.toString() : "0",
      panjang: detail ? detail.panjang.toString() : "0",
      lebar: detail ? detail.lebar.toString() : "0",
      tinggi: detail ? detail.tinggi.toString() : "0",
      berat: detail ? detail.berat.toString() : "0",
      is_active: detail?.is_active ?? false,
      merek_id:
        detail && detail.mereks.length > 0
          ? detail.mereks.map((m) => ({ data: m.id }))
          : [],
      dokumen: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    body.append("nama_en", values.nama_en);
    body.append("nama_id", values.nama_id);
    if (values.discrepancy) {
      body.append("discrepancy", values.discrepancy);
    }
    body.append("id_cargo", values.id_cargo);
    // body.append("reference_id", values.reference_id);
    body.append("kategori_id", values.kategori_id);
    body.append("kondisi_id", values.kondisi_id);
    body.append("kondisi_paket_id", values.kondisi_paket_id);
    body.append("sumber_id", values.sumber_id);
    body.append("harga_sebelum_diskon", values.harga_sebelum_diskon);
    body.append("harga_sesudah_diskon", values.harga_sesudah_diskon);
    body.append("quantity", values.quantity);
    body.append("panjang", values.panjang);
    body.append("tinggi", values.tinggi);
    body.append("lebar", values.lebar);
    body.append("berat", values.berat);
    body.append("is_active", values.is_active.toString());
    if (values.merek_id && values.merek_id.length > 0) {
      for (const m of values.merek_id) {
        body.append("merek_id", m.data);
      }
    }
    if (values.dokumen && values.dokumen.length > 0) {
      for (const d of values.dokumen) {
        body.append("dokumen[]", d);
      }
    }

    console.log(
      "[PRODUCT_EDIT][PUT] form-data payload:",
      Array.from(body.entries()),
    );

    mutate(
      { body, params: { id: productId } },
      {
        onSuccess: () => {
          // Kalau id_cargo dipilih dari dropdown WMS (bukan manual), tandai
          // cargo tsb sudah dikonfirmasi sinkron di WMS. Idempotent — aman
          // kalau gagal, tidak menghalangi navigasi ke halaman detail produk.
          if (selectedCargoId) {
            markWmsCargoSynced({ params: { id: selectedCargoId } });
          }
          router.push(`/products/list/${productId}`);
        },
      },
    );
  };

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "merek_id",
  });

  const [
    hargaSebelumDiskon,
    hargaSetelahDiskon,
    quantity,
    panjang,
    tinggi,
    lebar,
    berat,
    isActive,
  ] = useWatch({
    control: form.control,
    name: [
      "harga_sebelum_diskon",
      "harga_sesudah_diskon",
      "quantity",
      "panjang",
      "tinggi",
      "lebar",
      "berat",
      "is_active",
    ],
  });

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Link href={"/products/list"}>
            <Button variant={"ghost"} size={"icon-lg"}>
              <Package className="size-5" />
            </Button>
          </Link>
          <ChevronRight className="size-4" />
          <h1 className="leading-none font-semibold text-2xl">Edit Produk</h1>
        </div>
        <div className="flex items-center gap-3">
          <TooltipText
            value="Detail Produk"
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
            value="Detail Produk"
            render={
              <Link href={`/products/list/${productId}`}>
                <Button variant={"outline"} size={"icon"}>
                  <ReceiptText className="size-3.5" />
                </Button>
              </Link>
            }
          />
        </div>
      </div>
      <Separator />
      {state === "image" ? (
        <ImageSection detail={detail} setState={setState} />
      ) : (
        <FieldGroup className="grid gap-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between w-full px-4 bg-gray-100 dark:bg-gray-800 h-16">
              <p className="font-semibold">Gambar</p>
              <Button
                size={"sm"}
                className={"text-xs"}
                onClick={() => setState("image")}
              >
                <Edit className="size-3" />
                Edit Gambar
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-3 w-full p-4">
              {detail
                ? detail?.gambar.map((item, idx) => (
                    <Dialog key={item.id}>
                      <DialogTrigger
                        render={
                          <Button
                            className={cn(
                              "relative w-full aspect-square rounded-md overflow-hidden shadow border border-gray-300/70 dark:border-gray-300/30 p-0 from-white to-white dark:from-black dark:to-black hover:from-white hover:to-white hover:dark:from-black hover:dark:to-black h-auto group",
                              idx === 0 && "col-span-2 row-span-2",
                            )}
                          >
                            <div className="size-full bg-black/10 dark:bg-white/10 backdrop-blur-sm z-10 group-hover:flex items-center justify-center rounded-md hidden">
                              <div className="size-8 rounded-full bg-white dark:bg-black dark:text-white flex items-center justify-center">
                                <Eye className="size-4" />
                              </div>
                            </div>
                            <Image
                              src={item.gambar_url}
                              alt={`${detail.nama_id}_${item.id}`}
                              fill
                              className="object-cover"
                              loading="eager"
                            />
                          </Button>
                        }
                      />
                      <DialogContent
                        showCloseButton={false}
                        className={"h-[80vh] min-w-[80vh]"}
                      >
                        <DialogHeader>
                          <DialogTitle>Pratinjau Gambar Produk</DialogTitle>
                        </DialogHeader>
                        <div className="size-full relative aspect-square rounded-md overflow-hidden border shadow">
                          <Image
                            src={item.gambar_url}
                            alt={`${detail.nama_id}_${item.id}`}
                            fill
                            className="object-cover"
                            loading="eager"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose
                            render={
                              <Button>
                                <XIcon /> Tutup
                              </Button>
                            }
                          />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ))
                : Array.from({ length: 10 }, (_, i) => (
                    <Skeleton
                      key={i}
                      className={cn(
                        "w-full aspect-square",
                        i === 0 && "col-span-2 row-span-2",
                      )}
                    />
                  ))}
            </div>
          </div>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-800 overflow-hidden gap-4"
          >
            <div className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 h-16">
              <p className="font-semibold">Data</p>
            </div>
            {detail && isSuccessAllSelect ? (
              <div className="max-w-3xl mx-auto grid w-full gap-6 px-4">
                {/* <Controller
                  control={form.control}
                  name="reference_id"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Produk Bundel
                      </FieldLabel>
                      <Combobox
                        autoHighlight
                        id={`${idFormProduct}_${field.name}`}
                        items={reference_ids}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
                        isItemEqualToValue={(
                          itemValue: any,
                          selectedValue: any,
                        ) => {
                          if (
                            (itemValue as (typeof reference_ids)[number]).id ===
                            selectedValue
                          ) {
                            return true;
                          }
                          return itemValue === selectedValue;
                        }}
                        itemToStringLabel={(v: string) =>
                          reference_ids.find((i) => i.id === v)?.name ?? ""
                        }
                        aria-invalid={fieldState.invalid}
                      >
                        <ComboboxInput placeholder="Pilih produk bundel..." />
                        <ComboboxContent>
                          <ComboboxEmpty>No items found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item: (typeof reference_ids)[number]) => (
                              <ComboboxItem key={item.id} value={item.id}>
                                {item.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}
                <Controller
                  name="id_cargo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <CargoIdField
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      error={fieldState.error}
                      idFor={`${idFormProduct}_${field.name}`}
                      currentCode={detail?.id_cargo}
                      onSelectCargo={(cargo) => {
                        setSelectedCargo(cargo);
                        setSelectedCargoId(cargo?.id ?? null);
                      }}
                    />
                  )}
                />
                <Controller
                  name="dokumen"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel required>Dokumen PDF</FieldLabel>
                      <DropzonePDF
                        onChange={field.onChange}
                        value={field.value}
                        oldValue={detail?.dokumen[0]?.file_url ?? ""}
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid lg:grid-cols-2 items-end gap-2 lg:gap-6">
                  <Controller
                    name="nama_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Nama
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="text"
                            aria-invalid={fieldState.invalid}
                            placeholder="Nama produk..."
                            autoComplete="off"
                          />
                          <InputGroupAddon>
                            <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                              <ID />
                            </div>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="nama_en"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="text"
                            aria-invalid={fieldState.invalid}
                            placeholder="Product name..."
                            autoComplete="off"
                          />
                          <InputGroupAddon>
                            <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                              <GB />
                            </div>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="discrepancy"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Discrepancy (Persen)
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={`${idFormProduct}_${field.name}`}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) =>
                            field.onChange(numericString(e.target.value))
                          }
                          aria-invalid={fieldState.invalid}
                          placeholder="cth. 10"
                          autoComplete="off"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Separator />
                <Field className="gap-1 col-span-full">
                  <FieldLabel required htmlFor={`${idFormProduct}_brand`}>
                    Merek
                  </FieldLabel>
                  <Combobox
                    id={`${idFormProduct}_brand`}
                    multiple
                    autoHighlight
                    items={selectProduct.brand}
                    value={fields.map((f) => f.data)}
                    onValueChange={(e) =>
                      replace(getSelectIds(e).map((id) => ({ data: id })))
                    }
                    isItemEqualToValue={(i: any, s: any) => {
                      if ((i as (typeof selectProduct.brand)[number]).id) {
                        return (
                          (i as (typeof selectProduct.brand)[number]).id === s
                        );
                      }
                      return i === s;
                    }}
                  >
                    <ComboboxChips
                      ref={anchor}
                      className="w-full bg-transparent dark:bg-transparent"
                    >
                      <ComboboxValue>
                        {(values) => (
                          <React.Fragment>
                            {values.map((value: any, index: number) => {
                              const valId = getSelectId(value);
                              return (
                                <ComboboxChip
                                  key={valId || `brand-chip-${index}`}
                                >
                                  {getOptionLabel(
                                    selectProduct.brand.find(
                                      (i) => i.id === (valId || value),
                                    )?.nama ??
                                      value?.nama ??
                                      value,
                                  )}
                                </ComboboxChip>
                              );
                            })}
                            <ComboboxChipsInput
                              className={"placeholder:text-xs bg-transparent"}
                              placeholder="Pilih merek..."
                            />
                          </React.Fragment>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor}>
                      <ComboboxEmpty>No items found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: (typeof selectProduct.brand)[number]) => (
                          <ComboboxItem key={item.id} value={item.id}>
                            {getOptionLabel(
                              selectProduct.brand.find((i) => i.id === item.id)
                                ?.nama,
                            )}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
                <div className="grid lg:grid-cols-2 items-end gap-2 lg:gap-6">
                  <Controller
                    control={form.control}
                    name="kategori_id"
                    render={({ field, fieldState }) => {
                      const categories = selectProduct.category;
                      return (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${idFormProduct}_${field.name}`}
                          >
                            Kategori
                          </FieldLabel>
                          <Combobox
                            autoHighlight
                            id={`${idFormProduct}_${field.name}`}
                            items={categories}
                            value={field.value}
                            onValueChange={(e) => {
                              field.onChange(getSelectId(e));
                            }}
                            isItemEqualToValue={(
                              itemValue: any,
                              selectedValue: any,
                            ) => {
                              const itemId = getSelectId(itemValue);
                              const selId = getSelectId(selectedValue);
                              if (itemId && selId) return itemId === selId;
                              return itemValue === selectedValue;
                            }}
                            itemToStringLabel={(v: any) => {
                              const valId = getSelectId(v);
                              return (
                                getOptionLabel(
                                  categories.find((i) => i.id === (valId || v))
                                    ?.nama,
                                ) || getOptionLabel(v)
                              );
                            }}
                            filter={(itemValue: any, query: any) => {
                              return getOptionLabel(
                                (itemValue as (typeof categories)[number]).nama,
                              )
                                .toLowerCase()
                                .includes(query.toLowerCase());
                            }}
                            aria-invalid={fieldState.invalid}
                          >
                            <ComboboxInput placeholder="Pilih kategori..." />
                            <ComboboxContent>
                              <ComboboxEmpty>No items found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item: (typeof categories)[number]) => (
                                  <ComboboxItem key={item.id} value={item.id}>
                                    {getOptionLabel(item.nama)}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="kondisi_id"
                    render={({ field, fieldState }) => {
                      const productCondition = selectProduct.productCondition;
                      return (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${idFormProduct}_${field.name}`}
                          >
                            Kondisi Produk
                          </FieldLabel>
                          <Combobox
                            autoHighlight
                            id={`${idFormProduct}_${field.name}`}
                            items={productCondition}
                            value={field.value}
                            onValueChange={(e) =>
                              field.onChange(getSelectId(e))
                            }
                            isItemEqualToValue={(
                              itemValue: any,
                              selectedValue: any,
                            ) => {
                              const itemId = getSelectId(itemValue);
                              const selId = getSelectId(selectedValue);
                              if (itemId && selId) return itemId === selId;
                              return itemValue === selectedValue;
                            }}
                            itemToStringLabel={(v: any) => {
                              const valId = getSelectId(v);
                              return (
                                getOptionLabel(
                                  productCondition.find(
                                    (i) => i.id === (valId || v),
                                  )?.nama,
                                ) || getOptionLabel(v)
                              );
                            }}
                            filter={(itemValue: any, query: any) => {
                              return getOptionLabel(
                                (itemValue as (typeof productCondition)[number])
                                  .nama,
                              )
                                .toLowerCase()
                                .includes(query.toLowerCase());
                            }}
                            aria-invalid={fieldState.invalid}
                          >
                            <ComboboxInput placeholder="Pilih kondisi produk..." />
                            <ComboboxContent>
                              <ComboboxEmpty>No items found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item: (typeof productCondition)[number]) => (
                                  <ComboboxItem key={item.id} value={item.id}>
                                    {getOptionLabel(item.nama)}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="kondisi_paket_id"
                    render={({ field, fieldState }) => {
                      const packageCondition = selectProduct.packageCondition;
                      return (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${idFormProduct}_${field.name}`}
                          >
                            Kondisi Paket
                          </FieldLabel>
                          <Combobox
                            autoHighlight
                            id={`${idFormProduct}_${field.name}`}
                            items={packageCondition}
                            value={field.value}
                            onValueChange={(e) =>
                              field.onChange(getSelectId(e))
                            }
                            isItemEqualToValue={(
                              itemValue: any,
                              selectedValue: any,
                            ) => {
                              const itemId = getSelectId(itemValue);
                              const selId = getSelectId(selectedValue);
                              if (itemId && selId) return itemId === selId;
                              return itemValue === selectedValue;
                            }}
                            itemToStringLabel={(v: any) => {
                              const valId = getSelectId(v);
                              return (
                                getOptionLabel(
                                  packageCondition.find(
                                    (i) => i.id === (valId || v),
                                  )?.nama,
                                ) || getOptionLabel(v)
                              );
                            }}
                            filter={(itemValue: any, query: any) => {
                              return getOptionLabel(
                                (itemValue as (typeof packageCondition)[number])
                                  .nama,
                              )
                                .toLowerCase()
                                .includes(query.toLowerCase());
                            }}
                            aria-invalid={fieldState.invalid}
                          >
                            <ComboboxInput placeholder="Pilih kondisi paket..." />
                            <ComboboxContent>
                              <ComboboxEmpty>No items found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item: (typeof packageCondition)[number]) => (
                                  <ComboboxItem key={item.id} value={item.id}>
                                    {getOptionLabel(item.nama)}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="sumber_id"
                    render={({ field, fieldState }) => {
                      const source = selectProduct.source;
                      return (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${idFormProduct}_${field.name}`}
                          >
                            Sumber
                          </FieldLabel>
                          <Combobox
                            autoHighlight
                            id={`${idFormProduct}_${field.name}`}
                            items={source}
                            value={field.value}
                            onValueChange={(e) =>
                              field.onChange(getSelectId(e))
                            }
                            isItemEqualToValue={(
                              itemValue: any,
                              selectedValue: any,
                            ) => {
                              const itemId = getSelectId(itemValue);
                              const selId = getSelectId(selectedValue);
                              if (itemId && selId) return itemId === selId;
                              return itemValue === selectedValue;
                            }}
                            itemToStringLabel={(v: any) => {
                              const valId = getSelectId(v);
                              return (
                                getOptionLabel(
                                  source.find((i) => i.id === (valId || v))
                                    ?.nama,
                                ) || getOptionLabel(v)
                              );
                            }}
                            filter={(itemValue: any, query: any) => {
                              return getOptionLabel(
                                (itemValue as (typeof source)[number]).nama,
                              )
                                .toLowerCase()
                                .includes(query.toLowerCase());
                            }}
                            aria-invalid={fieldState.invalid}
                          >
                            <ComboboxInput placeholder="Pilih sumber..." />
                            <ComboboxContent>
                              <ComboboxEmpty>No items found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item: (typeof source)[number]) => (
                                  <ComboboxItem key={item.id} value={item.id}>
                                    {getOptionLabel(item.nama)}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
                <Separator />
                <div className="grid lg:grid-cols-3 items-end gap-2 lg:gap-6">
                  <Controller
                    name="harga_sebelum_diskon"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Harga Sebelum Diskon
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon>
                            <InputGroupText>Rp</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {formatRupiah(hargaSebelumDiskon)}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="harga_sesudah_diskon"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Harga Setelah Diskon
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon>
                            <InputGroupText>Rp</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {formatRupiah(hargaSetelahDiskon)}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Jumlah Item dalam Palet
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {Number.parseFloat(quantity).toLocaleString(
                                "id-ID",
                              )}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Separator />
                <div className="grid lg:grid-cols-3 items-end gap-2 lg:gap-6">
                  <Controller
                    name="panjang"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Panjang
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {Number.parseFloat(panjang).toLocaleString(
                                "id-ID",
                              )}{" "}
                              cm
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="tinggi"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Tinggi
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {Number.parseFloat(tinggi).toLocaleString(
                                "id-ID",
                              )}{" "}
                              cm
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lebar"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Lebar
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {Number.parseFloat(lebar).toLocaleString("id-ID")}{" "}
                              cm
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-2 items-end gap-2 lg:gap-6">
                  <Controller
                    name="berat"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idFormProduct}_${field.name}`}
                        >
                          Berat
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={`${idFormProduct}_${field.name}`}
                            type="number"
                            onChange={(e) =>
                              field.onChange(numericString(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="cth. 1000000"
                            autoComplete="off"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs font-light">
                              {Number.parseFloat(berat).toLocaleString("id-ID")}{" "}
                              kg
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field className="gap-1">
                    <FieldLabel>Volume</FieldLabel>
                    <div className="h-8 rounded-lg border w-full border-gray-300 dark:border-gray-300/50 flex items-center gap-2 text-xs px-3">
                      {(
                        Number.parseFloat(panjang ?? "0") *
                        Number.parseFloat(lebar ?? "0") *
                        Number.parseFloat(tinggi ?? "0")
                      ).toLocaleString("id-ID")}{" "}
                      cm&sup3; /{" "}
                      {(
                        (Number.parseFloat(panjang ?? "0") *
                          Number.parseFloat(lebar ?? "0") *
                          Number.parseFloat(tinggi ?? "0")) /
                        1_000_000
                      ).toLocaleString("id-ID")}{" "}
                      m&sup3;
                    </div>
                  </Field>
                </div>
                <Separator />
                <Controller
                  name="is_active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1 h-8 flex items-center! border px-3 rounded-md border-gray-300 dark:border-gray-300/50"
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={`${idFormProduct}-${field.name}`}>
                          Status Product
                          <Badge
                            className={cn(
                              "py-0 h-4 rounded px-1 text-black",
                              isActive
                                ? "bg-green-200 dark:bg-green-400"
                                : "bg-red-200 dark:bg-red-400",
                            )}
                          >
                            {isActive ? "Publish" : "Draft"}
                          </Badge>
                        </FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                      <Switch
                        id={`${idFormProduct}-${field.name}`}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        size="sm"
                        className={
                          "data-checked:bg-emerald-500 data-unchecked:bg-red-500 dark:data-checked:bg-emerald-500 dark:data-unchecked:bg-red-500"
                        }
                      />
                    </Field>
                  )}
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto grid w-full gap-6 px-4">
                <Skeleton className="h-80 w-full" />
              </div>
            )}
            <div className="bg-gray-100 dark:bg-gray-800 flex items-center h-20 w-full justify-end p-4">
              <Button
                type="submit"
                className={"w-fit"}
                disabled={isPending || !isSuccessAllSelect}
              >
                {isPending ? <Spinner /> : <Send />}
                {isPending ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </form>
        </FieldGroup>
      )}
    </div>
  );
};
