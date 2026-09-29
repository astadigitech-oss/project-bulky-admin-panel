"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, ZoomIn } from "lucide-react";
import { useMemo } from "react";

export type AssetCrop = {
  /** 1 means the complete source is fitted inside the frame. */
  zoom: number;
  /** Position inside the available cropped area, from -100 to 100. */
  x: number;
  y: number;
};

export type AssetTarget = {
  width: number;
  height: number;
};

export const assetTargets = {
  webLogo: { width: 2048, height: 432 },
  mobileLoadingLogo: { width: 822, height: 294 },
  webNavbarDecoration: { width: 1920, height: 160 },
  mobileTopAppBarOrnament: { width: 1080, height: 240 },
} satisfies Record<string, AssetTarget>;

export const defaultAssetCrop: AssetCrop = { zoom: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getCanvasPlacement = (image: HTMLImageElement, target: AssetTarget, crop: AssetCrop) => {
  // Start with the entire source visible. Transparent space is intentionally
  // retained when the source ratio differs from the platform frame.
  const baseScale = Math.min(target.width / image.naturalWidth, target.height / image.naturalHeight);
  const scale = baseScale * crop.zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const maxX = Math.abs(width - target.width) / 2;
  const maxY = Math.abs(height - target.height) / 2;

  return {
    width,
    height,
    x: (target.width - width) / 2 + (clamp(crop.x, -100, 100) / 100) * maxX,
    y: (target.height - height) / 2 + (clamp(crop.y, -100, 100) / 100) * maxY,
  };
};

/** Creates the framed WebP image that will be sent to the API. */
export const renderCroppedAsset = async (file: File, target: AssetTarget, crop: AssetCrop) => {
  const sourceURL = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = sourceURL;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak mendukung pemrosesan gambar.");

    const placement = getCanvasPlacement(image, target, crop);
    context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
    if (!blob) throw new Error("Gambar gagal diproses.");
    const filename = `${file.name.replace(/\.[^.]+$/, "")}-cropped.webp`;
    return new File([blob], filename, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceURL);
  }
};

/** Creates a transparent-padded platform variant without changing the chosen framing. */
export const renderContainedAsset = async (file: File, target: AssetTarget) => {
  const sourceURL = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = sourceURL;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak mendukung pemrosesan gambar.");

    const placement = getCanvasPlacement(image, target, defaultAssetCrop);
    context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
    if (!blob) throw new Error("Gambar gagal diproses.");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-preview.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceURL);
  }
};

const cropTransform = (crop: AssetCrop) => {
  const offsetFactor = Math.max(crop.zoom - 0.55, 0) * 0.3;
  return `translate(${crop.x * offsetFactor}%, ${crop.y * offsetFactor}%) scale(${crop.zoom})`;
};

export const CropAssetImage = ({ src, alt, crop, className }: { src: string; alt: string; crop?: AssetCrop; className?: string }) => (
  <img src={src} alt={alt} className={className} style={{ transform: cropTransform(crop ?? defaultAssetCrop), transformOrigin: "center" }} />
);

export const AssetCropEditor = ({
  file,
  label,
  target,
  value,
  onChange,
  disabled,
}: {
  file: File;
  label: string;
  target: AssetTarget;
  value: AssetCrop;
  onChange: (crop: AssetCrop) => void;
  disabled?: boolean;
}) => {
  const sourceURL = useMemo(() => URL.createObjectURL(file), [file]);
  const ratio = `${target.width} / ${target.height}`;
  const update = (key: keyof AssetCrop, next: number | readonly number[]) => onChange({ ...value, [key]: typeof next === "number" ? next : next[0] });

  return (
    <div className="mt-3 grid gap-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium">Atur framing {label}</p><p className="text-xs text-muted-foreground">Posisikan elemen utama di tengah frame dan sisakan ruang seimbang di kiri serta kanan.</p></div><Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => onChange(defaultAssetCrop)}><RotateCcw className="size-3.5" />Reset</Button></div>
      <div className="grid gap-4">
        <div className="grid content-start gap-3">
          <div className="relative w-full overflow-hidden rounded border border-border/70 bg-[#0d1420] bg-[linear-gradient(45deg,#172235_25%,transparent_25%),linear-gradient(-45deg,#172235_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#172235_75%),linear-gradient(-45deg,transparent_75%,#172235_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]" style={{ aspectRatio: ratio }}>
            <CropAssetImage src={sourceURL} alt={`Framing ${label}`} crop={value} className="size-full object-contain" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5 text-xs"><span className="flex items-center gap-1"><ZoomIn className="size-3" />Zoom {Math.round(value.zoom * 100)}%</span><Slider value={[value.zoom]} min={0.55} max={3} step={0.01} disabled={disabled} onValueChange={(next) => update("zoom", next)} /></label>
            <label className="grid gap-1.5 text-xs"><span>Geser horizontal</span><Slider value={[value.x]} min={-100} max={100} step={1} disabled={disabled} onValueChange={(next) => update("x", next)} /></label>
            <label className="grid gap-1.5 text-xs"><span>Geser vertikal</span><Slider value={[value.y]} min={-100} max={100} step={1} disabled={disabled} onValueChange={(next) => update("y", next)} /></label>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Ukuran keluaran: {target.width} × {target.height} px, WebP. Area kosong akan tetap transparan.</p>
    </div>
  );
};
