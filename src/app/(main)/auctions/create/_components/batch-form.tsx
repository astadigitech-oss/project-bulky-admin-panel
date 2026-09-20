"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DropzoneList } from "@/components/ui/dropzone-list";
import { DropzonePDF } from "@/components/ui/dropzone-pdf";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ChevronRight, Eye, Gavel, Plus, Save, Send, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { cn, formatRupiah } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lottie } from "lottie-react";
import {
  useCreateAuction,
  useGetAuctionDetail,
  useGetKategoriSelect,
  useGetKondisiPaketSelect,
  useGetKondisiSelect,
  useGetMerekSelect,
  useGetSumberSelect,
  useImportSupplierExcel,
  usePreviewSupplierExcel,
  usePublishAuction,
  useUpdateAuction,
  useUploadAuctionAsset,
} from "../../_api";
import {
  AuctionBatchDetail,
  AuctionDraftInput,
  AuctionItemSourceType,
  AuctionSupplierExcelPreview,
} from "../../_api/types";

const PDFViewer = dynamic(() => import("@/components/ui/pdf-viewer"), {
  ssr: false,
});

const getPdfPreviewUrl = (fileUrl: string) => {
  try {
    const parsedUrl = new URL(fileUrl, "http://localhost");
    const uploadsIndex = parsedUrl.pathname.indexOf("/uploads/");
    if (uploadsIndex >= 0) {
      return `${parsedUrl.pathname.slice(uploadsIndex)}${parsedUrl.search}`;
    }
  } catch {
    // Keep the original URL when it is not a recognizable upload URL.
  }
  return fileUrl;
};

const SUPPLIER_ORIGIN = {
  name: "Warehouse Bulky",
  address:
    "Jl. Raya Mayor Oking Jaya Atmaja No.62a, Cirimekar, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16918",
  city: "Kabupaten Bogor",
  province: "Jawa Barat",
  district: "Cibinong",
  subdistrict: "Cirimekar",
  postalCode: "16918",
  latitude: "-6.46958024",
  longitude: "106.85984984",
};

const formSchema = z.object({
  nama_id: z.string().min(1, "Nama ID wajib diisi"),
  nama_en: z.string().optional(),
  description: z.string().optional(),
  origin_type: z.literal("SUPPLIER"),
  supplier_name: z.string().optional(),
  supplier_address: z.string().optional(),
  supplier_provinsi: z.string().optional(),
  supplier_kota: z.string().optional(),
  supplier_kecamatan: z.string().optional(),
  supplier_kelurahan: z.string().optional(),
  supplier_kode_pos: z.string().optional(),
  supplier_latitude: z.string().optional(),
  supplier_longitude: z.string().optional(),
  kategori_id: z.string().optional(),
  kondisi_id: z.string().optional(),
  kondisi_paket_id: z.string().optional(),
  sumber_id: z.string().optional(),
  discrepancy_percentage: z.string().optional(),
  merek_ids: z.array(z.string()),
  panjang_cm: z.string().optional(),
  lebar_cm: z.string().optional(),
  tinggi_cm: z.string().optional(),
  berat_kg: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type BatchItem = {
  source_type: AuctionItemSourceType;
  produk_id?: string;
  nama_snapshot: string;
  quantity: number;
  unit_price: string;
  stock_available: number;
};

type UploadedAsset = {
  id: string;
  url?: string;
  kind: "IMAGE" | "PDF";
  original_name?: string;
};

type SaveStage = "importing" | "uploading" | "saving" | null;

const SaveProgressDialog = ({
  stage,
  isEdit,
}: {
  stage: SaveStage;
  isEdit: boolean;
}) => {
  const importing = stage === "importing";
  const uploading = stage === "uploading";

  return (
    <Dialog open={stage !== null}>
      <DialogContent
        className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
          <Lottie
            src="/assets/lottie/pc-to-cloud-server.json"
            loop
            autoplay
            className="mx-auto h-32 w-40 sm:mx-0"
            aria-label="Animasi proses penyimpanan batch"
          />
          <DialogHeader className="items-start gap-2 text-left">
            <DialogTitle>
              {importing
                ? "Mengimpor item & membuat PDF"
                : uploading
                  ? "Mengunggah aset batch"
                : isEdit
                  ? "Memperbarui batch"
                  : "Menyimpan batch baru"}
            </DialogTitle>
            <DialogDescription className="max-w-sm text-left leading-relaxed">
              {importing
                ? "Data dari Excel sedang diproses dan PDF daftar item sedang dibuat. Jangan tutup halaman ini."
                : uploading
                  ? "Gambar sedang dikompresi ke WebP dan diunggah ke storage. Jangan tutup halaman ini."
                : isEdit
                  ? "Perubahan batch sedang disimpan ke database. Jangan tutup halaman ini."
                  : "Batch sedang disimpan ke database. Jangan tutup halaman ini."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="border-t bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground sm:text-right" aria-live="polite">
          {importing
            ? "Menunggu item dan PDF selesai diproses…"
            : uploading
              ? "Menunggu aset dikonfirmasi server…"
              : "Menunggu penyimpanan dikonfirmasi server…"}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getSelectLabel = (item: any, options: any[] = []): string => {
  if (typeof item === "string") {
    const match = options.find((option) => option?.id === item);
    return match ? getSelectLabel(match) : "";
  }
  if (item && typeof item === "object") {
    const o = item as {
      nama?: unknown;
      nama_id?: unknown;
      nama_en?: unknown;
      id?: unknown;
    };
    if (typeof o.nama === "string" && o.nama.trim()) return o.nama;
    if (o.nama && typeof o.nama === "object") {
      const translated = o.nama as { id?: unknown; en?: unknown };
      if (typeof translated.id === "string" && translated.id.trim()) return translated.id;
      if (typeof translated.en === "string" && translated.en.trim()) return translated.en;
    }
    if (typeof o.nama_id === "string" && o.nama_id.trim()) return o.nama_id;
    if (typeof o.nama_en === "string" && o.nama_en.trim()) return o.nama_en;
    if (typeof o.id === "string") return o.id;
  }
  return "";
};

export const BatchForm = ({ batchId }: { batchId?: string }) => {
  const router = useRouter();
  const isEdit = !!batchId;

  const { data: detail } = useGetAuctionDetail(batchId ?? "");
  const batch = detail?.data;

  const { data: kategoriData } = useGetKategoriSelect();
  const { data: kondisiData } = useGetKondisiSelect();
  const { data: kondisiPaketData } = useGetKondisiPaketSelect();
  const { data: sumberData } = useGetSumberSelect();
  const { data: merekData } = useGetMerekSelect();

  const kategoriOptions = kategoriData?.data ?? [];
  const kondisiOptions = kondisiData?.data ?? [];
  const kondisiPaketOptions = kondisiPaketData?.data ?? [];
  const sumberOptions = sumberData?.data ?? [];
  const merekOptions = merekData?.data ?? [];

  const [items, setItems] = useState<BatchItem[]>([]);
  const [images, setImages] = useState<UploadedAsset[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdf, setPdf] = useState<UploadedAsset | null>(null);
  const [generatedPdfTitle, setGeneratedPdfTitle] = useState<string | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<AuctionSupplierExcelPreview | null>(null);
  const [nameColumn, setNameColumn] = useState("");
  const [priceColumn, setPriceColumn] = useState("");
  const [quantityColumn, setQuantityColumn] = useState("");
  const [uploading, setUploading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_id: "",
      nama_en: "",
      description: "",
      origin_type: "SUPPLIER",
      supplier_name: SUPPLIER_ORIGIN.name,
      supplier_address: SUPPLIER_ORIGIN.address,
      supplier_provinsi: SUPPLIER_ORIGIN.province,
      supplier_kota: SUPPLIER_ORIGIN.city,
      supplier_kecamatan: SUPPLIER_ORIGIN.district,
      supplier_kelurahan: SUPPLIER_ORIGIN.subdistrict,
      supplier_kode_pos: SUPPLIER_ORIGIN.postalCode,
      supplier_latitude: SUPPLIER_ORIGIN.latitude,
      supplier_longitude: SUPPLIER_ORIGIN.longitude,
      kategori_id: "",
      kondisi_id: "",
      kondisi_paket_id: "",
      sumber_id: "",
      discrepancy_percentage: "0",
      merek_ids: [],
      panjang_cm: "",
      lebar_cm: "",
      tinggi_cm: "",
      berat_kg: "",
    },
  });

  // Sinkronkan form & state saat batch detail dimuat (mode edit).
  useEffect(() => {
    if (!batch) return;
    form.reset({
      nama_id: batch.nama_id,
      nama_en: batch.nama_en ?? "",
      description: batch.description ?? "",
      origin_type: "SUPPLIER",
      supplier_name: SUPPLIER_ORIGIN.name,
      supplier_address: SUPPLIER_ORIGIN.address,
      supplier_provinsi: SUPPLIER_ORIGIN.province,
      supplier_kota: SUPPLIER_ORIGIN.city,
      supplier_kecamatan: SUPPLIER_ORIGIN.district,
      supplier_kelurahan: SUPPLIER_ORIGIN.subdistrict,
      supplier_kode_pos: SUPPLIER_ORIGIN.postalCode,
      supplier_latitude: SUPPLIER_ORIGIN.latitude,
      supplier_longitude: SUPPLIER_ORIGIN.longitude,
      kategori_id: batch.kategori_id ?? "",
      kondisi_id: batch.kondisi_id ?? "",
      kondisi_paket_id: batch.kondisi_paket_id ?? "",
      sumber_id: batch.sumber_id ?? "",
      discrepancy_percentage: batch.discrepancy_percentage ?? "0",
      merek_ids: batch.merek_ids ?? [],
      panjang_cm: batch.panjang_cm ?? "",
      lebar_cm: batch.lebar_cm ?? "",
      tinggi_cm: batch.tinggi_cm ?? "",
      berat_kg: batch.berat_kg ?? "",
    });
    setItems(
      (batch.items ?? []).map((i) => ({
        source_type: i.source_type,
        produk_id: i.produk_id ?? undefined,
        nama_snapshot: i.nama_snapshot,
        quantity: i.quantity,
        unit_price: i.unit_price_snapshot,
        stock_available: 0,
      })),
    );
    setImages(
      (batch.images ?? []).map((i) => ({
        id: i.id,
        url: i.url,
        kind: "IMAGE" as const,
        original_name: i.original_name,
      })),
    );
    setPdf(
      batch.pdf
        ? {
            id: batch.pdf.id,
            url: batch.pdf.url,
            kind: "PDF" as const,
            original_name: batch.pdf.original_name,
          }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch]);

  const [panjangCm, lebarCm, tinggiCm, beratKg, discrepancy, originType] = useWatch({
    control: form.control,
    name: [
      "panjang_cm",
      "lebar_cm",
      "tinggi_cm",
      "berat_kg",
      "discrepancy_percentage",
      "origin_type",
    ],
  });

  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + (Number(item.unit_price) || 0) * item.quantity;
    }, 0);
  }, [items]);

  const totalQuantity = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const volumeM3 = useMemo(() => {
    const p = Number(panjangCm) || 0;
    const l = Number(lebarCm) || 0;
    const t = Number(tinggiCm) || 0;
    return (p * l * t) / 1000000;
  }, [panjangCm, lebarCm, tinggiCm]);

  const minBidAmount = useMemo(
    () => Math.ceil(grandTotal * 0.001),
    [grandTotal],
  );

  const { mutate: createAuction, isPending: isCreating } = useCreateAuction();
  const { mutate: updateAuction, isPending: isUpdating } = useUpdateAuction();
  const { mutate: publishAuction, isPending: isPublishing } = usePublishAuction();
  const { mutate: uploadAsset, isPending: isUploading } = useUploadAuctionAsset();
  const { mutate: previewSupplierExcel, isPending: isPreviewingExcel } = usePreviewSupplierExcel();
  const { mutate: importSupplierExcel, isPending: isImportingExcel } = useImportSupplierExcel();

  const isSaving = isCreating || isUpdating;
  const isDisabled = isSaving || isPublishing || isUploading || isPreviewingExcel || isImportingExcel || uploading;
  const saveStage: SaveStage = isImportingExcel ? "importing" : uploading || isUploading ? "uploading" : isSaving ? "saving" : null;

  const handleImageChange = async (files: File[]) => {
    setImageFiles(files);
    if (files.length === 0) return;
    setUploading(true);
    const newAssets: UploadedAsset[] = [];
    try {
      for (const file of files) {
        const res = await new Promise<{ id: string; url: string }>(
          (resolve, reject) => {
            uploadAsset(
              { file, kind: "IMAGE" },
              {
                onSuccess: (data) =>
                  resolve({ id: data.data.data.id, url: data.data.data.url }),
                onError: (err) => reject(err),
              },
            );
          },
        );
        newAssets.push({ id: res.id, url: res.url, kind: "IMAGE" });
      }
      // Maksimal 10 gambar.
      setImages((prev) => [...prev, ...newAssets].slice(0, 10));
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setImageFiles([]);
      setUploading(false);
    }
  };

  const handlePdfChange = async (files: File[]) => {
    setPdfFiles(files);
    if (files.length === 0) {
      setPdf(null);
      return;
    }
    setUploading(true);
    try {
      const asset = await new Promise<{ id: string; url: string }>((resolve, reject) => {
        uploadAsset(
          { file: files[0], kind: "PDF" },
          {
            onSuccess: (response) => resolve({ id: response.data.data.id, url: response.data.data.url }),
            onError: reject,
          },
        );
      });
      setPdf({ id: asset.id, url: asset.url, kind: "PDF" });
    } catch {
      toast.error("Gagal mengupload PDF");
    } finally {
      setPdfFiles([]);
      setUploading(false);
    }
  };

  const handleExcelSelected = (file?: File) => {
    setExcelFile(file ?? null);
    setExcelPreview(null);
    setNameColumn("");
    setPriceColumn("");
    setQuantityColumn("");
    if (!file) return;
    previewSupplierExcel(file, {
      onSuccess: (response) => {
        const preview = response.data.data;
        setExcelPreview(preview);
        const findColumn = (pattern: RegExp) =>
          preview.columns.find((column) => pattern.test(column.header.trim().toLowerCase()));
        const name = findColumn(/^(nama|nama item|nama produk|item|product|product name)$/);
        const price = findColumn(/^(price|harga|harga satuan|unit price)$/);
        const quantity = findColumn(/^(qty|quantity|jumlah)$/);
        if (name) setNameColumn(String(name.index));
        if (price) setPriceColumn(String(price.index));
        if (quantity) setQuantityColumn(String(quantity.index));
      },
    });
  };

  const handleImportExcel = () => {
    if (!excelFile || !excelPreview || nameColumn === "" || priceColumn === "" || quantityColumn === "") {
      toast.error("Pilih kolom nama, harga, dan qty terlebih dahulu");
      return;
    }
    if (new Set([nameColumn, priceColumn, quantityColumn]).size !== 3) {
      toast.error("Kolom nama, harga, dan qty harus berbeda");
      return;
    }
    const title = form.getValues("nama_en")?.trim() ?? "";
    if (!title) {
      form.setError("nama_en", { message: "Isi Nama EN sebelum membuat PDF daftar item" });
      toast.error("Isi Nama EN batch terlebih dahulu");
      return;
    }
    if (items.length > 0 && !window.confirm("Item batch saat ini akan diganti dengan data dari Excel. Lanjutkan?")) return;
    importSupplierExcel(
      {
        file: excelFile,
        nameColumn: Number(nameColumn),
        priceColumn: Number(priceColumn),
        quantityColumn: Number(quantityColumn),
        headerRow: excelPreview.header_row,
        title,
      },
      {
        onSuccess: (response) => {
          const result = response.data.data;
          setItems(result.items.map((item, index) => ({
            source_type: "MANUAL",
            produk_id: `excel-${Date.now()}-${index}`,
            nama_snapshot: item.nama ?? "",
            quantity: item.quantity,
            unit_price: item.unit_price ?? "0",
            stock_available: 0,
          })));
          setPdf({
            id: result.pdf.id,
            url: result.pdf.url,
            kind: "PDF",
            original_name: result.pdf.original_name,
          });
          setGeneratedPdfTitle(title);
          setExcelFile(null);
          setExcelPreview(null);
          setNameColumn("");
          setPriceColumn("");
          setQuantityColumn("");
          toast.success("Item berhasil diimpor dan PDF daftar item disimpan");
        },
      },
    );
  };

  useEffect(() => {
    if (originType !== "SUPPLIER") return;
    setItems((previous) => previous.map((item, index) => ({
      ...item,
      source_type: "MANUAL",
      produk_id: item.source_type === "MANUAL" ? item.produk_id : `supplier-${Date.now()}-${index}`,
      stock_available: 0,
    })));
  }, [originType]);

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages((previous) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = async (values: FormValues) => {
    const isSupplier = values.origin_type === "SUPPLIER";
    if (isSupplier && generatedPdfTitle && generatedPdfTitle !== (values.nama_en?.trim() ?? "")) {
      toast.error("Nama EN berubah setelah PDF dibuat. Impor ulang Excel agar judul PDF sesuai.");
      return;
    }
    const body: AuctionDraftInput = {
      nama_id: values.nama_id,
      nama_en: values.nama_en || null,
      description: values.description || null,
      origin_type: values.origin_type,
      warehouse_id: null,
      supplier_name: isSupplier ? SUPPLIER_ORIGIN.name : null,
      supplier_address: isSupplier ? SUPPLIER_ORIGIN.address : null,
      supplier_provinsi: isSupplier ? SUPPLIER_ORIGIN.province : null,
      supplier_kota: isSupplier ? SUPPLIER_ORIGIN.city : null,
      supplier_kecamatan: isSupplier ? SUPPLIER_ORIGIN.district : null,
      supplier_kelurahan: isSupplier ? SUPPLIER_ORIGIN.subdistrict : null,
      supplier_kode_pos: isSupplier ? SUPPLIER_ORIGIN.postalCode : null,
      supplier_latitude: isSupplier ? SUPPLIER_ORIGIN.latitude : null,
      supplier_longitude: isSupplier ? SUPPLIER_ORIGIN.longitude : null,
      kategori_id: values.kategori_id || null,
      kondisi_id: values.kondisi_id || null,
      kondisi_paket_id: values.kondisi_paket_id || null,
      sumber_id: values.sumber_id || null,
      discrepancy_percentage: values.discrepancy_percentage || "0",
      merek_ids: values.merek_ids,
      items: items.map((i) =>
        i.source_type === "CATALOG"
          ? { source_type: "CATALOG" as const, produk_id: i.produk_id, quantity: i.quantity }
          : { source_type: "MANUAL" as const, nama: i.nama_snapshot, unit_price: i.unit_price, quantity: i.quantity },
      ),
      panjang_cm: values.panjang_cm || "0",
      lebar_cm: values.lebar_cm || "0",
      tinggi_cm: values.tinggi_cm || "0",
      berat_kg: values.berat_kg || "0",
      image_asset_ids: images.map((i) => i.id),
      pdf_asset_id: pdf?.id ?? null,
    };

    const idempotencyKey = `create-batch-${Date.now()}`;

    if (isEdit) {
      updateAuction(
        { body: { ...body, version: batch?.version ?? 1 }, params: { id: batchId! } },
        {
          onSuccess: (data) => {
            toast.success(data.data.message);
            router.push(`/auctions/${batchId}`);
          },
        },
      );
    } else {
      createAuction(
        { body, idempotencyKey },
        {
          onSuccess: (data) => {
            toast.success(data.data.message);
            router.push(`/auctions/${data.data.data.id}`);
          },
        },
      );
    }
  };

  const handlePublish = async () => {
    if (!batchId || !batch) return;
    publishAuction(
      { body: { version: batch.version }, params: { id: batchId }, idempotencyKey: `publish-${batchId}` },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          router.push(`/auctions/${batchId}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      <SaveProgressDialog stage={saveStage} isEdit={isEdit} />
      <div className="flex items-center gap-2">
        <Link href={batchId ? `/auctions/${batchId}` : "/auctions/list"}>
          <Button variant="ghost" size="icon-lg">
            <Gavel className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">
          {isEdit ? "Edit Batch" : "Buat Batch"}
        </h1>
      </div>
      <Separator />
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup className="grid gap-6 w-full max-w-5xl mx-auto">
          {images.length < 10 && (
            <Field className="gap-1">
              <FieldLabel>Gambar Batch ({images.length}/10)</FieldLabel>
              <DropzoneList
                onChange={handleImageChange}
                value={imageFiles}
                maxFiles={10 - images.length}
                maxSize={5 * 1024 * 1024}
                accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
                isEdit={isEdit}
              />
            </Field>
          )}

          {images.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium">Daftar Gambar Batch</p>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-300 p-3 sm:grid-cols-4 xl:grid-cols-5 dark:border-gray-700">
                {images.map((image, index) => (
                  <div key={image.id} className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <div className="relative aspect-square overflow-hidden rounded-md shadow">
                      {image.url && <Image src={image.url} alt={image.original_name ?? `Gambar batch ${index + 1}`} fill sizes="(max-width: 640px) 45vw, (max-width: 1280px) 22vw, 180px" className="object-cover" />}
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <Button type="button" size="icon-sm" variant="ghost" disabled={index === 0} onClick={() => moveImage(index, "up")}><ArrowUp className="size-3.5" /></Button>
                      <Button type="button" size="icon-sm" variant="ghost" disabled={index === images.length - 1} onClick={() => moveImage(index, "down")}><ArrowDown className="size-3.5" /></Button>
                      <Button type="button" size="icon-sm" variant="ghost" className="hover:bg-red-200 dark:hover:bg-red-500/30" onClick={() => setImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-3.5 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mx-auto grid w-full gap-6">
            {originType === "SUPPLIER" ? (
              <Field className="gap-2 rounded-lg border p-4">
                <div>
                  <FieldLabel htmlFor="supplier-items-excel">Impor item supplier dari Excel (.xlsx)</FieldLabel>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pilih sheet pertama. Tentukan kolom nama item, harga, dan qty; hasil impor mengganti daftar item dan membuat PDF berjudul sesuai Nama ID batch.
                  </p>
                </div>
                <input
                  id="supplier-items-excel"
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  disabled={isDisabled}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2"
                  onChange={(event) => handleExcelSelected(event.target.files?.[0])}
                />
                {excelFile && <p className="text-xs text-muted-foreground">File: {excelFile.name}</p>}
                {isPreviewingExcel && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner className="size-3.5" /> Membaca kolom Excel...</div>}
                {excelPreview && (
                  <div className="grid gap-3 rounded-md bg-muted/30 p-3 sm:grid-cols-3">
                    {([
                      ["name", "Kolom Nama Item", nameColumn, setNameColumn],
                      ["price", "Kolom Harga", priceColumn, setPriceColumn],
                      ["quantity", "Kolom Qty", quantityColumn, setQuantityColumn],
                    ] as const).map(([key, label, value, setValue]) => (
                      <label key={key} className="grid gap-1 text-xs font-medium">
                        {label}
                        <select
                          value={value}
                          onChange={(event) => setValue(event.target.value)}
                          disabled={isDisabled}
                          className="h-9 rounded-md border bg-background px-2 text-xs font-normal"
                        >
                          <option value="">Pilih kolom...</option>
                          {excelPreview.columns.map((column) => (
                            <option key={column.index} value={column.index}>
                              {column.letter} — {column.header}{column.samples[0] ? ` (contoh: ${column.samples[0]})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <p className="text-xs text-muted-foreground sm:col-span-3">
                      Sheet: {excelPreview.sheet_name}. PDF berisi tabel nama item, harga satuan, qty, dan subtotal.
                    </p>
                    <Button
                      type="button"
                      className="sm:col-span-3 sm:justify-self-end"
                      disabled={isDisabled || !nameColumn || !priceColumn || !quantityColumn}
                      onClick={handleImportExcel}
                    >
                      <Plus className="size-3.5" />
                      Impor Item & Buat PDF
                    </Button>
                  </div>
                )}
                {pdf && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                    <p className="min-w-0 break-all text-xs text-muted-foreground">
                      PDF daftar item: {pdf.original_name ?? "Daftar item supplier"}
                    </p>
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button type="button" variant="outline" size="sm">
                            <Eye className="size-4" />
                            Lihat PDF
                          </Button>
                        }
                      />
                      <DialogContent showCloseButton={false} className="w-[min(96vw,88rem)] max-w-none sm:max-w-[88rem]">
                        <DialogHeader>
                          <DialogTitle>Pratinjau PDF daftar item</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-center overflow-hidden rounded-md shadow">
                          <PDFViewer file={pdf.url ? getPdfPreviewUrl(pdf.url) : undefined} />
                        </div>
                        <DialogFooter>
                          <DialogClose render={<Button type="button"><X /> Tutup</Button>} />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </Field>
            ) : (
              <Field className="gap-1">
                <FieldLabel>Dokumen PDF (Opsional)</FieldLabel>
                <DropzonePDF
                  onChange={handlePdfChange}
                  value={pdfFiles}
                  oldValue={pdf?.url}
                  onRemoveOld={() => setPdf(null)}
                />
              </Field>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                name="nama_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required>Nama ID</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nama batch (ID)..."
                        autoComplete="off"
                      />
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Nama EN</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nama batch (EN)..."
                        autoComplete="off"
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Textarea
                    {...field}
                    className="min-h-[90px]"
                    placeholder="Deskripsi batch..."
                  />
                </Field>
              )}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                name="kategori_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kategori</FieldLabel>
                    <Combobox
                      items={kategoriOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v, kategoriOptions)}
                    >
                      <ComboboxInput placeholder="Pilih kategori..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="kondisi_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kondisi Produk</FieldLabel>
                    <Combobox
                      items={kondisiOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v, kondisiOptions)}
                    >
                      <ComboboxInput placeholder="Pilih kondisi..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="kondisi_paket_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kondisi Paket</FieldLabel>
                    <Combobox
                      items={kondisiPaketOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v, kondisiPaketOptions)}
                    >
                      <ComboboxInput placeholder="Pilih kondisi paket..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="sumber_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Sumber</FieldLabel>
                    <Combobox
                      items={sumberOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v, sumberOptions)}
                    >
                      <ComboboxInput placeholder="Pilih sumber..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="discrepancy_percentage"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Discrepancy (%)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        autoComplete="off"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <Controller
                name="panjang_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Panjang (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="lebar_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Lebar (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="tinggi_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Tinggi (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="berat_kg"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Berat (kg)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
            </div>
          </div>

          <ItemPicker items={items} />

          <SummaryCards
            grandTotal={grandTotal}
            totalQuantity={totalQuantity}
            volumeM3={volumeM3}
            minBidAmount={minBidAmount}
          />

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            {isEdit && batch?.status === "DRAFT" && (
              <Button
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Buka Lelang
              </Button>
            )}
            <Button type="submit" disabled={isDisabled}>
              {isSaving ? (
                <Spinner className="size-3.5" />
              ) : (
                <Save className="size-3.5" />
              )}
              Simpan Draft
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

const getSelectId = (value: any) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.id === "string")
    return value.id;
  return "";
};

const ItemPicker = ({ items }: { items: BatchItem[] }) => (
  <div className="flex flex-col gap-4 rounded-lg border p-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Item Batch</h3>
      <span className="text-xs text-muted-foreground">{items.length} item</span>
    </div>
    <p className="text-xs text-muted-foreground">
      Daftar item berasal dari file Excel. Upload dan impor ulang file untuk memperbarui item sekaligus PDF.
    </p>
    {items.length > 0 ? (
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Nama Item</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.produk_id} className="border-t">
                <td className="px-3 py-2">{item.nama_snapshot}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatRupiah(item.unit_price)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatRupiah(String((Number(item.unit_price) || 0) * item.quantity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada item. Upload file Excel dan pilih kolom nama item, harga, serta qty untuk mengimpor daftar.
      </div>
    )}
  </div>
);

const SummaryCards = ({
  grandTotal,
  totalQuantity,
  volumeM3,
  minBidAmount,
}: {
  grandTotal: number;
  totalQuantity: number;
  volumeM3: number;
  minBidAmount: number;
}) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Grand Total</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {formatRupiah(grandTotal)}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Total Qty</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {totalQuantity}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Volume (m³)</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {volumeM3.toFixed(3)}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Min Bid (0.1%)</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {formatRupiah(minBidAmount)}
      </p>
    </div>
  </div>
);
