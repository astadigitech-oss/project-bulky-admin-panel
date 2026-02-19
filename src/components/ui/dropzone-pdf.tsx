import { cn } from "@/lib/utils";
import { Eye, FileText, Trash, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import dynamic from "next/dynamic";
import { Spinner } from "./spinner";
import { useState } from "react";
const PDFViewer = dynamic(() => import("@/components/ui/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 justify-center w-full aspect-[1/1.414] border">
      <Spinner className="size-3.5" />
      <p>Loading PDF...</p>
    </div>
  ),
});

type DropzoneProps = {
  value?: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  error?: boolean;
  onError?: (message: string) => void;
  oldValue?: string;
};

export const DropzonePDF = ({
  value = [] as File[],
  onChange,
  disabled,
  error,
  oldValue,
}: DropzoneProps) => {
  const [preview, setPreview] = useState(oldValue ?? "");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => {
      onChange(files);
    },
    onDropRejected: (rejections) => {
      const first = rejections[0];
      if (!first) return;

      const error = first.errors[0];
      if (!error) return;

      switch (error.code) {
        case "file-too-large":
          toast.error("Ukuran file melebihi batas 10MB");
          break;
        case "file-invalid-type":
          toast.error("Hanya file PDF yang diperbolehkan");
          break;
        case "too-many-files":
          toast.error("Hanya boleh 1 file");
          break;
        default:
          toast.error("File tidak valid");
      }
    },
  });

  return (
    <div className="w-full">
      {value.length > 0 || preview ? (
        <div className="flex items-center border rounded-lg justify-between p-4 gap-4 transition border-gray-300 dark:border-gray-300/50">
          <div className="size-10 flex items-center justify-center dark:bg-red-500 bg-red-200 text-red-600 dark:text-red-100 rounded-md">
            <FileText className="size-5" />
          </div>
          <p className="text-sm font-semibold">
            {value.length > 0 ? "File PDF Baru" : "File PDF Lama"}
          </p>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    type="button"
                    className={"size-10 rounded-md"}
                    variant={"outline"}
                  >
                    <Eye />
                  </Button>
                }
              />
              <DialogContent
                showCloseButton={false}
                className={"sm:min-w-lg w-full"}
              >
                <DialogHeader>
                  <DialogTitle>PDF Preview</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center rounded-md overflow-hidden shadow">
                  <PDFViewer file={value.length > 0 ? value[0] : preview} />
                </div>
                <DialogFooter>
                  <DialogClose
                    render={
                      <Button type="button">
                        <X />
                        Tutup
                      </Button>
                    }
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className={"size-10 rounded-md"}
              variant={"outlineDestructive"}
              type="button"
              onClick={() => {
                if (preview) {
                  setPreview("");
                } else {
                  onChange([]);
                }
              }}
            >
              <Trash />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center border rounded-md justify-center p-4 gap-4 cursor-pointer transition",
            isDragActive
              ? "animate-pulse border-yellow-600 dark:border-yellow-300"
              : "border-gray-300 dark:border-gray-300/50",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />
          <div className="size-10 flex items-center justify-center">
            <UploadCloud className="size-6" />
          </div>
          {isDragActive ? (
            <p>Lepaskan file di sini…</p>
          ) : (
            <div className="flex flex-col items-center text-sm">
              <p>Klik atau seret & lepas file di sini</p>
              <p className="text-xs text-gray-400">
                Maksimal ukuran file 10MB (.pdf)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
