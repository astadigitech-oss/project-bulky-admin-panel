"use client";

import { useEffect, useState } from "react";
import GB from "country-flag-icons/react/1x1/GB";
import { ImageIcon, Phone, Search } from "lucide-react";
import { AssetCrop, AssetTarget, assetTargets, renderContainedAsset, renderCroppedAsset } from "./asset-crop-editor";

type AssetPreviewProps = {
  files?: File[];
  existing?: string | null;
  removed?: boolean;
  crop?: AssetCrop;
  target: AssetTarget;
  outputTarget?: AssetTarget;
};

const useAssetPreview = ({ files, existing, removed, crop, target, outputTarget }: AssetPreviewProps) => {
  const file = files?.[0];
  const cropKey = file ? `${file.name}-${file.lastModified}-${crop?.zoom ?? 1}-${crop?.x ?? 0}-${crop?.y ?? 0}` : null;
  const [processed, setProcessed] = useState<{ key: string; url: string } | null>(null);

  useEffect(() => {
    if (!file || !cropKey) return;
    let cancelled = false;
    let objectURL: string | null = null;
    void renderCroppedAsset(file, target, crop ?? { zoom: 1, x: 0, y: 0 }).then(async (framed) => {
      const cropped = outputTarget ? await renderContainedAsset(framed, outputTarget) : framed;
      if (cancelled) return;
      objectURL = URL.createObjectURL(cropped);
      setProcessed({ key: cropKey, url: objectURL });
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [crop?.x, crop?.y, crop?.zoom, cropKey, file, outputTarget, target]);

  if (removed) return null;
  if (!file) return existing ?? null;
  return processed?.key === cropKey ? processed.url : null;
};

const StoreCartIcon = () => <svg viewBox="0 0 39 39" className="size-4 fill-none stroke-black stroke-[3]" aria-hidden="true"><path d="M2.92 6.3h30.43c2.76 0 4.75 2.54 3.99 5.1l-3.31 11.2a4.2 4.2 0 0 1-3.99 2.9H11.72a4.2 4.2 0 0 1-3.99-2.9L2.92 6.3 1.5 1.5m27 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const MobileHomePreview = ({ ornament }: { ornament: string | null }) => {
  const categories = ["Aksesoris", "Alat Rumah", "ATK", "Buku", "Elektronik"];

  return <div className="w-[216px]"><p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">Beranda aplikasi</p><div className="h-[458px] w-[216px] overflow-hidden rounded-[21px] border-[4px] border-[#202020] bg-white shadow-sm"><div className="relative h-[780px] w-[360px] origin-top-left scale-[0.577] overflow-hidden bg-white text-[#333333]">
    <header className="relative h-20 overflow-hidden bg-[#ffcf02]">
      {ornament && <img src={ornament} alt="Ornamen top app bar pada Beranda aplikasi" className="absolute inset-0 size-full object-cover" />}
      <div className="relative z-10 flex h-6 items-center justify-between px-5 text-[9px] font-semibold text-black"><span>16:12</span><span>● ● ●</span></div>
      <div className="relative z-10 flex items-center gap-5 px-5"><div className="flex h-[39px] min-w-0 flex-1 items-center gap-2 rounded-[5px] border border-[#9db2ce] bg-white px-4 text-[#9db2ce]"><Search className="size-[18px] shrink-0" strokeWidth={2.5} /><span className="text-xs">Cari Produk</span></div><div className="flex shrink-0 items-center gap-[25px]"><img src="/assets/images/mobile-preview-cart.png" alt="Keranjang" className="size-[25px] object-contain" /><div className="grid size-[30px] place-items-center rounded-full border-2 border-white bg-[#0e8aa8] text-base font-bold text-white">W</div></div></div>
    </header>
    <div className="h-[700px] overflow-hidden bg-white pt-2.5"><div className="mx-[15px] h-[110px] rounded-xl bg-[#ffcf02]" /><section className="mt-5"><div className="flex items-center justify-between px-[15px]"><h3 className="text-[17px] font-bold">Kategori</h3><span className="text-[14px] font-semibold text-[#01798a]">Lihat Semua</span></div><div className="mt-3 grid grid-cols-5 gap-x-[15px] px-[15px]">{categories.map((category) => <div key={category} className="min-w-0"><div className="grid aspect-square place-items-center rounded-lg bg-[#f5f7fa]"><ImageIcon className="size-[24px] text-[#d1d5db]" /></div><p className="mt-1 text-center text-[10px] leading-tight">{category}</p></div>)}</div></section><section className="mt-6"><div className="flex items-center justify-between px-[15px]"><h3 className="text-[17px] font-bold">Produk Rekomendasi</h3><span className="text-[14px] font-semibold text-[#01798a]">Lihat Semua</span></div><div className="mt-3 flex gap-3 overflow-hidden px-[15px]"><div className="w-[145px] shrink-0 overflow-hidden rounded-lg border"><div className="h-[96px] bg-[#f5f7fa]" /><div className="space-y-2 p-2"><div className="h-2 w-20 rounded bg-[#333333]/25" /><div className="h-2 w-14 rounded bg-[#ff9d00]/70" /></div></div><div className="w-[145px] shrink-0 overflow-hidden rounded-lg border"><div className="h-[96px] bg-[#f5f7fa]" /><div className="space-y-2 p-2"><div className="h-2 w-20 rounded bg-[#333333]/25" /><div className="h-2 w-14 rounded bg-[#ff9d00]/70" /></div></div></div></section></div>
    <nav className="absolute inset-x-0 bottom-0 flex h-[60px] items-center justify-around border-t bg-white text-[10px]"><span className="font-semibold text-[#333333]">Beranda</span><span className="text-[#9db2ce]">Bulky TV</span><span className="text-[#9db2ce]">Pesanan</span></nav>
  </div></div></div>;
};

export const SeasonalCampaignVisualPreview = ({
  webLogo,
  mobileLoadingLogo,
  webNavbarDecoration,
  mobileTopAppBarOrnament,
  existing,
  removed,
  crops,
  previewTarget = "web_logo",
  compact = false,
}: {
  webLogo?: File[];
  mobileLoadingLogo?: File[];
  webNavbarDecoration?: File[];
  mobileTopAppBarOrnament?: File[];
  existing?: { webLogo?: string | null; mobileLoadingLogo?: string | null; webNavbarDecoration?: string | null; mobileTopAppBarOrnament?: string | null };
  removed?: { webLogo?: boolean; mobileLoadingLogo?: boolean; webNavbarDecoration?: boolean; mobileTopAppBarOrnament?: boolean };
  crops?: { webLogo?: AssetCrop; mobileLoadingLogo?: AssetCrop; webNavbarDecoration?: AssetCrop; mobileTopAppBarOrnament?: AssetCrop };
  previewTarget?: "web_logo" | "web_navbar_decoration" | "mobile_top_app_bar_ornament";
  compact?: boolean;
}) => {
  const logo = useAssetPreview({ files: webLogo, existing: existing?.webLogo, removed: removed?.webLogo, crop: crops?.webLogo, target: assetTargets.webLogo });
  const mobileLogo = useAssetPreview({ files: mobileLoadingLogo, existing: existing?.mobileLoadingLogo, removed: removed?.mobileLoadingLogo, crop: crops?.mobileLoadingLogo, target: assetTargets.webLogo, outputTarget: assetTargets.mobileLoadingLogo });
  const navbarDecoration = useAssetPreview({ files: webNavbarDecoration, existing: existing?.webNavbarDecoration, removed: removed?.webNavbarDecoration, crop: crops?.webNavbarDecoration, target: assetTargets.webNavbarDecoration });
  const mobileOrnament = useAssetPreview({ files: mobileTopAppBarOrnament, existing: existing?.mobileTopAppBarOrnament, removed: removed?.mobileTopAppBarOrnament, crop: crops?.mobileTopAppBarOrnament, target: assetTargets.mobileTopAppBarOrnament });
  const displayLogo = logo ?? (webLogo?.[0] ? null : "/assets/images/logo-bulky.webp");
  const displayMobileLogo = mobileLogo ?? (mobileLoadingLogo?.[0] ? null : "/assets/images/logo-bulky.webp");
  const isNavbarDecorationPreview = previewTarget === "web_navbar_decoration";
  const isMobileTopAppBarPreview = previewTarget === "mobile_top_app_bar_ornament";

  if (isMobileTopAppBarPreview) {
    return <section className="min-w-0">
      <div className="grid min-h-[450px] md:grid-cols-2 md:items-center"><div className="flex h-full flex-col justify-center md:pr-8"><p className="font-medium text-base">Simulasi Beranda aplikasi</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">Ornamen ditempatkan sebagai background top app bar, di belakang area pencarian, keranjang, dan avatar.</p></div><div className="grid h-full place-items-center md:border-l md:px-8"><MobileHomePreview ornament={mobileOrnament} /></div></div>
    </section>;
  }

  return (
    <section className={compact ? "min-w-0" : "rounded-lg border bg-muted/20 p-4"}>
      {!compact && <div className="mb-4"><h2 className="font-medium text-sm">Preview penerapan aset</h2><p className="text-xs text-muted-foreground">{isNavbarDecorationPreview ? "Ornamen ditampilkan tepat di bawah navbar website." : "Tinjau posisi aset ini pada simulasi tampilan website dan aplikasi."}</p></div>}
      <div className={compact || isNavbarDecorationPreview ? "grid min-w-0 gap-3" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start"}>
        <div><p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">{isNavbarDecorationPreview ? "Ornamen di bawah navbar website" : "Navbar website"}</p><div className={`${isNavbarDecorationPreview ? "h-[402px]" : "h-[335px]"} overflow-hidden rounded-md border bg-white shadow-sm`}>
          <div className="w-[153.846%] origin-top-left scale-[0.65] overflow-hidden bg-[#ffcf02] text-xs text-black">
            <div className="flex h-10 items-center gap-2 px-8 font-medium"><Phone className="size-3 fill-black" /><p>0811-833-164</p><p>|</p><p>Contact us for deliveries outside Greater Jakarta / outside the island</p></div>
            <div className="flex h-16 w-full items-center bg-white px-8 shadow-lg"><div className="mx-auto flex w-full max-w-7xl items-center justify-between"><div className="flex items-center gap-4"><div className="relative h-7 aspect-[19/4]">{displayLogo && <img src={displayLogo} alt="Logo campaign di navbar website" className="size-full object-contain" />}</div><div className="flex items-center gap-1 text-sm font-medium"><span className="whitespace-nowrap rounded-md bg-[#ffcf02] px-3 py-1.5 text-black">Home</span><span className="whitespace-nowrap px-3 py-1.5 text-[#3d3d3d]">Products</span><span className="whitespace-nowrap px-3 py-1.5 text-[#3d3d3d]">About Us</span><span className="whitespace-nowrap px-3 py-1.5 text-[#3d3d3d]">Contact Us</span></div></div><div className="flex w-full items-center justify-end gap-3"><div className="flex h-8 w-[190px] items-center gap-2 rounded-xl border px-3 text-muted-foreground"><Search className="size-3.5" /><span className="whitespace-nowrap">Search products...</span></div><div className="grid size-8 place-items-center rounded-md border"><GB className="size-6 rounded-md" /></div><div className="grid size-8 place-items-center rounded-md border"><StoreCartIcon /></div><span className="whitespace-nowrap rounded-md bg-[#ffcf02] px-5 py-2 text-sm font-bold text-black">Login</span></div></div></div>
            <div className={`relative ${isNavbarDecorationPreview ? "h-[110px]" : "h-8"} overflow-hidden bg-white`}>{navbarDecoration ? <img src={navbarDecoration} alt="Ornamen di bawah navbar website" className="size-full object-cover object-center" /> : null}</div>
            <div className="h-[404px] bg-[#ffcf02]" />
          </div>
        </div></div>
        {!isNavbarDecorationPreview && <div className="grid justify-items-center gap-3">
          <div><p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">Loading screen aplikasi</p><div className="h-[390px] w-[180px] overflow-hidden rounded-sm border bg-white shadow-sm"><div className="grid h-[780px] w-[360px] origin-top-left scale-50 place-items-center bg-white"><div className="grid justify-items-center">{displayMobileLogo && <img src={displayMobileLogo} alt="Logo Bulky di loading screen aplikasi" className="h-auto w-[200px] object-contain" />}<span className="-mt-[15px] whitespace-nowrap text-sm font-bold text-black">Belanja Mudah dan Cepat</span></div></div></div></div>
        </div>}
      </div>
    </section>
  );
};
