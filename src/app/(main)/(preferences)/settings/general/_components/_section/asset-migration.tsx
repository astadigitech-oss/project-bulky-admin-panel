"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";
import { HardDriveDownload, HardDriveUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { baseApiUrl, cookiesKey } from "@/config";

const assetApiUrl = `${baseApiUrl}/api/panel/assets`;

export const AssetMigrationSection = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const token = getCookie(cookiesKey);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${assetApiUrl}/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { imported, skipped } = res.data.data;
      toast.success(`${res.data.message}: ${imported} file berhasil, ${skipped} dilewati`);
    } catch {
      toast.error("Import gagal");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      </div>
    </div>
  );
};
