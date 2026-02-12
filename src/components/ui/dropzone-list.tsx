import { cn, sizesImage } from "@/lib/utils";
import { Plus, Trash, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "./button";
import { toast } from "sonner";

type DropzoneProps = {
  value?: File[]; // 🔑 ganti ke File[]
  onChange: (files: File[]) => void;
  disabled?: boolean;
  error?: boolean;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  oldValue?: string[];
};

export const DropzoneList = ({
  value = [] as File[],
  onChange,
  disabled,
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
  const [preview, setPreview] = useState<string[]>([]);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    disabled,
    accept,
    maxFiles,
    maxSize,
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles, fileRejections) => {
      const selectedFiles = [...value] as FileWithPath[];
      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        switch (error.code) {
          case "file-too-large":
            toast.error(`Ukuran file melebihi batas 10MB`);
            break;
          case "file-invalid-type":
            toast.error("Format file tidak didukung");
            break;
          case "too-many-files":
            const files = fileRejections.map((i) => i.file);
            selectedFiles.push(...files);
            break;
          default:
            toast.error("File tidak valid");
        }
      }

      selectedFiles.push(...acceptedFiles);

      if (selectedFiles.length > maxFiles) {
        toast.error(`Hanya boleh ${maxFiles} file`);
        const availableFiles = selectedFiles.slice(0, maxFiles);
        onChange(availableFiles);
      } else {
        onChange(selectedFiles);
      }
    },
  });

  const handleReset = () => {
    setPreview([]);
  };

  useEffect(() => {
    if (!value?.length) {
      setPreview(oldValue ? [...oldValue] : []);
      return;
    }

    const objectUrls = value.map((file) => URL.createObjectURL(file));

    setPreview(objectUrls);

    return () => {
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [value, oldValue]);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "w-full border rounded-lg p-4 flex-col gap-2 transition h-full",
          isDragActive
            ? "border-yellow-600 dark:border-yellow-300"
            : "border-gray-300 dark:border-gray-300/50",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        {preview.length > 0 ? (
          <div className="w-full relative ">
            {isDragActive && (
              <div className=" w-full aspect-[3.6/1] z-10 absolute backdrop-blur-sm">
                <div className="size-full relative flex items-center justify-center">
                  <div className="size-full absolute aspect-[3.6/1] bg-white/50 dark:bg-black/50 animate-pulse z-10" />
                  <p className="z-20 font-semibold">Letakan disini</p>
                </div>
              </div>
            )}
            <div className="w-full grid gap-3 grid-cols-7">
              {preview.map((i, idx) => (
                <div
                  key={i}
                  className={cn(
                    "h-full rounded-md overflow-hidden border shadow relative border-gray-300 dark:border-gray-300/50 aspect-square group",
                    idx === 0 && "col-span-2 row-span-2",
                  )}
                >
                  <Button
                    type="button"
                    variant={"outline"}
                    size={"icon"}
                    className={cn(
                      "size-full absolute left-0 top-0 z-10 hidden group-hover:flex hover:from-black/5 hover:to-black/5 dark:hover:from-black/5 dark:hover:to-black/5 bg-black/5 backdrop-blur-sm border-none",
                    )}
                    onClick={() =>
                      onChange(value.filter((_, index) => index !== idx))
                    }
                  >
                    <div className="size-10 rounded-full flex items-center justify-center bg-red-500 text-white">
                      <X />
                    </div>
                  </Button>
                  <Image
                    src={i}
                    alt={`preview_logo_${idx}`}
                    fill
                    sizes={sizesImage}
                    className="object-cover"
                  />
                </div>
              ))}
              {value.length < maxFiles && (
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={open}
                  size={"icon"}
                  className={"size-full group aspect-square"}
                >
                  <div className="size-10 rounded-full flex items-center justify-center bg-yellow-200 dark:bg-yellow-500/30 dark:text-white dark:group-hover:text-black text-black group-hover:bg-transparent group-hover:border border-yellow-700">
                    <Plus />
                  </div>
                </Button>
              )}
              {value.length === maxFiles && (
                <Button
                  type="button"
                  variant={"outlineDestructive"}
                  onClick={handleReset}
                  size={"icon"}
                  className={
                    "size-full group aspect-square flex-col text-xs gap-2 dark:text-red-100"
                  }
                >
                  <div className="size-10 rounded-full flex items-center justify-center bg-red-200 dark:bg-red-500/30 dark:text-red-100 dark:border-red-100 text-black group-hover:bg-transparent group-hover:border border-yellow-700">
                    <Trash />
                  </div>
                  Hapus Semua
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Button
            type="button"
            className={
              "size-full bg-transparent hover:bg-gray-50 hover:from-gray-50 hover:to-gray-50 dark:hover:bg-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-800 dark:bg-gray-900 dark:from-gray-900 dark:to-gray-900 from-transparent to-transparent aspect-[3.6/1] flex-col rounded-md shadow-none dark:text-white text-black"
            }
            onClick={open}
          >
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
          </Button>
        )}
      </div>
    </div>
  );
};
