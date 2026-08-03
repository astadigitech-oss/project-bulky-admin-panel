"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  DatabaseBackup,
  FileWarning,
  HardDriveDownload,
  HardDriveUpload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { baseApiUrl, cookiesKey } from "@/config";
import { useImportV1 } from "../../_api";
import type { ImportV1FileItem } from "../../_api/types";

const assetApiUrl = `${baseApiUrl}/api/panel/assets`;

type ImportResult = {
  imported: number;
  skipped: number;
  unmatched: string[];
  files: ImportV1FileItem[];
};

export const AssetMigrationSection = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const v1InputRef = useRef<HTMLInputElement>(null);
  const importV1 = useImportV1();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.get(`${assetApiUrl}/export`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;

      const disposition = res.headers["content-disposition"] as string | undefined;
      const filename =
        disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? "assets-export.zip";

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Export berhasil diunduh");
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExporting(false);
    }
  };

  // Restore backup aset Bulky v2
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const token = getCookie(cookiesKey);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${assetApiUrl}/import`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data.message ?? "Import berhasil");
    } catch {
      toast.error("Import gagal");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Migrasi aset dari Bulky v1
  const handleMigrateV1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMigrating(true);
    const formData = new FormData();
    formData.append("file", file);

    importV1.mutate(
      { body: formData },
      {
        onSuccess: ({ data }) => {
          setImportResult(data.data);
        },
        onSettled: () => {
          setIsMigrating(false);
          if (v1InputRef.current) v1InputRef.current.value = "";
        },
      },
    );
  };

  const skippedFiles = importResult?.files.filter(
    (f) => f.status === "skipped",
  );

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5 before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Migrasi Aset
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Export & import file uploads yang terdaftar di database
        </p>
      </div>
      <div className="flex flex-col gap-5 border p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2">
        {/* Export */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Export Assets</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download semua file yang terdaftar di database sebagai{" "}
              <span className="font-mono">.zip</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <HardDriveDownload className="size-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>

        <div className="border-t" />

        {/* Import */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Import Assets</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload file{" "}
              <span className="font-mono">.zip</span>{" "}
              hasil export untuk restore ke server ini
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImport}
            disabled={isImporting}
          />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isImporting ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <HardDriveUpload className="size-4 mr-2" />
            )}
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>

        <div className="border-t" />

        {/* Migrasi v1 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Migrasi Aset v1</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload file{" "}
              <span className="font-mono">.zip</span>{" "}
              hasil export <span className="font-mono">storage</span> Bulky v1
              untuk dipindahkan ke server ini
            </p>
          </div>
          <input
            ref={v1InputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleMigrateV1}
            disabled={isMigrating}
          />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isMigrating}
            onClick={() => v1InputRef.current?.click()}
          >
            {isMigrating ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <DatabaseBackup className="size-4 mr-2" />
            )}
            {isMigrating ? "Migrating..." : "Migrasi v1"}
          </Button>
        </div>
      </div>

      {/* Import report */}
      <Dialog
        open={!!importResult}
        onOpenChange={(open) => {
          if (!open) setImportResult(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hasil Migrasi Aset v1</DialogTitle>
            <DialogDescription>
              Ringkasan proses pemindahan file uploads dari zip Bulky v1
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 flex items-center gap-3">
              <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-2xl font-semibold leading-none">
                  {importResult?.imported ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Imported</p>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-3">
              <XCircle className="size-8 text-red-500 shrink-0" />
              <div>
                <p className="text-2xl font-semibold leading-none">
                  {importResult?.skipped ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Skipped</p>
              </div>
            </div>
          </div>

          {importResult && importResult.unmatched.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileWarning className="size-3.5" />
                {importResult.unmatched.length} path tidak dikenali
              </p>
              <ul className="mt-2 space-y-1">
                {importResult.unmatched.map((path) => (
                  <li
                    key={path}
                    className="text-xs font-mono text-muted-foreground truncate"
                    title={path}
                  >
                    {path}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skippedFiles && skippedFiles.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Detail file yang dilewati
              </p>
              <ul className="mt-2 space-y-1.5">
                {skippedFiles.map((file) => (
                  <li key={file.source} className="text-xs">
                    <p className="font-mono text-muted-foreground truncate">
                      {file.source}
                    </p>
                    {file.reason && (
                      <p className="text-red-500 mt-0.5">{file.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportResult(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
