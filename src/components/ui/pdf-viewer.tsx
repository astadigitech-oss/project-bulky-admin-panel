"use client";

import { PDFViewer as EmbedPDFViewer } from "@embedpdf/react-pdf-viewer";
import { useEffect, useMemo } from "react";

type PDFFile = string | File | undefined | null;

export default function PDFViewer({ file }: { file: PDFFile }) {
  const source = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : file),
    [file],
  );

  useEffect(() => {
    if (file instanceof File && source) {
      return () => URL.revokeObjectURL(source);
    }
  }, [file, source]);

  if (!source) {
    return (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-md border text-sm text-muted-foreground">
        PDF tidak tersedia
      </div>
    );
  }

  return (
    <div className="h-[65dvh] min-h-[420px] max-h-[720px] w-full overflow-hidden rounded-md border bg-background">
      <EmbedPDFViewer
        config={{
          src: source,
          theme: { preference: "dark" },
        }}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
