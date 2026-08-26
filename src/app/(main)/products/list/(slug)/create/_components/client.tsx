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
import { useGetCategorySelect } from "@api/product/categories";
import { useGetPackageConditionSelect } from "@api/product/conditions/package";
import { useGetProductConditionSelect } from "@api/product/conditions/product";
import { useGetSourceSelect } from "@api/product/sources";
import {
  useCreateProduct,
  useMarkWmsCargoSynced,
  downloadWmsCargoPricingPdf,
} from "@api/product/list";
import { WmsCargoPricedItemType } from "@/app/(main)/products/list/_api/types";
import { Spinner } from "@/components/ui/spinner";
import { CargoIdField } from "@/app/(main)/products/list/_components/cargo-id-field";
import { toast } from "sonner";

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
  reference_code: z.string().optional(),
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

  const { mutate, isPending: isCreatingProduct } = useCreateProduct();
  const { mutate: markWmsCargoSynced, isPending: isSyncingCargo } =
    useMarkWmsCargoSynced();
  // Tombol submit tetap "loading" selama create produk ATAU konfirmasi
  // sync WMS masih berjalan — supaya admin tidak submit ganda.
  const isPending = isCreatingProduct || isSyncingCargo;
  const [selectedCargo, setSelectedCargo] =
    useState<WmsCargoPricedItemType | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  // true kalau id_cargo dipilih dari dropdown WMS — dipakai buat mengunci
  // (disable) field harga supaya tidak menyimpang dari harga yang sudah
  // ditetapkan di WMS.
  const [isCargoFromWms, setIsCargoFromWms] = useState(false);
  const [isDownloadingCargoPdf, setIsDownloadingCargoPdf] = useState(false);
  // Combobox base-ui tidak sinkron menampilkan label saat value di-set
  // programatik (bukan lewat interaksi user) — remount paksa via key saat
  // cargo WMS dipilih supaya label kategori/kondisi/sumber/merek tampil.
  const [cargoRefreshKey, setCargoRefreshKey] = useState(0);

  const { data: brandSelectData } = useGetBrandSelect();
  const { data: categorySelectData } = useGetCategorySelect();
  const { data: packageConditionSelectData } = useGetPackageConditionSelect();
  const { data: productConditionSelectData } = useGetProductConditionSelect();
  const { data: sourceSelectData } = useGetSourceSelect();

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_en: "",
      nama_id: "",
      discrepancy: "",
      id_cargo: "",
      reference_code: "",
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

  // Dipanggil CargoIdField saat admin memilih cargo dari dropdown WMS (atau
  // `null` saat beralih ke mode manual/dikosongkan). Auto-fill dimensi,
  // harga (lalu dikunci read-only), kategori/kondisi/sumber/merek (ID dari
  // WMS kompatibel dengan ID lokal Bulky), dan download PDF harga sebagai
  // dokumen produk seolah diupload manual.
  const handleSelectCargo = async (cargo: WmsCargoPricedItemType | null) => {
    setSelectedCargo(cargo);
    setSelectedCargoId(cargo?.id ?? null);
    setIsCargoFromWms(!!cargo);

    if (!cargo) {
      form.setValue("reference_code", "");
      return;
    }

    form.setValue("reference_code", cargo.code);

    // Helper untuk mencari ID yang cocok di master data Bulky (cocokkan ID dulu, lalu Nama)
    const findMatchingId = <T extends { id?: unknown; nama?: unknown }>(
      items: T[],
      ref?: { id: string; name: string; bulky_id?: string } | null,
    ) => {
      if (!ref) return "";
      const targetId = ref.bulky_id || ref.id;
      // 1. Cocokkan by ID
      const byId = items.find((item) => item.id === targetId);
      if (byId && typeof byId.id === "string") return byId.id;
      // 2. Cocokkan by Nama
      if (ref.name) {
        const byName = items.find(
          (item) =>
            getOptionLabel(item.nama).trim().toLowerCase() ===
            ref.name.trim().toLowerCase(),
        );
        if (byName && typeof byName.id === "string") return byName.id;
      }
      return targetId || "";
    };

    form.setValue("panjang", String(cargo.length_cm));
    form.setValue("lebar", String(cargo.width_cm));
    form.setValue("tinggi", String(cargo.height_cm));
    form.setValue("berat", String(cargo.weight_kg));
    form.setValue("harga_sebelum_diskon", String(cargo.total_price));
    form.setValue("harga_sesudah_diskon", String(cargo.sale_price));
    if (cargo.bulky_category) {
      const matchedCategoryId = findMatchingId(
        selectProduct.category,
        cargo.bulky_category,
      );
      if (matchedCategoryId) form.setValue("kategori_id", matchedCategoryId);
    }
    if (cargo.bulky_product_condition) {
      const matchedProductConditionId = findMatchingId(
        selectProduct.productCondition,
        cargo.bulky_product_condition,
      );
      if (matchedProductConditionId)
        form.setValue("kondisi_id", matchedProductConditionId);
    }
    if (cargo.bulky_package_condition) {
      const matchedPackageConditionId = findMatchingId(
        selectProduct.packageCondition,
        cargo.bulky_package_condition,
      );
      if (matchedPackageConditionId)
        form.setValue("kondisi_paket_id", matchedPackageConditionId);
    }
    if (cargo.bulky_product_source) {
      const matchedSourceId = findMatchingId(
        selectProduct.source,
        cargo.bulky_product_source,
      );
      if (matchedSourceId) form.setValue("sumber_id", matchedSourceId);
    }
    if (cargo.bulky_brands && cargo.bulky_brands.length > 0) {
      const matchedBrandIds = cargo.bulky_brands
        .map((b) => findMatchingId(selectProduct.brand, b))
        .filter(Boolean)
        .map((id) => ({ data: id }));
      replace(matchedBrandIds);
    }
    setCargoRefreshKey((k) => k + 1);

    setIsDownloadingCargoPdf(true);
    try {
      const blob = await downloadWmsCargoPricingPdf(cargo.id);
      const file = new File([blob], `Rincian Harga WMS - ${cargo.code}.pdf`, {
        type: "application/pdf",
      });
      form.setValue("dokumen", [file], { shouldValidate: true });
    } catch {
      toast.error("Gagal mengunduh PDF harga dari WMS");
    } finally {
      setIsDownloadingCargoPdf(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    body.append("nama_en", values.nama_en);
    body.append("nama_id", values.nama_id);
    body.append("discrepancy", values.discrepancy ?? "");
    body.append("id_cargo", values.id_cargo);
    if (values.reference_code) body.append("reference_code", values.reference_code);
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

    mutate(
      { body },
      {
        onSuccess: (response) => {
          // Produk sudah tersimpan di DB Bulky. Untuk produk asal cargo WMS,
          // tandai cargo dikonfirmasi sinkron DULU — toast sukses & navigasi
          // baru muncul setelah WMS benar-benar mengonfirmasi (bukan
          // fire-and-forget lagi), supaya admin tahu kalau sync-nya gagal.
          if (selectedCargoId) {
            markWmsCargoSynced(
              { params: { id: selectedCargoId } },
              {
                onSuccess: () => {
                  toast.success(response.data.message);
                  router.push("/products/list");
                },
                onError: () => {
                  toast.error(
                    "Produk berhasil dibuat, tetapi gagal menandai sinkronisasi ke WMS. Silakan tandai ulang secara manual.",
                  );
                },
              },
            );
          } else {
            toast.success(response.data.message);
            router.push("/products/list");
          }
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

  const onInvalid = (errors: any) => {
    console.error("[PRODUCT_CREATE][VALIDATION_ERRORS]:", errors);
    const firstError = Object.values(errors)[0] as
      | { message?: string }
      | undefined;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Mohon lengkapi semua kolom yang wajib diisi");
    }
  };

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
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
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
                  onSelectCargo={handleSelectCargo}
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
                    disabled={isCargoFromWms || isDownloadingCargoPdf}
                  />
                  {isDownloadingCargoPdf && (
                    <p className="text-xs text-muted-foreground">
                      Mengunduh PDF harga dari WMS...
                    </p>
                  )}
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
                key={cargoRefreshKey}
                id={`${idFormProduct}_brand`}
                multiple
                autoHighlight
                disabled={isCargoFromWms}
                items={selectProduct.brand}
                value={fields.map((f) => f.data)}
                onValueChange={(e) => {
                  if (isCargoFromWms) return;
                  replace(getSelectIds(e).map((id) => ({ data: id })));
                }}
                isItemEqualToValue={(i: any, s: any) => {
                  if ((i as (typeof selectProduct.brand)[number]).id) {
                    return (i as (typeof selectProduct.brand)[number]).id === s;
                  }
                  return i === s;
                }}
              >
                <ComboboxChips
                  ref={anchor}
                  className={cn(
                    "w-full bg-transparent dark:bg-transparent",
                    isCargoFromWms &&
                      "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                  )}
                >
                  <ComboboxValue>
                    {(values) => (
                      <React.Fragment>
                        {values.map((value: any, index: number) => {
                          const valId = getSelectId(value);
                          return (
                            <ComboboxChip
                              key={valId || `brand-chip-${index}`}
                              showRemove={!isCargoFromWms}
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
                        {!isCargoFromWms && (
                          <ComboboxChipsInput
                            className={"placeholder:text-xs bg-transparent"}
                            placeholder="Pilih merek..."
                          />
                        )}
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                {!isCargoFromWms && (
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
                )}
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
                        key={cargoRefreshKey}
                        autoHighlight
                        disabled={isCargoFromWms}
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Kondisi Produk
                      </FieldLabel>
                      <Combobox
                        key={cargoRefreshKey}
                        autoHighlight
                        disabled={isCargoFromWms}
                        id={`${idFormProduct}_${field.name}`}
                        items={productCondition}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Kondisi Paket
                      </FieldLabel>
                      <Combobox
                        key={cargoRefreshKey}
                        autoHighlight
                        disabled={isCargoFromWms}
                        id={`${idFormProduct}_${field.name}`}
                        items={packageCondition}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
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
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${idFormProduct}_${field.name}`}>
                        Sumber
                      </FieldLabel>
                      <Combobox
                        key={cargoRefreshKey}
                        autoHighlight
                        disabled={isCargoFromWms}
                        id={`${idFormProduct}_${field.name}`}
                        items={source}
                        value={field.value}
                        onValueChange={(e) => field.onChange(getSelectId(e))}
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
                              source.find((i) => i.id === (valId || v))?.nama,
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel
                      required
                      htmlFor={`${idFormProduct}_${field.name}`}
                    >
                      Harga Sebelum Diskon
                    </FieldLabel>
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
                    <InputGroup
                      className={cn(
                        isCargoFromWms &&
                          "pointer-events-none opacity-60 cursor-not-allowed bg-muted/40",
                      )}
                    >
                      <InputGroupInput
                        {...field}
                        id={`${idFormProduct}_${field.name}`}
                        type="number"
                        onChange={(e) =>
                          field.onChange(numericString(e.target.value))
                        }
                        disabled={isCargoFromWms}
                        readOnly={isCargoFromWms}
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
