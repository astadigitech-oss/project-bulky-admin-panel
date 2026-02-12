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
import { useParams } from "next/navigation";
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

const merek = [
  {
    id: "a3b37703-8427-49ef-8d97-b86110272d10",
    nama: "Xiaomi",
  },
  {
    id: "9a506c6e-6d7c-4f61-903f-78d962efecee",
    nama: "Tas",
  },
  {
    id: "2fb93a2f-969a-4ae5-92f4-48b6c075eb2a",
    nama: "Sony",
  },
];
const kategori = [
  {
    id: "ef3568ec-5782-411c-b30c-8b912ea077c5",
    nama: {
      id: "Elektronik",
      en: "Electronics",
    },
    slug: "elektronik",
  },
  {
    id: "df74f002-31f5-4567-bc58-d156d6c3b994",
    nama: {
      id: "Ibu \u0026 Anak",
      en: "Mother \u0026 Baby",
    },
    slug: "ibu-anak",
  },
  {
    id: "288b8def-ab77-4c94-ad02-a5c40870b21d",
    nama: {
      id: "Kosmetik",
      en: "Cosmetics",
    },
    slug: "kosmetik",
  },
];
const kondisi_paket = [
  {
    id: "5163c66d-0358-4fd3-9523-d549ea358c0f",
    nama: "Set Lengkap",
  },
  {
    id: "1463e328-e9d3-4d21-9809-e2cba17d6cfe",
    nama: "Rusak Sedang",
  },
  {
    id: "f18c5907-864a-472a-baca-d4c531369c0f",
    nama: "Rusak Ringan",
  },
];
const kondisi = [
  {
    id: "af1df525-00e6-4813-822d-2dae9759724e",
    nama: "Bekas Baik",
  },
  {
    id: "5c87438a-1e64-4a95-9e0c-bcca90ff14f5",
    nama: "Bekas Grade B",
  },
  {
    id: "44919624-ab6c-42ca-806f-3451eebb259e",
    nama: "Rusak",
  },
  {
    id: "5aac65a7-39a1-48ef-bc66-cf74c13caa1f",
    nama: "Bekas Cukup Baik",
  },
];
const sumber = [
  {
    id: "125c85f4-1188-4d5e-a503-eff20017a92b",
    nama: "Reject",
  },
  {
    id: "507be3fc-552f-4bb2-831a-67504f576fae",
    nama: "Liquidasi",
  },
  {
    id: "1bd762f8-d0f1-4d52-a59c-7ca0e7da7cdf",
    nama: "Excess",
  },
  {
    id: "3ff7b524-9120-40bc-b6a0-9a5ca3f1ad94",
    nama: "Closeout",
  },
];

export const FILE_RULES = {
  imageMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  docMimeTypes: ["application/pdf"],
  maxSize: 10 * 1024 * 1024,
};

const formSchema = z.object({
  reference_id: z.string(),
  nama_id: z.string().min(1, "Nama ID tidak boleh kosong"),
  nama_en: z.string().min(1, "Nama EN tidak boleh kosong"),
  id_cargo: z.string().min(1, "Id Cargo tidak boleh kosong"),
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
  const anchor = useComboboxAnchor();
  const idFormProduct = useId();
  const productId = useParams().productId;
  const isCreate = productId === "create";

  const finalSchema = formSchema.extend({
    gambar: isCreate
      ? z
          .array(
            z
              .file()
              .max(FILE_RULES.maxSize, "Ukuran maksimal 10MB")
              .mime(FILE_RULES.imageMimeTypes),
          )
          .min(1, "Icon wajib diunggah")
          .max(10, "Hanya boleh 10 file")
      : z
          .array(
            z
              .file()
              .max(FILE_RULES.maxSize, "Ukuran maksimal 10MB")
              .mime(FILE_RULES.imageMimeTypes),
          )
          .max(10, "Hanya boleh 10 file")
          .optional(),
  });

  const form = useForm<z.infer<typeof finalSchema>>({
    resolver: zodResolver(finalSchema),
    values: {
      nama_en: "",
      nama_id: "",
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

  const onSubmit = (values: z.infer<typeof finalSchema>) => {
    console.log(values);
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
        <h1 className="leading-none font-semibold text-2xl">
          {isCreate ? "Tambah" : "Edit"} Produk
        </h1>
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
                    onValueChange={field.onChange}
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
                  <FieldLabel
                    required
                    htmlFor={`${idFormProduct}_${field.name}`}
                  >
                    ID Cargo
                  </FieldLabel>
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
            <Separator />
            <Field className="gap-1 col-span-full">
              <FieldLabel required htmlFor={`${idFormProduct}_brand`}>
                Merek
              </FieldLabel>
              <Combobox
                id={`${idFormProduct}_brand`}
                multiple
                autoHighlight
                items={merek}
                value={fields.map((f) => f.data)}
                onValueChange={(e) => replace(e.map((i) => ({ data: i })))}
                isItemEqualToValue={(i: any, s: any) => {
                  if ((i as (typeof merek)[number]).id) {
                    return (i as (typeof merek)[number]).id === s;
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
                            {merek.find((i) => i.id === value)?.nama}
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
                    {(item: (typeof merek)[number]) => (
                      <ComboboxItem key={item.id} value={item.id}>
                        {merek.find((i) => i.id === item.id)?.nama}
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
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                      Kategori
                    </FieldLabel>
                    <Combobox
                      autoHighlight
                      id={`${idFormProduct}_${field.name}`}
                      items={kategori}
                      value={field.value}
                      onValueChange={field.onChange}
                      isItemEqualToValue={(
                        itemValue: any,
                        selectedValue: any,
                      ) => {
                        if (
                          (itemValue as (typeof kategori)[number]).id ===
                          selectedValue
                        ) {
                          return true;
                        }
                        return itemValue === selectedValue;
                      }}
                      itemToStringLabel={(v: string) =>
                        kategori.find((i) => i.id === v)?.nama.id ?? ""
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <ComboboxInput placeholder="Pilih kategori..." />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof kategori)[number]) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {item.nama.id}
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
                control={form.control}
                name="kondisi_id"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                      Kondisi Produk
                    </FieldLabel>
                    <Combobox
                      autoHighlight
                      id={`${idFormProduct}_${field.name}`}
                      items={kondisi}
                      value={field.value}
                      onValueChange={field.onChange}
                      isItemEqualToValue={(
                        itemValue: any,
                        selectedValue: any,
                      ) => {
                        if (
                          (itemValue as (typeof kondisi)[number]).id ===
                          selectedValue
                        ) {
                          return true;
                        }
                        return itemValue === selectedValue;
                      }}
                      itemToStringLabel={(v: string) =>
                        kondisi.find((i) => i.id === v)?.nama ?? ""
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <ComboboxInput placeholder="Pilih kondisi produk..." />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof kondisi)[number]) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {item.nama}
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
                control={form.control}
                name="kondisi_paket_id"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                      Kondisi Paket
                    </FieldLabel>
                    <Combobox
                      autoHighlight
                      id={`${idFormProduct}_${field.name}`}
                      items={kondisi_paket}
                      value={field.value}
                      onValueChange={field.onChange}
                      isItemEqualToValue={(
                        itemValue: any,
                        selectedValue: any,
                      ) => {
                        if (
                          (itemValue as (typeof kondisi_paket)[number]).id ===
                          selectedValue
                        ) {
                          return true;
                        }
                        return itemValue === selectedValue;
                      }}
                      itemToStringLabel={(v: string) =>
                        kondisi_paket.find((i) => i.id === v)?.nama ?? ""
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <ComboboxInput placeholder="Pilih kondisi paket..." />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof kondisi_paket)[number]) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {item.nama}
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
                control={form.control}
                name="sumber_id"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                      Sumber
                    </FieldLabel>
                    <Combobox
                      autoHighlight
                      id={`${idFormProduct}_${field.name}`}
                      items={sumber}
                      value={field.value}
                      onValueChange={field.onChange}
                      isItemEqualToValue={(
                        itemValue: any,
                        selectedValue: any,
                      ) => {
                        if (
                          (itemValue as (typeof sumber)[number]).id ===
                          selectedValue
                        ) {
                          return true;
                        }
                        return itemValue === selectedValue;
                      }}
                      itemToStringLabel={(v: string) =>
                        sumber.find((i) => i.id === v)?.nama ?? ""
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <ComboboxInput placeholder="Pilih sumber..." />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof sumber)[number]) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {item.nama}
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
            <div className="grid lg:grid-cols-2 items-end gap-2 lg:gap-6">
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
            <div className="bg-gray-300 dark:bg-gray-800 flex items-center h-20 rounded-lg w-full justify-end p-4">
              <Button type="submit" className={"w-fit"}>
                <Send />
                Kirim
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};
