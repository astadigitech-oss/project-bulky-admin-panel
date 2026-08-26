"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  DatabaseBackup,
  FileSearch,
  FileWarning,
  Sparkles,
  Zap,
  HardDriveDownload,
  HardDriveUpload,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  Dialog,
  DialogBody,
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
  OptimizeWebPResponse,
  PruneOrphansResponse,
  VerifyAssetsResponse,
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
  const [verifyResult, setVerifyResult] = useState<
    VerifyAssetsResponse["data"] | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);
  // Token dry-run untuk konfirmasi eksekusi prune permanen. Prune permanen
  // di-backend WAJIB menyertakan token ini (diterbitkan saat dry-run).
  const [pruneToken, setPruneToken] = useState<string | null>(null);
  const [pruneTokenExpiry, setPruneTokenExpiry] = useState<number | null>(null);
  // Token dry-run untuk cleanup chunk basi (pola sama dengan prune).
  const [cleanupToken, setCleanupToken] = useState<string | null>(null);
  const [cleanupTokenExpiry, setCleanupTokenExpiry] = useState<number | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeWebPResponse["data"] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeToken, setOptimizeToken] = useState<string | null>(null);
  const [optimizeTokenExpiry, setOptimizeTokenExpiry] = useState<number | null>(null);
  const [optimizeScope, setOptimizeScope] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const v1InputRef = useRef<HTMLInputElement>(null);
  const [ConfirmPruneDialog, confirmPrune] = useConfirm(
    "Hapus file tak terpakai?",
    "File yang tidak direferensikan database akan dihapus permanen. Lanjutkan?",
    "destructive",
  );
  const [ConfirmOptimizeDialog, confirmOptimize] = useConfirm(
    "Konversi Media ke WebP?",
    "Semua gambar yang belum berformat WebP atau > 200KB akan dikonversi ke WebP dan database akan diperbarui. File asli lama tetap aman di disk. Lanjutkan?",
    "default",
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
      // 1) Kirim semua chunk — paralel dengan konkurensi DIBATASI (worker
      //    pool sejumlah CONCURRENCY). Sebelumnya semua chunk ditembak
      //    sekaligus lewat Promise.all tanpa batas — untuk file besar
      //    (ratusan chunk) ini membanjiri koneksi browser/proxy/server
      //    sehingga sebagian request ter-cancel (terlihat di Network tab
      //    sebagai status "cancelled"), gagal setelah retry habis, tapi
      //    tidak pernah ter-log ke console (hanya toast.error).
      setMigrationPhase(`Mengunggah ${file.name}...`);
      let uploaded = 0;
      const failed: number[] = [];
      const chunkQueue = Array.from({ length: totalChunks }, (_, i) => i);
      let nextIndex = 0;
      const worker = async () => {
        while (nextIndex < chunkQueue.length) {
          const i = chunkQueue[nextIndex++];
          try {
            await uploadOne(i);
          } catch (err) {
            console.error(`Chunk ${i} gagal diunggah setelah retry:`, err);
            failed.push(i);
            continue;
          }
          uploaded += 1;
          // Progress dihitung dari upload chunk (maks 90%) + finalize (10%)
          setUploadProgress(Math.min(90, Math.round((uploaded / totalChunks) * 90)));
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, () => worker()),
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

  // Verifikasi konsistensi DB ↔ file fisik (read-only). File yang
  // direferensikan DB tapi tidak ada di disk = sinyal migrasi belum lengkap
  // (contoh: 30 PDF yang ter-prune) — bukan kandidat prune.
  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.get<VerifyAssetsResponse>(
        `${assetApiUrl}/verify`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Backend Go mengembalikan null untuk slice kosong — normalisasi
      const data = res.data.data;
      setVerifyResult({
        referenced: data.referenced ?? 0,
        missing: data.missing ?? [],
        duplicates: data.duplicates ?? [],
      });
      toast.success(res.data.message ?? "Verifikasi selesai");
    } catch {
      toast.error("Verifikasi gagal");
    } finally {
      setIsVerifying(false);
    }
  };

  // Prune dry-run — hanya lihat daftar tanpa menghapus, terbitkan token
  // konfirmasi untuk eksekusi permanen.
  const handlePruneDryRun = async () => {
    setIsPruning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post(
        `${assetApiUrl}/prune-orphans`,
        { dry_run: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data;
      setPruneResult(data);
      setPruneToken(data.dry_run_token ?? null);
      setPruneTokenExpiry(data.token_expiry_s ?? null);
      toast.success(res.data.message ?? "Pruning selesai");
    } catch {
      toast.error("Pruning gagal");
    } finally {
      setIsPruning(false);
    }
  };

  // Eksekusi prune permanen — pakai token dari dry-run terakhir.
  const handlePruneExecute = async () => {
    if (!pruneToken) {
      toast.error("Jalankan dry-run dulu untuk mengaktifkan hapus permanen");
      return;
    }
    const confirmed = await confirmPrune();
    if (!confirmed) return;

    setIsPruning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post(
        `${assetApiUrl}/prune-orphans`,
        { dry_run: false, dry_run_token: pruneToken },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPruneResult(res.data.data);
      setPruneToken(null);
      setPruneTokenExpiry(null);
      toast.success(res.data.message ?? "Pruning selesai");
    } catch {
      toast.error("Pruning gagal — jalankan dry-run ulang");
      setPruneToken(null);
      setPruneTokenExpiry(null);
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

  // Dry-run — hanya lihat apa yang AKAN dihapus tanpa menghapus, terbitkan
  // token konfirmasi untuk eksekusi permanen.
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
        dry_run_token: data.dry_run_token ?? "",
        token_expiry_s: data.token_expiry_s ?? 600,
      });
      setCleanupToken(data.dry_run_token ?? null);
      setCleanupTokenExpiry(data.token_expiry_s ?? null);
      setPendingUploads(null);
      toast.success(res.data.message ?? "Pengecekan selesai");
    } catch {
      toast.error("Pengecekan gagal");
    } finally {
      setIsCleaning(false);
    }
  };

  // Eksekusi pembersihan permanen — pakai token dari dry-run terakhir.
  const handleCleanupExecute = async () => {
    if (!cleanupToken) {
      toast.error("Jalankan dry-run dulu untuk mengaktifkan bersihkan");
      return;
    }
    const confirmed = await confirmCleanup();
    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post<CleanupStaleV1UploadsResponse>(
        `${assetApiUrl}/import-v1/cleanup`,
        { older_than_hours: 24, dry_run: false, dry_run_token: cleanupToken },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data;
      setCleanupResult({
        dry_run: data.dry_run,
        older_than_hours: data.older_than_hours,
        deleted_uploads: data.deleted_uploads ?? [],
        deleted_tmp_files: data.deleted_tmp_files ?? [],
        freed_size: data.freed_size ?? 0,
        dry_run_token: data.dry_run_token ?? "",
        token_expiry_s: data.token_expiry_s ?? 600,
      });
      setCleanupToken(null);
      setCleanupTokenExpiry(null);
      setPendingUploads(null);
      toast.success(res.data.message ?? "Pembersihan selesai");
    } catch {
      toast.error("Pembersihan gagal — jalankan dry-run ulang");
      setCleanupToken(null);
      setCleanupTokenExpiry(null);
    } finally {
      setIsCleaning(false);
    }
  };

  // Optimize WebP dry-run — pratinjau kalkulasi estimasi & daftar kandidat
  const handleOptimizeDryRun = async () => {
    setIsOptimizing(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post<OptimizeWebPResponse>(
        `${assetApiUrl}/optimize-webp`,
        { dry_run: true, scope: optimizeScope },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data;
      setOptimizeResult({
        ...data,
        items: data.items ?? [],
      });
      setOptimizeToken(data.dry_run_token ?? null);
      setOptimizeTokenExpiry(data.token_expiry_s ?? null);
      toast.success(res.data.message ?? "Pemindaian WebP selesai");
    } catch {
      toast.error("Gagal memindai media untuk optimasi WebP");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Eksekusi optimasi WebP — pakai token dari dry-run terakhir
  const handleOptimizeExecute = async () => {
    if (!optimizeToken) {
      toast.error("Jalankan dry-run dulu untuk mengaktifkan eksekusi konversi");
      return;
    }
    const confirmed = await confirmOptimize();
    if (!confirmed) return;

    setIsOptimizing(true);
    try {
      const token = getCookie(cookiesKey);
      const res = await axios.post<OptimizeWebPResponse>(
        `${assetApiUrl}/optimize-webp`,
        { dry_run: false, dry_run_token: optimizeToken, scope: optimizeScope },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data;
      setOptimizeResult({
        ...data,
        items: data.items ?? [],
      });
      setOptimizeToken(null);
      setOptimizeTokenExpiry(null);
      toast.success(res.data.message ?? "Optimasi WebP selesai");
    } catch {
      toast.error("Optimasi WebP gagal — jalankan dry-run ulang");
      setOptimizeToken(null);
      setOptimizeTokenExpiry(null);
    } finally {
      setIsOptimizing(false);
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
          Export, import, dan perawatan file uploads yang terdaftar di database
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* ============ Pemindahan Aset ============ */}
        <div className="flex flex-col gap-5 border p-4 rounded-lg dark:bg-gray-900/70">
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
                hasil export <span className="font-mono">storage</span> Bulky
                v1 untuk dipindahkan ke server ini. File besar dipecah
                otomatis menjadi beberapa bagian.
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
        </div>

        {/* ============ Perawatan Storage ============ */}
        <div className="flex flex-col gap-5 border p-4 rounded-lg dark:bg-gray-900/70">
          {/* Optimasi Gambar WebP */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  Optimasi Gambar ke WebP (&lt; 200KB)
                </p>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Non-Destructive
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Konversi seluruh gambar di database (Produk, Banner, Hero, Blog, Kategori, Brand, dll) ke format WebP berkualitas tinggi &lt; 200KB. File asli tetap aman di disk dan dapat dibersihkan kapan saja via menu <strong>Bersihkan File Tak Terpakai (Prune)</strong>.
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Scope:</span>
                <select
                  value={optimizeScope}
                  onChange={(e) => {
                    setOptimizeScope(e.target.value);
                    setOptimizeToken(null);
                  }}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">Semua Media (All)</option>
                  <option value="products">Produk</option>
                  <option value="banners">Banner & Promo</option>
                  <option value="hero">Hero Section</option>
                  <option value="blogs">Blog Articles</option>
                  <option value="categories">Kategori Produk</option>
                  <option value="brands">Merek / Brand</option>
                  <option value="videos">Thumbnail Video</option>
                  <option value="reviews">Ulasan</option>
                  <option value="buyers">Foto Profil Buyer</option>
                </select>
                {optimizeToken && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="size-3.5" /> Siap dikonversi ({optimizeResult?.total_candidates ?? 0} file)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 self-start mt-1">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={isOptimizing}
                onClick={handleOptimizeDryRun}
              >
                {isOptimizing ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <Sparkles className="size-4 mr-2 text-blue-500" />
                )}
                Dry-run
              </Button>
              <Button
                variant="default"
                size="sm"
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isOptimizing || !optimizeToken || optimizeResult?.total_candidates === 0}
                onClick={handleOptimizeExecute}
              >
                {isOptimizing ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <Zap className="size-4 mr-2" />
                )}
                {optimizeToken ? `Konversi (${optimizeResult?.total_candidates ?? 0})` : "Konversi"}
              </Button>
            </div>
          </div>

          <div className="border-t" />
          {/* Verifikasi konsistensi DB ↔ file */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-sm">
                Periksa Kecocokan DB ↔ File
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bandingkan path file yang direferensikan database dengan file
                fisik di disk. File yang direferensikan tapi hilang = sinyal
                migrasi/import belum lengkap, bukan kandidat penghapusan.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isVerifying}
              onClick={handleVerify}
            >
              {isVerifying ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <FileSearch className="size-4 mr-2" />
              )}
              {isVerifying ? "Memeriksa..." : "Periksa"}
            </Button>
          </div>

          <div className="border-t" />

          {/* Chunk upload v1 basi */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm">
                Chunk Upload Basi (Migrasi v1)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pantau & bersihkan sisa upload chunk migrasi v1 yang gagal
                atau ditinggal (belum di-finalize/abort) agar volume storage
                tidak diam-diam penuh.
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
                disabled={isCleaning || !cleanupToken}
                onClick={handleCleanupExecute}
              >
                {isCleaning ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <Trash2 className="size-4 mr-2" />
                )}
                {cleanupToken ? "Bersihkan (siap)" : "Bersihkan"}
              </Button>
            </div>
          </div>
        </div>

        {/* ============ Danger Zone ============ */}
        <div className="flex flex-col gap-5 border border-red-500/50 p-4 rounded-lg dark:bg-red-950/20">
          <div>
            <p className="font-medium text-sm text-red-500 flex items-center gap-1.5">
              <ShieldAlert className="size-4" />
              Danger Zone
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aksi di bawah ini menghapus file permanen. Jalankan{" "}
              <span className="font-mono">Dry-run</span> dulu untuk melihat
              daftar & mengaktifkan tombol eksekusi. Token dry-run berlaku 10
              menit.
            </p>
          </div>

          <div className="border-t border-red-500/30" />

          {/* Prune orphans */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Bersihkan File Tak Terpakai</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hapus file di storage yang tidak direferensikan database.
                {pruneResult && !pruneResult.dry_run && pruneToken === null && (
                  <span className="block mt-1 text-emerald-500 font-medium">
                    Selesai — {pruneResult.deleted} file dihapus
                  </span>
                )}
                {pruneToken && (
                  <span className="block mt-1 text-yellow-500 font-medium">
                    Dry-run siap — tombol eksekusi aktif (berlaku{" "}
                    {pruneTokenExpiry ? `${Math.round(pruneTokenExpiry / 60)} menit` : "10 menit"})
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 items-end">
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
                    <ShieldCheck className="size-4 mr-2" />
                  )}
                  Dry-run
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                  disabled={isPruning || !pruneToken}
                  onClick={handlePruneExecute}
                  title={
                    pruneToken
                      ? "Hapus permanen file yang terdaftar di dry-run"
                      : "Jalankan dry-run dulu untuk mengaktifkan"
                  }
                >
                  {isPruning ? (
                    <Spinner className="size-4 mr-2" />
                  ) : (
                    <XCircle className="size-4 mr-2" />
                  )}
                  {pruneToken
                    ? `Hapus ${pruneResult?.total_files ?? ""} File`.trim()
                    : "Hapus Permanen"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-red-500/30" />

          {/* Cleanup chunk basi */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Hapus Chunk Basi Permanen</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Eksekusi permanen pembersihan chunk upload basi (dry-run
                tersedia di grup Perawatan Storage).
                {cleanupToken && (
                  <span className="block mt-1 text-yellow-500 font-medium">
                    Dry-run siap — tombol eksekusi aktif (berlaku{" "}
                    {cleanupTokenExpiry ? `${Math.round(cleanupTokenExpiry / 60)} menit` : "10 menit"})
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              disabled={isCleaning || !cleanupToken}
              onClick={handleCleanupExecute}
              title={
                cleanupToken
                  ? "Hapus permanen chunk basi yang terdaftar di dry-run"
                  : "Jalankan dry-run dulu untuk mengaktifkan"
              }
            >
              {isCleaning ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              {cleanupToken
                ? `Hapus ${cleanupResult?.deleted_uploads.length ?? ""} Upload`.trim()
                : "Hapus Permanen"}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Hasil Migrasi Aset v1</DialogTitle>
            <DialogDescription>
              Ringkasan proses pemindahan file uploads dari zip Bulky v1
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
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

          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportResult(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify DB ↔ file report */}
      <Dialog
        open={!!verifyResult}
        onOpenChange={(open) => {
          if (!open) setVerifyResult(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Hasil Verifikasi Aset</DialogTitle>
            <DialogDescription>
              Kecocokan path file di database dengan file fisik di disk
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-2xl font-semibold leading-none">
                {verifyResult?.referenced ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Path direferensikan DB
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <p
                className={`text-2xl font-semibold leading-none ${
                  (verifyResult?.missing.length ?? 0) > 0
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {verifyResult?.missing.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                File hilang di disk
              </p>
            </div>
          </div>

          {verifyResult && verifyResult.missing.length > 0 && (
            <div className="border border-red-500/40 rounded-lg p-3">
              <p className="text-xs font-medium text-red-500">
                {verifyResult.missing.length} file direferensikan DB tapi
                tidak ada di disk
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ini biasanya menandakan migrasi/import belum lengkap — jangan
                jalankan prune sebelum file-file ini kembali ada.
              </p>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {verifyResult.missing.map((item) => (
                  <li
                    key={item.path}
                    className="text-xs font-mono text-muted-foreground truncate"
                    title={item.path}
                  >
                    {item.path}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {verifyResult && verifyResult.duplicates.length > 0 && (
            <div className="border border-yellow-500/40 rounded-lg p-3">
              <p className="text-xs font-medium text-yellow-500">
                {verifyResult.duplicates.length} path dipakai lebih dari satu
                baris DB
              </p>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {verifyResult.duplicates.map((item) => (
                  <li
                    key={item.path}
                    className="text-xs font-mono text-muted-foreground truncate"
                    title={item.path}
                  >
                    {item.path}{" "}
                    <span className="text-yellow-500">
                      ({item.count ?? 2}×)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {verifyResult &&
            verifyResult.missing.length === 0 &&
            verifyResult.duplicates.length === 0 && (
              <div className="border rounded-lg p-3 flex items-center gap-3">
                <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Semua file cocok</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Semua path yang direferensikan database ada di disk dan
                    unik. Tidak ada anomali.
                  </p>
                </div>
              </div>
            )}

          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyResult(null)}>
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
        <DialogContent className="sm:max-w-lg">
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

          <DialogBody>
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

          </DialogBody>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Status Chunk Upload v1</DialogTitle>
            <DialogDescription>
              Daftar upload chunk migrasi v1 yang masih tersimpan di volume
              tapi belum di-finalize/abort
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
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

          </DialogBody>
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
        <DialogContent className="sm:max-w-lg">
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

          <DialogBody>
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

          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCleanupResult(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPruneDialog />
      <ConfirmCleanupDialog />
      <ConfirmOptimizeDialog />
    </div>
  );
};
