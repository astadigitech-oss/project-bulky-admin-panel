"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useId, useState } from "react";
import { Info, Send, X } from "lucide-react";
import { Lottie } from "lottie-react";
import z from "zod";
import { useCreateSeasonalCampaign, useUpdateSeasonalCampaign } from "../../_api";
import { SeasonalCampaign } from "../../_api/types";
import { useRouter } from "next/navigation";
import { SeasonalCampaignVisualPreview } from "../storefront-preview";
import { AssetCrop, assetTargets, defaultAssetCrop, renderCroppedAsset } from "../asset-crop-editor";
import { AssetOnboarding } from "../asset-onboarding";
import { useMe } from "@/components/container/_api";

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxFileSize = 10 * 1024 * 1024;

const formSchema = z.object({
  nama: z.string().trim().min(1, "Nama campaign wajib diisi").max(100),
  tanggal_mulai: z.string().optional(),
  tanggal_selesai: z.string().optional(),
  web_logo: z.array(z.file().max(maxFileSize, "Ukuran maksimal 10MB").mime(imageMimeTypes)).max(1).optional(),
  web_navbar_decoration: z.array(z.file().max(maxFileSize, "Ukuran maksimal 10MB").mime(imageMimeTypes)).max(1).optional(),
  mobile_top_app_bar_ornament: z.array(z.file().max(maxFileSize, "Ukuran maksimal 10MB").mime(imageMimeTypes)).max(1).optional(),
  remove_web_logo: z.boolean(),
  remove_web_navbar_decoration: z.boolean(),
  remove_mobile_top_app_bar_ornament: z.boolean(),
}).superRefine((value, ctx) => {
  if (!!value.tanggal_mulai !== !!value.tanggal_selesai) {
    ctx.addIssue({ code: "custom", path: ["tanggal_mulai"], message: "Tanggal mulai dan selesai harus diisi bersamaan" });
  }
  if (value.tanggal_mulai && value.tanggal_selesai && new Date(value.tanggal_selesai) <= new Date(value.tanggal_mulai)) {
    ctx.addIssue({ code: "custom", path: ["tanggal_selesai"], message: "Tanggal selesai harus setelah tanggal mulai" });
  }
});

type FormValues = z.infer<typeof formSchema>;
type CropByAsset = Record<"web_logo" | "web_navbar_decoration" | "mobile_top_app_bar_ornament", AssetCrop>;
type SaveStage = "framing" | "saving" | null;

const initialCrops = (): CropByAsset => ({
  web_logo: { ...defaultAssetCrop },
  web_navbar_decoration: { ...defaultAssetCrop },
  mobile_top_app_bar_ornament: { ...defaultAssetCrop },
});

const targetByAsset = {
  web_logo: assetTargets.webLogo,
  web_navbar_decoration: assetTargets.webNavbarDecoration,
  mobile_top_app_bar_ornament: assetTargets.mobileTopAppBarOrnament,
} satisfies Record<keyof CropByAsset, (typeof assetTargets)[keyof typeof assetTargets]>;

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const SaveProgressDialog = ({ stage, mode }: { stage: SaveStage; mode: "create" | "edit" | null }) => {
  const isOpen = stage !== null;
  const isFraming = stage === "framing";
  const isUpdating = mode === "edit";

  return <Dialog open={isOpen}>
    <DialogContent className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
      <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
        <Lottie src="/assets/lottie/pc-to-cloud-server.json" loop autoplay className="mx-auto h-32 w-40 sm:mx-0" aria-label="Animasi proses penyimpanan aset" />
        <DialogHeader className="items-start gap-2 text-left">
          <DialogTitle>{isFraming ? "Menyiapkan aset" : isUpdating ? "Memperbarui campaign" : "Menyimpan campaign baru"}</DialogTitle>
          <DialogDescription className="max-w-sm text-left leading-relaxed">
          {isFraming
            ? "Framing aset sedang disiapkan untuk setiap platform."
            : isUpdating
              ? "Perubahan dan aset sedang dioptimalkan ke WebP, lalu disimpan ke storage serta database. Jangan tutup halaman ini."
              : "Campaign dan aset sedang dioptimalkan ke WebP, lalu disimpan ke storage serta database. Jangan tutup halaman ini."}
          </DialogDescription>
        </DialogHeader>
      </div>
      <div className="border-t bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground sm:text-right" aria-live="polite">
        {isFraming ? "Menyiapkan ukuran platform…" : isUpdating ? "Menunggu pembaruan dikonfirmasi server…" : "Menunggu penyimpanan dikonfirmasi server…"}
      </div>
    </DialogContent>
  </Dialog>;
};

export const SeasonalCampaignForm = ({
  mode,
  detail,
  isDisabled,
}: {
  mode: "create" | "edit" | null;
  detail?: SeasonalCampaign;
  isDisabled?: boolean;
}) => {
  const formID = useId();
  const router = useRouter();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const canManage = meData?.data?.permissions?.includes("marketing:manage") ?? false;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nama: "", tanggal_mulai: "", tanggal_selesai: "", web_logo: [], web_navbar_decoration: [], mobile_top_app_bar_ornament: [], remove_web_logo: false, remove_web_navbar_decoration: false, remove_mobile_top_app_bar_ornament: false },
  });
  const { mutate: createCampaign, isPending: isCreating } = useCreateSeasonalCampaign();
  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateSeasonalCampaign();
  const [crops, setCrops] = useState<CropByAsset>(initialCrops);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const loading = !!isDisabled || isCreating || isUpdating || isProcessingImages;
  const saveStage: SaveStage = isProcessingImages ? (isCreating || isUpdating ? "saving" : "framing") : null;
  const [webLogo, webNavbarDecoration, mobileTopAppBarOrnament, removeWebLogo, removeWebNavbarDecoration, removeMobileTopAppBarOrnament] = useWatch({
    control: form.control,
    name: ["web_logo", "web_navbar_decoration", "mobile_top_app_bar_ornament", "remove_web_logo", "remove_web_navbar_decoration", "remove_mobile_top_app_bar_ornament"],
  });

  useEffect(() => {
    form.reset({
      nama: detail?.nama ?? "",
      tanggal_mulai: toDateTimeLocal(detail?.tanggal_mulai),
      tanggal_selesai: toDateTimeLocal(detail?.tanggal_selesai),
      web_logo: [], web_navbar_decoration: [], mobile_top_app_bar_ornament: [],
      remove_web_logo: false, remove_web_navbar_decoration: false, remove_mobile_top_app_bar_ornament: false,
    });
  }, [detail?.id, mode]);

  useEffect(() => {
    if (!isLoadingMe && !canManage) router.replace("/marketing/seasonal-campaigns");
  }, [canManage, isLoadingMe, router]);

  const close = () => { form.reset(); router.push("/marketing/seasonal-campaigns"); };
  const onSubmit = async (values: FormValues) => {
    setIsProcessingImages(true);
    let webLogoFile: File | undefined;
    let webNavbarDecorationFile: File | undefined;
    let mobileTopAppBarOrnamentFile: File | undefined;
    try {
      [webLogoFile, webNavbarDecorationFile, mobileTopAppBarOrnamentFile] = await Promise.all([
        values.web_logo?.[0] ? renderCroppedAsset(values.web_logo[0], assetTargets.webLogo, crops.web_logo) : undefined,
        values.web_navbar_decoration?.[0] ? renderCroppedAsset(values.web_navbar_decoration[0], assetTargets.webNavbarDecoration, crops.web_navbar_decoration) : undefined,
        values.mobile_top_app_bar_ornament?.[0] ? renderCroppedAsset(values.mobile_top_app_bar_ornament[0], assetTargets.mobileTopAppBarOrnament, crops.mobile_top_app_bar_ornament) : undefined,
      ]);
    } catch (error) {
      form.setError("web_logo", { message: error instanceof Error ? error.message : "Gambar gagal diproses." });
      setIsProcessingImages(false);
      return;
    }
    const body = new FormData();
    body.append("nama", values.nama.trim());
    if (values.tanggal_mulai && values.tanggal_selesai) {
      body.append("tanggal_mulai", new Date(values.tanggal_mulai).toISOString());
      body.append("tanggal_selesai", new Date(values.tanggal_selesai).toISOString());
    } else if (mode === "edit") {
      body.append("tanggal_mulai", "");
      body.append("tanggal_selesai", "");
    }
    if (webLogoFile) body.append("web_logo", webLogoFile);
    if (webNavbarDecorationFile) body.append("web_navbar_decoration", webNavbarDecorationFile);
    if (mobileTopAppBarOrnamentFile) body.append("mobile_top_app_bar_ornament", mobileTopAppBarOrnamentFile);
    if (mode === "edit") {
      if (values.remove_web_logo) body.append("remove_web_logo", "true");
      if (values.remove_web_navbar_decoration) body.append("remove_web_navbar_decoration", "true");
      if (values.remove_mobile_top_app_bar_ornament) body.append("remove_mobile_top_app_bar_ornament", "true");
      updateCampaign({ body, params: { id: detail?.id ?? "" } }, { onSuccess: close, onSettled: () => setIsProcessingImages(false) });
    } else {
      createCampaign({ body, params: {} }, { onSuccess: close, onSettled: () => setIsProcessingImages(false) });
    }
  };

  const assetFields: Array<{ name: "web_logo" | "web_navbar_decoration" | "mobile_top_app_bar_ornament"; remove: "remove_web_logo" | "remove_web_navbar_decoration" | "remove_mobile_top_app_bar_ornament"; label: string; description: string; recommendation: string; oldValue?: string | null; ratio: "banner" | "hero" }> = [
    { name: "web_logo", remove: "remove_web_logo", label: "Logo Website & Loading Mobile", description: "Satu framing logo digunakan untuk navbar website dan loading screen aplikasi setelah splash screen.", recommendation: "Rekomendasi file master: minimal 2048 × 432 px, rasio sekitar 4.75:1. Sistem membuat ukuran proporsional untuk tiap platform.", oldValue: detail?.assets.web_logo_url, ratio: "banner" },
    { name: "web_navbar_decoration", remove: "remove_web_navbar_decoration", label: "Ornamen Navbar Website", description: "Ornamen horizontal di bawah navbar website.", recommendation: "Rekomendasi: 1920 × 160 px (sekitar 12:1). Letakkan elemen penting di tengah karena sisi dapat terpotong pada layar sempit.", oldValue: detail?.assets.web_navbar_decoration_url, ratio: "banner" },
    { name: "mobile_top_app_bar_ornament", remove: "remove_mobile_top_app_bar_ornament", label: "Ornamen Top App Bar Mobile", description: "Background ornamen untuk top app bar aplikasi.", recommendation: "Rekomendasi: 1080 × 240 px (sekitar 4.5:1). Hindari teks; area tengah paling aman untuk perangkat berbeda.", oldValue: detail?.assets.mobile_top_app_bar_ornament_url, ratio: "hero" },
  ];
  const assetVisualPreviewFor = (assetName: keyof CropByAsset, file: File, nextCrop: AssetCrop) => <SeasonalCampaignVisualPreview previewTarget={assetName} webLogo={assetName === "web_logo" ? [file] : webLogo} mobileLoadingLogo={assetName === "web_logo" ? [file] : webLogo} webNavbarDecoration={assetName === "web_navbar_decoration" ? [file] : webNavbarDecoration} mobileTopAppBarOrnament={assetName === "mobile_top_app_bar_ornament" ? [file] : mobileTopAppBarOrnament} existing={{ webLogo: detail?.assets.web_logo_url, mobileLoadingLogo: detail?.assets.mobile_loading_logo_url, webNavbarDecoration: detail?.assets.web_navbar_decoration_url, mobileTopAppBarOrnament: detail?.assets.mobile_top_app_bar_ornament_url }} removed={{ webLogo: assetName === "web_logo" ? false : removeWebLogo, mobileLoadingLogo: assetName === "web_logo" ? false : removeWebLogo, webNavbarDecoration: assetName === "web_navbar_decoration" ? false : removeWebNavbarDecoration, mobileTopAppBarOrnament: assetName === "mobile_top_app_bar_ornament" ? false : removeMobileTopAppBarOrnament }} crops={{ webLogo: assetName === "web_logo" ? nextCrop : crops.web_logo, mobileLoadingLogo: assetName === "web_logo" ? nextCrop : crops.web_logo, webNavbarDecoration: assetName === "web_navbar_decoration" ? nextCrop : crops.web_navbar_decoration, mobileTopAppBarOrnament: assetName === "mobile_top_app_bar_ornament" ? nextCrop : crops.mobile_top_app_bar_ornament }} />;

  if (isLoadingMe || !canManage) {
    return <div className="mx-auto w-full max-w-4xl pt-4"><Skeleton className="h-10 w-72" /><Skeleton className="mt-6 h-[38rem] w-full" /></div>;
  }

  return (
    <><SaveProgressDialog stage={saveStage} mode={mode} /><div className="mx-auto w-full max-w-4xl pb-8 pt-4">
      <div className="mb-6"><h1 className="font-semibold text-2xl">{mode === "edit" ? "Ubah Campaign Seasonal" : "Tambah Campaign Seasonal"}</h1><p className="mt-1 text-sm text-muted-foreground">Atur periode dan asset branding campaign. Asset bersifat opsional.</p></div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {mode === "edit" && !detail ? <Skeleton className="h-96 w-full" /> : <FieldGroup className="grid gap-5">
            <div>
              <Controller name="nama" control={form.control} disabled={loading} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel required htmlFor={`${formID}-nama`}>Nama Campaign</FieldLabel><Input {...field} id={`${formID}-nama`} placeholder="Contoh: Hari Kemerdekaan" aria-invalid={fieldState.invalid} /><FieldError errors={[fieldState.error]} /></Field>} />
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-300/30 dark:bg-blue-400/10 dark:text-blue-200"><Info className="mr-1 inline size-3.5" />Periode boleh dikosongkan saat draft. Campaign hanya dapat dipublish jika kedua tanggal terisi.</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller name="tanggal_mulai" control={form.control} disabled={loading} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`${formID}-start`}>Tanggal Mulai</FieldLabel><Input {...field} id={`${formID}-start`} type="datetime-local" aria-invalid={fieldState.invalid} /><FieldError errors={[fieldState.error]} /></Field>} />
              <Controller name="tanggal_selesai" control={form.control} disabled={loading} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`${formID}-end`}>Tanggal Selesai</FieldLabel><Input {...field} id={`${formID}-end`} type="datetime-local" aria-invalid={fieldState.invalid} /><FieldError errors={[fieldState.error]} /></Field>} />
            </div>
            <div className="grid gap-5 border-t pt-5">
              {assetFields.map((asset) => <div key={asset.name} className="grid gap-2"><Controller name={asset.name} control={form.control} disabled={loading} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><AssetOnboarding label={asset.label} description={asset.description} recommendation={asset.recommendation} ratio={asset.ratio} target={targetByAsset[asset.name]} value={field.value ?? []} existing={asset.oldValue} crop={crops[asset.name]} disabled={loading} accept={Object.fromEntries(imageMimeTypes.map((mime) => [mime, []]))} maxSize={maxFileSize} onUse={(file, nextCrop) => { field.onChange([file]); setCrops((current) => ({ ...current, [asset.name]: nextCrop })); form.setValue(asset.remove, false); }} renderPreview={(file, nextCrop) => assetVisualPreviewFor(asset.name, file, nextCrop)} /><FieldError errors={[fieldState.error]} /></Field>} />{mode === "edit" && asset.oldValue && <Controller name={asset.remove} control={form.control} disabled={loading} render={({ field }) => <div className="flex items-center justify-between rounded border px-3 py-2"><span className="text-xs">Hapus asset ini dari campaign</span><Switch checked={field.value} onCheckedChange={field.onChange} size="sm" /></div>} />}</div>)}
            </div>
          </FieldGroup>}
        <div className="flex justify-end gap-2 border-t pt-5"><Button type="button" variant="outline" disabled={loading} onClick={close}><X className="size-3.5" />Batal</Button><Button type="submit" disabled={loading}><Send className="size-3.5" />Simpan Draft</Button></div>
      </form>
    </div></>
  );
};
