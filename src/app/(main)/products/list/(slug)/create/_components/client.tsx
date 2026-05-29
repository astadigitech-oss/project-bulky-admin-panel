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
import { DropzoneList } from "@/components/ui/dropzone-list";
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
import { ChevronRight, Package, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useId } from "react";
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
import { useGetCategorySelect } from "@api/product/categories";
import { useGetPackageConditionSelect } from "@api/product/conditions/package";
import { useGetProductConditionSelect } from "@api/product/conditions/product";
import { useGetSourceSelect } from "@api/product/sources";
import { useCreateProduct } from "@api/product/list";
import { Spinner } from "@/components/ui/spinner";

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

export const FILE_RULES = {
  imageMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
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

const formSchema = z.object({
  reference_id: z.string().optional(),
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
  gambar: z
    .array(
      z
        .file()
        .max(FILE_RULES.maxSize, "Ukuran maksimal 10MB")
        .mime(FILE_RULES.imageMimeTypes),
    )
    .min(1, "Gambar wajib diunggah")
    .max(10, "Hanya boleh 10 file"),
});

export const ProductIdClient = () => {
  const anchor = useComboboxAnchor();
  const idFormProduct = useId();
  const router = useRouter();

  const { mutate, isPending } = useCreateProduct();

  const { data: brandSelectData } = useGetBrandSelect();
  const { data: categorySelectData } = useGetCategorySelect();
  const { data: packageConditionSelectData } = useGetPackageConditionSelect();
  const { data: productConditionSelectData } = useGetProductConditionSelect();
  const { data: sourceSelectData } = useGetSourceSelect();

  const selectProduct = {
    brand: normalizeSelectOptions(brandSelectData?.data ?? []),
    category: normalizeSelectOptions(categorySelectData?.data ?? []),
    packageCondition: normalizeSelectOptions(
      packageConditionSelectData?.data ?? [],
    ),
    productCondition: normalizeSelectOptions(
      productConditionSelectData?.data ?? [],
    ),
    source: normalizeSelectOptions(sourceSelectData?.data ?? []),
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      nama_en: "",
      nama_id: "",
      discrepancy: "",
      id_cargo: "",
      reference_id: "",
      kategori_id: "",
      kondisi_id: "",
      kondisi_paket_id: "",
      sumber_id: "",
      harga_sebelum_diskon: "0",
      harga_sesudah_diskon: "0",
      quantity: "0",
      panjang: "0",
      lebar: "0",
      tinggi: "0",
      berat: "0",
      is_active: false,
      merek_id: [],
      gambar: [],
      dokumen: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    body.append("nama_en", values.nama_en);
    body.append("nama_id", values.nama_id);
    body.append("discrepancy", values.discrepancy ?? "");
    body.append("id_cargo", values.id_cargo);
    body.append("reference_id", values.reference_id ?? "");
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
    if (values.gambar && values.gambar.length > 0) {
      for (const g of values.gambar) {
        body.append("gambar[]", g);
      }
    }
    if (values.dokumen && values.dokumen.length > 0) {
      for (const d of values.dokumen) {
        body.append("dokumen[]", d);
      }
    }

    console.log(
      "[PRODUCT_CREATE][POST] form-data payload:",
      Array.from(body.entries()),
    );

    mutate({ body }, { onSuccess: () => router.push("/products/list") });
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
      <div className="flex items-center gap-2">
        <Link href={"/products/list"}>
          <Button variant={"ghost"} size={"icon-lg"}>
            <Package className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">Tambah Produk</h1>
      </div>
      <Separator />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="grid gap-6 w-full max-w-5xl mx-auto">
          <Controller
            control={form.control}
            name="gambar"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Gambar</FieldLabel>
                <DropzoneList
                  onChange={field.onChange}
                  value={field.value}
                  error={fieldState.invalid}
                  accept={Object.fromEntries(
                    FILE_RULES.imageMimeTypes.map((m) => [m, []]),
                  )}
                  maxSize={FILE_RULES.maxSize}
                  maxFiles={10}
                />
              </Field>
            )}
          />
          <div className="max-w-3xl mx-auto grid w-full gap-6">
            <Controller
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
            />
            <Controller
              name="id_cargo"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel
                    required
                    htmlFor={`${idFormProduct}_${field.name}`}
                  >
                    ID Cargo
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${idFormProduct}_${field.name}`}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="ID cargo..."
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="dokumen"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel required>Dokumen PDF</FieldLabel>
                  <DropzonePDF onChange={field.onChange} value={field.value} />

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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                    Discrepancy
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${idFormProduct}_${field.name}`}
                    aria-invalid={fieldState.invalid}
                    className="min-h-28"
                    placeholder="Kekurangan produk..."
                  />

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
                    return (i as (typeof selectProduct.brand)[number]).id === s;
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
                        {values.map((value: any) => (
                          <ComboboxChip key={value}>
                            {getOptionLabel(
                              selectProduct.brand.find((i) => i.id === value)
                                ?.nama,
                            )}
                          </ComboboxChip>
                        ))}
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
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
                          if (
                            (itemValue as (typeof categories)[number]).id ===
                            selectedValue
                          ) {
                            return true;
                          }
                          return itemValue === selectedValue;
                        }}
                        itemToStringLabel={(v: string) =>
                          getOptionLabel(
                            categories.find((i) => i.id === v)?.nama,
                          )
                        }
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Kondisi Produk
                      </FieldLabel>
                      <Combobox
                        autoHighlight
                        id={`${idFormProduct}_${field.name}`}
                        items={productCondition}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
                        isItemEqualToValue={(
                          itemValue: any,
                          selectedValue: any,
                        ) => {
                          if (
                            (itemValue as (typeof productCondition)[number])
                              .id === selectedValue
                          ) {
                            return true;
                          }
                          return itemValue === selectedValue;
                        }}
                        itemToStringLabel={(v: string) =>
                          getOptionLabel(
                            productCondition.find((i) => i.id === v)?.nama,
                          )
                        }
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Kondisi Paket
                      </FieldLabel>
                      <Combobox
                        autoHighlight
                        id={`${idFormProduct}_${field.name}`}
                        items={packageCondition}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
                        isItemEqualToValue={(
                          itemValue: any,
                          selectedValue: any,
                        ) => {
                          if (
                            (itemValue as (typeof packageCondition)[number])
                              .id === selectedValue
                          ) {
                            return true;
                          }
                          return itemValue === selectedValue;
                        }}
                        itemToStringLabel={(v: string) =>
                          getOptionLabel(
                            packageCondition.find((i) => i.id === v)?.nama,
                          )
                        }
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Sumber
                      </FieldLabel>
                      <Combobox
                        autoHighlight
                        id={`${idFormProduct}_${field.name}`}
                        items={source}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
                        isItemEqualToValue={(
                          itemValue: any,
                          selectedValue: any,
                        ) => {
                          if (
                            (itemValue as (typeof source)[number]).id ===
                            selectedValue
                          ) {
                            return true;
                          }
                          return itemValue === selectedValue;
                        }}
                        itemToStringLabel={(v: string) =>
                          getOptionLabel(source.find((i) => i.id === v)?.nama)
                        }
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel
                      required
                      htmlFor={`${idFormProduct}_${field.name}`}
                    >
                      Kuantitas
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
                          {Number.parseFloat(quantity).toLocaleString("id-ID")}
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                          {Number.parseFloat(panjang).toLocaleString("id-ID")}{" "}
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                          {Number.parseFloat(tinggi).toLocaleString("id-ID")} cm
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                          {Number.parseFloat(lebar).toLocaleString("id-ID")} cm
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
            <div className="grid lg:grid-cols-3 items-end gap-2 lg:gap-6">
              <Controller
                name="berat"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                          {Number.parseFloat(berat).toLocaleString("id-ID")} kg
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
              <Field className="gap-1">
                <FieldLabel>Berat Volumetrik</FieldLabel>
                <div className="h-8 rounded-lg border w-full border-gray-300 dark:border-gray-300/50 flex items-center gap-2 text-xs px-3">
                  {(
                    (Number.parseFloat(panjang ?? "0") *
                      Number.parseFloat(lebar ?? "0") *
                      Number.parseFloat(tinggi ?? "0")) /
                    6000
                  ).toLocaleString("id-ID")}{" "}
                  kg
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
            <div className="bg-gray-100 dark:bg-gray-800 flex items-center h-20 rounded-lg w-full justify-end p-4">
              <Button type="submit" className={"w-fit"} disabled={isPending}>
                {isPending ? <Spinner /> : <Send />}
                {isPending ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};
