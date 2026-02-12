"use client";

import { useCallback, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { ScrollArea } from "./scroll-area";
import { Spinner } from "./spinner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const resizeObserverOptions = {};

const maxWidth = 800;

type PDFFile = string | File | undefined | null;

export default function PDFViewer({ file }: { file: PDFFile }) {
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [loading, setLoading] = useState(false);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setLoading(false);
  }

  function onDocumentLoadStart() {
    setLoading(true);
  }

  return (
    <div className="w-full aspect-[1/1.414] overflow-hidden">
      {loading ? (
        <div className="flex items-center gap-2 justify-center size-full">
          <Spinner className="size-3.5" />
          <p>Loading PDF...</p>
        </div>
      ) : (
        <ScrollArea className={"size-full rounded-md"} ref={setContainerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadStart={onDocumentLoadStart}
          >
            {Array.from({ length: numPages ?? 0 }, (_el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
                loading={"Loading..."}
              />
            ))}
          </Document>
        </ScrollArea>
      )}
    </div>
  );
}
