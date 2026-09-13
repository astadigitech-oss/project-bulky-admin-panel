"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { AssetCrop, AssetCropEditor, AssetTarget, defaultAssetCrop } from "./asset-crop-editor";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Sparkles } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

type AssetOnboardingProps = {
  label: string;
  description: string;
  recommendation: string;
  ratio: "banner" | "hero";
  target: AssetTarget;
  value?: File[];
  existing?: string | null;
  crop: AssetCrop;
  disabled?: boolean;
  accept: Record<string, string[]>;
  maxSize: number;
  onUse: (file: File, crop: AssetCrop) => void;
  renderPreview: (file: File, crop: AssetCrop) => ReactNode;
};

const steps = ["Pilih file", "Sesuaikan", "Preview"];

// The API may return an absolute backend URL. Route persisted uploads through
// the admin proxy so browser previews keep working when that backend host is
// only reachable from the Next.js server.
const resolveStoredAssetURL = (value: string) => {
  const uploadsIndex = value.indexOf("/uploads/");
  if (uploadsIndex >= 0) return value.slice(uploadsIndex);
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `/uploads/${value.replace(/^\/?uploads\//, "")}`;
};

const useImageSource = (file?: File, existing?: string | null) => {
  // Keep this URL alive for the form lifetime. Revoking it from an effect is
  // unsafe in development Strict Mode because React may clean up and replay
  // the effect while the same thumbnail is still rendered.
  const localURL = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  return localURL ?? (existing ? resolveStoredAssetURL(existing) : null);
};

export const AssetOnboarding = ({
  label,
  description,
  recommendation,
  ratio,
  target,
  value,
  existing,
  crop,
  disabled,
  accept,
  maxSize,
  onUse,
  renderPreview,
}: AssetOnboardingProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftCrop, setDraftCrop] = useState<AssetCrop>(defaultAssetCrop);
  const assignedFile = value?.[0];
  const imageSource = useImageSource(assignedFile, existing);
  const configured = Boolean(assignedFile || existing);
  const thumbnailObjectFit = target.width / target.height >= 8 ? "object-cover" : "object-contain";

  const start = () => {
    setDraftFile(assignedFile ?? null);
    setDraftCrop(crop);
    setStep(assignedFile ? 1 : 0);
    setOpen(true);
  };
  const choose = (files: File[]) => {
    setDraftFile(files[0] ?? null);
    setDraftCrop({ ...defaultAssetCrop });
  };
  const useAsset = () => {
    if (!draftFile) return;
    onUse(draftFile, draftCrop);
    setOpen(false);
  };

  return (
    <>
      <div className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center">
        <div className="min-w-0"><div className="mb-1 flex items-center gap-2"><FieldStatus configured={configured} /><p className="font-medium text-sm">{label}</p></div><p className="text-xs text-muted-foreground">{description}</p><p className="mt-2 text-xs text-primary">{recommendation}</p></div>
        <div className="flex items-center gap-3 sm:justify-end">
          {imageSource && <div className="h-12 w-20 shrink-0 overflow-hidden rounded border bg-muted" style={{ aspectRatio: `${target.width} / ${target.height}` }}><img src={imageSource} alt={label} className={`size-full ${thumbnailObjectFit}`} /></div>}
          <Button type="button" variant={configured ? "outline" : "default"} size="sm" disabled={disabled} onClick={start}><ImagePlus className="size-3.5" />{configured ? "Atur ulang" : "Upload asset"}</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-3rem)] w-[calc(100vw-4rem)] max-w-[calc(100vw-4rem)] !overflow-y-hidden overflow-x-hidden p-0 sm:!max-w-[1180px]" showCloseButton={false}>
          <DialogHeader className="border-b px-5 py-4 pr-12"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><DialogTitle>Atur {label}</DialogTitle><DialogDescription>{step === 0 ? "Mulai dengan memilih file sumber." : step === 1 ? "Tentukan framing terbaik untuk area tampilan asset." : "Pastikan hasilnya sesuai sebelum digunakan di campaign."}</DialogDescription></div><div className="flex shrink-0 items-center gap-2">{steps.map((item, index) => <div key={item} className="flex items-center gap-2"><span className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ${index <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index < step ? <Check className="size-3" /> : index + 1}</span><span className={`text-xs ${index === step ? "font-medium" : "text-muted-foreground"}`}>{item}</span>{index < steps.length - 1 && <span className="h-px w-5 bg-border" />}</div>)}</div></div></DialogHeader>
          <DialogBody className="min-h-[420px] px-5 py-5">
            {step === 0 && <div className="grid min-h-[340px] gap-5 py-3 md:grid-cols-2 md:items-stretch"><div className="flex flex-col justify-between rounded-xl border border-dashed bg-muted/20 p-6"><div><Sparkles className="mb-4 size-6 text-primary" /><p className="font-medium text-base">Pilih file {label.toLowerCase()}</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">JPG, PNG, atau WebP hingga 10MB. Jangan khawatir soal ukuran awal. Di langkah berikutnya Anda dapat mengatur crop dan zoom.</p></div><p className="mt-8 text-xs text-muted-foreground">{recommendation}</p></div><div className="min-w-0"><Dropzone value={draftFile ? [draftFile] : []} onChange={choose} accept={accept} maxSize={maxSize} ratio={ratio} className="h-full" dropAreaClassName="!h-full !max-h-none !aspect-auto" replaceLabel="Pilih file lain" replaceButtonVariant="outline" previewObjectFit="contain" /></div></div>}
            {step === 1 && draftFile && <AssetCropEditor file={draftFile} label={label} target={target} value={draftCrop} onChange={setDraftCrop} disabled={disabled} />}
            {step === 2 && draftFile && <div className="grid gap-4">{renderPreview(draftFile, draftCrop)}</div>}
          </DialogBody>
          <DialogFooter className="!mx-0 !mb-0 px-5 py-4 sm:!justify-between"><Button type="button" variant="destructive" onClick={() => setOpen(false)}>Batal</Button><div className="flex flex-col-reverse gap-2 sm:flex-row">{step > 0 && <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)}><ArrowLeft className="size-3.5" />Kembali</Button>}{step < 2 ? <Button type="button" disabled={!draftFile} onClick={() => setStep((current) => current + 1)}>Lanjut<ArrowRight className="size-3.5" /></Button> : <Button type="button" onClick={useAsset}><Check className="size-3.5" />Gunakan asset ini</Button>}</div></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const FieldStatus = ({ configured }: { configured: boolean }) => <span className={`size-2 rounded-full ${configured ? "bg-emerald-500" : "bg-muted-foreground/40"}`} aria-label={configured ? "Asset siap digunakan" : "Asset belum diatur"} />;
