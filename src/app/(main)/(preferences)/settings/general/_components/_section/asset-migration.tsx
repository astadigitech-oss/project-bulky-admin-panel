"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { baseApiUrl, cookiesKey } from "@/config";
import type {
  ImportV1FileItem,
  PruneOrphansResponse,
} from "../../_api/types";

const assetApiUrl = `${baseApiUrl}/api/panel/assets`;
const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB per chunk (aman di bawah BodyLimit 500MB)
const CONCURRENCY = 3; // berapa chunk dikirim bersamaan (koneksi lambat tidak "bengong")
const MAX_RETRY = 2; // ulangi chunk yang gagal sebelum menyerah

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [migrationPhase, setMigrationPhase] = useState<string | null>(null);
  const [pruneResult, setPruneResult] = useState<PruneOrphansResponse["data"] | null>(null);
  const [isPruning, setIsPruning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const v1InputRef = useRef<HTMLInputElement>(null);
  const [ConfirmPruneDialog, confirmPrune] = useConfirm(
    "Hapus file tak terpakai?",
    "File yang tidak direferensikan database akan dihapus permanen. Lanjutkan?",
    "destructive",
  );

  // Bersihkan chunk yang tersisa di server kalau migrasi batal/gagal
  const cleanupChunks = useCallback(async (uploadId: string) => {
    try {
      const token = getCookie(cookiesKey);
      await axios.delete(`${assetApiUrl}/import-v1/chunk`, {
        params: { upload_id: uploadId },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // abaikan — folder chunk di server memang tidak dijamin ada
    }
  }, []);
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

  // Migrasi aset dari Bulky v1 (chunk upload)
  const handleMigrateV1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMigrating(true);
    setImportResult(null);
    setUploadProgress(0);
    setMigrationPhase("Menyiapkan...");

    const token = getCookie(cookiesKey);
    const headers = { Authorization: `Bearer ${token}` };
    const uploadId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Helper: kirim satu chunk dengan retry
    const uploadOne = async (i: number) => {
      const start = i * CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

      const chunkForm = new FormData();
      chunkForm.append("upload_id", uploadId);
      chunkForm.append("chunk_index", String(i));
      chunkForm.append("total_chunks", String(totalChunks));
      chunkForm.append("chunk_data", chunk);

      let lastErr: unknown = null;
      for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
        try {
          await axios.post(`${assetApiUrl}/import-v1/chunk`, chunkForm, {
            headers,
            timeout: 0, // koneksi lambat — jangan batasi durasi
          });
          return;
        } catch (err) {
          lastErr = err;
          if (attempt < MAX_RETRY) {
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          }
        }
      }
      throw lastErr;
    };

    try {
      // 1) Kirim semua chunk — paralel (konkurensi terbatas) supaya
      //    koneksi lambat tidak membuat UI terlihat "bengong"
      setMigrationPhase(`Mengunggah ${file.name}...`);
      let uploaded = 0;
      const failed: number[] = [];
      await Promise.all(
        Array.from({ length: totalChunks }, (_, i) => i).map(async (i) => {
          try {
            await uploadOne(i);
          } catch {
            failed.push(i);
            return;
          }
          uploaded += 1;
          // Progress dihitung dari upload chunk (maks 90%) + finalize (10%)
          setUploadProgress(Math.round((uploaded / totalChunks) * 90));
        }),
      );

      // Chunk yang gagal setelah retry — hentikan, jangan lanjut finalize
      if (failed.length > 0) {
        throw new Error(
          `${failed.length} bagian gagal diunggah (indeks: ${failed
            .slice(0, 5)
            .join(", ")}${failed.length > 5 ? ", ..." : ""})`,
        );
      }

      // 2) Finalize — gabungkan chunk & proses mapping (bisa lama)
      setMigrationPhase("Memproses file...");
      setUploadProgress(95);
      const finalForm = new FormData();
      finalForm.append("upload_id", uploadId);
      finalForm.append("total_chunks", String(totalChunks));

      const res = await axios.post(`${assetApiUrl}/import-v1/finalize`, finalForm, {
        headers,
        timeout: 0, // ekstrak ribuan file bisa memakan waktu lama
      });
      setUploadProgress(100);
      setMigrationPhase(null);
      // Normalisasi: backend bisa mengembalikan null untuk unmatched/files
      setImportResult({
        imported: res.data.data.imported ?? 0,
        skipped: res.data.data.skipped ?? 0,
        unmatched: res.data.data.unmatched ?? [],
        files: res.data.data.files ?? [],
      });
    } catch (err) {
      setMigrationPhase(null);
      const detail =
        err instanceof Error && err.message ? ` (${err.message})` : "";
      toast.error(`Migrasi gagal. Silakan coba lagi.${detail}`);
      // Bersihkan chunk yang sudah terlanjur tersimpan di server
      await cleanupChunks(uploadId);
    } finally {
      setIsMigrating(false);
      setUploadProgress(null);
      if (v1InputRef.current) v1InputRef.current.value = "";
    }
  };

  // Prune file tak terpakai (default dry-run aman)
  const handlePrune = async () => {
    const confirmed = await confirmPrune();
    if (!confirmed) return;

    setIsPruning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post(
        `${assetApiUrl}/prune-orphans`,
        { dry_run: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPruneResult(res.data.data);
      toast.success(res.data.message ?? "Pruning selesai");
    } catch {
      toast.error("Pruning gagal");
    } finally {
      setIsPruning(false);
    }
  };

  // Prune dry-run — hanya lihat daftar tanpa menghapus
  const handlePruneDryRun = async () => {
    setIsPruning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post(
        `${assetApiUrl}/prune-orphans`,
        { dry_run: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPruneResult(res.data.data);
      toast.success(res.data.message ?? "Pruning selesai");
    } catch {
      toast.error("Pruning gagal");
    } finally {
      setIsPruning(false);
    }
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
          <div className="min-w-0">
            <p className="font-medium text-sm">Migrasi Aset v1</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload file{" "}
              <span className="font-mono">.zip</span>{" "}
              hasil export <span className="font-mono">storage</span> Bulky v1
              untuk dipindahkan ke server ini. File besar dipecah otomatis
              menjadi beberapa bagian.
            </p>
            {uploadProgress !== null && (
              <div className="mt-3">
                <Progress
                  value={uploadProgress}
                  className="max-w-60"
                  classIndicator="bg-yellow-500"
                >
                  <ProgressLabel className="text-xs text-muted-foreground">
                    {migrationPhase ?? "Mengunggah"} {uploadProgress}%
                  </ProgressLabel>
                </Progress>
              </div>
            )}
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
            {isMigrating
              ? migrationPhase === "Memproses file..."
                ? "Memproses..."
                : "Mengunggah..."
              : "Migrasi v1"}
          </Button>
        </div>

        <div className="border-t" />

        {/* Prune orphans */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Bersihkan File Tak Terpakai</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hapus file di storage yang tidak direferensikan database. Cek
              dulu dengan dry-run sebelum menghapus permanen.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isPruning}
              onClick={handlePruneDryRun}
            >
              {isPruning ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <FileWarning className="size-4 mr-2" />
              )}
              Dry-run
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              disabled={isPruning}
              onClick={handlePrune}
            >
              {isPruning ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <XCircle className="size-4 mr-2" />
              )}
              Hapus Permanen
            </Button>
          </div>
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

      {/* Prune orphans report */}
      <Dialog
        open={!!pruneResult}
        onOpenChange={(open) => {
          if (!open) setPruneResult(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pruneResult?.dry_run ? "Hasil Prune (Dry-run)" : "Hasil Prune"}
            </DialogTitle>
            <DialogDescription>
              {pruneResult?.dry_run
                ? "Daftar file tak terpakai — belum ada yang dihapus"
                : "File tak terpakai telah dihapus permanen"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {pruneResult?.total_files ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total file</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {formatBytes(pruneResult?.total_size ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total ukuran</p>
            </div>
          </div>

          {pruneResult?.orphans && pruneResult.orphans.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {pruneResult.orphans.length} file tak terpakai
              </p>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {pruneResult.orphans.map((orphan) => (
                  <li
                    key={orphan.path}
                    className="text-xs font-mono text-muted-foreground truncate flex items-center justify-between gap-2"
                    title={orphan.path}
                  >
                    <span className="truncate">{orphan.path}</span>
                    <span className="shrink-0 text-[10px]">
                      {formatBytes(orphan.size)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pruneResult && !pruneResult.dry_run && (
            <div className="border rounded-lg p-3 flex items-center gap-3">
              <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-2xl font-semibold leading-none">
                  {pruneResult.deleted}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  File dihapus
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPruneResult(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPruneDialog />
    </div>
  );
};
