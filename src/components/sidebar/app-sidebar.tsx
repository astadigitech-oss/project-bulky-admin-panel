"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  ChartNoAxesCombined,
  Headset,
  Megaphone,
  MonitorSmartphone,
  Newspaper,
  Package,
  Scale,
  Settings2,
  ShoppingBasket,
  TvMinimalPlay,
  Users,
} from "lucide-react";
import { NavMain, type NavValueProps } from "./nav-main";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { useMe } from "@/components/container/_api";
import { useGetOrderCountPaidNotProcessed } from "@/app/(main)/orders/_api";

const LogoNoSSR = dynamic(() => import("./logo-no-ssr"), {
  ssr: false,
  loading: () => <Skeleton className="h-7 w-3/1" />,
});

const data = {
  navMain: [
    {
      title: "Dasbor",
      url: "/dashboard",
      icon: ChartNoAxesCombined,
      permission: "dashboard:read",
      items: [
        {
          title: "Dasbor Transaksi",
          url: "/dashboard/transactions",
        },
        {
          title: "Ringkasan Dasbor",
          url: "/dashboard/overview",
        },
      ],
    },
    {
      title: "Pesanan",
      url: "/orders",
      icon: ShoppingBasket,
      permission: "pesanan:read",
      items: [
        {
          title: "List",
          url: "/orders/list",
        },
        {
          title: "Ulasan",
          url: "/orders/reviews",
          permission: "ulasan:read",
        },
        {
          title: "Persetujuan Disclaimer",
          url: "/orders/disclaimer-consent/list",
          permission: "system:read",
        },
      ],
    },
    {
      title: "Pelanggan",
      url: "/customers",
      icon: Users,
      permission: "buyer:read",
      items: [],
    },
    {
      title: "Produk",
      url: "/products",
      icon: Package,
      permission: "produk:read",
      items: [
        {
          title: "List",
          url: "/products/list",
        },
        {
          title: "Merek",
          url: "/products/brands",
          permission: "brand:read",
        },
        {
          title: "Kategori",
          url: "/products/categories",
          permission: "kategori:read",
        },
        {
          title: "Sumber",
          url: "/products/sources",
          permission: "kondisi:read",
        },
        // disabled for a temporary time, will be re-enabled in the future
        // {
        //   title: "Banner Jenis Produk",
        //   url: "/products/banners",
        // },
        {
          title: "Kondisi Produk",
          url: "/products/conditions/product",
          permission: "kondisi:read",
        },
        {
          title: "Kondisi Paket",
          url: "/products/conditions/package",
          permission: "kondisi:read",
        },
      ],
    },
    {
      title: "Pemasaran",
      url: "/marketing",
      icon: Megaphone,
      permission: "marketing:read",
      items: [
        {
          title: "Diskon",
          url: "/marketing/discounts",
          permission: "diskon:read",
        },
        {
          title: "Banner Promosi",
          url: "/marketing/banners",
          permission: "marketing:read",
        },
        {
          title: "Formulir Grosir",
          url: "/marketing/wholesaler",
          permission: "system:read",
        },
      ],
    },
  ],
  navInfo: [
    {
      title: "Berita",
      url: "/blogs",
      icon: Newspaper,
      permission: "marketing:read",
      items: [
        {
          title: "List",
          url: "/blogs/list",
        },
        {
          title: "Kategori",
          url: "/blogs/categories",
        },
        {
          title: "Tag",
          url: "/blogs/tags",
        },
      ],
    },
    {
      title: "Video",
      url: "/videos",
      icon: TvMinimalPlay,
      permission: "marketing:read",
      items: [
        {
          title: "List",
          url: "/videos/list",
        },
        {
          title: "Kategori",
          url: "/videos/categories",
        },
      ],
    },
  ],
  navPreferences: [
    {
      title: "Bantuan",
      url: "/helps",
      icon: Headset,
      permission: "system:read",
      items: [
        {
          title: "Cara Pembelian",
          url: "/helps/how-to-buy",
        },
        {
          title: "Cara Pembayaran",
          url: "/helps/payment-guide",
        },
        {
          title: "FAQ",
          url: "/helps/faqs",
          permission: "faq:read",
        },
      ],
    },
    {
      title: "Kebijakan",
      url: "/policies",
      icon: Scale,
      permission: "system:read",
      items: [
        {
          title: "Syarat & Ketentuan",
          url: "/policies/terms",
        },
        {
          title: "Kebijakan Privasi",
          url: "/policies/privacy",
        },
        {
          title: "Penaifan",
          url: "/policies/disclaimer",
        },
      ],
    },
    {
      title: "Operasional",
      url: "/operationals",
      icon: MonitorSmartphone,
      permission: "system:read",
      items: [
        {
          title: "Maintenance",
          url: "/operationals/maintenance",
        },
        {
          title: "Force Update",
          url: "/operationals/force-update",
        },
        {
          title: "Banner Hero",
          url: "/operationals/hero",
          permission: "marketing:read",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/settings",
      icon: Settings2,
      permission: "system:read",
      items: [
        {
          title: "Umum",
          url: "/settings/general",
        },
        {
          title: "Staff",
          url: "/settings/staff",
          permission: "admin:read",
        },
        {
          title: "Pajak",
          url: "/settings/tax",
          permission: "system:read",
        },
        {
          title: "Log Aktivitas",
          url: "/settings/activity-logs",
          permission: "activity_log:read",
        },
        {
          title: "Forwarder Mapping",
          url: "/settings/forwarder-mapping",
          permission: "forwarder_mapping:read",
        },
        {
          title: "Kendaraan Deliveree",
          url: "/settings/deliveree-vehicles",
          permission: "deliveree_vehicle:read",
        },
      ],
    },
  ],
} as const;

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { data: meData } = useMe();
  const permissions = meData?.data?.permissions ?? [];
  const canReadPesanan = permissions.includes("pesanan:read");
  const { data: countPaidNotProcessed } = useGetOrderCountPaidNotProcessed({
    enabled: canReadPesanan,
  });
  const pesananBadgeCount = countPaidNotProcessed?.data?.count ?? 0;

  const hasPermission = (perm?: string) =>
    !perm || permissions.includes(perm);

  const filterNav = (nav: readonly NavValueProps[]) =>
    nav
      .map((group) => ({
        ...group,
        badgeCount: group.title === "Pesanan" ? pesananBadgeCount : undefined,
        items: group.items.filter((item) => hasPermission(item.permission)),
      }))
      .filter((group) => hasPermission(group.permission));

  const filteredData = {
    navMain: filterNav(data.navMain),
    navInfo: filterNav(data.navInfo),
    navPreferences: filterNav(data.navPreferences),
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto dark:hover:bg-gray-700 hover:bg-gray-200"
              render={
                <Link href="/" className="flex flex-col items-start">
                  <LogoNoSSR />
                  <p className="text-sm -mt-2 font-medium dark:group-hover:text-gray-200">
                    Back Office
                  </p>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={filteredData} />
      </SidebarContent>
    </Sidebar>
  );
};
