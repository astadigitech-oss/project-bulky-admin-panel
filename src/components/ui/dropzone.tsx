import { cn, sizesImage } from "@/lib/utils";
import { UploadCloud, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";

type DropzoneProps = {
  value?: File[]; // 🔑 ganti ke File[]
  onChange: (files: File[]) => void;
  disabled?: boolean;
  error?: boolean;
  onError?: (message: string) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  oldValue?: string;
  /**
   * Rasio "area aman" (width / height) yang akan digambar sebagai overlay di
   * atas preview, mensimulasikan area yang tetap terlihat setelah gambar
   * di-crop `object-fit: cover` pada rasio lain (mis. mobile app).
   * Contoh: 2 untuk rasio 2:1.
   */
  safeAreaRatio?: number;
  /** Label overlay safe area, default "Aman di mobile". */
  safeAreaLabel?: string;
};

// Nilai numerik (width / height) untuk tiap opsi `ratio`, dipakai untuk
// menghitung proporsi overlay safe area.
const RATIO_ASPECT_VALUE = {
  square: 1,
  banner: 4,
  hero: 2,
  portrait: 9 / 16,
} as const;

export const Dropzone = ({
  value = [] as File[],
  onChange,
  disabled,
  onError,
  error,
  oldValue,
  ratio = "square",
  safeAreaRatio,
  safeAreaLabel,
  accept = {
    "image/jpeg": [],
    "image/png": [],
    "image/webp": [],
  },
  maxSize = 10 * 1024 * 1024,
  maxFiles = 1,
}: DropzoneProps & { ratio?: "square" | "banner" | "hero" | "portrait" }) => {
  const [hiddenOldValue, setHiddenOldValue] = useState<string | null>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    accept,
    maxFiles,
    maxSize,
    onDrop: (files) => {
      setHiddenOldValue(oldValue ?? null);
      onChange(files); // ✅ langsung File[]
    },
    onDropRejected: (rejections) => {
      const first = rejections[0];
      if (!first) return;

      const error = first.errors[0];
      if (!error) return;

      // Mapping error bawaan dropzone → message kita
      switch (error.code) {
        case "file-too-large":
          onError?.("Ukuran file melebihi batas 10MB");
          break;
        case "file-invalid-type":
          onError?.("Format file tidak didukung");
          break;
        case "too-many-files":
          onError?.(`Hanya boleh ${maxFiles} file`);
          break;
        default:
          onError?.("File tidak valid");
      }
    },
  });

  const resetLogo = () => {
    setHiddenOldValue(oldValue ?? null);
    onChange([]);
  };

  const filePreview = useMemo(() => {
    if (!value?.length) return "";
    return URL.createObjectURL(value[0]);
  }, [value]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const preview =
    filePreview || (hiddenOldValue === oldValue ? "" : (oldValue ?? ""));

  return (
    <div className={cn(ratio === "square" ? "h-32" : "w-full")}>
      {preview ? (
        <div
          className={cn(
            "size-full flex gap-3",
            ratio === "square" ? "flex-row" : "flex-col",
          )}
        >
          <div
            className={cn(
              "h-full rounded-md overflow-hidden border shadow relative border-gray-300 dark:border-gray-300/50",
              ratio === "square"
                ? "aspect-square"
                : ratio === "hero"
                  ? "aspect-2/1"
                  : ratio === "portrait"
                    ? "aspect-9/16"
                    : "aspect-4/1",
            )}
          >
            <Image
              src={preview}
              alt="preview_logo"
              fill
              sizes={sizesImage}
              className="object-cover"
              loading="eager"
            />
            {safeAreaRatio ? (
              <SafeAreaOverlay
                containerRatio={RATIO_ASPECT_VALUE[ratio]}
                safeAreaRatio={safeAreaRatio}
                label={safeAreaLabel}
              />
            ) : null}
          </div>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={resetLogo}
            type="button"
          >
            <XIcon />
            Ganti {ratio === "square" ? "Logo" : ratio === "portrait" ? "Thumbnail" : "Banner"}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center justify-center border rounded-md p-4 flex-col gap-2 cursor-pointer transition",
            ratio === "square"
              ? "h-full"
              : ratio === "hero"
                ? "w-full aspect-2/1 max-h-56"
                : ratio === "portrait"
                  ? "w-full aspect-9/16"
                  : "w-full aspect-4/1",
            isDragActive
              ? "animate-pulse border-yellow-600 dark:border-yellow-300"
              : "border-gray-300 dark:border-gray-300/50",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="size-6" />
          {isDragActive ? (
            <p>Lepaskan file di sini…</p>
          ) : (
            <div className="flex flex-col items-center">
              <p>Klik atau seret & lepas file di sini</p>
              <p className="text-xs text-gray-400">
                Rekomendasi ratio{" "}
                {ratio === "square" ? "1:1" : ratio === "hero" ? "2:1" : ratio === "portrait" ? "9:16" : "4:1"}{" "}
                ({Object.keys(accept).map((m) => `.${m.split("/")[1].replace("svg+xml", "svg")}`).join(", ")})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Menggambar overlay "safe area" di atas preview gambar: area di tengah yang
 * tetap terlihat ketika gambar yang sama ditampilkan dengan `object-fit: cover`
 * pada container dengan rasio berbeda (mis. rasio carousel di mobile app).
 * Area di luar overlay diberi mask gelap sebagai indikasi "berpotensi terpotong".
 */
const SafeAreaOverlay = ({
  containerRatio,
  safeAreaRatio,
  label = "Aman di mobile",
}: {
  containerRatio: number;
  safeAreaRatio: number;
  label?: string;
}) => {
  const widthPct = Math.min(1, safeAreaRatio / containerRatio) * 100;
  const heightPct = Math.min(1, containerRatio / safeAreaRatio) * 100;

  // Rasio sama persis → tidak ada bagian yang terpotong, tidak perlu overlay.
  if (widthPct >= 99.9 && heightPct >= 99.9) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* safe area: pakai box-shadow raksasa sbg "spotlight" agar hanya area
          di luar kotak yang di-dim, area aman di dalamnya tetap jernih */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-yellow-400"
        style={{
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
        }}
      />
      {/* label diletakkan di pojok kontainer (bukan di dalam kotak safe area)
          karena pojok ini selalu jatuh di zona yang di-dim, apa pun arah
          cropping-nya (horizontal atau vertikal) — jadi tidak pernah menutupi
          konten penting di dalam gambar. */}
      <span className="absolute top-1.5 left-1.5 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-medium leading-none text-black whitespace-nowrap shadow">
        {label}
      </span>
    </div>
  );
};
