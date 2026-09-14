"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { FileExclamationPoint } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Spinner } from "./spinner";

type PDFFile = string | File | undefined | null;

const workerUrl = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

export default function PDFViewer({ file }: { file: PDFFile }) {
  const [fileUrl, setFileUrl] = useState<string>();
  const defaultLayoutPluginInstance = useMemo(() => defaultLayoutPlugin(), []);

  useEffect(() => {
    if (!file) {
      setFileUrl(undefined);
      return;
    }

    if (typeof file === "string") {
      setFileUrl(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!fileUrl) {
    return (
      <div className="flex size-full items-center justify-center gap-2 border">
        <Spinner className="size-3.5" />
        <p>Loading PDF...</p>
      </div>
    );
  }

  return (
    <div className="h-[65dvh] min-h-[420px] w-full max-h-[720px] overflow-hidden rounded-md border bg-muted/20">
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          renderLoader={(percentage) => (
            <div className="flex items-center gap-2">
              <Spinner className="size-3.5" />
              <p>Loading PDF... {Math.round(percentage)}%</p>
            </div>
          )}
          renderError={(error) => (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-yellow-400">
                <FileExclamationPoint className="size-4" />
              </div>
              <p>PDF tidak dapat dimuat</p>
              {error.message && (
                <p className="text-xs text-muted-foreground">{error.message}</p>
              )}
            </div>
          )}
        />
      </Worker>
    </div>
  );
}
