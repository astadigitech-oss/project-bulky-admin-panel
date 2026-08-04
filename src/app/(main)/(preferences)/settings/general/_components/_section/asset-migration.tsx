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
  ListChecks,
  Trash2,
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
  CleanupStaleV1UploadsResponse,
  ImportV1FileItem,
  ListPendingV1UploadsResponse,
  PruneOrphansResponse,
} from "../../_api/types";

const assetApiUrl = `${baseApiUrl}/api/panel/assets`;
// 10 MiB per chunk — jauh di bawah limit Cloudflare free (100 MB) dan BodyLimit
// Fiber 500MB. Chunk kecil = retry & progress lebih granular, cocok untuk
// koneksi lambat/terputus-putus. (90 MiB sebelumnya membuat UI "bengong"
// karena progress hanya naik saat satu chunk besar selesai.)
const CHUNK_SIZE = 10 * 1024 * 1024;
// Berapa chunk dikirim bersamaan. 2 cukup — 3+ di koneksi kecil saling berebut
// bandwidth dan semua jadi lambat.
const CONCURRENCY = 2;
const MAX_RETRY = 3; // ulangi chunk yang gagal sebelum menyerah
// Batas waktu tanpa transfer data (upload stalled). 90 MiB butuh ~10 menit di
// 150 KB/s; pakai timeout per-chunk yang wajar agar UI tidak menggantung.
const STALL_TIMEOUT_MS = 3 * 60 * 1000;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

// SHA-1 hex dari Blob/ArrayBuffer — dipakai verifikasi integritas chunk
// (server skip upload ulang kalau chunk sudah tersimpan dengan sha1 sama).
async function sha1Hex(data: Blob | ArrayBuffer): Promise<string> {
  const buf =
    data instanceof Blob ? await data.arrayBuffer() : data;
  const digest = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
  const [uploadStats, setUploadStats] = useState<{
    sent: number;
    total: number;
    chunk: number;
    totalChunks: number;
  } | null>(null);
  const uploadRef = useRef(uploadStats);
  uploadRef.current = uploadStats;
  const [pruneResult, setPruneResult] = useState<PruneOrphansResponse["data"] | null>(null);
  const [isPruning, setIsPruning] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<
    ListPendingV1UploadsResponse["data"] | null
  >(null);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<
    CleanupStaleV1UploadsResponse["data"] | null
  >(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const v1InputRef = useRef<HTMLInputElement>(null);
  const [ConfirmPruneDialog, confirmPrune] = useConfirm(
    "Hapus file tak terpakai?",
    "File yang tidak direferensikan database akan dihapus permanen. Lanjutkan?",
    "destructive",
  );
  const [ConfirmCleanupDialog, confirmCleanup] = useConfirm(
    "Hapus chunk upload basi?",
    "Upload chunk v1 yang lebih dari 24 jam belum di-finalize/abort akan dihapus permanen. Lanjutkan?",
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

    // Progress byte per chunk. Total yang ditampilkan di-clamp agar TIDAK
    // pernah menurun: saat sebuah chunk stalled lalu di-retry, counter
    // loaded-nya di-reset dari 0 — tanpa clamp angka "terkirim" akan terlihat
    // berkurang padahal data aman (chunk yang sudah sukses tetap tersimpan).
    const progressMap = new Map<number, number>();
    let lastShownTotal = 0;
    const shownTotal = () => {
      let total = 0;
      for (const v of progressMap.values()) total += v;
      lastShownTotal = Math.max(lastShownTotal, total);
      return Math.min(lastShownTotal, file.size);
    };

    const updateStats = (chunk: number) => {
      const sent = shownTotal();
      setUploadStats({ sent, total: file.size, chunk: chunk + 1, totalChunks });
      setUploadProgress(Math.min(90, Math.round((sent / file.size) * 90)));
    };

    // Helper: kirim satu chunk dengan retry + deteksi stalled. Pakai pola
    // resumable ala Google Drive: kirim checksum SHA-1, server skip upload
    // ulang kalau chunk sudah tersimpan & sha1 cocok (hemat bandwidth).
    const uploadOne = async (i: number) => {
      const start = i * CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
      const chunkSHA1 = await sha1Hex(chunk);

      const chunkForm = new FormData();
      chunkForm.append("upload_id", uploadId);
      chunkForm.append("chunk_index", String(i));
      chunkForm.append("total_chunks", String(totalChunks));
      chunkForm.append("chunk_sha1", chunkSHA1);
      chunkForm.append("chunk_data", chunk);

      let lastErr: unknown = null;
      for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
        try {
          const res = await axios.post(`${assetApiUrl}/import-v1/chunk`, chunkForm, {
            headers,
            // Batasi durasi request: kalau tidak ada transfer data dalam
            // STALL_TIMEOUT_MS, anggap gagal & retry (biar tidak "bengong").
            timeout: STALL_TIMEOUT_MS,
            // Perbarui progress byte real-time — UI tidak pernah terlihat beku.
            onUploadProgress: (p) => {
              progressMap.set(i, p.loaded ?? 0);
              updateStats(i);
            },
          });

          // Server bilang chunk sudah tersimpan & sha1 cocok → tidak ada
          // transfer data; jangan sentuh progress (sudah dihitung utuh).
          if (res.data?.data?.already_exist) {
            progressMap.set(i, chunk.size);
            updateStats(i);
            return;
          }

          // Chunk sukses — catat ukuran penuh (monotonik, tidak pernah turun)
          progressMap.set(i, chunk.size);
          updateStats(i);
          return;
        } catch (err) {
          // Checksum tidak cocok → chunk lama di server korup. Reset chunk
          // itu di server dulu (hapus per-chunk) sebelum retry upload penuh.
          if (
            axios.isAxiosError(err) &&
            err.response?.status === 422 &&
            attempt < MAX_RETRY
          ) {
            try {
              await axios.delete(`${assetApiUrl}/import-v1/chunk`, {
                params: { upload_id: uploadId, chunk_index: i },
                headers,
              });
            } catch {
              // abaikan — reset best-effort
            }
          }
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
          setUploadProgress(Math.min(90, Math.round((uploaded / totalChunks) * 90)));
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
      setUploadStats(null);
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

  // Cek upload chunk v1 yang masih tersimpan di volume tapi belum
  // di-finalize/abort (biasanya sisa migrasi yang gagal/ditinggal)
  const handleCheckPending = async () => {
    setIsCheckingPending(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.get<ListPendingV1UploadsResponse>(
        `${assetApiUrl}/import-v1/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Backend Go mengembalikan null (bukan []) untuk slice kosong — normalisasi
      // supaya akses .length di JSX tidak crash.
      const data = res.data.data;
      setPendingUploads({
        pending_uploads: data.pending_uploads ?? [],
        stale_tmp_files: data.stale_tmp_files ?? [],
        total_pending_size: data.total_pending_size ?? 0,
      });
      toast.success(res.data.message ?? "Pengecekan selesai");
    } catch {
      toast.error("Gagal memeriksa chunk pending");
    } finally {
      setIsCheckingPending(false);
    }
  };

  // Hapus permanen chunk v1 basi (lebih dari 24 jam belum di-finalize/abort)
  const handleCleanupStale = async () => {
    const confirmed = await confirmCleanup();
    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post<CleanupStaleV1UploadsResponse>(
        `${assetApiUrl}/import-v1/cleanup`,
        { older_than_hours: 24, dry_run: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Normalisasi null → [] (lihat catatan di handleCheckPending)
      const data = res.data.data;
      setCleanupResult({
        dry_run: data.dry_run,
        older_than_hours: data.older_than_hours,
        deleted_uploads: data.deleted_uploads ?? [],
        deleted_tmp_files: data.deleted_tmp_files ?? [],
        freed_size: data.freed_size ?? 0,
      });
      setPendingUploads(null);
      toast.success(res.data.message ?? "Pembersihan selesai");
    } catch {
      toast.error("Pembersihan gagal");
    } finally {
      setIsCleaning(false);
    }
  };

  // Dry-run — hanya lihat apa yang AKAN dihapus tanpa menghapus
  const handleCleanupStaleDryRun = async () => {
    setIsCleaning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post<CleanupStaleV1UploadsResponse>(
        `${assetApiUrl}/import-v1/cleanup`,
        { older_than_hours: 24, dry_run: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Normalisasi null → [] (lihat catatan di handleCheckPending)
      const data = res.data.data;
      setCleanupResult({
        dry_run: data.dry_run,
        older_than_hours: data.older_than_hours,
        deleted_uploads: data.deleted_uploads ?? [],
        deleted_tmp_files: data.deleted_tmp_files ?? [],
        freed_size: data.freed_size ?? 0,
      });
      toast.success(res.data.message ?? "Pengecekan selesai");
    } catch {
      toast.error("Pengecekan gagal");
    } finally {
      setIsCleaning(false);
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
                    {uploadStats && (
                      <span className="tabular-nums">
                        {" "}
                        · {formatBytes(uploadStats.sent)} /{" "}
                        {formatBytes(uploadStats.total)} · bagian{" "}
                        {uploadStats.chunk}/{uploadStats.totalChunks}
                      </span>
                    )}
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

        <div className="border-t" />

        {/* Chunk upload v1 basi */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Chunk Upload Basi (Migrasi v1)</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pantau & bersihkan sisa upload chunk migrasi v1 yang gagal atau
              ditinggal (belum di-finalize/abort) agar volume storage tidak
              diam-diam penuh.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isCheckingPending}
              onClick={handleCheckPending}
            >
              {isCheckingPending ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <ListChecks className="size-4 mr-2" />
              )}
              Cek Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isCleaning}
              onClick={handleCleanupStaleDryRun}
            >
              {isCleaning ? (
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
              disabled={isCleaning}
              onClick={handleCleanupStale}
            >
              {isCleaning ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Bersihkan
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

      {/* Pending v1 chunk uploads report */}
      <Dialog
        open={!!pendingUploads}
        onOpenChange={(open) => {
          if (!open) setPendingUploads(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Status Chunk Upload v1</DialogTitle>
            <DialogDescription>
              Daftar upload chunk migrasi v1 yang masih tersimpan di volume
              tapi belum di-finalize/abort
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {pendingUploads?.pending_uploads.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload pending
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {formatBytes(pendingUploads?.total_pending_size ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total ukuran
              </p>
            </div>
          </div>

          {pendingUploads && pendingUploads.pending_uploads.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Daftar upload pending
              </p>
              <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {pendingUploads.pending_uploads.map((item) => (
                  <li
                    key={item.upload_id}
                    className="text-xs flex items-center justify-between gap-2"
                  >
                    <span
                      className="font-mono text-muted-foreground truncate"
                      title={item.upload_id}
                    >
                      {item.upload_id}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {item.chunk_count} bagian ·{" "}
                      {formatBytes(item.total_size)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pendingUploads && pendingUploads.stale_tmp_files.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileWarning className="size-3.5" />
                {pendingUploads.stale_tmp_files.length} file sementara yatim
              </p>
              <ul className="mt-2 space-y-1">
                {pendingUploads.stale_tmp_files.map((path) => (
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUploads(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleanup stale v1 chunk uploads report */}
      <Dialog
        open={!!cleanupResult}
        onOpenChange={(open) => {
          if (!open) setCleanupResult(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cleanupResult?.dry_run
                ? "Hasil Pembersihan (Dry-run)"
                : "Hasil Pembersihan"}
            </DialogTitle>
            <DialogDescription>
              {cleanupResult?.dry_run
                ? `Chunk basi lebih dari ${cleanupResult?.older_than_hours ?? 24} jam — belum ada yang dihapus`
                : `Chunk basi lebih dari ${cleanupResult?.older_than_hours ?? 24} jam telah dihapus permanen`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {(cleanupResult?.deleted_uploads.length ?? 0) +
                  (cleanupResult?.deleted_tmp_files.length ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {cleanupResult?.dry_run ? "Akan dihapus" : "Dihapus"}
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {formatBytes(cleanupResult?.freed_size ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {cleanupResult?.dry_run ? "Akan dibebaskan" : "Dibebaskan"}
              </p>
            </div>
          </div>

          {cleanupResult && cleanupResult.deleted_uploads.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {cleanupResult.deleted_uploads.length} upload chunk
              </p>
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {cleanupResult.deleted_uploads.map((id) => (
                  <li
                    key={id}
                    className="text-xs font-mono text-muted-foreground truncate"
                    title={id}
                  >
                    {id}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cleanupResult && cleanupResult.deleted_tmp_files.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {cleanupResult.deleted_tmp_files.length} file sementara yatim
              </p>
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {cleanupResult.deleted_tmp_files.map((name) => (
                  <li
                    key={name}
                    className="text-xs font-mono text-muted-foreground truncate"
                    title={name}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCleanupResult(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPruneDialog />
      <ConfirmCleanupDialog />
    </div>
  );
};
