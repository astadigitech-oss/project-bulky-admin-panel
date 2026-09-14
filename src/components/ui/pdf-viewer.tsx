"use client";

import { useCallback, useEffect, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { Document, Page, pdfjs } from "react-pdf";
import { FileExclamationPoint, Minus, Plus, RotateCcw } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Spinner } from "./spinner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PDFFile = string | File | undefined | null;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

export default function PDFViewer({ file }: { file: PDFFile }) {
  const [numPages, setNumPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const width = entries[0]?.contentRect.width;
    if (width) setContainerWidth(width);
  }, []);

  useResizeObserver(containerRef, {}, onResize);

  useEffect(() => {
    setNumPages(0);
    setIsLoading(Boolean(file));
    setError(undefined);
    setZoom(1);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: PDFDocumentProxy) => {
    setNumPages(nextNumPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (nextError: Error) => {
    setError(nextError.message || "PDF tidak dapat dimuat");
    setIsLoading(false);
  };

  if (!file) {
    return (
      <div className="flex h-[65dvh] min-h-[420px] w-full max-h-[720px] items-center justify-center rounded-md border text-sm text-muted-foreground">
        PDF tidak tersedia
      </div>
    );
  }

  const pageWidth = Math.max(320, Math.round(containerWidth * zoom));

  return (
    <div className="flex h-[65dvh] min-h-[420px] w-full max-h-[720px] flex-col overflow-hidden rounded-md border bg-muted/20">
      <div className="flex shrink-0 items-center justify-end gap-1 border-b bg-background px-2 py-1">
        <Button
          aria-label="Perkecil PDF"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <Minus />
        </Button>
        <span className="min-w-12 text-center text-xs tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          aria-label="Perbesar PDF"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <Plus />
        </Button>
        <Button
          aria-label="Reset zoom PDF"
          disabled={zoom === 1}
          onClick={() => setZoom(1)}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <RotateCcw />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1" ref={setContainerRef}>
        {isLoading && (
          <div className="flex min-h-48 items-center justify-center gap-2">
            <Spinner className="size-3.5" />
            <p>Loading PDF...</p>
          </div>
        )}

        {error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-400">
              <FileExclamationPoint className="size-4" />
            </div>
            <p>PDF tidak dapat dimuat</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : (
          <Document
            file={file}
            onLoadError={onDocumentLoadError}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <div className="flex min-w-max flex-col items-center gap-3 p-3">
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={pageWidth}
                />
              ))}
            </div>
          </Document>
        )}
      </ScrollArea>
    </div>
  );
}
