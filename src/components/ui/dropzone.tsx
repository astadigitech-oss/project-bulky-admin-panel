import { cn, sizesImage } from "@/lib/utils";
import { UploadCloud, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
};

export const Dropzone = ({
  value = [] as File[],
  onChange,
  disabled,
  onError,
  error,
  oldValue,
  accept = {
    "image/jpeg": [],
    "image/png": [],
    "image/webp": [],
  },
  maxSize = 10 * 1024 * 1024,
  maxFiles = 1,
}: DropzoneProps) => {
  const [preview, setPreview] = useState("");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    accept,
    maxFiles,
    maxSize,
    onDrop: (files) => {
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
          onError?.("Ukuran file melebihi batas");
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
    setPreview("");
  };

  useEffect(() => {
    if (value?.length) {
      const url = URL.createObjectURL(value[0]);
      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }
    setPreview(oldValue ?? "");
  }, [value, oldValue]);

  return (
    <div className="h-32">
      {preview ? (
        <div className="size-full flex gap-3">
          <div className="h-full aspect-square rounded-md overflow-hidden border shadow relative border-gray-300 dark:border-gray-300/50">
            <Image
              src={preview}
              alt="preview_logo"
              fill
              sizes={sizesImage}
              className="object-cover"
            />
          </div>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={resetLogo}
            type="button"
          >
            <XIcon />
            Ganti Logo
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center justify-center border rounded-md p-4 h-full flex-col gap-2 cursor-pointer transition",
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
                Rekomendasi ratio 1:1 (.jpg, .jpeg, .png, .webp)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
